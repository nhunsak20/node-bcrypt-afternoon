require('dotenv').config()
const express = require('express'),
    session = require('express-session'),
    massive = require('massive'),
    authCtrl = require('./controllers/authController'),
    treasureCtrl = require('./controllers/treasureController'),
    auth = require('./middleware/authMiddleware'),
    app = express(),
    { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env

app.use(express.json())

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: SESSION_SECRET
}))

app.post('/auth/register', authCtrl.register)
app.post('/auth/login', authCtrl.login)
app.get('/auth/logout', authCtrl.logout)

app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure)
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure)
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure)
app.get('/api/treasure/all', auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure)

massive({
    connectionString: CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
}).then(dbObj => {
    app.set('db', dbObj)
    
    app.listen(SERVER_PORT, () => console.log(`Server running port: ${SERVER_PORT}`))
})



