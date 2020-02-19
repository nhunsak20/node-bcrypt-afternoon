const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const { username, password, isAdmin } = req.body
        const db = req.app.get('db');
        const result = await db.get_user([username])

        if(result[0]) {
            res.status(409).send('Username taken')
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        const registeredUser = await db.register_user([isAdmin, username, hash])
        const user = registeredUser[0]

        req.session.user = {
            isAdmin: user.is_admin,
            username: user.username,
            id: user.id
        }

        return res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const { username, password } = req.body
        const db = req.app.get('db')

        const userFound = await db.get_user([username])
        const user = userFound[0]

        if(!userFound[0]) {
            res.status(401).status('User not found. Please register as a new user begore loggin in.')
        }

        const isAuthenticated = bcrypt.compareSync(password, user.hash)

        if(!isAuthenticated) {
            res.status(403).send('Incorrect password')
        }

        req.session.user = {
            isAdmin: user.is_admin,
            username: user.username,
            id: user.id
        }

        return res.status(200).send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    }
}