const db = require('./database.js');
const router = require('express').Router();
const fs = require('fs');
const multer  = require('multer');
const storage =  multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/:city_name',async (req,res)=>{
    let fetchCityRow = await db.query(`SELECT * FROM ${db.citiesTable} WHERE city_name = '${req.params.city_name}'`);
    console.log(fetchCityRow.rows[0]);
    res.render('cityPage',
    {
        city: fetchCityRow.rows[0],
    });
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
//    console.log('post trail req body:',req.body);
//    console.log(req.files);
    const user = await db.fetchUserData(`${req.cookies.session}`);
//    console.log('user_id fetched from db:',user);
    const createTrailQuery = {
        text:`INSERT into ${db.postsTable}
        (post_id,user_uid,city_id,post_type,post_content,trail_media,trail_tstamp)
        values(uuid_generate_v4(),$1,$2,$3,$4,$5,CURRENT_TIMESTAMP) RETURNING post_id`,     
        values:[user.user_uid,req.body.city_id,'text and media',req.body.content,[]],
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


