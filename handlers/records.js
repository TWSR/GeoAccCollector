var fs = require("fs");
var date = require("../lib/date");

var Sequelize = require('sequelize');
var db_conn = require('../config/db');
const sequelize = new Sequelize(db_conn.connectInfo.database, db_conn.connectInfo.user, db_conn.connectInfo.password, {
    host: db_conn.connectInfo.host,
    dialect: 'mysql',
    define: { timestamps: false },
    logging: false,
    timezone: '+08:00'
});
const Road = sequelize.import("../models/road")

var datafolder = "./data";
exports = module.exports = (function() {
    return {
        recorder: recorder,
        data_folder: data_folder,
        insertDB: insertDB,
        filterDB: filterDB
    };
})();

function data_folder(folder) {
    if (!!folder && fs.existsSync(folder)) {
        datafolder = folder;
    }
    return datafolder;
}

function recorder(req, res) {
    var time_to_break = 15 * 60 * 1000;
    var uuid = req.cookies.uuid;
    var name = req.cookies.name;
    var vehicle = req.cookies.vehicle;
    var body = "";
    if (!fs.existsSync(datafolder)) {
        fs.mkdirSync(datafolder);
    }

    var ts_file = datafolder + "/timestamp-" + uuid + ".txt";
    var now = new Date();
    var ts = now.toUTCString();

    if (fs.existsSync(ts_file)) {
        var ts_old = fs.readFileSync(ts_file);
        var t_old = Date.parse(ts_old);
        var t = Date.parse(ts);
        if ((t - t_old) <= time_to_break) {
            ts = ts_old;
        } else {
            fs.writeFileSync(ts_file, ts);
        }
    } else {
        fs.writeFileSync(ts_file, ts);
    }

    var ts_string = new Date(Date.parse(ts)).toISOString().replace(/:/g, "_");

    req.on("data", function(data) {
        body += data;
    });

    req.on("end", function() {
        var data = JSON.parse(body);

        var orientation_file = datafolder + "/" + "orientation-" + uuid + "_" + name + "_" + vehicle + "_" + ts_string + ".json";
        var motion_file = datafolder + "/" + "motion-" + uuid + "_" + name + "_" + vehicle + "_" + ts_string + ".json";
        var geolocation_file = datafolder + "/" + "geolocation-" + uuid + "_" + name + "_" + vehicle + "_" + ts_string + ".json";
        var snapshot_file = datafolder + "/" + "snapshot-" + uuid + "_" + name + "_" + vehicle + "_" + ts_string + ".json";
        var ori_count = 0,
            mot_count = 0,
            geo_count = 0,
            snap_count = 0;

        var orientation_string = "";
        data.orientations.forEach(function(orientation) {
            orientation_string += ",\n" + JSON.stringify(orientation);
            ori_count++;
        });
        if (!fs.existsSync(orientation_file)) {
            orientation_string = orientation_string.substring(2, orientation_string.length);
        }
        if (orientation_string.length > 0) {
            fs.appendFileSync(orientation_file, orientation_string);
        }

        var motion_string = "";
        data.motions.forEach(function(motion) {
            motion_string += ",\n" + JSON.stringify(motion);
            mot_count++;
        });
        if (!fs.existsSync(motion_file)) {
            motion_string = motion_string.substring(1, motion_string.length);
        }
        if (motion_string.length > 0) {
            fs.appendFileSync(motion_file, motion_string);
        }

        var geolocation_string = "";
        data.geolocations.forEach(function(geolocation) {
            geolocation_string += ",\n" + JSON.stringify(geolocation);
            geo_count++;
        });
        if (!fs.existsSync(geolocation_file)) {
            geolocation_string = geolocation_string.substring(2, geolocation_string.length);
        }
        if (geolocation_string.length > 0) {
            fs.appendFileSync(geolocation_file, geolocation_string);
        }

        var snapshot_string = "";
        if (data.snapshots) {
            data.snapshots.forEach(function(snapshot) {
                snapshot_string += ",\n" + JSON.stringify(snapshot);
                snap_count++;
            });
            if (!fs.existsSync(snapshot_file)) {
                snapshot_string = snapshot_string.substring(2, snapshot_string.length);
            }
            if (snapshot_string.length > 0) {
                fs.appendFileSync(snapshot_file, snapshot_string);
            }
        }

        var response = {
            uuid: uuid,
            ori_count: ori_count,
            mot_count,
            mot_count,
            geo_count: geo_count,
            snap_count: snap_count
        };
        res.send(JSON.stringify(response));
    });
}

function insertDB(req, res) {

    let body = ''
    req.on("data", function(data) {
        body += data;
    })

    req.on("end", function() {
        let postData = JSON.parse(body)
        if (postData.points) {
            postData.points = sequelize.fn('ST_GeomFromText', 'linestring(' + postData.points + ')')
        }

        if (postData.latlng) {
            postData.latlng = sequelize.fn('ST_GeomFromText', 'point(' + postData.latlng + ')')
        }

        Road.create(postData)
            .then(addedRecord => {
                res.status(200).send('ok')
            })
            .catch(err => {
                res.status(500).json({
                    error: 'Insert data fail'
                })
            })
    })
}

function filterDB(req, res) {
    console.log('filterDB' + new Date());

    //query uuid where filter_std_all = 0
    //uuid foreach select where filter_std_all = 0
    //      if last time - now < 5 min skip
    //      else
    //          split section and count std_all
    //          update smooth_index
    Road.findAll({
        where: {
            filter_std_all: 0,
        },
        attributes: [
            [sequelize.literal('distinct `uuid`'), 'uuid']
        ]
    }).then(function(uuid) {
        uuid.forEach(data => {
            console.log(data.uuid);
            Road.findAll({
                where: {
                    filter_std_all: 0,
                    uuid: data.uuid
                },
                order: [
                    ['time', 'DESC']
                ],
                attributes: [
                    'id', 'time', 'smooth_index', 'uuid'
                ]
            }).then(function(data) {
                console.log(data.length);
                var minuteago = (new Date().getTime() - new Date(data[0].time).getTime()) / 1000.0 / 60;
                if (minuteago > 5) {
                    console.log(minuteago);
                    var sum = data.reduce(function(sum, value) {
                        return sum + value.smooth_index;
                    }, 0);
                    console.log(sum);
                    var avg = sum / data.length;
                    console.log(avg);
                    data.forEach(data => {
                        console.log(data.id);
                        Road.update({ smooth_index: data.smooth_index / avg, filter_std_all: true }, { where: { id: data.id } })
                            .then(function() {
                                console.log('update smooth_index where id = ' + data.id);
                            }).catch(function(e) {
                                console.log("id:" + data.id + " update failed !");
                            });
                    })

                }
            })
        })
    })
    return true;
}