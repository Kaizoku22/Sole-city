const db = require('./database.js');
const router = require('express').Router();

router.use(checkSession);
router.get('/',async function(req,res){
    let sessionQuery = await db.query(`SELECT * FROM ${db.sessionTable} WHERE session_id = '${req.cookies.session}'`);
    console.log(sessionQuery.rows[0]);
    
    let fetchedUserQuery = await db.query(`SELECT * FROM ${db.usersTable} WHERE user_uid = '${sessionQuery.rows[0].user_uid}'`);
    let fetchedUser = fetchedUserQuery.rows[0];
    console.log('Fetched User result -',fetchedUser);

    //fetching cities_data
    let fetchedCities = await db.query(`SELECT city_id,city_name 
        FROM ${db.citiesTable};`);
    //logging fetched result object 
   // console.log(fetchedCities.rows);
        
       res.render('index',
        {
            title:"Sole-City",
            user: fetchedUser,
            cities:fetchedCities.rows,
        });
    
})

router.get('/getPosts',async(req,res) =>{
      let result = await db.query(`SELECT * FROM ${db.postsTable}`);
    res.render('postList',result.rows[0]);
} );

router.get('/trial',(req,res)=>{
    res.render('trial');

});


module.exports = router;


async function checkSession(req,res,next){ 
    console.log(req.path);
    if(req.path == '/login'|| req.path=='/register'){
        next();
        return;

    }

    if(req.cookies.session == null){
        res.redirect('/login');
        return;
    }
    else{
        next();

    }
}
