# Slack - Zendesk Integration
This webtask allows users to use a Slack slash command to create a Zendesk support ticket. The integration allows users to pass an optional subject and it also searches the channel history for any messages sent by the user or to the user over the last hour to use as the body of the support ticket.

The slash command is in the format: `/ticket @username [subject]`

To create a webtask url for this ticket using the wt CLI tools:

```bash
wt create ticket.js -s zendesk_api_token={token} -s zendesk_api_email={email} slack_command_token={token} -s slack_api_token={token} -s slack_icon_url={icon_url} -s zendesk_tenant={tenant} -s support_email={support_email}
```
