class SongSubmission {
  constructor(
    songSubmissionId,
    submittedByUserId,
    submissionTimestamp,
    roundId
  ) {
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
}

module.exports = { SongSubmission, SpotifySubmission };
