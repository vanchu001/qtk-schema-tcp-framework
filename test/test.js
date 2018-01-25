const Server = require('../src/server');
const Client = require('../src/client');
const Validator = require('../src/validator');
const SemanticSchema = require('semantic-schema').validator;
const uuid = require('uuid/v4');
const port = 3005;

class TestValidator extends Validator {
    check(payload) {
        const ss = new SemanticSchema(require(`${__dirname}/schema/${payload.command}`));
        if (!ss.validate(payload.data)) {
            throw new Error(`invalid payload`);
        }
    }
}

const validator = new TestValidator();
const server = new Server({port, validator});
server.on('exception', (socket, err) => console.log(err));
server.on('data', function (socket, {uuid, payload}) {
    switch(payload.command) {
        case "echo":
            this.send(socket, {uuid, payload});
            break;
        default:
            break;
    }
});

before('start server', async () => {
    server.start();
});

describe("#schema-tcp-framework", function() {
    it('should return [hello]', function (done) {
        const msgid = uuid().replace(/-/g, '');
        const client = new Client({port, validator});
        client.on('data', ({uuid, payload}) => {
            if ((payload.command !== 'echo') || (payload.data !== 'hello')) {
                done(new Error('response mismatch'));
                return;
            }
            done();
        });
        client.send({uuid: msgid, payload: {command: 'echo', data: 'hello'}});
    });
});
