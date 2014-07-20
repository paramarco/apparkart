/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function budget() {	
	var price;
	var number_hours = parseInt($("#number_hours").val()); 
	switch(number_hours) {
            case 1 :                
                price = 1.5;
                break;
            case 2 :
                
                price = 3;
                break;
            case 3 :
                price = 4.5;
                break;
            case 4 :
                price = 6;
                break;
                    
            default :
                console.log("DEBUG :: Unhandled budget :: ");
                break;
        }
        
        $('#price_amount').html(Math.floor(price) + "\u20AC");
        	
}
  



function open_pay_pal(){
	
	Lungo.Router.article("step3","checkout");
	
	
	
	var jqxhr = $.post( 
							"http://www.instaltic.com/process.php", 
							{	
								"amount":  	$('#price_amount').html(Math.floor(price))							
							}							
							, function() { }
							, "text"
					);
							
	jqxhr.done(function(result) { 
								
								console.log( "DEBUG: devuelve SetExpressCheckout : " + decodeURIComponent(result) );
								
 
								app.token = decodeURIComponent(result);
								var URL = "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout-mobile&token=" + app.token ;

								var ref = window.open(URL, '_blank', 'location=no');
							
								ref.addEventListener('loadstop', function(event) {        
																				    if (event.url.match("mobile/close")) {
																				        ref.close();
																				        //aqui ir a otra pagina local
																				    }
																				});
								}
				);
	jqxhr.fail(function() { console.log( "DEBUG: error" ); });
	jqxhr.always(function() { console.log( "DEBUG: complete paypal " );  });
		
}			

// onSuccess Callback of navigator.geolocation.getCurrentPosition 
//
function onSuccess_Current(position) {
	try
	{
	console.log( "DEBUG :  llego a onSuccess_Current" );
    app.current_lat = position.coords.latitude;
    app.current_long = position.coords.longitude;
    console.log( "DEBUG :  llego con valores: " + position.coords.latitude );
    console.log( "DEBUG :  llego con valores: " + position.coords.longitude );

		var lat = parseFloat(position.coords.latitude);
  		var lng = parseFloat(position.coords.longitude);
	  	var latlng = new google.maps.LatLng(lat, lng);
	  
	  geocoder.geocode({'latLng': latlng}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	      if (results[1]) {	        
	        
	        app.current_address = results[0].formatted_address;	        
	        
	        console.log( "DEBUG: en onSuccess_Current" + app.current_address);
	        
	        capture_sensor_data();
	        
	      } else {
	        alert('Unable to get your GPS address');
	      }
	    } else {
	      alert('Geocoder failed in onSuccess_Current due to: ' + status);
	    }
	  });	
	  
	  }
	catch(err)
	 {
	 	console.log("DEBUG: cazó el error dentro de onSuccess_Current:  " + err.message + '\n');
	 }	
	
}
//
// onError Callback receives a PositionError object, navigator.geolocation.getCurrentPosition
//
function onError_Current(error) {
    console.log('DEBUG: en onError_Current code: ' + error.code + ' message: ' + error.message + '\n');    
}



function process_address() {
	try{	
		var tus_options = {};
		tus_options.enableHighAccuracy = true;
		tus_options.maximumAge = 30000;
		tus_options.timeout = 60000;

		navigator.geolocation.getCurrentPosition( onSuccess_Current , onError_Current, tus_options );

		// var position = { coords : {
									 // latitude : "-23.549433",
									 // longitude : "-46.633193"
									 // }
					 // };
		// onSuccess_Current (position);
	 }
	catch(err)
	 {
	 	console.log("DEBUG: cazó el error dentro de process_address:  " + err.message + '\n');
	 }	
}

// Populate the database 
//
function createDB(tx) {
	    
    tx.executeSql('CREATE TABLE IF NOT EXISTS "PARKING_ADDRESS" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, "address", "numberOfEmptySpot")');
}

// Populate the database 
    
