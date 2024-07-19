import { Component } from "react";

import CollapsibleExample from "../navbar";
import Notes from "../todo/Notes";
import "./index.css"

class Home extends Component{

toappointment = ()=>{
    this.props.history.push('/appointment');
}


    render(){
        return(
            <div className="app-container">
                <CollapsibleExample />
              
                <Notes />
                
            </div>
        )
    }
}

export default Home