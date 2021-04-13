import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie } from '../general.js'


$(document).ready(()=>{
    getServices();
});

function getServices(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/services/items`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
          }
    });
    
    request.done(function (response, textStatus, jqXHR){
        let servicesListHTML = ''
        response.map(user => {
                servicesListHTML+=`<tr>
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
        });

        $("#services-list").html(servicesListHTML)
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de servicios")
    });



}