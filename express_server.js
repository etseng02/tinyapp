const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(express.urlencoded({extended: false}))

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['id'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// DATABASES THAT CONTAIN USERS AND LINKS

const urlDatabase = {};
const users = {}

// ALL POST REQUESTS - Ordered in Happy Path --- Register, Create new URL, Edit, URL, Delete URL, Logout, Log back in.

app.post('/register', (req, res) => {
  CheckDuplicateOrEmpty(req, res);
  createUser(req, res);
  res.redirect('/urls');
})

app.post("/urls/new", (req, res) => {
  let newURL = generateRandomString();
  createNewURL(newURL, req, res);
  res.redirect("/urls/" + newURL)
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls/")
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/")
});

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  validateLogin(req, res);
})

//ALL GET REQUESTS FOR ALL PAGES

app.get('/', (req, res) => {
  let templateVars = { username: getUserbyEmail(req.session.user_id) };
  res.redirect("/urls");
})

app.get('/register', (req, res) => {
  let templateVars = { username: getUserbyEmail(req.session.user_id) };
  res.render("register.ejs", templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { username: getUserbyEmail(req.session.user_id) };
  res.render("login.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
  if (checkForLogin(req) === undefined){
    return res.redirect("/login");
  } else {
    let templateVars = { username: getUserbyEmail(req.session.user_id) };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { username: getUserbyEmail(req.session.user_id), urls: urlsForUser(req.session.user_id), id: req.session.user_id };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send("404 ERROR\nThat link does not exist.");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (checkForLogin(req) === true) {
    let templateVars = { username: getUserbyEmail(req.session.user_id), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
    res.render("urls_show", templateVars);
  } else if (checkForLogin(req) === undefined) {
    return res.redirect("/login");
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('Error Code: 403 This Request was blocked by security rules')
  } 
});

app.listen(PORT, () => {
  console.log(`-------- The server has initalized on PORT ${PORT}!  -------- `);
});

// HELPER FUNCTIONS

const generateRandomString = function() {
  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newShortURL = "";
  while (newShortURL.length < 6) {
    newShortURL = newShortURL + possibleCharacters[Math.floor(Math.random()*62)];
  }
  return newShortURL;
};

const createUser = function(req, res){
  let id = generateRandomString()
  req.session.user_id = id;
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  console.log("A new User has been Created:\n", users[id]);
}

const getUserbyEmail = function(id){
  for (name in users) {
    if (name === id) {
      return users[id].email
    }
  }
}

const urlsForUser=function(id){
  let userURLS = {}
  for (url in urlDatabase){
    if (urlDatabase[url].userID === id) {
      userURLS[url] = urlDatabase[url]
    }
  }
  return(userURLS);
}

const validateLogin = function(req, res) {
  for (id in users){
    if (users[id].email === req.body.email && bcrypt.compareSync(req.body.password, users[id].password) === true) {
      req.session.user_id = id;
      console.log("Valid Login");
      return res.redirect('/urls');
      }
    }
    console.log("invalid login")
    console.log("User Entered: " +req.body.email)
    console.log("User database: ", users)
    return res.status(403).send('invalid username or password')
  }

const CheckDuplicateOrEmpty = function(req, res) {
  for (id in users) {
    if (users[id].email === req.body.email) {
      return res.status(400).send('Error Code: 400 Email already exists')
    }
  }
  if (req.body.email == "" || req.body.password == ""){
    return res.status(400).send('Error Code: 400 Bad Request')
  }
}

const checkForLogin = function(req) {
  if (req.session.user_id){
    return true
  } else {
    return undefined
  }
}

const createNewURL = function(newURL, req, res) {
  urlDatabase[newURL] = {
    id: newURL,
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  console.log("A new URL has been created: \n", urlDatabase[newURL])
}