function insertDB(tx) {
     tx.executeSql(
         	'INSERT INTO PARKING_ADDRESS (address, numberOfEmptySpot ) VALUES ("' 
         	+ app.current_mediaFile.address + '","' +  app.current_mediaFile.numberOfEmptySpot + '")' );
}
// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT * FROM PARKING_ADDRESS', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    //console.log("DEBUG: DEMO table: " + len + " rows found.");

	    
	if (len > 0 )  
		{document.getElementById('list_gallery').innerHTML ='<li class="dark">	<strong >' + "Choose one of the following empty spots, Apparkart tells you how to get there" + '</strong>';}
	else
		{document.getElementById('list_gallery').innerHTML ='<li class="dark">	<strong >' +  "upss!! there is no empty spots" + '</strong>';}	
 
 		var newFriend = document.createElement('li');
		newFriend.id = 'friend_0';			
		 
		var newFriend_small = document.createElement('small');
		newFriend_small.id = 'friend_small_0' ;
		newFriend_small.innerHTML = "I detect your current location as: " ;
		
		var newFriend_strong = document.createElement('strong');
		newFriend_strong.id = 'friend_strong_0';
		newFriend_strong.innerHTML = app.current_address;
		
		document.getElementById('list_gallery').appendChild(newFriend);
		document.getElementById(newFriend.id).appendChild(newFriend_small);
		document.getElementById(newFriend.id).appendChild(newFriend_strong);
		
    for (var i=0; i<len; i++){
		
		var newFriend = document.createElement('li');
		newFriend.id = 'friend' + i;			
		newFriend.setAttribute('class','thumb selectable arrow');
		newFriend.setAttribute('onclick','router_to_widget('+ "'" + results.rows.item(i).address + "'" + ');' );
		
		
		var newFriend_img = document.createElement('img');
		newFriend_img.id = 'friend_img' + i;
		newFriend_img.src = "img/GoToIcon.jpg";
	
		var newFriend_small = document.createElement('small');
		newFriend_small.id = 'friend_small' + i;
		newFriend_small.innerHTML = "&nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  "+ results.rows.item(i).numberOfEmptySpot + " empty places " ;
		
		var newFriend_strong = document.createElement('strong');
		newFriend_strong.id = 'friend_strong' + i;
		newFriend_strong.innerHTML = results.rows.item(i).address;
		
		
		document.getElementById('list_gallery').appendChild(newFriend);
		document.getElementById(newFriend.id).appendChild(newFriend_img);
    	document.getElementById(newFriend.id).appendChild(newFriend_strong);
		document.getElementById(newFriend.id).appendChild(newFriend_small);
    	
    }
    
    Lungo.Router.article("step2","gallery");
			
    
}

function router_to_gallery()
{
	var db2 = window.openDatabase("Apparkart_Database", "1.0", "Apparkart_Database", 200000);
    db2.transaction(queryDB, function(){} ,errorCB);
	//Lungo.Router.article("step2","gallery");		
}



		

//Lungo.Router.article("step3","widget");
function router_to_widget (street2go)
{  	
	//console.log("DEBUG: en router to widget: " + app.current_address + street2go );
		
	initialize();
	
	var route = { start : app.current_address , end : street2go };
	calcRoute(route);
	
	Lungo.Router.article("step3","widget");

	
	//var ref = window.open(URL, '_blank', 'location=no');
	
	

}

function query_for_retreive(tx)
{
	tx.executeSql('SELECT * FROM PARKING_ADDRESS WHERE id=' + app.current_selected_object_id, [], go_to_widget, errorCB);             
}



// Transaction error callback
//
function errorCB(err) {
    console.log("DEBUG: entro por donde no debe: " + err.code);
       if (app.flag_go_to_gallery == true )
    {
    	router_to_gallery();
    }
}
  
// Transaction success callback
//
function successCB() {
    //var db = window.openDatabase("Apparkart_Database", "1.0", "Apparkart_Database", 200000);
    //db.transaction(queryDB, errorCB);
    if (app.flag_go_to_gallery == true )
    {
    	router_to_gallery();
    	
    }
}
    

function compra(){
try
{
	/*var transmission = $.getJSON(	'http://www.instaltic.com/Bootstrap_make_it.php', 
									{'num1': 12, 'num2': 27} , 	
									function(e) { app.current_service_token = e.result ; 		}
								); 
		
	transmission.done(function() { 	
								google.sments.inapp.buy({
														    'jwt'     : app.current_service_token ,
														    'success' : successHandler,
														    'failure' : failureHandler
						 		 						}); */
						 		 						
						 		 						$('#price_amount').html("300€");
						 		 						
						 		 						
	// Global InAppBrowser reference
    var iabRef = window.open('http://www.instaltic.com/Bootstrap_make_it.php', '_system', 'location=no');
							    //iabRef.addEventListener('loadstop', replaceHeaderImage);
							    
							     	/* $.post(	'http://www.instaltic.com/postback_make_it.php', 
												{'jwt': app.current_service_token } , 	
												function(e) { console.log("DEBUG :: devuelve " + e ); 		},
												"text"
												); 		*/			
		/*				 		 						
						 		 }
					 );
		
	transmission.fail(function() { console.log( "DEBUG: trying to retrieve JSON" ); });
	transmission.always(function() { 
		console.log( "DEBUG: complete wallet" );
		
	 }); */

}
catch(err)
 {
 	console.log("DEBUG: cazó el error dentro de process_address:  " + err.message + '\n');
 }	 
   
}


