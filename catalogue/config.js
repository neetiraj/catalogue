
// Connect to the db
MongoClient.connect("mongodb://estore:estore@ds061711.mongolab.com:61711/estore", function(err, db) {
  if(!err) {
    console.log("We are connected");
    db.createCollection('products', function(err, collection) {
    	console.log('estore Products collection initialized ... ')
    });
  }
});
