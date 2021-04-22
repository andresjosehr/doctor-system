import environment from '../../../../environment.js'
import { checkLogin, logout, checkLonginAdministrator, getCookie } from './../general.js'


$(document).ready(()=>{
    getServices();
});




function getServices(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/service`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
          }
    });

    request.done(function (response, textStatus, jqXHR){
        let serviceHTML = ''
        response.services.map(serviceItem => {
            serviceHTML+=`<option data-label="primary" value="${serviceItem.identifier}">${serviceItem.text_service_item}</option>`
           console.log(serviceItem)
        });

        $("#service").html(serviceHTML)
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de usuarios")
    });
}


window.saveAppointment= function(){
    /* alert("Guardado") */
}