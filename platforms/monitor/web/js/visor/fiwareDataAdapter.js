"use strict";
var fiwareDataAdapter = (function () {
    var ip = "130.206.82.170:8080";

    function setHost(newIP){
        ip = newIP;
    }

    function processParkingsData(data){
        var deferred = $.Deferred();
        var results  = [];
        var parkings = data.contextResponses || [];

        //process data
        for(var i=0,n=parkings.length; i<n; i++) {

            var parking  = parkings[i].contextElement;
            var sensorID = parking.id;

            results[sensorID] = {
                id         : sensorID,
                freePlaces : parseInt(parking.attributes[0].value),
                maxPlaces  : parseInt(parking.attributes[1].value),
                position   : parking.attributes[2].value,
                priority   : parseInt(parking.attributes[3].value)
            };
        }

        deferred.resolve(results);
        return deferred.promise();
    }

    function getParkings() {
        return $.ajax({
            url: 'http://'+ip+'/parkings?centerLatitude=27.97175&centerLongitude=-15.596414&radius=30000',
            type: 'GET',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                xhr.setRequestHeader("Accept","application/json;");
            }}).then(processParkingsData); 
    }

    function updateFreePlaces(id, freePlaces) {

        var data = {"freePlaces":freePlaces};

        console.log(JSON.stringify(data))

        return $.ajax({
            url: 'http://'+ip+'/parkings/'+id+"",
            type: 'PUT',
            data: JSON.stringify(data),
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                xhr.setRequestHeader("Accept","application/json;");
        }}); 
    }

    function getParkingsInArea(centerLatitude,centerLongitude,radius) {
        return  $.ajax({
            url: 'http://'+ip+'/parkings?centerLatitude='+centerLatitude+'&centerLongitude='+centerLongitude+'&radius='+radius,
            type: 'GET',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                xhr.setRequestHeader("Accept","application/json;");
        }}).then(processParkingsData); 
    }

    return {
        setHost             : setHost,
        updateFreePlaces    : updateFreePlaces,
        getParkings         : getParkings,
        getParkingsInArea   : getParkingsInArea
    };
})();