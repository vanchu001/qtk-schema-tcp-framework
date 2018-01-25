const Validator = require('semantic-schema').validator;
class CommandValidator extends Validator {
    constructor(command, schema) {
        super(schema);
        this._command = command;
    }

    validate(instance) {
        let result = super.validate(instance);
        if(!result) {
            let instanceStr = JSON.stringify(instance);
            let schemaStr = JSON.stringify(this.jsonSchema);
            let errorStr = this.errorsText();
            throw new Error(`invalid ${this._command}\n instance: ${instanceStr}\n schema: ${schemaStr}\n error: ${errorStr}`);
        }
    }
}

module.exports = class {
    constructor(schemaDir) {
        this._schemaDir = schemaDir;
        this._schemaCache = new Map();
    }

    validate(command, instance) {
        if (!this._schemaCache.has(command)) {
            this._schemaCache.set(command, new CommandValidator(command, require(`${this._schemaDir}/${command}`)));
        }

        return this._schemaCache.get(command).validate(instance);
    }
};