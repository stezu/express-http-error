const expect = require('chai').expect;

const MockReq = require('mock-express-request');
const MockRes = require('mock-express-response');

const HTTPError = require('../lib/HTTPError.js');
const errorHandler = require('../lib/errorHandler.js');

MockRes.prototype._getString = function () {
  const buf = this._readableState.buffer;
  if (buf instanceof Array) {
    return Buffer.concat(buf).toString();
  }

  console.log(buf);
  return buf.toString();
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
});
