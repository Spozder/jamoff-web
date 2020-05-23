const { ModelBase } = require("./model-base");

class Round extends ModelBase {
  constructor(
    roundId,
    groupId,
    startTimestamp,
    endTimestamp,
    theme,
    description,
    songList = []
  ) {
    super();
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

  // Display methods
  basicDisplay() {
    return {
      roundId: this.roundId,
      groupId: this.groupId,
      starts: this.startTimestamp,
      ends: this.endTimestamp,
      theme: this.theme,
      description: this.description,
      submissionCount: this.songList.length
    };
  }

  extendedDisplay({ getGroupById, getSongSubmissionById }) {
    return {
      roundId: this.roundId,
      group: getGroupById(this.groupId).basicDisplay(),
      starts: this.startTimestamp,
      ends: this.endTimestamp,
      theme: this.theme,
      description: this.description,
      submissions: this.songList
        .map(getSongSubmissionById)
        .map(ss => ss.basicDisplay())
    };
  }
}

module.exports = { Round };
