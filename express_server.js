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

//DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//REDIRECT TRAFFIC FROM / TO /URLS HOMEPAGE
app.get('/', (request,response) => {
  response.redirect('/urls/');
});

//LOGIN PAGE
app.post("/login", (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls/');
});

//LOGOUT PAGE
app.post("/logout", (request, response) => {
  response.clearCookie('username');
  response.redirect("/urls");
});

//HOMEPAGE
app.get('/urls', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    username: request.cookies["username"]
  };
  response.render('urls_index', templateVars);
});

//INPUT NEW URLS TO BE SHORTENED
app.get('/urls/new', (request, response) => {
  const templateVars = {
    username: request.cookies["username"]
  };
  response.render('urls_new', templateVars);
});

//PAGE FOR SHOWING AND EDITING URLS
app.get('/urls/:shortURL', (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    username: request.cookies["username"]
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