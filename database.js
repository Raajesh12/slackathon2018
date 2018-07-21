const util = require('util');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://drpwhstlkluois:302845cdfada362f5345abb01bb1bf5c7e51b02af284ea53d85dfeaaebb03548@ec2-23-21-238-28.compute-1.amazonaws.com:5432/dc2su62job91i9",
  ssl: true,
});

client.connect().catch(console.error);

// get_open_drivers('Slackathon', 6, false, function(err, res){} )
function get_open_drivers(workspace, time, isMorning, callback) {
	let dayHalf = isMorning ? 'MORNING' : 'EVENING'
	client.query(
		util.format(`SELECT * FROM drivers WHERE workspace = '%s' AND %s_TIME = %d AND %s_SEATS > 0;`, workspace, dayHalf, time, dayHalf),
		callback
	);
}

// get_open_riders('Slackathon', 9, true,function(err, res){} )
function get_open_riders(workspace, time, isMorning, callback) {
	let dayHalf = isMorning ? 'MORNING' : 'EVENING'
	client.query(
		util.format(`SELECT * FROM riders WHERE workspace = '%s' AND %s_TIME = %d AND driver IS NULL;`, workspace, dayHalf, time),
		callback
	);
}

// get_driver('Test_Driver', function(err, res){} )
function get_driver(slack_id, callback) {
	client.query(
		util.format(`SELECT * FROM drivers WHERE slack_id = '%s';`, slack_id),
		callback
	);
}

// get_rider('Test_Rider', function(err, res){} )
function get_rider(slack_id, callback) {
	client.query(
		util.format(`SELECT * FROM riders WHERE slack_id = '%s';`, slack_id),
		callback
	);
}

// Opts should look like:
// {
// 		slack_id: 'Test_Driver2',
// 		workspace: 'Slackathon',
// 		morning_time: 9,
// 		evening_time: 5,
// 		location: '400 Market St San Francisco, CA',
// 		max_capacity: 6,
// 	}
function insert_driver(opts, callback) {
	client.query(
		util.format(`INSERT INTO DRIVERS(slack_id, workspace, morning_time, evening_time, location, max_capacity, morning_seats, evening_seats) 
			VALUES ('%s', '%s', %d, %d, '%s', %d, %d, %d);`, opts["slack_id"], opts["workspace"], opts["morning_time"], opts["evening_time"], opts["location"], opts["max_capacity"], opts["max_capacity"], opts["max_capacity"]), 
		callback
	);
}

// let opts = {
// 	slack_id: 'Test_Rider2',
// 	workspace: 'Slackathon',
// 	morning_time: 9,
// 	evening_time: 5,
// 	location: '300 Shattuck Avenue Berkeley, CA'
// };
function insert_rider(opts, callback) {
	client.query(
		util.format(`INSERT INTO RIDERS(slack_id, workspace, morning_time, evening_time, location) 
			VALUES ('%s', '%s', %d, %d, '%s');`, opts["slack_id"], opts["workspace"], opts["morning_time"], opts["evening_time"], opts["location"]), 
		callback
	);
}

// update_rider_with_driver('Test_Rider', 'Test_Driver', function(err, response){} )
function update_rider_with_driver(rider_slack_id, driver_slack_id, callback) {
	client.query(
		util.format(`UPDATE RIDERS SET driver = '%s' WHERE slack_id = '%s';`, driver_slack_id, rider_slack_id),
		callback
	);
}

// update_rider_remove_driver('Test_Rider', function(err, response){} )
function update_rider_remove_driver(rider_slack_id, callback) {
	client.query(
		util.format(`UPDATE RIDERS SET driver = NULL WHERE slack_id = '%s';`, rider_slack_id),
		callback
	);
}

// update_driver_seats('Test_Driver', true, 1, function(err, response){} )
function update_driver_seats(slack_id, isMorning, amount, callback) {
	let dayHalf = isMorning ? 'MORNING' : 'EVENING'

	client.query(
		util.format(`UPDATE DRIVERS SET %s_seats = %s_seats + %d WHERE slack_id = '%s';`, dayHalf, dayHalf, amount, slack_id),
		callback
	);
}

module.exports.get_open_drivers = get_open_drivers;
module.exports.get_open_riders = get_open_riders;
module.exports.get_driver = get_driver;
module.exports.get_rider = get_rider;
module.exports.insert_driver = insert_driver;
module.exports.insert_rider = insert_rider;
module.exports.update_rider_with_driver = update_rider_with_driver;
module.exports.update_rider_remove_driver = update_rider_remove_driver;
module.exports.update_driver_seats = update_driver_seats;