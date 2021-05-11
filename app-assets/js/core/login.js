import environment from '../../../environment.js'
import { getCookie, checkLogin, delete_cookie } from './general.js'

window.app = ''

$(document).ready(() => {
    login();

    const parts = window.location.href.split('/');
    window.app = parts.pop() || parts.pop(); // handle potential trailing slash

});

function checkLonginL() {

    const request = checkLogin();

    request.done(function(response, textStatus, jqXHR) {

        $("#login-btn").show()
        $("#login-spinner").hide()

        if(response.type_users=="pacients"){
            
            $("#request-error").text("You are not authorized to enter the platform")
            $("#request-error").show()

            delete_cookie("identifier");
            delete_cookie("Authorization");
            delete_cookie("application");
            delete_cookie("user");

            return;
        }

        if (response.type_users == "admins") {
            window.location.href = "./admin/calendar.html";
        }

        if (response.type_users == "doctors") {
            window.location.href = "./doctor/calendar.html";
        }

        
        
        
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        $("#login-btn").show()
        $("#login-spinner").hide()
    });


}

function login() {

    $("#login-form").submit(function(e) {

        if ($("#login-form").valid()) {

            e.preventDefault();

            $("#login-btn").hide()
            $("#login-spinner").show()
            $("#request-error").text("")
            $("#request-error").hide()

            const email = $("#login-email").val();
            const password = $("#login-password").val();
            const application = window.app;

            const request = $.ajax({
                url: `${environment.apiURL}/auth/login`,
                type: "post",
                beforeSend: function(req) {
                    req.setRequestHeader("accept", "application/json");
                    req.setRequestHeader("Content-Type", "application/json");
                },
                data: JSON.stringify({ email, password, app: application, auth_type: "web" })
            });

            request.done(function(response, textStatus, jqXHR) {

                document.cookie = `identifier=${response.identifier}; Path=/;`;
                document.cookie = `Authorization=${response.token}; Path=/;`;
                document.cookie = `application=${application}; Path=/;`;
                document.cookie = `user=${JSON.stringify(response)}; Path=/;`;
                checkLonginL();

            });

            request.fail(function(jqXHR, textStatus, errorThrown) {

                $("#request-error").text(jqXHR.responseJSON.message)
                $("#request-error").show()
                $("#login-spinner").hide()
                $("#login-btn").show()
            });


        }

    });

}