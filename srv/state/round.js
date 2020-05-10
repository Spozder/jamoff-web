class Round {
  constructor(
    roundId,
    groupId,
    startTimestamp,
    endTimestamp,
    theme,
    description,
    songList = []
  ) {
    if (!roundId || !groupId || !startTimestamp || !endTimestamp) {
      throw "Missing required Round field(s)";
    }
    this.roundId = roundId;
    this.groupId = groupId;
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
    this.theme = theme;
    if (description) {
      this.description = description;
    }
    this.songList = songList;
  }

  addSong(spotifyTrackUri) {
    if (!spotifyTrackUri.startsWith("spotify:track:")) {
      throw "Tried to add something that is not a Spotify Track URI to the round";
    }
    return new Round(
      this.roundId,
      this.groupId,
      this.startTimestamp,
      this.endTimestamp,
      this.theme,
      this.description,
      [...this.songList, spotifyTrackUri]
    );
  }

  updateRound(startTimestamp, endTimestamp, theme, description) {
    return new Round(
      this.roundId,
      this.groupId,
      startTimestamp || this.startTimestamp,
      endTimestamp || this.endTimestamp,
      theme || this.theme,
      description || this.description,
      this.songList
    );
  }
}

module.exports = { Round };
