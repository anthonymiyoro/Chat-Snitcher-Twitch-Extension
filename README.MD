## TWITCH CHAT CLASSIFIER AI CLIENT

### HOW IT WORKS

Initiated by a button, it sends a POST request to a REST API which starts logging
given channels name twitch chat. After 5 seconds, another POST request is sent, asking for a JSON object with the latest comments and sentiments which is then reapeated every x seconds.



### TO DO 

- [ ] Clean up code and comments

- [ ] Install Bootstrap ETC for frontend

- [ ] Find way to stream JSON Objects as HTML to frontend

- [x] (1st) Route button click to nodejs url /begin_logging. NodeJS url then collects the userID, sends a get request to twitch which returns a JSON response. 

- [x] Function goes through JSON object and gets username


- [ ] Add Animation that changes based on average sentiment

- [ ] Next to animation there is a sentence, the average sentiment is green(Happy)! or neutral(Blue) or fiesty!!(red)

- [ ] Start Logging on load 

- [ ] Stop Logging after checking get request

- [ ] Calculate average moment sentiment and store in variable

- [ ] Write average sentiment to frontend

- [ ] Run above functin every 35 seconds



