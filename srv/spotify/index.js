const SpotifyWebApi = require("spotify-web-api-node");

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const backendSpotify = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

backendSpotify.clientCredentialsGrant({}, (err, resp) => {
  console.log("Setting spotify backend credentials");
  backendSpotify.setAccessToken(resp.body["access_token"]);
  console.log("Backend credentials set!");
});

const spotifyApiFactory = () => {
  return new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: "http://localhost:3000/api/spotify/callback"
  });
};

// Store spotify API connections in-memory: maybe change???
// Consider creating custom SpotifyApi class that keeps track of
// this stuff??? idk man
const spotifyApiMapping = {};

const defaultTimestamp = new Date(Date.UTC(1900, 0));

// callback looks like:
// (err, newRefreshToken | false, SpotifyWebApi) => ?
const getSpotifyApiForUser = (userId, refreshToken, callback) => {
  let spotifyApi;
  if (userId in spotifyApiMapping) {
    spotifyApi = spotifyApiMapping[userId].api;
  } else {
    spotifyApi = spotifyApiFactory();
    spotifyApi.setRefreshToken(refreshToken);
    spotifyApiMapping[userId] = {};
    spotifyApiMapping[userId].api = spotifyApi;
    spotifyApiMapping[userId].expireTimstamp = defaultTimestamp;
  }
  if (new Date() > spotifyApiMapping[userId].expireTimstamp) {
    return spotifyApi.refreshAccessToken((err, data) => {
      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApiMapping[userId].expireTimstamp = new Date(
        Date.now() + data.body["expires_in"] * 1000
      );
      return callback(err, data.body["refresh_token"], spotifyApi);
    });
  } else {
    return callback(null, false, spotifyApi);
  }
};

const setSpotifyApiForUser = (userId, spotifyApi, expireTimstamp) => {
  spotifyApiMapping[userId] = {
    api: spotifyApi,
    expireTimstamp: expireTimstamp
  };
};

module.exports = {
  backendSpotify,
  getSpotifyApiForUser,
  spotifyApiFactory,
  setSpotifyApiForUser
};
