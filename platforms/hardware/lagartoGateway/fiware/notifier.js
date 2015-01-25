"use strict";
var io                   = require('socket.io-client');
var onLampUpdateCallback = undefined;

/**
 * @param {String} ip  ip:port 
 * @param {String} subscribeTo 
 */
function connect(config,onConnectCallback){

    var socket = io.connect(config.host);
    
    socket.on('connect', function(){
        if(typeof onConnectCallback === 'function')
            onConnectCallback();
//        console.log("subscribe to "+ config.lampSubscriptionConfig.subscribeTo);
        socket.emit('subscribe',"parkingUpdate-"+config.lampSubscriptionConfig.subscribeTo);
    });

    socket.on('parkingUpdate', function (data) {   
        if(typeof onLampUpdateCallback === 'function'){
            var updatedData = data.contextElement;
            onLampUpdateCallback();
        }
    });
};
   
/**
 * @param {Function} callback
 */
function onLampUpdate(callback){
    onLampUpdateCallback = callback;
};

exports.connect      = connect;
exports.onLampUpdate = onLampUpdate;
