const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;
const history = require("connect-history-api-fallback");

const eventDriver = require("./events/event-driver");

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/../dist"));

const API_BASE = "/api";

app.get(API_BASE + "/hello", (req, res) => res.send("Hello World!"));

app.get(API_BASE + "/test", (req, res) => {
  return eventDriver.getState((err, state) => res.send(state));
});

app.get(API_BASE + "/profiles", (req, res) => {
  return eventDriver.getState((err, state) => res.send(state.profiles));
});

app.use(API_BASE + "/users", require("./routes/users")(eventDriver));
app.use(API_BASE + "/groups", require("./routes/groups")(eventDriver));

app.use(
  history({
    index: "/index.html",
    verbose: true
  })
);

// listen on the port
console.log("Starting express app!");
app.listen(port);
