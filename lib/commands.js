var request = require('request');
var _ = require('lodash');
var util = require('util');

var zendeskRootUrl = 'https://auth0.zendesk.com/api/v2/';
var slackRootUrl = 'https://slack.com/api/';

function getSlackUser(user_id) {
  return new Promise((resolve, reject) => {
    request({
      url: slackRootUrl + 'users.info?token=' + process.env.SLACK_BOT_TOKEN + '&' + user_id,
      method: 'GET'
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) { return reject(err || 'Status code: ' + response.statusCode); }
      var result = JSON.parse(body);
      return resolve(result);
    });
  });
}

function getSlackUserByName(username) {
  return new Promise((resolve, reject) => {
    request({
      url: slackRootUrl + 'users.list?token=' + process.env.SLACK_BOT_TOKEN,
      method: 'GET'
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) { return reject(err || 'Status code: ' + response.statusCode); }
      var result = JSON.parse(body);
      var member = _.find(result.members, function(obj) {
        return obj.name === username;
      });
      if (member) {
        return resolve(member);
      } else {
        return reject('Could not find slack user.');
      }
    });
  });
}

function postSupportTicket(ticket) {
  return new Promise((resolve, reject) => {
    var token = new Buffer(process.env.ZENDESK_API_EMAIL + '/token:' + process.env.ZENDESK_API_TOKEN).toString('base64');
    request({
      url: zendeskRootUrl + 'tickets.json',
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + token
      },
      json: { ticket: ticket }
    }, function(err, response, body) {
      if (err || response.statusCode !== 201) { return reject(err || 'Status code: ' + response.statusCode); }
      resolve(body);
    });
  });
}

function postSlackMessage(channelId, text, username, iconUrl) {
  return new Promise((resolve, reject) => {
    request({
      url: util.format('%schat.postMessage?token=%s&channel=%s&text=%s&username=%s&icon_url=%s', slackRootUrl, process.env.SLACK_BOT_TOKEN, channelId, text, username, iconUrl),
      method: 'POST',
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) { return reject(err || 'Status code: ' + response.statusCode); }
      return resolve(body);
    });
  });
}

export function openTicket(commandData) {

  if (commandData.token !== process.env.SLACK_COMMAND_TOKEN) {
    return Promise.reject('Invalid token');
  }

  var slackCustomerUser = commandData.text.substring(0, commandData.text.indexOf(' '));

  if (!slackCustomerUser || slackCustomerUser.indexOf('@') !== 0) {
    return Promise.reject('Cannot open ticket. User was not provided.');
  }

  var message = commandData.text.replace(slackCustomerUser, '').trim();

  if (message.length < 10) {
    return Promise.reject('Cannot open ticket. Ticket message was invalid.');
  }

  return getSlackUserByName(slackCustomerUser.substring(1))
  .then(result => {
    return Promise.resolve({
      requester: {
        name:       result.profile.real_name,
        email:      result.profile.email
      },
      subject:      'Slack chat with ' + slackCustomerUser,
      comment: {
        body:       message
      }
    });
  })
  .then(postSupportTicket)
  .then(ticket => {
    var text = '<' + slackCustomerUser + '> A support ticket has been opened for your request. Ticket: <https://auth0.zendesk.com/agent/tickets/' + ticket.ticket.id + '|' + ticket.ticket.id + '>';
    var iconUrl = 'https://www.gravatar.com/avatar/7db6b16c9871854df6e522209e0a0631';
    return postSlackMessage(commandData.channel_id, text, 'Auth0 Support', iconUrl);
  });
}
