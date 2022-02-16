import Mongoose from  'mongoose';
const  uri=  (process.env.URI)
//@ts-ignore
Mongoose.connect( uri , (err , _res)=>{
    if(err)
        console.log('error to connected to mongdb!',err)
    else
    console.log('Connected to mongodb!')
})