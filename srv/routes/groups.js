const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const {
    getsReadState,
    handleAppendEventError,
    ensureAuthenticated,
    ensureMemberOfGroup,
    ensureOwnerOfGroup,
    getsUserSpotifyApi
  } = require("./middleware")(eventDriver);

  router.get("/", getsReadState, (req, res) => {
    return res.send(req.readState.groups);
  });

  router.post("/", getsReadState, (req, res) => {
    const newGroupId = req.readState.getNextGroupId();

    return eventDriver.appendEventData(
      "EVENT:GROUP:GROUP_CREATED",
      {
        id: newGroupId,
        name: req.body.name,
        ownerId: String(req.body.ownerId),
        ...(req.body.description && { description: req.body.description })
      },
      err => {
        return handleAppendEventError(err, res, () => {
          return res.send({ id: newGroupId });
        });
      }
    );
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
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  router.get("/:groupId", getsReadState, (req, res) => {
    const group = req.readState.getDetailedGroup(req.params.groupId);
    if (!group) {
      return res.status(404).send("Group not found");
    }
    return res.send(group);
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
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  router.get("/:groupId/members", getsReadState, (req, res) => {
    const group = req.readState.getDetailedGroup(req.params.groupId);
    if (!group) {
      return res.status(404).send("Group not found");
    }
    return res.send(group.members);
  });

  router.post("/:groupId/members", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:GROUP:GROUP_MEMBER_ADDED",
      {
        userId: String(req.body.userId),
        groupId: String(req.params.groupId)
      },
      err => {
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  router.delete("/:groupId/members/:memberId", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:GROUP:GROUP_MEMBER_REMOVED",
      {
        userId: String(req.params.userId),
        groupId: String(req.params.groupId)
      },
      err => {
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  router.get(
    "/:groupId/spotifyPlaylist",
    [getsReadState, ensureAuthenticated, ensureMemberOfGroup],
    (req, res) => {
      const group = req.readState.getDetailedGroup(req.params.groupId);
      if (!group.playlistId) {
        return res.status(400).send("Group has no associated Spotify Playlist");
      }
      req.spotifyUserId = group.ownerId;
      return getsUserSpotifyApi(req, res, () => {
        return req.spotifyApi.getPlaylist(group.playlistId, {}, (err, data) => {
          if (err) {
            console.error("Error getting playlist from Spotify:", err);
          }
          return res.send(data.body);
        });
      });
    }
  );

  router.use("/:groupId/config", [
    getsReadState,
    ensureAuthenticated,
    ensureOwnerOfGroup,
    require("./group-config")(eventDriver)
  ]);
  return router;
};
