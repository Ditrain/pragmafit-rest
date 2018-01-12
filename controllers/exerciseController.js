const { body,validationResult } = require('express-validator/check'),
      { sanitizeBody } = require('express-validator/filter'),
      Exercise = require('../models/exercise'),
      MovementAngle = require('../models/movement_angle'),
      MuscleGroup = require('../models/muscle_group'),
      async = require('async')

// Display list of all Exercises
exports.exerciseList = function(req, res, next) {
    Exercise.find()
    .populate('muscleGroup')
    .exec(function (err, listExercises) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('exercises', { 
          title: 'Exercise List', exerciseList: listExercises });
    });
};

// Display detail page for a specific Exercise
exports.exerciseDetail = function(req, res, next) {
    Exercise.findById(req.params.id)
    .populate('muscleGroup')
    .populate('movementAngle')
    .exec(function(err, exercise) {
        if (err) { return next(err); }
        if (exercise==null) { // No results.
            var err = new Error('Exercise not found');
            err.status = 404;
            return next(err);
    }
        // Successful, so render
        res.render('exercise_detail', { 
            title: 'Exercise Detail', exercise: exercise } );
    });
};

// Display Exercise create form on GET
exports.exerciseCreateGet = function(req, res, next) {
    async.parallel({
        muscleGroups: function(callback) {
            MuscleGroup.find(callback);
        },
        movementAngles: function(callback) {
            MovementAngle.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('exercise_form', { 
            title: 'Create Exercise', 
            muscleGroups: results.muscleGroups, 
            movementAngles: results.movementAngles });
    });
};

// Handle Exercise CREATE on POST
exports.exerciseCreatePost = [   
    // Validate that the name field is not empty.
    body('name', 'Exercise name required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('muscleGroup').trim().escape(),
    sanitizeBody('movementAngle').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a muscle group object with escaped and trimmed data.
        var exercise = new Exercise(
          { name: req.body.name,
            muscleGroup: req.body.muscleGroup,
            movementAngle: req.body.movementAngle,
            difficulty: req.body.difficulty,
            comments: req.body.comments
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('exercise_form', { 
                title: 'Create muscle group', 
                exercise: exercise, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if muscle group with same name already exists.
            Exercise.findOne({ 'name': req.body.name })
                .exec( function(err, foundExercise) {
                     if (err) { return next(err); }

                     if (foundExercise) {
                         //muscle group exists, redirect to its detail page
                         res.redirect(foundExercise.url);
                     }
                     else {
                        exercise.save(function (err) {
                           if (err) { return next(err); }
                           //muscle group saved. Redirect to muscle group detail page
                           res.redirect(exercise.url);
                         });
                     }
                 });
        }
    }
];

// Display Exercise delete form on GET
exports.exerciseDeleteGet = function(req, res, next) {
    Exercise.findById(req.params.id)
    .exec(function(err, exercise) {
        if (err) { return next(err); }
        if (exercise==null) { // No results.
            var err = new Error('Exercise not found');
            err.status = 404;
            return next(err);
    }
        res.render('exercise_delete', { 
            title: 'Delete Exercise', exercise: exercise });
    });
};

// Handle Exercise delete on POST
exports.exerciseDeletePost = function(req, res) {
    Exercise.findByIdAndRemove(req.body.exerciseid, 
        function deleteExercise(err) {
        if (err) { return (err); }
        // Success - go to exercise list
        res.redirect('/workout/exercises')
    });
};

// Display Exercise update form on GET
exports.exerciseUpdateGet = function(req, res, next) {
    async.parallel({
        exercise: function(callback) {
            Exercise.findById(req.params.id)
            .populate('muscleGroup')
            .populate('movementAngle')
            .exec(callback);
        },
        muscleGroups: function(callback) {
            MuscleGroup.find(callback);
        },
        movementAngles: function(callback) {
            MovementAngle.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.exercise==null) { // No results.
            var err = new Error('Exercise not found');
            err.status = 404;
            return next(err);
        }
        res.render('exercise_form', { 
            title: 'Update Exercise', 
            exercise: results.exercise, 
            muscleGroups: results.muscleGroups, 
            movementAngles: results.movementAngles });
    });
};

// Handle Exercise update on POST
exports.exerciseUpdatePost = [
        // Validate fields
        body('name', 'Name must not be empty.').isLength({ min: 1 }).trim(),
        body('muscleGroup', 'Muscle group must not be empty.').isLength({ min: 1 }).trim(),
    
        // Sanitize fields
        sanitizeBody('name').trim().escape(),
        sanitizeBody('muscleGroup').trim().escape(),
        sanitizeBody('movementAngle').trim().escape(),
        sanitizeBody('difficulty').trim().escape(),
        sanitizeBody('comments').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a wexercise object with escaped/trimmed data and old id.
        var exercise = new Exercise(
          { name: req.body.name,
            muscleGroup: req.body.muscleGroup,
            movementAngle: req.body.movementAngle,
            difficulty: req.body.difficulty,
            comments: req.body.comments,            
            _id:req.params.id //This is required, or a new ID will be assigned!
          }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all exercise and genres for form
            async.parallel({
                exercise: function(callback) {
                    Exercise.find(callback);
                },
                genres: function(callback) {
                    MuscleGroup.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('exercise_form', { 
                    title: 'Update Exercise', 
                    movementAngle: results.movementAngles, 
                    muscleGroup: results.muscleGroups, 
                    exercise: exercise, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Exercise.findByIdAndUpdate(req.params.id, exercise, {}, 
                function (err,theexercise) {
                if (err) { return next(err); }
                   // Successful - redirect to exercise detail page.
                   res.redirect(theexercise.url);
                });
        }
    }
];