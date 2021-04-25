import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(()=>{
    getAppointments();
})

const appointmentFields = ["identifier", "name", "start", "end"]
let clientMethod = '';


function getAppointments(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/appointments`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });
    
    request.done(function (response, textStatus, jqXHR){
        let appointmentListHTML = ''
        /* response.services */
        response.services.map(appointment => {
            if(getCookie("identifier")!=appointment.identifier){
                appointmentListHTML+=`<tr id='${appointment.identifier}'>
                                    <th id='${appointment.identifier}-identifier'>${appointment.identifier}</th>
                                    <th id='${appointment.identifier}-for_appointment'>${appointment.for_appointment}</th>
                                    <th id='${appointment.identifier}-btn'>
                                    <th>
                                        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#emailModal">
                                            Email
                                        </button> 
                                        <button type="button" class="btn btn-success" data-toggle="modal" data-target="#notificationModal">
                                            Notification
                                        </button> 
                                    </th>
                                    </th>
                                </tr>`
            }
        });

        $("#appointments-list").html(appointmentListHTML)
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

window.editAppointment=(appointment)=>{

    $("#form-error").text("")
    appointmentFields.map(field => $(`#${field}-error`).hide() )

   clientMethod="edit"
   appointmentFields.map((field) => $(`#${field}`).val(String(appointment[field])) )

   $("#start").val(formatDate($("#start").val()))
   $("#end").val(formatDate($("#end").val()))
    
}

function formatDate(date){

    let d = new Date(date);
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    return `${ye}-${mo}-${da}`
}

window.createAppointment=()=>{

    $("#form-error").text("")
    appointmentFields.map(field => $(`#${field}-error`).hide() )

    clientMethod="create"
    appointmentFields.map((field) => $(`#${field}`).val(""))

}


window.manageAppointment=()=>{

    $("#form-error").text("")
    appointmentFields.map(field =>{
        $(`#${field}-error`).hide()
        if(!$(`#${field}`).val()){
            $(`#${field}-error`).show()
        }
    });

    if(
        !$("#name").val()       ||
        !$("#start").val()      ||
        !$("#end").val()      
    ){
        
        return;

    }

    const identifier = $("#identifier").val();
    const path = clientMethod=="create" ? "/v1/appointments" : `/v1/appointments/${identifier}`;

    const appointmentData = {
        
            name: $("#name").val(), 
            start: $("#start").val(), 
            end: $("#end").val(),
            repeat: true
        
    };

    if(clientMethod=="create"){
        appointmentData["user"]=getCookie("identifier");
        appointmentData["app"]=getCookie("application");
    }

    $("#appointment-btn").hide()
    $("#appointment-spinner").show()
    
    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: clientMethod=="create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
            
        },
        data: JSON.stringify(appointmentData)
    }); 


    let actionWord=clientMethod=="create" ? "created" : "updated";
     request.done((response)=>{

        $("#appointment-btn").show()
        $("#appointment-spinner").hide()
        swal("Done", `The appointment was ${actionWord} succefully`, "success");
        
        if(clientMethod=="create"){
            addAppointmentToList(actionWord=clientMethod=="create" ? response : appointmentData)
        } else {
            updateAppointmentInList({
                identifier: $("#identifier").val(),
                ...appointmentData
            })
        }
    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){

        $("#appointment-btn").show();
        $("#appointment-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function addAppointmentToList(appointment){
    $("#appointments-list").append(
        `<tr id='${appointment.identifier}'>
                            <th id='${appointment.identifier}-identifier'>${appointment.identifier}</th>
                            <th id='${appointment.identifier}-name'>${appointment.name}</th>
                            <th id='${appointment.identifier}-start'>${formatDate(appointment.start)}</th>
                            <th id='${appointment.identifier}-end'>${formatDate(appointment.end)}</th>
                            <th id='${appointment.identifier}-btn'>
                                <button onClick='window.editAppointment(`+JSON.stringify(appointment)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#appointmentsModal">
                                    Edit
                                </button>
                                <button onClick='window.deleteAppointment(`+JSON.stringify(appointment)+`)' type="button" class="btn btn-danger">
                                    Delete
                                </button>
                            </th>
                        </tr>`
    )
}

function updateAppointmentInList(appointment){

    appointmentFields.map( field => $(`#${appointment.identifier}-${field}`).text(`${appointment[field]}`) );
    $(`#${appointment.identifier}-btn button`).attr("onclick", `window.editAppointment(`+JSON.stringify(appointment)+`)`)

}


window.deleteAppointment = (appointment) =>{
    const message = swal({
            title: "Wait!",
            text: "Are you sure to delete this appointment?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {

            if (willDelete) {

                const request = $.ajax({
                            url: `${environment.apiURL}/v1/appointments/${appointment.identifier}`,
                            type: "delete",
                            beforeSend: function(req) {
                                    req.setRequestHeader("accept", "application/json");
                                    req.setRequestHeader("Content-Type", "application/json");
                                    req.setRequestHeader("Authorization", getCookie("Authorization"));
                            }
                    }); 
                    
            
                    request.done((response)=>{
                        swal("Appointment deleted", { icon: "success" });
                        $(`#${appointment.identifier}`).remove();
                    }); 
            
                    request.fail(function (jqXHR, textStatus, errorThrown){
            
                        swal("An error ocurred during request", { icon: "warning" });
            
                    });

            } else {
            }
        });
}