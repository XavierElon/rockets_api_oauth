const projectId = 'final-project-hollingx';

const {Datastore} = require('@google-cloud/datastore');

const projectID = 'final-project-hollingx'
const clientID = 'A7f7F2NrV0Lrrqbr887gQu2EtH32yk1Q'
const clientSecret = '4HLsNrMjwRlyjwW3ynURnzTlfaO4yrv5y28lwPYaG5hURAsJaeZcFGE83m6ayKuH'

module.exports.Datastore = Datastore;
module.exports.datastore = new Datastore({projectId:projectId});
module.exports.fromDatastore = function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}