function exitFromApp(buttonIndex) {	if (buttonIndex==2){  navigator.app.exitApp();	}}
		
function tap_on_exit(){
	navigator.notification.confirm(
								    "Do you want to exit ?",  // message
								    exitFromApp,              // callback to invoke with index of button pressed
								    "Exit",            // title
								    "Cancel , Accept"         // buttonLabels
								    );
}

//DEBUG
function populate() {
    var db = window.openDatabase("Apparkart_Database", "1.0", "Apparkart_Database", 200000);
	db.transaction(populateDB, errorCB, successCB);
}
function populateDB(tx) {
     //tx.executeSql('DROP TABLE IF EXISTS PARKING_ADDRESS');
     tx.executeSql('CREATE TABLE IF NOT EXISTS "PARKING_ADDRESS" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE, "address", "numberOfEmptySpot")');
   //console.log ("DEBUG llega a instar:" + app.var_address_parking);
	 tx.executeSql(
	         	'INSERT INTO PARKING_ADDRESS (address, numberOfEmptySpot ) VALUES ("' 
	         	+ app.var_address_parking + '","' +  "3" + '")' );
	 
}

//recive var parkingMetersFromOrionElement = new Object();
// parkingMetersFromOrionElement.lat ="";
// parkingMetersFromOrionElement.lon ="";
// parkingMetersFromOrionElement.numberOfFreePlaces = "";
// parkingMetersFromOrionElement.AlgorithmPriority = "";
// parkingMetersFromOrionElement.Address = "";	
function get_address_name (indiceArray){

	  var lat = parseFloat(app.parkingMetersFromOrion[indiceArray].lat);
	  var lng = parseFloat(app.parkingMetersFromOrion[indiceArray].lon );	
  
	  
	 var latlng = new google.maps.LatLng(lat, lng);
	  
	  geocoder.geocode({'latLng': latlng}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	      if (results[1]) {	        
	        
				var dir = results[0].formatted_address.split(',');
				app.parkingMetersFromOrion[indiceArray].Address = dir[0] + ", " + dir[1];	
	  		  
				  if (indiceArray == app.parkingMetersFromOrion.length-1)
			  {		router_to_list();
			  }
	        
	      } else {
	        alert('No results found');
	      }
	    } else {
	      alert('Geocoder failed due to: ' + status);
	    }
	  });

	
}

//
function router_to_list() {
    var len = app.parkingMetersFromOrion.length;
   //var len = app.parkingMetersOrdered.length;    
	    
	if (len > 0 )  
		{document.getElementById('list_gallery').innerHTML ='<li class="dark">	<strong >' + "Choose one of the following empty spots, Apparkart tells you how to get there" + '</strong>';}
	else
		{document.getElementById('list_gallery').innerHTML ='<li class="dark">	<strong >' +  "upss!! there is no empty spots" + '</strong>';}	
 
 		var newFriend = document.createElement('li');
		newFriend.id = 'friend_0';			
		 
		var newFriend_small = document.createElement('small');
		newFriend_small.id = 'friend_small_0' ;
		newFriend_small.innerHTML = "I detect your current location as: " ;
		
		var newFriend_strong = document.createElement('strong');
		newFriend_strong.id = 'friend_strong_0';
		newFriend_strong.innerHTML = app.current_address;
		
		document.getElementById('list_gallery').appendChild(newFriend);
		document.getElementById(newFriend.id).appendChild(newFriend_small);
		document.getElementById(newFriend.id).appendChild(newFriend_strong);
		
    for (var i=0; i<len; i++){
		if (app.parkingMetersFromOrion[i].status == google.maps.DistanceMatrixElementStatus.OK)
		//if (app.parkingMetersOrdered[i].status == google.maps.DistanceMatrixElementStatus.OK)
		{
		var newFriend = document.createElement('li');
		newFriend.id = 'friend' + i;			
		newFriend.setAttribute('class','thumb selectable arrow');
		newFriend.setAttribute('onclick','router_to_widget('+ "'" + app.parkingMetersFromOrion[i].Address + "'" + ');' );
		//newFriend.setAttribute('onclick','router_to_widget('+ "'" + app.parkingMetersOrdered[i].Address + "'" + ');' );		
		var newFriend_img = document.createElement('img');
		newFriend_img.id = 'friend_img' + i;
		newFriend_img.src = "img/GoToIcon.jpg";
	
		var newFriend_small = document.createElement('small');
		newFriend_small.id = 'friend_small' + i;
		newFriend_small.innerHTML = "&nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  "+ app.parkingMetersFromOrion[i].numberOfFreePlaces + " empty places " + app.parkingMetersFromOrion[i].Distance ;
		//newFriend_small.innerHTML = "&nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  "+ app.parkingMetersOrdered[i].numberOfFreePlaces + " empty places " + app.parkingMetersOrdered[i].Distance ;
		var newFriend_strong = document.createElement('strong');
		newFriend_strong.id = 'friend_strong' + i;
		newFriend_strong.innerHTML = app.parkingMetersFromOrion[i].Address;
		//newFriend_strong.innerHTML = app.parkingMetersOrdered[i].Address;
		document.getElementById('list_gallery').appendChild(newFriend);
		document.getElementById(newFriend.id).appendChild(newFriend_img);
    	document.getElementById(newFriend.id).appendChild(newFriend_strong);
		document.getElementById(newFriend.id).appendChild(newFriend_small);
		}
    	
    }
    
    Lungo.Router.article("step2","gallery");	   
}




