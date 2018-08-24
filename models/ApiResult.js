/**
 * DTO class that simply contains some data about the result of the api operation
 */
class ApiResult {
  constructor(success = false, message = '', data = null) {
    this.success = success;
    this.message = message;

    if (data) {
      this.data = data;
    }
  }
}

exports.ApiResult = ApiResult;
