const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
  },

  mobile: {
    type: String,
  },

  location: {
    type: String,
  },

  quantity: {
    type: Number,
  },

  expiryDate: {
    type: String,
  },

  photos: [
    {
      type: String,
    },
  ],

});

module.exports =
  mongoose.model("User", userSchema);