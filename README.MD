## TWITCH CHAT CLASSIFIER AI CLIENT

### HOW IT WORKS

Initiated by a button, it sends a POST request to a REST API which starts logging
given channels name twitch chat. After 5 seconds, another POST request is sent, asking for a JSON object with the latest comments and sentiments which is then reapeated every x seconds.



### TO DO 

- [ ] Clean up code and comments

- [ ] Draw graphs on twitch client with d3js

- [ ] Find way to stream JSON Objects as HTML to frontend

- [ ] Find way to calculate the average sentiment from JSON object

- [ ] (1st) Route button click to nodejs url /begin_logging. NodeJS url then collects the userID, sends a get request to twitch which returns a JSON response. 

- [ ] Function goes through JSON object and gets username

- [ ] 1st function sends POST request to my server initiating logging

- [ ] Wait 10 seconds then send another POST request collecting the chat



