const mongoose = require("mongoose");
const { Schema } = mongoose;

const languageSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
});

const Language = mongoose.model("Language", languageSchema);

module.exports = Language;
