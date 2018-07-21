const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://drpwhstlkluois:302845cdfada362f5345abb01bb1bf5c7e51b02af284ea53d85dfeaaebb03548@ec2-23-21-238-28.compute-1.amazonaws.com:5432/dc2su62job91i9",
  ssl: true,
});

client.connect().catch(console.error);

function get_open_drivers(workspace, time, isMorning, callback) {
	let dayHalf = isMorning ? 'MORNING' : 'EVENING'
	client.query(`SELECT * FROM drivers WHERE workspace = '` + workspace + `' AND ` + dayHalf + `_TIME = ` + String(time)+ ` AND ` + dayHalf + `_SEATS > 0;`, (err, res) => {
		callback(err, res);
	});
}

function get_driver(id, callback) {
	client.query(`SELECT * FROM drivers WHERE id = ` + id  + `;`, (err, res) => {
		callback(err, res);
	});
}

function insert_driver(id, callback) {
	client.query(`SELECT * FROM drivers WHERE id = ` + id  + `;`, (err, res) => {
		callback(err, res);
	});
}

get_drivers('BULLSHIT', 8, true, (err, response)=>{
	if (err) {
		// Handle error
		return;
	} else {
		// IT WORKED!
		output = ""
		for (let row of response.rows) {
			console.log(JSON.stringify(row));
			output += JSON.stringify(row) + "\n"
		}
		console.log(output)
	}
});