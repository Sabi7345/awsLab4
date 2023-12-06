
import React, { useState } from "react";
import { Link, useNavigate} from "react-router-dom";


export default function LoginPage({ setShowLoginButton, setBackButton, setUser, setUpdatePassword, setJwtToken, showUpdatePassword, showCreateList, setCreateList}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate()
 
  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      alert('Both email and password are required.');
      return;
    }
    try {
      const userResponse = await fetch(`/api/getUserbyEmail/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        alert(errorData.error);
        return;
      }
  
      const user = await userResponse.json();
      if (user.status === 'pending') {
        alert('Email sent to your mailbox. Verify Email First.');
        const data = await fetch(`/sendmail/${email}/${user.emailVerificationToken}`, {
          method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
        if(!data.ok){
          const error = await data.json()
          alert(error);
          return;
        }
        const message = await data.json()
        alert(message.message)
        return; // Exit the function early
      }
  
      
  
      const loginResponse = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!loginResponse.ok) {
        
        loginResponse.json().then(data =>{alert(data.error)}).catch()
        return;
      }
  
      const data = await loginResponse.json();
     
      if(user.isAdmin){
        navigate('/admin')
        setUpdatePassword(false)
        setCreateList(false)
        setJwtToken(data.accessToken)
        return
      }
      else if(user.isDeactivated){
        alert('This account is Deactivated')
        return
      }
      else{
        alert('Login Successful');
        setBackButton(false)
        setJwtToken(data.accessToken)
        setUser(user) 
        setCreateList(true)
        setUpdatePassword(true)
      navigate('/home');
      }
     
    } catch (error) {
      alert(error);
    }
  }
  
  const handlePassowrdChange = (event) => {
    // Existing logic
    setPassword(event.target.value);
  
    // Sanitization logic
    const userInput = event.target.value;
    const sanitizedInput = userInput.replace(/[^a-zA-Z0-9]/g, '');
    setPassword(sanitizedInput);
  };
  const handleEmailChange = (event) => {
    // Existing logic
    setEmail(event.target.value);
  
    // Sanitization logic
    const userInput = event.target.value;
    const sanitizedInput = userInput.replace(/[^a-zA-Z0-9@.]/g, '');
    setEmail(sanitizedInput);
  };
  return (
    <div className="loginbox">
      <p id="blurb">Welcome to Superhero Searcher your ultimate destination for crafting and exploring lists of superheroes! Dive into the exciting world of comics and movies as you curate your personalized roster of legendary heroes. Whether you're a seasoned fan or a newcomer to the superhero universe, our platform offers an intuitive space to create, share, and discover epic lists featuring your favorite characters.</p>
      <label htmlFor="email">Email:</label>
      <input type="email" value={email} onChange={(event) => handleEmailChange(event)} name="" id="email" />
      <br />
      <br />

      <label htmlFor="pwd">Password:</label>
      <input type="password" pattern="[a-zA-Z0-9@.]+" id="pwd" value={password} onChange={(event) => handlePassowrdChange(event)} name="pwd" />
      <br />
      <Link to='/SignUp' onClick={() =>setBackButton(true)}>
        Create An Account  
      </Link>
      <br />
      <Link to='/home' onClick={() => setShowLoginButton(true)}>
        Continue As Guest
      </Link>
      <br />
      <button type="button" onClick={handleLogin} >Login</button> 
     
    </div>
  );
}


    
