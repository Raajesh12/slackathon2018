var express = require('express')
var app = express()
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://drpwhstlkluois:302845cdfada362f5345abb01bb1bf5c7e51b02af284ea53d85dfeaaebb03548@ec2-23-21-238-28.compute-1.amazonaws.com:5432/dc2su62job91i9",
  ssl: true,
});

client.connect().catch(console.error);

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
	output = ""
	client.query('SELECT * FROM DRIVERS;', (err, res) => {
		if (err) throw err;
		for (let row of res.rows) {
			console.log(JSON.stringify(row));
			output += JSON.stringify(row) + "\n"
		}
		response.send(output);
	});
})

app.get('/schemas', function(request, response) {
	output = ""
	client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
		if (err) throw err;
		for (let row of res.rows) {
			console.log(JSON.stringify(row));
			output += JSON.stringify(row) + "\n"
		}
		response.send(output);
	});
})

app.get('/init', function(request, response) {
	output = "";
	client.query(`CREATE TABLE IF NOT EXISTS DRIVERS(
			ID INT PRIMARY KEY NOT NULL,
			MORNING_TIME INT,
			EVENING_TIME INT,
			location VARCHAR,
			MAX_SEATS INT,
			MORNING_SEATS INT,
			EVENING_SEATS INT
		);`, (err, res) => {
		if (err) throw err;
		for (let row of res.rows) {
			console.log(JSON.stringify(row));
			output += JSON.stringify(row) + "\n"
		}
		response.send(output);
	});
})

app.get('/test_lol', function(request, response) {
	response.send('OMG WHAT IS UP MY BUDDIES???')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})