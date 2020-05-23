const { EventValidationError } = require("../errors");

module.exports = eventDriver => {
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    return res.sendStatus(403);
  };

  const getsReadState = (req, res, next) => {
    return eventDriver.getReadState((err, readState) => {
      if (err) {
        console.error("Internal error: ", err);
        return res.sendStatus(500);
      } else if (!readState) {
        console.error("Could not get ReadState: ", err);
        return res.sendStatus(500);
      }
      req.readState = readState;
      return next();
    });
  };

  // TODO: getsReadStateAndLocks
  // For use with appendEvent

  const handleAppendEventError = (err, res, callback) => {
    if (err) {
      if (err instanceof EventValidationError) {
        return res.status(err.STATUS).send(err.message);
      } else {
        console.error("Backend error: ", err);
        return res.sendStatus(500);
      }
    }
    return callback();
  };

  return { getsReadState, handleAppendEventError, ensureAuthenticated };
};
