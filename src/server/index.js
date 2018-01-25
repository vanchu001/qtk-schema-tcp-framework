const Server = require('@qtk/tcp-framework').Server;
const Schema = require('../common/schema');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {
    constructor({host, port, schemaDir}) {
        super();
        this._server = new Server({host, port});
        this._schema = new Schema(schemaDir);
        
        this._server.on("data", (socket, {uuid, buffer}) => {
            let json = undefined;
            try {
                json = JSON.parse(buffer.toString('utf8'));
                this._schema.validate(json.command, json.payload);
            }
            catch(err) {
                this.emit('exception', socket, err);
                return;
            }
            this.emit('data', socket, {uuid, command: json.command, payload: json.payload});
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

	send(socket, {uuid, command, payload}) {
        this._server.send(socket, {uuid, buffer: Buffer.from(JSON.stringify({command, payload}), 'utf8')});
	}
}