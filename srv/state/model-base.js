class ModelBase {
  // _ -> JSON
  // Simple JSON representation of this model object
  basicDisplay() {
    console.error("Model:", this);
    throw "This model doesn't have a basic display fn!";
  }

  // Object -> JSON
  // Extended JSON display version of this model object
  // Note: getters is of form:
  // { getXById: (String) => X }
  // Useful for retrieving other types from the model
  // * Where X is another ModelBase
  extendedDisplay(getters) {
    throw "This model doesn't have an extended display fn!";
  }
}

module.exports = { ModelBase };
