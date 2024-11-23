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




async function uploadMedia(postID,file){
    console.log(postID);
    console.log(file);
     const { data, error } = await supabase.storage
                                        .from('trail_images')
                                        .upload(`${postID}/${file.originalname}`,
                                        file.buffer)
  if(error) {
      console.log('error uploading the image');
    console.log(error);
      return false;
  } else {
      console.log('return object from supabase : ',data);
      // get public url of the uploaded file
    const { data: image } = supabase.storage
     .from("trail_images").getPublicUrl(data.path);
    console.log(data.path);

      console.log('Uploaded Images Successfully');
      
  } 
};


function fetchSignedUrl(path){
const { data: image } = supabase.storage.from("trail_images").getPublicUrl(path);
      console.log('fetching publicUrl');
      return image.publicUrl;
}


function hash(pass){
return createHash('sha256').update(pass).digest('hex');
}


module.exports = { hash,query,uploadMedia,postsTable,usersTable,passTable,sessionTable,citiesTable,supabase,fetchSignedUrl,};

