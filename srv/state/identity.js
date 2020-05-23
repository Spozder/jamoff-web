const { ModelBase } = require("./model-base");

class Identity extends ModelBase {
  constructor(identityId, userId, email, passHash, createdOn, type = "email") {
    super();
    if (!identityId || !userId || !email || !passHash || !createdOn) {
      throw "All Identity fields are required";
    }
    this.identityId = identityId;
    this.userId = userId;
    this.email = email;
    this.passHash = passHash;
    this.createdOn = createdOn;
    this.type = type;
  }

  updateIdentity(email, passHash) {
    return new Identity(
      this.identityId,
      this.userId,
      email || this.email,
      passHash || this.passHash,
      this.createdOn,
      this.type
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

module.exports = { Identity };
