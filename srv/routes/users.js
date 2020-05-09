const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const getNextUserId = callback => {
    return eventDriver.getState((err, state) => {
      return callback(
        err,
        String(Math.max(...Object.keys(state.profiles), 0) + 1)
      );
    });
  };

  const getNextIdentityId = callback => {
    return eventDriver.getState((err, state) => {
      return callback(
        err,
        String(Math.max(...Object.keys(state.identities), 0) + 1)
      );
    });
  };

  const getPassHash = passwd => {
    // TODO
    return passwd;
  };

  router.get("/", (req, res) => {
    return eventDriver.getState((err, state) => res.send(state.profiles));
  });

  router.post("/", (req, res) => {
    return getNextUserId((err, newUserId) => {
      return getNextIdentityId((err, newIdentityId) => {
        return eventDriver.appendEventData(
          "EVENT:USER:USER_CREATED",
          {
            userId: newUserId,
            identityId: newIdentityId,
            email: req.body.email,
            passHash: getPassHash(req.body.passwd),
            ...(req.body.fullName && { fullName: req.body.fullName })
          },
          err => {
            console.log("CREATE USER ERROR: ", err);
            if (err) {
              res.status(400).send("Invalid CREATE_USER body");
            } else {
              res.send({ id: newUserId });
            }
          }
        );
      });
    });
  });

  router.put("/", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:USER:USER_UPDATED",
      Object.keys(req.body.identities || {}).reduce(
        (newData, identityId) => {
          return {
            ...newData,
            identities: {
              ...newData.identities,
              [identityId]: {
                ...(req.body.identities[identityId].email && {
                  email: req.body.identities[identityId].email
                }),
                ...(req.body.identities[identityId].passHash && {
                  passHash: req.body.identities[identityId].passHash
                })
              }
            }
          };
        },
        {
          userId: String(req.body.userId),
          ...(req.body.fullName && { fullName: req.body.fullName })
        }
      ),
      err => {
        if (err) {
          console.log(err);
          res.status(400).send("Invalid UPDATE_USER body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  return router;
};
