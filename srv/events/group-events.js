const Event = require("./event");
const { Group } = require("../state");
const {
  EventValidationError,
  ProfileNotFoundError,
  GroupNotFoundError
} = require("../errors");

class GroupEvent extends Event {
  static TYPE = super.TYPE + ":GROUP";
}

class GroupCreated extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_CREATED";

  apply(state) {
    if (!this.data.id) {
      throw new EventValidationError("No GroupId provided");
    } else if (this.data.id in state.groups) {
      throw new EventValidationError("Duplicated group id");
    } else if (!(this.data.ownerId in state.profiles)) {
      throw new ProfileNotFoundError("Invalid Group ownerId");
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
      throw new EventValidationError("No ID Given");
    } else if (!(this.data.id in state.groups)) {
      throw new GroupNotFoundError("Group not found");
    } else if (this.data.ownerId && !(this.data.ownerId in state.profiles)) {
      throw new ProfileNotFoundError("Invalid New Group Owner ID");
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
      throw new ProfileNotFoundError("Invalid User Id");
    } else if (!(this.data.groupId in state.groups)) {
      throw new GroupNotFoundError("Invalid Group Id");
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
      throw new ProfileNotFoundError("Invalid User Id");
    } else if (!(this.data.groupId in state.groups)) {
      throw new GroupNotFoundError("Invalid Group Id");
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

class GroupPlaylistAssociated extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_PLAYLIST_ASSOCIATED";

  apply(state) {
    if (!(this.data.groupId in state.groups)) {
      throw new GroupNotFoundError("Group not found");
    } else if (!this.data.playlistId) {
      throw new EventValidationError("Playlist ID not included");
    }
    return {
      ...state,
      groups: {
        ...state.groups,
        [this.data.groupId]: state.groups[this.data.groupId].setPlaylist(
          this.data.playlistId
        )
      }
    };
  }
}

class GroupPlaylistDisassociated extends GroupEvent {
  static TYPE = super.TYPE + ":GROUP_PLAYLIST_DISASSOCIATED";

  apply(state) {
    if (!(this.data.groupId in state.groups)) {
      throw new GroupNotFoundError("Group not found");
    }
    return {
      ...state,
      groups: {
        ...state.groups,
        [this.data.groupId]: state.groups[this.data.groupId].removePlaylist()
      }
    };
  }
}

const eventTypes = {
  GroupCreated,
  GroupUpdated,
  GroupMemberAdded,
  GroupMemberRemoved,
  GroupPlaylistAssociated,
  GroupPlaylistDisassociated
};

const registerGroupEvents = eventRegistry => {
  return eventRegistry.registerEventTypes(Object.values(eventTypes));
};

module.exports = {
  ...eventTypes,
  registerGroupEvents
};
