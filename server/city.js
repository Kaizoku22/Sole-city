const router = require('express').Router();
const fs = require('fs');
const multer  = require('multer');
const storage =  multer.memoryStorage();
const upload = multer({ storage: storage });


const db = require('./database.js');
const header = require('./header.js');
const alertService = require('./alertService.js');



router.get('/:city_name',async (req,res)=>{
    let alertWidgetsList;
    let fetchTrailTypeQuery = await db.query(`SELECT * from ${db.trailType}`);
    let trailTypes = fetchTrailTypeQuery.rows;
    console.log(trailTypes);
    let fetchCityRow = await db.query(`SELECT * FROM ${db.citiesTable} WHERE city_name = '${req.params.city_name}'`);
//    console.log(fetchCityRow.rows[0]);
    let fetchedTrails;
    try{

        let fetchTrailsQuery = {
            text:`SELECT * FROM ${db.postsTable} WHERE city_id=$1`,
            values:[fetchCityRow.rows[0].city_id],
            }
        let fetchTrailsQueryResult = await db.query(fetchTrailsQuery);
        fetchedTrails = fetchTrailsQueryResult.rows;
//        console.log('LOGGING fetched Trails : ', fetchTrailsQueryResult.rows);
        }catch(error){
        console.log('ERROR fetching trails from database :',error);
        }       
        let trailObjectList = await Promise.all(
            fetchedTrails.map(async (trail)=>{
            let userName;
            let completeTrailObject;
            try{
                let fetchUserName = await db.query(`SELECT user_display_name from ${db.usersTable} WHERE user_uid = $1`,[trail.user_uid]); 
                userName= fetchUserName.rows[0].user_display_name;
//              console.log(fetchUserName);
                }catch(error){
                    console.log('ERROR fetching userName in fetch trails :',error);
                }
            completeTrailObject=
                {   
                post_id:trail.post_id,
                user_uid:trail.user_uid,
                user_name:userName,
                city_id:trail.city_id,
                post_type:trail.post_type,
                trail_title:trail.trail_title,
                post_content:trail.post_content,
                trail_media:trail.trail_media,
                trail_tstamp:trail.trail_tstamp
                
                }
            return completeTrailObject;
            })
        );
//    console.log(trailObjectList);

//creating alertsList to show on alertWidgets 
    alertWidgetsList = trailObjectList
        .filter(trail => trail.post_type="Alert")
        .map(trail => alertService.createAlertWidgetObject(trail));
    
    console.log('LOGGING alertWidgetList :',alertWidgetsList);

    const isHtmx = req.get('HX-Request') === 'true';
    if (isHtmx) {
        res.render('cityPage', {  
            city: fetchCityRow.rows[0],
            trails: trailObjectList,
            trailTypes:trailTypes,
            alerts:alertWidgetsList
        });
    } else {
        let headerData = await header.fetchHeaderObject(req.cookies.session);
        res.render('completeCityPage', {
            headerData: headerData,
            city: fetchCityRow.rows[0],
            trails: trailObjectList,
            trailTypes:trailTypes,
            alerts:alertWidgetsList
        });
    }

});


router.post('/:city_name',async (req,res) =>{

    console.log(req.body.city_id);
    let fetchCityQuery = await db.query(`SELECT * FROM cities_data 
        WHERE city_id = '${req.params.city_id}'`);
    //logging fetchedResult
    //console.log(fetchCityQuery);
    let city_name = fetchCityQuery.rows[0].city_name; 
    //logging fetched city name
    //console.log(city_name);
    res.redirect(`/city/${city_name}`);


});

router.get('/:city_name/trails',async(req,res)=>{  
    res.render('createTrail',{
        city_name : req.params.city_name,
    });
});

//create Trail : 
router.post('/:city_name/trails',upload.array('trailImages',10),async (req,res) =>{
    console.log('post trail req body:',req.body);
    console.log('post trail type :',req.body.trailType);
//    console.log(req.files);
    const user = await db.fetchUserData(`${req.cookies.session}`);
//    console.log('user_id fetched from db:',user);
    const createTrailQuery = {
        text:`INSERT into ${db.postsTable}
        (post_id,user_uid,city_id,post_type,trail_title,post_content,trail_media,trail_tstamp)
        values(uuid_generate_v4(),$1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP) RETURNING post_id`,     
        values:[user.user_uid,req.body.city_id,req.body.trailType,req.body.postTitle,req.body.content,[]],
    };
    let post_id;
    try{
    const createTrailResult = await db.query(createTrailQuery);
    post_id = createTrailResult.rows[0].post_id;
//    console.log('LOGGING post_id returnded after createTrailResult',post_id);
//    console.log('createTrail Result Object',createTrailResult);
   
    }catch(error){
        console.log('ERROR in CreateTrailQuery : ',error);
    }


        let images = await db.uploadMultipleMedia(post_id,req.files);
        if (!Array.isArray(images)) {
        // Handle error: images is an error object
        res.send(images.message || 'Unknown upload error');
        return;
    }

//        console.log('url array before rendering : ')
//        console.log(images);
        try{
            const updateMediaLinks = await db.query(`UPDATE ${db.postsTable} SET trail_media = $1 WHERE post_id = $2`,[images, post_id]);
//            console.log('LOGGING the result of updateMediaLinks',updateMediaLinks);
        }catch(error){
            console.log('ERROR updating the media links in posts table',error);
        }
        const getPost =  await db.query(`SELECT * from ${db.postsTable} WHERE post_id=$1`,[post_id]);
//        console.log('LOGGING the complete Trail Object :' ,getPost.rows[0]);
                res.render('showImage',{images:images});
});

module.exports = router;


