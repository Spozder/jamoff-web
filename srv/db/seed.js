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
);

INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:USER:USER_CREATED', '2020-05-09 14:42:49.743', '{"email": "test2@test.com", "userId": "1", "fullName": "John Doe", "passHash": "passwd", "identityId": "1"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:USER:USER_UPDATED', '2020-05-09 14:46:07.534', '{"userId": "1", "fullName": "Johnny Boi"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:GROUP:GROUP_CREATED', '2020-05-09 14:48:19.113', '{"id": "1", "name": "Group1", "ownerId": "1", "description": "A Group"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:USER:USER_CREATED', '2020-05-09 14:58:32.325', '{"email": "test4@test.com", "userId": "2", "fullName": "John Doe", "passHash": "passwd", "identityId": "2"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:GROUP:GROUP_MEMBER_ADDED', '2020-05-09 15:01:20.467', '{"userId": "2", "groupId": "1"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:ROUND:ROUND_CREATED', '2020-05-09 20:30:29.526', '{"theme": "Best Name", "groupId": "1", "roundId": "2", "description": "Song with the best name wins!", "endTimestamp": "2020-05-12T00:25:00.280Z", "startTimestamp": "2020-05-5T00:25:00.280Z"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:ROUND:ROUND_CREATED', '2020-05-09 21:07:43.989', '{"theme": "Worst Name", "groupId": "1", "roundId": "3", "description": "Song with the worst name wins!", "endTimestamp": "2020-04-27T00:25:00.280Z", "startTimestamp": "2020-04-20T00:25:00.280Z"}');
INSERT INTO events (type, "timestamp", data) VALUES ('EVENT:ROUND:ROUND_ACTIVATED', '2020-05-09 21:08:38.486', '{"roundId": "2"}');`;

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(
  "Runs migrations, then inserts starter data. Are you sure you want to proceed? y/N: ",
  resp => {
    if (resp && resp.toLowerCase() === "y") {
      console.log("Ok here we go then you asked for it");
      const pool = new Pool();
      pool.query(CREATE_TABLE_SQL, [], (err, res) => {
        if (err) {
          console.log("Uh oh");
          throw err;
        } else {
          console.log("Migration/seeding done!");
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
