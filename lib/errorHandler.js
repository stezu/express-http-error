const HTTPError = require('./HTTPError.js');

function errorHandlingMiddleware(err, req, res, next) {
  // Express requires a 4 parameter function for it's error
  // handling, but we shouldn't ever call next() because the
  // response is handled here. If we leave the parameter unused,
  // eslint will error, and it could be stripped when obfuscated.
  // Therefore, we are using the parameter and disabling eslint
  // for the line to avoid both problems.
  typeof next === 'function'; // eslint-disable-line no-unused-expressions

  const httpError = HTTPError.wrap(err);
  const body = {
    errorCode: httpError.errorCode,
    errorMessage: httpError.errorMessage
  };

  if (req.reqId) {
    body.requestId = req.reqId;
  }

  res.writeHead(httpError.statusCode, httpError.errorCode, {
    'content-type': 'application/json'
  });
  res.end(JSON.stringify(body));
}

module.exports = errorHandlingMiddleware;
