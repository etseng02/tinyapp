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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
}

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL
  //console.log(req.body);  // Log the POST request body to the console
  //res.send();         // Respond with 'Ok' (we will replace this)
  //console.log(urlDatabase)
  res.redirect("/urls/" + newURL)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/")
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
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
  //console.log(req.body.username);
  res.clearCookie("user_id",req.body.user_id);
  //console.log('this button works');
  res.redirect('/urls');
})

app.post('/register', (req, res) => {
  //console.log(req.body.email, req.body.password)
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
    //console.log(users);
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
  let templateVars = { username: userLookup(req.cookies["user_id"]) };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: userLookup(req.cookies["user_id"]), urls: urlDatabase };
  res.render("urls_index", templateVars);
  //console.log("this is the result of userlookup function: " + userLookup(req.cookies["user_id"]))
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.end("404 ERROR\nThat link does not exist.");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: userLookup(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  //const longURL = urlDatabase[req.params.shortURL];
  res.render("urls_show", templateVars);
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
    //console.log (name);
    if (name === id) {
      return users[id].email
    }
  }
}

/*class createUser {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}*/