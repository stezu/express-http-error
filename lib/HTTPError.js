const errorProperties = [{
  value: 'statusCode',
  required: true
}, {
  value: 'errorCode',
  required: true
}, {
  value: 'errorMessage',
  required: true
}, {
  value: 'originalError',
  required: false
}];

class HTTPError extends Error {

  constructor(options) {
    super(options.errorMessage);

    errorProperties.forEach((prop) => {
      if (options[prop.value]) {
        this[prop.value] = options[prop.value];
      } else if (prop.required) {
        throw new Error(`${prop.value} is a required property`);
      }
    });

    this.name = 'HTTPError';

    Error.captureStackTrace(this, this.constructor);
  }

  // wrap a plain Error object in an HTTPError
  static wrap(originalError) {

    if (originalError instanceof HTTPError) {
      return originalError;
    }

    return new HTTPError({
      statusCode: 500,
      errorCode: 'internal_error',
      errorMessage: 'An unknown server error occurred.',
      originalError
    });
  }

  // return a generic 400 error
  static badRequest() {

    return new HTTPError({
      statusCode: 400,
      errorCode: 'bad_request',
      errorMessage: 'The server cannot process the request.'
    });
  }

  // return a generic 401 error
  static unauthorized() {

    return new HTTPError({
      statusCode: 401,
      errorCode: 'unauthorized',
      errorMessage: 'The request requires user authentication.'
    });
  }

  // return a generic 403 error
  static forbidden() {

    return new HTTPError({
      statusCode: 403,
      errorCode: 'forbidden',
      errorMessage: 'The server understood the request, but is refusing to fulfill it.'
    });
  }

  // return a generic 404 error
  static notFound() {

    return new HTTPError({
      statusCode: 404,
      errorCode: 'not_found',
      errorMessage: 'The requested resource does not exist.'
    });
  }

  // return a generic 500 error
  static internalError() {

    return new HTTPError({
      statusCode: 500,
      errorCode: 'internal_error',
      errorMessage: 'An unknown server error occurred.'
    });
  }

  // return a generic 501 error
  static notImplemented() {

    return new HTTPError({
      statusCode: 501,
      errorCode: 'not_implemented',
      errorMessage: 'The requested resource has not been implemented.'
    });
  }
}

module.exports = HTTPError;
