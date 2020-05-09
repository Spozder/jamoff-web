const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const getNextGroupId = callback => {
    return eventDriver.getState((err, state) => {
      return callback(
        err,
        String(Math.max(...Object.keys(state.groups), 0) + 1)
      );
    });
  };

  router.get("/", (req, res) => {
    return eventDriver.getState((err, state) => res.send(state.groups));
  });

  router.post("/", (req, res) => {
    return getNextGroupId((err, newId) => {
      return eventDriver.appendEventData(
        "EVENT:GROUP:GROUP_CREATED",
        {
          id: newId,
          name: req.body.name,
          ownerId: String(req.body.ownerId),
          ...(req.body.description && { description: req.body.description })
        },
        err => {
          if (err) {
            console.log("CREATE GROUP ERROR: ", err);
            res.status(400).send("Invalid CREATE_GROUP body");
          } else {
            res.send({ id: newId });
          }
        }
      );
    });
  });

  router.put("/", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:GROUP:GROUP_UPDATED",
      {
        id: String(req.body.id),
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.ownerId && { ownerId: String(req.body.ownerId) }),
        ...(req.body.description && { description: req.body.description })
      },
      err => {
        if (err) {
          console.log("UPDATE GROUP ERROR: ", err);
          res.status(400).send("Invalid UPDATE_GROUP body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.get("/:groupId", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (!(req.params.groupId in state.groups)) {
        res.status(404).send("Group not found");
      }
      return res.send(state.groups[req.params.groupId]);
    });
  });

  router.put("/:groupId", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:GROUP:GROUP_UPDATED",
      {
        id: req.params.groupId,
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.ownerId && { ownerId: String(req.body.ownerId) }),
        ...(req.body.description && { description: req.body.description })
      },
      err => {
        if (err) {
          console.log("UPDATE GROUP ERROR: ", err);
          res.status(400).send("Invalid UPDATE_GROUP body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.get("/:groupId/members", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (!(req.params.groupId in state.groups)) {
        res.status(404).send("Group not found");
      }
      return res.send(state.groups[req.params.groupId].memberIds);
    });
  });

  router.post("/:groupId/members", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (!(req.params.groupId in state.groups)) {
        res.status(404).send("Group not found");
      }
      return eventDriver.appendEventData(
        "EVENT:GROUP:GROUP_MEMBER_ADDED",
        {
          userId: String(req.body.userId),
          groupId: String(req.params.groupId)
        },
        err => {
          if (err) {
            console.log("GROUP MEMBER ADD ERROR: ", err);
            res.status(400).send("Invalid GROUP_MEMBER_ADD body");
          } else {
            res.sendStatus(200);
          }
        }
      );
    });
  });
  return router;
};
