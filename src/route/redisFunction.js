const redisClient = require('../db/redis-db')
const Task = require('../model/task')
const redisTaskHandler = async( condition , user_id,  task_id , updated_task)=>{
    
    let tasks = await redisClient.lRange(user_id , 0 , -1)//getting all task for current user
    tasks = tasks.map((task)=>JSON.parse(task)) // parse them in object
    
    // getting single task by id if task_id given
    if(task_id)
    {
        let task , taskIndex = -1;
        
        const isValidId = tasks.some((task)=>{
            taskIndex++
            return task._id === task_id
        })
        
        if(!isValidId)
            throw new Error('Invalid Task!')

        task = tasks.filter((task)=>{
            return task._id === task_id
        })
        task = task[0]

        if( condition === 'get') // return task by id
        {   
            return task
        }
        else if(condition === 'delete') // delete task by id and return all tasks after delete
        {
            const tempTask = await redisClient.lIndex(user_id , taskIndex) 
            await redisClient.lRem(user_id , 1, tempTask)
            return tempTask
        }
        else if(condition === 'update') // update task by id and return updated tasks
        {
            await redisClient.lSet(user_id , taskIndex ,  JSON.stringify(updated_task))
            return task
        }
    }

    if(condition === 'all'){
        return tasks  //  return all task of current user
    }
    else if( condition === 'delete_all')// delete all current user task 
    {
        await redisClient.del(user_id)
        return tasks
    }
    else
    {
        throw new inValidPara('Please provide a valid parameters!')
    }
    return tasks
}



const redisGroupHandler = async (condition , user_id , group_id , update_ids)=>{
    let tasks = await redisTaskHandler('all' , user_id)
    
    if(condition === 'create')
    {

        tasks = tasks.map((task)=>{
            if(update_ids.includes(task._id))
            {
                task["group_id"] = group_id
            }
            task =  JSON.stringify(Task(task))
            return task
        })
        await redisClient.DEL(user_id)
        await redisClient.lPush(user_id , tasks)
        return tasks
    }
    else
    {
        //validate the group_id
        let groups = await redisClient.lRange(user_id+':group' , 0 , -1)
        groups = groups.map((group)=>JSON.parse(group)) // parse them in object
        const check = groups.find((group)=>group._id===group_id)
        if(!check)
            return 0

        if(condition === 'get')
        {    
            tasks = tasks.filter((task)=>{
                return task.group_id === group_id
            })

            return tasks
        }
        else if(condition === 'delete')
        {
            tasks = tasks.filter((task)=>{
                return task.group_id != group_id
            })
            
            console.log(tasks)
            tasks = tasks.map((task)=>{
                task =  JSON.stringify(Task(task))
                return task
            })
            console.log(tasks)
            await redisClient.DEL(user_id)
            await redisClient.DEL(user_id+':group')
            await redisClient.lPush(user_id , tasks)


            tasks = tasks.map((task)=>JSON.parse(task)) // parse them in object
            return tasks

        }
        else if( condition === 'update')
        {

            tasks = tasks.map((task)=>{
                if(task.group_id === group_id)
                {
                    task.is_completed = true
                }
                task =  JSON.stringify(Task(task))
                
                return task
            })
            await redisClient.DEL(user_id)
            await redisClient.lPush(user_id , tasks)
            
            tasks = tasks.map((task)=>JSON.parse(task)) // parse them in object
            return tasks
        }
    }
    
    return 0
}

module.exports = { redisTaskHandler , redisGroupHandler}