const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    return res.sendStatus(403);
  };

  // Requires :roundId param
  const ensureMemberOfGroup = (req, res, next) => {
    return eventDriver.getState((err, state) => {
      if (err) {
        console.log("UHHHH", err);
        return res.sendStatus(500);
      } else if (
        !state.groups[
          state.rounds[req.params.roundId].groupId
        ].memberIds.includes(req.user.userId)
      ) {
        return res.sendStatus(403);
      }
      return next();
    });
  };

  // Requires :roundId param
  const ensureRoundActive = (req, res, next) => {
    return eventDriver.getState((err, state) => {
      if (err) {
        console.log("Oh boy", err);
        return res.sendStatus(500);
      } else if (
        state.groups[state.rounds[req.params.roundId].groupId].activeRoundId !==
        req.params.roundId
      ) {
        return res.status(400).send("Round not active");
      }
      return next();
    });
  };

  const getNextRoundId = callback => {
    return eventDriver.getState((err, state) => {
      return callback(
        err,
        String(Math.max(...Object.keys(state.rounds), 0) + 1)
      );
    });
  };

  const getNextSongSubmissionId = callback => {
    return eventDriver.getState((err, state) => {
      return callback(
        err,
        String(Math.max(...Object.keys(state.songSubmissions), 0) + 1)
      );
    });
  };

  router.get("/", (req, res) => {
    return eventDriver.getState((err, state) => res.send(state.rounds));
  });

  router.post("/", (req, res) => {
    return getNextRoundId((err, newRoundId) => {
      return eventDriver.appendEventData(
        "EVENT:ROUND:ROUND_CREATED",
        {
          roundId: newRoundId,
          groupId: req.body.groupId,
          startTimestamp: req.body.startTimestamp,
          endTimestamp: req.body.endTimestamp,
          theme: req.body.theme,
          ...(req.body.description && { description: req.body.description })
        },
        err => {
          if (err) {
            console.log("CREATE ROUND ERROR: ", err);
            res.status(400).send("Invalid CREATE_ROUND body");
          } else {
            res.send({ roundId: newRoundId });
          }
        }
      );
    });
  });

  router.get("/:roundId", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (!(req.params.roundId in state.rounds)) {
        res.status(404).send("Round not found");
      }
      return res.send(state.rounds[req.params.roundId]);
    });
  });

  router.put("/:roundId", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:ROUND:ROUND_UPDATED",
      {
        roundId: req.params.roundId,
        ...(req.body.startTimestamp && {
          startTimestamp: req.body.startTimestamp
        }),
        ...(req.body.endTimestamp && { endTimestamp: req.body.endTimestamp }),
        ...(req.body.theme && { theme: req.body.theme }),
        ...(req.body.description && { description: req.body.description })
      },
      err => {
        if (err) {
          console.log("UPDATE ROUND ERROR: ", err);
          res.status(400).send("Invalid ROUND_UPDATED body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.post("/:roundId/activate", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:ROUND:ROUND_ACTIVATED",
      {
        roundId: req.params.roundId
      },
      err => {
        if (err) {
          console.log("ROUND ACTIVATE ERROR: ", err);
          res.status(400).send("Invalid ROUND_ACTIVATE body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.post("/:roundId/deactivate", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:ROUND:ROUND_DEACTIVATED",
      {
        roundId: req.params.roundId
      },
      err => {
        if (err) {
          console.log("ROUND DEACTIVATE ERROR: ", err);
          res.status(400).send("Invalid ROUND_DEACTIVATE body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.get("/:roundId/songs", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (err) {
        console.log("GET ROUND SONGS ERROR: ", err);
        return res.sendStatus(500);
      }
      if (!(req.params.roundId in state.rounds)) {
        return res.status(404).send("Round not found");
      }
      return res.send(
        state.rounds[req.params.roundId].songList.map(
          submissionId => state.songSubmissions[submissionId]
        )
      );
    });
  });

  // Route requires authentication AND that user is member of group AND that round is active
  // TODO Restrict to one submission per round - include overwrite flag?
  router.post(
    "/:roundId/songs",
    [ensureRoundActive, ensureAuthenticated, ensureMemberOfGroup],
    (req, res) => {
      if (!req.body.submissionType) {
        return res
          .status(400)
          .send('Missing submissionType (One of "spotify", idk');
      }
      if (req.body.submissionType === "spotify") {
        return getNextSongSubmissionId((err, songSubmissionId) => {
          return eventDriver.appendEventData(
            "EVENT:SONG_SUBMISSION:SPOTIFY_SONG_SUBMITTED",
            {
              songSubmissionId: songSubmissionId,
              submittedByUserId: req.user.userId || req.body.submittedByUserId,
              roundId: req.params.roundId,
              spotifyURI: req.body.spotifyURI,
              songMetaData: req.body.songMetaData
            },
            err => {
              if (err) {
                console.log("Song submission error:", err);
                return res
                  .status(400)
                  .send("Invalid SPOTIFY_SONG_SUBMITTED body");
              } else {
                return res.sendStatus(200);
              }
            }
          );
        });
      } else {
        return res
          .status(400)
          .send("Unknown submission type: ", req.body.submissionType);
      }
    }
  );

  return router;
};
