'use strict';
module.exports = function(app) {
  var csvController = require('../controllers/csvController');

  // stockExchage Route
  app.route('/import').post(csvController.file_upload);
  app.route('/search').post(csvController.search_result);
  app.route('/searchFile').post(csvController.search_result_file);
};
