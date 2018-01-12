const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var WorkoutTypeSchema = new Schema(
  {
    type: {type: String, required: true, max: 100},
    energySystem: {type: String, max: 100, enum: 
        ['Strength', 'Cardio', 'Mobility', 'Flexibility'], default: ''},
    bestFor: {type: String, max: 300},
    comments: {type: String, max: 250}
  }
);

// Virtual for equipment's URL
WorkoutTypeSchema
.virtual('url')
.get(function () {
  return '/workout/workou-type/' + this._id;
});

//Export model
module.exports = mongoose.model('WorkoutType', WorkoutTypeSchema);