# AnotherChatterBot Test Bot

This is a simple test for my learning about Facebook bots

## Overview

This is a very simple bot created using [Calamars proto-framework](https://www.npmjs.com/package/calamars)

The bot responds to greetings, farewell, gratitude and can (barely) tell the weather. Also, he plays marcopolo.

The bot uses Wit.ai for natural language understanding for a very few intentions.

It uses [weather-js](https://www.npmjs.com/package/weather-js) to get the forecast using msn weather service and [dotenv](https://www.npmjs.com/package/dotenv) for loading environment variables.

## Showcase

The bot is implemented at facebook page [Just Another ChatterBot](https://www.facebook.com/justanotherchatterbot/), but it's offline most of the time since i'm using ngrok to secure tunnels for my localhost.

## Issues

The weather system is currently not fully developed, instead, the bot only answer a default message.

## License

[MIT][license]
