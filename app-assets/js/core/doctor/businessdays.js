
import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie, checkLonginAdministrator, checkLonginGeneral } from './../general.js'

$(document).ready(()=>{
    checkLonginGeneral(function(){

    
        const user = JSON.parse(getCookie("user"));
        console.log(user)

        Object.entries(user.work_weeks).map((day) =>{

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



})
})

const dayOfTheWeek= [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ]
let app;



window.updateWorkWeek = (day) =>{



    const request = $.ajax({
        url: `${environment.apiURL}/v1/users/${getCookie("identifier")}/week/${capitalizeFirstLetter(day)}`,
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

        swal("Done", `The day has been updated succefully`, "success");
    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){
        
        swal("Done", `An error ocurred during request`, "warning");

    });


}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }