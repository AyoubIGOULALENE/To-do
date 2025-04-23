const mongoose = require('mongoose');
const joi = require('joi')

/* -------------------------------------- */
const Userschema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isadmin: {type: Boolean,default: false}
}, { timestamps: true })
const User = mongoose.model("User",Userschema)
/* -------------------------------------- */
const Register = (obj) => {
    const schema = joi.object({
    username: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    isadmin: joi.bool().default(false) 
})

return schema.validate(obj)
}

const Login = (obj) => {
   const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
}
)
 return schema.validate(obj)
} 

const Update = (obj) => {
    
    const schema = joi.object({
    username: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
})

return schema.validate(obj)

} 
/* -------------------------------------- */

module.exports = {User,Register,Login,Update}