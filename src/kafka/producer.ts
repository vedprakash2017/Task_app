import { Kafka, logCreator, Message , TopicMessages , logLevel, Producer, ProducerBatch } from 'kafkajs'
import { GroupDocument, TaskDocument, UserDocument } from '../@types/module'

const uri = process.env.kafkaUri

interface CustomMessageFormat { a: string }

export default class ProducerFactory {
  private producer: Producer

  constructor() {
    this.producer = this.createProducer()
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect()
      console.log('producer connected!')
    } catch (error:any) {
        throw new Error('producer not connected!' + error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect()
  }

  public async sendMessage(messages: { data:UserDocument| TaskDocument | GroupDocument , type:string}): Promise<void> {
   try
   {
        await this.producer.send({
            topic:'test-topic-2',
            messages:
            [
                {
                value:JSON.stringify(messages)
                }
            ]
        })
    }
    catch(e)
    {
        throw new Error()
    }
  }

  private createProducer() : Producer {
    try
    {
        if(!uri)
            throw new Error("Please provide uri")
        const kafka = new Kafka({
        clientId: 'producer-client',
        brokers: [uri],
        })
        return kafka.producer()
    }
    catch(e:any)
    {
     throw new Error(e)   
    }
  }
}