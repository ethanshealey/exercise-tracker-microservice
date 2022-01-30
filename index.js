const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId;
const { ObjectID } = require('mongodb');

dotenv.config()

const app = express();

app.use(express.json())
app.use(express.urlencoded())
app.use(cors({optionSuccessStatus: 200}))

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile('./public/index.html', { root: __dirname })
})

app.get('/api/users', (req, res) => {
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
        client.db('exercise-tracker').collection('users').find().toArray((err, result) => {
            const users = []
            result.forEach(user => {
                users.push({
                    _id: user._id,
                    username: user.username
                })
            })
            return res.json(users)
        })
    })
})

app.post('/api/users', (req, res) => {
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
        client.db('exercise-tracker').collection('users').insertOne({ 
            username: req.body.username,
            log: []
         }).then((result) => {
            return res.json({
                username: req.body.username,
                _id: result.insertedId
            })
        })
    })
})

app.post('/api/users/:_id/exercises', (req, res) => {
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
        client.db('exercise-tracker').collection('users').findOne({ _id: ObjectId(req.params._id) }).then((result) => {
            const date = new Date(req.body.date || Date.now()).toDateString()
            console.log(req.body.date)
            const exercise = {
                _id: result._id,
                username: result.username,
                date: date,
                duration: parseInt(req.body.duration),
                description: req.body.description
            }
            client.db('exercise-tracker').collection('users').updateOne({ _id: ObjectId(req.params._id) }, { 
                $push: { 
                    log: {
                        description: exercise.description,
                        duration: exercise.duration,
                        date: exercise.date
                    } 
                } 
            }).then((result) => {return res.json(exercise)})
            
        })
    })
})

app.get('/api/users/:_id/logs', (req, res) => {
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err) 
            return
        }
        client.db('exercise-tracker').collection('users').findOne({ _id: ObjectId(req.params._id) }).then((result) => {
            const log_count = result.log.length
            return res.json({
                _id: result._id,
                username: result.username,
                count: log_count,   
                log: result.log
            })
        })
    })
})

/*
app.get('/api/users', (req, res) => {
    console.log(`Attempting to fetch all users`)
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
        client.db('exercise-tracker').collection('users').find().toArray((err, result) => {
            return res.json(result)
        })
    })
})

app.post('/api/users', (req, res) => {
    console.log(`Attempting to creating user with username ${req.body.username}`)
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
        client.db('exercise-tracker').collection('users').insertOne({
            username: req.body.username ``
        }).then((result) => {
            return res.json({
                username: req.body.username,
                _id: result.insertedId
            })
        })
        
    })
})

app.post('/api/users/:id/exercises', (req, res) => {
    console.log(`Attemping to create exercise for user with id ${req.params.id}`)
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
       client.db('exercise-tracker').collection('users').findOne({ _id: ObjectId(req.params.id) }).then((result) => {
           console.log(result)
           const date = new Date(req.body.date ? req.body.date : Date.now()).toDateString()
           const date_str = date
           let obj = {
                username: result.username,
                date: date_str,
                duration: parseInt(req.body.duration),
                description: req.body.description,
            }
           //client.db('exercise-tracker').collection('exercises').insertOne(obj)
           obj._id = result._id
           return res.json(obj)
       })
    })
})*/

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})