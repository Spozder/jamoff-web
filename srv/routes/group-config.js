const express = require("express");
// Merge params with 'groups' routes
const router = express.Router({ mergeParams: true });

module.exports = eventDriver => {
  const {
    handleAppendEventError,
    getsUserSpotifyApi
  } = require("./middleware")(eventDriver);

  router.get("/", (req, res) => {
    res.send(req.readState.getDetailedGroup(req.params.groupId));
  });

  router.get("/availablePlaylists", getsUserSpotifyApi, (req, res) => {
    return req.spotifyApi.getUserPlaylists(undefined, {}, (err, data) => {
      if (err) {
        console.error("Error getting user's playlists", err);
        return res.sendStatus(500);
      }
      if (!data.body && !data.body.items) {
        console.error("Getting playlist list failed");
        return res.sendStatus(500);
      }
      // TODO: Reconsider filtering out non-collaborative playlists?
      return res.send(
        data.body.items.filter(playlist => playlist.collaborative)
      );
    });
  });

  router.post("/spotifyPlaylist", getsUserSpotifyApi, (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:GROUP:GROUP_PLAYLIST_ASSOCIATED",
      {
        groupId: String(req.params.groupId),
        playlistId: String(req.body.playlistId)
      },
      err => {
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  return router;
};
