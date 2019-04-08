const Server = require('../src/server');
const Client = require('../src/client');
const Validator = require('../src/validator');
const SemanticSchema = require('@qtk/schema').validator;
const uuid = require('uuid/v4');
const port = 3005;

class TestValidator extends Validator {
    requestCheck(uuid, data) {
        const ss = SemanticSchema.from(require(`${__dirname}/schema/${data.command}`).request);
        if (!ss.validate(data.data)) {
            throw new Error(`invalid request data`);
        }
    }

    responseCheck(uuid, data) {
        const ss = SemanticSchema.from(require(`${__dirname}/schema/${data.command}`).response);
        if (!ss.validate(data.data)) {
            throw new Error(`invalid response data`);
        }
    }
}

const validator = new TestValidator();
const server = new Server({port, validator});
server.on('exception', (socket, err) => console.log(err));
server.on('data', function (socket, {uuid, data}) {
    switch(data.command) {
        case "echo":
            this.send(socket, {uuid, data});
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
        client.on('data', ({uuid, data}) => {
            if ((data.command !== 'echo') || (data.data !== 'hello')) {
                done(new Error('response mismatch'));
                return;
            }
            done();
        });
        client.on('exception', (err) => {
            console.log(err);
        })
        client.send({uuid: msgid, data: {command: 'echo', data: 'hello'}});
    });
});
