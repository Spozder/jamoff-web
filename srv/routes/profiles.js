const express = require("express");
const router = express.Router();
const { StateUtils } = require("../state");

module.exports = eventDriver => {
  router.get("/:id", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (err) {
        console.log("UH OH", err);
        return res.sendStatus(500);
      }
      return res.send(StateUtils.getDisplayProfile(state, req.params["id"]));
    });
  });

  return router;
};
