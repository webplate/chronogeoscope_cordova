//
// HTML interaction
//

// set html form with active coordinates
function form_position(latitude, longitude) {
    document.getElementById("latitude").value = latitude;
    document.getElementById("longitude").value = longitude;
}

// set the chronogeoscope on specific lat/lon
function change_position(lat, lon) {
    // convert to numbers
    lat = Number(lat);
    lon = Number(lon);
    // set to zero if unknown value
    if (isNaN(lat)) {
        lat = 0;
    }
    if (isNaN(lon)) {
        lon = 0;
    }
    // bound values
    if (lat > 90) {
        lat = 90;
    } else if (lat < -90) {
        lat = -90;
    }
    if (lon > LON_LIMIT) {
        lon = LON_LIMIT;
    } else if (lon < -LON_LIMIT) {
        lon = -LON_LIMIT;
    }
    
    // modify html display
    form_position(lat, lon);
    // modify canvas
    ticker_position(lat, lon);
    
    // force immediate render of change
    ASK_RENDER = true;
}

// use position from form
function get_position() {
    var lat = document.getElementById("latitude").value;
    var lon = document.getElementById("longitude").value;
        
    // help user to enter negative numbers
    if (lat == "0-") {
        document.getElementById("latitude").value = "-";
        return;
    }
    if (lon == "0-") {
        document.getElementById("longitude").value = "-";
        return;
    }
    
    // do nothing if starting to type negative number
    if (lat == "-" || lon == "-") {
        return;
    }
    
    // set to zero if unknown value
    if (isNaN(Number(lat))) {
        lat = 0;
    }
    if (isNaN(Number(lon))) {
        lon = 0;
    }
    
    change_position(lat, lon);
}

// jump to lat lon of major city
function jump_position() {
    var target = document.getElementById("city").value;
    
    // search for city position
    var lat = DEF_LAT;
    var lon = DEF_LON;
    
    for (i in SELECTED_CITIES) {
        var sel = SELECTED_CITIES[i];
        if (sel["name"] == target) {
            lat = sel["latitude"];
            lon = sel["longitude"];
        }
    }
    change_position(lat, lon);
}

// incrememnt or decremement latitude / longitude with buttons
function increment_lon() {
    var lat = document.getElementById("latitude").value;
    var lon = document.getElementById("longitude").value;
    lon = Math.round(Number(lon) + LON_RES);
    change_position(lat, lon);
}

function decrement_lon() {
    var lat = document.getElementById("latitude").value;
    var lon = document.getElementById("longitude").value;
    lon = Math.round(Number(lon) - LON_RES);
    change_position(lat, lon);
}

function increment_lat() {
    var lat = document.getElementById("latitude").value;
    var lon = document.getElementById("longitude").value;
    lat = Math.round(Number(lat) + LAT_RES);
    change_position(lat, lon);
}

function decrement_lat() {
    var lat = document.getElementById("latitude").value;
    var lon = document.getElementById("longitude").value;
    lat = Math.round(Number(lat) - LAT_RES);
    change_position(lat, lon);
}

// two digit number display
function two_digits(s) {
    s = s.toString();
    if (s.length == 1) {
        s = '0'+s;
    }
    return s;
}

// set time display
function update_time_display(date) {
    var span = document.getElementById("time");
    span.innerText = two_digits(date.getUTCHours())+' : '+
    two_digits(date.getUTCMinutes())+' : '+
    two_digits(date.getUTCSeconds());
    var span = document.getElementById("local_time");
    span.innerText = two_digits(date.getHours())+' : '+
    two_digits(date.getMinutes())+' : '+
    two_digits(date.getSeconds());
    var span = document.getElementById("solar_time");
    // epoch at utc (added offset) + solar delay from position
    var utc_ms = date.getTime() + (date.getTimezoneOffset() * 60000) + SOLAR_DELAY;
    var solar_date = new Date();
    solar_date.setTime(utc_ms);
    span.innerText = two_digits(solar_date.getHours())+' : '+
    two_digits(solar_date.getMinutes())+' : '+
    two_digits(solar_date.getSeconds());
}


// Responsivness

function adapt_to_screen_size() {
    // dimensions to check for adaptation
    var win_width = $(window).width();
    var win_height = $(window).height();
    var controls_height = $("#controls").height();
    
    var d = "";
    d += win_width;
    d += win_height;
    d += controls_height;
    
    // update only if there's any change
    if (GLOB_LAST_DIMS != d) {
        GLOB_LAST_DIMS = d;

        // elements to organize
        var fullclock = document.getElementById("fullclock");
        var controls = document.getElementById("controls");
        var overcanvas = document.getElementById("overcanvas");
        
        // resize clock from viewport size
        // works only for square clocks !!
        if (win_width < CANVAS_WIDTH || win_height < CANVAS_HEIGHT) {
            GLOB_ACTUAL_SIZE = Math.min(win_width, win_height);
        } else {
            GLOB_ACTUAL_SIZE = CANVAS_WIDTH;
        }
        renderer.view.style.width = String(GLOB_ACTUAL_SIZE) + 'px';
        renderer.view.style.height = String(GLOB_ACTUAL_SIZE) + 'px';
        
        overcanvas.style.width = String(GLOB_ACTUAL_SIZE) + 'px';
        overcanvas.style.height = String(GLOB_ACTUAL_SIZE) + 'px';
        fullclock.style.width = String(GLOB_ACTUAL_SIZE) + 'px';
        
    }
}

// intercept coordinates of click on canvas
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return [x, y];
}

if (document.addEventListener) {                // For all major browsers, except IE 8 and earlier
    document.addEventListener("click", function(event) {
        if (INTERACTIVE) {
            var canvas = document.getElementById("clock");
            var coo = getCursorPosition(canvas, event);
            var centered_coo = [coo[0] - GLOB_ACTUAL_SIZE/2, coo[1] - GLOB_ACTUAL_SIZE/2];
            var coo2 = azi_to_map(centered_coo[0], centered_coo[1]);
            // if the click is on the map
            if (coo2[0] <= 90) {
                change_position(coo2[0], coo2[1]);
            }
        }
    });
} else if (document.attachEvent) {              // For IE 8 and earlier versions
    document.attachEvent("onclick", myFunction);
}
