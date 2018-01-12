const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var MuscleGroupSchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    comments: {type: String, max: 250}
  }
);

// Virtual for muscleGroup's URL
MuscleGroupSchema
.virtual('url')
.get(function () {
  return '/workout/muscle-group/' + this._id;
});

//Export model
module.exports = mongoose.model('MuscleGroup', MuscleGroupSchema);