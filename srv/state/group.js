const { ModelBase } = require("./model-base");

class Group extends ModelBase {
  constructor(
    groupId,
    name,
    ownerId,
    description,
    memberIds = [ownerId],
    roundIds = [],
    activeRoundId,
    playlistId
  ) {
    super();
    if (!groupId || !name || !ownerId) {
      throw "Missing required Group field";
    }
    this.groupId = groupId;
    this.name = name;
    this.ownerId = ownerId;
    if (description) {
      this.description = description;
    }
    this.memberIds = memberIds;
    this.roundIds = roundIds;
    if (activeRoundId) {
      this.activeRoundId = activeRoundId;
    }
    this.playlistId = playlistId;
  }

  updateGroup(name, ownerId, description) {
    return new Group(
      this.groupId,
      name || this.name,
      ownerId || this.ownerId,
      description || this.description,
      this.memberIds,
      this.roundIds,
      this.activeRoundId,
      this.playlistId
    );
  }

  addMember(userId) {
    if (!userId) {
      throw "Cannot add missing userId to group";
    }
    if (this.memberIds.includes(userId)) {
      throw "Already a member of group";
    }
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      [...this.memberIds, userId],
      this.roundIds,
      this.activeRoundId,
      this.playlistId
    );
  }

  removeMember(userId) {
    if (!userId) {
      throw "Cannot remove missing userId from group";
    }
    if (!this.memberIds.includes(userId)) {
      throw "Cannot remove userid that is not a member of group";
    }
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds.filter(memberId => memberId !== userId),
      this.roundIds,
      this.activeRoundId,
      this.playlistId
    );
  }

  addRound(roundId) {
    if (!roundId) {
      throw "Cannot add missing roundId to group";
    } else if (this.roundIds.includes(roundId)) {
      throw "Duplicated round added to group";
    }
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds,
      [...this.roundIds, roundId],
      this.activeRoundId,
      this.playlistId
    );
  }

  removeRound(roundId) {
    if (!roundId) {
      throw "Cannot remove missing roundId to group";
    } else if (!this.roundIds.includes(roundId)) {
      throw "Round not in group";
    }
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds,
      this.roundIds.filter(groupRoundId => groupRoundId !== roundId),
      this.activeRoundId,
      this.playlistId
    );
  }

  activateRound(roundId) {
    if (!roundId) {
      throw "Cannot activate missing roundId";
    } else if (!this.roundIds.includes(roundId)) {
      throw "Round not in group";
    }
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds,
      this.roundIds,
      roundId,
      this.playlistId
    );
  }

  deactivateRound(roundId) {
    if (this.activeRoundId !== roundId) {
      throw "Trying to deactivate wrong round";
    }
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds,
      this.roundIds,
      undefined,
      this.playlistId
    );
  }

  setPlaylist(playlistId) {
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds,
      this.roundIds,
      this.activeRoundId,
      playlistId
    );
  }

  removePlaylist() {
    return new Group(
      this.groupId,
      this.name,
      this.ownerId,
      this.description,
      this.memberIds,
      this.roundIds,
      this.activeRoundId,
      null
    );
  }

  // Display methods
  basicDisplay() {
    return {
      groupId: this.groupId,
      name: this.name,
      description: this.description,
      memberCount: this.memberIds.length,
      roundCount: this.roundIds.length
    };
  }

  extendedDisplay({ getProfileById, getRoundById }) {
    return {
      groupId: this.groupId,
      name: this.name,
      description: this.description,
      owner: getProfileById(this.ownerId).basicDisplay(),
      members: this.memberIds
        .map(getProfileById)
        .map(profile => profile.basicDisplay()),
      rounds: this.roundIds
        .map(getRoundById)
        .map(round => round.basicDisplay()),
      activeRound: getRoundById(this.activeRoundId),
      playlistId: this.playlistId
    };
  }
}

module.exports = { Group };
