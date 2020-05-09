// DB Event Stream Driver
const db = require("../db");

// TODO MAKE REAL
module.exports = class EventStream {
  // Event -> _
  // Append Event to Event Stream
  appendEvent(event, callback) {
    return db.namedQuery(
      "add_event",
      "INSERT INTO events(type, timestamp, data) VALUES ($1, $2, $3)",
      event.toRow(),
      callback
    );
  }

  // -> [List-Of Event-Row]
  // Get streamed list of event rows from db
  streamFromDB(callback) {
    // Get Event-Rows from DB
    return db.namedQuery("get_events", "SELECT * FROM events;", [], callback);
  }
};
