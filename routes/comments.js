var express = require("express");
var router  = express.Router({mergeParams: true});
var Hospital = require("../models/hospital");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const { check } = require('express-validator/check');
var isEmpty= require("is-empty");
var stringLength= require("string-length");

//Comments New
router.get("/hospitals/:id/comments/new",middleware.isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Hospital.findById(req.params.id, function(err, hospital){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {hospital: hospital});
        }
    })
});

//Comments Create
router.post("/hospitals/:id/comments",middleware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Hospital.findById(req.params.id, function(err, hospital){
       if(err){
           console.log(err);
           res.redirect("/hospitals");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err || isEmpty(comment.text) || stringLength(comment.text)<2){
               req.flash("error", "Sorry! Comment is too short, can't be posted");
               res.redirect("/hospitals/" + req.params.id);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               hospital.comments.push(comment);
               hospital.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/hospitals/' + hospital._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/hospitals/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {hospital_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/hospitals/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "Comment edited successfully");
          res.redirect("/hospitals/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/hospitals/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/hospitals/" + req.params.id);
       }
    });
});

module.exports = router;