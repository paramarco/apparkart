"use strict";

var log4js     = require('log4js'),
    logger     = log4js.getLogger(),
    http       = require('http');

//config
var config     = require("./config"),
    platform   = config.platform,
    platformID = platform.id;


//notifier 
var notifierConfig  = platform.configurationParams[platformID].notifier,
    notifierAdapter = require("./" + platformID + "/notifier");

notifierAdapter.connect(notifierConfig,function(){
    logger.info(platformID + " notifier connection ok");
});

notifierAdapter.onLampUpdate(function(data){
    try{
        logger.debug("lampUpdate\n"+JSON.stringify(data));

        var pwmMoteID       = config.outputs.luminaria["id_0"];
	var luminosityLevel = 255;
        if (typeof pwmMoteID  !== "undefined"){
          toggle(pwmMoteID);
        }
    }catch(e){
        logger.error(e);
    }
});

function toggle(pwmMoteID){
     sendCommand(pwmMoteID,0);
     sendCommand(pwmMoteID,255);
     setTimeout(function(){
	sendCommand(pwmMoteID,0);
     	setTimeout(function(){
		sendCommand(pwmMoteID,255);
        	setTimeout(function(){
                	sendCommand(pwmMoteID,0);
	                setTimeout(function(){
                        	sendCommand(pwmMoteID,255);
                		setTimeout(function(){
                        		sendCommand(pwmMoteID,0);
                		},500);
                	},500);
		},500);
	},500);
     },500);
}

function sendCommand(pwmMoteID, luminosityLevel){
           http.get("http://127.0.0.1:8001/values/?id=" + pwmMoteID + "&value="+luminosityLevel,function(res) {
                res.on('data', function(response){
                    logger.debug("Response from lagarto swap server:\n" + response);
                });
            })
           .on('error',function(){
                logger.error("No connection to Lagarto server");
           })
           .end();
}
//dataAdapter
var dataConfig  = platform.configurationParams[platformID].data,
    dataAdapter = require("./" + platformID + "/dataAdapter");

dataAdapter.connect(dataConfig, function(){
    logger.info(platformID + " data server connection ok");
});

//lagarto swap server 0MQ subscriber
/*
mote message -> {"lagarto": {"status": [{"direction": "out", "name": "PWM_output_0", "timestamp": "1 May 2014 0:0:00", "value": "0", "location": "SWAP", "type": "num", "id": "1.11.0"}], "procname": "Lagarto-SWAP", "httpserver": "192.168.1.2:8001"}}

heartbeat -> {"lagarto": {"procname": "Lagarto-SWAP", "httpserver": "192.168.1.2:8001"}}
*/

var zmq  = require('zmq'),
    sock = zmq.socket('sub');

sock.connect('tcp://127.0.0.1:5001');
sock.subscribe('');
sock.on('message', function(msg){

/*    
    logger.debug("Message from lagarto swap server:\n", msg.toString());

    var info = JSON.parse(msg.toString());

    if(typeof info.lagarto.status !== "undefined"){
        var status = info.lagarto.status;
        for(var i=0,n=status.length; i<n; i++){
            var data  = status[i];
            var input = config.inputs[data.id];

            if(data.direction === "inp" && typeof input !== "undefined"){    
                dataAdapter.updateSensor(input.family,input.cloudID,data.value,function(response) {
                    logger.debug("Response from cloud:\n" + JSON.stringify(response));
                });
            }
        }
    }*/
});
