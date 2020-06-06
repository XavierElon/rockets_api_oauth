const express = require("express");
const router = express.Router()
const bodyParser = require("body-parser");
const ds = require("./datastore");
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const datastore = ds.datastore

const ASTRONAUTS = 'Astronauts'
const ROCKETS = 'Rockets'
const projectID = 'final-project-hollingx'
const clientID = 'A7f7F2NrV0Lrrqbr887gQu2EtH32yk1Q'
const clientSecret = '4HLsNrMjwRlyjwW3ynURnzTlfaO4yrv5y28lwPYaG5hURAsJaeZcFGE83m6ayKuH'

router.use(bodyParser.json())

const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://xavierelon1.auth0.com/.well-known/jwks.json`
    }),
    audience:clientID,
    issuer: `https://xavierelon1.auth0.com/`,
    algorithms: ['RS256']
})


// Astronaut functions
function get_astronaut(id) {
    const key = datastore.key([ASTRONAUTS, parseInt(id, 10)])
    return datastore.get(key)
}

function patch_astronaut(id, name, age, sex, rocketName) {
    const key = datastore.key([ASTRONAUTS, parseInt(id, 10)])
    const astronaut = { name: name, age: age, sex: sex, rocketName: rocketName  }
    return datastore.update({ key: key, data: astronaut }).then(() => {
        var selfUrl = `${baseUrl}/astronauts/${key.id}`
        const new_data = { name: name, age: age, sex: sex, rocketName: rocketName, self: selfUrl }
        datastore.update({ key: key, data: new_data }).then(() => {
        })
        return key
    })
}

// Rocket Functions
function get_rocket(id) {
    const key = datastore.key([ROCKETS, parseInt(id, 10)])
    return datastore.get(key)
}

function get_all_rockets(owner) {
    const q = datastore.createQuery(ROCKETS)
    return datastore.runQuery(q).then((entities) => {
        return (entities[0].map(ds.fromDatastore).filter(item => item.ownerID == owner).length)
    })
}

function get_rockets(owner, req) {
    var query_total = datastore.createQuery(ROCKETS)
    const q = datastore.createQuery(ROCKETS).limit(5)
    var results = {}
    var prev
    var total = 0;

    return datastore.runQuery(query_total).then((entities) => {
        rockets = entities[0].map(ds.fromDatastore)
        total = rockets.length
        
    }).then(() => {
        console.log(total)
        results.total = total
        if (Object.keys(req.query).includes('cursor')) {
            prev = req.protocol + '://' + req.get('host') + req.baseUrl  + '?cursor=' + req.query.cursor
            q = q.start(req.query.cursor)
        }
        return datastore.runQuery(q).then((entities) => {
            results.items = entities[0].map(ds.fromDatastore).filter(item => item.ownerID == owner)
            if (typeof prev != 'undefined') {
                results.previous = prev
            }
            if(entities[1].moreResults != ds.Datastore.NO_MORE_RESULTS) {
                results.next = req.protocol + '://' + req.get('host') + req.baseUrl + '?cursor=' + entities[1].endCursor
            }
            return results
        })
    })
    
}

function post_rocket(name, weight, price, ownerID) {
    var key = datastore.key(ROCKETS)
    var astronauts = []
    const rocket = { 'name': name, 'price': price, 'weight': weight, 'astronauts': astronauts, 'ownerID': ownerID }
    const new_rocket = { key: key, data: rocket};
    return datastore.insert(new_rocket).then(() => {
        var selfUrl = `${baseUrl}/rockets/${key.id}`
        const new_data = { name: name, price: price, weight: weight, astronauts: astronauts, ownerID: ownerID, self: selfUrl }
        datastore.save({ key: key, data: new_data }).then(() => {
        })
        return key
    })
}

function patch_rocket(id, name, price, weight, astronauts, ownerID) {
    const key = datastore.key([ROCKETS, parseInt(id, 10)])
    const rocket = { name: name, price: price, weight: weight, astronauts: astronauts, ownerID: ownerID }
    return datastore.update({ key: key, data: rocket }).then(() => {
        var selfUrl = `${baseUrl}/rockets/${key.id}`
        const new_data = { name: name, price: price, weight: weight, astronauts: astronauts, ownerID: ownerID, self: selfUrl}
        datastore.update({ key: key, data: new_data }).then(() => {
        })
        return key
    }) 
}

function put_rocket(id, name, price, weight, astronauts, ownerID) {
    const key = datastore.key([ROCKETS, parseInt(id, 10)])
    const rocket = { name: name, price: price, weight: weight, astronauts: astronauts, ownerID: ownerID }
    return datastore.save({ key: key, data: rocket }).then(() => {
        var selfUrl = `${baseUrl}/rockets/${key.id}`
        const new_data = { name: name, price: price, weight: weight, astronauts: astronauts, ownerID: ownerID, self: selfUrl}
        datastore.save({ key: key, data: new_data }).then(() => {
        })
        return key
    }) 
}

