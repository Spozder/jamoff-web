const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const { getsReadState, handleAppendEventError } = require("./middleware")(
    eventDriver
  );

  const getPassHash = passwd => {
    // TODO
    return passwd;
  };

  router.get("/", getsReadState, (req, res) => {
    return res.send(req.readState.profiles);
  });

  router.post("/", (req, res) => {
    const newUserId = req.readState.getNextProfileId();
    const newIdentityId = req.readState.getNextIdentityId();
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
        return handleAppendEventError(err, res, () => {
          return res.send({ id: newUserId });
        });
      }
    );
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
        return handleAppendEventError(err, res, () => {
          return res.sendStatus(200);
        });
      }
    );
  });

  return router;
};
