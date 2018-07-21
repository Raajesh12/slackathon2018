// server.js
// where your node app starts

// init project
var express = require('express');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');

var app = express();

const web = new WebClient("xoxp-369235392373-395100178065-401987767040-4851bc233b74888864f901fcf3e472f3");

const botoauth = "xoxb-369235392373-403996533910-z0VWznWeQoZMuw9CsTcQZPP3";
const regoauth = "xoxp-369235392373-399691204242-402432929924-44b49f2f735d5ed5ecfbac816c0fd482";

const clientSecret = "c92d675a7f4f688906a79666f0d00c25";
const clientId = "369235392373.401960661712";
const verifToken = "9bAlS03W7clTdtmSzfkch4I4";

const BOT_USERNAME = 'daifuku';

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
  if (req.body.event.username === BOT_USERNAME) {
    res.end();
    return;
  }
  
  const channelId = req.body.event.channel;
  switch (req.body.type) {
    case 'url_verification': {
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }
      
    case 'event_callback': {
      switch (req.body.event.type) {
        case 'message': {
          web.chat.postMessage({ channel: channelId, token: botoauth,text: introText })
          .then((res) => {
            web.chat.postMessage(driverOrRider(channelId))
            .then(
              (res) => {
                console.log('this is the res', res);
              },
              (err) => {
                console.log('this is the error', err);
              }  
            );
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
    channels[channelId] = userJson;
  };

  if (payload.type === "interactive_message") {
    
    if (payload.callback_id === "driver_or_rider") {
      console.log('this is the payload driver or rider', payload.actions);
      const isDriver = payload.actions[0].value;
      userJson['driver'] = isDriver === 'driver';
      console.log('here are the channels', channels);

      channels[channelId] = userJson;
      var tstamp = payload.original_message.ts;
      console.log("here's the timestamp: ", tstamp);
      web.dialog.open(getChooseAddress(payload.trigger_id, channelId));
      res.send('');
      res.end();
    }   
    //ask for address
  }
  
  if (payload.type === "dialog_submission") {
    const origin = payload.submission.loc_origin;
    // const destination = payload.submission.loc_destination;
    const numSeats = payload.submission.seats;
    const time = payload.submission.pickup_time;
    userJson['origin'] = origin;
    // userJson['destination'] = destination;
    userJson['numSeats'] = origin;
    userJson['time'] = time;
    channels[channelId] = userJson;
    console.log('final channels', channels);
	insertIntoDb(userJson, (err)=>{
	    res.send(String(err));
	    web.chat.postMessage({ channel: channelId, token: botoauth,text: "OK! Once I find a match, I'll let you know in a group DM :slightly_smiling_face:!" });
	    web.conversations.open({ token: botoauth, users: "UBP4K9QQ7,UBM2Y581X" })
	    .then(
	      (res) => {
	        web.chat.postMessage({ channel: res.channel.id, token: botoauth, text: "Hi :wave: You're paired to carpool!"});
	      }
	    );
	});
  }
});
/***********************************************************************************/


// OTHER STUFF // // OTHER STUFF // // OTHER STUFF // // OTHER STUFF // // OTHER STUFF // 
// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on plort ' + listener.address().port);
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

const getChooseAddress = (trigger_id, channelId) => {
  
  const options = [
    {
      "label": "7-8 am",
      "value": "7"
    },
    {
      "label": "8-9 am",
      "value": "8"
    },
    {
      "label": "9-10 am",
      "value": "9"
    },
    {
      "label": "10-11 am",
      "value": "10"
    },
    {
      "label": "11-12 pm",
      "value": "11"
    }
  ];
  
  const driver = {
    "text": "",
    "channel": channelId,
    "token": botoauth,
    "dialog": {
      "callback_id": "choose_address",
      "title": "Driver Form",
      "submit_label": "Request",
      "elements": [
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_origin"
        },
        {
          "type": "text",
          "subtype": "number",
          "label": "Number of Seats",
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
      "title": "Rider Form",
      "submit_label": "Request",
      "elements": [
        {
          "type": "text",
          "label": "Pickup Location",
          "name": "loc_origin"
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