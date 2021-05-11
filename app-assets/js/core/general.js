import environment from '../../../environment.js'



$(document).ready(()=>{
    checkLonginGeneral();
})

export let user;
export const checkLogin=()=>{


    const Authorization =  getCookie("Authorization");

    const request = $.ajax({
        url: `${environment.apiURL}/auth/info_user`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", Authorization);
        }
    });

    return request;
}


export const logout = ()=>{

    const Authorization =  getCookie("Authorization");

    const request = $.ajax({
        url: `${environment.apiURL}/auth/logout`,
        type: "get",
        beforeSend: function(req) {
            req.setRequestHeader("accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Authorization", Authorization);
        }
    });

    return request;

}



window.logoutL=()=>{


    const request = logout()

    request.done(function (response, textStatus, jqXHR){

        const app = getCookie("application");
        delete_cookie("identifier");
        delete_cookie("Authorization");
        delete_cookie("application");
        delete_cookie("user");
        
        window.location.href = `${environment.appUrl}/${app}`;

    });

    request.fail(function (jqXHR, textStatus, errorThrown){
        alert("Ha ocurrido un error cerrando tu sesion");
    });


}


export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const delete_cookie = (name) => {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export const checkLonginAdministrator=()=>{

    const request = checkLogin();

    request.done(function (response, textStatus, jqXHR){

        window.user=response
        if(response.type_users!="admins"){
            window.location.href = environment.appUrl;
        }
    });

    request.fail(function (jqXHR, textStatus, errorThrown){
        if(jqXHR.responseJSON.message=="Missing or malformed JWT"){
            window.location.href = environment.appUrl;
        }
    });
}



export const checkLonginDoctor=()=>{

    const request = checkLogin();

    request.done(function (response, textStatus, jqXHR){

        document.cookie = `user=${JSON.stringify(user)}; Path=/;`;
        if(response.type_users!="doctors"){
            window.location.href = environment.appUrl;
        }
    });

    request.fail(function (jqXHR, textStatus, errorThrown){
        if(jqXHR.responseJSON.message=="Missing or malformed JWT"){
            window.location.href = environment.appUrl;
        }
    });
}


export const checkLonginGeneral=(callback = () =>{} )=>{

    const request = checkLogin();

    request.done(function (response, textStatus, jqXHR){

        delete_cookie("user");
        document.cookie = `user=${JSON.stringify(response)}; Path=/;`;
        
        callback();

        if(!window.location.href.split("/").includes("doctor") && response.type_users=="doctors"){
            window.location.href = environment.appUrl+"/doctor";
        } 

        if(!window.location.href.split("/").includes("admin") && response.type_users=="admins"){
            window.location.href = environment.appUrl+"/admin";
        }

        


    });
}