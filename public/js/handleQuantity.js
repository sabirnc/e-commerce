
async function incrementQuantity(qty , productId , len){
  const cartProduct = document.getElementById("cart-item-"+productId)  
  const total = document.getElementById("total")
  const grandTotal = document.getElementById("grandtotal")
  let count = 0
  count+=1
  if(count >= 10){
    count =10
  }
  if(count <= 0 ){
    count = 1
  }
  try{
    const res = await fetch("/increment" , {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({qty ,count , productId})
    })
    const data = await res.json()
    if(data.newCart){
      data.newCart.item.map( (product , index ) => {
        if(index == len){
          cartProduct.innerHTML = 
          `
          <td class="product-col">
              <div class="product">
                  <figure class="product-media">
                      <a href="#">
                          <img src="/product/${product.product.productImage[0]}" alt="Product image">
                      </a>
                  </figure>

                  <h3 class="product-title">
                      <a href="#">${product.product.productName}</a>
                  </h3><!-- End .product-title -->
              </div><!-- End .product -->
          </td>
          <td class="price-col">$${product.product.productPrize}</td>
          <td class="quantity-col">
          <div class="cart-product-quantity quantity" >
              <span class="material-symbols-outlined add" onclick="decrement('${product.quantity}' ,'${product.product._id}', '${index}')">
                  remove
              </span>
               ${product.quantity}
               <span class="material-symbols-outlined add" onclick="incrementQuantity('${product.quantity}','${product.product._id}', '${index}')">
                  add
              </span>
          </div>
          </td>
          <td class="total-col">$${product.totalPrice}</td>
          <td class="remove-col"><button onclick="deleteCartItem('${product.product._id}' , '${product.quantity}' , '${product.totalPrice}')" class="btn-remove"><i class="icon-close"></i></button></td>
            `
        }
      })

      total.innerHTML = data.newCart.total
      grandTotal.innerHTML = data.newCart.total

    }

    if(data.message){
      const stock = 
      `<tr style="display: none;" id="stock">
      <td class="error">out of stock</td>
      </tr>`  
      cartProduct.innerHTML += stock
    }
  }
  catch(err){
    console.log(err)
  }

}

async function decrement(qty , productId , len){
let count = 1 
const cartProduct = document.getElementById("cart-item-"+productId)  
const total = document.getElementById("total")
const grandTotal = document.getElementById("grandtotal")  
  qty -= 1
  
  if(qty < 1){
    qty = 1
    count = 0
  }
  try{
    console.log("qty :" + qty)
    const res = await fetch("/decrement",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({qty , count , productId})
    })

    const data = await res.json()
    if(data.newCart){
        data.newCart.item.map( (product , index ) => {
          if(index == len){
            cartProduct.innerHTML = 
            `
            <td class="product-col">
                <div class="product">
                    <figure class="product-media">
                        <a href="#">
                            <img src="/product/${product.product.productImage[0]}" alt="Product image">
                        </a>
                    </figure>
  
                    <h3 class="product-title">
                        <a href="#">${product.product.productName}</a>
                    </h3><!-- End .product-title -->
                </div><!-- End .product -->
            </td>
            <td class="price-col">$${product.product.productPrize}</td>
            <td class="quantity-col">
            <div class="cart-product-quantity quantity" >
                <span class="material-symbols-outlined add" onclick="decrement('${product.quantity}' ,'${product.product._id}' , '${index}')">
                    remove
                </span>
                 ${product.quantity}
                 <span class="material-symbols-outlined add" onclick="incrementQuantity('${product.quantity}','${product.product._id}', '${index}')">
                    add
                </span>
            </div>
            </td>
            <td class="total-col">$${product.totalPrice}</td>
            <td class="remove-col"><button onclick="deleteCartItem('${product.product._id}' , '${product.quantity}' , '${product.totalPrice}')" class="btn-remove"><i class="icon-close"></i></button></td>
              `
          }
        })
        total.innerHTML = data.newCart.total
        grandTotal.innerHTML = data.newCart.total
  
      }
  }
  catch(err){
    console.log(err)
  }

}