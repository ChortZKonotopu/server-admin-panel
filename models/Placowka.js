const mongoose = require('mongoose')

const { Schema } = mongoose;

const PlacowkaSchema = new Schema({
    name: { type: String, required: true, min: 4},
    adress: { type: String, required: true },
})

const PlacowkaModel = mongoose.model('placowka', PlacowkaSchema);

module.exports = PlacowkaModel;