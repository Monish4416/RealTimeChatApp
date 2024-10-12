const UserModel = require("../models/UserModel")

async function checkEmail(req,res) {
    
    try{

        const { email } = req.body

        const checkEmail = await UserModel.findOne({email}).select("-password")

        if(!checkEmail){
            return res.status(400).json({
                message : "User not exit",
                error : true
            })
        }

        return res.status(200).json({
            message : "Email Verify",
            error : true,
            data : checkEmail
        })

    }catch(error){
        return res.status(500).json({
            message : error.message || error,
            error : true
        })
    }

}

module.exports = checkEmail