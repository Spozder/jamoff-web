const { expect } = require("chai");
const {
  UserCreated,
  UserUpdated
} = require("../../../../srv/events/user-events");
const { State, Profile, Identity } = require("../../../../srv/state");

describe("User Events", () => {
  const startState = State.INIT;
  const timestamp = new Date(Date.UTC(2020, 0, 1));
  const timestamp2 = new Date(timestamp).setDate(timestamp.getDate() + 1);
  const user1Data = {
    userId: "1",
    identityId: "1",
    email: "email",
    passHash: "12345",
    fullName: "Namey McNameface"
  };
  const user1Profile = new Profile(
    user1Data.userId,
    [user1Data.identityId],
    timestamp,
    user1Data.fullName
  );
  const user1Identity = new Identity(
    user1Data.identityId,
    user1Data.userId,
    user1Data.email,
    user1Data.passHash,
    timestamp
  );
  const user2Data = {
    userId: "2",
    identityId: "2",
    email: "email2",
    passHash: "67890",
    fullName: "Joe Doe"
  };
  const user2Profile = new Profile(
    user2Data.userId,
    [user2Data.identityId],
    timestamp2,
    user2Data.fullName
  );
  const user2Identity = new Identity(
    user2Data.identityId,
    user2Data.userId,
    user2Data.email,
    user2Data.passHash,
    timestamp2
  );
  describe("UserCreated", () => {
    it("Applies correctly for a new user", () => {
      const newState = new UserCreated(timestamp, user1Data).apply(startState);
      expect(newState).to.deep.equal({
        ...startState,
        profiles: {
          "1": user1Profile
        },
        identities: {
          "1": user1Identity
        }
      });
    });

    it("Applies correctly when another user already exists", function() {
      const userCreated1 = new UserCreated(timestamp, user1Data);
      const userCreated2 = new UserCreated(timestamp2, user2Data);

      const newState = userCreated2.apply(userCreated1.apply(startState));
      expect(newState).to.deep.equal({
        ...startState,
        profiles: {
          "1": user1Profile,
          "2": user2Profile
        },
        identities: {
          "1": user1Identity,
          "2": user2Identity
        }
      });
    });

    describe("Events that fail to apply correctly", () => {
      it("Fails when a required field is missing", () => {
        expect(() =>
          new UserCreated(timestamp, {}).apply(startState)
        ).to.throw();
      });

      it("Fails when userId already exists", () => {
        expect(() =>
          new UserCreated(timestamp, user1Data).apply({
            ...startState,
            profiles: { "1": {} }
          })
        ).to.throw("Non-unique UserID");
      });

      it("Fails when identityId already exists", () => {
        expect(() =>
          new UserCreated(timestamp, user1Data).apply({
            ...startState,
            identities: { "1": {} }
          })
        ).to.throw("Non-unique IdentityId");
      });

      it("Fails when email already exists", () => {
        expect(() =>
          new UserCreated(timestamp, user1Data).apply({
            ...startState,
            identities: { "2": { email: "email" } }
          })
        ).to.throw("Non-unique email");
      });
    });
  });

  describe("UserUpdated", () => {
    const updateDataWithoutIdentity = {
      userId: "1",
      fullName: "Joe Shmo"
    };
    const updateDataWithIdentity = {
      userId: "1",
      identities: {
        "1": {
          email: "updated@email"
        }
      }
    };
    it("Correctly updates a user's profile data", () => {
      const newState = new UserUpdated(
        timestamp,
        updateDataWithoutIdentity
      ).apply({ ...startState, profiles: { "1": user1Profile } });
      expect(newState).to.deep.equal({
        ...startState,
        profiles: {
          "1": {
            ...user1Profile,
            fullName: "Joe Shmo"
          }
        }
      });
    });
    it("Correctly updates a user's identity data", () => {
      const newState = new UserUpdated(timestamp, updateDataWithIdentity).apply(
        {
          ...startState,
          profiles: { "1": user1Profile },
          identities: { "1": user1Identity }
        }
      );
      expect(newState).to.deep.equal({
        ...startState,
        profiles: {
          "1": user1Profile
        },
        identities: {
          "1": {
            ...user1Identity,
            email: "updated@email"
          }
        }
      });
    });

    describe("Events that fail to apply correctly", () => {
      it("Fails when required userId is not given", () => {
        expect(() => new UserUpdated(timestamp, {}).apply(startState)).to.throw(
          "Missing UserId"
        );
      });

      it("Fails when user profile to update doesn't exist", () => {
        expect(() =>
          new UserUpdated(timestamp, { userId: "1" }).apply(startState)
        ).to.throw("UserId Not Found");
      });

      it("Fails when user identity to update doesn't exist", () => {
        expect(() => {
          new UserUpdated(timestamp2, {
            userId: "1",
            identities: { "2": { email: "hi" } }
          }).apply(new UserCreated(timestamp, user1Data).apply(startState));
        }).to.throw("IdentityId Not Found");
      });

      it("Fails when trying to update to a non-unique email", () => {
        expect(() => {
          new UserUpdated(timestamp2, {
            userId: "1",
            identities: { "1": { email: user2Data.email } }
          }).apply(
            new UserCreated(timestamp, user2Data).apply(
              new UserCreated(timestamp, user1Data).apply(startState)
            )
          );
        }).to.throw("Non-unique email");
      });
    });
  });
});
