// server.js
// where your node app starts

// init project
var express = require('express');
//var Bot = require('slackbots');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
//var Botkit = require('botkit');

var app = express();

const web = new WebClient("xoxp-369235392373-395100178065-401987767040-4851bc233b74888864f901fcf3e472f3");

const botoauth = "xoxb-369235392373-403996533910-z0VWznWeQoZMuw9CsTcQZPP3";
const regoauth = "xoxp-369235392373-399691204242-402432929924-44b49f2f735d5ed5ecfbac816c0fd482";

const clientSecret = "c92d675a7f4f688906a79666f0d00c25";
const clientId = "369235392373.401960661712";
const verifToken = "9bAlS03W7clTdtmSzfkch4I4";

const BOT_USERNAME = 'daifuku';
// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.end("<h1><a href='https://almond-degree.glitch.me/slack_events'>/slack_events</a></h1>");
});

const introText = "Hi there :wave:\nI'm Daifuku. Lets save the environment by carpooling :car:!\nTo match you up with people, I need to know some information:";
//will be userid: {location, start time, driver?, etc.
const channels = {};

////////////////////////////////////////////////////////////////////////////////////////////
// SLACK EVENTS
////////////////////////////////////////////////////////////////////////////////////////////
app.post('/slack_events', (req, res) => {
  // console.log("got a /slack_events, heres the req", req.body);
  const channelId = req.body.event.channel;
  //console.log("THIS IS THE USERNAME", req.body.event.username);
  console.log(req.body.event.username);
  if (req.body.event.username === BOT_USERNAME) {
    res.end();
    return; // ur not allowed to talk to urself
  }
  switch (req.body.type) {
    case 'url_verification': {
      console.log("Url_Verification");
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }
    case 'event_callback': {
      switch (req.body.event.type) {
        case 'message': {
          //console.log('in message.im', req.body);
        web.chat.postMessage({ channel: channelId, token: botoauth,text: introText }).then((res) => {

          web.chat.postMessage(driverOrRider(channelId)) // CBULX5DC2
            .then(
              (res) => {
                console.log('this is the res', res);
              },
              (err) => {
                console.log('this is the error', err);
              }
            );
          // res.send('');
          // res.end();
        });
        }
        default: { res.end(); break; }
      }
    }
    default: { res.end(); break; }
  }
});
/***********************************************************************************/

/////////////////////////////////////////////////////////////////////////////////////
// SLACK INTERACTIVE ACTIONS
/////////////////////////////////////////////////////////////////////////////////////
app.post('/slack_interactive_actions', (req, res) => {

  console.log('here are the channels', channels);
  console.log("\n\n<*****> INTERACTIVE ACTIONS CALLED <*****>");

  var payload = JSON.parse(req.body.payload);
  const channelId = payload.channel.id;
  const username = payload.user.name;
  const userId = payload.user.id
  var userJson = channels[channelId];
  if (!userJson) {
    userJson = {userId: userId, username: username};
    channels[channelId]=userJson;
  };
  // console.log('this is channelId', channelId);
  // console.log('this is the payload !!!! ===> ', payload);
  // console.log('this is the actions', req.body.payload.actions);
  // console.log('s  the type', req.body.payload.type);
  // console.log('this is the callback_id', req.body.payload.callback_id);

  if (payload.type === "interactive_message") {
    //console.log("##########| This is an interactive message |##########");

    if (payload.callback_id === "driver_or_rider") {
      console.log('this is the payload driver or rider', payload.actions);
      const isDriver = payload.actions[0].value;
      userJson['driver'] = isDriver === 'driver';
      console.log('here are the channels', channels);

      channels[channelId] = userJson;
      var tstamp = payload.original_message.ts;
      console.log("here's the timestamp: ", tstamp);
      web.chat.postMessage(getdialogTrigger(channelId)) // CBULX5DC2
        .then(
         (res) => {
          // console.log('~~~~~~~~~~ we got RES ayyyyyy ~~~~~~~~~~');
          // console.log('this is the res', res);
          // console.log('this is the attachments', res.message.attachments);
           // res.send('');
          // web.chat.update({token: botoauth, channel: channelId, text: "cool beans", attachments: [], ts: tstamp});
          res.send('');
           res.end();
        },
        (err) => {
          console.log('this is the error', err);
        }
      );
      res.send('');
      res.end();
      //console.log("Driver_or_rider called");
    }
    else if (payload.callback_id === "dialog_trigger"){
      //console.log("choose_address");
      web.dialog.open(getChooseAddress(payload.trigger_id, channelId));
      res.send('');
    }



    //ask for address
  }

  if (payload.type === "dialog_submission") {
    // console.log("dialog_submissionn");
    // console.log('payload in DIALOG', payload);
    const origin = payload.submission.loc_origin;
    const destination = payload.submission.loc_destination;
    const numSeats = payload.submission.seats;
    const time = payload.submission.pickup_time;
    userJson['origin'] = origin;
    userJson['destination'] = destination;
    userJson['numSeats'] = origin;
    userJson['time'] = time;
    channels[channelId] = userJson;
    console.log('final channels', channels);

    res.send('');
    web.chat.postMessage({ channel: channelId, token: botoauth,text: 'OK! ' });
  }
});
/***********************************************************************************/



