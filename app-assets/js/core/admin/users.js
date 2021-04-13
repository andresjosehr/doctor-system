import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(()=>{
    getUsers()
})

const userFields = ["identifier", "email", "password", "phone", "active", "type_users", "app"]
let clientMethod = '';


function getUsers(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/users`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
          }
    });
    
    request.done(function (response, textStatus, jqXHR){
        let userListHTML = ''
        response.map(user => {
            if(getCookie("identifier")!=user.identifier){
                userListHTML+=`<tr>
                                    <th id='${user.identifier}-identifier'>${user.identifier}</th>
                                    <th id='${user.identifier}-email'>${user.email}</th>
                                    <th id='${user.identifier}-phone'>${user.phone}</th>
                                    <th id='${user.identifier}-type_users'>${user.type_users}</th>
                                    <th id='${user.identifier}-active'>${user.active}</th>
                                    <th id='${user.identifier}-btn'>
                                        <button onClick='window.editUser(`+JSON.stringify(user)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#usersModal">
                                            Edit
                                        </button>
                                    </th>
                                </tr>`
            }
        });

        $("#users-list").html(userListHTML)
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

window.editUser=(user)=>{

    $("#form-error").text("")
    userFields.map(field => $(`#${field}-error`).hide() )

   clientMethod="edit"
   userFields.map((field) => $(`#${field}`).val(String(user[field])) )

   $("#password").val("");
   $("#password").prop('disabled', true);
   $("#app").prop('disabled', true);
   $("#type_users").prop('disabled', true);
    
}

window.createUser=()=>{

    $("#form-error").text("")
    userFields.map(field => $(`#${field}-error`).hide() )

    clientMethod="create" 
   $("#password").prop('disabled', false);
   $("#password").prop('disabled', false);
   $("#app").prop('disabled', false);
   $("#type_users").prop('disabled', false);
   userFields.map((field) => $(`#${field}`).val(""))

}


window.manageUser=()=>{

    $("#form-error").text("")
    userFields.map(field =>{
        $(`#${field}-error`).hide()
        if(!$(`#${field}`).val()){
            $(`#${field}-error`).show()
        }
    });
    if(clientMethod=="edit"){
        $("#password-error").hide()
    }

    if(
        !$("#email").val()       ||
        !$("#phone").val()       ||
        !$("#active").val()      ||
        !$("#type_users").val()  
    ){
        
        return;

    }

    const identifier = $("#identifier").val();
    const path = clientMethod=="create" ? "/v1/users" : `/v1/users/${identifier}`;

    const userData = {
        
            email: $("#email").val(), 
            phone: $("#phone").val(), 
            active: $("#active").val()=="true" ? true : false
        
    };

    if(clientMethod=="create"){
        userData["password"] = $("#password").val();
        userData["password2"] = $("#password").val();
        userData["type_users"] = $("#type_users").val();
        userData["app"] = $("#app").val();
    }

    $("#user-btn").hide()
    $("#user-spinner").show()
    
    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: clientMethod=="create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
            
        },
        data: JSON.stringify(userData)
    }); 


    let actionWord=clientMethod=="create" ? "created" : "updated";
     request.done((response)=>{

        $("#user-btn").show()
        $("#user-spinner").hide()
        swal("Done", `The user was ${actionWord} succefully`, "success");
        
        if(clientMethod=="create"){
            addUserToList(actionWord=clientMethod=="create" ? response : userData)
        } else {
            updateUserInList({
                identifier: $("#identifier").val(),
                type_users: $("#type_users").val(),
                ...userData
            })
        }
    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){

        $("#user-btn").show();
        $("#user-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function addUserToList(user){
    $("#users-list").append(
        `<tr>
                            <th id='${user.identifier}-identifier'>${user.identifier}</th>
                            <th id='${user.identifier}-email'>${user.email}</th>
                            <th id='${user.identifier}-phone'>${user.phone}</th>
                            <th id='${user.identifier}-type_users'>${user.type_users}</th>
                            <th id='${user.identifier}-active'>${user.active}</th>
                            <th id='${user.identifier}-btn'>
                                <button onClick='window.editUser(`+JSON.stringify(user)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#usersModal">
                                    Edit
                                </button>
                            </th>
                        </tr>`
    )
}

function updateUserInList(user){

    userFields.map( field => $(`#${user.identifier}-${field}`).text(`${user[field]}`) );
    $(`#${user.identifier}-btn button`).attr("onclick", `window.editUser(`+JSON.stringify(user)+`)`)

}