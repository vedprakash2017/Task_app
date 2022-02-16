import { GroupDocument, TaskDocument, TaskModel, TaskType } from "../@types/module";
import redisClient from "../db/redis-db";
import Task from "../model/task"

let redisTaskHandler = async (condition:string, user_id:string|undefined, task_id:string | undefined , updated_task:Array<String>|undefined) => {
  let tasksData = await redisClient.lRange(user_id, 0, -1); //getting all task for current user
  let tasks = tasksData.map((task:string) => JSON.parse(task)); // parse them in object

  // getting single task by id if task_id given
  if (task_id) {
    let task,
      taskIndex = -1;

    const isValidId = tasks.some((task:TaskDocument) => {
      taskIndex++;
      return task._id === task_id;
    });

    if (!isValidId) throw new Error("Invalid Task!");

    task = tasks.filter((task:TaskDocument) => {
      return task._id === task_id;
    });
    task = task[0];

    if (condition === "get") {
      // return task by id
      return task;
    } else if (condition === "delete") {
      // delete task by id and return all tasks after delete
      const tempTask = await redisClient.lIndex(user_id, taskIndex);
      await redisClient.lRem(user_id, 1, tempTask);
      return tempTask;
    } else if (condition === "update") {
      // update task by id and return updated tasks
      await redisClient.lSet(user_id, taskIndex, JSON.stringify(updated_task));
      return task;
    }
  }

  if (condition === "all") {
    return tasks; //  return all task of current user
  } else if (condition === "delete_all") {
    // delete all current user task
    await redisClient.del(user_id);
    return tasks;
  } else {
    throw new Error("Please provide a valid parameters!");
  }
  return tasks;
};

const redisGroupHandler = async (condition:string, user_id:string|undefined, group_id:string|undefined, update_ids:Array<String>|undefined) => {

  let tasks = await redisTaskHandler("all", user_id , undefined , undefined);

  if (condition === "create") {
    let tasks_u = tasks.map((task:TaskDocument) => {
      if(update_ids === undefined)
        throw new Error()
      if (update_ids.includes(task._id)) {
        if(group_id === undefined)
        throw new Error()
        task["group_id"] = group_id;
      }
      let temp = new Task(task)
      let temp2:string = JSON.stringify(temp);
      return temp2;
    });
    await redisClient.DEL(user_id);
    await redisClient.lPush(user_id, tasks_u);
    return tasks_u;
  } else {
    //validate the group_id
    let groups = await redisClient.lRange(user_id + ":group", 0, -1);
    groups = groups.map((group:string) => JSON.parse(group)); // parse them in object
    const check = groups.find((group:GroupDocument) => group._id === group_id);
    if (!check) return 0;

    if (condition === "get") {
      tasks = tasks.filter((task:TaskDocument) => {
        return task.group_id === group_id;
      });

      return tasks;
    } else if (condition === "delete") {
      tasks = tasks.filter((task:TaskDocument) => {
        return task.group_id != group_id;
      });

      console.log(tasks);
      let tasks_u = tasks.map((task:TaskDocument) => {
        let temp = new Task(task);
        let temp2:string = JSON.stringify(temp);
        return temp2;
      });
      console.log(tasks_u);
      await redisClient.DEL(user_id);
      await redisClient.DEL(user_id + ":group");
      await redisClient.lPush(user_id, tasks_u);

      tasks = tasks_u.map((task:string) => JSON.parse(task)); // parse them in object
      return tasks;
    } else if (condition === "update") {
      let tasks_u = tasks.map((task:TaskDocument) => {
        if (task.group_id === group_id) {
          task.is_completed = true;
        }
        let temp = new Task(task);
        let temp2 = JSON.stringify(task);

        return temp2;
      });
      await redisClient.DEL(user_id);
      await redisClient.lPush(user_id, tasks_u);

      tasks_u = tasks_u.map((task:string) => JSON.parse(task)); // parse them in object
      return tasks_u;
    }
  }

  return 0;
};

export default { redisTaskHandler, redisGroupHandler };
