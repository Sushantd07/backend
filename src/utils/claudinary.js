import {v2} from 'cloudinary'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async function(localFilePath){
    try{
        if(!localFilePath) return null
        //upload a file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,
            {resource_type:"auto"}   // Detech file type
        )
        // file has uploaded successfully
        console.log("File is uploaded on cloudinary ",response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) // remove the locally save temp file as the upload get failed
        
        return null;
        
    }
}


export {uploadOnCloudinary}