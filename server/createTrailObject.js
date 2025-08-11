const db = require('./database.js');
async function createTrailObject(trail){
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
    }

module.exports ={createTrailObject,};


