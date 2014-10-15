

function destroyObjects(){
	
	var parent = document.getElementById("list_gallery");

	for ( var j=0; j < app.parkingMetersFromOrion.length; j++)	{	
		var child = document.getElementById("friend_" + app.parkingMetersFromOrion[j].id );
		parent.removeChild(child);
	}
	var child = document.getElementById("XXXXX" );
	parent.removeChild(child);

	
	delete app.parkingMetersFromOrion ;

}

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
        app.currentPrice2pay = Math.floor(price);    	
}

function open_pay_pal(){
	
	fiwareDataAdapter.releasePlace(app.currentParkingID);
	
	alert( "the parking place with id:" + app.currentParkingID  + " is set as free");
		
	var jqxhr = $.post( 
						"http://www.instaltic.com/php/process.php", 
						{	
							"amount":  app.currentPrice2pay 							
						}							
						, function() { }
						, "text"
					);
							
	jqxhr.done(function(result) { 
								
								app.token = decodeURIComponent(result);
								var URL = "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout-mobile&token=" + app.token ;

								var ref = window.open(URL, '_blank', 'location=no');
								
								}
				);
	jqxhr.fail(function() { console.log( "DEBUG: error" ); });

		
}			

// onSuccess Callback of navigator.geolocation.getCurrentPosition 
//
function onSuccess_Current(position) {
try
{
    app.current_lat = position.coords.latitude;
    app.current_long = position.coords.longitude;
    

 	var lat = parseFloat(position.coords.latitude);
  	var lng = parseFloat(position.coords.longitude);
	var url2send = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' +lat  +"," + lng+ "&sensor=true";
	
	var geocoderXHR = $.ajax({
        url: url2send ,
        type: 'POST'
	});

	geocoderXHR.done(function(result){  	
		if (result.status == "OK") {
	    	if (result.results[1]) {	        
		        
		        app.current_address = result.results[0].formatted_address;	        

		        capture_sensor_data();
	     	}  
	     } else {
	        alert('Unable to get your GPS address');
	      }		
							
	});	
	geocoderXHR.fail(function(jqXHR, textStatus, errorString){
		console.log("DEBUG:::onSuccess_Current  ");	
	
	});
	  	
	  	
}
catch(err)
 {
 	console.log("DEBUG: captura el error dentro de onSuccess_Current:  " + err.message + '\n');
 }	
	
}
//
// onError Callback receives a PositionError object, navigator.geolocation.getCurrentPosition
//
function onError_Current(error) {
    console.log('DEBUG: on onError_Current code: ' + error.code + ' message: ' + error.message + '\n');    
}



function process_address() {
try{	
	var tus_options = {};
	tus_options.enableHighAccuracy = true;
	tus_options.maximumAge = 30000;
	tus_options.timeout = 60000;

	if(navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(
		    function(position) {				      	
				      	onSuccess_Current (position);    
				      	}, 
		    function() {  
		    			console.log("DEBUG: upss process_address");
						alert("Browser doesn't support Geolocation");
						}				  
	    );
	} else {	// Browser doesn't support Geolocation
		console.log("DEBUG: upss process_address");
		alert("Browser doesn't support Geolocation");
		}
	 }
	catch(err)
	 {
	 	console.log("DEBUG: catch  error process_address:  " + err.message + '\n');
	 }	
}
	

function router_to_widget (street2go,idParkingMeter)
{  	
	Lungo.Router.article("step3","widget");

	initialize();
	
	calcRoute({ start : app.current_address , end : street2go });
	
	fiwareDataAdapter.getPlace(idParkingMeter);
	app.currentParkingID = idParkingMeter;
	alert("Parking place is reserved for you on: \n" + street2go + "\n Paking place id: " + idParkingMeter);

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

function router_to_list() {
    var len = app.parkingMetersFromOrion.length;
	    
	if (len > 0 ){
		document.getElementById('list_gallery').innerHTML ='<li class="dark">	<strong >' + "Choose one of the following empty spots, Apparkart tells you how to get there" + '</strong>';
	} else 	{
		document.getElementById('list_gallery').innerHTML ='<li class="dark">	<strong >' +  "upss!! there is no empty spots" + '</strong>';
	}	
 
 		var newFriend = document.createElement('li');
		newFriend.id = 'XXXXX';			
		 
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
		{
		var newFriend = document.createElement('li');
		newFriend.id = 'friend_' + app.parkingMetersFromOrion[i].id ;			
		newFriend.setAttribute('class','thumb selectable arrow');
		newFriend.setAttribute('onclick','router_to_widget('+ "'" + app.parkingMetersFromOrion[i].Address + "','" + app.parkingMetersFromOrion[i].id +  "');" );
			
		var newFriend_img = document.createElement('img');
		newFriend_img.id = 'friend_img' + app.parkingMetersFromOrion[i].id ;
		newFriend_img.src = "img/GoToIcon.jpg";
	
		var newFriend_small = document.createElement('small');
		newFriend_small.id = 'friend_small' + app.parkingMetersFromOrion[i].id ;
		newFriend_small.innerHTML = "&nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  "+ app.parkingMetersFromOrion[i].numberOfFreePlaces + " empty places " + app.parkingMetersFromOrion[i].Distance ;
	
		var newFriend_strong = document.createElement('strong');
		newFriend_strong.id = 'friend_strong' + app.parkingMetersFromOrion[i].id ;
		newFriend_strong.innerHTML = app.parkingMetersFromOrion[i].Address;

		document.getElementById('list_gallery').appendChild(newFriend);
		document.getElementById(newFriend.id).appendChild(newFriend_img);
    	document.getElementById(newFriend.id).appendChild(newFriend_strong);
		document.getElementById(newFriend.id).appendChild(newFriend_small);
		}
    	
    }
    
    Lungo.Router.article("step2","gallery");	   
}




