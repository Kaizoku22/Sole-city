const db = require('./database.js');
const router = require('express').Router();
const trailObject = require('./createTrailObject.js');
router.use(checkSession);

router.get('/', async function(req, res) {
    try {
        const sessionQuery = await db.query(
            `SELECT * FROM ${db.sessionTable} WHERE session_id = $1`,
            [req.cookies.session]
        );
        const fetchedUserQuery = await db.query(
            `SELECT * FROM ${db.usersTable} WHERE user_uid = $1`,
            [sessionQuery.rows[0].user_uid]
        );
        const fetchedUser = fetchedUserQuery.rows[0];

        async function createTrailWall(fetchedUser) {
            const joinedCities = fetchedUser.joined_cities;
            if (!joinedCities || joinedCities.length === 0) return [];

            const placeholders = joinedCities.map((_, i) => `$${i + 1}`).join(',');
            const query = `
                SELECT *
                FROM ${db.postsTable}
                WHERE city_id IN (${placeholders})
                ORDER BY trail_tstamp DESC
            `;

            const fetchTrailsQuery = await db.query(query, joinedCities);

            // Wait for all trail objects if async
            const modifiedPosts = await Promise.all(
                fetchTrailsQuery.rows.map(trail =>
                    trailObject.createTrailObject(trail)
                )
            );

            return modifiedPosts;
        }

        const fetchedCities = await db.query(
            `SELECT city_id, city_name FROM ${db.citiesTable};`
        );

        const trailWall = await createTrailWall(fetchedUser);
        console.log(trailWall); // This should now be an array of objects, not Promises

        res.render('index', {
            title: "Sole-City",
            user: fetchedUser,
            cities: fetchedCities.rows,
            trails: trailWall
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
