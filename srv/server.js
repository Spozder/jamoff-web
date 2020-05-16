const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const CustomStrategy = require("passport-custom").Strategy;
const { ensureLoggedIn } = require("connect-ensure-login");
const jwt = require("jwt-simple");

// TODO CHANGE
const JWT_SECRET = "IdkManSomethingDumb";

const app = express();
const port = 3000;
const history = require("connect-history-api-fallback");

const eventDriver = require("./events/event-driver");
const { StateUtils } = require("./state");

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "UhhhhIdk" })); // TODO CHANGE
app.use(passport.initialize());
app.use(passport.session());

const API_BASE = "/api";

// Login Stuff
passport.serializeUser((user, done) => {
  done(null, user.userId);
});

passport.deserializeUser((id, done) => {
  console.log("Deserializing userId: ", id);
  eventDriver.getState((err, state) => {
    done(err, state.profiles[id]);
  });
});

passport.use(
  new LocalStrategy((email, password, done) => {
    eventDriver.getState((err, state) => {
      if (err) {
        return done(err);
      }
      const identity = StateUtils.getIdentityForEmail(state, email);
      if (!identity) {
        return done(null, false, { message: "Email not found" });
      } else if (identity.passHash !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, state.profiles[identity.userId]);
    });
  })
);

passport.use(
  new BearerStrategy((token, done) => {
    const decodedObject = jwt.decode(token, JWT_SECRET);
    const { id: decodedId } = decodedObject;

    return eventDriver.getState((err, state) => {
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
    const passHash = req.body.password;
    eventDriver.getState((err, state) => {
      if (err) {
        return done(err);
      }

      const identity = StateUtils.getIdentityForEmail(state, email);
      if (!identity) {
        return done(null, false, { message: "Email not found" });
      } else if (identity.passHash !== passHash) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, state.profiles[identity.userId]);
    });
  })
);

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.sendStatus(403);
};

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

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/?logout=true");
});

app.get(API_BASE + "/logout", (req, res) => {
  req.logout();
  res.send({ message: "Logout successful" });
});

// TODO: Remove
app.get(API_BASE + "/hello", (req, res) => res.send("Hello World!"));
app.get(API_BASE + "/test", (req, res) => {
  return eventDriver.getState((err, state) => res.send(state));
});

// TODO: Remove
app.get(API_BASE + "/identities", (req, res) => {
  return eventDriver.getState((err, state) => res.send(state.identities));
});

app.use(API_BASE + "/users", require("./routes/users")(eventDriver));
app.use(API_BASE + "/groups", require("./routes/groups")(eventDriver));
app.use(API_BASE + "/rounds", require("./routes/rounds")(eventDriver));
app.use(API_BASE + "/me", [
  passport.authenticate(["bearer", "session"], { session: false }),
  ensureAuthenticated,
  require("./routes/me")(eventDriver)
]);

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
