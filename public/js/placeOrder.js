function radioBtnValue() {
  const radio = document.getElementsByName("flexRadioDefault");
  for (i = 0; i < radio.length; i++) {
    if (radio[i].checked) {
      console.log(radio[i].value);
      return radio[i].value;
    }
  }
}

function openModal() {
  $("#exampleModalCenter").modal("show");
}

let detail;
const radio = document.getElementsByName("select");
console.log(radio)

function selectAddress(
  firstName,
  streetadress,
  phoneNumber,
  city,
  state,
  country,
  postcode
) {
  detail = {
    name: firstName,
    street: streetadress,
    mobile: phoneNumber,
    town: city,
    state: state,
    country: country,
    postcode: postcode,
  };
}

const paymentError = document.querySelector(".error.payment");


async function placeOrder(cart) {
  const element = document.getElementById("paypal-button-container");

  let paymentMethod = radioBtnValue();
  if (element.innerHTML == "thank you for the payment") {
    paymentMethod = "Recieved";
    paymentError.innerHTML = "";
  }
  try {
    let addressSelected = false
    for(i=0;i<radio.length;i++){
      if(radio[i].checked){
         addressSelected = true
      }
    }
    if (addressSelected) {
      console.log("checked")
      const res = await fetch("place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, detail }),
      });

      const data = await res.json();
      console.log(data);
      if (data.message) {
        openModal();
      }
      if (data.orderError) {
        paymentError.textContent = data.orderError.payment;
      }

      if (data.noitem) {
        alert("item not added in cart");
      }
    }else{
      alert("please select your address")
    }
  } catch (err) {
    console.log(err);
  }
}

async function cancelOrder(id) {
  try {
    const res = await fetch("/cancel-order", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    console.log(data);
    if (data.message) {
      location.reload();
    }
  } catch (err) {
    console.log(err);
  }
}
