const jwt = require("jsonwebtoken");

const checkAllUserLogin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userData = decoded;
    if (req.userData.role === "admin" || req.userData.role === "user") {
      next();
    } else {
      throw new Error("Invalid authorization");
    }
  } catch (err) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
};

module.exports = checkAllUserLogin;
