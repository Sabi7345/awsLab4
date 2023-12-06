import "../componentCSS/Nav.css";
import { Link} from "react-router-dom";
import React from "react";

export default function Nav({loginState,setShowLoginButton, backButtonState, setBackButton, setUpdatePassword, showUpdatePassword, showCreateList, setCreateList, setHomeButton, homeButton}) {
  

  return (
    <nav className="nav">
      <h1 className="title">Superhero Searcher</h1>

       (
       {loginState && <Link to="/" className="login-button" onClick={() => setShowLoginButton(false)}>
          Login
        </Link>}

        {backButtonState && <Link to='/' className="back-button" onClick={()=>setBackButton(false)}> Back </Link>}
        
        {showUpdatePassword && <Link to='/updatePassword' className="updatePass" onClick={()=>{setUpdatePassword(false)}}>Update Password</Link>}

        {showCreateList && <Link to='/createList' className="createList" onClick={()=>{setCreateList(false); setUpdatePassword(false); setHomeButton(true);  }}>Create List</Link>}

        {homeButton && <Link to='/home' className="homeButton" onClick={()=>{setHomeButton(false); setCreateList(true); setUpdatePassword(true);}}>Back Home</Link>}
      )
    </nav>
  );
}

