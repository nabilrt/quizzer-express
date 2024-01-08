const multer = require("multer");
const upload = multer({ dest: "uploads/" }).single("file");

module.exports = upload;
