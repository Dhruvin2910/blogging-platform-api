const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

    if(!token){
        return res.status(404).json({ success:false, message:"No token provided" });
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    }catch(err){
        console.error(err);
        return res.status(401).json({ success:false, message:"Invalid token" });
    }
}

module.exports = ensureAuthenticated;