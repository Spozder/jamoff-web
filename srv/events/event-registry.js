const registerUserEvents = require("./user-events");
const registerGroupEvents = require("./group-events");

const registerFunctions = [registerUserEvents, registerGroupEvents];

class EventRegistry {
  constructor(types = {}) {
    this.types = types;
  }

  registerEventTypes(types) {
    return new EventRegistry({
      ...this.types,
      ...types.reduce((types, type) => {
        return {
          ...types,
          [type.TYPE]: type
        };
      }, {})
    });
  }

  static register(rFns) {
    return rFns.reduce((registry, rFn) => {
      return rFn(registry);
    }, new EventRegistry());
  }

  lookup(type) {
    if (!(type in this.types)) {
      throw "EVENT TYPE NOT REGISTERED";
    }
    return this.types[type];
  }
}

module.exports = EventRegistry.register(registerFunctions);
