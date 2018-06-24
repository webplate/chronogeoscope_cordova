/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        // Initialize and launch my app
        
        // Detect first time launch
        var applaunchCount = window.localStorage.getItem('launchCount');
        //Check if it already exists or not
        if(applaunchCount){
            //This is a second time launch, and count = applaunchCount
            geolocate();
            hide_geoalert();
            animate();
        }else{
            //Local storage is not set, hence first time launch. set the local storage item
            window.localStorage.setItem('launchCount',1);
            
            //Do the other stuff related to first time launch
            console.log('First time launch')
            show_geoalert();
            animate();
        }
    },
    // Retry geolocating on resume
    onResume: function() {
        console.log('resuming');
        geolocate();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //~ var parentElement = document.getElementById(id);
        //~ var listeningElement = parentElement.querySelector('.listening');
        //~ var receivedElement = parentElement.querySelector('.received');

        //~ listeningElement.setAttribute('style', 'display:none;');
        //~ receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
