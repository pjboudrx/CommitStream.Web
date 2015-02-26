var getWorkitems = function (message) {
    var re = new RegExp("[A-Z,a-z]{1,2}-[0-9]+", "g");
    var matches = message.match(re);
    return matches;
}

var callback = function (state, ev) {
    var workItems = getWorkitems(ev.data.commit.message);
    workItems.forEach(function(workItem) {
        workItem = workItem.toUpperCase();
        linkTo('versionOneWorkitems-' + ev.metadata.instanceId + '_' + workItem, ev);
    });
};

fromStream('mention-with')
     .whenAny(callback);