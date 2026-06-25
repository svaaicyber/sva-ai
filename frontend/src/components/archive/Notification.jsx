import "./Notification.css";

export default function Notification({

message,
show

}){

if(!show) return null;

return(

<div className="notify">

<div className="notify-dot"/>

{message}

</div>

)

}