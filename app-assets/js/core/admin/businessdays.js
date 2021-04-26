
import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator } from './../general.js'

$(document).ready(()=>{
    getApp();
})

const dayOfTheWeek= [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ]
let apps;
let appSelected;

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

        Object.entries(appSelected.work_weeks).map((day) =>{

            $(`#${day[0]} .start`).val(day[1].start)
            $(`#${day[0]} .end`).val(day[1].end)
            $(`#${day[0]} .active`).val(day[1].active)
            $(`#${day[0]} .active option[value="${day[1].active}"]`).prop('selected', true);

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

        })
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de usuarios")
    });



}

window.updateWorkWeek = (day) =>{



    const request = $.ajax({
        url: `${environment.apiURL}/v1/apps/${appSelected.identifier}/week/${capitalizeFirstLetter(day)}`,
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

        apps.map(app =>{
            if(app.identifier==appSelected.identifier){
                app.work_weeks[day] = {
                    start:  $(`#${day} .start`).val(),
                    end:    $(`#${day} .end`).val(),
                    active: $(`#${day} .active`).val()=="true"
                  }
            }
        })

        swal("Done", `The day has been updated succefully`, "success");
    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){
        
        swal("Done", `An error ocurred during request`, "warning");

    });


}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  window.changeApp=()=>{

      appSelected = apps.find(app => app.identifier==$("#apps").val())


      Object.entries(appSelected.work_weeks).map((day) =>{

        $(`#${day[0]} .start`).val(day[1].start)
        $(`#${day[0]} .end`).val(day[1].end)
        $(`#${day[0]} .active`).val(day[1].active)
        $(`#${day[0]} .active option[value="${day[1].active}"]`).prop('selected', true);
    });

  }