function capture_sensor_data(){

		console.log( "DEBUG :  llego a capture_sensor_data" );

var contentTypeRequest = $.ajax({
    	url: 'http://130.206.83.60:1026/NGSI10/queryContext',
    	data: '<?xml version="1.0" encoding="UTF-8"?><queryContextRequest><entityIdList><entityId type = "ParkingMeter" isPattern="true"><id>ParkingMeter*</id> </entityId> </entityIdList> <attributeList> <attribute>lat</attribute><attribute>lon</attribute><attribute>numberOfFreePlaces</attribute><attribute>AlgorithmPriority</attribute></attributeList>	</queryContextRequest>   ',
		type: 'POST',
		dataType: 'xml',
    	contentType: 'application/xml'		
	});
		//headers: { 'X-Auth-Token' : app.current_service_token }
				
	contentTypeRequest.done(function(xml){ 
			
		$(xml).find('contextElement').each(function(){
																									
													var parkingMetersFromOrionElement = new Object();
													parkingMetersFromOrionElement.lat ="";
													parkingMetersFromOrionElement.lon ="";
													parkingMetersFromOrionElement.numberOfFreePlaces = "";
													parkingMetersFromOrionElement.AlgorithmPriority = "";
													parkingMetersFromOrionElement.Address = "";
													parkingMetersFromOrionElement.Distance = "";
													
													$(this).find('contextAttribute').each(function(){
														if ( $(this).find('name').text() == "lat")
														{	parkingMetersFromOrionElement.lat = $(this).find('contextValue').text();
														}
														
														if ( $(this).find('name').text() == "lon" )
														{	parkingMetersFromOrionElement.lon = $(this).find('contextValue').text();
														}
														
														if ( $(this).find('name').text() == "numberOfFreePlaces" )
														{	parkingMetersFromOrionElement.numberOfFreePlaces = $(this).find('contextValue').text();	}
														
														if ( $(this).find('name').text() == "AlgorithmPriority" )
														{	
															parkingMetersFromOrionElement.AlgorithmPriority = $(this).find('contextValue').text();	
														}
													});																		
													 app.parkingMetersFromOrion.push(parkingMetersFromOrionElement);
   
													});
													
	
	 var originsArray = Array();
	 var destinationArray  = Array();
		//for (j=0;j<app.parkingMetersFromOrion.length;j++)
		originsArray[0] = new google.maps.LatLng(app.current_lat,app.current_long);
		for (j=0;j<app.parkingMetersFromOrion.length;j++)
		{									
	    		destinationArray[j] = new google.maps.LatLng(app.parkingMetersFromOrion[j].lat, app.parkingMetersFromOrion[j].lon);
	    		//originsArray[j] = new google.maps.LatLng(app.current_lat,app.current_long);    		
	    }
	

		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix(
		    {
		      origins: originsArray,
		      destinations: destinationArray,
		      travelMode: google.maps.TravelMode.DRIVING,
		      unitSystem: google.maps.UnitSystem.METRIC,
		      avoidHighways: false,
		      avoidTolls: false
		    }, callbackCalculateDistances);
	
						
				
	});			

	contentTypeRequest.fail(function(jqXHR, textStatus){     
		console.log( "DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText + ")." );
		alert("DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText + ")." );
	});
	contentTypeRequest.always(function(jqXHR, textStatus){     
		//console.log( "DEBUG :   ALWAYS AJAX" );
	});

}


