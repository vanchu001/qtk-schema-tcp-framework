const Server = require('@qtk/tcp-framework').Server;
const Validator = require('../validator');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {
    constructor({host, port, validator}) {
        super();
        this._server = new Server({host, port});
        this._validator = validator;
        
        this._server.on("data", (socket, {uuid, buffer}) => {
            let payload = undefined;
            try {
                payload = JSON.parse(buffer.toString('utf8'));
                if (this._validator instanceof Validator) {
                    this._validator.check(payload);
                }
            }
            catch(err) {
                this.emit('exception', socket, err);
                return;
            }
            this.emit('data', socket, {uuid, payload});
        });

        this._server.on("started", () => {this.emit("started");});
        this._server.on("stopped", () => {this.emit("stopped");});
        this._server.on("connected", (socket) => {this.emit("connected", socket);});
        this._server.on("closed", (socket) => {this.emit("closed", socket);});
        this._server.on("exception", (socket, error) => {this.emit('exception', socket, error);});
    }

    start() {
        this._server.start();
    }

    stop() {
		this._server.stop();
	}

	send(socket, {uuid, payload}) {
        this._server.send(socket, {uuid, buffer: Buffer.from(JSON.stringify(payload), 'utf8')});
	}
}