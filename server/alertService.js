const db = require('./database.js');

function createAlertWidgetObject(trailObject){
    let alertWidgetObject;
        alertWidgetObject = {
            trail_id : trailObject.post_id,
            alert_title : trailObject.trail_title,
            alert_author : trailObject.user_name
        }
    return alertWidgetObject;
}

module.exports = {createAlertWidgetObject,}
