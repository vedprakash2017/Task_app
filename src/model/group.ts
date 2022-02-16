import  Mongoose from 'mongoose'

const schema = new Mongoose.Schema({
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
        type:Mongoose.Types.ObjectId,
        ref:'user',
        required:true
    }
})

const Group = Mongoose.model('group' , schema)

export default Group;