//
// Graphic functions
//

// set clock according to position
function ticker_position(latitude, longitude) {
    // rotate ticker
    var rad_lon = longitude * Math.PI/180;
    ticker.rotation = rad_lon;
    // this angle is also the delay from GMT in milliseconds
    SOLAR_DELAY = (rad_lon / (2 * Math.PI)) * 24 * 60 * 60 *1000 ;
    // place local position spot
    var coo = get_azi(latitude, longitude);
    spot.x = coo[0];
    spot.y = coo[1];
}

// update tickers position
function update_tickers(date) {
    // compute analogic UTC time
    var aHour = date.getUTCHours() + date.getUTCMinutes()/60.0 + date.getUTCSeconds()/3600.0;
    var angle = aHour / 24. * 2 * Math.PI;
    // keep in global variable
    GLOB_ANGLE = angle;
    //rotate the container
    back_cont.rotation = angle;
    front_cont.rotation = angle;
    // calculate analogic local time
    var aHour = date.getHours() + date.getMinutes()/60.0 + date.getSeconds()/3600.0;
    var angle = aHour / 24. * 2 * Math.PI;
    //rotate the local time ticker
    local_ticker.rotation = angle;
}

// give the sun angle with earth equatorial plane
function get_sun_tilt(date) {
    // approximate current day of year
    var day_of_year = date.getUTCDate() + date.getUTCMonth() * 30.44;
    // the tilt between earth and sun
    // (23.5° at max and summer solstice on the 172nd day)
    var observable_tilt = 23.5*Math.cos(((2*Math.PI)/365)*(day_of_year - 172));
    
    return observable_tilt;
}


// update shadow texture
function update_shadow(date) {
    var tilt = get_sun_tilt(date);
    // select correct png
    var i = Math.round(50 * Math.abs((tilt - 23.5) / 23.5));
    // reload texture
    var texture = PIXI.Texture.fromImage('static/img/shadows/'+String(i)+'.png');
    shadow.setTexture(texture);
}
