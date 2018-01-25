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
        this._client.on('data', ({uuid, data}) => {
            let json = undefined;
            try {
                json = JSON.parse(data.toString('utf8'));
                if (this._validator instanceof Validator) {
                    this._validator.check(json);
                }
            }
            catch(err) {
                this.emit('exception', err);
                return;
            }

            this.emit('data', {uuid, data:json});
        });
    }

    send({uuid, data}) {
        this._client.send({uuid, data: Buffer.from(JSON.stringify(data), 'utf8')});
	}
}