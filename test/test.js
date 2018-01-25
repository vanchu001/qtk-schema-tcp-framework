const Server = require('../src/server');
const Client = require('../src/client');
const uuid = require('uuid/v4');

const port = 3005;

const server = new Server({port, schemaDir: `${__dirname}/schema`});
server.on('data', function (socket, {uuid, command, payload}) {
    switch(command) {
        case "echo":
            this.send(socket, {uuid, command, payload});
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
        const client = new Client({port, schemaDir: `${__dirname}/schema`});
        client.on('data', ({uuid, command, payload}) => {
            if ((command !== 'echo') || (payload !== 'hello')) {
                done(new Error('response mismatch'));
                return;
            }
            done();
        });
        client.send({uuid: msgid, command: 'echo', payload: 'hello'});
    });
});
