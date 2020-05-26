class ErrorWithStatusCode extends Error {
  static STATUS = 500;
}

class MethodNotImplementedError extends ErrorWithStatusCode {
  static STATUS = 500;
}

class EventValidationError extends ErrorWithStatusCode {
  static STATUS = 400;
}

class ProfileNotFoundError extends EventValidationError {
  static STATUS = 404;
}

class IdentityNotFoundError extends EventValidationError {
  static STATUS = 404;
}

class GroupNotFoundError extends EventValidationError {
  static STATUS = 404;
}

class IdentityAlreadyExistsError extends EventValidationError {
  static STATUS = 400;
}

module.exports = {
  MethodNotImplementedError,
  EventValidationError,
  ProfileNotFoundError,
  IdentityNotFoundError,
  GroupNotFoundError,
  IdentityAlreadyExistsError
};
