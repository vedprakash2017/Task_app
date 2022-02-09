const express = require('express')

const app = express()
const port = process.env.PORT

require('./db/mongo')

app.use(express.static('./public'))
app.use(express.json())

const taskRoute = require('./route/taskRoute')
const userRoute = require('./route/userRoute')
const groupRoute = require('./route/groupRoute')

app.use(taskRoute)
app.use(groupRoute)
app.use(userRoute)

app.listen(port , (err , res)=>{
    if(err)
    console.log('Error!')
    else
    console.log(`Connect to ${port}`)
})
