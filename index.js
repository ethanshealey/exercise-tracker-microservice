const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
const MongoClient = require('mongodb').MongoClient

dotenv.config()

const app = express();

app.use(express.json())
app.use(express.urlencoded())
app.use(cors({optionSuccessStatus: 200}))

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile('./public/index.html', { root: __dirname })
})

app.post('/api/users', (req, res) => {
    console.log(`Attempting to creating user with username ${req.body.username}`)
    MongoClient.connect(process.env.MONGO_URI, (err, client) => {
        if(err) {
            console.log(err)
            return
        }
        console.log('got connection')
        const result = client.db('exercise-tracker').collection('users').insertOne({
            username: req.body.username
        })
        console.log(`Result: ${result}`)
    })
})

app.post('/api/users/:id/exercises', (req, res) => {
    console.log(`Getting exercises for user with id ${req.params.id}`)
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})