import { Request } from 'express';
import { Document, Model, Mongoose } from "mongoose";
import * as mongoose from 'mongoose'


export interface UserType {
  username: string,
  password: string|Number,
  token: Array<string>
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


export interface UserDocument extends  UserType , Document {
  findByCred(
    userame:string,
    password: string
  ): Promise<UserDocument>
  }

export interface UserModel extends Model<UserDocument>, Model {
     findByCred(
      userame:string,
      password: string
    ): Promise<UserDocument>
  }
export interface TaskDocument extends TaskType, Document {}
export interface TaskModel extends Model<TaskDocument> {}

export interface GroupDocument extends GroupType, Document {}
export interface GroupModel extends Model<GroupDocument> {}


export interface messageKafka{
  data: UserDocument|GroupDocument|TaskDocument,
  type: string
}