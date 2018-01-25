const EventEmitter = require('events').EventEmitter;
const Client = require('@qtk/tcp-framework').Client;
const Validator = require('../validator');

module.exports = class extends EventEmitter {
    constructor({host, port, validator}) {
        super();
        this._client = new Client({host, port});
        this._validator = validator;

        this._client.on('exception', err => {
            this.emit('exception', err);
        });
        this._client.on('data', ({uuid, buffer}) => {
            let payload = undefined;
            try {
                payload = JSON.parse(buffer.toString('utf8'));
                if (this._validator instanceof Validator) {
                    this._validator.check(payload);
                }
            }
            catch(err) {
                this.emit('exception', err);
                return;
            }

            this.emit('data', {uuid, payload});
        });
    }

    send({uuid, payload}) {
        this._client.send({uuid, buffer: Buffer.from(JSON.stringify(payload), 'utf8')});
	}
}