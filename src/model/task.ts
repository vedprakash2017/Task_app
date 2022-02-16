import Mongoose from 'mongoose'

const schema  = new Mongoose.Schema({
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
        type:Mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    group_id:{
        type:Mongoose.Types.ObjectId,
        // unique:true    
    }
})

const Task = Mongoose.model('task', schema)

export default Task;