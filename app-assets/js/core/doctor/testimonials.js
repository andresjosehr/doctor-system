import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie } from '../general.js'


$(document).ready(()=>{
    getTestimonials();
});

const testimonialFields = ["identifier", "fecha", "name", "photo", "text_testimonials", "active"]
let testimonialMethod = '';

function getTestimonials(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/testimonials`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
          }
    });
    
    request.done(function (response, textStatus, jqXHR){
        let testimonialsListHTML = ''
        response.map(testimonial => {
            testimonialsListHTML+=
                                `<tr id='${testimonial.identifier}'>
                                    <th id='${testimonial.identifier}-identifier'>${testimonial.identifier.slice(testimonial.identifier.length - 3)}</th>
                                    <th id='${testimonial.identifier}-fecha'>${formatDate(testimonial.fecha)}</th>
                                    <th id='${testimonial.identifier}-name'>${testimonial.name}</th>
                                    <th id='${testimonial.identifier}-text_testimonials'>${testimonial.text_testimonials}</th>
                                    <th id='${testimonial.identifier}-photo'>
                                        <img style='width: 70px;' src='${environment.apiURL}/images/testimonials/${testimonial.identifier}/photo' />
                                    </th>
                                                                        
                                    <th id='${testimonial.identifier}-btn' style=" display: flex; width: 180px; justify-content: space-between;">
                                        <button onClick='window.editTestimonial(`+JSON.stringify(testimonial)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#reviewsModal">
                                            Edit
                                        </button>
                                                                                <button onClick='window.deleteTestimonial(`+JSON.stringify(testimonial)+`)' type="button" class="btn btn-danger">
                                            Delete
                                        </button>
                                    </th>
                                </tr>`
        });

        $("#testimonials-list").html(testimonialsListHTML)
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de testimonials")
    });



}



window.editTestimonial=(testimonial)=>{

   $("#img-testimonial-edit img").show();

   $("#form-error").text("")
   testimonialFields.map(field => $(`#${field}-error`).hide() )

   testimonialMethod="edit"
   testimonialFields.map((field) => {
       if(field!="photo") {
        $(`#${field}`).val(String(testimonial[field]))   
       }
    } )

    $("#fecha").val(formatDate($("#fecha").val()))
    
}


window.createTestimonial=()=>{

    $("#img-testimonial-edit img").hide();

    $("#form-error").text("")
    testimonialFields.map(field => $(`#${field}-error`).hide() )

    testimonialMethod="create" 
    testimonialFields.map((field) => $(`#${field}`).val(""))


}


