const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

let checkUserAuth = async (req, res, next)=>{
    let token 
    const {  authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')){
        try {
            //Get Token from Headers
            token = authorization.split(' ')[1]

            //verify the Token
            const { userID } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            console.log(userID)

            //Get User From Token
            req.user = await UserModel.findById(userID).select('-password')
            next()
        } catch (error) {
              res.status(401).send({ "status" : "failed", "message" : "Unauthorized User"})
        }
    }else{
        if(!token){
            res.status(401).send({ "status": "failed", "message" : "Unauthorized User, No Token"})
        }
    }
    
}

module.exports = checkUserAuth ;