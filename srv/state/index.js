const { Profile } = require("./profile");
const { Identity } = require("./identity");
const { Group } = require("./group");
const { Round } = require("./round");
const { SongSubmission, SpotifySubmission } = require("./songSubmission");

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
 * songList: [List-Of SongSubmissionIds]
 *
 * A SongSubmission is one of:
 *  - SpotifySubmission
 *  - ???? TODO ????
 *
 * A SongSubmission contains:
 * songSubmissionId: String (Number),
 * submittedByUserId: String (Number) - ref Profile.userId
 *
 * See songSubmission.js for details
 */

class State {
  static INIT = {
    identities: {},
    profiles: {},
    groups: {},
    rounds: {},
    songSubmissions: {}
  };
}

const StateUtils = {
  getIdentityForEmail: (state, email) => {
    return Object.values(state.identities).find(
      identity => identity.email === email
    );
  },
  getBasicProfile: (state, userId) =>
    state.profiles[userId].toBasicDisplayProfile(),
  getBasicRound: (state, roundId) =>
    state.rounds[roundId].toBasicDisplayRound(),
  getDisplayGroup: (state, groupId) => {
    return {
      name: state.groups[groupId].name,
      description: state.groups[groupId].description,
      owner: StateUtils.getBasicProfile(state, state.groups[groupId].ownerId),
      memberCount: state.groups[groupId].memberIds.length,
      activeRound: StateUtils.getBasicRound(
        state,
        state.groups[groupId].activeRoundId
      )
    };
  },
  getDisplayProfile: (state, userId) => {
    return {
      fullName: state.profiles[userId].fullName,
      groups: state.profiles[userId].ownerOfGroups.reduce(
        (acc, groupId) => ({
          ...acc,
          groupId: StateUtils.getDisplayGroup(state, groupId)
        }),
        {}
      ),
      // Consider changing up profile to include sumbission ids???
      songSubmissions: Object.keys(state.songSubmissions)
        .filter(
          submissionId =>
            state.songSubmissions[submissionId].submittedByUserId === userId
        )
        .map(submissionId => state.songSubmissions[submissionId])
    };
  }
};

module.exports = {
  State,
  StateUtils,
  Profile,
  Identity,
  Group,
  Round,
  SongSubmission,
  SpotifySubmission
};
