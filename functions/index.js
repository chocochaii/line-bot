const functions = require("firebase-functions");
const request = require("request-promise");

const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization:
    `Bearer ${functions.config().line.apikey}`
};
const LINE_USER_ID = `${functions.config().line.userid}`;

const OWM_API = "https://api.openweathermap.org/data/2.5/weather/";
const OWM_API_KEY = `${functions.config().owm.key}`;

exports.LineBot = functions.https.onRequest((req, res) => {
  if (
    req.body.events[0].message &&
    req.body.events[0].message.text &&
    req.body.events[0].message.text.trim().toLowerCase() === "quick reply"
  ) {
    quickReply(req.body);
  } else {
    reply(req.body);
  }
});

exports.LineBotPush = functions.https.onRequest((req, res) => {
  return request({
    method: "GET",
    uri: `${OWM_API}?appid=${OWM_API_KEY}&units=metric&type=accurate&zip=10270,th`,
    json: true
  })
    .then(response => {
      const message = `City: ${response.name}\nWeather: ${response.weather[0].description}\nTempurature: ${response.main.temp}`;
      return push(res, message);
    })
    .catch(error => {
      return res.status(500).send(error);
    });
});

exports.LineBotMulticast = functions.https.onRequest((req, res) => {
  const text = req.query.text;
  if (text !== undefined && text.trim() !== "") {
    return multicast(res, text);
  } else {
    const ret = { message: "Text not found" };
    return res.status(400).send(ret);
  }
});

exports.LineBotBroadcast = functions.https.onRequest((req, res) => {
  const text = req.query.text;
  if (text !== undefined && text.trim() !== "") {
    return broadcast(res, text);
  } else {
    const ret = { message: "Text not found" };
    return res.status(400).send(ret);
  }
});

const reply = bodyResponse => {
  return request({
    method: "POST",
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: JSON.stringify(bodyResponse)
        }
      ]
    })
  });
};

const quickReply = bodyResponse => {
  return request({
    method: "POST",
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: "This is Quick Reply!",
          quickReply: {
            items: [
              {
                type: "action",
                action: {
                  type: "cameraRoll",
                  label: "Camera Roll"
                }
              },
              {
                type: "action",
                action: {
                  type: "camera",
                  label: "Camera"
                }
              },
              {
                type: "action",
                action: {
                  type: "location",
                  label: "Location"
                }
              },
              {
                type: "action",
                imageUrl:
                  "https://cdn1.iconfinder.com/data/icons/mix-color-3/502/Untitled-1-512.png",
                action: {
                  type: "message",
                  label: "Message",
                  text: "Hello World!"
                }
              },
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "Postback",
                  data: "action=buy&itemid=123",
                  displayText: "Buy"
                }
              },
              {
                type: "action",
                imageUrl:
                  "https://icla.org/wp-content/uploads/2018/02/blue-calendar-icon.png",
                action: {
                  type: "datetimepicker",
                  label: "Datetime Picker",
                  data: "storeId=12345",
                  mode: "datetime",
                  initial: "2018-08-10t00:00",
                  max: "2018-12-31t23:59",
                  min: "2018-08-01t00:00"
                }
              }
            ]
          }
        }
      ]
    })
  });
};

const push = (res, msg) => {
  return request({
    method: "POST",
    uri: `${LINE_MESSAGING_API}/push`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      to: LINE_USER_ID,
      messages: [
        {
          type: "text",
          text: msg
        }
      ]
    })
  })
    .then(() => {
      return res.status(200).send(`Push: ${msg}`);
    })
    .catch(error => {
      return res.status(500).send(error);
    });
};

const multicast = (res, msg) => {
  return request({
    method: "POST",
    uri: `${LINE_MESSAGING_API}/multicast`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      to: [LINE_USER_ID],
      messages: [
        {
          type: "text",
          text: msg
        }
      ]
    })
  })
    .then(() => {
      return res.status(200).send(`Multicast: ${msg}`);
    })
    .catch(error => {
      return res.status(500).send(error);
    });
};

const broadcast = (res, msg) => {
  return request({
    method: "POST",
    uri: `${LINE_MESSAGING_API}/broadcast`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      messages: [
        {
          type: "text",
          text: msg
        }
      ]
    })
  })
    .then(() => {
      return res.status(200).send(`Broadcast: ${msg}`);
    })
    .catch(error => {
      return res.status(500).send(error);
    });
};
