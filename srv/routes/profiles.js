const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const { getsReadState } = require("./middleware")(eventDriver);

  router.get("/:id", getsReadState, (req, res) => {
    return res.send(req.readState.getDetailedProfile(req.params["id"]));
  });

  return router;
};