window.manageTestimonial=()=>{

    $("#form-error").text("")

    testimonialFields.map(field =>{
        $(`#${field}-error`).hide()
        if(!$(`#${field}`).val()){
            $(`#${field}-error`).show()
        }
    });

    if(
        !$('#name').val()     ||
        !$("#fecha").val()   ||
        !$("#text_testimonials").val()
    ){
        
        return;

    }

    const identifier = $("#identifier").val();
    const path = testimonialMethod=="create" ? "/v1/testimonials" : `/v1/testimonials/${identifier}`;

    const testimonialData = {
        name:  $('#name').val(),
        fecha:  $("#fecha").val(),
        active: $("#active-label").val()=="true",
        text_testimonials: $("#text_testimonials").val(),
        app: getCookie("application"),
    }

    console.log(testimonialData)



    $("#testimonial-btn").hide()
    $("#testimonial-spinner").show()
    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: testimonialMethod=="create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        },
        data: JSON.stringify(testimonialData)
    }); 
    

     request.done((response)=>{

        if($('#photo')[0].files[0]){
            if(testimonialMethod=="create"){
                uploadTestimonialPhoto(response, testimonialMethod);
            } else {
                uploadTestimonialPhoto(testimonialData, testimonialMethod);
            }
        } else{
            if(testimonialMethod=="create"){
                addTestimonialToList(response);
            } else {
                updateTestimonialInList({identifier: $('#identifier').val(), ...testimonialData});
            }
        }

        let actionWord=testimonialMethod=="create" ? "created" : "updated";
        $("#reviewsModal").modal("hide")
        $("#testimonial-btn").show()
        $("#testimonial-spinner").hide()
        swal("Done", `The testimonial was ${actionWord} succefully`, "success");

        
    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){

        $("#testimonial-btn").show();
        $("#testimonial-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function uploadTestimonialPhoto(testimonial, testimonialMethod){
    const iden = testimonial.identifier ? testimonial.identifier : $("#identifier").val()
    if($('#photo')[0].files[0]){
        const data = new FormData();
        data.append("testimonial", $('#photo')[0].files[0])

        const request = $.ajax({
            url: `${environment.apiURL}/v1/testimonials/${iden}/upload`,
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(req) {
                req.setRequestHeader("Authorization", getCookie("Authorization"));
            },
            data: data
        }); 


                let actionWord=testimonialMethod=="create" ? "created" : "updated";

        request.done((response)=>{
   
   
           $("#testimonial-btn").show()
           $("#testimonial-spinner").hide()
           swal("Done", `The testimonial was ${actionWord} succefully`, "success");
   
   
           if(testimonialMethod=="create"){
               addTestimonialToList(testimonial);
           } else {
            updateTestimonialInList({identifier: $('#identifier').val(), ...testimonialData});
           }
       }); 
   
       request.fail(function (jqXHR, textStatus, errorThrown){
   
           $("#testimonial-btn").show();
           $("#testimonial-spinner").hide();
           $("#form-error").text(jqXHR.responseJSON.message)
           swal("Done", `An error ocurred during request`, "warning");
   
       });
    } else {

            let actionWord=testimonialMethod=="create" ? "created" : "updated";

            $("#testimonial-btn").show();
            $("#testimonial-spinner").hide();
            swal("Done", `The testimonial was ${actionWord} succefully`, "success");

            if(testimonialMethod=="create"){
                    addTestimonialToList(testimonial);
            } else {
                updateTestimonialInList({identifier: $('#identifier').val(), ...testimonial});
            }
        }

}



function addTestimonialToList(testimonial){
    $("#testimonials-list").append(
        `<tr id='${testimonial.identifier}'>
                                    <th id='${testimonial.identifier}-identifier'>${testimonial.identifier.slice(testimonial.identifier.length - 3)}</th>
                                    <th id='${testimonial.identifier}-fecha'>${formatDate(testimonial.fecha)}</th>
                                    <th id='${testimonial.identifier}-name'>${testimonial.name}</th>
                                    <th id='${testimonial.identifier}-text_testimonials'>${testimonial.text_testimonials}</th>
                                    <th id='${testimonial.identifier}-photo'>
                                        <img style='width: 70px;' src='${environment.apiURL}/images/testimonials/${testimonial.identifier}/photo' />
                                    </th>
                                                                        
                                    <th id='${testimonial.identifier}-btn' style=" display: flex; width: 180px; justify-content: space-between;">
                                        <button onClick='window.editTestimonial(`+JSON.stringify(testimonial)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#reviewsModal">
                                            Edit
                                        </button>
                                                                                <button onClick='window.deleteTestimonial(`+JSON.stringify(testimonial)+`)' type="button" class="btn btn-danger">
                                            Delete
                                        </button>
                                    </th>
                                </tr>`
    )
}

function updateTestimonialInList(testimonial){

    testimonialFields.map( field => {
        if(field=="identifier"){
            $(`#${testimonial.identifier}-${field}`).text(`${testimonial[field].slice(testimonial[field].length - 3)}`) 
        }else {
            $(`#${testimonial.identifier}-${field}`).text(`${testimonial[field]}`) 
        }
    });

    $(`#${testimonial.identifier}-btn #edit`).attr("onclick", `window.editTestimonial(`+JSON.stringify(testimonial)+`)`)
    $(`#${testimonial.identifier}-btn #create`).attr("onclick", `window.deleteTestimonial(`+JSON.stringify(testimonial)+`)`)

}

window.deleteTestimonial = (testimonial) =>{
    const message = swal({
            title: "Wait!",
            text: "Are you sure to delete this testimonial?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {

            if (willDelete) {

                const request = $.ajax({
                            url: `${environment.apiURL}/v1/testimonials/${testimonial.identifier}`,
                            type: "delete",
                            beforeSend: function(req) {
                                    req.setRequestHeader("accept", "application/json");
                                    req.setRequestHeader("Content-Type", "application/json");
                                    req.setRequestHeader("Authorization", getCookie("Authorization"));
                            }
                    }); 
                    
            
                    request.done((response)=>{
                        swal("Testimonial deleted", { icon: "success" });
                        $(`#${testimonial.identifier}`).remove();
                    }); 
            
                    request.fail(function (jqXHR, textStatus, errorThrown){
            
                        swal("An error ocurred during request", { icon: "warning" });
            
                    });

            } else {
            }
        });
}

function formatDate(date){

    let d = new Date(date);
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    return `${ye}-${mo}-${da}`
}