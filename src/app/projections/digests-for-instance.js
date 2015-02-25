fromCategory('instanceDigest')
.foreachStream()
.when({
  '$init': function (state, ev) {
    return { digests: {} }
  },
  'DigestAdded': function (state, ev) {
    state.digests[ev.data.digestId] = ev.data;
  }
});