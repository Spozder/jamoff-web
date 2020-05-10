class Identity {
  constructor(identityId, userId, email, passHash, createdOn) {
    if (!identityId || !userId || !email || !passHash || !createdOn) {
      throw "All Identity fields are required";
    }
    this.identityId = identityId;
    this.userId = userId;
    this.email = email;
    this.passHash = passHash;
    this.createdOn = createdOn;
  }

  updateIdentity(email, passHash) {
    return new Identity(
      this.identityId,
      this.userId,
      email || this.email,
      passHash || this.passHash,
      this.createdOn
    );
  }
}

module.exports = { Identity };
