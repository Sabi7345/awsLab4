

const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'database-1.cxa9vscgjhlf.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Sabi5437',
  database: '3316', // Replace 'your_database_name' with the actual database name
}).promise();

async function addList(listName, username, ids, rating, description, creationDate) {
  try {
    await connection.query(
      'INSERT INTO lists (listname, username, ids, average_rating, description, visibility_flag, creationDate) VALUES (?, ?, JSON_ARRAY(?), ?, ?, ?, ?)',
      [listName, username, JSON.stringify(ids), rating, description, false, creationDate]
    );
  } catch (error) {
    console.log(error);
    throw new Error("Can't Add List");
  }
}

async function deleteList(listName, username) {
  try {
    await connection.query(
      'DELETE FROM lists WHERE listname = ? AND username = ?',
      [listName, username]
    );
    console.log('List deleted successfully');
  } catch (error) {
    console.error('Error deleting list:', error);
    throw new Error("Can't Delete List");
  }
}

async function updateVisibility(listName, username, newVisibilityFlag) {
  try {
    await connection.query(
      'UPDATE lists SET visibility_flag = ? WHERE listname = ? AND username = ?',
      [newVisibilityFlag, listName, username]
    );
    console.log('Visibility updated successfully');
  } catch (error) {
    console.error('Error updating visibility:', error);
    throw new Error("Can't Update Visibility");
  }
}
async function updateDescription(listName, username, newDescription) {
  try {
    await connection.query(
      'UPDATE lists SET description = ? WHERE listname = ? AND username = ?',
      [newDescription, listName, username]
    );
    console.log('Description updated successfully');
  } catch (error) {
    console.error('Error updating description:', error);
    throw new Error("Can't Update Description");
  }
}

async function updateIds(listName, username, newIds) {
  try {
    await connection.query(
      'UPDATE lists SET ids = ? WHERE listname = ? AND username = ?',
      [newIds, listName, username]
    );
    console.log('Ids updated successfully');
  } catch (error) {
    console.error('Error updating ids:', error);
    throw new Error("Can't Update Ids");
  }
}

async function updateAverageRating(listName, username, newAverageRating) {
  try {
    await connection.query(
      'UPDATE lists SET average_rating = ? WHERE listname = ? AND username = ?',
      [newAverageRating, listName, username]
    );
    console.log('Average rating updated successfully');
  } catch (error) {
    console.error('Error updating average rating:', error);
    throw new Error("Can't Update Average Rating");
  }
}
async function updateList(listName, username, newListName, newIds, newRating, newDescription, newVisibilityFlag, creationDate) {
  try {
    await connection.query(
      'UPDATE lists SET listname = ?, ids = JSON_ARRAY(?), average_rating = ?, description = ?, visibility_flag = ? WHERE listname = ? AND username = ?',
      [newListName, JSON.stringify(newIds), newRating, newDescription, newVisibilityFlag, listName, username]
    );
    console.log('List updated successfully');
  } catch (error) {
    console.error('Error updating list:', error);
    throw new Error("Can't Update List");
  }
}


async function getAllVisibleLists() {
  try {
    const [rows] = await connection.query(
      'SELECT * FROM lists WHERE visibility_flag = true'
  
    );
    return rows;
  } catch (error) {
    console.error('Error fetching visible lists:', error);
    throw new Error("Can't Fetch Visible Lists");
  }
}
async function getAllInvisibleLists() {
  try {
    const [rows] = await connection.query(
      'SELECT * FROM lists WHERE visibility_flag = false'
    );
    return rows;
  } catch (error) {
    console.error('Error fetching invisible lists:', error);
    throw new Error("Can't Fetch Invisible Lists");
  }
}

