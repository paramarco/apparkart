var ip = "130.206.82.170:8080";

var inputNetworkSetup = new File("./dataFromHadoop/input.txt");

var lines = inputNetworkSetup.File.split("\n");	
var numberOfParkingMeters= 5;

for (var indexOfParkingMeter = 0 ; indexOfParkingMeter < numberOfParkingMeters ;  indexOfParkingMeter++){
	var numberOfChangesForPakingMeter = 0;
	var AverageOfUsage = 0;	
	for(var lineIndex = 0 ; lineIndex < lines.length-1 ;  lineIndex++){
		var formattedLine = JSON.parse(lines[lineIndex]);
		if (formattedLine.entityId == indexOfParkingMeter ){
			numberOfChangesForPakingMeter++;
			AverageOfUsage = formattedLine.attrValue / numberOfChangesForPakingMeter;
		}
	}	
	var priority = 4;
	if (AverageOfUsage > 0)		{	priority = 3 ;}
	if (AverageOfUsage > 1) 	{ 	priority = 2 ;}
	if (AverageOfUsage > 4) 	{ 	priority = 1 ;}	
		
	sendUpdate2Broker(indexOfParkingMeter,priority);	
}

function sendUpdate2Broker (indexOfParkingMeter ,priority){			
	
	var contentTypeRequest = $.ajax({
			url: 'http://'+ip+'/parkings/'+indexOfParkingMeter+'',
            type: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                xhr.setRequestHeader("Accept","application/json;");
            },
            data : JSON.stringify({"priority": priority })  
	});

	contentTypeRequest.done(function(result){     		
			console.log("the average of use for id:" + indexOfParkingMeter + " is : " + priority );			
	});	
    contentTypeRequest.fail(function(jqXHR, textStatus, errorString){     
			console.log("the average of use for id:" + indexOfParkingMeter + " is : " + JSON.stringify({"priority": priority }) );			
			console.log( "DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText +  errorString + ")." );
	});	
}
