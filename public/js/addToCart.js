async function addToForm (productId, userId , productPrize){
    console.log("clicking")
    console.log(productId)
    console.log(userId)
    console.log(productPrize)
    const qty = 1

    try{
         const res = await fetch("/cart" , {
         method:"POST",
         body:JSON.stringify({productId, userId , qty ,productPrize}),
         headers:{"Content-Type":"application/json"}
        })

        const data = await res.json()
        console.log(data)
        if(data.message.includes("success")){
           location.assign("/cart") 
        }
    }
    catch(err){
        console.log(err)
    }
} 