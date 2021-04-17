const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { findUserByEmail, generateRandomString } = require('./helper');
const app = express();
const PORT = 3000;

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

};

//DATABASE OF USERS
const users = {

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

//GET HOMEPAGE - HOMEPAGE FOR USER TO BE INTRODUCED TO THE SITE, RETURN HERE IF CLICK ON TINYAPP IN HEADER
app.get('/', (request,response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid};

  response.render('urls_home', templateVars);
});

//GET ACCOUNT - IF USER NOT LOGGED IN TRIES TO ACCESS MYURLS OR CREATE URLS, REDIRECTED HERE
app.get('/account', (request,response) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid};

  response.render('urls_account', templateVars);
});

//GET REGISTER - REGISTER PAGE
app.get('/register', (request, response) => {
  if (request.session.userid) {
    response.redirect('/urls');
    return;
  }

  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid};

  response.render('urls_register', templateVars);
});

//POST REGISTER - REGISTER AUTHENTICATION
app.post('/register', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const userExists = findUserByEmail(email, users);

  if (!email || !password) {
    return response.status(400).send('Bad Request: The email and/or password field is blank. Please go back and input your information.');
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

//GET LOGIN - LOGIN PAGE
app.get('/login', (request, response) => {
  if (request.session.userid) {
    response.redirect('/urls');
    return;
  }

  const templateVars = {
    urls: urlDatabase,
    users: users,
    userid: request.session.userid
  };

  response.render('urls_login', templateVars);
});

//POST LOGIN - LOGIN AUTHENTICATION
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const userExists = findUserByEmail(email, users);

  if (!email || !password) {
    return response.status(400).send('Bad Request: The email and/or password field is blank. Please go back and input your information.');
  }

  if (!userExists) {
    return response.status(403).send('Forbidden: This account does not exist.');
  }

  if (!bcrypt.compareSync(password, userExists.password)) {
    return response.status(403).send('Forbidden: The password you entered is incorrect.');
  }

  request.session.userid = userExists.id;

  response.redirect('/urls');
});

//GET URLS - LIST OF SHORT URLS CREATED
app.get('/urls', (request, response) => {
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

//POST URLS - GENERATE RANDOM SHORT URL STRING
app.post('/urls', (request, response) => {
  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = {};
  urlDatabase[shortUrl].longURL = request.body.longURL;
  urlDatabase[shortUrl].userID = request.session.userid;
  
  response.redirect(`/urls`);
});

//GET NEW URLS - CREATE NEW SHORT URL PAGE
app.get('/urls/new', (request, response) => {
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

//GET URLS/:SHORTURL - VIEW AND EDIT SHORT URLS CREATED
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

//POST URLS/:SHORTURL - EDIT/UPDATE SHORT URLS WITH A NEW LONG URL, REDIRECT TO URLS PAGE
app.post('/urls/:shortURL/edit', (request, response) => {
  urlDatabase[request.params.shortURL].longURL = request.body.longURL;
  response.redirect('/urls');
});

//GET U/:SHORTURLS - REDIRECT FROM TINYAPP TO ACTUAL WEBSITE VIA SHORTURL
app.get('/u/:shortURL', (request, response) => {
  const shortURL = request.params.shortURL;
  
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[request.params.shortURL].longURL;
    if (longURL.substring(0, 7) !== 'http://') {
      return response.redirect(`http://${longURL}`);
    } else {
      return response.redirect(longURL);
    }
  }
  return response.status(404).send('Not Found: This link does not exist.');
});

//GET DELETE URL - DELETE THE URL
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

//POST DELETE URL - DELETE THE URL
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

//POST LOGOUT - LOGOUT BUTTON RE-DIRECT TO DEFAULT ACCOUNT PAGE
app.post("/logout", (request, response) => {
  request.session = null;
  
  response.redirect("/account");
});

//////////
// ROUTES END
//////////

//LISTEN FOR PORT CHOSEN AT TOP OF FILE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});