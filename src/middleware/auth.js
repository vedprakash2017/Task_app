const jwt  = require('jsonwebtoken')
const User = require('../model/user')
const privateKey = process.env.privateKey

const checkAuth = async (req,res ,next)=>{
    try{

        //validate the token
        const token = req.header('Authorization').replace('Bearer ','')
        const id  = await jwt.verify(token , process.env.privateKey)
        let user = await User.findById(id._id)

        // check if user exist or not
        if(!user)
            throw new Error("Invalid Login!")
        
        // check token is still in database or not
        const x = user.token.find((to)=>token === token)
        if(!x)
        {
            throw new Error("Invalid Login")
        }

        req.user = user
        req.token = token
    next()
    }
    catch(e)
    {
        res.status(401).send('Auth error!')
    }

}

module.exports = checkAuth