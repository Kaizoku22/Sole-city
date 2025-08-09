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


router.post('/:city_name/trails',upload.array('trailImages',10),async (req,res) =>{
    console.log(req.files);
   
 //      let url = await db.uploadMedia('postID',req.file);
        let images = await db.uploadMultipleMedia('postID',req.files);
        console.log('url array before rendering : ')
        console.log(images);
        res.render('showImage',{images:images});

//        req.files.forEach(async (file) => {
//           let url = await db.uploadMedia('postID',file);
//           images.push(url);
//       }); 
//        await a ;
      
         
        
});

module.exports = router;


