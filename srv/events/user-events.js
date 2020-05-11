const Event = require("./event");
const { Profile, Identity } = require("../state");

class UserEvent extends Event {
  static TYPE = super.TYPE + ":USER";
}

/**
 * data: {
 *  userId: String (Number),
 *  identityId: String (Number),
 *  email: String,
 *  passHash: String,
 *  fullName: String (optional)
 * }
 */
class UserCreated extends UserEvent {
  static TYPE = super.TYPE + ":USER_CREATED";

  apply(state) {
    if (!this.data.userId) {
      throw "No UserId provided";
    } else if (!this.data.identityId) {
      throw "No IdentityId provided";
    } else if (this.data.userId in state.profiles) {
      throw "Non-unique UserID";
    } else if (this.data.identityId in state.identities) {
      throw "Non-unique IdentityId";
    }
    const emails = Object.keys(state.identities).map(
      identityId => state.identities[identityId].email
    );
    if (emails.includes(this.data.email)) {
      throw "Non-unique email";
    }
    return {
      ...state,
      profiles: {
        ...state.profiles,
        [this.data.userId]: new Profile(
          this.data.userId,
          [this.data.identityId],
          this.timestamp,
          this.data.fullName
        )
      },
      identities: {
        ...state.identities,
        [this.data.identityId]: new Identity(
          this.data.identityId,
          this.data.userId,
          this.data.email,
          this.data.passHash,
          this.timestamp
        )
      }
    };
  }
}

/**
 * Allow a user to change their profile and/or identities
 * data: {
 *  userId: String,
 *  fullName: String (Optional),
 *  identities: {
 *    identityId: {
 *      email: String (Optional),
 *      passHash: String (Optional)
 *    }, ... (Optional)
 *  }
 * }
 */
class UserUpdated extends UserEvent {
  static TYPE = super.TYPE + ":USER_UPDATED";

  apply(state) {
    if (!this.data.userId) {
      throw "Missing UserId";
    } else if (!(this.data.userId in state.profiles)) {
      throw "UserId Not Found";
    }
    if (this.data.identities) {
      Object.keys(this.data.identities || {}).forEach(identityId => {
        if (!(identityId in state.identities)) {
          throw "IdentityId Not Found";
        }
        const emails = Object.keys(state.identities)
          .filter(stateIdentityId => stateIdentityId !== identityId)
          .map(stateIdentityId => state.identities[stateIdentityId].email);
        if (emails.includes(this.data.identities[identityId].email)) {
          throw "Non-unique email";
        }
      });
    }

    return Object.keys(this.data.identities || {}).reduce(
      (newState, identityId) => {
        return {
          ...newState,
          identities: {
            ...newState.identities,
            [identityId]: newState.identities[identityId].updateIdentity(
              this.data.identities[identityId].email,
              this.data.identities[identityId].passHash
            )
          }
        };
      },
      {
        ...state,
        profiles: {
          ...state.profiles,
          [this.data.userId]: state.profiles[this.data.userId].updateProfile(
            undefined,
            this.data.fullName
          )
        }
      }
    );
  }
}

const eventTypes = {
  UserCreated,
  UserUpdated
};

const registerUserEvents = eventRegistry => {
  return eventRegistry.registerEventTypes(Object.values(eventTypes));
};

module.exports = {
  ...eventTypes,
  registerUserEvents
};
