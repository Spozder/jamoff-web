const { EventValidationError } = require("../errors");
const { getSpotifyApiForUser } = require("../spotify");

module.exports = eventDriver => {
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    return res.sendStatus(403);
  };

  const getsReadState = (req, res, next) => {
    return eventDriver.getReadState((err, readState) => {
      if (err) {
        console.error("Internal error: ", err);
        return res.sendStatus(500);
      } else if (!readState) {
        console.error("Could not get ReadState: ", err);
        return res.sendStatus(500);
      }
      req.readState = readState;
      return next();
    });
  };

  // TODO: getsReadStateAndLocks
  // For use with appendEvent

  const handleAppendEventError = (err, res, callback) => {
    if (err) {
      if (err instanceof EventValidationError) {
        return res.status(err.STATUS).send(err.message);
      } else {
        console.error("Backend error: ", err);
        return res.sendStatus(500);
      }
    }
    return callback();
  };

  // Requires previous getsReadState middleware
  // Requires authentication
  // Requires :roundId param OR :groupId param
  const ensureMemberOfGroup = (req, res, next) => {
    const state = req.readState;
    if (!req.params.groupId && !state.rounds[req.params.roundId]) {
      return res.sendStatus(404);
    }
    const groupId =
      req.params.groupId || state.rounds[req.params.roundId].groupId;
    if (!state.groups[groupId].memberIds.includes(req.user.userId)) {
      return res.sendStatus(403);
    }
    return next();
  };

  // Requires previous getsReadState middleware
  // Requires authentication
  // Requires :roundId param OR :groupId param
  const ensureOwnerOfGroup = (req, res, next) => {
    const state = req.readState;
    if (!req.params.groupId && !req.params.roundId) {
      return res.sendStatus(400);
    }
    if (
      !state.groups[req.params.groupId] &&
      !state.rounds[req.params.roundId]
    ) {
      return res.sendStatus(404);
    }
    const groupId =
      req.params.groupId || state.rounds[req.params.roundId].groupId;
    if (!state.groups[groupId].ownerId === req.user.userId) {
      return res.sendStatus(403);
    }
    return next();
  };

  // Requires previous getsReadState middleware
  // Requires authentication or req.spotifyUserId to be set
  const getsUserSpotifyApi = (req, res, next) => {
    const spotifyUserId = req.spotifyUserId || (req.user && req.user.userId);
    if (!spotifyUserId) {
      return res.sendStatus(401);
    }
    const spotifyIdentity = req.readState.getFullSpotifyIdentity(spotifyUserId);
    if (!spotifyIdentity) {
      return res.status(400).send("No spotify integration for user");
    }
    return getSpotifyApiForUser(
      spotifyUserId,
      spotifyIdentity.refreshToken,
      (err, newRefreshToken, spotifyApi) => {
        if (err) {
          console.error("GetSpotifyApiForUser error: ", err);
          return res.sendStatus(500);
        }
        const continuation = () => {
          req.spotifyApi = spotifyApi;
          next();
        };
        if (newRefreshToken) {
          console.log("Updating spotify refresh token");
          return eventDriver.appendEventData(
            "EVENT:SPOTIFY:SPOTIFY_REFRESH_TOKEN_UPDATED",
            {
              identityId: spotifyIdentity.identityId,
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
  };

  return {
    getsReadState,
    handleAppendEventError,
    ensureAuthenticated,
    ensureMemberOfGroup,
    ensureOwnerOfGroup,
    getsUserSpotifyApi
  };
};
