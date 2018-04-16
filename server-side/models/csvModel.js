var mongoose = require('mongoose');

var csvSchema = mongoose.Schema({
    id: String,
    name: String,
    age: String,
    address: String,
    team: String
});

var csvModel = mongoose.model('csvModel', csvSchema);

module.exports = csvModel;
