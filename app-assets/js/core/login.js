import environment from '../../../environment.js'
import { getCookie, checkLogin } from './general.js'

/* console.log(getCookie("Authorization")); */

$(document).ready(()=>{
    login();
});

function checkLonginL(){

    const request = checkLogin();

    request.done(function (response, textStatus, jqXHR){

        if($(location).attr('href')==environment.appUrl){
            if(response.type_users=="admins"){
                window.location.href = "./admin/calendar.html";
            }

            if(response.type_users=="doctors"){
                window.location.href = "./doctor/calendar.html";
            }
            $("#login-btn").show()
            $("#login-spinner").hide()
        }
    });

    request.fail(function (jqXHR, textStatus, errorThrown){
        $("#login-btn").show()
        $("#login-spinner").hide()
    });


}

function login(){

    $("#login-form").submit(function(e){
        
        if($("#login-form").valid()){

            e.preventDefault();

            $("#login-btn").hide()
            $("#login-spinner").show()
            $("#request-error").text("")
            $("#request-error").hide()

            const email = $("#login-email").val();
            const password = $("#login-password").val();
            const application = $("#login-application").val();

            const request = $.ajax({
                url: `${environment.apiURL}/auth/login`,
                type: "post",
                beforeSend: function(req) {
                    req.setRequestHeader("accept", "application/json");
                    req.setRequestHeader("Content-Type", "application/json");
                  },
                data: JSON.stringify({ email, password, app: application })
            });
            
            request.done(function (response, textStatus, jqXHR){

                document.cookie = `identifier=${response.identifier}; Path=/;`;
                document.cookie = `Authorization=${response.token}; Path=/;`;
                document.cookie = `application=${application}; Path=/;`;
                checkLonginL();
                
            });
            
            request.fail(function (jqXHR, textStatus, errorThrown){

                $("#request-error").text(jqXHR.responseJSON.message)
                $("#request-error").show()
                $("#login-spinner").hide()
                $("#login-btn").show()
            });


        }

    });

}