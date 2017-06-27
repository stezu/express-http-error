const sinon = require('sinon');
const expect = require('chai').expect;

const MockReq = require('mock-express-request');
const MockRes = require('mock-express-response');

const HTTPError = require('../lib/HTTPError.js');
const errorHandler = require('../lib/errorHandler.js');

MockRes.prototype._getString = function () { // eslint-disable-line no-underscore-dangle
  const buf = this._readableState.buffer; // eslint-disable-line no-underscore-dangle

  if (buf instanceof Array) {
    return Buffer.concat(buf).toString();
  }

  // the addition of BufferList makes this necessary
  return buf.join('');
};

function noop() {} // eslint-disable-line no-empty-function

describe('[errorHandler]', () => {

  it('has the correct public API', () => {

    expect(errorHandler)
      .to.be.a('function')
      .and.to.have.lengthOf(4);
  });

  it('sends an HTTPError to the response', () => {
    const err = HTTPError.notImplemented();
    const req = new MockReq();
    const res = new MockRes({
      request: req
    });

    errorHandler(err, req, res, noop);

    expect(res.getHeader('content-type')).to.equal('application/json');
    expect(res.statusCode).to.equal(501);
    expect(res.statusMessage).to.equal('not_implemented');

    expect(res._getJSON()).to.deep.equal({ // eslint-disable-line no-underscore-dangle
      errorCode: 'not_implemented',
      errorMessage: 'The requested resource has not been implemented.'
    });
  });

  it('sends a plain error to the response', () => {
    const err = new Error('bananas');
    const req = new MockReq();
    const res = new MockRes({
      request: req
    });

    errorHandler(err, req, res, noop);

    expect(res.getHeader('content-type')).to.equal('application/json');
    expect(res.statusCode).to.equal(500);
    expect(res.statusMessage).to.equal('internal_error');

    expect(res._getJSON()).to.deep.equal({ // eslint-disable-line no-underscore-dangle
      errorCode: 'internal_error',
      errorMessage: 'An unknown server error occurred.'
    });
  });

  it('attaches a reqId property to the body if it can', () => {
    const err = HTTPError.internalError();
    const req = new MockReq();
    const res = new MockRes({
      request: req
    });

    req.reqId = 'unicorns';
    errorHandler(err, req, res, noop);

    expect(res.getHeader('content-type')).to.equal('application/json');
    expect(res.statusCode).to.equal(500);
    expect(res.statusMessage).to.equal('internal_error');

    expect(res._getJSON()).to.deep.equal({ // eslint-disable-line no-underscore-dangle
      requestId: 'unicorns',
      errorCode: 'internal_error',
      errorMessage: 'An unknown server error occurred.'
    });
  });

  it('attaches an errorDetails property to the body if it exists', () => {
    const err = HTTPError.missingHeader({
      key: 'content-type',
      expected: {
        value: 'application/json'
      }
    });
    const req = new MockReq();
    const res = new MockRes({
      request: req
    });

    errorHandler(err, req, res, noop);

    expect(res.getHeader('content-type')).to.equal('application/json');
    expect(res.statusCode).to.equal(400);
    expect(res.statusMessage).to.equal('missing_header');

    expect(res._getJSON()).to.deep.equal({ // eslint-disable-line no-underscore-dangle
      errorCode: 'missing_header',
      errorMessage: 'The request is missing a required header.',
      errorDetails: {
        key: 'content-type',
        expected: {
          value: 'application/json'
        }
      }
    });
  });

  it('logs the original error if it can', () => {
    const err = new Error('the original error');
    const req = new MockReq({
      log: {
        warn: sinon.spy()
      }
    });
    const res = new MockRes({
      request: req
    });

    errorHandler(err, req, res, noop);

    expect(res.getHeader('content-type')).to.equal('application/json');
    expect(res.statusCode).to.equal(500);
    expect(res.statusMessage).to.equal('internal_error');

    expect(res._getJSON()).to.deep.equal({ // eslint-disable-line no-underscore-dangle
      errorCode: 'internal_error',
      errorMessage: 'An unknown server error occurred.'
    });

    expect(req.log.warn.callCount).to.equal(1);
    expect(req.log.warn.firstCall.args).to.have.lengthOf(2);
    expect(req.log.warn.firstCall.args[0]).to.have.all.keys('err');
    expect(req.log.warn.firstCall.args[0].err).to.equal(err);
    expect(req.log.warn.firstCall.args[1]).to.equal('express-http-error: an error was sent to the client');
  });
});
