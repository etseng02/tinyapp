const bcrypt = require('bcrypt');

function generateRandomString() {
  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newShortURL = "";
  while (newShortURL.length < 6) {
    newShortURL = newShortURL + possibleCharacters[Math.floor(Math.random()*62)];
  }
  return newShortURL;
}

module.exports = function(users, urlDatabase) {
  return {
    getUserbyID: function(id, db = users){
      for (name in db) {
        if (name === id) {
          return db[id].email
        }
      }
    },
    
    generateRandomString: generateRandomString,
    
    createUser: function(req, res){
      let id = generateRandomString()
      users[id] = {
        id: id,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      }
      req.session.user_id = id;
      console.log("A new User has been Created:\n", users[id])
      },

    urlsForUser: function(id){
      let userURLS = {}
      for (url in urlDatabase){
        if (urlDatabase[url].userID === id) {
          userURLS[url] = urlDatabase[url]
        }
      }
      console.log("User URLS: \n", userURLS);
      return(userURLS);
    },

    validateLogin: function(req, res) {
      for (id in users){
        if (users[id].email === req.body.email && bcrypt.compareSync(req.body.password, users[id].password) === true) {
          req.session.user_id = id;
          console.log("Valid Login");
          return true
        }
      }
      console.log("invalid login")
      console.log("User Entered: " +req.body.email)
      console.log("User database: ", users)
      return res.status(403).send('invalid username or password')
    },

    checkDuplicateOrEmpty: function(req, res) {
      for (id in users) {
        if (users[id].email === req.body.email) {
          return res.status(400).send('Error Code: 400 Email already exists')
        }
      }
      if (req.body.email == "" || req.body.password == ""){
        return res.status(400).send('Error Code: 400 Bad Request')
      }
    },

    checkForLogin: function(req) {
      if (req.session.user_id){
        return true
      } else {
        return undefined
      }
    },

    createNewURL: function(newURL, req, res) {
      urlDatabase[newURL] = {
        id: newURL,
        longURL: req.body.longURL,
        userID: req.session.user_id
      }
      console.log("A new URL has been created: \n", urlDatabase[newURL])
    },

    validateShortURL: function (req, res) {    
      if (urlDatabase[req.params.shortURL] === undefined) {
        return res.status(404).send("404 ERROR\nThat link does not exist.");
      } else if (checkForLogin(req) === undefined) {
        return res.redirect("/login");
      } else if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
        let templateVars = { username: getUserbyID(req.session.user_id), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
        return res.render("urls_show", templateVars);
      } 
  }
}
}




// const urlsForUser=function(id){
//   let userURLS = {}
//   for (url in urlDatabase){
//     if (urlDatabase[url].userID === id) {
//       userURLS[url] = urlDatabase[url]
//     }
//   }
//   return(userURLS);
//  }

// const validateLogin = function(req, res) {
//   for (id in users){
//     if (users[id].email === req.body.email && bcrypt.compareSync(req.body.password, users[id].password) === true) {
//       req.session.user_id = id;
//       console.log("Valid Login");
//       return res.redirect('/urls');
//       }
//     }
//     console.log("invalid login")
//     console.log("User Entered: " +req.body.email)
//     console.log("User database: ", users)
//     return res.status(403).send('invalid username or password')
//   }


// module.exports = {
//   getUserbyID,
//   generateRandomString,
//   createUser,
//   //urlsForUser
//   // validateLogin
// }

/*module.exports = 
  generateRandomString,
  createUser,
  getUserbyEmail,
  urlsForUser,
  validateLogin,
  CheckDuplicateOrEmpty,
  createNewURL,
  checkForLogin
  */