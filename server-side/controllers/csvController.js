'use strict';
var csv = require("fast-csv");
var Json2csvParser = require('json2csv').Parser;
var fs = require("fs");
var mongoose = require('mongoose');
var csvModel = require('../models/csvModel');

var csvStream = csv.createWriteStream({headers: true}),
    writableStream = fs.createWriteStream("public/data/uploaded.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});


// File Uploading function
exports.file_upload = function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    var csvFile = req.files.file;
    var csvEntities = [];
    csvStream.pipe(writableStream);
    console.log('Reading...');

    csv
     .fromString(csvFile.data.toString(), {
         headers : ["id", "name", "age", "address", "team"],
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
         csvStream.write(data);
         csvEntities.push(data);
     })
     .on("end", function(){
       csvStream.end();
       global.io.emit('Done Reading');
       // Clear Collection from previous upload
       csvModel.insertMany(csvEntities, function(err, documents) {
            if (err) throw err;
            res.send('File has been successfully uploaded.');
       });
   });
};


// Get search results function from DB
exports.search_result = function(req, res) {
  var searchName = req.param('query');
  csvModel.find({name: { "$regex": searchName, "$options": "i" }}, function (err, result) {
    if (err)
      res.send(err);
    res.status(200).json(result.slice(0,20));
  });
};


// Get search results function from pure csv file
exports.search_result_file = function(req, res) {
  var searchName = req.param('query');
  var stream = fs.createReadStream("public/data/uploaded.csv");
  var csvEntities = [];

  csv
   .fromStream(stream, {headers : true})
   .validate(function(data){
       return data.name.includes(searchName); //all persons must be under the age of 50
   })
   .on("data", function(data){
      csvEntities.push(data);
   })
   .on("end", function(){
      res.status(200).json(csvEntities.slice(0,20));
   });
};
