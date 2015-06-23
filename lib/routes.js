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
    var message = 'An error has occurred. If you would like to open a support ticket please email support@auth0.com';
    if (typeof err === 'string') {
      message = err;
    }
    console.error(err);
    res.status(500).send(message);
  });
});

module.exports = router;
