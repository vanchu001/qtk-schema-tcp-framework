const {object, string, integer} = require('@qtk/schema').schema;

module.exports = {
    request: string().desc("echo字符串"),
    response: string()
}