function callbackCalculateDistances(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    alert('DEBUG: Error was: ' + status);
    console.log('DEBUG: en callbackCalculateDistances Error was: ' + status);
  } else {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;

     console.log('DEBUG: en callbackCalculateDistances origins.length: ' + origins.length);
     console.log('DEBUG: en callbackCalculateDistances destinations.length: ' + destinations.length);

      for (var i = 0; i < destinations.length; i++) {      
		     if (google.maps.DistanceMatrixElementStatus.OK != response.rows[0].elements[i].status)
		     {
		     	console.log( "DEBUG : en callbackCalculateDistances destinations:  " + google.maps.DistanceMatrixElementStatus.OK);          
		     }
		     else{
		           app.parkingMetersFromOrion[i].Distance =  response.rows[0].elements[i].distance.text ;
		           app.parkingMetersFromOrion[i].DistaceNum = response.rows[0].elements[i].distance.value;
		           app.parkingMetersFromOrion[i].Address = destinations[i];
		           app.parkingMetersFromOrion[i].status = google.maps.DistanceMatrixElementStatus.OK;
		     }				
			console.log( "DEBUG : en callbackCalculateDistances destinations:  " + destinations[i]);          
     }
    //machinelearning();
    router_to_list();
  }
}

function machinelearning()
{
			for(var j = app.parkingMetersFromOrion.length - 1; j >= 0; j--) {
			   var min = 9999999;
				var indexOfMin;
				for (i=0;i<app.parkingMetersFromOrion.length;i++)
				{
					var aux = app.parkingMetersFromOrion[i].DistaceNum ;
					if (aux < min)
					{
						min = aux;
						indexOfMin = i;						
					}
				}
				app.parkingMetersOrdered.push(app.parkingMetersFromOrion[indexOfMin]);
				app.parkingMetersFromOrion.splice(indexOfMin, 1);
			}
				
			
			
			
}


function clean_database() {
    var db = window.openDatabase("Apparkart_Database", "1.0", "Apparkart_Database", 200000);
	db.transaction(cleanDB, cleanDB, cleanDB);
}
function cleanDB(tx) {
     tx.executeSql('DROP TABLE IF EXISTS PARKING_ADDRESS');
}



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // app atributtes    
    parkingMetersFromOrion: function() {},
   
    parkingMetersOrdered: function() {},

    
    current_mediaFile: function() {},
    
    current_time: function() {},
    
    current_service_token: function() {},
    var_address_parking : function() {},
    
    current_lat: function() {},
    current_long: function() {},
    current_address: function() {},
    flag_go_to_gallery : function() {},
    
    token : function() {},    
    
    get_current_time:  function() {
    	navigator.globalization.dateToString(
        new Date(),
        function (date) {	app.current_time = date.value;  	},
        function () 	{	console.log('DEBUG : Error getting dateString\n'); },
         {formatLength:'short', selector:'date and time'}
      );
     return app.current_time;	
    }    , 
       
    current_selected_object_id :  function() {},
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    
        //document.addEventListener('backbutton', tap_on_exit, false);
        document.addEventListener('menubutton', function(){Lungo.View.Aside.toggle("#features");} , false);
        document.addEventListener('searchbutton', function(){}, false);
        document.addEventListener('startcallbutton', tap_on_exit, false);
        document.addEventListener('endcallbutton', tap_on_exit, false);
        //document.addEventListener("pause", tap_on_exit, false);
        
        document.addEventListener('backbutton', function(){ 	Lungo.View.Aside.hide("#features"); }, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent();
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
       // Now safe to use the Cordova API
		try{	
			

		  	app.current_service_token = 'oqtkQeq1676bNAi9Dqdac5wISVFVSAy6VMmeRWCHRM8254kovDFxcSEbrPwyS_VNaalOXwkRMcTMn75BZ6sSIA';	
				
			app.parkingMetersOrdered = new Array();
			app.parkingMetersFromOrion =  new Array(); 			
			
			process_address();
			
			//launch HMI				 
			Lungo.Router.section("main"); 

			
	     }
	     catch(err)
	     {
	     	console.log("DEBUG: cazó el error dentro de receivedEvent:  " + err.message + '\n');
	     }	
    }    
};