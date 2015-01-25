"use strict";
var fiwareDataAdapter = (function () {
 
       //var ip = "130.206.82.170:8080";
       var ip = "217.127.199.47:58080";
       
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
                var sensorID = parseInt(parking.id);

                results[sensorID] = {
                  id         : sensorID,
                  freePlaces : parking.attributes[0].value,
                  maxPlaces	 : parking.attributes[1].value,
                  position   : parking.attributes[2].value,
                  priority   : parking.attributes[3].value
                };
            }

            deferred.resolve(results);
            return deferred.promise();
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


        function releasePlace(id) {
           return  $.ajax({
               url: 'http://'+ip+'/releasePlace/'+id,
               type: 'POST',
               beforeSend: function(xhr) {
                   xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                   xhr.setRequestHeader("Accept","application/json;");
               }});
       }

 
       function getPlace(id) {
           return  $.ajax({
               url: 'http://'+ip+'/getPlace/'+id,
               type: 'POST',
               beforeSend: function(xhr) {
                   xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                   xhr.setRequestHeader("Accept","application/json;");
               }});
       }



        return {
            setHost           : setHost,
            releasePlace		:releasePlace,
            getPlace			:getPlace,
            getParkingsInArea : getParkingsInArea
        };
 
    })();