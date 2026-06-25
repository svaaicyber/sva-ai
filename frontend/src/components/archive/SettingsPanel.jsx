import "./SettingsPanel.css";

export default function SettingsPanel(){

return(

<div className="settings-panel">

<h3>Settings</h3>

<div className="setting-row">

<span>Dark Mode</span>

<input type="checkbox" defaultChecked/>

</div>

<div className="setting-row">

<span>Animations</span>

<input type="checkbox" defaultChecked/>

</div>

<div className="setting-row">

<span>Voice Responses</span>

<input type="checkbox"/>

</div>

<div className="setting-row">

<span>Auto Save Memory</span>

<input type="checkbox" defaultChecked/>

</div>

</div>

)

}