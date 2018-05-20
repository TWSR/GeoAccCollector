var fs = require("fs");
var http = require("http");
var https = require("https");
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var config = require("./config.json");

var credentials = {
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert)
};

var httpsServer = https.createServer(credentials, app);

var tests = require('./handlers/tests');
var utils = require('./handlers/utils');
var records = require('./handlers/records');

records.data_folder(config.data_folder || "");
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(function(req, res, next) {
    var uuid = req.cookies.uuid;
    if (!uuid) {
        uuid = utils.uuid_get('00:01:02:03:04:05');
    }
    res.cookie('uuid', uuid, { maxAge: 86400000 /* one day */ });
    next();
});

app.use("/", express.static(__dirname + '/html'));
app.use("/", express.static(__dirname + '/bower_components'));


/*
    Register callbacks
 */
app.get('/test', tests.test);
app.post('/recorder', records.recorder);

app.post('/insertDB', records.insertDB);

httpsServer.listen(config.port_number, function() {
    console.log("https listening 0.0.0.0:" + config.port_number);
});

setInterval(function() {
    records.filterDB();
}, 5 * 60 * 1000)