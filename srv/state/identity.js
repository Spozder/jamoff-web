const { ModelBase } = require("./model-base");
const { EventValidationError } = require("../errors");

class Identity extends ModelBase {
  constructor(identityId, userId, createdOn, type) {
    super();
    if (!identityId || !userId || !createdOn) {
      throw new EventValidationError("All Identity fields are required");
    }
    this.identityId = identityId;
    this.userId = userId;
    this.createdOn = createdOn;
    this.type = type;
  }
}

class EmailIdentity extends Identity {
  constructor(identityId, userId, createdOn, email, passHash) {
    super(identityId, userId, createdOn, "email");
    if (!email || !passHash) {
      throw new EventValidationError(
        "Email and Password Hash fields are required"
      );
    }
    this.email = email;
    this.passHash = passHash;
  }

  updateIdentity(email, passHash) {
    return new EmailIdentity(
      this.identityId,
      this.userId,
      this.createdOn,
      email || this.email,
      passHash || this.passHash
    );
  }

  basicDisplay() {
    return {
      identityId: this.identityId,
      userId: this.userId,
      email: this.email,
      type: this.type
    };
  }

  extendedDisplay() {
    return {
      identityId: this.identityId,
      userId: this.userId,
      email: this.email,
      createdOn: this.createdOn,
      type: this.type
    };
  }
}

// Only contains a spotify username
class SpotifyIdentity extends Identity {
  constructor(identityId, userId, createdOn, spotifyUserId) {
    super(identityId, userId, createdOn, "spotify");
    if (!spotifyUserId) {
      throw new EventValidationError("Missing required spotifyUserId");
    }
    this.spotifyUserId = spotifyUserId;
  }

  changeSpotifyUserId(newSpotifyUserId) {
    return new SpotifyIdentity(
      this.identityId,
      this.userId,
      this.createdOn,
      newSpotifyUserId
    );
  }
}

// Actually contains a spotify integration
class SpotifyFullIdentity extends SpotifyIdentity {
  constructor(identityId, userId, createdOn, spotifyUserId, refreshToken) {
    super(identityId, userId, createdOn, spotifyUserId);
    if (!refreshToken) {
      throw new EventValidationError("Refresh token required");
    }
    this.refreshToken = refreshToken;
  }

  updateRefreshToken(newRefreshToken) {
    return new SpotifyFullIdentity(
      this.identityId,
      this.userId,
      this.createdOn,
      newRefreshToken
    );
  }
}

module.exports = {
  Identity,
  EmailIdentity,
  SpotifyIdentity,
  SpotifyFullIdentity
};
