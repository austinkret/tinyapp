//FUNCTION TO FIND USER BY EMAIL
const findUserByEmail = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

//GEENRATE RANDOM STRING OF 6 CHARACTERS FOR THE SHORT URL
const generateRandomString = () => {
  let char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomString;
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

module.exports = {
  findUserByEmail,
  generateRandomString,
  urlsForUser
};