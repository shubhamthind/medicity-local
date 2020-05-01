var express = require("express");
var router  = express.Router();
var Hospital = require("../models/hospital");
var middleware = require("../middleware");


//INDEX - show all campgrounds
router.get("/hospitals", function (req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');

        Hospital.find({ $or: [{name:regex},{location:regex},{"author.username":regex},{description:regex},{category:regex}]}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allHospitals) {
            Hospital.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                        
                        if(allHospitals.length<1){
                            req.flash("error","No campgrounds found");
                            return res.redirect("back");
                        }
                        res.render("hospitals/index", {
                        hospitals: allHospitals,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        });

    }else{
        Hospital.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allHospitals) {
            Hospital.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("hospitals/index", {
                        hospitals: allHospitals,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        });
    }
});
//CREATE - add new campground to DB
router.post("/hospitals", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.desc;
    var category= req.body.category;
    var location=req.body.location;
    var contact= req.body.contact;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newHospital = {name: name, image: image, description: desc, author:author,category:category,location:location,contact:contact}
    // Create a new campground and save to DB
    Hospital.create(newHospital, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/hospitals");
        }
    });
});

//NEW - show form to create new campground
router.get("/hospitals/new", middleware.isLoggedIn, function(req, res){
   res.render("hospitals/new"); 
});

// SHOW - shows more info about one campground
router.get("/hospitals/:id", function(req, res){
    //find the campground with provided ID
    Hospital.findById(req.params.id).populate("comments").exec(function(err, foundHospital){
        if(err){
            console.log(err);
        } else {
            console.log(foundHospital)
            //render show template with that campground
            res.render("hospitals/show", {hospital: foundHospital});
        }
    });
});  

// EDIT CAMPGROUND ROUTE
router.get("/hospitals/:id/edit", middleware.checkHospitalOwnership, function(req, res){
    Hospital.findById(req.params.id, function(err, foundHospital){
        res.render("hospitals/edit", {hospital: foundHospital});
    });
});


// UPDATE CAMPGROUND ROUTE
router.put("/hospitals/:id",middleware.checkHospitalOwnership, function(req, res){
    // find and update the correct campground
    Hospital.findByIdAndUpdate(req.params.id, req.body.hospital, function(err, updatedHospital){
       if(err){
           res.redirect("/hospitals");
       } else {
           //redirect somewhere(show page)
           req.flash("success", "Edited successfully");
           res.redirect("/hospitals/" + req.params.id);
       }
    });
});


// DESTROY CAMPGROUND ROUTE
router.delete("/hospitals/:id",middleware.checkHospitalOwnership, function(req, res){
   Hospital.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/hospitals");
      } else {
          req.flash("success","Campground Deleted Successfully")
          res.redirect("/hospitals");
      }
   });
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;






