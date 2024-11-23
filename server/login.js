
const db = require('./database.js');

const router = require('express').Router();
const {scryptSync, randomBytes} = require('crypto');

router.get('/',async (req,res) => {
    res.render('login');
});

router.post('/',async (req,res) =>{
    console.log(req.body);

    try{
        let result = await db.query('SELECT * from app_users WHERE user_email = $1',[req.body.email]);
        console.log(result.rows[0]);
      if(result.rows[0] === undefined){
            res.status(404).send('user not found try again with different email');
      }else {

        let user = await db.query(`SELECT user_uid FROM ${db.usersTable} WHERE user_email = $1`,[req.body.email]);
        console.log(user); 
        let user_uid = user.rows[0].user_uid ;
        //creating the hash for the user password
        const hashedPass = db.hash(req.body.password);
        const salt = await db.query(`SELECT pass_salt FROM ${db.passTable} WHERE user_uid = $1`,[user.rows[0].user_uid]);
        const finalHash = scryptSync(hashedPass,salt.rows[0].pass_salt,64);
        const retrievedHash = await db.query(`SELECT pass_hash from ${db.passTable} WHERE user_uid = $1`,[user.rows[0].user_uid]);
         
        console.log(finalHash);
        console.log(retrievedHash.rows[0].pass_hash);
        const date = new Date();
          if(finalHash.toString == retrievedHash.rows[0].pass_hash.toString){
              console.log('user logged in');
         //creating session
              console.log(date);
              
              let  pSessionQuery = {
                text : `INSERT INTO ${db.sessionTable}(session_id,user_uid,role)values(uuid_generate_v4(),$1,$2)`,
                values : [user_uid,'user'],
              }
              let sessionResult = await db.query(pSessionQuery);
              let sessionRow = await db.query(`SELECT * FROM ${db.sessionTable} WHERE user_uid = $1`,[user_uid]);
              console.log(sessionRow.rows[0]);
              res.cookie('session',sessionRow.rows[0].session_id,{secure:true , httpOnly:true});
            res.send('user logged in');
          }
         

      }
      
    }
    catch(err){
        console.log(err);
    }
});

router.get('/register',(req,res) => {
    res.redirect('/register');
});

module.exports = router;



