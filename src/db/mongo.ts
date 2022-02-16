import * as mongoose from  'mongoose';
const  uri=  (process.env.URI)
//@ts-ignore
mongoose.connect( uri , (err , _res)=>{
    if(err)
        console.log('error to connected to mongdb!',err)
    else
    console.log('Connected to mongodb!')
})