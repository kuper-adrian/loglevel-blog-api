class BreakError extends Error { }

class FaultError extends BreakError {
  constructor(message, httpStatus) {
    super(message);
    this.httpStatus = httpStatus;
  }
}

exports.BreakError = BreakError;
exports.FaultError = FaultError;
