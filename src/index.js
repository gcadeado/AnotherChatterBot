const DotEnv = require('dotenv').config();
const FacebookMessengerBot = require('calamars').FacebookMessengerBot;
import { WitDriver, createRouter } from 'calamars';
const Weather = require('weather-js');

const myPageToken = process.env.FB_PAGE_TOKEN;
const myVerifyToken = process.env.FB_VERIFY_TOKEN;
const myCallbackPath = '/webhook';
const myPort = process.env.PORT;
const myAppSecret = process.env.FB_APP_SECRET;

const myWitAppID = process.env.WIT_APP_ID;
const myWitServerToken =process.env.WIT_SERVER_TOKEN;

const witOptions = {
    id: myWitAppID,
    serverToken: myWitServerToken
};

const callbacks = {
    marco() { return 'Polo!'; },
    greetings() {
        var sentences = ['Greetings :)', 'Hello!', 'Hi :D'];
        var randomNumber = Math.floor((Math.random() * sentences.length));
        return sentences[randomNumber];
    },
    goodbye() {return 'Have a nice week :D'},
    gratitude() {return 'You are welcome :)'},
    getWeather(location) {
        if (undefined != location || null != location) {
          //Here we call the weather API
          //Note: I haven't found yet an API that returns a Promise
          //Lets make a callback hell :(
          function weatherCall(location, callback) {
            Weather.find({search: location[0].value, degreeType: 'C'}, function(err, result) {
              if(err) console.log(err);
              callback(result);
            });
          }
          var test = weatherCall(location, function(response){
              console.log(response); //Ok i can get the weather...but...how do i return it?
          });

          //Since i can't get the weather result from here, return a standard message
          return "You asked for the forecast in " + location[0].value + ". It is cloudy. (That's a guess, i really should call a weather API here hehe)"; //Here we call API
        }
        else
            return "Where? (I still have problems understanding flows, so please retype the entire sentence)"
    }
};

const routes = [
    [
        payload => payload.entities.intent[0].value === 'greetings',
        () => callbacks.greetings()
    ],
    [
        payload => payload.entities.intent[0].value === 'marcopolo',
        () => callbacks.marco()
    ],
    [
        payload => payload.entities.intent[0].value === 'goodbye',
        () => callbacks.goodbye()
    ],
    [
        payload => payload.entities.intent[0].value === 'gratitude',
        () => callbacks.gratitude()
    ],
    [
        payload => payload.entities.intent[0].value === 'weather',
        (payload) => callbacks.getWeather(payload.entities.location)
    ]
];

const router = createRouter(routes);

const myMessageListener = function(updateEvent){
    // output received message
    console.log('received update:', JSON.stringify(updateEvent.update, ' ', 2));

    //Query wit
    const queryPromise = wit.query(updateEvent.update.message.text)
            .then(result => {
                const { _text, outcomes } = result;
                //console.log(outcomes[0].entities);  //entities
                //Reply
                const intentName = outcomes[0].entities.intent[0].value;
                const confidence = outcomes[0].entities.intent[0].confidence;
                updateEvent.bot.sendMessage({
                    userId: updateEvent.update.sender.id,
                    text: router({
                              query: outcomes[0]._text,
                              entities: outcomes[0].entities
                    })
                });
            });
};

const wit = new WitDriver(witOptions);

const mybot = new FacebookMessengerBot({
    port: myPort,
    callbackPath: myCallbackPath,
    verifyToken: myVerifyToken,
    pageTokens: [myPageToken],
    appSecret: myAppSecret,
    listeners: {
        onMessage: myMessageListener
    }
});

mybot.start().then(function(){
    console.log(`Server is running on port ${myPort}`);
})
