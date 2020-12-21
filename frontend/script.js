var url = "http://localhost:8000/"

async function loginUser() {
    let email = document.getElementById("loginemail").value
    let password = document.getElementById("loginpassword").value
    try {
        let result = await fetch(url + "login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json"
            },
        })
        let resultData = await result.json()
        alert(resultData.message)
    } catch (error) {
        console.log(error)
    }

}


async function signupUser() {
    let email = document.getElementById("signupemail").value
    let password = document.getElementById("password").value
    try {
        let result = await fetch(url + "signup", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "content-type": "application/json"
            },
        })
        let resultData = await result.json();
        // console.log(resultData)
        alert(resultData.message)


    } catch (error) {
        console.log(console.error())
    }
}


async function sendEmail(){
    var email=document.getElementById("email").value
    try{
        var result=await fetch(url+"sendEmail",{
            method:"POST",
            body:JSON.stringify({
                email
            }),
            headers:{
                "content-type":"application/json"
            }
        })
        let resultData=await result.json()
        console.log(resultData.message)
        alert(resultData.message)
        // newPassword()
    }catch(err){
        console.log(err)
    }
}

async function newPassword(){
    let email = document.getElementById("resetEmail").value
    let resetString=document.getElementById("resetString").value
    let password=document.getElementById("password").value
    try{
        var result=await fetch(url+"newPassword",{
            method:"PUT",
            body:JSON.stringify({
                email,
                resetString,
                password
            }),
            headers:{
                "content-type":"application/json"
            }
        })
        let resultData=await result.json()
        console.log(resultData)
        alert(resultData.message)
    }catch(err){
        console.log(err)
    }
}