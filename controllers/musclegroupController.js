const { body,validationResult } = require('express-validator/check'),
      { sanitizeBody } = require('express-validator/filter'),
      MuscleGroup = require('../models/muscle_group')

// Display LIST of all MuscleGroups
exports.muscleGroupList = function(req, res, next) {
    MuscleGroup.find()
      .exec(function (err, listMuscleGroups) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('muscle_groups', { 
            title: 'Muscle Group List', muscleGroupList: listMuscleGroups });
      });
};

// Display DETAIL page for a specific MuscleGroup
exports.muscleGroupDetail = function(req, res, next) {
    MuscleGroup.findById(req.params.id)
        .exec(function(err, muscleGroup) {
        if (err) { return next(err); }
        if (muscleGroup==null) { // No results.
            var err = new Error('MuscleGroup not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('muscle_group_detail', { 
            title: 'MuscleGroup Detail', muscleGroup: muscleGroup } );
    });
};

// Display MuscleGroup CREATE form on GET
exports.muscleGroupCreateGet = function(req, res) {       
    res.render('muscle_group_form', { title: 'Create Muscle Group' });
};

// Handle MuscleGroup create on POST
exports.muscleGroupCreatePost = [   
    // Validate that the name field is not empty.
    body('name', 'Group name required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a muscle group object with escaped and trimmed data.
        var muscleGroup = new MuscleGroup(
          { name: req.body.name,
            comments: req.body.comments
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('muscle_group_form', { 
                title: 'Create muscle group', 
                muscleGroup: muscleGroup, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if muscle group with same name already exists.
            MuscleGroup.findOne({ 'name': req.body.name })
                .exec( function(err, foundMuscleGroup) {
                     if (err) { return next(err); }

                     if (foundMuscleGroup) {
                         //muscle group exists, redirect to its detail page
                         res.redirect(foundMuscleGroup.url);
                     }
                     else {
                        muscleGroup.save(function (err) {
                           if (err) { return next(err); }
                           //muscle group saved. Redirect to muscle group detail page
                           res.redirect(muscleGroup.url);
                         });
                     }
                 });
        }
    }
];

// Display MuscleGroup delete form on GET
exports.muscleGroupDeleteGet = function(req, res, next) {
    MuscleGroup.findById(req.params.id)
    .exec(function(err, muscleGroup) {
        if (err) { return next(err); }
        if (muscleGroup==null) { // No results.
            var err = new Error('AngGrouple not found');
            err.status = 404;
            return next(err);
    }
        res.render('muscle_group_delete', { 
            title: 'Delete Muscle Group', muscleGroup: muscleGroup });
    });
};

// Handle MuscleGroup delete on POST
exports.muscleGroupDeletePost = function(req, res) {
    MuscleGroup.findByIdAndRemove(req.body.muscleGroupid, 
        function deleteMuscleGroup(err) {
        if (err) { return (err); }
        // Success - go to muscleGroup list
        res.redirect('/workout/muscle-groups')
    });
};

// Display MuscleGroup update form on GET
exports.muscleGroupUpdateGet = function(req, res, next) {
    MuscleGroup.findById(req.params.id)
    .exec(function(err, muscleGroup) {
        if (err) { return next(err); }
        if (muscleGroup==null) { // No results.
            var err = new Error('Muscle Group not found');
            err.status = 404;
            return next(err);
    }
    res.render('muscle_group_form', { 
        title: 'Update Muscle Group', muscleGroup: muscleGroup });
    });
};

// Handle MuscleGroup update on POST
exports.muscleGroupUpdatePost = [   
    // Validate that the name field is not empty.
    body('name', 'Group name required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a muscle group object with escaped and trimmed data.
        var muscleGroup = new MuscleGroup(
          { name: req.body.name,
            comments: req.body.comments,
            _id: req.params.id
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('muscle_group_form', { 
                title: 'Update muscle group', 
                muscleGroup: muscleGroup, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if muscle group with same name already exists.
            MuscleGroup.findByIdAndUpdate( req.params.id, muscleGroup, {},
                function(err, themuscleGroup) {
                     if (err) { return next(err); }
                         //muscleGroup exists, redirect to its detail page
                         res.redirect(themuscleGroup.url);  
                 });
        }
    }
];