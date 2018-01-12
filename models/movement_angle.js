const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var MovementAngleSchema = new Schema(
  {
    angle: {type: String, required: true, max: 100},
    comments: {type: String, max: 250}
  }
);

// Virtual for movement angle
MovementAngleSchema
.virtual('angleName')
.get(function () {
  return this.angle;
});

// Virtual for angles's URL
MovementAngleSchema
.virtual('url')
.get(function () {
  return '/workout/movement-angle/' + this._id;
});

//Export model
module.exports = mongoose.model('MovementAngle', MovementAngleSchema);