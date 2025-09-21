const db = require('./database.js');
const chatRoomObject = require('./createChatRoomWidgetObject.js');
const router = require('express').Router();
const messageObject = require('./chatMessageObject.js');


router.get('/',async (req,res)=>{
    const user = await db.fetchUserData(req.cookies.session);
    let chatRoomList =[];

//    console.log('Users chatrooms:',user.joined_chat_rooms);
    if(user.joined_chat_rooms == null){
        res.render('chatRoomList',{chatRoomsList:user.joined_chat_rooms});
        return;
    }

    //fetcing ChatRooms from Database
    const fetchChatRoomQuery = `SELECT * from ${db.chatroomTable} 
                                WHERE chat_room_id = $1`;
    for(const roomID of user.joined_chat_rooms){
       try{
           let res = await db.query(fetchChatRoomQuery,[roomID]); 
           let chatRoomData = res.rows[0];
//           console.log('LOGGING chatRoomData: ',chatRoomData);
           let completeObject = await chatRoomObject.createObject(user.user_uid,chatRoomData);
           chatRoomList.push(completeObject);
             
       }catch(error){
            console.log(`ERROR Fetching chatRoom for id :${roomID} : `,error)
       }
    }
//    console.log(chatRoomList);
    res.render('chatRoomList',{chatRoomsList:chatRoomList});
});

router.post('/',async (req,res)=>{

    const user = await db.fetchUserData(req.cookies.session);
    let chatRoom;

//    console.log('LOGGING user id to create chatroom 1:',user.user_uid);
//     console.log('LOGGING user id to create chatroom 2:',req.body.chatWith);
    let exists = await checkIfChatExists(user,req.body.chatWith);
    if(exists){
        res.send('Already has chat');
        return;
    }
    try{
        chatRoom = await createChatRoom([user.user_uid,req.body.chatWith],false); 
//        console.log('LOGGING createdChatRoom ID: ',chatRoom);
        let updateUsers = await pushChatRoomToUsers([user.user_uid,req.body.chatWith],chatRoom);
        if(updateUsers){
        res.status(200).set('HX-Redirect',"/").send();
        }

    }catch(error){
        console.log('ERROR creating chatRoom',error);
        res.status(500).send('could not start a chat please try again later');
    }     
});


router.get('/:chat_room_id',async(req,res)=>{
    let user = await db.fetchUserData(req.cookies.session);
    let chatRoom;
    let chatMessages;
    try{
        let response = await db.query(`SELECT * FROM ${db.chatroomTable} WHERE chat_room_id = $1`,[req.params.chat_room_id]);
        chatRoom = await chatRoomObject.createObject(user.user_uid,response.rows[0]);
        console.log('LOGGING chatRoom object: ',chatRoom);
        let getMessagesResponse = await db.query(`SELECT * FROM ${db.messagesTable} WHERE chat_room_id = $1`,[req.params.chat_room_id]);
        chatMessages = getMessagesResponse.rows;
        console.log('LOGGING messages from chatRoom : ',chatMessages);
        const modifiedChatMessages = Promise.all(chatMessages.map((obj)=>{return messageObject.createMessageObject(obj,user.user_uid)}));
        console.log('LOGGING messages after modification: ',modifiedChatMessages);
    }catch(error){
        console.log('ERROR fetching chat room',error);
    }

    res.render('chatWindow',{chatRoom:chatRoom,senderID:user.user_uid,chatRoomMessages:chatMessages});
});

async function createChatRoom(members,isGroupChat,chatRoomName,chatRoomProfile){
        let createChatRoomQuery = `INSERT INTO ${db.chatroomTable} 
            (chat_room_id, members, is_group_chat,chat_room_name, chat_room_profile)
            VALUES (uuid_generate_v4(),$1,$2,$3,$4)
            RETURNING chat_room_id`;
        try{
            let result = await db.query(createChatRoomQuery,[members,isGroupChat,chatRoomName,chatRoomProfile])
            return result.rows[0].chat_room_id;
        }catch(error){
            console.log('ERROR inserting data into chatroom table in createChatRoom:',error);
            return error;
        }
}

async function pushChatRoomToUsers(users,chatroomID){
    const pushTouserQuery = `UPDATE ${db.usersTable} 
        SET joined_chat_rooms = array_append(joined_chat_rooms,'${chatroomID}')
        WHERE user_uid = $1`;
    for(const user of users){
//        console.log('LOGGING user in forloop: ',user);
        try{
           const res = await db.query(pushTouserQuery,[user]);
        }
        catch(error){
            console.log('ERROR pushing the chatRoomId to user : ',user);
            return false;
        }
    }
}

async function checkIfChatExists(user,chatWithID){
    const chatRooms = user.joined_chat_rooms; 
    if(chatRooms === null){
    return false;
    }
    console.log(chatRooms)
    const fetchChatRoomQuery = `SELECT * FROM ${db.chatroomTable}
        WHERE chat_room_id = $1`;
    let chatRoomMembers;
    for(const chatroom of chatRooms){
       try{
            let res = await db.query(fetchChatRoomQuery,[chatroom]);
            chatRoomMembers = res.rows[0].members;
            let isGroupChat = res.rows[0].is_group_chat;
           console.log(isGroupChat);
//            console.log('LOGGIN chat room members: ',chatRoomMembers);
            for(member of chatRoomMembers){
                if(member == chatWithID && isGroupChat == false){
                    return true;
                }
            }
       }catch(error){
            console.log('ERROR fetching chat room  : ',error);
       }
    }
    return false;
}

async function saveMessage(message){
//    console.log('LOGGING Message object sent to saveMessage:',message);
    const saveMessasgeQuery = `INSERT INTO ${db.messagesTable} 
                               (message_id,chat_room_id,sender_id,sent_at,message_content)
                               values(uuid_generate_v4(),$1,$2,CURRENT_TIMESTAMP,$3)`
    try{
        const result = await db.query(saveMessasgeQuery,[message.chat_room_id,message.senderID,message.chat_message]);
//        console.log('LOGGING result object in saveMessage',result);
    }catch(error){
//        console.log('ERROR saving message to DB in saveMessage: ',error);
    }
}


module.exports={router,saveMessage};
