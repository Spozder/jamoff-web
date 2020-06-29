const Event = require("./event");
const { SpotifyIdentity, SpotifyFullIdentity } = require("../state");
const {
  ProfileNotFoundError,
  EventValidationError,
  IdentityNotFoundError,
  IdentityAlreadyExistsError
} = require("../errors");

class SpotifyEvent extends Event {
  static TYPE = super.TYPE + ":SPOTIFY";
}

class SpotifyUserIDAdded extends SpotifyEvent {
  static TYPE = super.TYPE + ":SPOTIFY_USER_ID_ADDED";

  apply(state) {
    if (!(this.data.userId in state.profiles)) {
      throw new ProfileNotFoundError("Profile to add identity to not found");
    } else if (this.data.identityId in state.identities) {
      throw new EventValidationError("Identity id not valid");
    }
    const profile = state.profiles[this.data.userId];
    const identities = profile.identities.map(id => state.identities[id]);
    if (identities.find(identity => identity.type === "spotify")) {
      throw new IdentityAlreadyExistsError(
        "User already has a spotify UserId setup"
      );
    }
    return {
      ...state,
      profiles: {
        ...state.profiles,
        [this.data.userId]: profile.addIdentity(this.data.identityId)
      },
      identities: {
        ...state.identities,
        [this.data.identityId]: new SpotifyIdentity(
          this.data.identityId,
          this.data.userId,
          this.timestamp,
          this.data.spotifyUserId
        )
      }
    };
  }
}

class SpotifyUserIDChanged extends SpotifyEvent {
  static TYPE = super.TYPE + ":SPOTIFY_USER_ID_CHANGED";

  apply(state) {
    if (!(this.data.userId in state.profiles)) {
      throw new ProfileNotFoundError("Profile to add identity to not found");
    }
    const profile = state.profiles[this.data.userId];
    const spotifyIdentity = profile.identities
      .map(id => state.identities[id])
      .find(identity => identity.type === "spotify");
    if (!spotifyIdentity) {
      throw new IdentityNotFoundError("Cannot change non-existant identity");
    }
    if (spotifyIdentity instanceof SpotifyFullIdentity) {
      throw new EventValidationError(
        "Cannot change spotify identity from full to UserId - must deactivate first"
      );
    }
    return {
      ...state,
      identities: {
        ...state.identities,
        [spotifyIdentity.identityId]: spotifyIdentity.changeSpotifyUserId(
          this.data.spotifyUserId
        )
      }
    };
  }
}

class SpotifyFullIdentityAdded extends SpotifyEvent {
  static TYPE = super.TYPE + ":SPOTIFY_FULL_IDENTITY_ADDED";

  apply(state) {
    if (!this.data.identityId) {
      throw new EventValidationError("New Identity Id Required");
    }
    const profile = state.profiles[this.data.userId];
    const identities = profile.identities.map(id => state.identities[id]);
    if (identities.find(identity => identity.type === "spotify")) {
      throw new IdentityAlreadyExistsError(
        "User already has a spotify UserId setup"
      );
    }
    return {
      ...state,
      profiles: {
        ...state.profiles,
        [this.data.userId]: profile.addIdentity(this.data.identityId)
      },
      identities: {
        ...state.identities,
        [this.data.identityId]: new SpotifyFullIdentity(
          this.data.identityId,
          this.data.userId,
          this.timestamp,
          this.data.spotifyUserId,
          this.data.refreshToken
        )
      }
    };
  }
}

class SpotifyRefreshTokenUpdated extends SpotifyEvent {
  static TYPE = super.TYPE + ":SPOTIFY_REFRESH_TOKEN_UPDATED";

  apply(state) {
    if (!(this.data.identityId in state.identities)) {
      throw new IdentityNotFoundError("Spotify identity to update not found");
    } else if (
      !(state.identities[this.data.identityId] instanceof SpotifyFullIdentity)
    ) {
      throw new EventValidationError("Identity not correct type");
    }
    return {
      ...state,
      identities: {
        ...state.identities,
        [this.data.identityId]: state.identities[
          this.data.identityId
        ].updateRefreshToken(this.data.newRefreshToken)
      }
    };
  }
}

const eventTypes = {
  SpotifyUserIDAdded,
  SpotifyUserIDChanged,
  SpotifyRefreshTokenUpdated,
  SpotifyFullIdentityAdded
};

const registerSpotifyEvents = eventRegistry => {
  return eventRegistry.registerEventTypes(Object.values(eventTypes));
};

module.exports = {
  ...eventTypes,
  registerSpotifyEvents
};
