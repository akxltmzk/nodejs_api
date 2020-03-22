// set status err code (404, 500 ..)
class ErrorResponse extends Error{
  constructor(message, statusCode){
    super(message)
    this.statusCode = statusCode

  }
}

module.exports = ErrorResponse