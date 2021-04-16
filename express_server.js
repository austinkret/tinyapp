const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { findUserByEmail, generateRandomString } = require('./helper');
const app = express();
const PORT = 8080;

//ENGINES AND MIDDLEWARE
app.set('view engine', 'ejs');
app.use(cookieSession({
  name:'session',
  keys: ['myKeys'],
}));
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
  "4bLFBN":	{longURL: "http://www.facebook.com",      userID: "Supk34" },
  "d8E3mS": {longURL: "http://www.twitter.com",       userID: "asIPk0" }
};

//DATABASE OF USERS
const users = {
  "Irod0U": {
    id: "Irod0U",
    email: "ironman@gmail.com",
    password: "$2b$10$RV6cAM4NLBq9eZObDo.mneVmrd8TjRl8Iusmoam8kp2ZbcMsw40Ru"
  },
  "BatS9b": {
    id: "BatS9b",
    email: "batman@gmail.com",
    password: "$2b$10$hPHWMkndBhQZwOZHDtK/feeMxUPnaKe8fhKA7pwFF3zvZyBsDrI5y"
  },
  "Supk34": {
    id: "Supk34",
    email: "superman@gmail.com",
    password: '$2b$10$2Apw3n61k4WFtadZA8ZxYOtJ0rxU1FDzH2LYRs0KM38pq2C1v7NVG'
  },
  "asIPk0": {
    id: "asIPk0",
    email: "thor@gmail.com",
    password: "$2b$10$x/sFo64rnGlCjCU1PLiw4.E1wr8t99QLOVHAGguuJVgepebnCvEn6"
  }
};

//////////
// DATABASE END
//////////

//////////
// FUNCTIONS SECTION
//////////

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
    userid: request.session.userid};
  response.render('urls_home', templateVars);
});

//ACCOUNT PAGE ASKING TO EITHER REGISTER OR SIGN-IN
app.get('/account', (request,response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid};
  response.render('urls_account', templateVars);
});

//REGISTER PAGE
app.get('/register', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid};
  response.render('urls_register', templateVars);
});

//POST REGISTER
app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const userExists = findUserByEmail(email, users);

  if (!email || !password) {
    return response.status(400).send('Bad Request: The email and/or password field is blank.');
  }

  if (userExists) {
    return response.status(400).send('Bad Request: This account already exists, please use the login page.');
  }
  
  const newUser = {
    id: generateRandomString(),
    email: request.body.email,
    password: bcrypt.hashSync(password, 10)
  };
  users[newUser.id] = newUser;
  request.session.userid = newUser.id;
  response.redirect('/urls');
});

//LOGIN PAGE
app.get('/login', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid
  };
  response.render('urls_login', templateVars);
});

//LOGIN BUTTON REDIRECT
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  const userExists = findUserByEmail(email, users);

  if (!email || !password) {
    return response.status(400).send('Bad Request: The email and/or password field is blank.');
  }

  if (userExists === null) {
    return response.status(403).send('Forbidden: This account does not exist.');
  }

  if (!bcrypt.compareSync(password, userExists.password)) {
    return response.status(403).send('Forbidden: The password you entered is incorrect.');
  }

  request.session.userid = userExists.id;
  response.redirect('/urls');
});

//MYURLS PAGE
app.get('/urls', (request, response) => {
  //if they are not signed, redirect to the account page
  if (!request.session.userid) {
    response.redirect('/account');
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid
  };
  response.render('urls_index', templateVars);
});

//TINYURL GENERATOR TO CREATE SHORT URL
app.post('/urls', (request, response) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {};
  urlDatabase[shortUrl].longURL = request.body.longURL;
  urlDatabase[shortUrl].userID = request.session.userid;
  
  response.redirect(`/urls`);
});

//INPUT NEW URLS TO BE SHORTENED
app.get('/urls/new', (request, response) => {
  //if they are not signed, redirect to the account page
  if (!request.session.userid) {
    response.redirect('/account');
    return;
  }

  const templateVars = {
    users: users,
    userid: request.session.userid
  };
  response.render('urls_new', templateVars);
});

//PAGE FOR EDITING SHORTURLS
app.get('/urls/:shortURL', (request, response) => {
  const userUrls = urlsForUser(request.session.userid);
  const shortURL = request.params.shortURL;
  
  if (shortURL in userUrls) {
    const templateVars = {
      shortURL: request.params.shortURL,
      longURL: urlDatabase[request.params.shortURL].longURL,
      users: users,
      userid: request.session.userid
    };
    response.render('urls_show', templateVars);
    return;
  }
  response.status(404).send('Not Found: This link either does not exist, or you do not have authorization to edit it.');
  return;
});

//EDIT/UPDATE SHORT URLS WITH A NEW LONG URL
app.post('/urls/:shortURL/edit', (request, response) => {
  urlDatabase[request.params.shortURL].longURL = request.body.longURL;
  response.redirect(`/urls/`);
});

//REDIRECT FROM TINYAPP TO ACTUAL WEBSITE VIA SHORTURL
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});

//GET DELETE URL
app.get('/urls/:shortURL/delete', (request, response) => {
  const userUrls = urlsForUser(request.session.userid);
  const shortUrl = request.params.shortURL;

  if (shortUrl in userUrls) {
    delete urlDatabase[shortUrl];
    response.redirect('/urls');
    return;
  }
  response.send('Not Found: This link either does not exist, or you do not have authorization to delete it.');
  return;
});

//POST DELETE URL FORM THE DATABASE
app.post('/urls/:shortURL/delete', (request, response) => {
  const userUrls = urlsForUser(request.session.userid);
  const shortUrl = request.params.shortURL;

  if (shortUrl in userUrls) {
    delete urlDatabase[shortUrl];
    response.redirect('/urls');
    return;
  }
  response.send('Not Found: This link either does not exist, or you do not have authorization to delete it.');
  return;
});

//LOGOUT BUTTON RE-DIRECT
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/urls");
});

//////////
// ROUTES END
//////////

//LISTEN FOR PORT CHOSEN AT TOP OF FILE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});