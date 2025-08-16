
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
        const fetchedCities = await db.query(
            `SELECT city_id, city_name FROM ${db.citiesTable};`
        );        
        const headerData = await header.fetchHeaderObject(req.cookies.session);
        res.render('homepage', {
            headerData:headerData,
            cities: fetchedCities.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/trailwall',async(req,res)=>{
    let fetchedUser;
    let trailWall;
   try{
        fetchedUser = await db.fetchUserData(req.cookies.session);
        trailWall = await createTrailWall(fetchedUser);
   }catch(error){
    console.log('ERROR fetching trailWall in home:',error);
   }
    res.render('trailWall',{trails:trailWall});

});

router.get('/alerts',async(req,res)=>{
    let alerts;
    try{
        const fetchedUser = await db.fetchUserData(req.cookies.session);
        alerts = await alertService.fetchCombinedAlerts(fetchedUser.joined_cities);
            }
    catch(error){
        console.log('ERROR Fetching alerts for homepage :',error);
    }
    if(!alerts || alerts.length === 0){
            res.render('alertsList',[]);
        }else{
            let alertsWidgetList = alerts.map(alert => alertService.createAlertWidgetObject(alert));
            console.log('LOGGING alertsWidgetList in home : ',alertsWidgetList);
            res.render('alertsList',{alerts:alertsWidgetList});
        }

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
