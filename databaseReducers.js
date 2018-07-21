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
const workspace = 'slackathon2018'
const insertIntoDb = (userJson, callback) => {
  if (userjson.driver) {
    insert_driver({
      slack_id: userJson.userId,
      workspace: 'slackathon2018',
      location: userJson.origin,
      morning_time: parseInt(userJson.time),
      evening_time: 0,
      max_capacity: parseInt(userjson.numSeats)
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

const getPairings = (time, isDriver, callback) => {
  let addresses = [];
  let userids = [];
  const pairingsHelper = (error, response) => {
    if (error) {
      console.log('db error', error);
      return;
    }

    for (let row of res.rows) {
      addresses.push(row['location']);
      userids.push(row['slack_id']);
    }
    matchLogic(startLocation, [addresses, userids]).then(callback);
  };
  if (isDriver) {
    get_open_riders(workspace, time, true, pairingsHelper);
  } else {
    get_open_drivers(workspace, time, true, pairingsHelper);
  }

}

module.exports.insertIntoDb = insertIntoDb;
module.exports.getPairings = getPairings;