// Data Definition for STATE
// Regular JS Object - Initialized with State.INIT

/**
 * Data Definition:
 * A State is a regular JS object:
 * {
 * profiles: { userId: Profile, ... },
 * identities: { identityId: Identity, ... },
 * groups: { groupId: Group, ... }
 * }
 *
 * A Profile contains:
 * userId: String (Number),
 * identities: [List-Of IdentityIds] - ref Identity.identityId,
 * createdOn: timestamp,
 * fullName: String : Optional,
 * ownerOfGroups: [List-Of GroupIds] - ref Group.groupId,
 * memberOfGroups: [List-Of GroupIds] - ref Group.groupId
 *
 * An Identity contains:
 * identityId: String (Number),
 * userId: String (Number) - ref Profile.userId,
 * email: String,
 * passHash: String TODO?,
 * createdOn: timestamp
 *
 * A Group contains:
 * groupId: String (Number),
 * name: String
 * ownerId: String (Number) - Ref Profile.userId,
 * description: String : Optional,
 * memberIds: [List-Of userIds] - ref Profile.userId
 */

class State {
  static INIT = {
    identities: {},
    profiles: {},
    groups: {}
  };
}

class Profile {
  constructor(
    userId,
    identities = [],
    createdOn,
    fullName,
    ownerOfGroups = [],
    memberOfGroups = []
  ) {
    if (!userId) {
      throw "Profile Requires a UserId";
    }
    this.userId = userId;
    if (identities.length === 0) {
      throw "PROFILE MUST HAVE >= 1 IDENTITY";
    }
    this.identities = identities;
    this.createdOn = createdOn;
    if (fullName) {
      this.fullName = fullName;
    }
    this.ownerOfGroups = ownerOfGroups;
    this.memberOfGroups = memberOfGroups;
  }

  updateProfile(identities, fullName) {
    return new Profile(
      this.userId,
      identities || this.identities,
      this.createdOn,
      fullName || this.fullName
    );
  }

  // NOTE: Adds group membership as well
  addGroupOwnership(groupId) {
    if (!groupId) {
      throw "Group ID cannot be empty";
    }
    if (this.ownerOfGroups.includes(groupId)) {
      throw "Already owner of group";
    }
    return new Profile(
      this.userId,
      this.identities,
      this.createdOn,
      this.fullName,
      [...this.ownerOfGroups, groupId],
      [...this.memberOfGroups, groupId]
    );
  }

  // NOTE: Removes group membership as well
  removeGroupOwnership(groupId) {
    if (!groupId) {
      throw "Group ID cannot be empty";
    }
    if (!this.ownerOfGroups.includes(groupId)) {
      throw "Cannot remove group ownership of non-owned group";
    }
    return new Profile(
      this.userId,
      this.identities,
      this.createdOn,
      this.fullName,
      this.ownerOfGroups.filter(ownerOfId => ownerOfId !== groupId),
      this.memberOfGroups.filter(memberOfId => memberOfId !== groupId)
    );
  }

  addGroupMembership(groupId) {
    if (!groupId) {
      throw "Group ID cannot be empty";
    }
    if (this.memberOfGroups.includes(groupId)) {
      throw "Already a member of group";
    }
    return new Profile(
      this.userId,
      this.identities,
      this.createdOn,
      this.fullName,
      this.ownerOfGroups,
      [...this.memberOfGroups, groupId]
    );
  }

  removeGroupMembership(groupId) {
    if (!groupId) {
      throw "Group ID cannot be empty";
    }
    if (!this.memberOfGroups.includes(groupId)) {
      throw "Cannot remove group membership of group no a member of";
    }
    return new Profile(
      this.userId,
      this.identities,
      this.createdOn,
      this.fullName,
      this.ownerOfGroups,
      this.memberOfGroups.filter(memberOfId => memberOfId !== groupId)
    );
  }
}

class Identity {
  constructor(identityId, userId, email, passHash, createdOn) {
    if (!identityId || !userId || !email || !passHash || !createdOn) {
      throw "All Identity fields are required";
    }
    this.identityId = identityId;
    this.userId = userId;
    this.email = email;
    this.passHash = passHash;
    this.createdOn = createdOn;
  }

  updateIdentity(email, passHash) {
    return new Identity(
      this.identityId,
      this.userId,
      email || this.email,
      passHash || this.passHash,
      this.createdOn
    );
  }
}

class Group {
  constructor(groupId, name, ownerId, description, memberIds = [ownerId]) {
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
  }

  updateGroup(name, ownerId, description) {
    return new Group(
      this.groupId,
      name || this.name,
      ownerId || this.ownerId,
      description || this.description,
      this.memberIds
    );
  }

  addMember(userId) {
    if (!userId) {
      throw "Cannot add missing userId to group";
    }
    if (this.memberIds.includes(userId)) {
      throw "Already a member of group";
    }
    return new Group(this.groupId, this.name, this.ownerId, this.description, [
      ...this.memberIds,
      userId
    ]);
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
      this.memberIds.filter(memberId => memberId !== userId)
    );
  }
}

module.exports = { State, Profile, Identity, Group };
