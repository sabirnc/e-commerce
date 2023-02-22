
JSC.fetch("/get-orders")
.then(response => response.json())
.then(text => {  
 renderChart(text)

});


function renderChart(data){
   const chart  = new JSC.Chart("charts" , {
    type:"column",
    series: [
        {
            name:"Orders",
            points : data.eachday.map( item => {
                return {x:item._id , y:item.count}
             })
                
            
        }
    ]
   })
   return chart
}