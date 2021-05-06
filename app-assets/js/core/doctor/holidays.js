import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(() => {
    getHolidays();
})

const holidayFields = ["identifier", "name", "start", "end"]
let clientMethod = '';


function getHolidays() {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/holidays`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        let holidayListHTML = ''
        response.map((holiday, index) => {
            if (getCookie("identifier") != holiday.identifier) {
                holidayListHTML += `<tr id='${holiday.identifier}'>
                                    <th style='display: none' id='${holiday.identifier}-identifier'>${holiday.identifier}</th>
                                    <th id='${holiday.identifier}-counter'>${index+1}</th> 
                                    <th id='${holiday.identifier}-name'>${holiday.name}</th>
                                    <th id='${holiday.identifier}-start'>${formatDate(holiday.start)}</th>
                                    <th id='${holiday.identifier}-end'>${formatDate(holiday.end)}</th>
                                    <th id='${holiday.identifier}-btn'>
                                        <button onClick='window.editHoliday(` + JSON.stringify(holiday) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#holidaysModal">
                                            Edit
                                        </button>
                                        <button onClick='window.deleteHoliday(` + JSON.stringify(holiday) + `)' type="button" class="btn btn-danger">
                                            Delete
                                        </button>
                                    </th>
                                </tr>`
            }
        });

        $("#holidays-list").html(holidayListHTML)

    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

window.editHoliday = (holiday) => {

    $("#form-error").text("")
    holidayFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "edit"
    holidayFields.map((field) => $(`#${field}`).val(String(holiday[field])))

    $("#start").val(formatDate($("#start").val()))
    $("#end").val(formatDate($("#end").val()))

}

function formatDate(date) {

    let d = new Date(date);
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    return `${ye}-${mo}-${da}`
}

window.createHoliday = () => {

    $("#form-error").text("")
    holidayFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "create"
    holidayFields.map((field) => $(`#${field}`).val(""))

}


window.manageHoliday = () => {

    $("#form-error").text("")
    holidayFields.map(field => {
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
    const path = clientMethod == "create" ? "/v1/holidays" : `/v1/holidays/${identifier}`;

    const holidayData = {

        name: $("#name").val(),
        start: $("#start").val(),
        end: $("#end").val(),
        repeat: true

    };

    if (clientMethod == "create") {
        holidayData["user"] = getCookie("identifier");
        holidayData["app"] = getCookie("application");
    }

    $("#holiday-btn").hide()
    $("#holiday-spinner").show()

    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: clientMethod == "create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));

        },
        data: JSON.stringify(holidayData)
    });


    let actionWord = clientMethod == "create" ? "created" : "updated";
    request.done((response) => {

        $("#holiday-btn").show()
        $("#holiday-spinner").hide()
        swal("Done", `The holiday was ${actionWord} succefully`, "success");

        if (clientMethod == "create") {
            addHolidayToList(actionWord = clientMethod == "create" ? response : holidayData)
        } else {
            updateHolidayInList({
                identifier: $("#identifier").val(),
                ...holidayData
            })
        }

        $("#holidaysModal").modal('hide');
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {

        $("#holiday-btn").show();
        $("#holiday-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function addHolidayToList(holiday) {

    let counter = parseFloat($("#holidays-list tr").last().find("th:nth-child(2)").text()) + 1
    counter = counter > 0 ? counter : 1

    $("#holidays-list").append(
        `<tr id='${holiday.identifier}'>
                            <th style='display: none' id='${holiday.identifier}-identifier'>${holiday.identifier}</th>
                            <th id='${holiday.identifier}-counter'>${counter}</th>
                            <th id='${holiday.identifier}-name'>${holiday.name}</th>
                            <th id='${holiday.identifier}-start'>${formatDate(holiday.start)}</th>
                            <th id='${holiday.identifier}-end'>${formatDate(holiday.end)}</th>
                            <th id='${holiday.identifier}-btn'>
                                <button onClick='window.editHoliday(` + JSON.stringify(holiday) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#holidaysModal">
                                    Edit
                                </button>
								<button onClick='window.deleteHoliday(` + JSON.stringify(holiday) + `)' type="button" class="btn btn-danger">
                                    Delete
                                </button>
                            </th>
                        </tr>`
    )
}

function updateHolidayInList(holiday) {

    holidayFields.map(field => {
        if (field == "identifier") {
            $(`#${holiday.identifier}-${field}`).text(`${holiday[field].slice(holiday[field].length - 3)}`)
        } else {
            $(`#${holiday.identifier}-${field}`).text(`${holiday[field]}`);
        }
    });

    $(`#${holiday.identifier}-btn button`).attr("onclick", `window.editHoliday(` + JSON.stringify(holiday) + `)`)

}


window.deleteHoliday = (holiday) => {
    const message = swal({
        title: "Wait!",
        text: "Are you sure to delete this holiday?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {

        if (willDelete) {

            const request = $.ajax({
                url: `${environment.apiURL}/v1/holidays/${holiday.identifier}`,
                type: "delete",
                beforeSend: function(req) {
                    req.setRequestHeader("accept", "application/json");
                    req.setRequestHeader("Content-Type", "application/json");
                    req.setRequestHeader("Authorization", getCookie("Authorization"));
                }
            });


            request.done((response) => {
                swal("Holiday deleted", { icon: "success" });
                $(`#${holiday.identifier}`).remove();
            });

            request.fail(function(jqXHR, textStatus, errorThrown) {

                swal("An error ocurred during request", { icon: "warning" });

            });

        } else {}
    });
}