import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  reason = "Bad Request Error";
  statusCode = 400;
  constructor(message: string) {
    super(message);
    // Only because we are extending a built in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
