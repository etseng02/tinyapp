const { assert } = require('chai');
const helpers = require('../helperFunctions')
//const testRequest = require('./testRequest')

const testUsers = {
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "sgq3y6": {
    id: "sgq3y6", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testURLS = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "sgq3y6" }
}

//console.log(helpers.getUserbyID())
const {generateRandomString, createUser, getUserbyID, urlsForUser, validateLogin, checkDuplicateOrEmpty, checkForLogin, createNewURL} = helpers(testUsers, testURLS)

describe('getUserbyID', function() {
  it('should return a user with valid email', function() {
    const user = getUserbyID("aJ48lW", testUsers)
    const expectedOutput = "user@example.com";
    assert.equal(user, expectedOutput);
  });
});


  describe('#Generate Random String', function() {
    it('should return a 6 character string', function() {
      const result = generateRandomString().length;
      const expectedOutput = 6;
      assert.equal(result, expectedOutput);
    });
  });

  describe('#urlsForUser', function() {
    it('should return the URLS that are associated with the user', function() {
      const result = urlsForUser("aJ48lW");
      const expectedOutput = {b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" }};
      assert.deepEqual(result, expectedOutput);
    });

    it('should return the URLS that are associated with the user', function() {
      const result = urlsForUser("sgq3y6");
      const expectedOutput = {i3BoGr: { longURL: "https://www.google.ca", userID: "sgq3y6" }};
      assert.deepEqual(result, expectedOutput);
    });

    // describe('#checkDuplicateOrEmpty', function() {
    //   it('should return undefined when nothing is passed. This simulates an empty request which will return 400 bad request', function() {
    //     //let newURL = checkDuplicateOrEmpty;
    //     result = checkDuplicateOrEmpty();
    //     const expectedOutput = undefined
    //     assert.deepEqual(result, expectedOutput);
    //   });
    // });



  });


