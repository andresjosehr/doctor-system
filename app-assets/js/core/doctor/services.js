import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(() => {
    getServices();
})

const serviceFields = ["identifier", "text_service_item"]
let clientMethod = '';
let service;


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
        let serviceListHTML = ''
        service = response;
        response.services.map((service, index) => {
            if (getCookie("identifier") != service.identifier) {
                serviceListHTML += `<tr id='${service.identifier}'>
                                    <th style='display: none' id='${service.identifier}-identifier'>${service.identifier}</th>
                                    <th id='${service.identifier}-counter'>${index+1}</th> 
                                    <th id='${service.identifier}-text_service_item'>${service.text_service_item}</th>
                                    <th id='${service.identifier}-btn'>
                                        <button onClick='window.editService(` + JSON.stringify(service) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#servicesModal">
                                            Edit
                                        </button>
                                        <button onClick='window.deleteService(` + JSON.stringify(service) + `)' type="button" class="btn btn-danger">
                                            Delete
                                        </button>
                                    </th>
                                </tr>`
            }
        });

        $("#services-list").html(serviceListHTML)

    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

window.editService = (service) => {

    $("#form-error").text("")
    serviceFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "edit"
    serviceFields.map((field) => $(`#${field}`).val(String(service[field])))

}

window.createService = () => {

    $("#form-error").text("")
    serviceFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "create"
    serviceFields.map((field) => $(`#${field}`).val(""))

}


window.manageService = () => {

    $("#form-error").text("")
    serviceFields.map(field => {
        $(`#${field}-error`).hide()
        if (!$(`#${field}`).val()) {
            $(`#${field}-error`).show()
        }
    });

    if (!$("#text_service_item").val()) {

        return;

    }

    const identifier = $("#identifier").val();
    const path = clientMethod == "create" ? "/v1/services/items" : `/v1/services/${service.identifier}/items/${identifier}`;

    const serviceData = {

        text_service_item: $("#text_service_item").val(),
        app: getCookie("application")

    };

    $("#service-btn").hide()
    $("#service-spinner").show()

    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: clientMethod == "create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));

        },
        data: JSON.stringify(serviceData)
    });


    let actionWord = clientMethod == "create" ? "created" : "updated";
    request.done((response) => {

        $("#service-btn").show()
        $("#service-spinner").hide()
        swal("Done", `The service was ${actionWord} succefully`, "success");
        $("#servicesModal").modal("hide")

        if (clientMethod == "create") {
            addServiceToList(actionWord = clientMethod == "create" ? response : serviceData)
        } else {
            updateServiceInList({
                identifier: $("#identifier").val(),
                ...serviceData
            })
        }
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {

        $("#service-btn").show();
        $("#service-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function addServiceToList(service) {
    service = service[service.length - 1]
    let counter = parseFloat($("#services-list tr").last().find("th:nth-child(2)").text()) + 1
    counter = counter > 0 ? counter : 1

    $("#services-list").append(
        `<tr id='${service.identifier}'>
                            <th style='display: none' id='${service.identifier}-identifier'>${service.identifier}</th>
                            <th id='${service.identifier}-counter'>${counter}</th>  
                            <th id='${service.identifier}-text_service_item'>${service.text_service_item}</th>
                            <th id='${service.identifier}-btn'>
                                <button onClick='window.editService(` + JSON.stringify(service) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#servicesModal">
                                    Edit
                                </button>
                                <button onClick='window.deleteService(` + JSON.stringify(service) + `)' type="button" class="btn btn-danger">
                                    Delete
                                </button>
                            </th>
                        </tr>`
    )
}

function updateServiceInList(service) {

    serviceFields.map(field => {

        if (field == "identifier") {
            $(`#${service.identifier}-${field}`).text(`${service[field].slice(service[field].length - 3)}`)
        } else {
            $(`#${service.identifier}-${field}`).text(`${service[field]}`)
        }

    });


    $(`#${service.identifier}-btn button`).attr("onclick", `window.editService(` + JSON.stringify(service) + `)`)

}


window.deleteService = (serviceItem) => {
    const message = swal({
        title: "Wait!",
        text: "Are you sure to delete this service?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {

        if (willDelete) {

            const request = $.ajax({
                url: `${environment.apiURL}/v1/services/${service.identifier}/items/${serviceItem.identifier}`,
                type: "delete",
                beforeSend: function(req) {
                    req.setRequestHeader("accept", "application/json");
                    req.setRequestHeader("Content-Type", "application/json");
                    req.setRequestHeader("Authorization", getCookie("Authorization"));
                }
            });


            request.done((response) => {
                swal("Service deleted", { icon: "success" });
                $(`#${serviceItem.identifier}`).remove();
            });

            request.fail(function(jqXHR, textStatus, errorThrown) {

                swal("An error ocurred during request", { icon: "warning" });

            });

        } else {}
    });
}