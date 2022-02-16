import { Request } from 'express';
import { Document, Model, Mongoose } from "mongoose";
import * as mongoose from 'mongoose'

export interface UserType {
  userame: string;
  password: string;
}

export interface TaskType {
    text:string,
    due_date:date,
    is_completed:Boolean,
    assigned_to:string,
    group_id:string,
}

export interface GroupType {
    name:string,
    tasks:Array<string>,
    assigned_to:string,
}
export interface UserDocument extends UserType, Document {}
export interface UserModel extends Model<UserDocument> {}

export interface TaskDocument extends TaskType, Document {}
export interface TaskModel extends Model<TaskDocument> {}

export interface GroupDocument extends GroupType, Document {}
export interface GroupModel extends Model<GroupDocument> {}

export interface customRequest extends Request{
    user:UserDocument,
    token:stirng
}