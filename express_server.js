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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//DATABASE OF USERS
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dishwashers"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "IyHk34": { 
    id: "IyHk34",
    email: "superman@gmail.com",
    password: "iAmNotClarkKent" }
};

//FUNCTION TO FIND USER BY EMAIL
const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//REDIRECT TRAFFIC FROM / TO /URLS HOMEPAGE
app.get('/', (request,response) => {
  response.redirect('/urls/');
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
  response.redirect('urls_login');
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
    longURL: urlDatabase[request.params.shortURL],
    users: users,
    userid: request.cookies['userid']
  };
  response.render('urls_show', templateVars);
});

//TINYURL GENERATOR TO CREATE SHORT URL
app.post('/urls', (request, response) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = request.body.longURL;
  const templateVars = {shortURL: shortUrl, longURL: urlDatabase[shortUrl]};
  response.render('urls_show', templateVars);
});

//REDIRECT FROM TINYAPP TO ACTUAL WEBSITE VIA SHORTURL
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
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
  urlDatabase[request.params.shortURL] = request.body.longURL;
  response.redirect(`/urls/`);
});

//LISTEN FOR PORT CHOSEN AT TOP OF FILE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});