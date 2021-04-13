const express = require('express');
const app = express();
const PORT = 8080;

const generateRandomString = function() {
  let char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomString;
};

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (request,response) => {
  response.send('Hello!');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello<b>World</b></body><html>\n');
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };
  response.render('urls_show', templateVars);
});

app.post('/urls', (request, response) => {
  console.log(request.body);
  response.send('OK');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});