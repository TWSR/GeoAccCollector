var fs = require("fs");
var http = require("http");
var https = require("https");
var express = require("express");
var app = express();

var credentials = {
  key: fs.readFileSync(__dirname + '/.ssl/private.key'),
  cert: fs.readFileSync(__dirname + '/.ssl/certificate.crt')
};

var httpsServer = https.createServer(credentials, app);
app.use("/html", express.static(__dirname + "/html"));
httpsServer.listen(8443, function() {
	console.log("https listening 0.0.0.0:8443");
});

