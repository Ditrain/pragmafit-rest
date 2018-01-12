const { body,validationResult } = require('express-validator/check'),
      { sanitizeBody } = require('express-validator/filter'),
      Equipment = require('../models/equipment')
// Display list of all Equipments
exports.equipmentList = function(req, res, next) {
    Equipment.find()
    .sort('name')
    .exec(function (err, listEquipment) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('equipment', { 
          title: 'Equipment List', equipmentList: listEquipment });
    });
};

// Display DETAIL page for a specific Equipment
exports.equipmentDetail = function(req, res, next) {
    Equipment.findById(req.params.id)
        .exec(function(err, equipment){
            if (err) { return next(err); }
            if (equipment==null) { // No results.
                var err = new Error('Equipment not found');
                err.status = 404;
                return next(err);
        }
        // Successful, so render
        res.render('equipment_detail', { 
            title: 'Equipment Detail', equipment: equipment } );
    });
};

// Display Equipment create FORM on GET
exports.equipmentCreateGet = function(req, res) {       
    res.render('equipment_form', { 
        title: 'Create Equipment' });
};

// Handle Equipment CREATE on POST
exports.equipmentCreatePost = [   
    // Validate that the name field is not empty.
    body('name', 'Name required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a equipment object with escaped and trimmed data.
        var equipment = new Equipment(
          { name: req.body.name,
            comments: req.body.comments
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('equipment_form', { 
                title: 'Create equipment', 
                equipment: equipment, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if equipment with same name already exists.
            Equipment.findOne({ 'name': req.body.name })
                .exec( function(err, foundEquipment) {
                     if (err) { return next(err); }

                     if (foundEquipment) {
                         //equipment exists, redirect to its detail page
                         res.redirect(foundEquipment.url);
                     }
                     else {

                        equipment.save(function (err) {
                           if (err) { return next(err); }
                           //equipment saved. Redirect to equipment detail page
                           res.redirect(equipment.url);
                         });
                     }
                 });
        }
    }
];

// Display Equipment delete form on GET
exports.equipmentDeleteGet = function(req, res, next) {
    Equipment.findById(req.params.id)
    .exec(function(err, equipment) {
        if (err) { return next(err); }
        if (equipment==null) { // No results.
            var err = new Error('Equipment not found');
            err.status = 404;
            return next(err);
    }
        res.render('equipment_delete', { 
            title: 'Delete Equipment', equipment: equipment });
    });
};

// Handle Equipment delete on POST
exports.equipmentDeletePost = function(req, res) {
    Equipment.findByIdAndRemove(req.body.equipmentid, 
        function deleteEquipment(err) {
        if (err) { return (err); }
        // Success - go to equipment list
        res.redirect('/workout/equipment')
    });
};

// Display Equipment update form on GET
exports.equipmentUpdateGet = function(req, res, next) {
    Equipment.findById(req.params.id)
    .exec(function(err, equipment) {
        if (err) { return next(err); }
        if (equipment==null) { // No results.
            var err = new Error('Equipment not found');
            err.status = 404;
            return next(err);
    }
    res.render('equipment_form', { 
        title: 'Update Equipment', equipment: equipment });
    });
};

// Handle Equipment update on POST
exports.equipmentUpdatePost = [   
    // Validate that the name field is not empty.
    body('name', 'Name required').isLength({ min: 1 }).trim(),    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),
    sanitizeBody('comments').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a equipment object with escaped and trimmed data.
        var equipment = new Equipment(
          { name: req.body.name,
            comments: req.body.comments,
            _id: req.params.id
          }
        );
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('equipment_form', { 
                title: 'Update equipment', equipment: equipment, 
                errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if equipment with same name already exists.
            Equipment.findByIdAndUpdate( req.params.id, equipment, {},
                function(err, theEquipment) {
                     if (err) { return next(err); }
                         //equipment exists, redirect to its detail page
                         res.redirect(theEquipment.url);          
            });
        }
    }
];