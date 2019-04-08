const assert = require('assert');

module.exports = class {
    requestCheck(uuid, data) {
        assert(false, 'this method should be implemented by subclasses');
    }

    responseCheck(uuid, data) {
        assert(false, 'this method should be implemented by subclasses');
    }
};