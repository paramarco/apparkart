"use strict";
var infoWindowParkingTemplate = (function () {
    function fillTemplate(data){
        return "<div id='parking-"+data.id+"' class='bubble'>\
                    <h1 class='title'>Id: "+data.id+"</h1>\
                    <div class='info'>\
                        <p><span>Position: </span><span class='nTotal'>"+data.position+"</span></p>\
                        <p><span>Max places: </span><span>"+data.maxPlaces+"</span></p>\
                        <p class='luminosityLevel'><span>Free places: </span></p>\
                        <form oninput='amount.value=rangeInput.value'>\
                            <input id ='range-"+data.id+"' class='luminosityRange' type='range' name='rangeInput' min='0' max='"+data.maxPlaces+"' step='1' value='"+data.freePlaces+"'>\
                            <output class='freePlacesValue' name='amount' for='rangeInput'>"+data.freePlaces+"</output><span></span>\
                        </form>\
                    </div>\
                    <div class='clear'></div>\
                </div>";
    }

    function addListenerToFreePlacesRange(id, callback){
        document.getElementById("range-"+id).onchange = callback;
    }

    return {
        fillTemplate: fillTemplate,
        addListenerToFreePlacesRange: addListenerToFreePlacesRange
    };
})();