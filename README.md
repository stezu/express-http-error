# WIP: HTTP-Error

[![Build Status][1]][2] [![Code Climate][3]][4] [![Test Coverage][5]][6]

[1]: https://travis-ci.org/stezu/http-error.svg?branch=master
[2]: https://travis-ci.org/stezu/http-error

[3]: https://codeclimate.com/github/stezu/http-error/badges/gpa.svg
[4]: https://codeclimate.com/github/stezu/http-error

[5]: https://codeclimate.com/github/stezu/http-error/badges/coverage.svg
[6]: https://codeclimate.com/github/stezu/http-error/coverage

An opinionated RESTful HTTP error handler intended for use in [Express](http://npmjs.com/package/express).

## Philosophy

The primary role of an API is to ensure developer success. Therefore, we must provide an API that's easy to digest and provides appropriate guidance. RESTful APIs in particular must return errors must provide ample information to the developer so they can resolve their issue without having to read documentation or source code. Every error returned by a RESTful API should have the following properties:

1. A unique error code that can be pasted into any search engine and results can be found on StackOverflow or in documentation/wikis/forums.
2. A plain-english message for the developer.
3. A plain-english message for the end-user (if possible).
4. A link to a wiki/forum where information can be found about the error and a discussion can be had on it's solution. This has the added benefit of showing you where your errors are lacking information and will help you improve later versions. This also provides a direct conduit to support your users without them having to email or call.
5. A status code that makes sense for the kind of error returned. 4XX error codes are user error, 5XX error codes are server error. Custom status codes are unnecessary, you should always defer to the the HTTP spec for status codes.

### Example Responses

*When a required input is missing:*
```json
400 Bad Request
Content-Type: "application/json"
{
    "errorCode": "missing_input",
    "errorMessage": "A required input is missing. See more information in errorDetails.",
    "errorDetails": {
        "param": "catName",
        "expected": {
            "type": "cat"
        }
    },
    "moreInfo": "https://wiki.example.org/api/missing_input-catName"
}
```

*When the application's database returns an unexpected error:*
```json
500 Internal Server Error
Content-Type: "application/json"
{
    "errorCode": "database_error",
    "errorMessage": "The database encountered an unexpected error and the request could not be completed.",
    "moreInfo": "https://wiki.example.org/api/database_error"
}
```

When your application is provided as a SaaS offering, you should also append a unique identifier to every error code to simplify your error investigation. With sufficient logging, this unique ID will allow you to find specific customer issues in a matter of seconds.

*Providing a unique identifier:*
```json
500 Internal Server Error
Content-Type: "application/json"
{
    "errorCode": "service_timeout",
    "errorMessage": "A service did not respond to the request in time. See more information in errorDetails.",
    "errorDetails": {
        "service": "cart-service",
        "timeout": 25000,
        "payload": {
            "sku": "YmFuYW5h",
            "qty": 2
        }
    },
    "moreInfo": "https://wiki.example.org/api/service_timeout",
    "requestId": "ZG9uJ3QgZGVjb2RlIHRoaXM"
}
```

## Install

The source is available for download from [GitHub](https://github.com/stezu/http-error). Alternatively, you can install using npm:

```bash
npm install --save http-error
```

You can then `require()` http-error:

```js
const { HTTPError, errorHandler } = require('http-error');
```

## Quick Start

TODO

## Documentation

TODO
