import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: 'dimrbswfl', 
    api_key: '814965895492196', 
    api_secret: 'cIBINmFu1g8dizLdMGAx8dXdmkE' // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>  {

    console.log("Entering uploadOnCloudinary function...");

    try{
        console.log("Entering uploadOnCloudinary try......");

        if (!fs.existsSync(localFilePath)) {
            console.error('File does not exist at path:', localFilePath);
            return null;
        }
        
        //upload a file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,
            {resource_type:"auto"}   // Detech file type
        );

        // file has uploaded successfully


        fs.unlinkSync(localFilePath);
        console.log("Local temp file removed");

        return response;
    }
    catch(error){
        console.error("Error uploading to Cloudinary:", error);
        
        fs.unlinkSync(localFilePath) // remove the locally save temp file as the upload get failed
        return null;
        
    }
}


export {uploadOnCloudinary}