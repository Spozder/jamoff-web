// Database access
// Copied from https://node-postgres.com/guides/project-structure

const { Pool } = require("pg");
const QueryStream = require("pg-query-stream");
const pool = new Pool();

module.exports = {
  query: (text, params, callback) => {
    const start = Date.now();
    return pool.query(text, params, (err, res) => {
      const duration = Date.now() - start;
      console.log("Query text", text);
      console.log("Query params", params);
      if (err) {
        throw err;
      }
      console.log("executed query", { text, duration, rows: res.rowCount });
      callback(err, res);
    });
  },
  namedQuery: (name, text, params, callback) => {
    const start = Date.now();
    return pool.query(
      {
        name: name,
        text: text,
        values: params
      },
      (err, res) => {
        const duration = Date.now() - start;
        console.log("Query name: ", name);
        console.log("Query text: ", text);
        console.log("Query params: ", params);
        if (err) {
          console.log("DB ERROR BAD STUFF");
          throw err;
        }
        console.log("executed query", { text, duration, rows: res.rowCount });
        callback(err, res);
      }
    );
  },
  queryStream: (text, params, callback) => {
    const start = Date.now();
    const q = new QueryStream(text, params);
    const stream = pool.query(q);
    q.on("end", (err, res) => {
      const duration = Date.now() - start;
      console.log("executed streaming query", {
        text,
        duration,
        rows: res.rowCount
      });
      callback(err, res);
    });
    return stream;
  },
  getClient: callback => {
    pool.connect((err, client, done) => {
      const query = client.query;
      // monkey patch the query method to keep track of the last query executed
      client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
      };
      // set a timeout of 5 seconds, after which we will log this client's last query
      const timeout = setTimeout(() => {
        console.error("A client has been checked out for more than 5 seconds!");
        console.error(
          `The last executed query on this client was: ${client.lastQuery}`
        );
      }, 5000);
      const release = err => {
        // call the actual 'done' method, returning this client to the pool
        done(err);
        // clear our timeout
        clearTimeout(timeout);
        // set the query method back to its old un-monkey-patched version
        client.query = query;
      };
      callback(err, client, release);
    });
  }
};
