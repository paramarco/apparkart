"use strict";
var visor = (function () {
    
    var markers         = [];
    var circleArea      = undefined;
    var actualControlID = "";
    var currentMarker   = { id:undefined, marker:undefined };
    var _dataAdapter;
    var _notifier;

    function putParkingMarkers(makersData){       
        markers = [];
        
        if(circleArea!=undefined)
            GMapsController.removeCircleArea(circleArea);

        var keys = Object.keys(makersData);

        for (var i = 0, n=keys.length; i < n; i++) {

            var data   = makersData[keys[i]];
            var marker = GMapsController.putMarker(data,"img/markerIcons/parking-meter.png");

            markers.push(marker);

            GMapsController.addListenerToMarker(marker,'click',(function(_marker,_data){
                return function(){
                    currentMarker.id     = _data.id;
                    currentMarker.marker = _marker;
                    showMaker(_marker,_data);
                }
            })(marker,data));
        }
        
        var bounds = GMapsController.fitBoundsToMarkers(markers);
    }

    function showMaker(marker,data){
        GMapsController.showMarkerInfoWindow(
            marker,
            infoWindowParkingTemplate.fillTemplate(data),
            function(){
                infoWindowParkingTemplate.addListenerToFreePlacesRange(data.id,function(){
                    var freePlaces = this.value;
                    _dataAdapter.updateFreePlaces(data.id,this.value).done(function() {
                        data.freePlacesValue = freePlaces;
                    });
                });
            }
        );
    }

    function updateParkingData(parkingsData, data){
        parkingsData[data.id].freePlaces = data.freePlaces;

        if(currentMarker.id === data.id){               
            showMaker(currentMarker.marker, parkingsData[data.id]);
        }
    }
    
    function run(dataAdapter, notifier){
         //load data
        _dataAdapter = dataAdapter;
        _notifier    = notifier;

        GMapsController.setCanvas("map-canvas","28.1109712,-15.4239737");   

        _dataAdapter.getParkings().done(function(parkings) {
            putParkingMarkers(parkings);

            notifier.subscribe(function(updates){
                for(var i=0,n=updates.length;i<n;i++){
                    var updatedData = updates[i];
                    if(updatedData.type === "parking"){
                        updateParkingData(parkings, updatedData.data);
                    }
                }
            });
        });
    }

    return {
        run : run
    };
})();