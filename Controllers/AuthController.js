const UserModel = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const signup = async (req, res) => {
    try{
        const { name, email, username, password } = req.body;
        const exsistingUser = await UserModel.findOne({
            $or: [{ username:username }, { email:email }]
        })

        if(exsistingUser){
            return res.status(409)
                .json({ 
                    success:false, 
                    message:exsistingUser.email === email?
                    "User already exists":"Username already taken"
                })
        }

        const userModel = new UserModel({ name, username, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();

        res.status(201).json({ success:true, message:"User registered successfully" });
    }catch(err){
        console.error(err);
        return res.status(500).json({ success:false, message:"Internal server error" });
    }
} 

const login = async (req, res) => {
    try{
        const { identifier, password } = req.body;

        const user = await UserModel.findOne({
            $or: [{ username:identifier }, { email:identifier }]
        })

        if(!user){
            return res.status(404).json({ success:false, message:"User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({ success:false, message:"Invalid Password" });
        }

        //generate jwt token
        const token = jwt.sign(
            { id:user.id || 1, username: user.username }, //payload
            process.env.SECRET_KEY,
            { expiresIn:"1h" }  //token expires after one hour
        );
        res.cookie("token", token, {
            httpOnly:true,
            secure:true,    //only over https
            sameSite:"strict",  //CSRF protection
            maxAge: 60*60*1000  //1-hour
        })

        res.status(200).json({ 
            success:true, 
            message:"Logged in successfully", 
            token,
            userId:user.id
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({ success:false, message:"Internal server error" });
    }
}

module.exports = { signup, login }