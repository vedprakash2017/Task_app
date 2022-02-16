import * as jwt  from 'jsonwebtoken'
import User from '../model/user'
let privateKey = process.env.privateKey
import { NextFunction, Request, Response } from 'express'
import {  UserType } from '../@types/module'
const checkAuth = async (req:Request,res:Response ,next:NextFunction)=>{
    try{

        //validate the token
        let token:string;
        if(req.header('Authorization') === undefined)
            throw new Error();
        else
            token = req.header('Authorization')!.replace('Bearer ','')
        if(privateKey === undefined)
            throw new Error('key not defined!')

        let id  = await jwt.verify(token , privateKey)
        if( typeof id == 'string')
            throw new Error('error')
        let user = await User.findById(id._id)

        // check if user exist or not
        if(!user)
            throw new Error("Invalid Login!")
        
        // check token is still in database or not
        const x = user.token.find((to:any)=>token === token)
        if(!x)
        {
            throw new Error("Invalid Login")
        }
        res.locals.user = user
        res.locals.token = token
    next()
    }
    catch(e)
    {
        res.status(401).send('Auth error!')
    }

}

export default checkAuth