const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({

  trackName:String,
  artistName:String,
  artworkUrl100:String,
  previewUrl:String

});

const userSchema = new mongoose.Schema({

  name:String,
  email:String,
  password:String,

  favorites:[songSchema],

  recent:[songSchema]

});

module.exports =
  mongoose.model("User",userSchema);