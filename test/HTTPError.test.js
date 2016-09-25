const expect = require('chai').expect;

const HTTPError = require('../lib/HTTPError.js');

describe('[HTTPError]', () => {

  function validateError(error, body) {
    expect(error).to.be.an.instanceOf(HTTPError);
    expect(error).to.be.an.instanceOf(Error);
    expect(error).to.not.be.an.instanceOf(RangeError);
    expect(error).to.deep.equal(body);
    expect(error.message).to.equal(body.errorMessage);
    expect(error.stack).to.be.a('string');
  }

  it('has the correct public API', () => {
    const properties = Reflect.ownKeys(HTTPError);
    const publicMethods = [
      'wrap',
      'badRequest',
      'unauthorized',
      'forbidden',
      'notFound',
      'internalError',
      'notImplemented'
    ];

    expect(properties).to.deep.equal([
      'length',
      'name',
      'prototype'
    ].concat(publicMethods));

    publicMethods.forEach((method) => {
      expect(HTTPError[method]).to.be.a('function');
    });
  });

  it('requires all properties to be set', () => {
    const statusCode = 418;
    const errorCode = 'im_a_teapot';
    const errorMessage = 'Short and Stout.';
    const error = new HTTPError({
      statusCode,
      errorCode,
      errorMessage
    });

    validateError(error, {
      name: 'HTTPError',
      statusCode,
      errorCode,
      errorMessage
    });
  });

  it('throws an error if "statusCode" is missing', () => {
    const errorCode = 'im_a_teapot';
    const errorMessage = 'Short and Stout.';

    expect(() => {
      return new HTTPError({
        errorCode,
        errorMessage
      });
    }).to.throw(Error, /^statusCode is a required property$/);
  });

  it('throws an error if "errorCode" is missing', () => {
    const statusCode = 418;
    const errorMessage = 'Short and Stout.';

    expect(() => {
      return new HTTPError({
        statusCode,
        errorMessage
      });
    }).to.throw(Error, /^errorCode is a required property$/);
  });

  it('throws an error if "errorMessage" is missing', () => {
    const statusCode = 418;
    const errorCode = 'im_a_teapot';

    expect(() => {
      return new HTTPError({
        statusCode,
        errorCode
      });
    }).to.throw(Error, /^errorMessage is a required property$/);
  });

  describe('#wrap', () => {

    it('returns a 500 with the original error object saved', () => {
      const originalError = new Error('banananananananana');
      const error = HTTPError.wrap(originalError);

      validateError(error, {
        name: 'HTTPError',
        statusCode: 500,
        errorCode: 'internal_error',
        errorMessage: 'An unknown server error occurred.',
        originalError
      });
    });

    it('returns the passed in error if it is an HTTPError', () => {
      const originalError = HTTPError.notFound();
      const error = HTTPError.wrap(originalError);

      expect(error).to.equal(originalError);
    });
  });

  describe('#badRequest', () => {

    it('returns a 400 bad_request', () => {
      const error = HTTPError.badRequest();

      validateError(error, {
        name: 'HTTPError',
        statusCode: 400,
        errorCode: 'bad_request',
        errorMessage: 'The server cannot process the request.'
      });
    });
  });

  describe('#unauthorized', () => {

    it('returns a 401 unauthorized', () => {
      const error = HTTPError.unauthorized();

      validateError(error, {
        name: 'HTTPError',
        statusCode: 401,
        errorCode: 'unauthorized',
        errorMessage: 'The request requires user authentication.'
      });
    });
  });

  describe('#forbidden', () => {

    it('returns a 403 forbidden', () => {
      const error = HTTPError.forbidden();

      validateError(error, {
        name: 'HTTPError',
        statusCode: 403,
        errorCode: 'forbidden',
        errorMessage: 'The server understood the request, but is refusing to fulfill it.'
      });
    });
  });

  describe('#notFound', () => {

    it('returns a 404 not_found', () => {
      const error = HTTPError.notFound();

      validateError(error, {
        name: 'HTTPError',
        statusCode: 404,
        errorCode: 'not_found',
        errorMessage: 'The requested resource does not exist.'
      });
    });
  });

  describe('#internalError', () => {

    it('returns a 500 internal_error', () => {
      const error = HTTPError.internalError();

      validateError(error, {
        name: 'HTTPError',
        statusCode: 500,
        errorCode: 'internal_error',
        errorMessage: 'An unknown server error occurred.'
      });
    });
  });

  describe('#notImplemented', () => {

    it('returns a 501 not_implemented', () => {
      const error = HTTPError.notImplemented();

      validateError(error, {
        name: 'HTTPError',
        statusCode: 501,
        errorCode: 'not_implemented',
        errorMessage: 'The requested resource has not been implemented.'
      });
    });
  });
});