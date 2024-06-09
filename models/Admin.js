const mongoose = require('mongoose')

const { Schema } = mongoose;

const AdminSchema = new Schema({
    username: { type: String, required: true, min: 4},
    password: { type: String, required: true },
})

const AdminModel = mongoose.model('admin', AdminSchema);

module.exports = AdminModel;