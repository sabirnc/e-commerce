

function editDetails(id , name , color , stock , size, category, price ){      
const arr = ["name" , "color" , "availablity" , "size" , "category" , "price"]   
const detail = [name , color , stock , size , category , price]
const productName = name
const productColor = color
const productStock = stock
const productSize = size
const productCategory = category
const productPrice = price
const productDiscription = document.getElementById(id)
const btnGroup = document.getElementById("btn-group"+id)    
productDiscription.innerHTML = ""
const editBtn = btnGroup.children[0]
btnGroup.children[0].remove()
for(i=0;i<6;i++){
   const input = document.createElement("input") 
   input.classList.add("edit-input")
   input.placeholder = `enter product ${arr[i]}`
   input.value = detail[i]
   productDiscription.appendChild(input)
}
const saveBtn = document.createElement("button")
 saveBtn.classList.add("save-btn" ,"btn" , "btn-primary")
 saveBtn.textContent = "save"
 btnGroup.insertBefore(saveBtn , btnGroup.firstChild)
 saveBtn.addEventListener("click", async () => {
   editError = document.querySelector("#edit-"+id) 
   const name = productDiscription.children[0].value
   const color = productDiscription.children[1].value
   const stock = productDiscription.children[2].value
   const size = productDiscription.children[3].value
   const category = productDiscription.children[4].value
   const price = productDiscription.children[5].value
   editError.textContent = ""
   if(confirm("are you sure to save changes")){
    try{
        const res = await fetch("/admin/edit-product" ,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({name,color,stock,size,category,price,id})
        })
        const data = await res.json() 
        if(data.data){
            productDiscription.innerHTML = ""
            productDiscription.innerHTML = `<h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">${data.data.name}</a></h3>
            <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">color:${data.data.color}</a></h3>
            <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">availablity:${data.data.availablity} </a></h3>
            <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">size: ${data.data.size} </a></h3>
            <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">category: ${data.data.category} </a></h3>
            <h4 class="price">
                <span class="regular-price line-through">price: $ ${data.data.price}</span>
                <!-- <span class="offer-price">$90.00</span> -->
            </h4>`
            saveBtn.remove()
            btnGroup.insertBefore(editBtn,btnGroup.children[0])
        }
        if(data.error){
          editError.textContent = data.error + " value not allowed in path " + data.path
        }
       }catch(err){
        console.log(err)
      }
   }else{
     productDiscription.innerHTML = 
     `<h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">${productName}</a></h3>
     <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">color:${productColor}</a></h3>
     <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">availablity:${productStock} </a></h3>
     <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">size: ${productSize} </a></h3>
     <h3><a href="#" class="right-sidebar-toggle butn-header" data-sidebar-id="main-right-sidebar">category: ${productCategory} </a></h3>
     <h4 class="price">
         <span class="regular-price line-through">price: $ ${productPrice}</span>
         <!-- <span class="offer-price">$90.00</span> -->
     </h4>`
     saveBtn.remove()
     btnGroup.insertBefore(editBtn,btnGroup.children[0])

   }
})


 
   
}

     