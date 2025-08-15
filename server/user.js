
const db = require('./database.js');
const router = require('express').Router();


router.post('/joinedCities', async(req,res) => {

    //remember to set exists check later
        console.log('The city_id to join:', req.body.city_id);
        let fetchedUser = await db.query(
            `SELECT user_uid from ${db.sessionTable}
            WHERE session_id='${req.cookies.session}'`);
        console.log(fetchedUser.rows[0].user_uid);
        let fetchedUserResult = await db.query(`SELECT * FROM ${db.usersTable} WHERE user_uid ='${fetchedUser.rows[0].user_uid}'`);
        let userJoinedCities = fetchedUserResult.rows[0].joinded_cities;
        console.log('user result',fetchedUserResult.rows[0].joined_cities);
        if(fetchedUserResult.rows[0].joined_cities == null){
            db.query(`UPDATE ${db.usersTable} set joined_cities = '{${req.body.city_id}}' WHERE user_uid = '${fetchedUser.rows[0].user_uid}'`);
            console.log('insert Done');
        }
        else{
            if(fetchedUserResult.rows[0].joined_cities.includes(`${req.body.city_id}`)){
                console.log(`Already joined ${req.body.city_id}`);
            }else{
                db.query(`UPDATE ${db.usersTable}
                    set joined_cities = array_append(joined_cities,'${req.body.city_id}') 
                    WHERE user_uid = '${fetchedUser.rows[0].user_uid}'`);
                console.log('Append Done');

            }

        }
        
              res.status(200).json({
            message:`${req.body.city_id} inserted successfully`
        });
});

router.get('/profile',async(req,res) =>{
        console.log('LOGGING the session cookie in profile : ',req.cookies.session);
    let user = await db.fetchUserData(req.cookies.session);
    console.log('LOGGING the fetched User in profile: ',user);
    

        res.render('profilePage',user);
});

module.exports = router;
