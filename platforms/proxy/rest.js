var restify = require('restify');
//var fiwareIP = "130.206.82.170:1026";
var fiwareIP = "217.127.199.47:1026";

var log4js     = require('log4js'),
    logger     = log4js.getLogger();
   // requestify = require('requestify');

var client = restify.createJsonClient({
    url: "http://"+fiwareIP,
    version: '*'
});

 
var server = restify.createServer();

server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.queryParser());
server.use(restify.bodyParser());


//server.get({path: PATH, version: '1.1.3'}, sendV1);
server.get('/parkings/', function(req, resMain, next){
    var centerLatitude  = req.query.centerLatitude, 
        centerLongitude = req.query.centerLongitude,
        radius          = req.query.radius;

    getParkingLatLong(centerLatitude, centerLongitude, radius, function(err, req, res, obj) {
        resMain.send(obj); 
    });

    return next();
});

server.put('/parkings/:id', function(req, resMain, next){
    logger.trace("update parking data:");

    var parkId     = req.params.id;
    var attributes = [];
    
    var data       = req.body;

    var priority   = parseInt(data.priority);
    var freePlaces = parseInt(data.freePlaces);

    if(!isNaN(priority)){
        //TODO: check priority value range
        attributes.push({"name":"priority", "value": priority});
    }

    if(!isNaN(freePlaces)){
        //TODO: check freePlaces value range
        attributes.push({"name":"freePlaces", "value": freePlaces});
    }

    logger.trace(attributes);
    
    setParkingAttributes(parkId, attributes, function(err, req, res, obj){
       resMain.send(obj);
    });

    return next();
});

server.post('/getPlace/:id', function(req, resMain, next){
    var parkId     = req.params.id;
    var freePlaces = 0;
    var maxPlaces  = 0;

    if(parkId === ''){
        //error
    }
    else{
        getPlaces(parkId,function(err, req, res, obj){
            freePlaces = parseInt(obj.contextResponses[0].contextElement.attributes[0].value) - 1;
            freePlaces = freePlaces<0?0:freePlaces;
            setPlaces(parkId,freePlaces,function(err, req, res, obj){
                resMain.send(obj);
            });      
        });
    }

    return next();
});

server.post('/releasePlace/:id', function(req, resMain, next){

    var parkId     = req.params.id;
    var freePlaces = 0;
    var maxPlaces  = 0;

    if(parkId === ''){
        //error
    }
    else{
        getPlaces(parkId,function(err, req, res, obj){
            freePlaces = parseInt(obj.contextResponses[0].contextElement.attributes[0].value) + 1;
            maxPlaces  = parseInt(obj.contextResponses[0].contextElement.attributes[1].value);
 
            freePlaces = freePlaces>maxPlaces?maxPlaces:freePlaces;
            
            setPlaces(parkId,freePlaces,function(err, req, res, obj){
                resMain.send(obj);
            });    
        });
    }

    return next();
});

server.post("/notify",function(req, res, next){
    res.send('');
    logger.trace("notify");
    
    var updates  = req.body.contextResponses;
  
    for(var i=0, n=updates.length; i<n; i++){
        var sensorType = updates[i].contextElement.id;//contextElement.attributes[0].name;   
        io.sockets.in('parkingUpdate-all').emit("parkingUpdate",updates[i]);  
        io.sockets.in('parkingUpdate-'+sensorType+"").emit("parkingUpdate",updates[i]);
    }
    return next();
});

function getParkingLatLong(centerLatitude, centerLongitude, radius, callback){
    var data  = {"entities":[{"type":"parking","isPattern":"true","id":".*"}],"restriction":{"scopes":[{"type":"FIWARE_Location","value":{
        "circle":{"centerLatitude":centerLatitude,"centerLongitude":centerLongitude,"radius":radius}}}]}
    };
    client.post('/NGSI10/queryContext',data,callback);
}

function getPlaces(parkId,callback){
    var data = {"entities":[{"type": "parking","isPattern": "false","id": parkId}]};
    client.post('/NGSI10/queryContext',data,callback);
}

function setPlaces(parkId, places, callback){
  //  var data = {"contextElements":[{"type":"parking","id":parkId,"attributes":[{"name":"freePlaces","value":places}]}],"updateAction":"UPDATE"};
  //  client.post('/NGSI10/updateContext',data,callback);
    var attributes = [{"name":"freePlaces", "value":places}];
    setParkingAttributes(parkId,attributes,callback);
}

function setParkingAttributes(parkId, attributes, callback){
    var data = {"contextElements":[{"type":"parking","id":parkId,"attributes":attributes}],"updateAction":"UPDATE"};
    client.post('/NGSI10/updateContext',data,callback);
}

function getParkingsInArea(centerLatitude,centerLongitude,radius) {

    var data  = {"entities":[{"type":"parking","isPattern":"true","id":".*"}],"restriction":{"scopes":[{"type":"FIWARE_Location","value":{
        "circle":{"centerLatitude":centerLatitude,"centerLongitude":centerLongitude,"radius":radius}}}]}
    };

    client.post('/NGSI10/queryContext', data, function(err, req, res, obj) {
        resMain.send(obj); 
    });
    return next();
}

 
server.listen(58080, function() {
    logger.info('REST API on port 58080');
});

//websocket Server notify
var express         = require('express'), 
    webSocketApp    = express(),
    webSocketServer = require('http').createServer(webSocketApp),
    io              = require('socket.io').listen(webSocketServer, {log:false});

webSocketApp.use(express.json({strict:false}));
webSocketApp.disable('x-powered-by');

io.sockets.on('connection', function (socket) {
   
    socket.on('subscribe',  function(roomID) { 
        if(typeof roomID === "string")
           socket.join(roomID); 
    });
   
    socket.on('unsubscribe',function(roomID) { 
       if(typeof roomID === "string")
           socket.leave(roomID); 
    });
});

webSocketServer.listen(58090, function(){
  logger.info('Socket server on port 58090');
});
