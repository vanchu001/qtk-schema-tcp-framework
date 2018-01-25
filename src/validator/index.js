const assert = require('assert');

module.exports = class {
    check(payload) {
        assert(false, 'this method should be implemented by subclasses');
    }
};