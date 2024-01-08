const jwt = require("jsonwebtoken");
require("dotenv").config();
const checkUserLogin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userData = decoded;
    if (req.userData.role === "user") {
      next();
    } else {
      return sendError("Error: User not authorized");
    }
  } catch (err) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
};

module.exports = checkUserLogin;
