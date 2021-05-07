import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(() => {
    getUsers();
})

let users;

const appointmentFields = ["identifier", "name", "start", "end"]
let clientMethod = '';


function getAppointments() {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/appointments`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        let appointmentListHTML = ''
            /* response.services */
        response.map((appointment, index) => {
            if (getCookie("identifier") != appointment.identifier) {
                appointmentListHTML += `<tr id='${appointment.identifier}'>
                                        <th style='display: none' id='${appointment.identifier}-identifier'>${appointment.identifier}</th>
                                        <th id='${appointment.identifier}-counter'>${index+1}</th>
                                        <th id='${appointment.identifier}-user'>${users.find(user => user.identifier==appointment.user).email }</th>
                                        <th id='${appointment.identifier}-time'>${formatDate(appointment.time)}</th>
                                        <th id='${appointment.identifier}-for_appointment'>${appointment.for_appointment}</th>
                                        <th id='${appointment.identifier}-service'>${appointment.service.text_service_item}</th>
                                        <th id='${appointment.identifier}-btn'> 
                                                <button onClick='window.sendNotification("${appointment.user}")' type="button" class="btn btn-success">
                                                    Notification
                                                </button> 
                                        </th>
                                    </tr>`
            }
        });

        $("#appointments-list").html(appointmentListHTML)

    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert("Se ha producido un error en la consultaç de usuarios")
    });



}


window.sendNotification = (identifier) => {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/appointments/${identifier}/push`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        swal("Done", `Notification sent succefully`, "success");
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        swal("Error", `An error occurred during request`, "warning");
    });



}


function getUsers() {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/users`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        users = response
        getAppointments();
    });

}

window.editAppointment = (appointment) => {

    $("#form-error").text("")
    appointmentFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "edit"
    appointmentFields.map((field) => $(`#${field}`).val(String(appointment[field])))

    $("#start").val(formatDate($("#start").val()))
    $("#end").val(formatDate($("#end").val()))

}

function formatDate(date) {

    let d = new Date(date);
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    let ho = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false }).format(d);
    let mi = new Intl.DateTimeFormat('en', { minute: 'numeric', hour12: false }).format(d);

    return `${ye}-${mo}-${da} ${ho}:${mi}`
}

window.createAppointment = () => {

    $("#form-error").text("")
    appointmentFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "create"
    appointmentFields.map((field) => $(`#${field}`).val(""))

}


window.manageAppointment = () => {

    $("#form-error").text("")
    appointmentFields.map(field => {
        $(`#${field}-error`).hide()
        if (!$(`#${field}`).val()) {
            $(`#${field}-error`).show()
        }
    });

    if (!$("#name").val() ||
        !$("#start").val() ||
        !$("#end").val()
    ) {

        return;

    }

    const identifier = $("#identifier").val();
    const path = clientMethod == "create" ? "/v1/appointments" : `/v1/appointments/${identifier}`;

    const appointmentData = {

        name: $("#name").val(),
        start: $("#start").val(),
        end: $("#end").val(),
        repeat: true

    };

    if (clientMethod == "create") {
        appointmentData["user"] = getCookie("identifier");
        appointmentData["app"] = getCookie("application");
    }

    $("#appointment-btn").hide()
    $("#appointment-spinner").show()

    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: clientMethod == "create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));

        },
        data: JSON.stringify(appointmentData)
    });


    let actionWord = clientMethod == "create" ? "created" : "updated";
    request.done((response) => {

        $("#appointment-btn").show()
        $("#appointment-spinner").hide()
        swal("Done", `The appointment was ${actionWord} succefully`, "success");

        if (clientMethod == "create") {
            addAppointmentToList(actionWord = clientMethod == "create" ? response : appointmentData)
        } else {
            updateAppointmentInList({
                identifier: $("#identifier").val(),
                ...appointmentData
            })
        }
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {

        $("#appointment-btn").show();
        $("#appointment-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function addAppointmentToList(appointment) {
    let counter = parseFloat($("#appointments-list tr").last().find("th:nth-child(2)").text()) + 1
    counter = counter > 0 ? counter : 1
    $("#appointments-list").append(
        `<tr id='${appointment.identifier}'>
                            <th style='display: none' id='${appointment.identifier}-identifier'>${appointment.identifier}</th>
                            <th id='${appointment.identifier}-counter'>${counter
                            }</th>
                            <th id='${appointment.identifier}-name'>${appointment.name}</th>
                            <th id='${appointment.identifier}-start'>${formatDate(appointment.start)}</th>
                            <th id='${appointment.identifier}-end'>${formatDate(appointment.end)}</th>
                            <th id='${appointment.identifier}-btn'>
                                <button onClick='window.editAppointment(` + JSON.stringify(appointment) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#appointmentsModal">
                                    Edit
                                </button>
                                <button onClick='window.deleteAppointment(` + JSON.stringify(appointment) + `)' type="button" class="btn btn-danger">
                                    Delete
                                </button>
                            </th>
                        </tr>`
    )
}

function updateAppointmentInList(appointment) {

    appointmentFields.map(field => $(`#${appointment.identifier}-${field}`).text(`${appointment[field]}`));
    $(`#${appointment.identifier}-btn button`).attr("onclick", `window.editAppointment(` + JSON.stringify(appointment) + `)`)

}


window.deleteAppointment = (appointment) => {
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


            request.done((response) => {
                swal("Appointment deleted", { icon: "success" });
                $(`#${appointment.identifier}`).remove();
            });

            request.fail(function(jqXHR, textStatus, errorThrown) {

                swal("An error ocurred during request", { icon: "warning" });

            });

        } else {}
    });
}