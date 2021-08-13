var MongoClient = require('mongodb').MongoClient;
//const app = express();

var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var dbo = db.db("mydb");

// 	var myquery = { address: "Highway 37" };
// 	var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
// 	dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
// 		if (err) throw err;
// 		console.log("1 document updated");
// 		dbo.collection("customers").findOne({}, function(err, result) {
// 			if (err) throw err;
// 			console.log(result.name);
// 			console.log(result.address);
// 			db.close();
// 		});
//     //db.close();
// });

  var myobj = { name: "Company Inc", number: "123145" };
  dbo.collection("customers").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    //db.close();
    dbo.collection("customers").findOne({}, function(err, result) {
			if (err) throw err;
			console.log(result.name);
			console.log(result.number);
			db.close();
  });

  });

  
});