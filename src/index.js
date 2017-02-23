const DotEnv = require('dotenv').config();
const FacebookMessengerBot = require('calamars').FacebookMessengerBot;
import { WitDriver, createRouter } from 'calamars';
const Weather = require('weather-js');
require('babel-polyfill');

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

//Function Weather returns a Promise from weather API
function weatherCall(location) {
  return new Promise ((res) => {
    Weather.find({search: location[0].value, degreeType: 'C'}, function(err, result) {
      //console.log("triggered")
      if(err) console.log(err);
      else res(result);
    })
  });
}

const callbacks = {
    marco() { return 'Polo!'; },
    greetings() {
        var sentences = ['Greetings :)', 'Hello!', 'Hi :D'];
        var randomNumber = Math.floor((Math.random() * sentences.length));
        return sentences[randomNumber]; //Return a random greetings message
    },
    goodbye() {return 'Have a nice week :D'},
    gratitude() {return 'You are welcome :)'},
    async getWeather(location) {
        if (location) {
          var test = await weatherCall(location); //Call weather API

          return "You asked for the forecast in " + location[0].value + ". It is " + test[0].current.skytext + ". Temperature is " + test[0].current.temperature +" degrees, but feelslike it's "+ test[0].current.feelslike +". Humidity is "+test[0].current.humidity+"% and wind is "+test[0].current.winddisplay+".";
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
        (payload) => {return callbacks.getWeather(payload.entities.location)}
    ]
];

const router = createRouter(routes);

const myMessageListener = function(updateEvent){
    // output received message
    console.log('received update:', JSON.stringify(updateEvent.update, ' ', 2));

    //Query wit
    const queryPromise = wit.query(updateEvent.update.message.text)
            .then(async result => {
                const { _text, outcomes } = result;

                //If we have an intention...
                if (outcomes[0].entities.intent) {
                  const answer = await router({
                            query: outcomes[0]._text,
                            entities: outcomes[0].entities
                  });

                  updateEvent.bot.sendMessage({
                      userId: updateEvent.update.sender.id,
                      text: answer
                  });
                }
                //Wit couldnt find an intention, so answer default message (cannot understand)
                else {
                  updateEvent.bot.sendMessage({
                      userId: updateEvent.update.sender.id,
                      text: "I'm sorry, i didn't understand what you said :( (currently i can tell the weather, answer to greetings, farewell, gratitude and also, i can play marcopolo :D)"
                  });
                }
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
