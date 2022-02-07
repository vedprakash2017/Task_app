const express = require('express')
const Group = require('../model/group')
const Task = require('../model/task')
const route = express.Router()
const auth = require('../middleware/auth')
const User = require('../model/user')
const { ObjectId } = require('mongodb')


route.get('/group/all' , async (req,res)=>{
    try{    
        const groups = await Group.find({})
        res.send(groups)
    }catch(e)
    {
        res.status(400).send()
    }
})


// manipulating group of tasks by group id
route.post('/group' , auth , async (req,res)=>{

    let tasks = req.body
    tasks['assigned_to']  = req.user._id
    
    try{
        const group = new Group(tasks)
        await group.save()

        //updating tasks which added to the group
        let ids = group.tasks
        if(ids.length>0)
        await Task.updateMany({_id:{$in:ids} },{group_id:group._id})

        res.status(201).send(group)
    }
    catch(e)
    {
        res.status(400).send(e)
    }

})

route.get('/group/:group_id' ,auth , async  (req, res)=>{
    
    // checking group belong to the current user or not
    const group_id = req.params.group_id
    await req.user.populate({path:"groups"})
    const check = req.user.groups.find((group)=>group._id.toString()===group_id)
    if(!check)
        return res.status(500).send()

    try{
    const tasks = await Task.find({group_id})    
    if(!tasks)
        return res.status(404).send()
    
    res.send(tasks)
    }
    catch(e)
    {
        res.status(400).send()
    }
})

route.patch('/group/:group_id' , auth , async (req ,res)=>{

    // checking group belong to the current user or not
    const group_id = req.params.group_id
    await req.user.populate({path:"groups"})
    const check = req.user.groups.find((group)=>group===group)
    if(!check)
        return res.status(500).send()

    try{

        const tasks  = await Task.updateMany({group_id}, {is_completed:true})
        
        if(!tasks)
            return res.status(404).send()
        res.send(tasks)
    }
    catch(e)
    {
        res.status(400).send()
    }
})

route.delete('/group/:group_id' ,auth, async (req,res)=>{

    // checking group belong to the current user or not
    const group_id = req.params.group_id
    await req.user.populate({path:"groups"})
    const check = req.user.groups.find((group)=>group===group)
    if(!check)
        return res.status(500).send()

    try{

        const tasks  = await Task.deleteMany({group_id})
        if(!tasks)
            return res.status(404).send()
        res.send(tasks)
    }
    catch(e)
    {
        res.status(400).send()
    }
})


module.exports = route