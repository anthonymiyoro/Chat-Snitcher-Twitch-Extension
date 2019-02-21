## TWITCH CHAT CLASSIFIER AI CLIENT

### HOW IT WORKS

Initiated by a button, it sends a POST request to a REST API which starts logging
given channels name twitch chat. After 5 seconds, another POST request is sent, asking for a JSON object with the latest comments and sentiments which is then reapeated every x seconds.



### TO DO 

- [ ] Clean up code and comments

- [ ] Draw graphs on twitch client with d3js

- [ ] Create folder that logs can go to

- [ ] Find a way to monitor the queue

- [ ] Collect username of channel from get request

- [ ] Send POST request to server to begin logging of chat

- [ ] Send POST request to collect JSON object with latest chat info

- [ ] Find way to stream JSON Objects as HTML to frontend

- [ ] Find way to calculate the average sentiment from JSON object
