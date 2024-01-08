const express = require("express");
const upload = require("../middlewares/file-upload");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ResultData = require("../models/result-data");
const userauth = require("../middlewares/user-auth");
const adminauth = require("../middlewares/admin-auth");
const all_user_auth = require("../middlewares/all-access-auth");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cloudinaryConfig = require("../config/cloudinary");
require("dotenv").config();

const userRouter = express.Router();

userRouter.post("/sign-up", upload, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const file = req.file;
    if (file) {
      if (!name && !email && !password) {
        return res.status(400).json({
          message: "Fill up all the fields",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const image = await cloudinaryConfig.uploader.upload(
        file.path,
        {
          folder: "quizzer",
        },
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Internal Server Error",
            });
          }
        }
      );
      const avatar = image.secure_url;

      const user = new User({
        name,
        email,
        password: hashedPassword,
        avatar,
        role: "user",
      });
      await user.save();
      fs.unlinkSync(file.path);

      return res.status(201).json({
        message: "User Created",
      });
    } else {
      if (!name && !email && !password) {
        return res.status(400).json({
          message: "Fill up all the fields",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        avatar: process.env.DEFAULT_AVATAR_URL,
      });
      await user.save();

      return res.status(201).json({
        message: "User Created",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        message: "Wrong Password",
      });
    }
    const token = jwt.sign(
      {
        name: user.name,
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      message: "Auth Successful",
      token: token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

userRouter.post("/details", all_user_auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userData.userId });
    res.status(200).json({
      message: "User Details",
      user: user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

userRouter.get("/users", adminauth, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    res.status(200).json({
      message: "User",
      users,
    });
  } catch (err) {
    return res.status(500).json({
      Message: err.message,
    });
  }
});

userRouter.put("/picture", all_user_auth, upload, async (req, res) => {
  try {
    const file = req.file;
    const image = await cloudinaryConfig.uploader.upload(
      file.path,
      {
        folder: "quizzer",
      },
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Internal Server Error",
          });
        }
      }
    );
    const avatar = image.secure_url;
    await User.updateOne(
      { _id: req.userData.userId },
      { $set: { avatar: avatar } }
    );
    fs.unlinkSync(file.path);
    res.status(200).json({
      message: "Profile Picture Updated",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

userRouter.put("/update", all_user_auth, async (req, res) => {
  try {
    const { name, password } = req.body;
    if (password === "") {
      await User.updateOne(
        { _id: req.userData.userId },
        { $set: { name: name } }
      );
      res.status(200).json({
        message: "Profile Updated",
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne(
        { _id: req.userData.userId },
        { $set: { name: name, password: hashedPassword } }
      );
      res.status(200).json({
        message: "Profile Updated",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

userRouter.post("/results", userauth, async (req, res) => {
  try {
    const { quiz_id, language_id, score, user_answers } = req.body;
    console.log(req.userData);
    const result = new ResultData({
      user_id: req.userData.userId,
      quiz_id,
      language_id,
      score,
      user_answers,
    });
    await result.save();
    return res.status(201).json({
      message: "Result Saved",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      Message: "Internal Server Error",
    });
  }
});

userRouter.get("/results/:id", userauth, async (req, res) => {
  try {
    const userResult = await ResultData.find({
      user_id: req.userData.userId,
    })
      .populate("user_id")
      .populate("language_id")
      .populate("quiz_id")
      .populate("user_answers")
      .exec();

    return res.status(200).json({
      result_data: userResult,
    });
  } catch (err) {
    res.status(500).json({
      Message: "Internal Server Error",
    });
  }
});

userRouter.get("/result/:id", userauth, async (req, res) => {
  try {
    const userResult = await ResultData.findById(req.params.id)
      .populate("user_id")
      .populate("language_id")
      .populate("quiz_id")
      .populate("user_answers")
      .exec();

    return res.status(200).json({
      result_data: userResult,
    });
  } catch (err) {
    res.status(500).json({
      Message: "Internal Server Error",
    });
  }
});

userRouter.get("result/language/:id", all_user_auth, async (req, res) => {
  try {
    const userResult = await ResultData.find({
      user_id: req.userData.userId,
      language_id: req.params.id,
    })
      .populate("user_id")
      .populate("language_id")
      .populate("quiz_id")
      .populate("user_answers")
      .exec();

    return res.status(200).json({
      result_data: userResult,
    });
  } catch (err) {
    res.status(500).json({
      Message: "Internal Server Error",
    });
  }
});

module.exports = userRouter;
