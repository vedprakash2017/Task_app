const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt  = require('jsonwebtoken')
const Task = require('./task')
const privatekey = process.env.privateKey
const schema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:7
    },
    token:[
        {
            type:String
        }
    ]
})
schema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'assigned_to'
})

schema.virtual('groups',{
    ref:'group',
    localField:'_id',
    foreignField:'assigned_to'
})

schema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    // delete userObject.password
    // delete userObject.token

    return userObject
}
schema.methods.getToken= async function(){
    const user = this
    const id =user._id.toString()
    const token = await jwt.sign({_id:id}, process.env.privateKey)
    user.token.push(token)    

    try{
    await user.save()
    }
    catch(e)
    {
        throw new Error('invlaid!')
    }
    return token
}

schema.statics.findByCred =  async (username , password) =>{
    const user  = await User.findOne({username})
    if(!user)
        throw new Error('Invalid username or password!')

    const isMatched = await bcrypt.compare(password,user.password)
    if(!isMatched)
        throw new Error('Not able to login')
    return user
}
schema.pre('save' , async function(next){

    if(this.isModified('password'))
        this.password = await bcrypt.hash(this.password , 8)
    next()
})


schema.pre('remove', async function(next){  
    const user = this
    await Task.deleteMany({ assigned_to:user._id})
    next()
})
const User = mongoose.model('user' , schema)

module.exports  = User