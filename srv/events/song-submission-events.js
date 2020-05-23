const Event = require("./event");
const { SpotifySubmission } = require("../state");

class SongSubmissionEvent extends Event {
  static TYPE = super.TYPE + ":SONG_SUBMISSION";
}

class SpotifySongSubmitted extends SongSubmissionEvent {
  static TYPE = super.TYPE + ":SPOTIFY_SONG_SUBMITTED";

  apply(state) {
    if (
      !this.data.songSubmissionId ||
      !this.data.submittedByUserId ||
      !this.data.roundId ||
      !this.data.spotifyURI
    ) {
      throw "Missing required Spotify Song Submission Data";
    } else if (this.data.songSubmissionId in state.songSubmissions) {
      throw "Non-unique song submission id";
    } else if (!(this.data.submittedByUserId in state.profiles)) {
      throw "Invalid song submission submittedByUserId";
    }
    return {
      ...state,
      rounds: {
        ...state.rounds,
        [this.data.roundId]: state.rounds[this.data.roundId].addSong(
          this.data.songSubmissionId
        )
      },
      songSubmissions: {
        ...state.songSubmissions,
        [this.data.songSubmissionId]: new SpotifySubmission(
          this.data.songSubmissionId,
          this.data.submittedByUserId,
          this.timestamp,
          this.data.roundId,
          this.data.spotifyURI,
          this.data.songMetaData
        )
      }
    };
  }
}

class SpotifySongReplacementSubmitted extends SongSubmissionEvent {
  static TYPE = super.TYPE + ":SPOTIFY_SONG_REPLACEMENT_SUBMITTED";

  apply(state) {
    if (
      !this.data.songSubmissionId ||
      !this.data.submittedByUserId ||
      !this.data.roundId ||
      !this.data.spotifyURI
    ) {
      throw "Missing required Spotify Song Replacement Submission Data";
    } else if (this.data.songSubmissionId in state.songSubmissions) {
      throw "Non-unique song submission id";
    } else if (!(this.data.submittedByUserId in state.profiles)) {
      throw "Invalid submittedByUserId";
    }
    const previousSubmission = state.rounds[this.data.roundId].songList
      .map(submissionId => state.songSubmissions[submissionId])
      .find(
        submission =>
          submission.submittedByUserId === this.data.submittedByUserId
      );
    if (!previousSubmission) {
      throw "User hadn't submitted a song for this round yet";
    }
    const newState = {
      ...state,
      rounds: {
        ...state.rounds,
        [this.data.roundId]: state.rounds[this.data.roundId]
          .removeSong(previousSubmission.submissionId)
          .addSong(this.data.submissionId)
      }
    };
    // What do? Mutation???
    // TODO
    delete newState.songSubmissions[this.data.submissionId];
    return newState;
  }
}

const eventTypes = {
  SpotifySongSubmitted
};

const registerSongSubmissionEvents = eventRegistry => {
  return eventRegistry.registerEventTypes(Object.values(eventTypes));
};

module.exports = {
  ...eventTypes,
  registerSongSubmissionEvents
};
