import environment from '../../../../environment.js'
import { checkLogin, logout, getCookie } from '../general.js'


$(document).ready(()=>{
    getBlogs();
});

const blogFields = ["identifier", "sub_title", "text_blog", "title_blog"]
let blogMethod = '';

function getBlogs(){

    const request = $.ajax({
        url: `${environment.apiURL}/v1/blogs`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
          }
    });
    
    request.done(function (response, textStatus, jqXHR){
        let blogsListHTML = ''
        response.map(blog => {
                blogsListHTML+=`<tr id='${blog.identifier}'>
                                    <th id='${blog.identifier}-identifier'>${blog.identifier.slice(blog.identifier.length - 3)}</th>
                                    <th id='${blog.identifier}-title_blog'>${blog.title_blog}</th>
                                    <th id='${blog.identifier}-sub_title'>${blog.sub_title}</th>
                                    <th id='${blog.identifier}-fecha'>${blog.fecha}</th>
                                    <th id='${blog.identifier}-photo'>
                                    <img style='width: 70px;' src='${environment.apiURL}/images/blogs/${blog.identifier}/photo' />
                                    </th>
																		
                                    <th id='${blog.identifier}-btn' style=" display: flex; width: 180px; justify-content: space-between;">
                                        <button onClick='window.editBlog(`+JSON.stringify(blog)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#blogModal">
                                            Edit
                                        </button>
																				<button onClick='window.deleteBlog(`+JSON.stringify(blog)+`)' type="button" class="btn btn-danger">
                                            Delete
                                        </button>
                                    </th>
                                </tr>`
        });

        $("#blogs-list").html(blogsListHTML)
        
    });
    
    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Se ha producido un error en la consulta de blogs")
    });



}



window.editBlog=(blog)=>{

    $("#img-blog-edit img").attr("src", `${environment.apiURL}/images/blogs/${blog.identifier}/photo`);
    $("#img-blog-edit img").show();

   $("#form-error").text("")
   blogFields.map(field => $(`#${field}-error`).hide() )

   blogMethod="edit"
   blogFields.map((field) => $(`#${field}`).val(String(blog[field])) )
    
}


window.createBlog=()=>{

    $("#img-blog-edit img").hide();

    $("#form-error").text("")
    blogFields.map(field => $(`#${field}-error`).hide() )

    blogMethod="create" 
    blogFields.map((field) => $(`#${field}`).val(""))

}


window.manageBlog=()=>{

    $("#form-error").text("")

    blogFields.map(field =>{
        $(`#${field}-error`).hide()
        if(!$(`#${field}`).val()){
            $(`#${field}-error`).show()
        }
    });

    if(
        !$('#sub_title').val()       ||
        !$("#text_blog").val()       ||
        !$("#title_blog").val()
    ){
        
        return;

    }

    const identifier = $("#identifier").val();
    const path = blogMethod=="create" ? "/v1/blogs" : `/v1/blogs/${identifier}`;

    const blogData = {
        sub_title:  $('#sub_title').val(),
        text_blog:  $("#text_blog").val(),
        title_blog: $("#title_blog").val(),
				app: getCookie("application"),
				active: true
    }


    $("#blog-btn").hide()
    $("#blog-spinner").show()
    const request = $.ajax({
        url: `${environment.apiURL}${path}`,
        type: blogMethod=="create" ? "post" : "patch",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", getCookie("Authorization"));
        },
        data: JSON.stringify(blogData)
    }); 
    

     request.done((response)=>{


        if(blogMethod=="create"){
            uploadBlogPhoto(response, blogMethod);
        } else {
            uploadBlogPhoto(blogData, blogMethod);
        }

        $("#blogModal").modal('hide');

    }); 

    request.fail(function (jqXHR, textStatus, errorThrown){

        $("#blog-btn").show();
        $("#blog-spinner").hide();
        $("#form-error").text(jqXHR.responseJSON.message)
        swal("Done", `An error ocurred during request`, "warning");

    });


}


function uploadBlogPhoto(blog, blogMethod){

    if($('#photo')[0].files[0]){
        const data = new FormData();
        data.append("blog", $('#photo')[0].files[0])

        const request = $.ajax({
            url: `${environment.apiURL}/v1/blogs/${blog.identifier}/upload`,
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(req) {
                req.setRequestHeader("Authorization", getCookie("Authorization"));
            },
            data: data
        }); 


				let actionWord=blogMethod=="create" ? "created" : "updated";

        request.done((response)=>{
   
   
           $("#blog-btn").show()
           $("#blog-spinner").hide()
           swal("Done", `The blog was ${actionWord} succefully`, "success");
   
   
           if(blogMethod=="create"){
               addBlogToList(blog);
           } else {
               updateBlogInLit({identifier: $('#identifier').val().slice($('#identifier').val().length - 3), ...blogData});
           }
       }); 
   
       request.fail(function (jqXHR, textStatus, errorThrown){
   
           $("#blog-btn").show();
           $("#blog-spinner").hide();
           $("#form-error").text(jqXHR.responseJSON.message)
           swal("Done", `An error ocurred during request`, "warning");
   
       });
    } else {

			let actionWord=blogMethod=="create" ? "created" : "updated";

			$("#blog-btn").show();
			$("#blog-spinner").hide();
			swal("Done", `The blog was ${actionWord} succefully`, "success");

			if(blogMethod=="create"){
					addBlogToList(blog);
			} else {
				updateBlogInList({identifier: $('#identifier').val(), ...blog});
			}
		}

}



function addBlogToList(blog){
    $("#blogs-list").append(
        `<tr id='${blog.identifier}'>
            <th id='${blog.identifier}-identifier'>${blog.identifier.slice(blog.identifier.length - 3)}</th>
            <th id='${blog.identifier}-title_blog'>${blog.title_blog}</th>
            <th id='${blog.identifier}-sub_title'>${blog.sub_title}</th>
            <th id='${blog.identifier}-fecha'>${blog.fecha}</th>
            <th id='${blog.identifier}-photo'>
                <img style='width: 70px;' src='${environment.apiURL}/images/blogs/${blog.identifier}/photo' />
            </th>
            <th id='${blog.identifier}-btn' style=" display: flex; width: 180px; justify-content: space-between;">
                    <button id="edit" onClick='window.editBlog(`+JSON.stringify(blog)+`)' type="button" class="btn btn-primary" data-toggle="modal" data-target="#blogModal">
                        Edit
                    </button>
										<button id="delete" onClick='window.deleteBlog(`+JSON.stringify(blog)+`)' type="button" class="btn btn-danger">
                            Delete
                    </button>
                </th>
            </tr>`
    )
}

function updateBlogInList(blog){

		console.log(blog)
    blogFields.map( field => {
        if(field=="identifier"){
            $(`#${blog.identifier}-${field}`).text(`${blog[field].slice(blog[field].length - 3)}`) 
        }else{
            $(`#${blog.identifier}-${field}`).text(`${blog[field]}`) 
        }
    });
    $(`#${blog.identifier}-btn #edit`).attr("onclick", `window.editBlog(`+JSON.stringify(blog)+`)`)
		$(`#${blog.identifier}-btn #create`).attr("onclick", `window.deleteBlog(`+JSON.stringify(blog)+`)`)

}

window.deleteBlog = (blog) =>{
	const message = swal({
			title: "Wait!",
			text: "Are you sure to delete this blog?",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		}).then((willDelete) => {

			if (willDelete) {

				const request = $.ajax({
							url: `${environment.apiURL}/v1/blogs/${blog.identifier}`,
							type: "delete",
							beforeSend: function(req) {
									req.setRequestHeader("accept", "application/json");
									req.setRequestHeader("Content-Type", "application/json");
									req.setRequestHeader("Authorization", getCookie("Authorization"));
							}
					}); 
					
			
					request.done((response)=>{
						swal("Blog deleted", { icon: "success" });
						$(`#${blog.identifier}`).remove();
					}); 
			
					request.fail(function (jqXHR, textStatus, errorThrown){
			
						swal("An error ocurred during request", { icon: "warning" });
			
					});

			} else {
			}
		});
}