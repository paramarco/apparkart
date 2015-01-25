"use strict";
var http = require('http');
var dataAdapterHost;
var dataAdapterPort;

function connect(config, onConnectCallback){
    
    dataAdapterHost = config.host;
    dataAdapterPort = config.port;
    
    if(typeof onConnectCallback === 'function')
        onConnectCallback();
}

function updateData(type,id,value,callback){
    
    var dataStringify = JSON.stringify({
        "contextElements":[
            {"type": "sensor", "id" : id, "attributes":[{"name" : type, "value" : value}]}
        ],
        "updateAction":"UPDATE"
    });
    
    var options = {
        host: dataAdapterHost,
        port: dataAdapterPort,
        path: '/NGSI10/updateContext',
        method: 'POST',
        headers: {
           'Content-type'   : 'application/json; charset=utf-8',
           'Accept'         : 'application/json;',
           'Content-Length' : dataStringify.length
        }
    };
    
    var req = http.request(options, function(res) {
          var responseString = '';
          res.on('data', function(data) {
            responseString += data;
          });

          res.on('end', function() {
              callback(responseString);
          });
    });
    req.write(dataStringify);
    req.end();
}

function updateLuminosity(id,luminosityLevel,callback) {
    updateData(id,"nivelIntensidad",luminosityLevel,callback);
}

function updateSensor(type,id,value,callback) {
    updateData(type,id,value,callback);
}

exports.connect          = connect;
exports.updateSensor     = updateSensor;
exports.updateLuminosity = updateLuminosity;