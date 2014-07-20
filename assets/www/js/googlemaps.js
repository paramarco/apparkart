 var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;
  var oldDirections = [];
  var currentDirections = null;
  
  var geocoder;
  
  var infowindow = new google.maps.InfoWindow();
  var marker;
  geocoder = new google.maps.Geocoder();
  
  function initialize() {
	 
	//TODO  OJOJOJOJOJOJOJOJ que está definido para mapa de direcciones, hay que poner globitos
	
    var myOptions = {
      zoom: 12,
      center: new google.maps.LatLng("40.33333","-3.234324"),
      mapTypeId: google.maps.MapTypeId.ROADMAP
      
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    directionsDisplay = new google.maps.DirectionsRenderer({
        'map': map,
        'preserveViewport': true,
        'draggable': false
    });
    directionsDisplay.setPanel(document.getElementById("directions_panel"));

    google.maps.event.addListener(directionsDisplay, 'directions_changed',
      function() {
        if (currentDirections) {
          oldDirections.push(currentDirections);
          setUndoDisabled(false);
        }
        currentDirections = directionsDisplay.getDirections();
      });

    setUndoDisabled(true);

    //calcRoute();
  }

  function calcRoute(route) {

	var start = route.start;
	var end = route.end;
		  
	  
    console.log ("DEBUG: OJO !!! todo esto hay que cambiarlo para pasarlo a globos"  );
    
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }

  function undo() {
    currentDirections = null;
    directionsDisplay.setDirections(oldDirections.pop());
    if (!oldDirections.length) {
      setUndoDisabled(true);
    }
  }

  function setUndoDisabled(value) {
    document.getElementById("undo").disabled = value;
  }  
	
	
