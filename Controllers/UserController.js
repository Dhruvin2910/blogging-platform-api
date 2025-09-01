const UserModel = require("../Models/User");
const cloudinary = require("../Config/cloudinary");
const streamifier = require("streamifier");

const updateProfile = async (req, res) => {
    try{
        const userId = req.user.id;

        // Dynamically get all fields provided in req.body
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if(req.body[key] !== undefined && req.body[key] !== null){
                updates[key] = req.body[key];
            }
        })

        if(Object.keys(updates).length === 0) {
            return res.status(400).json({ success:false, message:"No data provide to update" });
        }

        // check for unique fields
        if(updates.email){
            const emailExists = await UserModel.findOne({ email:updates.email, _id: {$ne: userId} });
            if(emailExists){
                return res.status(400).json({ success:false, message:"Email is already in use" });
            }
        }

        if(updates.username){
            const usernameExists = await UserModel.findOne({ username:updates.username, _id: {$ne: userId} });
            if(usernameExists){
                return res.status(400).json({ success:false, message:"Username is already in use" });
            }
        }

        // Update user in DB
        const updateUser = await UserModel.findByIdAndUpdate( 
            userId,
            { $set:updates },
            { new:true }
        );

        if(!updateUser){
            return res.status(404).json({ success:false, message:"User not found" });
        }

        res.status(200).json({ success:true, user: updateUser }); 
    }catch(err) {
        console.error(err);
        return res.status(500).json({ success:false, message:"Server error" });
    }
}

const uploadAvatar = async (req, res) => {
    try{
        if(!req.file){
            return res.status(404).json({ success:false, message:"No file uploaded" });
        }

        // Upload the file buffer directly to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
               {folder: "avatars", width: 200, height: 200, crop: "fill"},
               (error, result) => {
                if(result) resolve(result);
                else reject(error);
               } 
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        // Update user's avatar URL in MongoDB
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user.id,
            { avatar:result.secure_url },
            { new:true }
        );

        res.status(200).json({ 
            success:true, 
            message:"Avatar uploaded successfully",
            avatar: result.secure_url,
            user: updatedUser
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({ success:false, message:"Server error" });
    }
}

module.exports = { updateProfile, uploadAvatar };