const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

//ENGINES AND USES OF MODULES
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

//GEENRATE RANDOM STRING OF 6 CHARACTERS FOR THE SHORT URL
const generateRandomString = function() {
  let char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomString;
};

//DATABASE OF URLS
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "Irod0U" },
  "9sm5xK": {longURL: "http://www.google.com",        userID: "BatS9b" },
  "He8Kv2":	{longURL: "http://www.superman.com",      userID: "Supk34" },
  "d92lH4": {longURL: "http://www.youtube.com",       userID: "Irod0U" },
  "R012jS": {longURL: "http://www.espn.com",          userID: "BatS9b" },
  "4bLFBN":	{longURL: "http://www.facebook.com",      userID: "Supk34" }
};

//DATABASE OF USERS
const users = {
  "Irod0U": {
    id: "L3kd0U",
    email: "ironman@gmail.com",
    password: "tonyStark"
  },
  "BatS9b": {
    id: "do3S9b",
    email: "batman@gmail.com",
    password: "iHeartRobin"
  },
  "Supk34": { 
    id: "IyHk34",
    email: "superman@gmail.com",
    password: "iAmNotClarkKent" }
};

//FUNCTION TO FIND USER BY EMAIL
const findUserByEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (users.email === email) {
      return user;
    }
  }
  return null;
};

//REDIRECT TRAFFIC FROM / TO /URLS HOMEPAGE
app.get('/', (request,response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']};
  response.render('urls_home', templateVars);
});

//REGISTER PAGE
app.get('/register', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']};
  response.render('urls_register', templateVars);
});

//POST REGISTER
app.post('/register', (request, response) => {
  const {
    email,
    password} = request.body;
  if (!email || !password) {
    return response.sendStatus(400);
  }

  const userExists = findUserByEmail(email);

  if (userExists) {
    return response.sendStatus(400);
  }
  
  const newUser = {
    id: generateRandomString(),
    email: request.body.email,
    password: request.body.password
  };
  users[newUser.id] = newUser;
  response.cookie('userid', newUser.id);
  response.redirect('/urls');
  console.log('WHO IS MY NEW USER', newUser);
});

//LOGIN PAGE
app.get('/login', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']};
  response.render('urls_login', templateVars);
});

//LOGIN BUTTON REDIRECT
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  //IF THE FIELDS ARE LEFT BLANK
  if (!email || !password) {
    return response.sendStatus(400);
  }

  const userExists = findUserByEmail(email);

  //IF WE CAN'D FIND A USER WITH THAT EMAIL
  if (userExists === null) {
    return response.sendStatus(403);
  }

  //IF WE FIND A USER THAT MATCHES THEN WE CHECK THE PASSWORDS
  if (userExists.password !== password) {
    return response.sendStatus(403);
  }
  response.cookie('userid', userExists.id);

  response.redirect('/urls');
});

//LOGOUT BUTTON RE-DIRECT
app.post("/logout", (request, response) => {
  response.clearCookie('userid');
  response.redirect("/urls");
});

//HOMEPAGE
app.get('/urls', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']
  };
  response.render('urls_index', templateVars);
});

//INPUT NEW URLS TO BE SHORTENED
app.get('/urls/new', (request, response) => {
  const templateVars = {
    users: users,
    userid: request.cookies['userid']
  };
  response.render('urls_new', templateVars);
});

//PAGE FOR SHOWING AND EDITING URLS
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    users: users,
    userid: request.cookies['userid']
  };
  response.render('urls_show', templateVars);
});

//TINYURL GENERATOR TO CREATE SHORT URL
app.post('/urls', (request, response) => {
  const shortUrl = generateRandomString();
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL
  };
  response.render('urls_show', templateVars);
});

//REDIRECT FROM TINYAPP TO ACTUAL WEBSITE VIA SHORTURL
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});

//DELETE URL FORM THE DATABASE
app.post('/urls/:shortURL/delete', (request, response) => {
  const deleteUrl = request.params.shortURL;
  delete urlDatabase[deleteUrl];

  response.redirect('/urls');
});

//EDIT/UPDATE SHORT URLS WITH A NEW LONG URL
app.post('/urls/:shortURL/edit', (request, response) => {
  urlDatabase[request.params.shortURL].longURL = request.body.longURL;
  response.redirect(`/urls/`);
});

//LISTEN FOR PORT CHOSEN AT TOP OF FILE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});