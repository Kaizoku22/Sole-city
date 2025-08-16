const db = require('./database.js');
const trailObject = require('./createTrailObject.js');
function createAlertWidgetObject(trailObject){
    let alertWidgetObject;
        alertWidgetObject = {
            trail_id : trailObject.post_id,
            alert_title : trailObject.trail_title,
            alert_author : trailObject.user_name
        }
    return alertWidgetObject;
}

async function fetchCombinedAlerts(joined_cities){
    let fetchAlertTrailResult;
    let trailObjects;
    if(joined_cities == undefined || joined_cities.length == 0){
        return false;
    }
    let placeHolder = joined_cities.map((_,i)=> `$${i+1}`).join(',');
    let fetchAlertTrailsQuery =`SELECT * FROM ${db.postsTable} 
        WHERE post_type='Alert'
        AND city_id IN (${placeHolder})
        ORDER BY trail_tstamp DESC`
    try{
        fetchAlertTrailResult = await db.query(fetchAlertTrailsQuery,joined_cities);
//        console.log('LOGGING fetched trails in fetchCombinedAlerts :',fetchAlertTrailResult);
    }catch(error){
        console.log('ERROR fetching trails in fetchCombinedAlerts',error);
        }
        let trails = fetchAlertTrailResult.rows;
        trailObjects = await Promise.all(trails.map(async(trail) => await trailObject.createTrailObject(trail)));
        console.log('LOGGING trailObjects in fetchCombinedAlerts : ',trailObjects);

    return trailObjects; 
}


module.exports = {createAlertWidgetObject, fetchCombinedAlerts}
