
import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
export default function HomePage({ jwtToken, policy, AUP, DMCA }) {
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [publisher, setPublisher] = useState("");
  const [power, setPower] = useState("");
  const [expandedItems, setExpandedItems] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [visibleLists, setVisibleLists]= useState([]);
  const [listHeroes, setListHeroes] = useState([])
  const [init, setInit]= useState(false)
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lists = await getVisibleLists();
        console.log('reload')
        await initializeLists(lists);
        setInit(true);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle errors appropriately
      }
    };

    fetchData();
  }, []);
  
  
  // Fetch visible lists on component mount
  async function handleAddReview(list){
    
      const rating = document.getElementById(list.listname)
      const comment = document.getElementById(list.listname+"comment")
      if(rating.value ==="" || comment.value ===""){
        alert('You Must Enter Both Rating and Comment')
        return
      }
      try {
        const oldReview = await fetch(`/api/ratingreview/getReview/${list.listname}/${list.username}`,{
          method: 'GET',
          headers :{
              'Content-Type': 'application/json',
              }
      })
      if(!oldReview.ok){
        const {error} = await oldReview.json()
        alert(error)
        return
      }
      const previousReviewArray = await oldReview.json()
      const review = {
        comment: comment.value,
        rating : parseInt(rating.value),
        hidden : 0
      }
      previousReviewArray.push(review)
      const response = await fetch('/api/ratingreview/updateReview',{
        method: 'POST',
        headers :{
            'Content-Type': 'application/json',
            'authorization' : `Bearer ${jwtToken}`
          },
            body: JSON.stringify({
              listname: list.listname,
              newReview: previousReviewArray
            }),
    })

    if(!response.ok){
      alert("Not Authorized")
      return
    }
    alert("Added review")
    await initializeLists(visibleLists)
      } catch (error) {
        alert(error)
      }
  }
  
  async function initializeLists(lists) {
    try {
      let array = [];
  
      // Using Promise.all to wait for all asynchronous calls to complete
      await Promise.all(lists.map(async (list) => {
        console.log(list)
        const response = await fetch(`/api/ratingreview/getReview/${list.listname}/${list.username}`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const newList = list
        newList.review = await response.json()
        let rating = 0
        newList.review.forEach(review => {
          rating = rating + review.rating
        });
        newList.average_rating = rating/newList.review.length
        
        array.push(newList);
      }));
      
      // Set the state with the updated array
      setVisibleLists(array);
      
    } catch (error) {
      console.error('Error in initializeLists:', error);
      // Handle errors appropriately
    }
  }
  
  
  

  async function getVisibleLists() {
    try {
      
      const response = await fetch("/api/getAllVisibleLists");
      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
        return;
      }
      const lists = await response.json();
      return lists
       
    } catch (error) {
      alert(error.message);
    }
  }
  async function getHeroes(list) {
    const ids = JSON.parse(list.ids);
  
    try {
      const heroes = await Promise.all(ids.map(async (id) => {
        const hero = await getSuperheroInfo(id);
        return hero;
      }));
  

      setListHeroes(heroes)
      
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred while fetching superhero information");
    }
  }
  
  async function handleSearchClick() {
    try {
      setHeroes([]);
      const response = await fetch("/api/getHeroByFields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, race: race, publisher: publisher, power: power }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
        return;
      }
      const newHeroes = await response.json();
      setHeroes(newHeroes);
    } catch (error) {
      alert(error.message);
    }
  }
  async function getSuperheroInfo(id) {
    try {   
      const response = await fetch(`/api/superheroes/superheroinfo/${id}`);

      if (!response.ok) {
        return { error: "Can't get Hero" };
      }
      const hero = await response.json();
      return hero;
    } catch (error) {
      console.error(error);
      throw new Error(
        "An error occurred while fetching superhero information"
      );
    }
  }
  const handleItemClick = (index) => {
    if (expandedItems.includes(index)) {
      setExpandedItems((prevExpandedItems) =>
        prevExpandedItems.filter((item) => item !== index)
      );
    } else {
      setExpandedItems((prevExpandedItems) => [...prevExpandedItems, index]);
    
  };
}
function handleHeroClicked() {
  setShow((prevShow) => !prevShow);
}
const handleNameChange = (event) => {
  // Existing logic
  setName(event.target.value);

  // Sanitization logic
  const userInput = event.target.value;
  const sanitizedInput = userInput.replace(/[^a-zA-Z]/g, '');
  setName(sanitizedInput);
};
const handleRaceChange = (event) => {
  // Existing logic
  setRace(event.target.value);

  // Sanitization logic
  const userInput = event.target.value;
  const sanitizedInput = userInput.replace(/[^a-zA-Z]/g, '');
  setRace(sanitizedInput);
};
const handlePubliserChange = (event) => {
  // Existing logic
  setPublisher(event.target.value);

  // Sanitization logic
  const userInput = event.target.value;
  const sanitizedInput = userInput.replace(/[^a-zA-Z]/g, '');
  setPublisher(sanitizedInput);
};
const handlePowerChange = (event) => {
  // Existing logic
  setPower(event.target.value);

  // Sanitization logic
  const userInput = event.target.value;
  const sanitizedInput = userInput.replace(/[^a-zA-Z]/g, '');
  setPower(sanitizedInput);
};
  if(loading){
    return <div>Loading...</div>;
  }
  if(init){
  return (
    <div>
     
      <label htmlFor="name">Name</label>
      <input type="text" value={name} onChange={(event) => handleNameChange(event)} className="name" />
      <br />
      <label htmlFor="race">Race</label>
      <input type="text" value={race} onChange={(event) => handleRaceChange(event)} className="race" />
      <br />
      <label htmlFor="publisher">Publisher</label>
      <input type="text" value={publisher} onChange={(event) => handlePubliserChange(event)} className="publisher" />
      <br />
      <label htmlFor="power">Power</label>
      <input type="text" value={power} onChange={(event) => handlePowerChange(event)} className="power" />
      <br />
      <button className="search" onClick={handleSearchClick}>
        Search
      </button>

      <ul className="heroList">
        {heroes.map((hero, index) => (
          <li key={index} onClick={(event) => {event.stopPropagation(); handleItemClick(index)}}>
            {hero.Publisher} - {hero.name} --&gt;{" "}
            <a href={`https://duckduckgo.com/?q=${hero.name}${hero.Publisher}&ia=web`} target="_blank" rel="noopener noreferrer">
              DuckDuckGoLink
            </a>
            {expandedItems.includes(index) && (
              <div>
                <p>Gender: {hero.Gender}</p>
                <p>Eye color: {hero["Eye color"]}</p>
                <p>Race: {hero.Race}</p>
                <p>Height: {hero.Height}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      <ul className="publicLists">
      
          { visibleLists.map((list, listIndex) => (
             
            <li key={listIndex} onClick={() =>{console.log(getHeroes(list)); handleItemClick(listIndex)}}>
              <p>List Name: {list.listname}</p>
              <p>Creator Name: {list.username}</p>
              <p>Average Rating: {list.average_rating} </p>
              <label>Add Comment</label>
              <input type="text" name="" id={list.listname+"comment"} onClick ={(event)=>{event.stopPropagation()}}maxLength="100" required pattern="[0-9a-zA-Z]*"/>
              <br />
              <label>Add Rating</label>
              <input type="number"  onClick={(event)=>{event.stopPropagation()}} id={list.listname} name="quantity" min="1" max="5"/>
              <button onClick={(event)=>{event.stopPropagation();handleAddReview(list)}}>Add Review </button>
              <ul>
                {list.review.map((review, reviewIndex)=> (
                  !review.hidden && (
                    <li key={reviewIndex}>
                      Comment: {review.comment}---
                      Rating: {review.rating}
                    </li>
                  )
                ))}
              </ul>
              <p>Number of Heroes {list.ids.length} </p>
              {expandedItems.includes(listIndex) && (
                <ul>
                  {listHeroes.map((listHero, heroIndex) => (
                    <li key={heroIndex} onClick={(event)=>{event.stopPropagation();handleHeroClicked()}}>
                      {listHero.Publisher} - {listHero.name}
                      {show &&<ul>
                        <li>
                        <p>Gender: {listHero.Gender}</p>
                        <p>Eye color: {listHero["Eye color"]}</p>
                        <p>Race: {listHero.Race}</p>
                        <p>Height: {listHero.Height}</p>
                        </li>
                      </ul>}
                        
                      
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
      }
      </ul>
      <footer>

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
            <button onClick={handleAUP}>Open Acceptable Use Policy</button>
            <Modal
            isOpen={isModalAUP}
            onRequestClose={closePopupModalAUP}
            contentLabel="Privacy Policy"
            >
            <h1>Acceptable Use Policy</h1>
            <p>{AUP}</p>
            <button onClick={closePopupModalAUP}>Close</button>
            </Modal>

            <button onClick={handleDMCA}>Open DMCA Takedown Procedure</button>
            <Modal
            isOpen={isModalDMCA}
            onRequestClose={closePopupModalDMCA}
            contentLabel="Privacy Policy"
            >
            <h1>DMCA Takedown Policy</h1>
            <p>{AUP}</p>
            <button onClick={closePopupModalDMCA}>Close</button>
            </Modal>

        </footer>
    </div>
  );
    }
  }
