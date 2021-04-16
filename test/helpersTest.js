const { assert } = require('chai');

const { findUserByEmail } = require('../helper');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users);
    const userid = user.id;
    const expectedOutput = "userRandomID";
    assert.strictEqual(userid, expectedOutput);
  });

  it('should return a undefined if the email does not exist', function() {
    const user = findUserByEmail("notanemail@gexample.com", users);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});