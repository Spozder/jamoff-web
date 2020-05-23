const { ModelBase } = require("./model-base");

class SongSubmission extends ModelBase {
  constructor(
    songSubmissionId,
    submittedByUserId,
    submissionTimestamp,
    roundId
  ) {
    super();
    this.songSubmissionId = songSubmissionId;
    this.submittedByUserId = submittedByUserId;
    this.submissionTimestamp = submissionTimestamp;
    this.roundId = roundId;
  }
}

class SpotifySubmission extends SongSubmission {
  constructor(
    songSubmissionId,
    submittedByUserId,
    submissionTimestamp,
    roundId,
    spotifyURI,
    songMetaData
  ) {
    super(songSubmissionId, submittedByUserId, submissionTimestamp, roundId);
    if (!spotifyURI.startsWith("spotify:track:")) {
      throw "Tried to create a SpotifySubmission with an invalid spotifyURI";
    }
    this.spotifyURI = spotifyURI;
    this.songMetaData = songMetaData;
  }

  basicDisplay() {
    return {
      songSubmissionId: this.songSubmissionId,
      submissionTimestamp: this.submissionTimestamp,
      type: "spotify",
      spotifyURI: this.spotifyURI,
      songMetaData: this.songMetaData
    };
  }

  extendedDisplay({ getProfileById, getRoundById }) {
    return {
      songSubmissionId: this.songSubmissionId,
      submittedBy: getProfileById(this.submittedByUserId).basicDisplay(),
      submissionTimestamp: this.submissionTimestamp,
      round: getRoundById(this.roundId).basicDisplay(),
      type: "spotify",
      spotifyURI: this.spotifyURI,
      songMetaData: this.songMetaData
    };
  }
}

module.exports = { SongSubmission, SpotifySubmission };
