
const router = require('express').Router();


const trailObject = require('./createTrailObject.js');
const db = require('./database.js');
const header = require('./header.js');
const alertService = require('./alertService.js');


router.use(checkSession);

async function createTrailWall(fetchedUser) {
    const joinedCities = fetchedUser.joined_cities;
    if (!joinedCities || joinedCities.length === 0) return [];
    const placeholders = joinedCities.map((_, i) => `$${i + 1}`).join(',');
    const query = `
        SELECT *
        FROM ${db.postsTable}
        WHERE city_id IN (${placeholders})
        ORDER BY trail_tstamp DESC`;

    const fetchTrailsQuery = await db.query(query, joinedCities);

    // Wait for all trail objects if async
    const modifiedPosts = await Promise.all(
        fetchTrailsQuery.rows.map(trail =>
            trailObject.createTrailObject(trail)
        )
    );

    return modifiedPosts;
}

router.get('/', async function(req, res) {
    try {
        const fetchedUser = await db.fetchUserData(req.cookies.session);
        const fetchedCities = await db.query(
            `SELECT city_id, city_name FROM ${db.citiesTable};`
        );
        const alerts = await alertService.fetchCombinedAlerts(fetchedUser.joined_cities);
        console.log('LOGGING fetched alerts in home : ',alerts);
        const alertsWidgetList = alerts.map(alert => alertService.createAlertWidgetObject(alert));
        console.log('LOGGING alertsWidgetList in home : ',alertsWidgetList);
        const trailWall = await createTrailWall(fetchedUser);
//        console.log(trailWall); // This should now be an array of objects, not Promises
        const headerData = await header.fetchHeaderObject(req.cookies.session);
        res.render('homepage', {
            headerData:headerData,
            cities: fetchedCities.rows,
            trails: trailWall,
            alerts:alertsWidgetList
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


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
