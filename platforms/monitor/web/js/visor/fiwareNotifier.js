"use strict";
var fiwareNotifier= (function () {
     
    var listeners = [];
    var host      = undefined;
    var socket    = undefined;
   
    function connect(host){
        
        if(socket != undefined) socket.disconnect(true) 

        socket = io.connect(host, { 'force new connection': true });

        socket.on('connect',function(){
           
            socket.emit('subscribe','parkingUpdate-all');
           
            socket.on('parkingUpdate', function (data) {            
               var updates = [];

               if(data.statusCode.code === "200"){     
                  console.log(data.contextElement);           
                  updates.push(processParkingUpdate(data.contextElement));                  
                  notifyToListeners(updates);
               }
            });
        });
    }

    function processParkingUpdate(data){
        return {
            type: "parking",
            data:{
                id : data.id,
                freePlaces : parseInt(data.attributes[0].value)
            }
        };
    }
    
    function notifyToListeners(message){
       for(var i=0,n=listeners.length;i<n;i++){
            listeners[i](message);
       } 
    }   
    
    function subscribe(callback){
       listeners.push(callback);
 
    }
    
    return {
        connect           : connect,
        notifyToListeners : notifyToListeners,
        subscribe         : subscribe
    };
 
})();