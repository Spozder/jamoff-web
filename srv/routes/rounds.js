const express = require("express");
const router = express.Router();
const { getSpotifyApiForUser } = require("../spotify");

module.exports = eventDriver => {
  const {
    getsReadState,
    handleAppendEventError,
    ensureAuthenticated
  } = require("./middleware")(eventDriver);

  // Requires previous getsReadState middleware
  // Requires :roundId param
  const ensureMemberOfGroup = (req, res, next) => {
    const state = req.readState;
    if (
      !state.groups[
        state.rounds[req.params.roundId].groupId
      ].memberIds.includes(req.user.userId)
    ) {
      return res.sendStatus(403);
    }
    return next();
  };

  // Requires previous getsReadState middleware
  // Requires :roundId param
  const ensureRoundActive = (req, res, next) => {
    const state = req.readState;
    if (
      state.groups[state.rounds[req.params.roundId].groupId].activeRoundId !==
      req.params.roundId
    ) {
      return res.status(400).send("Round not active");
    }
    return next();
  };

  router.get("/", getsReadState, (req, res) => {
    return res.send(req.readState.rounds);
  });

  router.post("/", getsReadState, (req, res) => {
    const newRoundId = req.readState.getNextRoundId();
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
        return handleAppendEventError(err, res, () => {
          return res.send({ roundId: newRoundId });
        });
      }
    );
  });

  router.get("/:roundId", getsReadState, (req, res) => {
    const round = req.readState.getDetailedRound(req.params.roundId);
    if (!round) {
      return res.status(404).send("Round not found");
    }
    return res.send(round);
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
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
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
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
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
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  router.get("/:roundId/songs", getsReadState, (req, res) => {
    const state = req.readState;
    if (!(req.params.roundId in state.rounds)) {
      return res.status(404).send("Round not found");
    }
    return res.send(
      state.rounds[req.params.roundId].songList.map(submissionId =>
        state.getDetailedSongSubmission(submissionId)
      )
    );
  });

  // Route requires authentication AND that user is member of group AND that round is active
  // TODO Restrict to one submission per round - include overwrite flag?
  // This might not be useful? Songs HAVE to be synced from spotify
  router.post(
    "/:roundId/songs",
    [
      getsReadState,
      ensureRoundActive,
      ensureAuthenticated,
      ensureMemberOfGroup
    ],
    (req, res) => {
      if (!req.body.submissionType) {
        return res
          .status(400)
          .send('Missing submissionType (One of "spotify", idk');
      }
      if (req.body.submissionType === "spotify") {
        const newSubmissionId = req.readState.getNextSongSubmissionId();
        return eventDriver.appendEventData(
          "EVENT:SONG_SUBMISSION:SPOTIFY_SONG_SUBMITTED",
          {
            songSubmissionId: newSubmissionId,
            submittedByUserId: req.user.userId || req.body.submittedByUserId,
            roundId: req.params.roundId,
            spotifyURI: req.body.spotifyURI,
            songMetaData: req.body.songMetaData
          },
          err => {
            return handleAppendEventError(err, res, () => {
              return res.sendStatus(200);
            });
          }
        );
      } else {
        return res
          .status(400)
          .send("Unknown submission type: ", req.body.submissionType);
      }
    }
  );

  router.get(
    "/:roundId/spotify/sync",
    [getsReadState, ensureAuthenticated, ensureMemberOfGroup],
    (req, res) => {
      // TODO: Is round spotify-backed?
      const round = req.readState.rounds[req.params.roundId];
      const group = req.readState.groups[round.groupId];
      const ownerSpotifyIdentity = req.readState.getFullSpotifyIdentity(
        group.ownerId
      );
      if (!ownerSpotifyIdentity) {
        return res.status(400).send("Group owner doesn't have spotify setup");
      } else {
        return getSpotifyApiForUser(
          group.ownerId,
          ownerSpotifyIdentity.refreshToken,
          (err, newRefreshToken, spotifyApi) => {
            if (err) {
              console.error("Spotify api error: ", err);
              return res.sendStatus(500);
            }
            const continuation = () => {
              return spotifyApi.getPlaylist(
                group.playlistId,
                {},
                (err, data) => {
                  if (err) {
                    console.error("Spotify api error: ", err);
                    return res.sendStatus(500);
                  }
                  return res.send(data.body);
                }
              );
            };
            if (newRefreshToken) {
              return eventDriver.appendEventData(
                "EVENT:SPOTIFY:SPOTIFY_REFRESH_TOKEN_UPDATED",
                {
                  identityId: ownerSpotifyIdentity.identityId,
                  newRefreshToken: newRefreshToken
                },
                err => {
                  return handleAppendEventError(err, res, continuation);
                }
              );
            } else {
              return continuation();
            }
          }
        );
      }
    }
  );

  return router;
};
