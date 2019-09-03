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

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL
  console.log(req.body);  // Log the POST request body to the console
  //res.send();         // Respond with 'Ok' (we will replace this)
  console.log(urlDatabase)
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
  console.log(req.body.username);
  res.cookie("username",req.body.username);
  console.log('cookie created successfully');
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  console.log(req.body.username);
  res.clearCookie("username",req.body.username);
  console.log('this button works');
  res.redirect('/urls');
})

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.end("404 ERROR\nThat link does not exist.");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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