const { Profile } = require("./profile");
const {
  Identity,
  EmailIdentity,
  SpotifyIdentity,
  SpotifyFullIdentity
} = require("./identity");
const { Group } = require("./group");
const { Round } = require("./round");
const { SongSubmission, SpotifySubmission } = require("./song-submission");

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

class ReadState {
  constructor(state) {
    this.identities = state.identities;
    this.profiles = state.profiles;
    this.groups = state.groups;
    this.rounds = state.rounds;
    this.songSubmissions = state.songSubmissions;
  }

  // NOTE: Getters must be shallow (only 1 level deep)
  // Any more risks cyclic data being sent - toJSON would then fail
  GETTERS = {
    getIdentityById: identityId => this.identities[identityId],
    getProfileById: profileId => this.profiles[profileId],
    getGroupById: groupId => this.groups[groupId],
    getRoundById: roundId => this.rounds[roundId],
    getSongSubmissionById: songSubmissionId =>
      this.songSubmissions[songSubmissionId],
    getSongSubmissionsByUserId: userId => {
      return Object.values(this.songSubmissions).filter(
        submission => submission.submittedByUserId === userId
      );
    }
  };

  findIdentityByEmail(email) {
    return Object.values(this.identities).find(
      identity => identity.type === "email" && identity.email === email
    );
  }

  getNextIdFor(hash) {
    return String(Math.max(...Object.keys(hash || {}), 0) + 1);
  }

  getBasicIdentity(identityId) {
    return (
      this.identities[identityId] && this.identities[identityId].basicDisplay()
    );
  }

  getDetailedIdentity(identityId) {
    return (
      this.identities[identityId] &&
      this.identities[identityId].extendedDisplay(this.GETTERS)
    );
  }

  getNextIdentityId() {
    return this.getNextIdFor(this.identities);
  }

  getBasicProfile(profileId) {
    return this.profiles[profileId] && this.profiles[profileId].basicDisplay();
  }

  getDetailedProfile(profileId) {
    return (
      this.profiles[profileId] &&
      this.profiles[profileId].extendedDisplay(this.GETTERS)
    );
  }

  getNextProfileId() {
    return this.getNextIdFor(this.profiles);
  }

  getFullSpotifyIdentity(profileId) {
    return this.profiles[profileId].identities
      .map(id => this.identities[id])
      .find(identity => identity instanceof SpotifyFullIdentity);
  }

  getBasicGroup(groupId) {
    return this.groups[groupId] && this.groups[groupId].basicDisplay();
  }

  getDetailedGroup(groupId) {
    return (
      this.groups[groupId] && this.groups[groupId].extendedDisplay(this.GETTERS)
    );
  }

  getNextGroupId() {
    return this.getNextGroupId(this.groups);
  }

  getBasicRound(roundId) {
    return this.rounds[roundId] && this.rounds[roundId].basicDisplay();
  }

  getDetailedRound(roundId) {
    return (
      this.rounds[roundId] && this.rounds[roundId].extendedDisplay(this.GETTERS)
    );
  }

  getNextSongSubmissionId() {
    return this.getNextIdFor(this.songSubmissions);
  }

  getBasicSongSubmission(songSubmissionId) {
    return (
      this.songSubmissions[songSubmissionId] &&
      this.songSubmissions[songSubmissionId].basicDisplay()
    );
  }

  getDetailedSongSubmission(songSubmissionId) {
    return (
      this.songSubmissions[songSubmissionId] &&
      this.songSubmissions[songSubmissionId].extendedDisplay(this.GETTERS)
    );
  }
}

module.exports = {
  State,
  ReadState,
  Profile,
  Identity,
  EmailIdentity,
  SpotifyIdentity,
  SpotifyFullIdentity,
  Group,
  Round,
  SongSubmission,
  SpotifySubmission
};
