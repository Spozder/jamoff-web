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

  addSong(submissionId) {
    return new Round(
      this.roundId,
      this.groupId,
      this.startTimestamp,
      this.endTimestamp,
      this.theme,
      this.description,
      [...this.songList, submissionId]
    );
  }

  removeSong(submissionId) {
    return new Round(
      this.roundId,
      this.groupId,
      this.startTimestamp,
      this.endTimestamp,
      this.theme,
      this.description,
      this.songList.filter(id => id !== submissionId)
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

  // Getters
  getSubmittedUserIds(state) {
    return this.songList.map(
      submissionId => state.songSubmissions[submissionId].submittedByUserId
    );
  }

  // Display methods
  toBasicDisplayRound() {
    return {
      started: this.startTimestamp,
      ends: this.endTimestamp,
      theme: this.theme,
      description: this.description,
      submissionCound: this.songList.length
    };
  }
}

module.exports = { Round };
