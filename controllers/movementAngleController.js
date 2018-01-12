const { body,validationResult } = require('express-validator/check'),
      { sanitizeBody } = require('express-validator/filter'),
      MovementAngle = require('../models/movement_angle')

// Display list of all MovementAngles
exports.movementAngleList = function(req, res, next) {
    MovementAngle.find()
      .exec(function (err, listMovementAngles) {
        if (err) { return next(err); }
        // Successful, so render
          res.render('movement_angles', { 
              title: 'Movement Angle List', movementAngleList: listMovementAngles } );
      });
};

// Display detail page for a specific MovementAngle
exports.movementAngleDetail = function(req, res, next) {
    MovementAngle.findById(req.params.id)
        .exec(function(err, movementAngle){
        if (err) { return next(err); }
        if (movementAngle==null) { // No results.
            var err = new Error('Movement Angle not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('movement_angle_detail', { 
            title: 'Movement Angle Detail', movementAngle: movementAngle } );
    });
};

// Display MovementAngle create FORM on GET
exports.movementAngleCreateGet = function(req, res) {       
    res.render('movement_angle_form', { 
        title: 'Create Movement Angle' });
};

// Handle MovementAngle create on POST
exports.movementAngleCreatePost = [   
    // Validate that the angle field is not empty.
    body('angle', 'Angle required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the angle field.
    sanitizeBody('angle').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a muscle group object with escaped and trimmed data.
        var movementAngle = new MovementAngle(
          { angle: req.body.angle,
            comments: req.body.comments
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('movement_angle_form', { 
                title: 'Create muscle group', movementAngle: movementAngle, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if muscle group with same angle already exists.
            MovementAngle.findOne({ 'angle': req.body.angle })
                .exec( function(err, foundMovementAngle) {
                     if (err) { return next(err); }

                     if (foundMovementAngle) {
                         //muscle group exists, redirect to its detail page
                         res.redirect(foundMovementAngle.url);
                     }
                     else {
                        movementAngle.save(function (err) {
                           if (err) { return next(err); }
                           //muscle group saved. Redirect to muscle group detail page
                           res.redirect(movementAngle.url);
                         });
                     }
                 });
        }
    }
];

// Display MovementAngle delete form on GET
exports.movementAngleDeleteGet = function(req, res, next) {
    MovementAngle.findById(req.params.id)
    .exec(function(err, movementAngle) {
        if (err) { return next(err); }
        if (movementAngle==null) { // No results.
            var err = new Error('Angle not found');
            err.status = 404;
            return next(err);
    }
        res.render('movement_angle_delete', { 
            title: 'Delete Movement Angle', movementAngle: movementAngle });
    });
};

// Handle MovementAngle delete on POST
exports.movementAngleDeletePost = function(req, res) {
    MovementAngle.findByIdAndRemove(req.body.movementAngleid, 
        function deleteMovementAngle(err) {
        if (err) { return (err); }
        // Success - go to movementAngle list
        res.redirect('/workout/movement-angles')
    });
};

// Display MovementAngle update form on GET
exports.movementAngleUpdateGet = function(req, res, next) {
    MovementAngle.findById(req.params.id)
    .exec(function(err, movementAngle) {
        if (err) { return next(err); }
        if (movementAngle==null) { // No results.
            var err = new Error('Movement Angle not found');
            err.status = 404;
            return next(err);
    }
    res.render('movement_angle_form', { 
        title: 'Update MovementAngle', movementAngle: movementAngle });
    });
};

// Handle MovementAngle update on POST
exports.movementAngleUpdatePost = [   
    // Validate that the angle field is not empty.
    body('angle', 'Angle required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the angle field.
    sanitizeBody('angle').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a muscle group object with escaped and trimmed data.
        var movementAngle = new MovementAngle(
          { angle: req.body.angle,
            comments: req.body.comments,
            _id: req.params.id
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('movement_angle_form', { 
                title: 'Update muscle group', 
                movementAngle: movementAngle, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if muscle group with same angle already exists.
            MovementAngle.findByIdAndUpdate( req.params.id, movementAngle, {},
                function(err, themovementAngle) {
                     if (err) { return next(err); }
                         //equipment exists, redirect to its detail page
                         res.redirect(themovementAngle.url);   
                 });
        }
    }
];