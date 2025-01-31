import { Queue, Worker } from "bullmq";
import { redisConnection, defaultQueueConfig } from "../config/queue.js";


export const emailQueueName = "email-queue";
export const emailQueue = new Queue(emailQueueName,{
    connection:redisConnection,
    defaultJobOptions:defaultQueueConfig
});

export const handler = new Worker(emailQueueName, async (job) => {

   console.log(job.data);

},{
    connection:redisConnection
})


    
handler.on("completed", (job) => {
    console.log("job done");
})

handler.on("failed", (job, err) => {
    console.log(`job ${job.id} failed with error ${err}`);
})