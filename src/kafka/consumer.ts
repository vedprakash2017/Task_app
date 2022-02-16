import { Consumer, ConsumerSubscribeTopic ,EachBatchPayload, Kafka, EachMessagePayload } from 'kafkajs'
import { GroupDocument, TaskDocument, UserDocument } from '../@types/module'
import User from '../model/user'
import Task from '../model/task'
import Group from '../model/group'
const uri = process.env.kafkaUri


export default class ExampleConsumer {
  private kafkaConsumer: Consumer

  public constructor() {
    this.kafkaConsumer = this.createKafkaConsumer()
  }

  public async startConsumer(): Promise<void> {
    const topic: ConsumerSubscribeTopic = {
      topic: 'test-topic-2',
      fromBeginning: false
    }

    try {
      await this.kafkaConsumer.connect()
      await this.kafkaConsumer.subscribe(topic)
      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
        
          console.log('consumer getting a msg!')
          const { topic, message } = messagePayload
          const buf = 10;
          if(!message.value)
            throw new Error()

          const {data , type} = JSON.parse(message.value.toString())
        if(type === 'user')
        {
            const user  = new User(data)
            await user.save();
        }
        else if(type === 'task')
        {
            const task  = new Task(data)
            await task.save();
        }
        else if( type === 'group')
        {
            const group  = new Group(data)
            await group.save();
        }
          console.log(data ,type)
        
        }
      })
      console.log('consumer connected!')
    } catch (error) {
        throw new Error('Error: '+ error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect()
  }

  private createKafkaConsumer(): Consumer {
    try
    {
        if(!uri)
            throw new Error("Please provide uri")
    const kafka = new Kafka({ 
      clientId: 'producer-client',
      brokers: [uri]
    })
    const consumer = kafka.consumer({ groupId: 'consumer-group' })
    return consumer
    }
    catch(e)
    {
        throw new Error('error on consumer!' + e)
    }
  }
}
