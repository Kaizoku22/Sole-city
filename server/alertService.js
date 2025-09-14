const db = require('./database.js');
const trailObject = require('./createTrailObject.js');
async function createAlertWidgetObject(trailObject){
    let fetchCityNameResult;
    let alert_city;
    let fetchCityNameQuery = `SELECT city_name from ${db.citiesTable} WHERE city_id = $1`;
    try{
        fetchCityNameResult = await db.query(fetchCityNameQuery,[trailObject.city_id]);
        console.log('LOGGING fecthed City Result in alertWidgetObject: ',fetchCityNameResult.rows[0].city_name);
        alert_city = fetchCityNameResult.rows[0].city_name;
    }catch(error){
        console.log('ERROR fetching city_name in createAlertWidgetObject: ',error);
    } 
    let alertWidgetObject;
        alertWidgetObject = {
            trail_id : trailObject.post_id,
            alert_title : trailObject.trail_title,
            alert_author : trailObject.user_name,
            alert_city:alert_city,
        }
    console.log('LOGGING alertWidgetObject:',alertWidgetObject);
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
//        console.log('LOGGING trailObjects in fetchCombinedAlerts : ',trailObjects);

    return trailObjects; 
}


module.exports = {createAlertWidgetObject, fetchCombinedAlerts}
