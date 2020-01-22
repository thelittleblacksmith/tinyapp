const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const randomatic = require("randomatic");

const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = () => randomatic("aA0", 6);

const grabObjFromEmail = (email, objRef) => {
  for (const refId in objRef) {
    if (objRef[refId].email === email) {
      return objRef[refId];
    }
  }
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  // [generateRandomString()]: "https://eina.ca",
};

const users = {
  test: {
    id: "test",
    email: "test@test.com",
    password: "123456789",
  },
  // XYcRTZ: {
  //   id: "XYcRTZ",
  //   email: "test1@test.com",
  //   password: "123456789",
  // },
};

/**
 *
 x  A user can register
 x  A user cannot register with an email address that has already been used
 x  A user can log in with a correct email/password
 x  A user sees the correct information in the header
 x A user cannot log in with an incorrect email/password
 x  A user can log out
 */

// set view engine to ejs
// app.set('views', './');
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register", {});
});

app.get("/login", (req, res) => {
  res.render("urls_login", {});
});

app.get("/urls", (req, res) => {
  // console.log("what are you", users[req.cookies.user_id]);
  res.render("urls_index", {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies.user_id] });
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: users[req.cookies.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_error");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    res.render("urls_error", { user: users[req.cookies.user_id] });
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const doesEmailExist =
    grabObjFromEmail(email, users) &&
    grabObjFromEmail(email, users).email;

  console.log({ email, password, doesEmailExist });
  if (!email && !password) {
    res.status(400);
    res.send("Please fill out email and/or password");
  }

  if (doesEmailExist) {
    res.status(400);
    res.send("Email already exists");
  }

  const userId = generateRandomString();
  users[userId] = { id: userId, email, password };

  res.cookie("user_id", userId);
  console.log("user obj", users);
  // console.log("cookies???", req.cookies);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userObj = grabObjFromEmail(req.body.email, users);
  if (!userObj) {
    res.status(403);
    res.send("User not found");
  }

  if (userObj && userObj.password !== req.body.password) {
    res.status(403);
    res.send("Wrong password");
  }
  if (userObj && userObj.password === req.body.password) {
    let templateVars = {
      user: userObj,
      urls: urlDatabase,
    };
    // console.log("hello???", userObj.id);
    res.cookie("user_id", userObj.id);
    res.render("urls_index", templateVars);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { newURL } = req.body;

  urlDatabase[shortURL] = newURL;
  return res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
