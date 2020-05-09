const registry = require("./event-registry");
const EventStream = require("./event-stream");
const { State } = require("../state");

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

  eventFromRow(eventRow) {
    return new (this.lookupEventConstructor(eventRow.type))(
      eventRow.timestamp,
      eventRow.data
    );
  }

  lookupEventConstructor(type) {
    return this.registry.lookup(type);
  }

  appendEventData(type, data, callback) {
    // TODO: Confirm timestamp created here
    const newEvent = new (this.lookupEventConstructor(type))(
      new Date(Date.now()),
      data
    );
    return this.getState((err, state) => {
      return newEvent.validateEvent(state, err => {
        if (err) {
          callback(err + ", event type: " + newEvent.getType());
        } else {
          return this.eventStream.appendEvent(newEvent, callback);
        }
      });
    });
  }
}

module.exports = new EventDriver();
