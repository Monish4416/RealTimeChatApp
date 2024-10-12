const UserModel = require("../models/UserModel")
const bcryptjs = require("bcryptjs")

async function registerUser(req,res) {
    try{
        const { name , email , password , profile_pic }=req.body

        const checkEmail = await UserModel.findOne({email}) 

        if(checkEmail){
            return res.status(400).json({
                message : "Already user exits",
                error : true
            })
        }

        // password into hashpassword
        const salt = await bcryptjs.genSalt(10)
        const hashpassword = await bcryptjs.hash(password,salt)

        const payload = {
            name,
            email,
            profile_pic,
            password : hashpassword
        }

        const user = new UserModel(payload)

        const userSave = await user.save()

        return res.status(201).json({
            message : "User Created Successfully",
            data : userSave,
            success : true
        })

    }catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

module.exports = registerUser