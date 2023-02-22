
async function  addToWishlist(id){ 
  const res = await fetch("/addToWishlist", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})
  })
  
  const data = await res.json()
   if(data.message){
    $('#exampleModalCenter').modal('show');
   }

}

async function deleteProduct (id) {
  const res = await fetch("/delete-product" , {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})
  })

  const data = await res.json()
  if(data.message == "Ok"){
    location.reload()
  }
}