// OTHER STUFF // // OTHER STUFF // // OTHER STUFF // // OTHER STUFF // // OTHER STUFF //
// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

const driverOrRider = (channelId) =>  {
  return {
    "text": "",
    "channel": channelId,
    "token": botoauth,
    "attachments": [
        {
            "text": "Are you a driver or a rider?",
            "fallback": "You are unable to choose a rider",
            "callback_id": "driver_or_rider",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "ride",
                    "text": "driver",
                    "type": "button",
                    "value": "driver"
                },
                {
                    "name": "ride",
                    "text": "rider",
                    "type": "button",
                    "value": "rider"
                },
            ]
        }
    ]
  }
};

const getdialogTrigger =(channelId) =>
{ return {
    "text": "",
    "channel": channelId,
    "token": botoauth,
    "attachments": [
        {
            "text": "Give an address?",
            "fallback": "You are unable to choose a rider",
            "callback_id": "dialog_trigger",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "trigger_id": "21321321",

            "actions": [
                {
                    "name": "should",
                    "text": "yes",
                    "type": "button",
                    "value": "yes"
                }
            ]
        }
    ]
}
}

const getChooseAddress = (trigger_id, channelId) => {

  const options = [
    {
      "label": "7-8am",
      "value": "7"
    },
    {
      "label": "8-9am",
      "value": "8"
    },
    {
      "label": "9-10am",
      "value": "9"
    },
    {
      "label": "10-11am",
      "value": "10"
    },
    {
      "label": "11-12pm",
      "value": "11"
    }
  ];

  const driver = {
    "text": "",
    "channel": channelId,
    "token": botoauth,
    "dialog": {
      "callback_id": "choose_address",
      "title": "Request a Ride",
      "submit_label": "Request",
      "elements": [
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_origin"
        },
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_destination"
        },
        {
          "type": "text",
          "subtype": "number",
          "label": "Number of seats",
          "name": "seats"
        },
        {
          "type": "select",
          "label": "Time",
          "name": "pickup_time",
          "options": options
        }
      ]

    },
    "trigger_id": trigger_id
  };

  const notdriver = {
    "text": "",
    "channel": channelId,
    "token": botoauth,
    "dialog": {
      "callback_id": "choose_address",
      "title": "Request a Ride",
      "submit_label": "Request",
      "elements": [
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_origin"
        },
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_destination"
        },
        {
          "type": "select",
          "label": "Time",
          "name": "pickup_time",
          "options": options
        }
      ]

    },
    "trigger_id": trigger_id
  };
  return channels[channelId]['driver'] ? driver : notdriver;

}
