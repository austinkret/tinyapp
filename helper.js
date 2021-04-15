//FUNCTION TO FIND USER BY EMAIL
const findUserByEmail = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

module.exports = {
  findUserByEmail
};