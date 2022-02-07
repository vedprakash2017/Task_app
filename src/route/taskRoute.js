const express  = require('express')
const route = express.Router()
const Task = require('../model/task')
const auth = require('../middleware/auth')

//manipulating single task 

route.post('/task' , auth , async (req ,res)=>{

    let task = req.body
    task['assigned_to'] = req.user._id
    try{
        task = new Task(task)
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})


route.get('/task/:id' , auth , async (req, res)=>{
    const id = req.params.id
    try{
        const task  = await Task.findById(id)
        if(!task)
            return res.status(404).send()
        res.send(task)
    }
    catch(e){
        res.status(400).send()
    }
})

route.patch('/task/:id' , auth , async (req, res)=>{
    const id = req.params.id
    
    const updates = req.body
    const updatesKeys = Object.keys(updates)

    // allow field to save a task
    const  allow = ['text' , 'due_date' , 'is_completed' , 'assigned_to' , 'group_id']
    

    // check if all update json field are valid or not
    const check = updatesKeys.every((key)=>allow.includes(key))
    if(!check)
        res.status(404).send()

        
    try{
        // find task by id and update it with given data
        const task = await Task.findById(id)
        updatesKeys.map((key)=>{
            task[key]  = updates[key]
        })

        await task.save()
        res.send(task)
    }
    catch(e){
        res.status(400).send()
    }
})

route.delete('/task/:id' ,auth ,  async (req, res )=>{
    const id = req.params.id
    try{
        const task = await Task.findByIdAndRemove(id)
        if(!task)
            return res.status(404).send()
        res.send(task)
    }
    catch(e){
        res.status(400).send()
    }
})

// manipulating all user task

route.get('/user/task' ,auth,  async (req, res)=>{
    try{
        await req.user.populate({path:'tasks'})
        res.send(req.user.tasks)
    }
    catch(e)
    {
        res.status(400).send()
    }

})

route.delete('/user/task' , auth ,  async (req , res)=>{

    try{
        const tasks = await Task.deleteMany({assigned_to:req.user._id})
        if(!tasks)
            return res.status(500).send()

        res.send(tasks)
    }
    catch(e)
    {
        res.status(400).send()
    }
})


// get all tasks or delete all tasks of all users

route.get('/tasks/all' , async (req, res)=>{
    try{
        const tasks = await Task.find()
        if(!tasks)
            return res.status(404).send()

        res.send(tasks)
    }catch(e)
    {
        res.status(400).send(e)
    }
})

route.delete('/tasks/all' , async (req, res)=>{
    try{
        const tasks = await Task.deleteMany()
        if(!tasks)
            return res.status(404).send()
        
            res.send()
    }
    catch(e)
    {
        res.status(400).send(e)
    }
})

module.exports = route