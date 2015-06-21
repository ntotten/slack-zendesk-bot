var request = require('request');

var zendeskRootUrl = 'https://auth0.zendesk.com/api/v2/';
var slackRootUrl = 'https://slack.com/api/';

function getSlackUser(user_id) {
  return new Promise((resolve, reject) => {
    request({
      url: slackRootUrl + 'users.info?token=' + process.env.SLACK_BOT_TOKEN + '&user=' + user_id,
      method: 'GET'
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) { return reject(err || 'Status code: ' + response.statusCode); }
      var result = JSON.parse(body);
      return resolve(result);
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

function postSlackMessage(data, ticket) {
  return Promise.resolve(ticket);
}

export function openTicket(data) {

  if (data.token !== process.env.SLACK_COMMAND_TOKEN) {
    return Promise.reject('Invalid token');
  }

  var slackCustomerUser = data.text.substring(0, data.text.indexOf(' '));

  if (!slackCustomerUser || slackCustomerUser.indexOf('@') !== 0) {
    return Promise.reject('Cannot open ticket. User was not provided.');
  }

  var message = data.text.replace(slackCustomerUser, '').trim();

  if (message.length < 10) {
    return Promise.reject('Cannot open ticket. Ticket message was invalid.');
  }

  return getSlackUser(data.user_id)
  .then(result => {
    return Promise.resolve({
      requester: {
        name:       result.user.profile.real_name,
        email:      result.user.profile.email
      },
      subject:      'Slack chat with ' + slackCustomerUser,
      comment: {
        body:       message
      }
    });
  })
  .then(postSupportTicket)
  .then(ticket => {
    return postSlackMessage(data, ticket);
  });
}
