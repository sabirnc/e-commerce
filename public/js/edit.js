

function editDetails(id , name , color , stock , size, category, price ){
console.log(id)    
const arr = ["name" , "color" , "availablity" , "size" , "category" , "price"]   
const detail = [name , color , stock , size , category , price]
console.log(detail)
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
   const editError = document.querySelector("#edit-"+id) 
   const name = productDiscription.children[0].value
   const color = productDiscription.children[1].value
   const stock = productDiscription.children[2].value
   const size = productDiscription.children[3].value
   const category = productDiscription.children[4].value
   const price = productDiscription.children[5].value
   editError.textContent = ""
   try{
    const res = await fetch("/admin/edit-product" ,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,color,stock,size,category,price,id})
    })
    const data = await res.json() 
    console.log(data)
    if(data.data){
        productDiscription.innerHTML = ""
        for(i=0;i<6;i++){
            console.log("hello")
            const label = document.createElement("label")
            label.textContent = arr[i] + ":"
            const h3 = document.createElement("h3")
            h3.textContent = data.data[arr[i]]
            productDiscription.appendChild(label)
            productDiscription.append(h3)

        }
        saveBtn.remove()
        btnGroup.insertBefore(editBtn,btnGroup.children[0])
    }
    if(data.error){
      console.log(editError)
      editError.textContent = data.error + " value not allowed in path " + data.path
    }
   }catch(err){
    console.log(err)
   }
})


 
   
}


// function editDetails(id , name , color , stock , size , catergory){
//     const arr = []  
//     arr.push(name)
//     arr.push(color)
//     arr.push(stock)
//     arr.push(size)
//     arr.push(catergory)
//     const productDiscription =  document.getElementById(id)
//     const btnGroup = document.getElementById("btn-group"+id) 
//     console.log(btnGroup)
//     const children = productDiscription.children
//     productDiscription.innerHTML = ' '
//     for(i = 0; i < 5; i++){
//       const input = document.createElement("input")
//       input.classList.add("edit-input")
//       input.value = arr[i]
//       productDiscription.appendChild(input) 
//     }
//     const editBtn = btnGroup.children[0]
//     btnGroup.children[0].remove()
//     const saveBtn = document.createElement("button")
//     saveBtn.classList.add("btn","btn-primary" , "save-btn")
//     saveBtn.innerHTML = "save"
//     btnGroup.insertBefore(saveBtn , btnGroup.children[0])

//     saveBtn.addEventListener("click" , async () => {
//       const name = productDiscription.children[0].value
//       const color = productDiscription.children[1].value
//       const stock = productDiscription.children[2].value
//       const size = productDiscription.children[3].value
//       const catergory = productDiscription.children[4].value

//       try{
//          const res = await fetch("/admin/edit-product",{
//           method:"POST",
//           headers:{"Content-Type":"application/json"},
//           body:JSON.stringify({name , color , stock , size , catergory, id})
//          })

//          const data = await res.json()
//          console.log(data)

//          if(data){
//           saveBtn.remove()
//           const arr2 = []
//           productDiscription.innerHTML = ""
//           for(const property in data){
//               arr2.push(data[property])
//           }
//           console.log(arr2)
//           for(i=0; i < 5; i++){
//               const h3 = document.createElement("h3")
//               h3.textContent = arr2[i]
//               productDiscription.appendChild(h3)
//           }
//           btnGroup.insertBefore(editBtn , btnGroup.firstChild)
//          }
        
//       }
//       catch(err){
//           console.log(err)
//       }


//     })}
     