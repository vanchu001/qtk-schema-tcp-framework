const assert = require('assert');

module.exports = class {
    check(uuid, data) {
        assert(false, 'this method should be implemented by subclasses');
    }
};