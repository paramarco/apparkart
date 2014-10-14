"use strict";
var fiwareDataAdapter = (function () {
 
       var ip = "130.206.85.252:8080";
       
       function setHost(newIP){
            ip = newIP;
       }

       function processLampsData(data){
             
              var deferred = $.Deferred();
              var results  = [];
              var lamps    = data.contextResponses || [];

              //process data
                for(var i=0,n=lamps.length; i<n; i++) {
                    
                    var lampData  = lamps[i].contextElement;
                    var cabinetID = parseInt(lampData.attributes[2].value);
                    var lampID    = parseInt(lampData.id);

                    if (!(cabinetID in results)) {
                        results[cabinetID] = {};
                    }

                    results[cabinetID][lampID] = {
                        id : lampID,
                        luminosityLevel : lampData.attributes[0].value,
                        position : lampData.attributes[1].value,
                        electricalCabinetID : cabinetID
                    };
                }

              deferred.resolve(results);
              return deferred.promise();
        }
       
        function processParkingsData(data){
            var deferred = $.Deferred();
            var results  = [];
            var parkings = data.contextResponses || [];

            //process data
            for(var i=0,n=parkings.length; i<n; i++) {
                    
                var parking  = parkings[i].contextElement;
                var sensorID = parseInt(parking.id);

                results[sensorID] = {
                  id         : sensorID,
                  freePlaces : parking.attributes[0].value,
                  position   : parking.attributes[1].value,
                  priority   : parking.attributes[2].value
                };
            }

            deferred.resolve(results);
            return deferred.promise();
        }

        function getParkings() {
                return $.ajax({
                   url: 'http://'+ip+'/NGSI10/contextEntityTypes/parking',
                   type: 'GET',
                   beforeSend: function(xhr) {
                       xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                       xhr.setRequestHeader("Accept","application/json;");
                   }}).then(processParkingsData); 
        }
        

        function getParkingsInArea(centerLatitude,centerLongitude,radius) {

                var data  = {"entities":[{"type":"parking","isPattern":"true","id":".*"}],"restriction":{"scopes":[{"type":"FIWARE_Location","value":{
                  "circle":{"centerLatitude":centerLatitude,"centerLongitude":centerLongitude,"radius":radius}}}]}
                };

                return  $.ajax({
                   url: 'http://'+ip+'/NGSI10/queryContext',
                   type: 'POST',
                   data: JSON.stringify(data),
                   beforeSend: function(xhr) {
                       xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                       xhr.setRequestHeader("Accept","application/json;");
                   }}).then(processParkingsData); 
        }


        return {
            setHost           : setHost,
            getParkings       : getParkings,
            getParkingsInArea : getParkingsInArea
        };
 
    })();