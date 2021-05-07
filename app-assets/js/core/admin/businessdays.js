
import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(()=>{
    getApp();
    getbranches();
    getUsers();
})

const dayOfTheWeek= [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ]
let apps;
let appSelected;
let branches;
let users;
let userSelected;

function getApp(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/apps`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
          }
    });
    
    request.done(function (response, textStatus, jqXHR){
        let holidayListHTML = ''
        apps = response;
        appSelected =  response[0]

        apps.map(app =>{
            $("#apps").append(`
                <option data-label="primary" value="${app.identifier}" selected>${app.name_app}</option>
            `)
        })

        $(`#apps`).val(appSelected.identifier)
        $(`#apps option[value="${appSelected.identifier}"]`).prop('selected', true);

        window.changeBranches();
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

function getbranches() {

    const request = $.ajax({
        url: `${environment.apiURL}/v1/branches`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        }
    });

    request.done(function(response, textStatus, jqXHR) {
        branches = response
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
        console.log(response)
        users = response
    });
}



window.updateWorkWeek = (day) =>{



    const request = $.ajax({
        url: `${environment.apiURL}/v1/users/${userSelected.identifier}/week/${capitalizeFirstLetter(day)}`,
        type: "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
            
        },
        data: JSON.stringify({
            start:  $(`#${day} .start`).val(),
            end:    $(`#${day} .end`).val(),
            active: $(`#${day} .active`).val()=="true"
          })
    }); 


    request.done((response)=>{

/*         apps.map(app =>{
            if(app.identifier==appSelected.identifier){
                app.work_weeks[day] = {
                    start:  $(`#${day} .start`).val(),
                    end:    $(`#${day} .end`).val(),
                    active: $(`#${day} .active`).val()=="true"
                  }
            }
        }) */

        swal("Done", `The day has been updated succefully`, "success");
    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){
        
        swal("Done", `An error ocurred during request`, "warning");

    });


}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }



  window.changeBussinesDays=()=>{

        $(".start").prop('disabled', false);
        $(".end").prop('disabled', false);
        $(".active").prop('disabled', false);
        $(".save").prop('disabled', false);
    
    if($("#users").val()==null){
        $(".start").prop('disabled', true);
        $(".end").prop('disabled', true);
        $(".active").prop('disabled', true);
        $(".save").prop('disabled', true);

        $(".start").val('');
        $(".end").val('');

        return false;
    }

    const request = $.ajax({
            url: `${environment.apiURL}/v1/users/${$("#users").val()}`,
            type: "get",
            beforeSend: function(req) {
                req.setRequestHeader("accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json");
                req.setRequestHeader("Authorization", getCookie("Authorization"));
            }
        });

        request.done(function(response, textStatus, jqXHR) {
            userSelected = response
            console.log(userSelected)

            Object.entries(userSelected.work_weeks).map((day) =>{

                /* $(`#${day[0]} .start`).val(day[1].start)
                $(`#${day[0]} .end`).val(day[1].end) */

                flatpickr(`#${day[0]} .start`, {
                    noCalendar: true,
                    enableTime: true,
                    dateFormat: "H:i",
                    defaultDate: new Date("2021-04-06 "+day[1].start)
                });

                flatpickr(`#${day[0]} .end`, {
                    noCalendar: true,
                    enableTime: true,
                    dateFormat: "H:i",
                    defaultDate: new Date("2021-04-06 "+day[1].end)
                });
                

                $(`#${day[0]} .active`).val(day[1].active)
                $(`#${day[0]} .active option[value="${day[1].active}"]`).prop('selected', true);


                    
            });

        });

      /* userSelected = users.find(user => user.identifier==$("#users").val()) */



  }


  window.changeBranches = () => {

    if(!branches){
        return window.changeUsers();
    }
    
    let branchesOptions = ''
    $("#branches").html("")
    branches.map(branch => branchesOptions += branch.app==$("#apps").val() ? `<option data-label="danger" value="${branch.identifier}">${branch.name}</option>` : "")
    $("#branches").append(branchesOptions)
    window.changeUsers();
}

window.changeUsers = () => {

    if(!users){
        return window.changeBussinesDays();
    }

    let userOptions = ''
    $("#users").html("")
    users.map(user => userOptions += user.branch==$("#branches").val() ? `<option data-label="danger" value="${user.identifier}">${user.name}</option>` : "")
    $("#users").append(userOptions)
    window.changeBussinesDays();
}