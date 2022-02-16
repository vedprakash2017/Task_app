/*
import { KafkaClient as Client , KafkaClientOptions , HighLevelProducer } from 'kafka-node';

let kafkaHost = process.env.kafka_uri

if(!kafkaHost)
    console.log('Please provide kafka uri')

let kafkaOption:KafkaClientOptions = {
    kafkaHost ,
    clientId:'test123'
}
const client = new Client(kafkaOption);
console.log(client)

const producer = new HighLevelProducer(client);
producer.on("ready", function() {
    console.log("Kafka Producer is connected and ready.");
});


// For this demo we just log producer errors to the console.
producer.on("error", function(error:string) {
    console.error(error);
});
/*
const KafkaService = {
    sendRecord: ({ type, userId, sessionId, data }, callback = () => {}) => {
        if (!userId) {
            return callback(new Error(A userId must be provided.));
        }

        const event = {
            id: uuid.v4(),
            timestamp: Date.now(),
            userId: userId,
            sessionId: sessionId,
            type: type,
            data: data
        };

        const buffer = new Buffer.from(JSON.stringify(event));

        // Create a new payload
        const record = [
            {
                topic: "webevents.dev",
                messages: buffer,
                attributes: 1 
                //  Use GZip compression for the payload 
            }
        ];

        //Send record to Kafka and log result/error
        producer.send(record, callback);
    }
};
export default producer;

import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'test123',
  brokers: ['localhost:9092'],
})

*/

import {Kafka} from 'kafkajs';
import ExampleConsumer from "../kafka/consumer";
import ProducerFactory from "../kafka/producer";

const uri = process.env.kafkaUri
// remember to connect and disconnect when you are done
const kafka = new Kafka({
    clientId: 'producer-client',
    brokers: [uri!],
    })
const admin = kafka.admin({ retry: { retries: 10 } })

// Admin.connect()
// admin.disconnect()

let producer = new ProducerFactory();
let consumer = new ExampleConsumer();
producer.start();
consumer.startConsumer();

export default { producer , consumer };