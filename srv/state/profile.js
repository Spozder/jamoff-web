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

  // Display methods
  toBasicDisplayProfile() {
    return {
      fullName: this.fullName,
      ownerOfCount: this.ownerOfGroups.length,
      memberSince: this.createdOn
    };
  }
}

module.exports = { Profile };
