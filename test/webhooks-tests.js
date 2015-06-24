require('dotenv').load();
var assert = require('assert');
var babel = require("babel-core");
var fs = require('fs');
var path = require('path');

describe('Ticket command', function(){
  it('should work', function(done){
    this.timeout(10000);
    var data = {
      token: process.env.slack_command_token,
      user_id: process.env.TEST_SLACK_USER_ID,
      channel_id: process.env.TEST_SLACK_CHANNEL_ID,
      text: process.env.TEST_SLACK_MESSAGE,
      slack_command_token: process.env.slack_command_token,
      slack_api_token: process.env.slack_api_token,
      zendesk_api_email: process.env.zendesk_api_email,
      zendesk_api_token: process.env.zendesk_api_token,
      zendesk_tenant: process.env.zendesk_tenant,
      slack_icon_url: process.env.slack_icon_url,
      support_email: process.env.support_email
    }
    var code = fs.readFileSync(path.join(__dirname, '../ticket.js'), 'utf8').trim();
    // Create a factory function that calls custom code
    var script = '(function () { ' + code + '})';
    script = babel.transform(script, { ast: false }).code;
    var factory = eval(script);
    // Call the factory function to create custom function instance
    var func = factory();
    var res = {};
    res.writeHead = function(code, contentType) {
      assert(code, 200);
    };
    res.end = function(text) {
      console.log(text);
      done();
    };

    func({ data: data}, {}, res);
  });
})
