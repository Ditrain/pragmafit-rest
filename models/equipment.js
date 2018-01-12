const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var EquipmentSchema = new Schema(
  {
    name: {type: String, required: true, max: 100},
    comments: {type: String, max: 250}
  }
);

// Virtual for equipment's URL
EquipmentSchema
.virtual('url')
.get(function () {
  return '/workout/equipment/' + this._id;
});

//Export model
module.exports = mongoose.model('Equipment', EquipmentSchema);