const db = require('./database.js');
async function createTrailObject(trail){
            let userName;
            let profilepic;
            let cityName;
            let completeTrailObject;
            let trailLocationString;
            try{
                let fetchUserName = await db.query(`SELECT user_display_name,profile_picture from ${db.usersTable} WHERE user_uid = $1`,[trail.user_uid]); 
                userName= fetchUserName.rows[0].user_display_name;
                profilepic = fetchUserName.rows[0].profile_picture;
//                console.log(profilepic);
//              console.log(fetchUserName);
                let fetchCityName = await db.query(`SELECT city_name from ${db.citiesTable} WHERE city_id = $1`,[trail.city_id]);
                cityName = fetchCityName.rows[0].city_name;
//                console.log('LOGGING location object in createTrailLocation: ',JSON.stringify(trail.trail_location));
                trailLocationString = JSON.stringify(trail.trail_location);
                }catch(error){
                    console.log('ERROR fetching userName in fetch trails :',error);
                }
            completeTrailObject=
                {   
                post_id:trail.post_id,
                user_uid:trail.user_uid,
                user_name:userName,
                user_profile_pic:profilepic,
                city_id:trail.city_id,
                city_name:cityName,
                post_type:trail.post_type,
                trail_title:trail.trail_title,
                post_content:trail.post_content,
                trail_media:trail.trail_media,
                trail_tstamp:trail.trail_tstamp,
                trail_location:trailLocationString,
                }
            return completeTrailObject;
    }

module.exports ={createTrailObject,};


