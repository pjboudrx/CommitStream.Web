(function(digestAdded) {
	var uuid = require('uuid-v4');

	digestAdded.create = function(instanceId, description) {
		var eventId = uuid();
		var digestId = uuid();

		return {
			eventType: 'DigestAdded',
			eventId: eventId,
			data: {
				instanceId: instanceId,
				digestId: digestId,
				description: description
			}
		};
	};
})(module.exports);