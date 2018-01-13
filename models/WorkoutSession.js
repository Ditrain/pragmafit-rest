const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var WorkoutSessionSchema = new Schema(
  {
    date: {type: Date, default: Date.now},
    workoutType: {type: String, max: 100, enum: 
        ['Tabata', 'Rounds in time', 'Drop Reps', 'Max Strength',
         'Number Goal','Five Minute Fun Time', 'Five Rounds', 'Basic'], default: 'Basic'},
    circuit: [
      {
        round: [
          {
            exercise: {type: String, required: true},
            equipment: {type: String, required: true},
            set: [
              {
              reps: {type: Number, min: 0, max: 1000},
              weight: {type: Number, min: 0, max: 1000}
              }
            ]
          }
        ],
        circuitTime: {type: Number, min: 0, max: 1000},    
        circuitComments: {type: String,  max: 250}
      }      
    ],
    sessionComments: {type: String,  max: 250}
  }
);

// Virtual for session's URL
WorkoutSessionSchema
.virtual('url')
.get(function () {
  return '/workout/workout-session/' + this._id;
});

//Export model
module.exports = mongoose.model('WorkoutSession', WorkoutSessionSchema);