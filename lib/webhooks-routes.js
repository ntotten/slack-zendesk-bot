var express = require('express');
var request = require('request');
var commands = require('./commands');
var router = express.Router();

/* GET home page. */
router.post('/ticket', function(req, res, next) {
  commands.openTicket(req.body)
  .then(result => {
    res.statusStatus(200);
  }).catch(function(err) {
    res.status(500).send('An error has occurred.');
  });
});

module.exports = router;
