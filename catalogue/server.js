var express = require('express')
, http = require('http')
, app = express()
, path = require("path")
, cc = require('config-chain')
, mongoose = require('mongoose')
, Schema = mongoose.Schema
, morgan = require('morgan')             // log requests to the console (express4)
, bodyParser = require('body-parser')    // pull information from HTML POST (express4)
, methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());


var globals = require("./globals").globalParams

var config = cc( path.join(__dirname, app.get('env')+'.json'))


// Database
try{
	mongoose.connect('mongodb://estore:estore@ds061711.mongolab.com:61711/estore');
} catch(e) {
    console.log('Exception....');
    console.log(e);
}
mongoose.set('debug', true)
    
http.createServer(app).listen(config.store.port);

var product = {"productId": "1234", "productName": "DEll Latitude E77440", "costPrice": "2131", "sellingPrice": "6778", "quantity": "20"};

var productSchema = new Schema({  
      productId: { type: Number, required: true, index: true  }
    , productName: { type: String, required: true, trim: true }
    , costPrice: { type: Number, required: true  }
    , sellingPrice: { type: Number, required: true  }
    , quantity: { type: Number, required: true, trim: true, lowercase: true }
    , modified: { type: Date, default: Date.now }
    , created_on: {type: Date, default: Date.now}
    })
  , Product = mongoose.model('Product', productSchema);



app.get('/api', function (req, res) {
  res.send('Welcome to eStore!');
});

app.get('/api/products', function(req, res){
  var limit = req.query["limit"] ? parseInt(req.query["limit"], 10) : globals.limit
    , start = req.query["start"] ? parseInt(req.query["start"], 10) : globals.startParam
    , orderBy = req.query["orderBy"] ? req.query["orderBy"] : "productName"
    , orderType = req.query["orderType"] ? req.query["orderType"] : globals.orderType
    , order = orderBy + ' ' + orderType

	Product.find({}, function (err, products) {
		if (err){
			console.log("Error in fetching products list - " + err);
			res.send(err);
		} else {
			console.log(products.length + ' Products were fetched from mongo ')
			res.json(products);
		}
	});
})

app.post('/api/products', function(req, res){

	console.log('inside POST products....')
	console.log(req.body)
  
	var product = new Product({
		productId: req.body.productId
	,	productName: req.body.productName
	,	costPrice: req.body.costPrice
	,	sellingPrice: req.body.sellingPrice
	,	quantity: req.body.quantity
	});

	console.log(product);
    product.save(function (err) {
    	console.log('inside product.save....')
    	if (err){
			console.log('Error while inserting product : ' + product.productName + ' - ' + err);
			res.json({"code": 500, "error": err});
		} else {
			console.log('Success inserting product : ' + product.productName );
			Product.find(function(err, products){
				if (err)
                    res.send(err)
                res.json(products);
			})
		}
    })
})

app.put('/api/products/:productId', function(req, res){
	console.log('server inside updateProduct!');
	Product.findOne({productId: req.params.productId}, function(err, product){
		if (err){
			console.log("Error in fetching product - " + err);
			res.json({"code": 500, "error": "Error in fetching product ."});
		} else {
			console.log('server FIND inside updateProduct!');
			// Not using FindByIdAndUpdate so as to not miss the validations etc. per schema
			product.productName = req.body.productName
			product.sellingPrice = req.body.sellingPrice
			product.save(function(err){
				if (err){
					console.log("Error in saving product - " + err);
					res.json({"code": 500, "error": "Error in saving product details for " + product.productName});
				} else {
					// res.send(product);
					Product.find(function(err, products){
						if (err)
		                    res.send(err)
		                res.json(products);
					})		
				}
			})
		}
	})
})

app.delete('/api/products/:productId', function(req, res){
	var productIdToBeRemoved = req.params.productId;
	Product.findOneAndRemove({productId: productIdToBeRemoved}, function(err){
		if (err){
			console.log("Error in deleting product - " + err);
			res.json({"code": 500, "error": "Error in deleting product details for " + productId});
		} else {		
			Product.find(function(err, products){
				if (err)
                    res.send(err)
                res.json(products);
			})		
		}
	})
})
