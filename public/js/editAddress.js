
async function editAddress(id , name , streetAdress , phoneNumber ,city , state , country , postcode){
const div = document.getElementById("div") 
const addressDetail = document.getElementById("addressDetail-"+id)
const buttonGroup = document.getElementById("button-group-"+id)    
const addressDetails = [ name , streetAdress, phoneNumber , city , state , country , postcode ]  
addressDetail.innerHTML = ""
const detail = ["firstName" , "streetAddress" , "phoneNumber" , "city" , "state" , "country" , "postcode"]
const firstName = name
const StreetName = streetAdress 
const phonenumber = phoneNumber
const City = city
const State = state
const Country = country
const postCode = postcode
const editBtn = buttonGroup.children[0]
 buttonGroup.children[0].remove()
 for(i=0;i<7;i++){
    const input = document.createElement("input")
    input.classList.add("edit-input")
    input.placeholder = detail[i]
    input.value = addressDetails[i]
    addressDetail.appendChild(input)
 }
 const saveBtn = document.createElement("button")
 saveBtn.classList.add( "btn" ,"btn-outline-primary-2")
 saveBtn.textContent = "save changes"
 buttonGroup.insertBefore(saveBtn , buttonGroup.firstChild)

 saveBtn.addEventListener("click", async function(){
    if(confirm("save changes")){
       const name =  addressDetail.children[0].value
       const streetAdress =  addressDetail.children[1].value
       const phoneNumber =  addressDetail.children[2].value
       const city =  addressDetail.children[3].value
       const state =  addressDetail.children[4].value
       const country =  addressDetail.children[5].value
       const postcode =  addressDetail.children[6].value
       
       try{
        const res = await fetch("/edit-address" , {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id , name , streetAdress , phoneNumber , city , state , country , postcode})
        })
        const data = await res.json()
        let html = ""
        if(data.user){
          div.innerHTML = ""
          data.user.UserAddress.map( address => {
        html += `
              <div class="card">
                <div class="card-body"  >
                   <div id="addressDetail-${address._id}">
                   <input type="radio" name="select" onclick="selectAddress('${address.firstName}' , '${address.streetAdress}' , '${address.streetAdress}' , '${address.city}' , '${address.state}','${address.city}','${address.postcode}')">
                    <h5 class="card-title"><b>${address.firstName}</b> </h5>
                    <p class="card-text"><b>${address.streetAdress}</b> </p>
                    <p class="card-text"><b>${address.phoneNumber}</b> </p>
                    <p class="card-text"><b>${address.city}</b></p>
                    <p class="card-text"><b>${address.state}</b></p>
                    <p class="card-text"><b>${address.country}</b> </p>
                    <p class="card-text"><b>${address.postcode}</b> </p>
                   </div>
                    <div id="button-group-${address._id}">
                        <button class="btn btn-outline-primary-2" onclick="editAddress('${address._id}' ,'${address.firstName}','${address.streetAdress}' , '${address.phoneNumber}', '${address.city}', '${address.state}','${address.country}','${address.postcode}')">
                            <span>edit address</span>
                        </button>

                        <button class="btn btn-outline-primary-2" onclick="deleteAddress('${address._id}')">
                            <span class="btn-text"><a href="">Delete</a></span>
                             <span class="btn-hover-text">Delete</span> 
                        </button>
                    </div>   
                </div>
            </div>
            `
          })

          div.innerHTML += html
          const newAddress = `   <div class="col-sm">
          <button class="btn btn-outline-primary-2" data-toggle="modal" data-target=".bd-example-modal-lg" onclick="newAddress()">
              <span>New address</span>
          </button>
       </div>`
        div.innerHTML += newAddress
        }
        if(data.error){
         alert("invalid " + data.error)
        }
       }
       catch(err){
        console.log(err)
       }
       
    }else{
      addressDetail.innerHTML = 
`     <div id="addressDetail-${id}">
      <h5 class="card-title"><b>${firstName}</b> </h5>
      <p class="card-text"><b>${StreetName}</b> </p>
      <p class="card-text"><b>${phonenumber}</b> </p>
      <p class="card-text"><b>${City}</b></p>
      <p class="card-text"><b>${State}</b></p>
      <p class="card-text"><b>${Country}</b> </p>
      <p class="card-text"><b>${postCode}</b> </p>
     </div>`  
      saveBtn.remove()
      buttonGroup.insertBefore(editBtn , buttonGroup.firstChild)
    }
 })

}

