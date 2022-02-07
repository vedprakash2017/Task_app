const mongoose  = require('mongoose')

const schema  = new mongoose.Schema({
    text:{
        type:String,
        required:true,
        trim:true
    },
    due_date:{
        type:Date,
    },
    is_completed:{
        type:Boolean,
        default:false
    },
    assigned_to:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    group_id:{
        type:mongoose.Types.ObjectId,
        // unique:true    
    }
})

const Task = mongoose.model('task', schema)

module.exports = Task