function delete_rocket(id) {
    const key = datastore.key([ROCKETS, parseInt(id ,10)])
    return datastore.delete(key)
}

// Routes

router.get('/', checkJwt, function(req,res) {
    var owner = req.user.name
    // get_all_rockets(req).then(rockets => {
    //     res.status(200).json(rockets)
    // })
    get_rockets(owner, req).then(rockets => {
        res.status(200).json(rockets)
    })
})

router.post('/', checkJwt, function(req, res) {
    console.log(req.body)
    var selfUrl = `${baseUrl}/rockets`
    if (req.get('content-type') != 'application/json') {
        res.status(415).send('Can only accept application/json data type')
    } else {
        console.log(req.user)
        post_rocket(req.body.name, req.body.price, req.body.weight, req.user.name)
        .then( key => {
            res.status(201).json({ id : key.id, name : req.body.name, price: req.body.price, weight: req.body.weight, ownerID: req.user.name, self: `${selfUrl}/${key.id}` })
        });
    }
});

router.patch('/:id', checkJwt, function(req, res) {
    var id = req.params.id
    var selfUrl = `${baseUrl}/rockets/${id}`
    if (req.get('content-type') != 'application/json') {
        res.status(415).send('Can only accept application/json data type')
    }
    get_rocket(id).then((rocket) => {
        console.log(rocket)
        var astronauts = rocket[0].astronauts
        console.log(astronauts)
        if (rocket[0] == null) {
            res.status(404).send('A rocket with this rocket id does not exist.')
        } else if (rocket[0].ownerID != req.user.name) {
            res.status(403).send('This rocket is owned by someone else')
        } else {
            console.log()
            if (req.body.name == null) {
                req.body.name = rocket[0].name
            } 
            if (req.body.price == null) {
                req.body.price = rocket[0].price
            }
            if (req.body.weight == null) {
                req.body.weight = rocket[0].weight
            }
            patch_rocket(id, req.body.name, req.body.price, req.body.weight, astronauts, req.user.name).then((key) => {
                console.log(key)
                res.status(200).json({ id: key.id, name: req.body.name, price: req.body.price, weight: req.body.weight, astronauts: astronauts, self: selfUrl, ownerID: req.user.name })
            })
        }
    })
})

router.put('/:id', checkJwt, function(req, res) {
    var id = req.params.id
    var selfUrl = `${baseUrl}/rockets/${id}`
    if (req.get('content-type') != 'application/json') {
        res.status(415).send('Can only accept application/json data type')
    }
    get_rocket(id).then((rocket) => {
        console.log(rocket)
        var astronauts = rocket[0].astronauts
        console.log(astronauts)
        if (rocket[0] == null) {
            res.status(404).send('A rocket with this rocket id does not exist.')
        } else if (rocket[0].ownerID != req.user.name) {
            res.status(403).send('This rocket is owned by someone else')
        } else {
            put_rocket(id, req.body.name, req.body.price, req.body.weight, astronauts, req.user.name).then((key) => {
                console.log(key)
                res.status(200).json({ id: key.id, name: req.body.name, price: req.body.price, weight: req.body.weight, astronauts: astronauts, self: selfUrl, ownerID: req.user.name })
            })
        }
    })
})

router.delete('/:id', checkJwt, function(req, res) {
    var id = req.params.id
    var astronaut_id
    console.log(id)
    get_rocket(id).then((rocket) => {
        var astronauts = rocket[0].astronauts
        if (rocket[0] == null) {
            res.status(404).send('A rocket with this rocket id does not exist.')
        } else if (rocket[0].ownerID != req.user.name) {
            res.status(403).send('This rocket is owned by someone else')
        } else {
            for (i = 0; i < astronauts.length; i++) {
                astronaut_id = astronauts[i]
                get_astronaut(astronaut_id).then((astronaut) => {
                    var name = astronaut[0].name
                    var age = astronaut[0].age
                    var sex = astronaut[0].sex
                    var rocket_id = null
                    patch_astronaut(astronaut_id, name, age, sex, rocket_id)
                })
            }
            delete_rocket(id).then(() => {
                res.status(204).json({ Message: 'Rocket deleted.' })
            })
        }
    })
})

const PORT = process.env.PORT || 8080
var baseUrl;

if (PORT == 8080) {
    baseUrl = `http://localhost:8080`
} else {
    baseUrl = `https://final-project-hollingx`
}

module.exports =  router;