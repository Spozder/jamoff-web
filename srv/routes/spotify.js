const express = require("express");
const router = express.Router();
const {
  backendSpotify,
  spotifyApiFactory,
  setSpotifyApiForUser
} = require("../spotify");

module.exports = eventDriver => {
  const {
    getsReadState,
    ensureAuthenticated,
    handleAppendEventError,
    getsUserSpotifyApi
  } = require("./middleware")(eventDriver);

  router.get("/test", getsReadState, getsUserSpotifyApi, (req, res) => {
    return req.spotifyApi.getMe((err, data) => {
      if (err) {
        console.error("Getting Spotify ME failed:", err);
        return res.sendStatus(500);
      }
      return res.send(data.body);
    });
  });

  const states = {};
  const scopes = ["user-read-private", "user-read-email"];

  router.get("/setup", ensureAuthenticated, (req, res) => {
    states[req.user.userId] = "teststate";
    const spotifyApi = spotifyApiFactory();
    return res.redirect(
      spotifyApi.createAuthorizeURL(scopes, states[req.user.userId])
    );
  });

  router.get("/callback", ensureAuthenticated, getsReadState, (req, res) => {
    if (req.query.error) {
      console.error("Spotify request error: ", req.query.error);
      return res.redirect("/?failure=true");
    }
    if (states[req.user.userId] !== req.query.state) {
      return res.sendStatus(403);
    }
    const authenticationCode = req.query.code;
    const spotifyApi = spotifyApiFactory();
    return spotifyApi.authorizationCodeGrant(
      authenticationCode,
      (err, spotifyResponse) => {
        if (err) {
          console.log("Spotify error");
          return res.sendStatus(500);
        }
        spotifyApi.setAccessToken(spotifyResponse.body["access_token"]);
        spotifyApi.setRefreshToken(spotifyResponse.body["refresh_token"]);
        spotifyApi.getMe((err, meResponse) => {
          if (err) {
            console.log("Couldn't get new spotify user", err);
            return res.sendStatus(500);
          }
          return eventDriver.appendEventData(
            "EVENT:SPOTIFY:SPOTIFY_FULL_IDENTITY_ADDED",
            {
              identityId: req.readState.getNextIdentityId(),
              userId: req.user.userId,
              spotifyUserId: meResponse.body["id"],
              refreshToken: spotifyResponse.body["refresh_token"]
            },
            err => {
              return handleAppendEventError(err, res, () => {
                setSpotifyApiForUser(
                  req.user.userId,
                  spotifyApi,
                  new Date(
                    Date.UTC() + 1000 * spotifyResponse.body["expires_in"]
                  )
                );
                return res.sendStatus(200);
              });
            }
          );
        });
      }
    );
  });

  return router;
};
