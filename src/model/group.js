const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    tasks:[{
        type: String,
        // required:true
    }],
    assigned_to:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    }
})

const Group = mongoose.model('group' , schema)

module.exports = Group