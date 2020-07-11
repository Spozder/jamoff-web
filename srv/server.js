const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const CustomStrategy = require("passport-custom").Strategy;
const jwt = require("jwt-simple");

// TODO CHANGE
const JWT_SECRET = "IdkManSomethingDumb";

const app = express();
const port = 3000;
const history = require("connect-history-api-fallback");

const eventDriver = require("./events/event-driver");

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "UhhhhIdk" })); // TODO CHANGE
app.use(passport.initialize());
app.use(passport.session());

const { checkPassword } = require("./utils");

const API_BASE = "/api";

// Login Stuff
passport.serializeUser((user, done) => {
  done(null, user.userId);
});

passport.deserializeUser((id, done) => {
  console.log("Deserializing userId: ", id);
  eventDriver.getReadState((err, state) => {
    done(err, state.profiles[id]);
  });
});

passport.use(
  new LocalStrategy((email, password, done) => {
    eventDriver.getReadState((err, state) => {
      if (err) {
        return done(err);
      }
      const identity = state.findIdentityByEmail(email);
      if (!identity) {
        return done(null, false, { message: "Email not found" });
      } else {
        return checkPassword(password, identity.passHash, (err, result) => {
          if (!result) {
            return done(null, false, { message: "Incorrect password" });
          }
          return done(null, state.profiles[identity.userId]);
        });
      }
    });
  })
);

passport.use(
  new BearerStrategy((token, done) => {
    const decodedObject = jwt.decode(token, JWT_SECRET);
    const { id: decodedId } = decodedObject;

    return eventDriver.getReadState((err, state) => {
      return done(err, state.profiles[decodedId]);
    });
  })
);

passport.use(
  "json-body",
  new CustomStrategy((req, done) => {
    if (!req.body || !req.body.email || !req.body.password) {
      return done(null, false, { message: "Invalid login request body" });
    }
    const email = req.body.email;
    eventDriver.getReadState((err, state) => {
      if (err) {
        return done(err);
      }

      const identity = state.findIdentityByEmail(email);
      if (!identity) {
        return done(null, false, { message: "Email not found" });
      } else {
        return checkPassword(
          req.body.password,
          identity.passHash,
          (err, result) => {
            if (!result) {
              return done(null, false, { message: "Incorrect password" });
            }
            return done(null, state.profiles[identity.userId]);
          }
        );
      }
    });
  })
);

app.get(API_BASE + "/echo", (req, res) => {
  console.log(req.query);
  return res.sendStatus(200);
});

const { ensureAuthenticated } = require("./routes/middleware")(eventDriver);

app.get(
  API_BASE + "/checkAuth",
  passport.authenticate(["bearer", "session"]),
  (req, res) => {
    if (!req.isAuthenticated()) {
      return res.send({ isAuthenticated: false });
    }
    return res.send({
      isAuthenticated: true,
      userId: req.user.userId
    });
  }
);

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login?failure=true" }),
  (req, res) => {
    return res.redirect("/me?loggedIn=true");
  }
);

app.post(
  API_BASE + "/login",
  passport.authenticate("json-body"),
  (req, res) => {
    console.log("Authenticated API user: ", req.user);
    const jwtObject = { time: new Date(Date.now()), id: req.user.userId };
    res.send({
      userId: req.user.userId,
      accessToken: jwt.encode(jwtObject, JWT_SECRET)
    });
  }
);

app.get(API_BASE + "/logout", (req, res) => {
  req.logout();
  res.send({ message: "Logout successful" });
});

// TODO: Remove
app.get(API_BASE + "/hello", (req, res) => res.send("Hello World!"));
app.get(API_BASE + "/test", (req, res) => {
  return eventDriver.getReadState((err, state) => res.send(state));
});

// TODO: Remove
app.get(API_BASE + "/identities", (req, res) => {
  return eventDriver.getReadState((err, state) => res.send(state.identities));
});

app.use(API_BASE + "/users", require("./routes/users")(eventDriver));
app.use(API_BASE + "/groups", require("./routes/groups")(eventDriver));
app.use(API_BASE + "/rounds", require("./routes/rounds")(eventDriver));
app.use(API_BASE + "/spotify", [
  passport.authenticate(["bearer", "session"], { session: false }),
  require("./routes/spotify")(eventDriver)
]);
app.use(API_BASE + "/me", [
  passport.authenticate(["bearer", "session"], { session: false }),
  ensureAuthenticated,
  require("./routes/me")(eventDriver)
]);
app.use(API_BASE + "/profiles", require("./routes/profiles")(eventDriver));

app.use(express.static(__dirname + "/../dist"));

app.use(
  history({
    index: "/index.html",
    verbose: true,
    disableDotRule: true
  })
);

app.use(express.static(__dirname + "/../dist"));

// listen on the port
console.log("Starting express app!");
app.listen(port);
