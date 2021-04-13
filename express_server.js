const express = require('express');
const cookieParser = require('cookie-parser');
const { response } = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

const generateRandomString = function() {
  let char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Direct all traffic to the /urls 'homepage'
app.get('/', (request,response) => {
  response.redirect('/urls/');
});

app.post("/login", (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls/');
});

app.post("/logout", (request, response) => {
  response.clearCookie('username');
  response.redirect("/urls");
});

app.get('/urls', (request, response) => {
  const templateVars = {
    urls: urlDatabase,
    username: request.cookies["username"]
  };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  const templateVars = {
    username: request.cookies["username"]
  };
  response.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    username: request.cookies["username"]
  };
  response.render('urls_show', templateVars);
});

app.post('/urls', (request, response) => {
  const shortUrl = generateRandomString();
  //use the generateRandomString function to generate the 6 digit alphanumeric string for the shortURL
  urlDatabase[shortUrl] = request.body.longURL;
  const templateVars = {shortURL: shortUrl, longURL: urlDatabase[shortUrl]};
  response.render('urls_show', templateVars);
  //stores the url is the urlDatabase with the short and long urls, viewable from the urls_show.ejs
});

app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

//delete urls from the database
app.post('/urls/:shortURL/delete', (request, response) => {
  const deleteUrl = request.params.shortURL;
  delete urlDatabase[deleteUrl];

  response.redirect('/urls');
});

//Edit/update the urls in the form
app.post('/urls/:shortURL/edit', (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.longURL;
  response.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});