class Group {
  constructor(
    groupId,
    name,
    ownerId,
    description,
    memberIds = [ownerId],
    roundIds = [],
    activeRoundId
  ) {
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
  }

  updateGroup(name, ownerId, description) {
    return new Group(
      this.groupId,
      name || this.name,
      ownerId || this.ownerId,
      description || this.description,
      this.memberIds,
      this.roundIds,
      this.activeRoundId
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
      this.activeRoundId
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
      this.activeRoundId
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
      this.activeRoundId
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
      this.activeRoundId
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
      roundId
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
      undefined
    );
  }
}

module.exports = { Group };
