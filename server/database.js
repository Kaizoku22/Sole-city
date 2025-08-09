const { Pool } = require("pg");
const {createHash} = require('crypto');
const { createClient } =require('@supabase/supabase-js'); 
const { decode } =require("base64-arraybuffer");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const pool = new Pool({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    idleTimeOutMillies:process.env.DATABASE_IDLE_TIEMOUT,  
    database:process.env.DATABASE_NAME ,
    password:process.env.DATABASE_PASSWORD,
    port:process.env.DATABASE_PORT,
    max:process.env.DATABASE_MAX

})

const postsTable ="posts";
const usersTable ="app_users";
const passTable  ="user_passwords";
const sessionTable ="user_sessions";
const citiesTable = "cities_data";

function query(text,params,callback)
{

    return pool.query(text,params,callback);
};

async function fetchUserData(session_id){
    let sessionQuery = await pool.query(`SELECT * FROM ${sessionTable} WHERE session_id = '${session_id}'`);
//    console.log(sessionQuery.rows[0]); 
    let fetchedUserQuery = await pool.query(`SELECT * FROM ${usersTable} WHERE user_uid = '${sessionQuery.rows[0].user_uid}'`);
    let fetchedUser = fetchedUserQuery.rows[0];
//    console.log('Fetched User result -',fetchedUser);
    return fetchedUser;
}



async function uploadMedia(postID,file){
//    console.log(postID);
//    console.log(file);
    const { data, error } = await supabase.storage
                                        .from('trail-images')
                                        .upload(`${postID}/${file.originalname}`,
                                        file.buffer)
  if(error) {
      console.log('error uploading the image');
      console.log(error);
      return error;
  } else {
//      console.log('return object from supabase : ',data);
 const updateMediaLinks = await db.query(`UPDATE ${db.postsTable} set trail_media =${images} WHERE post_id=${post_id}`);
      // get public url of the uploaded file
    const { data: image } = supabase.storage
     .from("trail-images").getPublicUrl(data.path);
//    console.log(image.publicUrl);
    return image.publicUrl;
  } 
};



async function uploadMultipleMedia(postID, files) {
  const uploadPromises = files.map(file => uploadMedia(postID, file));
  const urlArray = await Promise.all(uploadPromises);

  // Check if any result is NOT a string → treat as error
  const errorResult = urlArray.find(result => typeof result !== "string");

  if (errorResult) {
    console.log("Error encountered in uploadMultipleMedia:", errorResult);
    return errorResult; // Return the first error found
  }

//  console.log("Completed URL array in uploadMultipleMedia:", urlArray);
  return urlArray;
}


function fetchSignedUrl(path){
const { data: image } = supabase.storage.from("tral-images").getPublicUrl(path);
      console.log('fetching publicUrl');
      return image.publicUrl;
}


function hash(pass){
return createHash('sha256').update(pass).digest('hex');
}


module.exports = { hash,query,uploadMedia,postsTable,usersTable,passTable,sessionTable,citiesTable,supabase,fetchSignedUrl,uploadMultipleMedia,fetchUserData};

