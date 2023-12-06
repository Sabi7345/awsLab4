// Import the required modules
const express = require('express');
const database = require('../src/database');
const fs = require('fs');
const Joi = require('joi')
const i18n = require('i18n');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const secretToken = crypto.randomBytes(20).toString('hex')
const stringSimilarity = require('string-similarity');
const path  = require('path')
const http = require("http")
const Server  = require("socket.io").Server

const server  = http.createServer(app)
const io = new Server(server , {
    cors:{
        origin:"*"
    }
})


const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../build");

app.use(express.static(buildPath))

app.get("/*", function(req, res){

    res.sendFile(
        path.join(__dirname, "../build/index.html"),
        function (err) {
          if (err) {
            res.status(500).send(err);
          }
        }
      );

})


const filePath_info = 'server/superheroes/superhero_info.json'
const filePath_powers = 'server/superheroes/superhero_powers.json';
const saltRounds = 10
// Create an Express application
const app = express();
const port = 8080;



//using Joi for Input Sanitization
//limits id to an integer from 0-1000
const integerValidtor = Joi.object({
  id: Joi.number().integer().min(0).max(1000)

})
//string validator
const listNameValidator = Joi.object({
  name: Joi.string().min(1).max(20)
})
const userValidator = Joi.object({
  username: Joi.string().min(1).max(30),
  password: Joi.string().min(1).max(30),
  email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','ca','uwo','org','gov'] } }) 
});

const patternValidator = Joi.object({
 number: Joi.number().integer().min(0).max(100),
 pattern: Joi.string().min(1).max(20),
 field : Joi.string().min(1).max(20)

})
const array = Joi.array().items(Joi.number().integer().min(0).max(733));

let userLists = [];
let hero_info = readFile(filePath_info)
let hero_powers = readFile(filePath_powers)
i18n.configure({
  locales: ['en', 'fr'],
  directory: __dirname + '/locales',
});

// Custom middleware for language detection
app.use((req, res, next) => {
  const userLanguage = req.query.lang || 'en'; // Detect language from URL parameter or use a default
  i18n.setLocale(req, userLanguage);
  next();
});
//MiddleWare
app.use(express.json()); // Enable JSON request body parsing



//get user 
/*
{
username: ....
password: ...
email: ...
}
*/
// or error {error: errormessage}

app.get('/api/getUserbyEmail/:email',async (req, res) =>{
  const email = req.params.email
  
  try {
    const user = await database.getUserByEmail(email)
    //console.log(user)
    if(user === undefined){
      res.status(404).json({error: 'Email Not Found '});
      return;
    }
    res.status(200).json(user)
  } catch (error) {
    console.log(error)
  }
  
  })

