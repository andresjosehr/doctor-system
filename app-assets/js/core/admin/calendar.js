import environment from '../../../../environment.js'
import { checkLogin, logout, checkLonginAdministrator, getCookie } from './../general.js'


$(document).ready(()=>{
    /* getServices(); */
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
        let appointmentListHTML = ''
        response.map(appointment => {
           console.log(appointment)
        });

        /* $("#appointments-list").html(appointmentListHTML) */
        
    });
    
    /* request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de usuarios")
    }); */
}
