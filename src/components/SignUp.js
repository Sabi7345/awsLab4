

import React from "react";
import { useNavigate } from "react-router-dom";
export default function SignUp({setBack, setEmailToken}){
  const [email , setEmail] = React.useState('')
  const [password , setPassword] = React.useState('')
  const [username , setUsername] = React.useState('')
  const navigate = useNavigate()
     function handleCreateClick(e){
      e.preventDefault(); 
      if (!email.trim() || !password.trim() || !username.trim()) {
        alert('Enter All Required Info.');
        return;
      }

      fetch('/api/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      })
        .then(response => {
          console.log('Server response status:', response.status);
          
          if (!response.ok) {
            response.json().then(data => {
              alert(data.error);
              return
            }).catch(err => {
              console.log('Error parsing error response:', err);
            });
            
          }
          return response.json();
        })
        .then(data => {
          console.log('Data from server:', data);
          setEmailToken(data.emailToken)
          setBack(false)
          alert('User created successfully Now Verify your Email');
          navigate('/');
          return
        })
        .catch(error => {
          
          alert(error);
        });
      
    }
    return(
        <form className="SignUpbox">
      <label htmlFor="username">Username:</label>
      <input type="text" value = {username} onChange={(e)=>setUsername(e.target.value)} id="username" name="username" />
      <br />
      <br />

      <label htmlFor="pwd">Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="pwd" name="pwd" />
      <br />
      <br />
      <label htmlFor="email">Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" id="email" />
      <br />
      
      <button className="create-button" onClick={handleCreateClick}>Create Account</button>
    </form>


        
    )

}