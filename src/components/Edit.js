
import React, { useState } from "react";
import { useNavigate} from "react-router-dom";

export default function Edit({ EditList, jwtToken, onSaveChanges }) {
  const [newListName, setNewListName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [visibility, setVisibility] = useState(false);
  const [newHero, setNewHero] = useState("");
  const [ids, setIds] = useState([])
  const [idsChanged, setIDsChanged] = useState(false)
  const navigate = useNavigate()
//{listName, newListName, newIds, newDescription, newVisibilityFlag, creationDate}
  const handleSaveChanges = async() => {
    JSON.parse(EditList[0].ids).forEach(id => {
        ids.push(id)
    });
    
    const currentDate = new Date().toLocaleString();
    if (newListName==="") {
        setNewListName(EditList[0].listname)
        console.log(EditList[0].listname)
      }
      if(!idsChanged){
        setIds(JSON.parse(EditList[0].ids))
      }
 
    try {
     const response = await fetch('/api/Lists/updateList',{
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
              listName: EditList[0].listname,
              newListName : newListName,
              newIds: ids,
              newDescription: newDescription,
              newVisibilityFlag : visibility,
              creationDate: currentDate,
            }),
          });
          if(!response.ok){
            const {error} = response.json()
            alert(error)
            return
          }
          const {message} = await response.json()
          await fetch(`/updateListname/${EditList[0].listname}/${newListName}`, 
          {method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${jwtToken}`,
          },})
          alert(message)
          navigate('/createList')
          EditList.length =0
          

    } catch (error) {
        alert(error)
    }
  };

  async function handleAddHero(){
    console.log(EditList)
    if (!newHero) {
        alert("Enter a Hero");
        return;
      }
      try {
        const response = await fetch(
          `/api/superheroes/superheroinfo/researchbypattern/1/name/${newHero}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        if (!response.ok) {
          const { error } = await response.json();
          alert(error);
          return;
        }
        const data = await response.json();
        ids.push(data[0]);
        setIDsChanged(true)
        alert('Hero Added')
        
      } catch (error) {
        alert(error);
      }
  }
  const handleListnameChange = (event) => {
    // Existing logic
    setNewListName(event.target.value);
  
    // Sanitization logic
    const userInput = event.target.value;
    const sanitizedInput = userInput.replace(/[^a-zA-Z0-9]/g, '');
    setNewListName(sanitizedInput);
  };
  const handleHeroChange = (event) => {
    // Existing logic
    setNewHero(event.target.value);
  
    // Sanitization logic
    const userInput = event.target.value;
    const sanitizedInput = userInput.replace(/[^a-zA-Z0-9]/g, '');
    setNewHero(sanitizedInput);
  };

  return (
    <div>
      <label>New List Name</label>
      <input
        type="text"
        value={newListName}
        onChange={(event) => handleListnameChange(event)}
      />
      <br />

      <label>New Description (optional)</label>
      <input
        type="text"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
      />
      <br />

      <label>Visibile</label>
      <input
        type="checkbox"
        checked={visibility}
        onChange={() => setVisibility(!visibility)}
      />
      <br />

      <label>Add Hero</label>
      <input
        type="text"
        value={newHero}
        onChange={(event) => handleHeroChange(event)}
      />
      <button onClick={handleAddHero}>Add Hero</button>
    <br />
      <button onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
}
