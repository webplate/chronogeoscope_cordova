//
// Trigonometry functions
//

// return coords on 2D map from lat lon in degrees
function get_azi(lat, lon) {
    var lon = lon * Math.PI/180;
    var r = (MAP_W/4)/90 * lat + MAP_W/4;
    var x = r * Math.cos(lon - Math.PI/2) + MAP_W/2;
    var y = r * Math.sin(lon - Math.PI/2) + MAP_W/2;
    return [x, y];
}

//~ get cartesian coordinates from spherical coordinates
function get_cart(lat, lon) { 
    var x = Math.sin(lat) * Math.cos(lon);
    var y = Math.sin(lat) * Math.sin(lon);
    var z = Math.cos(lat);
    return [x, y, z];
}

//~ get rotated coordinates
function tilt_cart(x, y, z, tilt) {
    //~ along x axis of tilt radians
    var x2 = x;
    var y2 = y * Math.cos(tilt) + z * Math.sin(tilt);
    var z2 = -Math.sin(tilt) * y + z * Math.cos(tilt);
    return [x2, y2, z2];
}

//~ get cartesian coordinates from spherical coordinates
//~ after applying a rotation of the base around x axis of tilt radians
function get_tilt_cart(lat, lon, tilt) {
    var coo = get_cart(lat, lon);
    var coo2 = tilt_cart(coo[0], coo[1], coo[2], tilt);
    return [coo2[0], coo2[1], coo2[2]];
}

//~ return spherical coordinates from cartesian
function get_spher(x, y, z) {
    var lon = Math.atan2(y, x);
    var lat = Math.acos(z);
    return [lat, lon];
}

//~ return coord on azimuthal map
function get_azi_coord(lat, lon) {
    var r = (MAP_W/4)/(Math.PI/2) * lat;
    var x = r * Math.cos(lon);
    var y = r * Math.sin(lon);
    return [x, y];
}

// convert 2D azimutal map coord to spherical
function azi_to_spher(x, y) {
    var x = x - MAP_W/2;
    var y = y - MAP_W/2;
    var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var lon = Math.acos(y / r);
    var lat = r/(MAP_W/2) * Math.PI;
    return [lat, lon];
}

// longitude should remain between -180 and 180°
function correct_lon(lon) {
    // bound values    
    if (lon > 180) {
        while (lon > 180) {
            lon -= 180;
        }
        lon -= 180;
    }
    
    if (lon < -180) {
        while (lon < -180) {
            lon += 180;
        }
        lon += 180;
    }
    return lon;
}

// convert 2D azimutal pixel map coord to spherical in map notation (degrees)
function azi_to_map(x, y) {
    // distance from center
    var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var lat = r/(MAP_W/2) * Math.PI * 180/Math.PI - 90;  // take into account actual size
    
    // convert to polar and add angle of chronogeoscope map
    var lon = (Math.atan2(x, -y) - GLOB_ANGLE) * 180/Math.PI;
    //~ lon = correct_lon(lon);
        
    return [lat, lon];
}

// sigmoid between 0 and 1 of length l starting from s
function sigmoid(x, l, s) {
    return 6*Math.pow(((x-s)/l),5) - 15*Math.pow(((x-s)/l),4) + 10*Math.pow(((x-s)/l),3);
}

// sigmoid between 1 and 0 of length l starting from s
function reverse_sigmoid(x, l, s) {
    return 1 - sigmoid(x, l, s);
}

// returns bumping values from time t consisting of:
// sigmoid from min to max during l
// plateau during L
// sigmoid from max to min during l
// plateau during L
// and loop
function bumpy(t, min, max, l, L) {
    var total = 2*l + 2*L;
    var rem = (t) % total;
    
    if (rem < l) {
        factor = sigmoid(rem, l, 0);
    } else if (l <= rem && rem < l + L) {
        factor = 1;
    } else if (l + L <= rem && rem < 2*l + L) {
        factor = reverse_sigmoid(rem, l, l + L);
    } else if (rem >= 2*l + L) {
        factor = 0;
    }
    factor *= max-min;
    factor += min;
    return factor;
}
