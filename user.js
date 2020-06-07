const express = require('express')
const app = express()
const ds = require('./datastore')
const bodyParser = require('body-parser')
const request = require('request')
const router = require('express').Router();
var urlencodedParser = bodyParser.urlencoded({ extended: false});
var path = require('path')
const datastore = ds.datastore
require("dotenv").config();

const USERS = 'users'

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET



function get_users(req) {
    const q = datastore.createQuery(USERS)
    return datastore.runQuery(q).then((users) => {
        return users[0].map(ds.fromDatastore)
    })
}

function post_user(username) {
    var key = datastore.key(USERS)
    const user = {
        'username': username
    };
    const new_user = {
        key: key,
        data: user
    };

    return datastore.insert(new_user).then(() => {
        return key
    })
}

// Router Functions

// Get all users
router.get('/', function(req, res) {
     get_users(req).then(users => {
         res.status(200).json(users)
     })
})

// Signup a new user
router.post('/signup', urlencodedParser, function(req, res) {
    console.log(req.body)
    const email = req.body.email
    const password = req.body.password
    var connection = undefined
    if (!req.body.connection) {
        connection = "Username-Password-Authentication"
    } else {
        connection = req.body.connection
    }
    console.log('hi')
    var options = {
        method: 'POST',
        url: 'https://xavierelon1.auth0.com/dbconnections/signup',
        headers: {
            'content-type': 'application/json'
        },
        body: {
            grant_type: 'password',
            email: email,
            password: password,
            connection: connection,
            client_id: clientID,
            client_secret: clientSecret
        },
        json: true
    };
    console.log('hi')
    request (options, (error, response, body) => {
        if (error) {
            console.log('error')
            res.status(500).send(error)
        } else {
            console.log(body)
            var options2 = {
                method: 'POST',
                url: 'https://xavierelon1.auth0.com/oauth/token',
                headers: {'content-type': 'application/json'},
                body: {
                    grant_type: 'password',
                    username: email,
                    password: password,
                    client_id: clientID,
                    client_secret: clientSecret
                },
                json: true
            };
            console.log('3')
            request(options2, (error, response, body) => {
                if (error) {
                    res.status(500).send(error)
                } else {
                    console.log(body)
                    console.log(body.id_token)
                    post_user(email)
                   
                    var data = { JWT: body.id_token, username: email }
                    res.render('dataDisplay', { data: data })
                }
            })
        }
    })
})



// Login a user
router.post('/login', urlencodedParser, function(req, res) {
    console.log(req.body)
    console.log(req.user)
    const username = req.body.username
    const password = req.body.password
    
    var options = {
        method: 'POST',
        url: 'https://xavierelon1.auth0.com/oauth/token',
        headers: {'content-type': 'application/json'},
        body: {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: clientID,
            client_secret: clientSecret
        },
        json: true
    };
    request(options, (error, response, body) => {
        if(error) {
            res.status(500).send(error)
        } else {
            console.log(body)
            console.log(body.id_token)
            var data = { JWT: body.id_token, username: username }
            res.render('dataDisplay', { data: data })
        }
    })
})


// Login a user for Postman
router.post('/login/postman', urlencodedParser, function(req, res) {
    console.log(req.body)
    console.log(req.user)
    const username = req.body.username
    const password = req.body.password
    
    var options = {
        method: 'POST',
        url: 'https://xavierelon1.auth0.com/oauth/token',
        headers: {'content-type': 'application/json'},
        body: {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: clientID,
            client_secret: clientSecret
        },
        json: true
    };
    request(options, (error, response, body) => {
        if(error) {
            res.status(500).send(error)
        } else {
            console.log(body)
            console.log(body.id_token)
            var data = { JWT: body.id_token, username: username }
            res.status(200).json({ token: body.id_token })
        }
    })
})

module.exports = router;