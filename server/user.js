
const db = require('./database.js');
const router = require('express').Router();
const trailObject = require('./createTrailObject.js');

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
            res.send(`<p>Joined</p>`); 

            }else{
                db.query(`UPDATE ${db.usersTable}
                    set joined_cities = array_append(joined_cities,'${req.body.city_id}') 
                    WHERE user_uid = '${fetchedUser.rows[0].user_uid}'`);
                console.log('Append Done');
                res.send(`<p>Joined</p>`); 
                }
        }
       });

router.get('/profile',async(req,res) =>{
    let fetchUserTrailsResult;
    let trailObjectList;
    let fetched_joined_cities;
    let user = await db.fetchUserData(req.cookies.session);
    try{
        //fetching user trails
        fetchUserTrailsResult = await db.query(`SELECT * FROM ${db.postsTable} WHERE user_uid=$1`,[user.user_uid]);
        let userTrails = fetchUserTrailsResult.rows;
        console.log('LOGGING user trails in profile:',userTrails); 
        trailObjectList = await Promise.all(userTrails.map(async trail => await trailObject.createTrailObject(trail)));
        
        //fetching joined_cities
        let placeholder = await user.joined_cities.map((_,i) => `$${i+1}`).join(',');
        console.log(user.joined_cities);
        console.log(placeholder);
        let fetchJoinedCities = await db.query(`SELECT * FROM ${db.citiesTable} WHERE city_id IN (${ placeholder })`,user.joined_cities);
        fetched_joined_cities = fetchJoinedCities.rows;
        console.log('LOGGING fetchJoinedCities in Profile:',fetchJoinedCities.rows);


    }catch(error){
        console.log('ERROR fetching user data in profilePage',error);
    }
//    console.log('LOGGING trailObjects fetched for profile:',trailObjectList);
//    console.log('LOGGING fetched_cities for profile : ',fetched_joined_cities); 
    res.render('profilePage',{ 
        user:user, 
        inspecting:false,
        joined_cities:fetched_joined_cities,
        trails:trailObjectList});    
});

router.get('/:userName/profile',async(req,res)=>{
    console.log(req.params.userName);
    let user;
    let fetchUser;
    let sessionUser;
    try{
        fetchUser = await db.query(`SELECT * FROM ${db.usersTable} WHERE user_display_name= $1`,[req.params.userName]); 
        sessionUser = await db.fetchUserData(req.cookies.session);
    }catch(error){
        console.log('ERROR fetching user for profile:',error);
    }
    user = fetchUser.rows[0];
    console.log('LOGGING fetched user : ',user);
    if(sessionUser.user_uid == user.user_uid){
        res.redirect('/user/profile');
    }
    else{
            let fetchUserTrailsResult;
            let trailObjectList;
            let fetched_joined_cities;
            try{
                //fetching user trails
                fetchUserTrailsResult = await db.query(`SELECT * FROM ${db.postsTable} WHERE user_uid=$1`,[user.user_uid]);
                let userTrails = fetchUserTrailsResult.rows;
                console.log('LOGGING user trails in profile:',userTrails); 
                trailObjectList = await Promise.all(userTrails.map(async trail => await trailObject.createTrailObject(trail)));
                
                //fetching joined_cities
                let placeholder = await user.joined_cities.map((_,i) => `$${i+1}`).join(',');
                console.log(user.joined_cities);
                console.log(placeholder);
                let fetchJoinedCities = await db.query(`SELECT * FROM ${db.citiesTable} WHERE city_id IN (${ placeholder })`,user.joined_cities);
                fetched_joined_cities = fetchJoinedCities.rows;
                console.log('LOGGING fetchJoinedCities in Profile:',fetchJoinedCities.rows);


            }catch(error){
                console.log('ERROR fetching user data in profilePage',error);
            }
        //    console.log('LOGGING trailObjects fetched for profile:',trailObjectList);
        //    console.log('LOGGING fetched_cities for profile : ',fetched_joined_cities); 
            res.render('profilePage',{ 
                user:user, 
                inspecting:true,
                joined_cities:fetched_joined_cities,
                trails:trailObjectList});    

            }
 });


module.exports = router;
