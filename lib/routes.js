var express = require('express');
var request = require('request');
var commands = require('./commands');
var router = express.Router();

/* GET home page. */
router.post('/ticket', function(req, res, next) {
  commands.openTicket(req.body)
  .then(result => {
    var text = 'Ticket created: <https://auth0.zendesk.com/agent/tickets/' + result.ticket.id + '|' + result.ticket.id + '>';
    return res.status(200).send(text);
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

module.exports = router;
