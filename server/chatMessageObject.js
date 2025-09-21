const db = require('./database.js');

async function createMessageObject(messageObj,userID){
    let obj = messageObj;
    if(obj.sender_id == userID){
        obj.divClass ='sent';
    }else{
        obj.divClass ='received';
    }
    console.log('LOGGING modified obj in createMessageObj : ', obj);
    return obj;
}


module.exports = {createMessageObject}
