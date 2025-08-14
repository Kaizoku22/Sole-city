const db = require('./database.js');
async function fetchHeaderObject(session_id){
    try{
        
        let userData = await db.fetchUserData(session_id);
        let title = "Sole-City";
        let headerData = {
            user: userData,
            title:title
        }

        return headerData;
    }
    catch(error){
        console.log('ERROR in fetchHeaderObject :',error);
    }
}

module.exports = {fetchHeaderObject,}
