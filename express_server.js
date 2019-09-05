const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
//const bcrypt = require('bcrypt');
const helpers = require('./helperFunctions')
app.use(express.urlencoded({extended: false}))

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['id'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// DATABASES THAT CONTAIN USERS AND LINKS

const urlDatabase = {};
const users = {}

const {generateRandomString, createUser, getUserbyID, urlsForUser, validateLogin, checkDuplicateOrEmpty, checkForLogin, createNewURL, validateShortURL} = helpers(users, urlDatabase)

// ALL POST REQUESTS - Ordered in Happy Path --- Register, Create new URL, Edit, URL, Delete URL, Logout, Log back in.

app.post('/register', (req, res) => {
  checkDuplicateOrEmpty(req, res);
  createUser(req, res);
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
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
  res.redirect('/urls');
})

//ALL GET REQUESTS FOR ALL PAGES

app.get('/', (req, res) => {
  if (checkForLogin === true) {
  res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
})

app.get("/urls", (req, res) => {
  let templateVars = { username: getUserbyID(req.session.user_id), urls: urlsForUser(req.session.user_id), id: req.session.user_id };
  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = { username: getUserbyID(req.session.user_id) };
  res.render("register.ejs", templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { username: getUserbyID(req.session.user_id) };
  res.render("login.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
  if (checkForLogin(req) === undefined){
    return res.redirect("/login");
  } else {
    let templateVars = { username: getUserbyID(req.session.user_id) };
    res.render("urls_new", templateVars);
  }
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
    validateShortURL(req, res);
});

app.listen(PORT, () => {
  console.log(`-------- The server has initalized on PORT ${PORT}!  -------- `);
});