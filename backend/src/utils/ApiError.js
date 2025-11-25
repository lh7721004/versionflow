export default class ApiError extends Error {
  constructor(status = 500, message = 'Error', code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
