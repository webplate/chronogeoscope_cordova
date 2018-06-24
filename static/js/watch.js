// The Chronogeoscope
// 
// is distributued under the license CC-BY-NC-SA
// https://creativecommons.org/licenses/by-nc-sa/4.0/
// 
// Design: Roberto Casati and Glen Lomax
// Main developper: Glen Lomax
// Website: https://github.com/webplate/chronogeoscope
// Disclaimer: we cannot take any responsibility
// for uses that go beyond the intended educational use of the software.

// Configuration variables
//
var SCREEN_WIDTH = 794;
var SCREEN_HEIGHT = SCREEN_WIDTH;
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = CANVAS_WIDTH;
var CONTROLS_WIDTH = 400;
var MAP_H = 533;
var MAP_W = MAP_H;
var SHAD_H = 586;
var SHAD_W = SHAD_H;
var FRAME_H = SCREEN_HEIGHT;
var FRAME_W = FRAME_H;
var FRAME_ALPHA = 0.85;
var TICKER_W = 20;
var TICKER_H = 291;
var TICKER_PIVOT_X = TICKER_W/2;
var TICKER_PIVOT_Y = TICKER_H - TICKER_PIVOT_X;
var LOCAL_TICKER_w = 17;
var LOCAL_TICKER_H = 289;
var LOCAL_TICKER_PIVOT_X = LOCAL_TICKER_w/2;
var LOCAL_TICKER_PIVOT_Y = LOCAL_TICKER_H - LOCAL_TICKER_PIVOT_X;
var SPOT_COLOR = 0xFF0B0B;
var SHADOW_ALPHA = 0.15;
var CITY_ALPHA = 1;
var SOLAR_DELAY = 0;

// Default lat/lon setting
var DEF_LAT = 0;
var DEF_LON = 0;
// lat/lon change incremement resolution
var LAT_RES = 10;
var LON_RES = 5;
var LON_LIMIT = 999999;
// Animation delays in seconds
var PAGE_DELAY = 0.5;
var TICK_DELAY = 10;
var SHADOW_DELAY = 60*30;
// EXPERIMENTAL
// interactivity on canvas
var INTERACTIVE = false;
// accelerated mode
var ACCELERATED = false;

// Performance settings
var REAL_TIME = false;
var NOWEBGL = true;

// Ask immediate render for once
var ASK_RENDER = false;

// Geolocation status
var GEOLOCATED = false;
var IGNORE_GEOLOCATION = false;


// Global variables in app
//
var GLOB_ANGLE = 0;
// Responsivness
var GLOB_LAST_DIMS = ""; //signature of dimensions on which depends layout
var GLOB_ACTUAL_SIZE = 0;

// create the main pixi renderer
var renderer = PIXI.autoDetectRenderer(SCREEN_WIDTH, SCREEN_HEIGHT,{transparent: true}, noWebGl = NOWEBGL);

// add pixi surface to centered div
var div = document.getElementById("clock");
div.appendChild(renderer.view);

//
// Display objects
//

// draw map
var map = PIXI.Sprite.fromImage('static/img/map.png');
map.x = 0;
map.y = 0;

// draw earth self shadow
var shadow = new PIXI.Sprite.fromImage('static/img/shadows/0.png');
shadow.position.x = SCREEN_WIDTH/2 - SHAD_W/2;
shadow.position.y = SCREEN_HEIGHT/2 - SHAD_H/2;
shadow.pivot.x = 0;
shadow.pivot.y = 0;
shadow.alpha = SHADOW_ALPHA;
shadow.blendMode = PIXI.BLEND_MODES.LUMINOSITY

// draw solar time ticker
var ticker = PIXI.Sprite.fromImage('static/img/stick.png');
ticker.pivot.x = TICKER_PIVOT_X;
ticker.pivot.y = TICKER_PIVOT_Y;
ticker.x = MAP_W/2 ;
ticker.y = MAP_H/2 ;

// draw a circle to indicate location
var spot = new PIXI.Graphics();
spot.lineStyle(0);
spot.beginFill(SPOT_COLOR, 0.8);
spot.drawCircle(0, 0, 6);
spot.endFill();
spot.pivot.x = 0;
spot.pivot.y = 0;
spot.x = MAP_W/2;
spot.y = MAP_H/2;

// draw local time ticker
var local_ticker = PIXI.Sprite.fromImage('static/img/localticker.png');
local_ticker.pivot.x = LOCAL_TICKER_PIVOT_X;
local_ticker.pivot.y = LOCAL_TICKER_PIVOT_Y;
local_ticker.x = SCREEN_WIDTH/2 ;
local_ticker.y = SCREEN_HEIGHT/2 ;

//draw frame
var frame = PIXI.Sprite.fromImage('static/img/frame.png');
frame.alpha = FRAME_ALPHA;
frame.x = SCREEN_WIDTH/2 - FRAME_W/2;
frame.y = SCREEN_HEIGHT/2 - FRAME_H/2;

// draw main cities
var main_cities = new PIXI.Sprite.fromImage('static/img/cities.png');
main_cities.alpha = CITY_ALPHA;
main_cities.pivot.x = 0;
main_cities.pivot.y = 0;

//
// Scene Graph
//

