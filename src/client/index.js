const EventEmitter = require('events').EventEmitter;
const Schema = require('../common/schema');
const Client = require('@qtk/tcp-framework').Client;

module.exports = class extends EventEmitter {
    constructor({host, port, schemaDir}) {
        super();
        this._schema = new Schema(schemaDir);
        this._client = new Client({host, port});
        this._client.on('exception', err => {
            this.emit('exception', err);
        });
        this._client.on('data', ({uuid, buffer}) => {
            let json = undefined;
            try {
                json = JSON.parse(buffer.toString('utf8'));
                this._schema.validate(json.command, json.payload);
            }
            catch(err) {
                this.emit('exception', err);
                return;
            }

            this.emit('data', {uuid, command: json.command, payload: json.payload});
        });
    }

    send({uuid, command, payload}) {
        this._client.send({uuid, buffer: Buffer.from(JSON.stringify({command, payload}), 'utf8')});
	}
}