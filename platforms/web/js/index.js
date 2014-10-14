

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
	
	Lungo.Router.article("step3","checkout");
	
	var jqxhr = $.post( 
						"http://www.instaltic.com/php/process.php", 
						{	
							"amount":  app.currentPrice2pay 							
						}							
						, function() { }
						, "text"
					);
							
	jqxhr.done(function(result) { 
								
								console.log( "DEBUG: devuelve SetExpressCheckout : " + decodeURIComponent(result) );
 
								app.token = decodeURIComponent(result);
								var URL = "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout-mobile&token=" + app.token ;

								var ref = window.open(URL, '_blank', 'location=no');
								
								//DEBUG llamada a API para encender luz
								alert("llamada a encender luz");
							
								ref.addEventListener('loadstop', function(event) {        
																				    if (event.url.match("mobile/close")) {
																				    	ref.close();
																				        
																				        
																				    }
																				});
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
		        
		        console.log( "DEBUG: en onSuccess_Current" + app.current_address);
		        
		        capture_sensor_data();
	     	}  
	     } else {
	        alert('Unable to get your GPS address');
	      }		
							
	});	
	geocoderXHR.fail(function(jqXHR, textStatus, errorString){
		console.log("DEBUG:::onSuccess_Current hizo la llamada a geocoder correctamente ");	
	
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
    console.log('DEBUG: en onError_Current code: ' + error.code + ' message: ' + error.message + '\n');    
}



function process_address() {
try{	
	var tus_options = {};
	tus_options.enableHighAccuracy = true;
	tus_options.maximumAge = 30000;
	tus_options.timeout = 60000;

	//navigator.geolocation.getCurrentPosition( onSuccess_Current , onError_Current, tus_options );
	if(navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(
		    function(position) {				      	
				      	onSuccess_Current (position);    
				      }, 
		    function() {  
		    			console.log("DEBUG: upss process_address");
	    				var position = { coords : {
														  latitude : "28",
														  longitude : "-15.35"
														  }
												 };
					 	onSuccess_Current (position);
					  }				  
	    );
	} else {	// Browser doesn't support Geolocation
		var position = { coords : {
								  	latitude : "28",
									longitude : "-15.35"
								  }
					  };
			onSuccess_Current (position );

		}
	 }
	catch(err)
	 {
	 	console.log("DEBUG: cazó el error dentro de process_address:  " + err.message + '\n');
	 }	
}

	

//Lungo.Router.article("step3","widget");
function router_to_widget (street2go)
{  	
	Lungo.Router.article("step3","widget");

	initialize();
	
	calcRoute({ start : app.current_address , end : street2go });
	
	//DEBUG llamada a apagar la luz
	

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

/*	//send POST to server
	var updateXHR = $.ajax({
        url: 'http://127.0.0.1:8090',
        type: 'POST',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
            xhr.setRequestHeader("Accept","application/json;");
        },
        data:  JSON.stringify(query2Server) ,
        async: false, // syncronous
		cache: false // does not use cache
	});

	updateXHR.done(function(result){
		
		for ... {		
			var parkingMetersFromOrionElement = new Object();
			parkingMetersFromOrionElement.lat ="28";
			parkingMetersFromOrionElement.lon ="-15.35";
			parkingMetersFromOrionElement.numberOfFreePlaces = "3";
			parkingMetersFromOrionElement.AlgorithmPriority = "4";
			parkingMetersFromOrionElement.Address = "tomas del torrro";
			parkingMetersFromOrionElement.Distance = "4";
														
																									
			app.parkingMetersFromOrion.push(parkingMetersFromOrionElement);
		}
		
		
		
		  	
		calculateDistances();					
	});	
	updateXHR.fail(function(jqXHR, textStatus, errorString){		
		
	});
	*/
	calculateDistances();
	
}

function calculateDistances(){


	var parkingMetersFromOrionElement = new Object();
	parkingMetersFromOrionElement.lat ="28";
	parkingMetersFromOrionElement.lon ="-15.35";
	parkingMetersFromOrionElement.numberOfFreePlaces = "3";
	parkingMetersFromOrionElement.AlgorithmPriority = "4";
	parkingMetersFromOrionElement.Address = "tomas del torrro";
	parkingMetersFromOrionElement.Distance = "4";
												
																							
	app.parkingMetersFromOrion.push(parkingMetersFromOrionElement);
													
													
	
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
		
}


function callbackCalculateDistances(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    console.log('DEBUG: en callbackCalculateDistances Error was: ' + status);
  } else {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;

      for (var i = 0; i < destinations.length; i++) {      
	     if (google.maps.DistanceMatrixElementStatus.OK != response.rows[0].elements[i].status) {
	     	console.log( "DEBUG : en callbackCalculateDistances destinations:  " + google.maps.DistanceMatrixElementStatus.OK);          
	     }
	     else{
	           app.parkingMetersFromOrion[i].Distance =  response.rows[0].elements[i].distance.text ;
	           app.parkingMetersFromOrion[i].DistaceNum = response.rows[0].elements[i].distance.value;
	           app.parkingMetersFromOrion[i].Address = destinations[i];
	           app.parkingMetersFromOrion[i].status = google.maps.DistanceMatrixElementStatus.OK;
	     }				
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


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // app atributtes
    
    currentPrice2pay : function() {},     
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
			app.parkingMetersOrdered = new Array();
			app.parkingMetersFromOrion =  new Array(); 			
			
			process_address();
			
			//launch HMI				 
			Lungo.Router.section("main"); 

			
	     }
	     catch(err)
	     {
	     	console.log("DEBUG: captura el error dentro de receivedEvent:  " + err.message + '\n');
	     }	
    }    
};