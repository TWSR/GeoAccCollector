function twsr_filters() {
    const time_interval = 5000;
    const scale_dist = 6371 * 1000 * 2 * Math.PI / 360.0;
    var cache_length = 500;
    var ori_cache = [];
    var mot_cache = [];
    var geo_cache = [];
    var gacc_z = [];


    this.ori_filter = function(ori) {
        ori_cache.push(ori);
        ori_cache.splice(0, ori_cache.length - cache_length);
        return true;
    }

    this.mot_filter = function(mot) {

        //todo: rotate gacc_xyz       
        //console.log(mot.time)
        if (ori_cache.length > 0) {

            var rotation_matrix = R_Matrix(ori_cache[ori_cache.length - 1].beta * Math.PI / 180.0,
                ori_cache[ori_cache.length - 1].gamma * Math.PI / 180.0,
                ori_cache[ori_cache.length - 1].alpha * Math.PI / 180.0);
            var z = mot.gacc_x * rotation_matrix[0][2] + mot.gacc_y * rotation_matrix[1][2] + mot.gacc_z * rotation_matrix[2][2]
            gacc_z.push(z);
            //console.log(z)

            mot_cache.push(mot);
            mot_cache.splice(0, mot_cache.length - cache_length);

            //alert(mot_cache[mot_cache.length - 1].time.split('.')[0])
            var date1 = new Date(mot_cache[mot_cache.length - 1].time.split('.')[0]);
            var date2 = new Date(mot_cache[0].time.split('.')[0]);
            //alert(date1 - date2)
            if (Math.abs(date1 - date2) > time_interval) {
                filter_post_status = 'NG';
                filter_ng_time += time_interval;
                //if (mot_cache.length >= 10) {
                var geo_temp = geo_cache.filter(geo_ => new Date(geo_.time.split('.')[0]).getTime() > new Date(mot_cache[0].time.split('.')[0]).getTime() - 1000 && new Date(geo_.time.split('.')[0]).getTime() < new Date(mot_cache[mot_cache.length - 1].time.split('.')[0]).getTime());

                if (geo_temp.length >= time_interval / 1000) { // recive gps stable
                    var dist_sum = 0;
                    var pt_str = '';
                    var data = {};
                    var points = [];
                    var smooth_index = [];

                    for (var i = 0; i < geo_temp.length; i++) {
                        points.push([geo_temp[i].latitude, geo_temp[i].longitude]);
                        pt_str += geo_temp[i].latitude + " " + geo_temp[i].longitude + ","
                        if (i != 0) {
                            dist_sum += this.distFromlatlng(geo_temp[i - 1].latitude, geo_temp[i - 1].longitude, geo_temp[i].latitude, geo_temp[i].longitude);
                        }
                    }
                    pt_str = pt_str.substring(0, pt_str.length - 1);
                    data.points = points;

                    if (dist_sum > 10 && dist_sum < 500) {
                        var stdZ = standardDeviation(gacc_z);
                        var latlng = geo_temp[parseInt(geo_temp.length / 2)].latitude + ' ' + geo_temp[parseInt(geo_temp.length / 2)].longitude;


                        var geolocation_accuracy = geo_temp.reduce(function(sum, value) {
                            return sum + value.accuracy;
                        }, 0) / geo_temp.length;

                        var geolocation_speed = geo_temp.reduce(function(sum, value) {
                            return sum + value.speed;
                        }, 0) / geo_temp.length;

                        data.smooth_index = stdZ;

                        var postdata = JSON.stringify({
                            "time": mot_cache[0].time,
                            //"smooth_index": stdZ,
                            "std_section": stdZ,
                            "source": 'GeoAccCollector' + location.port,
                            "points": pt_str,
                            //"remark": pt_str,
                            "latlng": latlng,
                            "uuid": Cookies.get("uuid"),
                            "vehicle_type": Cookies.get("vehicle"),
                            "user": Cookies.get("name"),
                            "geolocation_accuracy": geolocation_accuracy,
                            "geolocation_speed": geolocation_speed
                        });
                        drawPolyLine(data, true);

                        $.post('/insertDB', postdata);
                        filter_post_num += 1;
                        filter_post_status = 'OK';
                        filter_ng_time = 0;
                    }
                }
                mot_cache = [];
                gacc_z = [];
            }
        }
        return true;
    }
    this.geo_filter = function(geo) {
        geo_cache.push(geo);
        geo_cache.splice(0, geo_cache.length - cache_length);
        return true;
    }

    this.postSomeThing = function() {
        $.post('/insertDB', JSON.stringify({ time: new Date() }))
    }
    this.distFromlatlng = function(lat0, lng0, lat1, lng1) {
        return Math.sqrt(Math.pow(lat0 - lat1, 2) + Math.pow(lng0 - lng1, 2)) * scale_dist;
    }

    return this;
}

function standardDeviation(values) {
    var avg = average(values);

    var squareDiffs = values.map(function(value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function average(data) {
    var sum = data.reduce(function(sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}

function R_Matrix(w, p, k) {
    var Rw = [];
    var Rp = [];
    var Rk = [];

    Rw[0] = [1, 0, 0];
    Rw[1] = [0, Math.cos(w), Math.sin(w)];
    Rw[2] = [0, -Math.sin(w), Math.cos(w)];

    Rp[0] = [Math.cos(p), 0, -Math.sin(p)];
    Rp[1] = [0, 1, 0];
    Rp[2] = [Math.sin(p), 0, Math.cos(p)];

    Rk[0] = [Math.cos(k), Math.sin(k), 0];
    Rk[1] = [-Math.sin(k), Math.cos(k), 0];
    Rk[2] = [0, 0, 1];

    R = AdotB(Rp, AdotB(Rw, Rk));
    return R;
}

function AdotB(A, B) {
    var m = A.length;
    var n = A[0].length;
    var m1 = B.length;
    var n1 = B[0].length;

    var Answer = [];
    var sum;
    if (n == m1) {
        for (var i = 0; i < m; i++) {
            var ans = [];
            for (var j = 0; j < n1; j++) {
                sum = 0;
                for (var k = 0; k < n; k++) {
                    sum = sum + A[i][k] * B[k][j];
                }
                ans.push(sum)
            }
            Answer.push(ans);
        }
        return Answer;
    } else {
        throw new Exception("Wrong dimension in AdotB");
    }
}