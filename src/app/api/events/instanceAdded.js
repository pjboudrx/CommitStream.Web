(function(instanceAdded) {
	var uuid = require('uuid-v4'),
		schemaValidator = require('../schemaValidator');

	instanceAdded.create = function(instanceId) {
		var eventId = uuid();
		var apiKey = uuid();
		return {
			eventType: 'InstanceAdded',
			eventId: eventId,
			data: {
				instanceId: instanceId,
				apiKey: apiKey,
			}
		};
	};

	instanceAdded.SCHEMA = {
		"title": "instance",
		"type": "object",
		"required": [
			"instanceId"
		],
		"properties": {
			"instanceId": {
				"title": "ID of the instance",
				"type": "string",
				"minLength": 36, // TODO: install new VersionOne and look in the registry to see what this really is format-wise
				"maxLength": 36
			},
			"apiKey": {
				"title": "API Key for this instance",
				"type": "string",
				"minLength": 36,
				"maxLength": 36
			}
		}
	};

	instanceAdded.validate = function(data) {		
      return schemaValidator.validate('instance', data, instanceAdded.SCHEMA);
	};

})(module.exports);