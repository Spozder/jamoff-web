// Routes related to my profile, groups, etc

const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  router.get("/", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (err) {
        console.log("UH OH", err);
        return res.sendStatus(500);
      }
      return res.send(state.profiles[req.user.userId]);
    });
  });

  router.get("/groups", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (err) {
        console.log("UH OH", err);
        return res.sendStatus(500);
      }
      return res.send(
        req.user.memberOfGroups.map(groupId => state.groups[groupId])
      );
    });
  });

  return router;
};
