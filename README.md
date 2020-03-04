# line-bot
Sample usages of LINE messaging API

## Deployment
After initialize Firebase cloud functions, set the following variables to connect to LINE messaging API and OpenWeatherMap API (used in push function)

```
firebase functions:config:set line.apikey="LINE_MESSAGING_API_CHANNEL_ACCESS_TOKEN" line.userid="TARGET_LINE_USER" owm.apikey="OPEN_WEATHER_MAP_API_KEY"
```
