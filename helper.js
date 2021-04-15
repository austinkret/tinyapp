//FUNCTION TO FIND USER BY EMAIL
const findUserByEmail = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

//GENERATE RANDOM STRING OF 6 CHARACTERS FOR THE SHORT URL
const generateRandomString = () => {
  let char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomString;
};

module.exports = {
  findUserByEmail,
  generateRandomString
};