const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;
const history = require("connect-history-api-fallback");

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/../dist"));

const API_BASE = "/api";

app.get(API_BASE + "/hello", (req, res) => res.send("Hello World!"));

app.use(
  history({
    index: "/index.html",
    verbose: true
  })
);

// listen on the port
console.log("Starting express app!");
app.listen(port);
