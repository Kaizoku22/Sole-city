const viewdir = '/home/kaizoku/home/web_dev/sole-city/client/views';
const app = require('express')();
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
const express =require('express');
const db = require('./database.js');
const path = require('path');
const http = require('http');
const {Server} = require('socket.io');

require("dotenv").config();

const port = process.env.PORT;


//websocket config
const server = http.createServer(app);
const io = new Server(server);
module.exports = {io}

io.on('connection',socket =>{
    console.log(`connected to socket: `,socket.id);
    
    socket.on('sendMessage',(obj)=>{
        console.log('user send message:',obj);
        socket.broadcast.emit('receiveMessage',obj);
    });

    socket.on('disconnect',() => {
    console.log('user disconnected') 
    })
})

app.set('view engine','mustache' );
app.set('views',viewdir)
app.engine('mustache', mustacheExpress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(process.env.SRC_FOLDER));


const home = require('./home.js');
const login = require('./login.js'); 
const registerUser = require('./registerUser.js');
const cityPage = require('./city.js');
const user = require('./user.js');
const chat = require('./chat.js');


async function main(){
app.use('/',home);
app.use('/login',login);
app.use('/register',registerUser);
app.use('/city',cityPage);
app.use('/user',user);
app.use('/chat',chat);


server.listen(port,()=>{
    console.log(`connected to port ${port}`)

});
}

main(); 
