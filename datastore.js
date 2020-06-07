const projectID = 'hollingx-final';

const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({projectID:projectID})


module.exports.Datastore = Datastore;
module.exports.datastore = new Datastore({projectID:projectID});
module.exports.fromDatastore = function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}