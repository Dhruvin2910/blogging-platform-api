const Joi = require("joi");

const userValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3),
        username: Joi.string().min(3),
        email: Joi.string().email(),
        password: Joi.string().min(6).max(15),
        role: Joi.string().valid("user", "admin"),
        bio: Joi.string().max(200),
        avatar: Joi.string().uri(),
        website: Joi.string().uri()
    })

    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({ success:true, message:"Bad request", error });
    }
    next();
}

module.exports = userValidation;