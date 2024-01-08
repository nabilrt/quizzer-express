const express = require("express");
const upload = require("../middlewares/file-upload");
const Language = require("../models/language");
const adminauth = require("../middlewares/admin-auth");
const all_user_auth = require("../middlewares/all-access-auth");
const fs = require("fs");
const cloudinaryConfig = require("../config/cloudinary");
require("dotenv").config();

const languageRouter = express.Router();

languageRouter.post("/add-language", upload, async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.file;
    if (file) {
      if (!name && !description) {
        return res.status(400).json({
          message: "Fill up all the fields",
        });
      }

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

      const language = new Language({
        name,
        description,
        avatar,
      });
      await language.save();
      fs.unlinkSync(file.path);

      return res.status(201).json({
        message: "Language Created",
      });
    } else {
      if (!name && !description) {
        return res.status(400).json({
          message: "Fill up all the fields",
        });
      }

      const language = new Language({
        name,
        description,
        avatar: process.env.DEFAULT_LANGUAGE_AVATAR_URL,
      });
      await language.save();

      return res.status(201).json({
        message: "Language Created",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

languageRouter.get("/get-languages", all_user_auth, async (req, res) => {
  try {
    const languages = await Language.find();
    return res.status(200).json({
      languages,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

languageRouter.get("/get-language/:id", adminauth, async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);
    return res.status(200).json({
      language,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

languageRouter.put("/update-language/:id", upload, async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.file;
    if (file) {
      if (!name && !description) {
        return res.status(400).json({
          message: "Fill up all the fields",
        });
      }

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

      await Language.findByIdAndUpdate(req.params.id, {
        name,
        description,
        avatar,
      });
      fs.unlinkSync(file.path);

      return res.status(200).json({
        message: "Language Updated",
      });
    } else {
      if (!name && !description) {
        return res.status(400).json({
          message: "Fill up all the fields",
        });
      }

      await Language.findByIdAndUpdate(req.params.id, {
        name,
        description,
      });

      return res.status(200).json({
        message: "Language Updated",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

languageRouter.delete("/delete-language/:id", adminauth, async (req, res) => {
  try {
    await Language.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Language Deleted",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = languageRouter;
