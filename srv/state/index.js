const { Profile } = require("./profile");
const { Identity } = require("./identity");
const { Group } = require("./group");
const { Round } = require("./round");

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
 * memberIds: [List-Of userIds] - ref Profile.userId,
 * roundIds: [List-Of roundId] - ref Round.roundId,
 * activeRoundId: roundId - ref Round.roundId
 *
 * A Round contains:
 * roundId: String (Number),
 * groupdId: String (Number) - ref Group.groupId,
 * startTimestamp: timestamp,
 * endTimestamp: timestamp,
 * theme: String,
 * description: String (optional),
 * songList: [List-Of Spotify-Track-URIs]
 */

class State {
  static INIT = {
    identities: {},
    profiles: {},
    groups: {},
    rounds: {}
  };
}

module.exports = { State, Profile, Identity, Group, Round };
