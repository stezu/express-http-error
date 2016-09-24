const expect = require('chai').expect;
const index = require('../');

describe('[Main]', () => {

  it('exposes the correct public api', () => {
    expect(index).to.have.all.keys('HTTPError', 'errorHandler');
    expect(index.HTTPError).to.be.a('function');
    expect(index.errorHandler).to.be.a('function');
  });
});
