const { matchLogic } = require('./maps.js');

const {insert_rider, insert_driver, get_open_riders, get_open_drivers} = require('./database');
// { userId: 'UBP4K9QQ7',

     // username: 'alexclin',
     //
     // driver: true,
     //
     // origin: 'a',
     //
     // destination: 'a',
     //
     // numSeats: 'a',
     //
     // time: '7' }
const workspace = 'slackathon'
const insertIntoDb = (userJson, callback) => {
  if (userJson.driver) {
    insert_driver({
      slack_id: userJson.userId,
      workspace: 'slackathon2018',
      location: userJson.origin,
      morning_time: parseInt(userJson.time),
      evening_time: 0,
      max_capacity: parseInt(userJson.numSeats)
    }, callback)
  } else {
    insert_rider({
      slack_id: userJson.userId,
      workspace: workspace,
      location: userJson.origin,
      morning_time: parseInt(userJson.time),
      evening_time: 0,
    }, callback)
  }
};

const getPairings = (myLocation, time, isDriver, callback) => {
  let addresses = [];
  let userids = [];
  const pairingsHelper = (error, response) => {
    console.log("ROFL");
    if (error) {
      console.log('db error', error);
      return;
    }

    for (let row of response.rows) {
      console.log(">>>", Json.stringify(row));
      addresses.push(row['location']);
      userids.push(row['slack_id']);
    }

    console.log("addresses: ",addresses, "userids: ", userids);
    matchLogic(myLocation, [addresses, userids]).then(callback);
  };
  if (isDriver) {
    console.log("LOL");
    get_open_riders(workspace, time, true, pairingsHelper);
  } else {
    get_open_drivers(workspace, time, true, pairingsHelper);
  }

}

module.exports.insertIntoDb = insertIntoDb;
module.exports.getPairings = getPairings;