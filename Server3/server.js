const express = require('express')
const app = express()
const mysql = require('mysql')
const dotenv = require('dotenv')
var jwt = require('jsonwebtoken')

dotenv.config({ path: './.env' })

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT
})

db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MySQL connected! :)))")
    }
})

//this takes the psot body
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('Hello World!'))

//signup route api
app.post('/signup', async (req, res) => {
    const { fname, lname, username, email, password, birthDate, phonenumber, secretquestion, secretanswer } = req.body
    console.log(`${fname}:${lname}:${username}:${email}:${password}:${birthDate}:${phonenumber}:${secretquestion}:${secretanswer}`);

    db.query('SELECT email FROM roadzuser WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error)
        }
        
        console.log(results[0])
        if (results.length > 0) {
            return res.json({ msg: "Email already taken" })
        }

        db.query(`INSERT INTO roadzuser (fname,lname,username,email,pwhash,dob,phonenumber,secretquestion,secretanswer) VALUES ("${fname}", "${lname}", "${username}", "${email}", "${password}", "${birthDate}", "${phonenumber}", "${secretquestion}", "${secretanswer}");`, (error, results2) => {
            if (error) {
                console.log(error)
            } else {
                console.log(results2)
                return res.json('User registered')
            }
        })
    })
})

//login route api
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password){
            return res.json({msg: "Please provide an email and a password"})
        }

        db.query('SELECT email, pwhash FROM roadzuser WHERE email = ?', [email], async(error, results) =>{
            if (error) {
                console.log(error)
            }

            console.log('User logging in: ', results)
            if(!results || password !== results[0].pwhash){
                res.json({ msg: "Email or the password is incorrect"})
            }else{
                const id = results[0].id;

                var token = jwt.sign({ id }, 'password')
                console.log("Token:", token)
                return res.json({ token: token })
            }
        })

        

    } catch (error) {
        console.log(error)
    }  
})

//private route
app.post('/private', async (req, res) => {
    let token = req.header("token")
    if (!token) {
        return res.json({ msg: "Sorry, this is a private route" })
    }
    var decoded = jwt.verify(token, 'password');
    console.log(decoded.id) // 721dhbsa8a
    return res.json({ msg: "You did it, your in, the token was successfull" })
})

app.listen(5000, () => console.log('Example app listening on port 5000!'))

//TODO: nicht regestrieren wenn null
//TODO: schauen ob username schon vorhanden ist
//gültige eingaben überprüfen