// create the root of the scene graph
var stage = new PIXI.Container();

// background container
var back_cont = new PIXI.Container();
// move container to the center
back_cont.position.x = SCREEN_WIDTH/2;
back_cont.position.y = SCREEN_HEIGHT/2;
// pivot around center
back_cont.pivot.x = MAP_W/2;
back_cont.pivot.y = MAP_H/2;

// front container
var front_cont = new PIXI.Container();
front_cont.position.x = SCREEN_WIDTH/2;
front_cont.position.y = SCREEN_HEIGHT/2;
front_cont.pivot.x = MAP_W/2;
front_cont.pivot.y = MAP_H/2;

// setup drawing z-order
stage.addChild(frame);
back_cont.addChild(map);
back_cont.addChild(main_cities);
stage.addChild(back_cont);
stage.addChild(shadow);
front_cont.addChild(spot);
front_cont.addChild(ticker);
stage.addChild(front_cont);
stage.addChild(local_ticker);

// register screen resize handler
var resizeTimer;

$(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(adapt_to_screen_size, 50);
});

// geolocation

function hide_geoalert() {
  // Show times display and hide alert
  var alert = document.getElementById("geoalert");
  alert.classList.add("display-none");
  var time_control = document.getElementById("time-control");
  time_control.classList.remove("display-none");
};

function show_geoalert() {
  // Show times display and hide alert
  var alert = document.getElementById("geoalert");
  alert.classList.remove("display-none");
  var time_control = document.getElementById("time-control");
  time_control.classList.add("display-none");
};

function success(pos) {
  var crd = pos.coords;
  change_position(crd.latitude, crd.longitude);
  hide_geoalert();
  GEOLOCATED = true;
};

function error(err) {
  var warning = 'ERROR('.concat(err.code).concat('): ').concat(err.message);
  console.warn(warning);
  show_geoalert();
  GEOLOCATED = false;
};

var options = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
};

function geolocate() {
    if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.getCurrentPosition(success, error, options);
        console.log("geolocating");
    }
};
// set default position
change_position(DEF_LAT, DEF_LON);
// try geolocating
//~ geolocate();

//
// Main Loop
//

function animate() {    
    requestAnimationFrame(animate);
    // create time representation
    var newFrame = +new Date;
    var diff = newFrame - lastFrame;
    var curr_sec = Math.round(newFrame/1000.0);
    
    // decorelate simulation time and real time
    if (ACCELERATED) {
        var t = frame_nb;
        //~ factor = bumpy(t, 1, 3000000, 500, 100); //year setting
        factor = bumpy(t, 1, 12000, 100, 20); // day setting
        simulTime = Math.round(simulTime + diff * factor);
    } else {
        simulTime = newFrame;
    }
    date = new Date;
    date.setTime(simulTime);
    lastFrame = newFrame;
    
    // update display after delay
    if (REAL_TIME || ASK_RENDER || ACCELERATED || curr_sec > flip_page + PAGE_DELAY) {
        flip_page = curr_sec;
        if (ASK_RENDER || ACCELERATED || curr_sec > flip_tick + TICK_DELAY) {
            flip_tick = curr_sec;
            // rotate tickers
            update_tickers(date);
        }
        if (ASK_RENDER || ACCELERATED || curr_sec > flip_shadow + SHADOW_DELAY) {
            flip_shadow = curr_sec;
            // load correct earth self-shadowing
            update_shadow(date);
        }
        if (ASK_RENDER) { ASK_RENDER = false; }
        // update time display
        update_time_display(date);
        
        // retry geolocating
        //~ if (!GEOLOCATED) {
            //~ geolocate();
        //~ }
        
        // responsivness
        adapt_to_screen_size();
        
        // render the root container
        renderer.render(stage);
        frame_nb += 1;
    }
}

var flip_page = 0;
var flip_tick = 0;
var flip_shadow = 0;
var frame_nb = 1;
var lastFrame = +new Date;
var simulTime = +new Date;
// start animating
//~ animate();
// initialize responsivness
adapt_to_screen_size();

// populate city list
function populate_cities_list() {
    var select = document.getElementById("city"); 
    for (c in SELECTED_CITIES) {
        var name = SELECTED_CITIES[c]["name"];
        var option = document.createElement("option");
        option.textContent = name;
        option.value = name;
        select.appendChild(option);
    }
};
populate_cities_list();


// add onclick event to geolocation activation button
var geo_button = document.getElementById("geolocation-activation");
geo_button.onclick = function(){
    geolocate();
    
};

// Translations
var language = document.cookie.match(/language=((\w{2,3})(-\w+)?)/);

if(language) language = language[1];

// Truncate language def to keep only two letter code
if (navigator.language.length > 2) {
    var nav_language = navigator.language.slice(0,2);
} else {
    var nav_language = navigator.language;
}

console.log("Detected languages ");
console.log([language, nav_language, navigator.userLanguage, 'en']);


html10n.bind('indexed', function() {
  html10n.localize([language, nav_language, navigator.userLanguage, 'en'])
})

html10n.bind('localized', function() {
  document.documentElement.lang = html10n.getLanguage()
  document.documentElement.dir = html10n.getDirection()
});

// Ending launch

console.log("JS app initialized");
