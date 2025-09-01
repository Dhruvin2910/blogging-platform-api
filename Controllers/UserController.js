const UserModel = require("../Models/User");


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

module.exports = { updateProfile };