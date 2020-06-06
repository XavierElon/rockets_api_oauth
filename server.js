const express = require('express')
const app = express()
const {Datastore} = require('@google-cloud/datastore')
const bodyParser = require('body-parser')
const request = require('request')

var path = require('path')
const router = express.Router()
const ds = require('./datastore')

const rocketRouter = require('./rockets')
const astronautRouter = require('./astronauts')
const userRouter = require('./user')

const projectID = 'final-project-hollingx'
const datastore = new Datastore({projectID:projectID})
app.use(bodyParser.json())


app.use('/static', express.static('public'))
app.use('/rockets', rocketRouter)
app.use('/astronauts', astronautRouter)
app.use('/user', userRouter)



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/signupuser', function(req, res) {
    res.sendFile(path.join(__dirname, 'signup.html'))
})

varurlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


const PORT = process.env.PORT || 8080

app.listen(process.env.PORT || 8080, () => {
    console.log(`App listening on ${PORT}`)
    console.log('Press Ctrl+C to quit.')
})

module.exports = router;
