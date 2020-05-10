const { Pool } = require("pg");

const CREATE_TABLE_SQL = `-- Table: events

DROP TABLE IF EXISTS events;

CREATE TABLE events
(
    event_id SERIAL NOT NULL,
    type text,
    "timestamp" timestamp without time zone,
    data jsonb,
    CONSTRAINT events_pkey PRIMARY KEY (event_id)
);`;

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(
  "Are you sure you want to migrate? This will delete any existing events. y/N: ",
  resp => {
    if (resp && resp.toLowerCase() === "y") {
      console.log("Ok here we go then you asked for it");
      const pool = new Pool();
      pool.query(CREATE_TABLE_SQL, [], (err, res) => {
        if (err) {
          console.log("Uh oh");
          throw err;
        } else {
          console.log("Migration done!");
          console.log(res.rows);
        }
        readline.close();
      });
    } else {
      console.log("Ok Good");
      readline.close();
    }
  }
);
