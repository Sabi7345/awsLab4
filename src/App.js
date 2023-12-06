import React from "react";
import Nav from "./components/Nav";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignUp from "./components/SignUp";
import UpdatePassword from "./components/UpdatePassword";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import CreateList from "./components/CreateList";
import Edit from "./components/Edit";
import Admin from "./components/Admin";
import ReactModal from "react-modal";
const policies = require('./components/policies')

export default function App() {
  
  const [showLoginButton, setShowLoginButton] = React.useState(false);
  const [showBackButton, setBackButton] = React.useState(false)
  const [jwtToken, setJwtToken] = React.useState('')
  const [emailToken, setEmailToken] = React.useState('')
  const [showUpdatePassword, setUpdatePassword] = React.useState(false)
  const [user , setUser] = React.useState('')
  const [showCreateList, setCreateList] = React.useState(false)
  const [homeButton, setHomeButton] = React.useState(false)
  const [EditList, setEditList]= React.useState([])
  const [policy, setPolicy] = React.useState(policies.privacy)
  const [AUP, setAUP] = React.useState(policies.aup)
  const [DMCA, setDMCA] = React.useState(policies.dmcaTakedownProcedure)
    return (
      <Router>

        <Nav 
        loginState={showLoginButton}
        setShowLoginButton={setShowLoginButton}
        backButtonState = {showBackButton}
        setBackButton = {setBackButton}
        showUpdatePassword = {showUpdatePassword}
        setUpdatePassword = {setUpdatePassword}
        showCreateList={showCreateList}
        setCreateList={setCreateList}
        setHomeButton = {setHomeButton}
        homeButton = {homeButton}

        />
            <Routes>
                <Route exact path="/home"
                element = { <HomePage 
                jwtToken = {jwtToken}
                policy = {policy}
                AUP ={AUP}
                DMCA = {DMCA}
                
                
                />}>

                </Route>
                <Route exact path="/"
                element = {<LoginPage 
                setShowLoginButton={setShowLoginButton}
                setBackButton = {setBackButton}
                setUser = {setUser}
                setUpdatePassword = {setUpdatePassword}
                setJwtToken = {setJwtToken}
                showCreateList = {showCreateList}
                setCreateList = {setCreateList}
                />}>
                  
                </Route>
                <Route exact path = '/SignUp'
                element = {<SignUp 
                  setBack = {setBackButton}
                  setEmailToken = {setEmailToken}
                />}>
                
                </Route>

                <Route exact path = '/updatePassword'
                  element = {<UpdatePassword
                  jwtToken = {jwtToken}
                  
                  />}>

                </Route>

                <Route exact path="/createList"
                element = {<CreateList
                  showCreateList = {showCreateList}
                  setCreateList = {setCreateList}
                  setUpdatePassword ={setUpdatePassword}
                  jwtToken={jwtToken}
                  EditList = {EditList}
                  
                />}>

                </Route>

                <Route exact path="/edit"
                element = {<Edit
                EditList ={EditList}
                jwtToken = {jwtToken}

                />}>

                </Route>

                <Route exact path="/admin"
                element = {<Admin
                jwtToken={jwtToken}
                policy = {policy}
                setPolicy = {setPolicy}
                AUP={AUP}
                setAUP={setAUP}
                DMCA = {DMCA}
                setDMCA = {setDMCA}
                
                />}>
                  
                </Route>
                
            </Routes>
      </Router>
    );
  }