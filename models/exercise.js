const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var ExerciseSchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    muscleGroup: [{type: Schema.ObjectId, ref: 'MuscleGroup', required: true}],
    movementAngle: [{type: Schema.ObjectId, ref: 'MovementAngle'}],
    difficulty: {type: String, max: 100, enum: 
      ['Easy', 'Medium', 'Hard'], default: ''},
    comments: {type: String,  max: 250}
  }
);

// Virtual for exercise's URL
ExerciseSchema
.virtual('url')
.get(function () {
  return '/workout/exercise/' + this._id;
});

//Export model
module.exports = mongoose.model('Exercise', ExerciseSchema);