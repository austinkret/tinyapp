const express = require('express');
const cookieParser = require('cookie-parser');
const { request } = require('express');
const app = express();
const PORT = 8080;

//ENGINES AND USES OF MODULES
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));



//////////
// DATABASE SECTION
//////////

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
    id: "Irod0U",
    email: "ironman@gmail.com",
    password: "tonyStark"
  },
  "BatS9b": {
    id: "BatS9b",
    email: "batman@gmail.com",
    password: "iHeartRobin"
  },
  "Supk34": {
    id: "Supk34",
    email: "superman@gmail.com",
    password: "iAmNotClarkKent" }
};

//////////
// DATABASE END
//////////

//////////
// FUNCTIONS SECTION
//////////

//GEENRATE RANDOM STRING OF 6 CHARACTERS FOR THE SHORT URL
const generateRandomString = () => {
  let char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomString;
};

//FUNCTION TO FIND USER BY EMAIL
const findUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

//RETURNS URLS WHERE THE USERID IS EQUAL TO ID OF CURRENT USER
const urlsForUser = (id) => {
  const urlsByUser = {};

  for (const urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      urlsByUser[urls] = urlDatabase[urls];
    }
  }
  return urlsByUser;
};

console.log(urlsForUser('BatS9b'));

//////////
// FUNCTIONS END
//////////

//////////
// ROUTES SECTION
//////////

//HOMEPAGE
app.get('/', (request,response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']};
  response.render('urls_home', templateVars);
});

//ACCOUNT PAGE ASKING TO EITHER REGISTER OR SIGN-IN
app.get('/account', (request,response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']};
  response.render('urls_account', templateVars);
});

//MYURLS PAGE
app.get('/urls', (request, response) => {
  //if they are not signed, redirect to the account page
  if (!request.cookies.userid) {
    response.redirect('/account');
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']
  };
  response.render('urls_index', templateVars);
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
    return response.status(400).send('Bad Request: The email and/or password field is blank.');
  }

  const userExists = findUserByEmail(email);

  if (userExists) {
    return response.status(400).send('Bad Request: This account already exists, please use the login page.');
  }
  
  const newUser = {
    id: generateRandomString(),
    email: request.body.email,
    password: request.body.password
  };
  users[newUser.id] = newUser;
  response.cookie('userid', newUser.id);
  response.redirect('/urls');
});

//LOGIN PAGE
app.get('/login', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.cookies['userid']
  };
  response.render('urls_login', templateVars);
});

//LOGIN BUTTON REDIRECT
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  //IF THE FIELDS ARE LEFT BLANK
  if (!email || !password) {
    return response.status(400).send('Bad Request: The email and/or password field is blank.');
  }

  const userExists = findUserByEmail(email);

  //IF WE CAN'D FIND A USER WITH THAT EMAIL
  if (userExists === null) {
    return response.status(403).send('Forbidden: This account does not exist.');
  }

  //IF WE FIND A USER THAT MATCHES THEN WE CHECK THE PASSWORDS
  if (userExists.password !== password) {
    return response.status(403).send('Forbidden: The password you entered is incorrect.');
  }

  response.cookie('userid', userExists.id);
  response.redirect('/urls');
});

//LOGOUT BUTTON RE-DIRECT
app.post("/logout", (request, response) => {
  response.clearCookie('userid');
  response.redirect("/urls");
});

//INPUT NEW URLS TO BE SHORTENED
app.get('/urls/new', (request, response) => {
  //if they are not signed, redirect to the account page
  if (!request.cookies.userid) {
    response.redirect('/account');
    return;
  }

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

//////////
// ROUTES END
//////////

//LISTEN FOR PORT CHOSEN AT TOP OF FILE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});