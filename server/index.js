const viewdir = '/home/kaizoku/home/web_dev/sole-city/client/views';
const app = require('express')();
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
const express =require('express');
const PORT = 3000;
const db = require('./database.js');
const path = require('path');


require("dotenv").config();



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
async function main(){
app.use('/',home);
app.use('/login',login);
app.use('/register',registerUser);
app.use('/city',cityPage);
app.use('/user',user);
app.listen(PORT,()=>{
    console.log(`connected to port ${PORT}`)

});
}

main(); 

