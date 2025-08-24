const db = require('./database.js');

async function createObject(user_uid,chatRoomData){
    let modifiedObject = chatRoomData;
    let members = chatRoomData.members;
    let receiverID;

    if(!chatRoomData.is_group_chat){
        let receiverData;
        for(const ID of members){
            if(ID != user_uid){
            receiverID = ID;
            }
        }
        const res = await db.query(`SELECT * FROM ${db.usersTable} WHERE user_uid = $1`,[receiverID]);
        receiverData = res.rows[0];
        modifiedObject.chat_room_name = receiverData.user_display_name;
        modifiedObject.chat_room_profile = receiverData.profile_picture;
//        console.log('LOGGING modified Object for personal Chat: ',modifiedObject);

        return modifiedObject;
    }
    return modifiedObject;
};

module.exports = {createObject};
