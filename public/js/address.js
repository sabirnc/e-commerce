
const address = document.getElementById("checkOut")
async function addAddress(){ 
    const firstName = document.getElementById("firstName").value
    const lastName = document.getElementById("lastName").value
    const companyName = document.getElementById("companyName").value
    const country = document.getElementById("country").value
    const streetAdress = document.getElementById("houseName").value
    const city = document.getElementById("city").value
    const state = document.getElementById("state").value
    const postcode = document.getElementById("postcode").value
    const phone = document.getElementById("phone").value
    const email = document.getElementById("email").value
    const placeOrderBtn = document.querySelector("#placeOrder")
    const modal = document.querySelector("#exampleModalCenter")
    const form = document.querySelector("#checkOut")
    const firstNameError = document.querySelector(".error.firstname")
    const lastNameError = document.querySelector(".error.lastname")
    const countryError = document.querySelector(".error.country")
    const streetadressError = document.querySelector(".error.streetadress")
    const cityError = document.querySelector(".error.city")
    const StateError = document.querySelector(".error.state")
    const postcodeError = document.querySelector(".error.postcode")
    const phoneError = document.querySelector(".error.phone")
    const emailError = document.querySelector(".error.email")
    const paymentError = document.querySelector(".error.payment")
    // reseting the error values
    firstNameError.textContent = ""
    countryError.textContent = ""
    phoneError.textContent = ""
    lastNameError.textContent = ""
    StateError.textContent = ""
    


     // regex pattern 
     const pattern =  /[^a-zA-Z0-9\s]/g

    if(firstName.length < 3 ){
      firstNameError.textContent = "required 4 characters"  
    }else if(country.length < 3){
      countryError.textContent = "enter valid country name"
    }
    else if(phone.length > 10){
      phoneError.textContent = "invalid phone number"
    }
    else if(pattern.test(firstName)){
      firstNameError.textContent = "special character not allowed"
    }
    else if(pattern.test(lastName)){
      lastNameError.textContent = "special characters not allowed"
    }
    else if(lastName.length < 3 || lastName == ""){
      lastNameError.textContent = "required 4 characters"
    }
    else if (pattern.test(country)){
      countryError.textContent = "special characters not allowed"
    }
    else if(country.length < 3 || country == ""){
      countryError.textContent = "required 4 character"
    }
    else if (pattern.test(state)){
      StateError.textContent = "special characters not allowed"
    }else if(state.length < 3 || state == ""){
      StateError.textContent = "required minimum character"
    }
    else if (pattern.test(city)){
      cityError.textContent = "special characters not allwed"
    }
    else if(city.length < 3 || city == ""){
      cityError.textContent = "required minimum character"
    }
    else if(streetAdress.length < 10 || streetAdress == ""){
      streetadressError.textContent = "enter your correct address"
    }
    else{
      try{
        const res = await fetch("/add-address",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({firstName , lastName , companyName ,  country , streetAdress , city , state , postcode , phone , email})
      })
  
      const data = await res.json()
      if(data.message ){
        location.reload()
      }
  
      if(data.error){
        firstNameError.textContent = data.error.firstName
        lastNameError.textContent = data.error.lastName
        streetadressError.textContent = data.error.streetAdress
        cityError.textContent = data.error.city
        StateError.textContent = data.error.state
        countryError.textContent = data.error.country
        postcodeError.textContent = data.error.postcode
        phoneError.textContent = data.error.phone
        emailError.textContent = data.error.email
  
        alert("invalid " + data.error)
      }
  
      }
      catch(err){
        console.log(err)
      }
    }


}

async function deleteAddress(id){
  try{
    const res = await fetch("/delete-address",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id})
    })

    const data = await res.json()

    if(data.message){
      location.reload()
    }
  }
  catch(err){
    console.log(err)
  }
}


