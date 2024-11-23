
const db = require('./database.js');
const {scryptSync, randomBytes} = require('crypto');
const router = require('express').Router();


router.get('/', async(req,res) => {
	res.render('registerNewUser');
});
    
router.post('/',async(req,res) => {
    console.log(req.body);
    try{

        let pquery = {
            text : `INSERT INTO ${db.usersTable}(user_uid,user_first_name,user_last_name,user_display_name,user_email) values(uuid_generate_v4(),$1,$2,$3,$4)`,
            values : [req.body.first_name,req.body.last_name,req.body.display_name,req.body.email],
        }
        let result = await db.query(pquery);

        let user = await db.query(`SELECT user_uid FROM ${db.usersTable} WHERE user_email = $1`,[req.body.email]);
        console.log(user); 
        //creating the hash for the user password
        const hashedPass = db.hash(req.body.password);

        const salt = randomBytes(16).toString('hex');
        const finalHash = scryptSync(hashedPass,salt,64);
        
        let passQuery = await db.query(`INSERT INTO ${db.passTable}(user_uid,pass_hash,pass_salt) values($1,$2,$3)`,[user.rows[0].user_uid,finalHash,salt]);
        console.log(passQuery.rows[0]);
        res.send('User Created Successfully!');

    }catch(err){
    console.log(err);
        res.send('Error Creating user please try again');

    }
});


module.exports = router;
