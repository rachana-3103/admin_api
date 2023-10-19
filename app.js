require("dotenv").config();
var express     = require('express');
var cors = require('cors');
var middleware 	= require('./middleware/headerValidator');
var app = express();
app.use(cors())
app.options("*", cors());


var admin	= require('./modules/v1/Auth/route');
var vendor	= require('./modules/v1/vendor/route');


app.use(express.text());
app.use(express.urlencoded({ extended: false }));

app.use(middleware.extractHeaderLanguage);
app.use(middleware.validateHeaderApiKey);
app.use(middleware.validateHeaderToken);
app.use('/api/v1/admin/',admin);
app.use('/api/v1/vendor/',vendor);


try {
	server = app.listen(process.env.PORT);
	console.log("🚀🚀🚀🚀🚀Connected to Ballina Admin 🚀🚀🚀🚀🚀: "+process.env.PORT);
} catch (err) {
	console.log("Failed to connect");
}
