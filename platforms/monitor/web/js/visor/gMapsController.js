"use strict";
var GMapsController = (function () {
     
        var map        = undefined;
        var infowindow = new google.maps.InfoWindow({content:""}); 

        var activeControl = undefined,
            markers       = [],
            activeMarker  = undefined;

          function addControl(text, onclickCallBack) {
                   
              var text = document.createTextNode(text);
              var div = document.createElement("div");
              var defaultControlClass = "controls";
              var defaultActiveClass = "active";

              div.className = defaultControlClass;
              div.appendChild(text);

              if(onclickCallBack !== undefined)
                  div.onclick =  (function(tempCallBack) {
                      return function() {
                          //unmark previous control 
                          if(activeControl!==undefined && activeControl!== div){
                              activeControl.className = defaultControlClass;
                          }

                          div.className = defaultControlClass + " " +defaultActiveClass;                            
                          activeControl = div;

                          tempCallBack();
                      };
                  })(onclickCallBack);

              map.controls[google.maps.ControlPosition.TOP_LEFT].push(div);
        }
   
        function putMarker(markerData, markerIcon) {
            
            var coords = markerData.position.split(",");

            var markerOptions = {
                position : new google.maps.LatLng(coords[0],coords[1]),
                map      : map,
                zIndex   : 0,
                title    : 'Show information about '+markerData.id
            };
            
            if (markerIcon) markerOptions.icon = markerIcon;
            return new google.maps.Marker(markerOptions);
        }

 
        function removeMarker(marker) {
            marker.setMap(null);    
        }

        function addListenerToMarker(marker,type,callBack){
            google.maps.event.addListener(marker, type, callBack);
        }

        function fitBoundsToMarkers(markers) {

            var bounds = new google.maps.LatLngBounds();
            for (var i=0; i<markers.length; i++) {
                bounds.extend( markers[i].getPosition() );
            }
            
            map.fitBounds(bounds);

            var northEast = bounds.getNorthEast();
            var southWest = bounds.getSouthWest();

            return {
                  center    : bounds.getCenter(), 
                  northEast : northEast,
                  southWest : southWest,
                  radius    : google.maps.geometry.spherical.computeDistanceBetween(northEast,southWest)/2
            };
        }

        function showMarkerInfoWindow(marker,content,domReadyCallBack){
            infowindow.setContent(content);
            infowindow.open(map,marker);
                  
            if(domReadyCallBack !== undefined)
                google.maps.event.addListenerOnce(infowindow,'domready',domReadyCallBack);
        }
    
        function addCircleArea(center,radius){
            var areaOptions = {
               strokeColor   : '#3399CC',
               strokeOpacity : 0.8,
               strokeWeight  : 2,
               fillColor     : '#66CCFF',
               fillOpacity   : 0.1,
               map           : map,
               center        : center,
               radius        : radius
             };
            
              return new google.maps.Circle(areaOptions);
        }

        function removeCircleArea(circle) {
            circle.setMap(null);    
        }
    
        function setCanvas(canvasID, position){
            var coords = position.split(",");
            map = new google.maps.Map(document.getElementById(canvasID),{
                zoom   : 10, 
                center : new google.maps.LatLng(coords[0],coords[1])
            });
        }

        return {
            setCanvas            : setCanvas,
            addControl           : addControl,
            putMarker            : putMarker,
            removeMarker         : removeMarker,
            addCircleArea        : addCircleArea,
            removeCircleArea     : removeCircleArea,
            addListenerToMarker  : addListenerToMarker,
            showMarkerInfoWindow : showMarkerInfoWindow,
            fitBoundsToMarkers   : fitBoundsToMarkers
        };
 
    })();