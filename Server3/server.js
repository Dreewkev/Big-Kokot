const express = require('express')
const app = express()
const mongoose = require("mongoose")
var jwt = require('jsonwebtoken')
var amqp = require('./amqpLib_RoadZ')

async function connectDB(){
    await mongoose.connect(
        "mongodb+srv://drew1:roadz@cluster0.pi9ou.mongodb.net/drew?retryWrites=true&w=majority",
        {useUnifiedTopology: true, useNewUrlParser: true}
    )
    console.log("db connected")
}
connectDB()

//this takes the psot body
app.use(express.json({extended: false }))

app.get('/', (req, res) => res.send('Hello World!'))

//model
var schema = new mongoose.Schema({ email: 'string', username: 'string', birthDate: 'string', password: 'string'})
var User = mongoose.model('User', schema)

/*amqp.connect('amqp://localhost', (err, conn) => {
    conn.createChannel((err, ch) => {
        var queue = 'FirstQueue'
        var message = { type: '2', contect: 'Hello RabbitMQ'}

        ch.assertQueue(queue, {durable: false})
        ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
        console.log("Message was sent")
    })
    setTimeout(() => {
        conn.close()
    }) 
})*/

//signup route api
app.post('/signup', async(req, res) => {
    const  {email, username, birthDate, password} = req.body
    console.log(`${email}:${username}:${birthDate}:${password}`);

    //await amqp.sendDataToQueue('UserRegister', `${email}:${username}:${birthDate}:${password}`);
    //Rabbit MQ muss schauen ob der User bereits registriert ist
    //Callback den User von der datenbank

    let user = await User.findOne({email}) //Direkt über Datenbank

    if(user){
        return res.json({msg: "Email already taken"})
    }
    /*if(user.username){
        return res.json({msg: "Username already taken"})
    }*/

    user = new User({
        email,
        username,
        birthDate,
        password,
    })
    console.log(user)

    await user.save()
    var token = jwt.sign({ id: user.id }, 'password');
    res.json({token: token})
})

//login route api
app.post('/login', async(req, res) => {
    const  {email, username, birthDate, password} = req.body
    console.log(`${email}:${username}:${birthDate}:${password}`);

    let user = await User.findOne({email})
    console.log(user)
    if(!user){
        return res.json({msg: "no user found with that email"})
    }
    if(user.password !== password){
        return res.json({msg: "password is not correct"})
    }

    var token = jwt.sign({ id: user.id }, 'password');
    return res.json({token: token})
})

//private route
app.post('/private', async(req, res) => {
    let token = req.header("token")
    if(!token){
        return res.json({msg: "Sorry, this is a private route"})
    }
    var decoded = jwt.verify(token, 'password');
    console.log(decoded.id) // 721dhbsa8a
    return res.json({msg: "You did it, your in, the token was successfull"})
})

app.listen(5000, () => console.log('Example app listening on port 5000!'))

//TODO: nicht regestrieren wenn null
//TODO: schauen ob username schon vorhanden ist
//gültige eingaben überprüfen
