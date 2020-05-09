class Event {
  static TYPE = "EVENT";

  constructor(timestamp = Date.now(), data) {
    this.timestamp = timestamp;
    this.data = data;
  }

  toRow() {
    return [this.getType(), this.timestamp, this.data];
  }

  getType() {
    return this.constructor.TYPE;
  }

  apply() {
    throw "Event Apply Not Implemented!";
  }

  // Try to apply the event - call errCallback with any thrown error
  validateEvent(state, errCallback) {
    try {
      this.apply(state);
    } catch (e) {
      return errCallback(e);
    }
    return errCallback(false);
  }
}

module.exports = Event;
