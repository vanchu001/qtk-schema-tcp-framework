const Server = require('@qtk/tcp-framework').Server;
const Validator = require('../validator');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {
    constructor({host, port, validator}) {
        super();
        this._server = new Server({host, port});
        this._validator = validator;
        
        this._server.on("data", (socket, {uuid, data}) => {
            try {
                const json = JSON.parse(data.toString('utf8'));
                if (this._validator instanceof Validator) {
                    this._validator.check(json);
                }
                this.emit('data', socket, {uuid, data:json});
            }
            catch(err) {
                this.emit('exception', socket, err);
                return;
            }
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

	send(socket, {uuid, data}) {
        this._server.send(socket, {uuid, data: Buffer.from(JSON.stringify(data), 'utf8')});
	}
}