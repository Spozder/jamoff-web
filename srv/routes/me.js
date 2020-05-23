// Routes related to my profile, groups, etc

const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const { getsReadState } = require("./middleware")(eventDriver);

  router.get("/", getsReadState, (req, res) => {
    return res.send(req.readState.getDetailedProfile(req.user.userId));
  });

  router.get("/groups", getsReadState, (req, res) => {
    return res.send(
      req.user.memberOfGroups.map(groupId =>
        req.readState.getDetailedGroup(groupId)
      )
    );
  });

  return router;
};
