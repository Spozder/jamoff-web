const Event = require("./event");
const { Round } = require("../state");

class RoundEvent extends Event {
  static TYPE = super.TYPE + ":ROUND";
}

class RoundCreated extends RoundEvent {
  static TYPE = super.TYPE + ":ROUND_CREATED";

  apply(state) {
    if (
      !this.data.roundId ||
      !this.data.groupId ||
      !this.data.startTimestamp ||
      !this.data.endTimestamp ||
      !this.data.theme
    ) {
      throw "Missing required Round Created data";
    } else if (this.data.roundId in state.rounds) {
      throw "Duplicated roundId";
    } else if (!(this.data.groupId in state.groups)) {
      throw "Invalid groupId";
    }
    let newState = {
      ...state,
      rounds: {
        ...state.rounds,
        [this.data.roundId]: new Round(
          this.data.roundId,
          this.data.groupId,
          this.data.startTimestamp,
          this.data.endTimestamp,
          this.data.theme,
          this.data.description
        )
      },
      groups: {
        ...state.groups,
        [this.data.groupId]: state.groups[this.data.groupId].addRound(
          this.data.roundId
        )
      }
    };
    const now = Date.now();
    if (now >= this.data.startTimestamp && now < this.data.endTimestamp) {
      newState = {
        ...newState,
        groups: {
          ...newState.groups,
          [this.data.groupId]: newState.groups[this.data.groupId].activateRound(
            this.data.roundId
          )
        }
      };
    }
    return newState;
  }
}

class RoundUpdated extends RoundEvent {
  static TYPE = super.TYPE + ":ROUND_UPDATED";
  state;
  apply(state) {
    if (!this.data.roundId) {
      throw "Missing roundId for update";
    }
    let newState = {
      ...state,
      rounds: {
        ...state.rounds,
        [this.data.roundId]: state.rounds[this.data.roundId].updateRound(
          this.data.startTimestamp,
          this.data.endTimestamp,
          this.data.theme,
          this.data.description
        )
      }
    };
    const now = Date.now();
    if (
      now >= newState.rounds[this.data.roundId].startTimestamp &&
      now < newState.rounds[this.data.roundId].endTimestamp
    ) {
      newState = {
        ...newState,
        groups: {
          ...newState.groups,
          [newState.rounds[this.data.roundId].groupId]: newState.groups[
            newState.rounds[this.data.roundId].groupId
          ].activateRound(this.data.roundId)
        }
      };
    }
    return newState;
  }
}

class RoundActivated extends RoundEvent {
  static TYPE = super.TYPE + ":ROUND_ACTIVATED";

  apply(state) {
    if (!this.data.roundId) {
      throw "Missing roundId to activate";
    }
    const groupId = state.rounds[this.data.roundId].groupId;

    // Replace the active round
    const updatedGroup = state.groups[groupId].activateRound(this.data.roundId);
    const updatedRound = state.rounds[this.data.roundId].updateRound(
      Date.now()
    );

    let oldActiveRoundId;
    let oldActiveRound;
    if (state.groups[groupId].activeRoundId) {
      oldActiveRoundId = state.groups[groupId].activeRoundId;
      // End the old active round now
      oldActiveRound = state.rounds[oldActiveRoundId].updateRound(
        undefined,
        Date.now()
      );
    }
    // Combine
    return {
      ...state,
      groups: {
        ...state.groups,
        [groupId]: updatedGroup
      },
      rounds: {
        ...state.rounds,
        ...(oldActiveRoundId && { [oldActiveRoundId]: oldActiveRound }),
        [this.data.roundId]: updatedRound
      }
    };
  }
}

module.exports = eventRegistry => {
  return eventRegistry.registerEventTypes([
    RoundCreated,
    RoundUpdated,
    RoundActivated
  ]);
};
