const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Exercise = require('../models/exercise');
const Equipment = require('../models/equipment');
const WorkoutSession = require('../models/workout_session');
const async = require('async')

// Display list of all WorkoutSessions
exports.workoutSessionList = function(req, res, next) {
    WorkoutSession.find()
    .exec(function (err, listWorkoutSessions) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('workout_sessions', { 
          title: 'Workout Session List', 
          workoutSessionList: listWorkoutSessions });
    });
};

// Display detail page for a specific WorkoutSession
exports.workoutSessionDetail = function(req, res, next) {
    async.parallel({
        workoutSession: function(callback) {
            WorkoutSession.findById(req.params.id)
                .exec(callback);
        },
        exercise: function(callback) {
            Exercise.find()
            .exec(callback);
        },
        equipment: function(callback) {
            Equipment.find({ 'workoutSession': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.workoutSession==null) { // No results.
            var err = new Error('WorkoutSession not found');
            err.status = 404;
            return next(err);
    }
        // Successful, so render
        res.render('workout_session_detail', { 
            title: 'Workout Session Detail', 
            workoutSession: results.workoutSession, 
            exercise: results.exercise, equipment: results.equipment } );
    });
};

// Display WorkoutSession create form on GET
exports.workoutSessionCreateGet = function(req, res, next) {
    async.parallel({
        exercises: function(callback) {
            Exercise.find(callback);
        },
        equip: function(callback) {
            Equipment.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('workout_session_form', { 
            title: 'Create Workout Session', 
            exercises: results.exercises, 
            equip: results.equip });
    });
};

// Handle WorkoutSession CREATE on POST
exports.workoutSessionCreatePost = [   
    // Validate that the name field is not empty.
    body('workoutType', 'workoutType must not be empty.').isLength({ min: 1 }).trim(),
    // Sanitize (trim and escape) the name field.
    // sanitizeBody('circuit').trim().escape(),
    sanitizeBody('workoutType').trim().escape(),
    sanitizeBody('sessionComments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a muscle group object with escaped and trimmed data.
        var workoutSession = new WorkoutSession(
          { date: req.body.date,
            workoutType: req.body.workoutType,
            circuit: [
                {
                    round: [{
                        exercise: req.body.exercise,
                        equipment: req.body.equipment,
                        set: [{
                            reps: req.body.reps,
                            weight: req.body.weight
                        }]
                    }],
                    circuitTime: req.body.circuitTime,    
                    circuitComments: req.body.circuitComments
                },
                {
                    round: [{
                        exercise: req.body.exercise2,
                        equipment: req.body.equipment2,
                        set: [{
                            reps: req.body.reps2,
                            weight: req.body.weight2
                        }]
                    }],
                    circuitTime: req.body.circuitTime2,    
                    circuitComments: req.body.circuitComments2
                }
            ],            
            sessionComments: req.body.sessionComments
          });
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('workout_session_form', { 
                title: 'Create Workout Session', 
                workoutSession: workoutSession, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if muscle group with same name already exists.
            WorkoutSession.findOne({ 'date': req.body.date })
                .exec( function(err, foundWorkoutSession) {
                     if (err) { return next(err); }

                     if (foundWorkoutSession) {
                         //muscle group exists, redirect to its detail page
                         res.redirect(foundWorkoutSession.url);
                     }
                     else {
                        workoutSession.save(function (err) {
                           if (err) { return next(err); }
                           //muscle group saved. Redirect to muscle group detail page
                           res.redirect(workoutSession.url);
                         });
                     }
                 });
        }
    }
];

// Display WorkoutSession delete form on GET
exports.workoutSessionDeleteGet = function(req, res, next) {
    WorkoutSession.findById(req.params.id)
    .exec(function(err, workoutSession) {
        if (err) { return next(err); }
        if (workoutSession==null) { // No results.
            var err = new Error('WorkoutSession not found');
            err.status = 404;
            return next(err);
    }
        res.render('workout_session_delete', { 
            title: 'Delete WorkoutS ession', 
            workoutSession: workoutSession });
    });
};

// Handle WorkoutSession delete on POST
exports.workoutSessionDeletePost = function(req, res) {
    WorkoutSession.findByIdAndRemove(req.body.workoutSessionid, 
        function deleteWorkoutSession(err) {
        if (err) { return (err); }
        // Success - go to workoutSession list
        res.redirect('/workout/workout-sessions')
    });
};

// Display WorkoutSession update form on GET
exports.workoutSessionUpdateGet = function(req, res, next) {
    async.parallel({
        workoutSession: function(callback) {
            WorkoutSession.findById(req.params.id)
            sanitizeBody('circuit').trim().escape(),
            sanitizeBody('round').trim().escape(),
            sanitizeBody('exercise').trim().escape(),
            sanitizeBody('equipment').trim().escape(),
            sanitizeBody('comments').trim().escape()
            .exec(callback);
        },
        exercise: function(callback) {
            Exercise.find(callback);
        },
        equipment: function(callback) {
            Equipment.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.workoutSession==null) { // No results.
            var err = new Error('WorkoutSession not found');
            err.status = 404;
            return next(err);
        }
        res.render('workoutSession_form', { 
            title: 'Update Workout Session', 
            workoutSession: results.workoutSession, 
            workoutSessions: results.workoutSessions, 
            movementAngles: results.movementAngles });
    });
};

// Handle WorkoutSession update on POST
exports.workoutSessionUpdatePost = [
        // Validate fields
        body('workoutType', 'workoutType must not be empty.').isLength({ min: 1 }).trim(),
        body('circuit', 'circuit must not be empty.').isLength({ min: 1 }).trim(),
    
        // Sanitize fields
        sanitizeBody('circuit').trim().escape(),
        sanitizeBody('round').trim().escape(),
        sanitizeBody('exercise').trim().escape(),
        sanitizeBody('equipment').trim().escape(),
        sanitizeBody('comments').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request 
        const errors = validationResult(req);

        // Create a wworkoutSession object with escaped/trimmed data and old id.
        var workoutSession = new WorkoutSession(
            { date: req.body.date,
            workoutType: req.body.workoutType,
            circuit: req.body.movementAngle,
            comments: req.body.comments,         
            _id:req.params.id //This is required, or a new ID will be assigned!
          }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all workoutSession and genres for form
            async.parallel({
                workoutSession: function(callback) {
                    WorkoutSession.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('workout_session_form', { 
                    title: 'Update Workout Session', 
                    movementAngle: results.movementAngles, 
                    workoutSession: results.workoutSessions, 
                    workoutSession: workoutSession, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            WorkoutSession.findByIdAndUpdate(req.params.id, 
                workoutSession, {}, function (err,theworkoutSession) {
                if (err) { return next(err); }
                   // Successful - redirect to workoutSession detail page.
                   res.redirect(theworkoutSession.url);
                });
        }
    }
];