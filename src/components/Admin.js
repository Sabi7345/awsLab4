
import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import Modal from 'react-modal';

export default function Admin({jwtToken, policy, setPolicy, AUP, setAUP, DMCA, setDMCA}){
    const navigate = useNavigate()
    const [allUser, setAllUsers] = useState([])
    const  [showUsers, setShowUsers] = useState(false)
    const [allLists, setAllLists] = useState([])
    const [showLists, setShowLists] = useState(false)
    const back = () => navigate('/')
    const [isModalPrivacy, setModalPrivacy] = useState(false);
    const [isModalAUP, setModalAUP] = useState(false);
    const [isModalDMCA, setModalDMCA] = useState(false);

    const handlePrivacy = () => {
        setModalPrivacy(true);
    };
    const closePopupModalPrivacy = () => {
        setModalPrivacy(false);
    };
    const handleAUP = () => {
        setModalAUP(true);
    };
    const closePopupModalAUP = () => {
        setModalAUP(false);
    };
    const handleDMCA = () => {
        setModalDMCA(true);
    };
    const closePopupModalDMCA = () => {
        setModalDMCA(false);
    };
    function adddmca(){
        const input = document.getElementById('dmca')
        const content = input.value
        if(content.trim() === ""){
            setDMCA("No Policy Created")
            alert("You must Enter A DMCA Takedown Policy")
            return
        }
        input.value =""
        alert("DMCA Notice and Policy Created")
        setDMCA(content)
    }
    function addAUP(){
        const input = document.getElementById('aup')
        const content = input.value
        if(content.trim() === ""){
            setAUP("No Policy Created")
            alert("You must Enter A AUP")
            return
        }
        input.value =""
        alert("AUP Created")
        setAUP(content)
    }

     function hanldeCreatePolicy(){
        const input = document.getElementById('content')
        const content = input.value
        if(content.trim() === ""){
            setPolicy("No Policy Created")
            alert("You must Enter the content for the Policy")
            return
        }
        input.value =""
        alert("Policy Created")
        setPolicy(content)

    }
    
    async function hideReview(listname, reviewArray, review){
        
        try {
        let isHidden = 1 
        if(review.hidden){
            isHidden = 0
        }
        console.log(isHidden)
        let newArray = reviewArray.filter((element) =>{return JSON.stringify(element)!==JSON.stringify(review)})
        review.hidden = isHidden
        newArray.push(review)

        await fetch('UR',{
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({listname: listname, newReview: newArray })
        })
        getAllLists().then(()=>{

        })
        } catch (error) {
            
        }
    }


    useEffect(()=>{
        getUsers().then(()=>{  
            getAllLists().then(()=>{
                setShowUsers(true)  
                setShowLists(true)
            })
             
        }) 
        

    }, [])
    async function getAllLists(){
        try {
            const response = await fetch('/getAllList/RatingReview')
            const lists = await response.json()
            setAllLists(lists)
        } catch (error) {
            
        }
    }

    async function getUsers(){

        try {
           const response = await fetch('/getAllUsers') 
           const users = await response.json()
           setAllUsers(users)
        } catch (error) {
            alert(error)
        }
    }

    async function handleDeactivate(user){
        try {
            let isDeactivated = 1
            if(user.isDeactivated){
                isDeactivated =0
            }
            const response = await fetch(`/updateIsDeactivated/${user.username}/${isDeactivated}`,{
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                }
            })
            if(!response.ok){
                const {error} = await response.json()
                alert(error)
                return
            }
            getUsers().then(()=>{  
                setShowUsers(true)   
            })
        } catch (error) {
            alert(error)
        }

    }

    async function handleAdmin(user){
        try {
            let isAdminNew = 1
            if(user.isAdmin){
            isAdminNew = 0
            }
            const response = await fetch(`/updatePrivilege/${user.username}/${isAdminNew}`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                }
            })
            if(!response.ok){
                const {error}  = await response.json()
                alert(error)
                return;
            }
            getUsers().then(()=>{  
                setShowUsers(true)   
            })
            
        } catch (error) {
            alert(error)
        }
    }

    return(
        <div>
            <p>Manage Users</p>
            <ul className="users">
                <p>1 For True</p>
                <p>0 for False</p>
            {showUsers && allUser.map((user)=>(
                <li key={user.username}>
                    Name : {user.username}---
                    Admin : {user.isAdmin}---
                    Deactivated : {user.isDeactivated}---
                    <button onClick={()=>{handleAdmin(user)}}>Switch Admin</button>
                    <button onClick={(() =>{handleDeactivate(user)})}>Switch Deactivated</button>

                    <br />
                    <br />
                </li>
                
            ))}
            

            </ul>
                <p>Manage Reviews</p>
            <ul className="reviews">
                {showLists && allLists.map((list)=>(
                    list.review.map((review) => (
                        <li>
                        Comment : {review.comment}---
                        Rating : {review.rating}---
                        isHidden : {review.hidden}
                        <button onClick={()=>{hideReview(list.listname, list.review, review)}}>Hide Review</button>
                        </li>
                    ))

                ))}


            </ul>
            <br />
            <p>Privacy Policy</p>
            <input type="text" id ="content"placeholder="Enter Policy Content"/>
          <button onClick={()=>hanldeCreatePolicy()}>Create Policy or Replace Old Policy</button> 

            <br />
            <button onClick={handlePrivacy}>Open Privacy Policy</button>
            <Modal
            isOpen={isModalPrivacy}
            onRequestClose={closePopupModalPrivacy}
            contentLabel="Privacy Policy"
            >
            <h1>Privacy Policy</h1>
            <p>{policy}</p>
            <button onClick={closePopupModalPrivacy}>Close</button>
            </Modal>
            <br />
            <br />

           <p>Acceptable Use Policy</p>
            <input type="text" id="aup" placeholder="Enter AUP" />
            <button type="button" onClick={()=>addAUP()}>Add or Replace AUP</button>
            <br />
            <button onClick={handleAUP}>Open Acceptable Use Policy</button>
            <Modal
            isOpen={isModalAUP}
            onRequestClose={closePopupModalAUP}
            contentLabel="AUP"
            >
            <h1>Acceptable Use Policy</h1>
            <p>{AUP}</p>
            <button onClick={closePopupModalAUP}>Close</button>
            </Modal>

            <br />
            <br />

            <p>DMCA Policy</p>
            <input type="text" id="dmca" placeholder="Enter DMCA Policy" />
            <button type="button" onClick={()=>adddmca()}>Add or Replace DMCA Policy</button>
            <br />
            <button onClick={handleDMCA}>Open DMCA Takedown Procedure</button>
            <Modal
            isOpen={isModalDMCA}
            onRequestClose={closePopupModalDMCA}
            contentLabel="DMCA"
            >
            <h1>DMCA Takedown Policy</h1>
            <p>{AUP}</p>
            <button onClick={closePopupModalDMCA}>Close</button>
            </Modal>
            <br />
            <br />
            <button onClick={()=>back()}> Back To Login</button>
        </div>
    )
}