const mongoose = require('mongoose');
const  uri  = process.env.URI
mongoose.connect( uri , (err , res)=>{
    if(err)
        console.log('error to connected to mongdb!',err)
    else
    console.log('Connected to mongodb!')
})