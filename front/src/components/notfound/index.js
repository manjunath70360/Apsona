import "./index.css"
import CollapsibleExample from "../navbar"

const NotFound = ({history})=>{

   const onclickhome = ()=>{
        history.push("/home")
    }

    return(
        <div className="not-found-container">
            <CollapsibleExample />
            <div className="text-content">
                <h1 className="error-num">404</h1>
                <h2 className="sub-text">Oops! This Page Could Not Be Found</h2>
                <p className="sub-para">SORRY BUT THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST, HAVE BEEN REMOVED. NAME CHANGED OR IS TEMPORARILY UNAVAILABLE</p>
                <button type="button" onClick={onclickhome} className="home-btn">GO TO HOMEPAGE</button>
            </div>
        </div>

    )
}

export default NotFound