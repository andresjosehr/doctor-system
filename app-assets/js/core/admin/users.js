import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(() => {
    getUsers();
    getApps();
})

const userFields = ["identifier", "email", "name", "password", "password2", "phone", "active", "type_users", "app"]
let clientMethod = '';

function getApps() {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/apps`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        let apps = ''
        response.map(app => apps = `<option data-label="danger" value="${app.identifier}">${app.name_app}</option>`)

        $("#app").append(apps)
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
        let userListHTML = ''
        response.map((user, index) => {
            if (getCookie("identifier") != user.identifier) {
                userListHTML += `<tr>
                                    <th style='display: none' id='${user.identifier}-identifier'>${user.identifier}</th>
                                    <th id='${user.identifier}-counter'>${index}</th>
                                    <th id='${user.identifier}-email'>${user.email}</th>
                                    <th id='${user.identifier}-phone'>${user.phone}</th>
                                    <th id='${user.identifier}-type_users'>${user.type_users}</th>
                                    <th id='${user.identifier}-active'>${user.active}</th>
                                    <th id='${user.identifier}-btn'>
                                        <button onClick='window.editUser(` + JSON.stringify(user) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#usersModal">
                                            Edit
                                        </button>
                                    </th>
                                </tr>`
            }
        });

        $("#users-list").html(userListHTML)

    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

window.editUser = (user) => {

    $("#form-error").text("")
    userFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "edit"
    userFields.map((field) => $(`#${field}`).val(String(user[field])))

    $("#password").val("");
    $("#password").prop('disabled', true);
    $("#password2").val("");
    $("#password2").prop('disabled', true);
    $("#app").prop('disabled', true);
    $("#type_users").prop('disabled', true);

}

window.createUser = () => {

    $("#form-error").text("")
    userFields.map(field => $(`#${field}-error`).hide())

    clientMethod = "create"
    $("#password").prop('disabled', false);
    $("#password").prop('disabled', false);
    $("#app").prop('disabled', false);
    $("#type_users").prop('disabled', false);
    userFields.map((field) => $(`#${field}`).val(""))

}


window.manageUser = () => {



    $("#form-error").text("")
    $("#email-invalid-error").hide()
    $(".password-match-error").hide()
    $(".phone-invalid-error").hide()
    userFields.map(field => {
        $(`#${field}-error`).hide()
        if (!$(`#${field}`).val()) {
            $(`#${field}-error`).show()
        }
    });
    if (clientMethod == "edit") {
        $("#password-error").hide()
        $("#password2-error").hide()
    }

    if (!$("#email").val() ||
        !$("#phone").val() ||
        !$("#name").val() ||
        !$("#active").val() ||
        !$("#type_users").val()
    ) {

        return;

    }

    if (!validateEmail($("#email").val())) {

        $("#email-invalid-error").show()
        return;
    }

    if ($("#password").val() != $("#password2").val()) {

        $(".password-match-error").show()
        return;
    }

    if ($("#phone").val().charAt(0)!="+") {
        
        $(".phone-invalid-error").show()
        return;
    }



    const identifier = $("#identifier").val();
    const path = clientMethod == "create" ? "/v1/users" : `/v1/users/${identifier}`;

    const userData = {

        name: $("#name").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
        active: $("#active").val() == "true" ? true : false

    };

    if (clientMethod == "create") {
        userData["password"] = $("#password").val();
        userData["password2"] = $("#password").val();
        userData["type_users"] = $("#type_users").val();
        userData["app"] = $("#app").val();
    }

    $("#user-btn").hide()
    $("#user-spinner").show()

    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: clientMethod == "create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));

        },
        data: JSON.stringify(userData)
    });


    let actionWord = clientMethod == "create" ? "created" : "updated";
    request.done((response) => {

        $("#user-btn").show()
        $("#user-spinner").hide()
        swal("Done", `The user was ${actionWord} succefully`, "success");

        if (clientMethod == "create") {
            addUserToList(actionWord = clientMethod == "create" ? response : userData)
        } else {
            updateUserInList({
                identifier: $("#identifier").val(),
                type_users: $("#type_users").val(),
                ...userData
            })
        }
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {

        $("#user-btn").show();
        $("#user-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
            // swal("Error", `An error ocurred during request`, "warning");

    });


}


function addUserToList(user) {
    const counter = parseFloat($("#DataTables_Table_0 tbody tr").last().find("th:nth-child(2)").text()) + 1
    $("#users-list").append(
        `<tr>
                            <th style='display: none' id='${user.identifier}-identifier'>${user.identifier}</th>
                            <th id='${user.identifier}-counter'>${counter}</th>
                            <th id='${user.identifier}-email'>${user.email}</th>
                            <th id='${user.identifier}-phone'>${user.phone}</th>
                            <th id='${user.identifier}-type_users'>${user.type_users}</th>
                            <th id='${user.identifier}-active'>${user.active}</th>
                            <th id='${user.identifier}-btn'>
                                <button onClick='window.editUser(` + JSON.stringify(user) + `)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#usersModal">
                                    Edit
                                </button>
                            </th>
                        </tr>`
    )
}

function updateUserInList(user) {

    userFields.map(field => $(`#${user.identifier}-${field}`).text(`${user[field]}`));
    $(`#${user.identifier}-btn button`).attr("onclick", `window.editUser(` + JSON.stringify(user) + `)`)

}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

window.isNumber = (evt) => {
    
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    console.log(charCode)
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 43) {
        return false;
    }
    return true;
}