function capture_sensor_data(){

 var listOfParkings = fiwareDataAdapter.getParkingsInArea(app.current_lat,app.current_long,1000);
 listOfParkings.done(function (list){
 	 						console.log(JSON.stringify(list));

						for ( var j=0; j < list.length; j++)	{	
							if (parseInt(list[j].freePlaces) > 0 ){
								var parkingMetersFromOrionElement = new Object();
						    	var temp = list[j].position.split(",");					    	
								parkingMetersFromOrionElement.lat = temp[0];
								parkingMetersFromOrionElement.lon = temp[1];
								parkingMetersFromOrionElement.id  = list[j].id;
								parkingMetersFromOrionElement.numberOfFreePlaces = parseInt(list[j].freePlaces);
								parkingMetersFromOrionElement.AlgorithmPriority = list[j].priority;
								parkingMetersFromOrionElement.Address = "";
								parkingMetersFromOrionElement.Distance = "";																		
																														
								app.parkingMetersFromOrion.push(parkingMetersFromOrionElement);								
							}
						}
						if (list.length > 0 ){
							calculateDistances();	
						}else{
							alert("upps there is no parkingmeters around you ...1500 meters");
						}
												
					});	
}

function calculateDistances(){										
	
	 var originsArray = Array();
	 var destinationArray  = Array();
		originsArray[0] = new google.maps.LatLng(app.current_lat,app.current_long);
		for (j=0;j<app.parkingMetersFromOrion.length;j++){									
	    	destinationArray[j] = new google.maps.LatLng(app.parkingMetersFromOrion[j].lat, app.parkingMetersFromOrion[j].lon);
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
		
}


function callbackCalculateDistances(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    console.log('DEBUG: in callbackCalculateDistances Error was: ' + status);
  } else {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;

      for (var i = 0; i < destinations.length; i++) {      
	     if (google.maps.DistanceMatrixElementStatus.OK != response.rows[0].elements[i].status) {
	     	console.log( "DEBUG : in callbackCalculateDistances destinations:  " + google.maps.DistanceMatrixElementStatus.OK);          
	     }
	     else{
	           app.parkingMetersFromOrion[i].Distance =  response.rows[0].elements[i].distance.text ;
	           app.parkingMetersFromOrion[i].DistaceNum = response.rows[0].elements[i].distance.value;
	           app.parkingMetersFromOrion[i].Address = destinations[i];
	           app.parkingMetersFromOrion[i].status = google.maps.DistanceMatrixElementStatus.OK;
	     }				
     }
    machinelearning();
    router_to_list();
  }
}

function machinelearning()
{	
	app.parkingMetersFromOrion.sort(function (a, b) {
									  if (a.DistaceNum < b.DistaceNum && a.AlgorithmPriority <= b.AlgorithmPriority ) {
									    return -1;
									  } else{
									  	return 1;
									  }	
									  return 0;								  
									});			
}


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // app atributtes
    currentParkingID : function() {},
    currentPrice2pay : function() {},     
    parkingMetersFromOrion: function() {},    
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
    },       
    current_selected_object_id :  function() {},
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    
        document.addEventListener('menubutton', function(){Lungo.View.Aside.toggle("#features");} , false);
        document.addEventListener('searchbutton', function(){}, false);
        document.addEventListener('startcallbutton', tap_on_exit, false);
        document.addEventListener('endcallbutton', tap_on_exit, false);
        
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
			app.parkingMetersFromOrion =  new Array(); 			
			
			process_address();
			
			//launch HMI				 
			Lungo.Router.section("main"); 

			
	     }
	     catch(err)
	     {
	     }	
    }    
};