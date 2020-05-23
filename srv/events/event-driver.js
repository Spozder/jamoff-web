const registry = require("./event-registry");
const EventStream = require("./event-stream");
const { State, ReadState } = require("../state");

// Combines the Event Registry and Event Stream
class EventDriver {
  constructor() {
    this.registry = registry;
    this.eventStream = new EventStream();
  }

  getState(callback) {
    return this.eventStream.streamFromDB((err, dbRes) =>
      callback(
        err,
        dbRes.rows.reduce((state, eventRow) => {
          return this.eventFromRow(eventRow).apply(state);
        }, State.INIT)
      )
    );
  }

  getReadState(callback) {
    return this.getState((err, state) => {
      if (err) {
        return callback(err);
      }
      if (!state) {
        console.error("Uh oh???? No state??");
        return callback(new Error("No state???"), false);
      }
      return callback(err, new ReadState(state));
    });
  }

  eventFromRow(eventRow) {
    return new (this.lookupEventConstructor(eventRow.type))(
      eventRow.timestamp,
      eventRow.data
    );
  }

  lookupEventConstructor(type) {
    return this.registry.lookup(type);
  }

  // TODO: DB Locking during appendEventData
  appendEventData(type, data, callback) {
    const newEvent = new (this.lookupEventConstructor(type))(
      new Date(Date.now()),
      data
    );
    return this.getState((err, state) => {
      if (err) {
        return callback(err);
      }
      return newEvent.validateEvent(state, err => {
        if (err) {
          return callback(err);
        } else {
          return this.eventStream.appendEvent(newEvent, callback);
        }
      });
    });
  }
}

module.exports = new EventDriver();