app.get('/api/getUserByName/:name', async (req, res) => {
  const name = req.params.name;

  try {
    const user = await database.getUserByUsername(name);

    if (user.error) {
      res.status(404).json(user);
    } else {
      res.status(200).json(user);
      return
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//password is new password
//assume new password is sent
app.post('/updatePassword/:password', authenticateToken, async (req, res) =>{
  const user = req.user; 
  console.log(user)
  try {
    const newPassword = await bcrypt.hash(req.params.password,saltRounds)
    await database.updatePassword(newPassword, user.username)
    res.send({message : 'Password Updated'})
    return;
  } catch (error) {
    res.status(404).send({error : 'Password Could Not Be Updated'})
  }

})

/*
{
username: ....
password: ...
email: ...
}
*/
//create users

app.get('/sendmail/:email/:token', async (req, res) =>{
  const toEmail = req.params.email;
  const token = req.params.token; 
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pykelol5437@gmail.com',
      pass: 'nmcm ufcb rbvu jbhq',
    },
  });
  const verificationLink = `http://localhost:8080/verify/${token}`;

  //mail info 
  const mailOptions = {
    from: 'pykelol5437@gmail.com',
    to: toEmail,
    subject: 'Email Verification',
    text: `Click the following link to verify your email: ${verificationLink}`,
  };
  //send email
  await transporter.sendMail(mailOptions).then().catch();
  res.send({message : 'Email Sent'})
  })
app.post('/api/addUser', async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const token = crypto.randomBytes(20).toString('hex');
  const status = 'pending'
  const isAdmin = false
  const isDeactivated = false
  const { error } = userValidator.validate(req.body);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pykelol5437@gmail.com',
      pass: 'nmcm ufcb rbvu jbhq',
    },
  });
  if (error) {
    res.json({ error: 'User Could Not Be Created' });
    return;
  }
  try {
  //add user to db

  // Verification Link
  const verificationLink = `http://localhost:8080/verify/${token}`;

  //mail info 
  const mailOptions = {
    from: 'pykelol5437@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Click the following link to verify your email: ${verificationLink}`,
  };

  //send email
  await transporter.sendMail(mailOptions).then().catch();
  const password =await bcrypt.hash(req.body.password, saltRounds)
  await database.insertUser(username, password, email, token, status, isAdmin, isDeactivated).then().catch();
   res.status(200).json({emailToken: token});

  } catch (error) {
    if (error.message === 'User Already Exist') {
      return res.status(409).json({ error: 'User already exists' });
    } else {
      // Handle other errors
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Route for handling email verification
app.get('/verify/:token', async (req, res) => {
  const  token  = req.params.token;
  
  // Update user status to "verified"
  try{
  const user = await database.getUserByToken(token)
  await database.updateStatus(user.username);
  }
  catch(err){
    res.status(401).json({error: 'User Cannot Be Verified'})
    return
  }
  res.json({ message: 'Email verified successfully.' });
});




//{email
//password}
app.post('/updatePrivilege/:username/:isAdmin', async (req, res) =>{
try {
  const username = req.params.username
  const isAdmin = req.params.isAdmin
  await database.updatePrivilege(username, isAdmin)
  res.json({message : "Updated Privilege"})
} catch (error) {
  res.json({error : "Can't Update Privilege"})
}
})
app.post('/updateIsDeactivated/:username/:isDeactivated', async(req, res) =>{
  try {
    const username = req.params.username
    const isDeactivated = req.params.isDeactivated
    await database.updateIsDeactivated(isDeactivated,username)
    res.json({message : "Done"})
  } catch (error) {
    res.json({error: "Error"})
  }
})

app.post('/login', async (req,res) =>{
const {email, password} = req.body
const user = await database.getUserByEmail(email)

const match = await bcrypt.compare(password, user.password)

if(user === undefined){
  return res.status(404).json({error: `No User With Email ${email} is Found`})
}
else if(!match){
return res.status(401).json({error: 'Incorrect Password'})
}
const token = jwt.sign(user, secretToken,{expiresIn : '1h'})
res.status(200).json({accessToken: token})
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  //Bearer token 
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretToken, (err, user) => {
    if (err) {
    return res.sendStatus(403);
    }

    req.user = user;

    next();
  });
}



























// search for superhero info with id param
app.get('/api/superheroes/superheroinfo/:id', (req, res) => {
  const { error } = integerValidtor.validate({

    id :parseInt(req.params.id)
  })
  
  if(error){
    res.status(400).send({error: " ServerError: Invalid Input for id when getting superhero"})
    return
  }
  hero = hero_info.find(hero => hero.id === parseInt(req.params.id))
  if (hero) {
    hero.powers = getPowers(parseInt(req.params.id));
    res.send(JSON.stringify(hero));
  } else {
    res.status(404).send({ error: "ServerError: Hero not found" });
  }
});

//return all powers for one hero by id
app.get('/api/superheroes/superheropowers/:id', (req, res) => {
  
  const { error } = integerValidtor.validate({ id: parseInt(req.params.id)});
  if(error){
    res.status(400).send({error: "ServerError: Invalid Input for id when getting powers"})
    return
  }
  let powers = getPowers(parseInt(req.params.id))
  res.send(JSON.stringify(powers))
});
//return all publishers no dups
app.get('/api/superheroes/superheroinfo/hero/publisher',(req, res) => {
  let publishers = new Set(); 
  for (let hero of hero_info){
    publishers.add(hero.Publisher)
   }  
   publishers.delete('')
 res.send(JSON.stringify(Array.from(publishers)))

});

app.post('/api/getHeroByFields', (req , res)=>{
const criteria = {
name: req.body.name,
race: req.body.race,
publisher: req.body.publisher,
power:  req.body.power
}
const filteredHeroes = searchHeroes(criteria)
if(filteredHeroes.length===0){
res.status(404).json({error: "No Hero's Found"})
return
}
else{
res.json(filteredHeroes)
return
}
})
//create authenticated user lists
app.post('/api/Lists/createList/superheroes',authenticateToken, async (req,res) => {
const user = req.user
const {listname , ids, average_rating, description, creationDate} = req.body
console.log(creationDate)
try {
  await database.addList(listname, user.username, ids, average_rating, description, creationDate)
  res.json({message : 'List Saved'})
} catch (error) {
  res.status(400).json({error: 'List Name Already Used'})
}
})
//update user List 

app.post('/api/Lists/updateList', authenticateToken, async (req, res) =>{
const user = req.user
const newRating = 0;
const {listName, newListName, newIds, newDescription, newVisibilityFlag, creationDate} = req.body
try {
  await database.updateList(listName, user.username, newListName, newIds, newRating, newDescription, newVisibilityFlag, creationDate)
  res.json({message: 'List Updated'})
} catch (error) {
  res.json({error : 'Cannot Update List'})
}
})

app.post('/createRatingReview', authenticateToken, async (req, res) =>{
  const user = req.user
  const {listname, review} = req.body
  try {
    await database.createRatingReview(user.username,listname,review)
    res.json({message: "Done"})
  } catch (error) {
    
  }
})

app.post('/deleteRatingReview/:listname', authenticateToken, async (req, res)=>{
  const user = req.user
  const listname = req.params.listname
  try {
    await database.deleteRatingReview(user.username,listname )
    res.json({message: "Done"})
  } catch (error) {
    

  }
})
app.post('/updateListname/:oldname/:newname', authenticateToken, async (req, res)=>{
const user = req.user
const old = req.params.oldname
const newName =req.params.newname

try {
  await database.updateListname(user.username, old, newName)
  res.json({message: "Done"})
} catch (error) {
  
}

})
app.post('/UR', async (req, res) => {

  const { listname, newReview } = req.body;
  console.log(newReview)
  try {
    await database.UR(listname, newReview);
    res.json({ message: 'Review Updated' });
  } catch (error) {
    res.json({ error: 'Cannot Update Review' });
  }
});


// Route to update review
app.post('/api/ratingreview/updateReview', authenticateToken, async (req, res) => {
  const user = req.user;
  const { listname, newReview } = req.body;
  try {
    await database.updateReview(user.username, listname, newReview);
    res.json({ message: 'Review Updated' });
  } catch (error) {
    res.json({ error: 'Cannot Update Review' });
  }
});

// Route to get review
app.get('/api/ratingreview/getReview/:listname/:username', async (req, res) => {
  const user = req.params.username
  const  listname  = req.params.listname
  console.log(user)
  console.log(listname)
  try {
    const review = await database.getReview(user, listname);
    console.log(review)
    res.json(review);
  } catch (error) {
    res.json({ error: 'Cannot Get Review' });
  }
});



app.get('/getAllUsers', async (req, res)=>{
  try {
    const users = await database.getAllUsers()
    res.json(users)
  } catch (error) {
    res.json({error : "Cant get All Users"})
  }


})


app.get('/api/getAllVisibleLists', async (req, res) =>{
//const user = req.user
try {
  const lists = await database.getAllVisibleLists()
  res.json(lists)
  
} catch (error) {
  res.status('404').json({error: 'Could Not Get Visible Lists'})
}

})

app.post('/api/List/delete/:listname', authenticateToken, async (req, res) =>{
const user = req.user
const listToDelete = req.params.listname
try {
  database.deleteList(listToDelete, user.username)
  res.json({message : 'List Deleted'})
} catch (error) {
  res.status(404).json({error : "List cannot be Deleted"})
}
})

app.get('/api/superheroes/superheroinfo/researchbypattern/:number?/:field/:pattern', authenticateToken, (req, res) => {
  const number = parseInt(req.params['number']);
  const field = req.params['field'];
  const pattern = req.params['pattern'];
  const { error } = patternValidator.validate({
    number: number,
    pattern: pattern,
    field: field
  });

  if (error) {
    res.status(400).json({ error: "ServerError: Invalid Input for number/field/pattern" });
    return;
  }

  let heroIDs = [];

  for (let hero of hero_info) {
    if (!hero.hasOwnProperty(field)) {
      res.status(400).json({ error: `${field} is not a valid Hero Property` });
      return; // Exit the loop when there's an error
    }

    if (hero[field].toLowerCase().startsWith(pattern.toLowerCase())) {
      heroIDs.push(hero.id);
    }
  }
  if(heroIDs.length===0){
    res.status(400).json({error: `ServerError: ${pattern} is not founded`})
    return
  }
  // if n is not given, send all matches
  else if (!number || isNaN(number)) {
    res.json(heroIDs);
    return
  } 
  else {
    res.json(heroIDs.slice(0, number));
    return
  }
});
app.get('/getAllList/RatingReview', async(req, res)=>{
try {
  const lists = await database.getAllAndPrintRows()
  res.json(lists)
} catch (error) {
  res.json({error: "Can't Get All Lists"})
}


})

app.get('/getAllListForUser', authenticateToken, async (req, res) =>{
  
  try {
    const data = await database.getAllListsForUser(req.user.username)
    console.log(data)
    res.json(data)
  } catch (error) {
    res.status(404).json({error: "Can't Get All List For user"})
  }
})




app.get('/api/superheroes/superheropowers/getNameFromPower/:powerName', (req, res) =>{
const powerName = (req.params.powerName); 

const { error } = listNameValidator.validate({
  
  name :powerName
});
  if(error){
    res.status(400).send({error : "ServerError: Invalid Input for powerName while getting Names from powers" })
    return
  }
let names = []
for( powers of hero_powers){
  for(power in powers){
    if((powers[power] === 'True') && power.startsWith(powerName) ){
      names.push(powers.hero_names)

    }

}
}
if(names.length===0){
res.status(400).send({error: `ServerError: ${powerName} not Found`});
return;
}
res.send(JSON.stringify(names));
return 
})
app.get('/api/getListNames',(req,res) =>{
let listsEntered = []
userLists.forEach(list => {
  listsEntered.push(list.listName)
});
res.json(listsEntered)

})
app.get('/api/getPowers',(req,res) =>{
const givenPower = req.params.power
let powerArray =[]
powers = hero_powers[0]
for (power in powers){
    powerArray.push(power)
}
powerArray.shift()
res.send(powerArray)
})
app.get('/api/getRaces',(req,res) =>{
  let races = new Set(); 
  for (let hero of hero_info){
    races.add(hero.Race)
   }  
   races.delete('-')
 res.send(JSON.stringify(Array.from(races)))


})

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost: ${port}`);
});
function readFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const storage = JSON.parse(data);
    
    return storage;
  } catch (error) {
    console.error(error);
    // Handle the error as appropriate for your use case
    return null; // or another value to indicate failure
  }
}
function getPowers(id){
  const heroName = hero_info.find((hero)=> hero.id ===id).name
  
  const superheroInPowers = hero_powers.find((hero) =>hero.hero_names===heroName)
  
  const powers = [];
  for (let power in superheroInPowers) {
    if (superheroInPowers[power] === 'True') {
     powers.push(power) 
    }
}
return powers
}

function getIDs(givenListName){
  for(list of userLists){
    if(list.listName === givenListName){
      return list.IdList
    }
  }

}

//searchCriteera 
/*
ex.
{
  name: 'A',
  race: 'Human',
  power: '',
  publisher: 'Marvel'
};
returns an array of heros
*/
function searchHeroes(searchCriteria) {
  // filter each hero that matches search criteria
  return hero_info.filter(hero => {
    // add powers to each hero
    hero.powers = getPowers(parseInt(hero.id));
    const softMatch = (value, searchTerm) => {
      const similarity = stringSimilarity.compareTwoStrings(
        value.toLowerCase(),
        searchTerm.toLowerCase());
      // You can adjust this threshold as needed
      const similarityThreshold = 0.5;
      return similarity >= similarityThreshold;
    };
    return (
      (searchCriteria.name === '' || softMatch(hero.name, searchCriteria.name) || hero.name.toLowerCase().startsWith(searchCriteria.name.toLowerCase())) &&
      (searchCriteria.race === '' || softMatch(hero.Race, searchCriteria.race) || hero.Race.toLowerCase().startsWith(searchCriteria.name.toLowerCase())) &&
      (searchCriteria.power === '' || hero.powers.some(power => softMatch(power, searchCriteria.power)) || hero.powers.some(power => power.toLowerCase().startsWith(searchCriteria.power.toLowerCase()))) &&
      (searchCriteria.publisher === '' || softMatch(hero.Publisher, searchCriteria.publisher) || hero.Publisher.toLowerCase().startsWith(searchCriteria.name.toLowerCase()))
    );
  });
}




