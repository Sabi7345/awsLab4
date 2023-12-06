
import React from "react";
import {useNavigate} from "react-router-dom";
export default function UpdatePassword({jwtToken}){
    const [password, setPassword] = React.useState('')
    const navigate = useNavigate()

    async function handleUpdate(){
        try {
            const response = await fetch(`/updatePassword/${password}`, {
                method: 'POST',
                headers :{
                    'Content-Type': 'application/json',
                    'authorization' : `Bearer ${jwtToken}`
                }
            })
            if(!response.ok){
                const {error} = await response.json()
                alert(error)
                return
            }
            const {message} = await response.json()
            alert(message)
            navigate('/home')
            
        } catch (error) {
            alert(error)
        }
        
    }
    return(
       <div>
         <label htmlFor="newpwd">Update Password</label>
        <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} className="newpwd" />
        <br />
        <button className="update" onClick={handleUpdate}>Update</button>
       </div>
    )

}
