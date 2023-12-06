
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CreateList({ jwtToken, EditList }) {
  const [ids, setIds] = useState([]);
  const [description, setDescription] = useState("");
  const [listName, setListName] = useState("");
  const [creationDate, setCreationDate] = React.useState("");
  const [hero, setHero] = useState("");
  const [userLists, setUserLists] = useState([]);
  const [openLists, setOpenLists] = useState([]);
  const [selectedHeroInfo, setSelectedHeroInfo] = useState(null);
  const [listHeroes, setListHeroes] = useState([]);
  const [rerender, setRerender] = useState(false);

  useEffect(() => {
    const fetchUserLists = async () => {
      try {
        const response = await fetch("/getAllListForUser", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          const { error } = await response.json();
          alert(error);
          return;
        }

        const userList = await response.json();
        setUserLists(userList);

        if (userList.length > 0) {
          userList.forEach(async (list) => {
            await fetchListHeroes(JSON.parse(list.ids));
          });
        }
      } catch (error) {
        alert(error);
      }
    };

    fetchUserLists();
  }, []);

  async function handleDeleteList(list) {
    const confirmDelete = window.confirm(`Do you really want to delete the list ${list}?`);
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/List/delete/${list}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
        return;
      }

      const { message } = await response.json();
      alert(message);
      await fetch(`/deleteRatingReview/${list}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
      });

      const listElement = document.getElementById(`${list}`);
      if (listElement) {
        listElement.remove();
      }

      setRerender((prev) => !prev);
    } catch (error) {
      alert(error);
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
      throw new Error("An error occurred while fetching superhero information");
    }
  }

  async function fetchListHeroes(ids) {
    const heroes = await Promise.all(ids.map((id) => getSuperheroInfo(id)));
    setListHeroes((prevListHeroes) => [...prevListHeroes, heroes]);
  }

  async function addHeroClicked() {
    if (!hero) {
      alert("Enter a Hero");
      return;
    }

    try {
      const response = await fetch(`/api/superheroes/superheroinfo/researchbypattern/1/name/${hero}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
        return;
      }

      const data = await response.json();
      setIds((prevIds) => [...prevIds, data[0]]);
    } catch (error) {
      alert(error);
    }
  }

  async function handleAddListClick() {
    const currentDate = new Date().toLocaleString();
    setCreationDate(currentDate);

    if (ids.length === 0) {
      alert("You must add at least one hero");
      return;
    }

    if (!listName) {
      alert("List Name is required.");
      return;
    }

    try {
      const response = await fetch("/api/Lists/createList/superheroes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          listname: listName,
          ids: ids,
          average_rating: 0,
          description: description,
          creationDate: currentDate,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
        return;
      }

      const temp = await fetch("/createRatingReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          listname: listName,
          review: [],
        }),
      });

      const data = await temp.json();

      alert("List Created");
      let array = [];
      ids.forEach(async (id) => {
        const hero = await getSuperheroInfo(id);
        array.push(hero);
      });

      setListHeroes((prevListHeroes) => [...prevListHeroes, array]);
      setIds([]);
      const listResponse = await fetch("/getAllListForUser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!listResponse.ok) {
        const { error } = await listResponse.json();
        alert(error);
        return;
      }

      const userList = await listResponse.json();
      setUserLists(userList);
      setRerender((prev) => !prev);
    } catch (error) {
      alert(error);
    }
  }

  const toggleList = (listName) => {
    setOpenLists((prevOpenLists) => {
      if (prevOpenLists.includes(listName)) {
        return prevOpenLists.filter((name) => name !== listName);
      } else {
        return [...prevOpenLists, listName];
      }
    });
  };

  const handleHeroClick = async (heroesInList, listName) => {
    if (!heroesInList || heroesInList.length === 0) {
      return;
    }

    if (selectedHeroInfo && selectedHeroInfo.id === heroesInList[0].id) {
      setSelectedHeroInfo(null);
    } else {
      const newSelectedHeroInfo = await getSuperheroInfo(heroesInList[0].id);
      setSelectedHeroInfo(newSelectedHeroInfo);
    }

    setOpenLists((prevOpenLists) => {
      if (!prevOpenLists.includes(listName)) {
        return [...prevOpenLists, listName];
      }
      return prevOpenLists
    });
  };
  const handleListnameChange = (event) => {
    // Existing logic
    setListName(event.target.value);
  
    // Sanitization logic
    const userInput = event.target.value;
    const sanitizedInput = userInput.replace(/[^a-zA-Z0-9]/g, '');
    setListName(sanitizedInput);
  };

  return (
    <div>
      <label htmlFor="listName">List Name</label>
      <input
        type="text"
        value={listName}
        onChange={(event) => handleListnameChange(event)}
      />
      <br />
      <label htmlFor="description">Description</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <button onClick={handleAddListClick}>Add List</button>
      <br />
      <label>Add Hero</label>
      <input
        type="text"
        value={hero}
        onChange={(e) => setHero(e.target.value)}
      />
      <button onClick={addHeroClicked}>Add Hero</button>
      <p>Your Current Lists</p>
      <ul>
        {userLists.map((list, outerIndex) => (
          <li
            id={list.listname}
            key={list.listname}
            onClick={() => toggleList(list.listname)}
            style={{ cursor: "pointer" }}
          >
            {list.listname} ---
            <Link to={`/edit`} onClick={() => { EditList.length = 0; EditList.push(list); listHeroes.length = 0 }}>Edit {list.listname}</Link>
            ----- <button onClick={() => { EditList.length = 0; EditList.push(list); handleDeleteList(EditList[0].listname) }}>Delete List</button>
            {openLists.includes(list.listname) && (
              <div>
                <p>Description: {list.description}</p>
                <p>Heroes:</p>
                <ul>
                  {listHeroes[outerIndex].map((heroInList, heroIndex) => (
                    <li
                      key={heroIndex}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <p>{heroInList.name} - {heroInList.Publisher}</p>
                        {selectedHeroInfo && selectedHeroInfo.id === heroInList.id && (
                          <div>
                            <p>Race: {heroInList.Race}</p>
                            <p>Gender: {heroInList.Gender}</p>
                            <p>Weight: {heroInList.Weight}</p>
                            <p>Height: {heroInList.Height}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}