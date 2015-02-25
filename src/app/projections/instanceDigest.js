var callback = function(state, ev) {
  linkTo('instanceDigest-' + ev.data.instanceId, ev);
};

fromStream('digests').when({
  'DigestAdded': function(state, ev) {
    callback(state, ev);
  }
});