const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
//app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" },
  "ggBoGr": { longURL: "https://www.reddit.com", userID: "user2RandomID" }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "test1", 
    password: "test2"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.post("/urls/new", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = {
    id: newURL,
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  console.log(urlDatabase[newURL])
  //urlDatabase[newURL].longURL = req.body.longURL;
  //urlDatabase[newURL].userID = req.cookies["user_id"];
  res.redirect("/urls/" + newURL)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/")
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls/")
});

app.post('/login', (req, res) => {
  for (id in users){
    console.log(users[id].email)
    console.log(users[id].password)
    console.log(req.body.email)
    console.log(req.body.password)
    if (users[id].email === req.body.email && users[id].password === req.body.password) {
      res.cookie("user_id", id);
      console.log("Valid Login");
      return res.redirect('/urls');
      }
  }
  res.status(403).send('invalid username or password')
})

app.post('/logout', (req, res) => {
  res.clearCookie("user_id",req.body.user_id);
  res.redirect('/urls');
})

app.post('/register', (req, res) => {
  for (id in users) {
    if (users[id].email === req.body.email) {
      return res.status(400).send('Error Code: 400 Email already exists')
    }
  }

  if (req.body.email == "" || req.body.password == ""){
    res.status(400).send('Error Code: 400 Bad Request')
  } else {
    let id = generateRandomString()
    createUser(id, req.body.email, req.body.password)
    res.cookie("user_id", id);
    res.redirect('/urls');
  }
})

app.get('/register', (req, res) => {
  let templateVars = { username: userLookup(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("register.ejs", templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { username: userLookup(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("login.ejs", templateVars);
})

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"] === undefined){
    return res.redirect("/login");
  } else {
    let templateVars = { username: userLookup(req.cookies["user_id"]) };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { username: userLookup(req.cookies["user_id"]), urls: urlsForUser(req.cookies["user_id"]), id: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let redirectURL = urlDatabase[req.params.shortURL].longURL;

  if (redirectURL) {
    res.redirect(redirectURL);
  } else {
    res.end("404 ERROR\nThat link does not exist.");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] === undefined){
    return res.redirect("/login");
  } else if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('Error Code: 403 This Request was blocked by security rules')
  } else { 
  let templateVars = { username: userLookup(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newShortURL = "";
  while (newShortURL.length < 6) {
    newShortURL = newShortURL + possibleCharacters[Math.floor(Math.random()*62)];
  }
  return newShortURL;
};

const createUser = function(id, email, password){
  users[id] = {
    id: id,
    email: email,
    password: password
  }
}

const userLookup = function(id){
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
  console.log(userURLS)
  return(userURLS);
}
