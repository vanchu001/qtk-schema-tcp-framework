const {object, string, integer} = require('semantic-schema').describer;

module.exports = string().desc("echo字符串");