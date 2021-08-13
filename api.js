const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
MongoClient.connect(url, function(err, db) {
	var dbo = db.db("mydb");
	app.get('/', (req, res) => {
		res.end('Hello World!');
	});

	app.get("/list_movies", (req, res) => {
		fs.readFile(__dirname + '/' + 'movies.json', 'utf8', (err, data) => {
			res.end(data);
		});
	});


	app.get("/list_get", (req, res) => {
		dbo.collection("customers").findOne({}, function(err, result) {
			if (err) throw err;
			// console.log(result.name);
			// console.log(result.number);
			//$data = array('name'=>result.name,'number'=>result.number);
			// var data = []; 
			// data['name'] = result.name;
			// data['number'] = result.number;
			// var myJsonString = JSON.stringify(data);
			res.end(result.name);

		//	db.close();
	});


	});
	app.listen(port, () => {
		console.log(`app listening at http://localhost:${port}`)
	});

});
