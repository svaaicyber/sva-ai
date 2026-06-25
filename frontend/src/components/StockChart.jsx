import React from "react";

export default function StockChart({

ticker="RELIANCE"

}){

return(

<div
style={{
height:"500px",
width:"100%",
marginTop:"20px",
borderRadius:"20px",
overflow:"hidden"
}}
>

<iframe

title="TradingView"

src={`https://s.tradingview.com/widgetembed/?symbol=NSE%3A${ticker}&interval=D&theme=dark`}

width="100%"

height="100%"

frameBorder="0"

/>

</div>

);

}
