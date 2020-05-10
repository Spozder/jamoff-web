const express = require("express");
const router = express.Router();

module.exports = eventDriver => {
  const getNextRoundId = callback => {
    return eventDriver.getState((err, state) => {
      return callback(
        err,
        String(Math.max(...Object.keys(state.rounds), 0) + 1)
      );
    });
  };

  router.get("/", (req, res) => {
    return eventDriver.getState((err, state) => res.send(state.rounds));
  });

  router.post("/", (req, res) => {
    return getNextRoundId((err, newRoundId) => {
      return eventDriver.appendEventData(
        "EVENT:ROUND:ROUND_CREATED",
        {
          roundId: newRoundId,
          groupId: req.body.groupId,
          startTimestamp: req.body.startTimestamp,
          endTimestamp: req.body.endTimestamp,
          theme: req.body.theme,
          ...(req.body.description && { description: req.body.description })
        },
        err => {
          if (err) {
            console.log("CREATE ROUND ERROR: ", err);
            res.status(400).send("Invalid CREATE_ROUND body");
          } else {
            res.send({ roundId: newRoundId });
          }
        }
      );
    });
  });

  router.get("/:roundId", (req, res) => {
    return eventDriver.getState((err, state) => {
      if (!(req.params.roundId in state.rounds)) {
        res.status(404).send("Round not found");
      }
      return res.send(state.rounds[req.params.roundId]);
    });
  });

  router.put("/:roundId", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:ROUND:ROUND_UPDATED",
      {
        roundId: req.params.roundId,
        ...(req.body.startTimestamp && {
          startTimestamp: req.body.startTimestamp
        }),
        ...(req.body.endTimestamp && { endTimestamp: req.body.endTimestamp }),
        ...(req.body.theme && { theme: req.body.theme }),
        ...(req.body.description && { description: req.body.description })
      },
      err => {
        if (err) {
          console.log("UPDATE ROUND ERROR: ", err);
          res.status(400).send("Invalid ROUND_UPDATED body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.post("/:roundId/activate", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:ROUND:ROUND_ACTIVATED",
      {
        roundId: req.params.roundId
      },
      err => {
        if (err) {
          console.log("ROUND ACTIVATE ERROR: ", err);
          res.status(400).send("Invalid ROUND_ACTIVATE body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  router.post("/:roundId/deactivate", (req, res) => {
    return eventDriver.appendEventData(
      "EVENT:ROUND:ROUND_DEACTIVATED",
      {
        roundId: req.params.roundId
      },
      err => {
        if (err) {
          console.log("ROUND DEACTIVATE ERROR: ", err);
          res.status(400).send("Invalid ROUND_DEACTIVATE body");
        } else {
          res.sendStatus(200);
        }
      }
    );
  });

  return router;
};
