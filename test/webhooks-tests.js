require('dotenv').load();
var assert = require('assert');
var commands = require('../lib/commands');

describe('Ticket command', function(){
  it('should work', function(done){
    this.timeout(10000);
    var data = {
      token: process.env.SLACK_COMMAND_TOKEN,
      user_id: process.env.TEST_SLACK_USER_ID,
      channel_id: process.env.TEST_SLACK_CHANNEL_ID,
      text: '@ntotten This is a test test test test'
    }
    commands.openTicket(data)
    .then(result => {
      console.log(result);
      done();
    }).catch(done);
  });
})
