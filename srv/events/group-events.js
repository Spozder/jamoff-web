const Event = require("./event");
const { Group } = require("../state");

class GroupEvent extends Event {
  static TYPE = super.TYPE + ":GROUP";
}

class GroupCreated extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_CREATED";

  apply(state) {
    if (!this.data.id) {
      throw "No GroupId provided";
    } else if (this.data.id in state.groups) {
      throw "Duplicated group id";
    } else if (!(this.data.ownerId in state.profiles)) {
      throw "Invalid Group ownerId";
    }
    return {
      ...state,
      groups: {
        ...state.groups,
        [this.data.id]: new Group(
          this.data.id,
          this.data.name,
          this.data.ownerId,
          this.data.description
        )
      },
      profiles: {
        ...state.profiles,
        [this.data.ownerId]: state.profiles[
          this.data.ownerId
        ].addGroupOwnership(this.data.id)
      }
    };
  }
}

class GroupUpdated extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_UPDATED";

  apply(state) {
    if (!this.data.id) {
      throw "No ID Given";
    } else if (!(this.data.id in state.groups)) {
      throw "Group not found";
    } else if (this.data.ownerId && !(this.data.ownerId in state.profiles)) {
      throw "Invalid New Group Owner ID";
    }
    const updatedGroup = state.groups[this.data.id].updateGroup(
      this.data.name,
      this.data.ownerId,
      this.data.description
    );
    if (this.data.ownerId) {
      // Gotta do more stuff when changing the owner of a group
      const oldOwnerId = state.groups[this.data.id].ownerId;
      const oldOwnerUpdatedProfile = state.profiles[
        oldOwnerId
      ].removeGroupOwnership(this.data.id);
      const newOwnerUpdatedProfile = state.profiles[
        this.data.ownerId
      ].addGroupOwnership(this.data.id);
      return {
        ...state,
        groups: {
          ...state.groups,
          [this.data.id]: updatedGroup
        },
        profiles: {
          ...state.profiles,
          [this.data.ownerId]: newOwnerUpdatedProfile,
          [oldOwnerId]: oldOwnerUpdatedProfile
        }
      };
    }
    return {
      ...state,
      groups: {
        ...state.groups,
        [this.data.id]: updatedGroup
      }
    };
  }
}

class GroupMemberAdded extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_MEMBER_ADDED";

  apply(state) {
    if (!(this.data.userId in state.profiles)) {
      throw "Invalid User Id";
    } else if (!(this.data.groupId in state.groups)) {
      throw "Invalid Group Id";
    }
    return {
      ...state,
      profiles: {
        ...state.profiles,
        [this.data.userId]: state.profiles[this.data.userId].addGroupMembership(
          this.data.groupId
        )
      },
      groups: {
        ...state.groups,
        [this.data.groupId]: state.groups[this.data.groupId].addMember(
          this.data.userId
        )
      }
    };
  }
}

class GroupMemberRemoved extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_MEMBER_REMOVED";

  apply(state) {
    if (!(this.data.userId in state.profiles)) {
      throw "Invalid User Id";
    } else if (!(this.data.groupId in state.groups)) {
      throw "Invalid Group Id";
    }
    return {
      ...state,
      profiles: {
        ...state.profiles,
        [this.data.userId]: state.profiles[
          this.data.userId
        ].removeGroupMembership(this.data.groupId)
      },
      groups: {
        ...state.groups,
        [this.data.groupId]: state.groups[this.data.groupId].removeMember(
          this.data.userId
        )
      }
    };
  }
}

const registerGroupEvents = eventRegistry => {
  return eventRegistry.registerEventTypes([
    GroupCreated,
    GroupUpdated,
    GroupMemberAdded,
    GroupMemberRemoved
  ]);
};

module.exports = {
  registerGroupEvents,
  GroupCreated,
  GroupUpdated,
  GroupMemberAdded,
  GroupMemberRemoved
};
