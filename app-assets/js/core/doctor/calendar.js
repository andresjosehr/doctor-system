import environment from '../../../../environment.js'
import { checkLogin, logout, checkLonginAdministrator, getCookie } from './../general.js'


$(document).ready(() => {
    getServices();
});




function getServices() {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/service`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        let serviceHTML = ''
        response.services.map(serviceItem => {
            serviceHTML += `<option data-label="primary" value="${serviceItem.identifier}">${serviceItem.text_service_item}</option>`
            console.log(serviceItem)
        });

        $("#service").html(serviceHTML)

    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert("Se ha producido un error en la consulta de usuarios")
    });
}


window.getAppointments=() => {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/appointments`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    return request;
}


window.saveAppointment = function() {

    const date = $("#appointment-date").val()
    const time = $("#appointment-time").val()

    const year = moment(date).format('YYYY');
    const month = moment(date).format('MM');
    const day = moment(date).format('DD');

    const hour = $("#appointment-time").val().split(":")[0]
    const minute = $("#appointment-time").val().split(":")[1]


    console.log(year, month, day, hour, minute)


    const request = $.ajax({
        url: `${environment.apiURL}/v1/appointments`,
        type: "post",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        },
        data: JSON.stringify({
            "app": getCookie("application"),
            "ano": parseInt(year),
            "dia": parseInt(day),
            "for_appointment": $("#for_appointment").val(),
            "hora": parseInt(hour),
            "mes": parseInt(month),
            "minuto": parseInt(minute),
            "service": $("#service").val()
        })
    }); 
    

     request.done((response)=>{

        console.log("Se guardo correctamente")
    }); 

        request.fail(function (jqXHR, textStatus, errorThrown){

            console.log(jqXHR)
            $("#blog-btn").show();
            $("#blog-spinner").hide();
            $("#form-error").text(jqXHR.responseJSON.message)
            swal("Done", `An error ocurred during request`, "warning");

        });
}



window.updateAppointment = function() {

    const date = $("#appointment-date").val()
    const time = $("#appointment-time").val()

    const year = moment(date).format('YYYY');
    const month = moment(date).format('MM');
    const day = moment(date).format('DD');

    const hour = $("#appointment-time").val().split(":")[0]
    const minute = $("#appointment-time").val().split(":")[1]


    const request = $.ajax({
        url: `${environment.apiURL}/v1/appointments`,
        type: "post",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        },
        data: JSON.stringify({
            "app": getCookie("application"),
            "ano": parseInt(year),
            "dia": parseInt(day),
            "for_appointment": $("#for_appointment").val(),
            "hora": parseInt(hour),
            "mes": parseInt(month),
            "minuto": parseInt(minute),
            "service": $("#service").val()
        })
    }); 
    

     request.done((response)=>{

        console.log("Se guardo correctamente")
    }); 

        request.fail(function (jqXHR, textStatus, errorThrown){

            console.log(jqXHR)
            $("#blog-btn").show();
            $("#blog-spinner").hide();
            $("#form-error").text(jqXHR.responseJSON.message)
            swal("Done", `An error ocurred during request`, "warning");

        });
}