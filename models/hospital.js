var mongoose = require("mongoose");

var hospitalSchema = new mongoose.Schema({
   name: String,
   image: String,
   location: String,
   category: String,
   description: String,
   contact: String,
   createdAt : { type: Date , default : Date.now},
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Hospital", hospitalSchema);