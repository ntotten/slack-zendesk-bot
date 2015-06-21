var express = require('express');
var request = require('request');
var commands = require('./commands');
var router = express.Router();

/* GET home page. */
router.post('/ticket', function(req, res, next) {
  commands.openTicket(req.body)
  .then(result => {
    res.status(200).send('Ticket <https://auth0.zendesk.com/agent/tickets/' + result.ticket.id + '|' + result.ticket.id + '> created.');
  }).catch(function(err) {
    console.log(err);
    res.sendStatus(500);
  });
});

module.exports = router;
