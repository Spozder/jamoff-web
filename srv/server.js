const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
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
    const decodedId = jwt.decode(token, JWT_SECRET);

    return eventDriver.getState((err, state) => {
      return done(err, state.profiles[decodedId]);
    });
  })
);

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.sendStatus(403);
};

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Authenticated user: ", req.user);
    res.redirect("/");
  }
);

app.post(API_BASE + "/login", passport.authenticate("local"), (req, res) => {
  console.log("Authenticated API user: ", req.user);
  res.send({
    userId: req.user.userId,
    accessToken: jwt.encode(req.user.userId, JWT_SECRET)
  });
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
  passport.authenticate(["session", "bearer"], { session: false }),
  ensureAuthenticated,
  require("./routes/me")(eventDriver)
]);

app.use(express.static(__dirname + "/../dist"));

app.use(
  history({
    index: "/index.html",
    verbose: true
  })
);

// listen on the port
console.log("Starting express app!");
app.listen(port);