async function getAllListsForUser(username) {
  try {
    const [rows] = await connection.query(
      'SELECT * FROM lists WHERE username = ?',
      [username]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching lists for user:', error);
    throw new Error("Can't Fetch Lists for User");
  }
}
async function removeList(listName, username) {
  try {
    await connection.query(
      'DELETE FROM lists WHERE listname = ? AND username = ?',
      [listName, username]
    );
    console.log('List removed successfully');
  } catch (error) {
    console.error('Error removing list:', error);
    throw new Error("Can't Remove List");
  }
}
async function getAllLists(username) {
  try {
    const result = await connection.query(
      'SELECT * FROM lists WHERE username = ?',
      [username]
    );

    const lists = result[0];

    if (lists.length === 0) {
      console.log('No lists found for the user.');
    } else {
      console.log('All Lists:');
      lists.forEach((list) => {
        console.log('List Name:', list.listname);
        console.log('Ids:', JSON.parse(list.ids));
        console.log('Average Rating:', list.average_rating);
        console.log('Description:', list.description);
        console.log('Visibility Flag:', list.visibility_flag);
        console.log('Creation Date:', list.creationDate);
        console.log('-------------------');
      });
    }
  } catch (error) {
    console.error('Error fetching lists:', error);
    throw new Error("Can't Fetch Lists");
  }
}


async function getAllAndPrintRows() {
  try {
    const [results] = await connection.query('SELECT * FROM ratingreview');
    return results
  } catch (error) {
    console.error('Error getting and printing all rows:', error);
    throw new Error("Can't Get and Print All Rows");
  }
} 

// Call the function to get and print all rows








async function getReview(username, listname) {
  try {
    const [result] = await connection.query('SELECT review FROM ratingreview WHERE listname = ? AND username = ?', [listname, username]);

    if (result.length > 0) {
      const reviewArray = result[0].review;
      return reviewArray || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting review:', error);
    throw new Error("Can't Get Review");
  }
}


async function deleteRatingReview(username, listname) {
  try {
    await connection.query(
      'DELETE FROM ratingreview WHERE listname = ? AND username = ?',
      [listname, username]
    );
    console.log('Rating and review deleted successfully');
  } catch (error) {
    console.error('Error deleting  review:', error);
    throw new Error("Can't Delete Review");
  }
}
getReview("sabikahlon","New").then(data =>{console.log(data)})
async function createRatingReview(username, listname, review) {
  try {
   // Assuming you want to store a single value in the JSON array
    const newReview = JSON.stringify(review); // Assuming you want to store a single value in the JSON array

    await connection.query(
      'INSERT INTO ratingreview (username, listname, review) VALUES (?, ?, ?)',
      [username, listname, newReview]
    );

    console.log('New  review created successfully');
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error("Can't Create Review");
  }
}


async function updateReview(username, listname, newReview) {
  try {
    const updatedReview = JSON.stringify(newReview); // Assuming you want to store a single value in the JSON array
    console.log(updatedReview)
    await connection.query(
      'UPDATE ratingreview SET review = ? WHERE listname = ? AND username = ?',
      [updatedReview, listname, username]
    );
    console.log('Review updated successfully');
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error("Can't Update Review");
  }
}
async function UR(listname, newReview) {
  try {
    const updatedReview = JSON.stringify(newReview); // Assuming you want to store a single value in the JSON array
    console.log(updatedReview)
    await connection.query(
      'UPDATE ratingreview SET review = ? WHERE listname = ? ',
      [updatedReview, listname]
    );
    console.log('Review updated successfully');
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error("Can't Update Review");
  }
}















//getAllLists('sabikahlon')









async function updatePrivilege(username, isAdmin){
  try {
    await connection.query('UPDATE users SET isAdmin = ? WHERE username = ?', [isAdmin, username])
    console.log("Updated Privilege")
  } catch (error) {
    console.log(error)
  }
}
async function updateIsDeactivated(isDeactivated, username){
  try {
    await connection.query('UPDATE users SET isDeactivated = ? WHERE username = ?', [isDeactivated, username])
    console.log("Updated Deactivation")
  } catch (error) {
    console.log(error)
  }
}

// Function to insert a new user
async function insertUser(username, password, email, token, status, isAdmin, isDeactivated) {
    try {
      const result = await connection.query(
        'INSERT INTO users (username, password, email, emailVerificationToken, status, isAdmin, isDeactivated) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, password, email, token, status, isAdmin, isDeactivated]
      );
  
      console.log('User inserted successfully with username:', username);
    } catch (error) {
        console.log('User Already Exist')
      throw new Error('User Already Exist')
   
  }}

async function getUserByToken(token){
try{
    const [user] = await connection.query('SELECT * FROM users WHERE emailVerificationToken = ?', [token]);
    console.log(user)
    return user[0]
}
catch(error){
throw new Error('UserNotFound')
}

}


async function updateStatus(username){

    try{
    await connection.query('UPDATE users SET status = ? WHERE username = ?', ['verified', username])
    }
    catch(error){
        throw new Error('User Status Could not Be Updated')
    }
}



async function updatePassword(password, username){
try{
     await connection.query(
        "UPDATE users SET password = ? WHERE username = ? ",
        [password,username]
      );
    }
catch(error){

return {error: 'Password Could not Be updated'}
}



}
async function getUserByUsername(username) {
    try {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
  
      if (rows.length > 0) {
        console.log('User found:', rows[0]);
        return rows[0];
      } else {
        return { error: 'User not found' };
      }
    } catch (error) {
      console.error(`Error at getUserByUsername('${username}'):`, error);
      return { error: `Database Error at getUserByUsername('${username}'): ${error.message}` };
    } 
  }

  // Function to remove a user by username
async function removeUserByUsername(username) {
    try {
      const [result] = await connection.query(
        'DELETE FROM users WHERE username = ?',
        [username]
      );
  
      if (result.affectedRows > 0) {
        console.log('User removed successfully');
      } else {
        console.log('User not found');
      }
    } catch (error) {
      console.error('Error removing user by username: ', error);
    } 
    
    
  }
  async function getUserByEmail(email){
    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?",[email])
    
    return rows[0]
  }
  // Function to get all users
  async function getAllUsers() {
    try {
      const [rows] = await connection.query('SELECT * FROM users');
  
      if (rows.length > 0) {
        console.log('All users:');
        rows.forEach(user => {
          console.log(`Username: ${user.username}, isAdmin: ${user.isAdmin} Email: ${user.email} Password: ${user.password} Status: ${user.status} Token ${user.emailVerificationToken}`);
        });
      }
       
      else {
        console.log('No users found');
      }
      return rows
    } catch (error) {
      console.error('Error getting all users: ', error);
    } 
  }
  async function updateListname(username, oldListname, newListname) {
    try {
      await connection.query(
        'UPDATE ratingreview SET listname = ? WHERE listname = ? AND username = ?',
        [newListname, oldListname, username]
      );
  
      console.log('Listname updated successfully');
    } catch (error) {
      console.error('Error updating listname:', error);
      throw new Error("Can't Update Listname");
    }
  }

  module.exports = {
    updateListname,
    getUserByUsername,
    insertUser,
    getAllUsers,
    removeUserByUsername,
    updateStatus,
    getUserByToken,
    getUserByEmail,
    updatePassword,
    addList,
    deleteList,
    updateVisibility,
    updateAverageRating,
    updateDescription,
    updateIds,
    updateList,
    getAllInvisibleLists,
    getAllListsForUser,
    getAllVisibleLists,
    getReview,
    updateReview,
    createRatingReview,
    deleteRatingReview,
    updateListname,
    updatePrivilege,
    updateIsDeactivated, 
    getAllAndPrintRows,
    UR

  }




 