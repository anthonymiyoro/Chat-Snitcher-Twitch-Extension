## TWITCH CHAT CLASSIFIER AI CLIENT

### HOW IT WORKS

Initiated by a button, it sends a POST request to a REST API which starts logging
given channels name twitch chat. After 5 seconds, another POST request is sent, asking for a JSON object with the latest comments and sentiments which is then reapeated every x seconds.



### TO DO 

- [ ] Clean up code and comments

- [x] Install Bootstrap ETC for frontend

- [x] Find way to stream JSON Objects as HTML to frontend

- [x] (1st) Route button click to nodejs url /begin_logging. NodeJS url then collects the userID, sends a get request to twitch which returns a JSON response. 

- [x] Function goes through JSON object and gets username


- [x] Add Animation that changes based on average sentiment

- [x] Next to animation there is a sentence, the average sentiment is green(Happy)! or neutral(Blue) or fiesty!!(red)

- [x] Start Logging on load 

- [x] Stop Logging after checking get request

- [x] Calculate average moment sentiment and store in variable

- [x] Write average sentiment to frontend

- [x] Run above functin every 15 seconds

- [x] Host the damn thing

- [x] Fix issues with get request

- [x] Host on heroku

- [x] Install https

- [ ] Create logo and start screen

- [ ] Take screenshots

- [ ] Improve rating algorithm

- [ ] Create config html page




