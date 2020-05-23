const bcrypt = require("bcrypt");
const saltRounds = 10;

// Callback is of form (err, hashedPassword) => Any
const hashPassword = (plaintextPassword, callback) => {
  return bcrypt.hash(plaintextPassword, saltRounds, callback);
};

const checkPassword = (plaintextPassword, hashedPassword, callback) => {
  return bcrypt.compare(plaintextPassword, hashedPassword, callback);
};

module.exports = { hashPassword, checkPassword };
