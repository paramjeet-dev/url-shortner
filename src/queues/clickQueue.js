const { Queue, Worker } = require('bullmq');
const bullRedis = require('../config/bullRedis');
const Url = require('../models/Url');

const clickQueue = new Queue('clickQueue', {
  connection: bullRedis,
});

const worker = new Worker(
  'clickQueue',
  async (job) => {
    const { shortCode, referrer, userAgent, ip } = job.data;

    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) return;

    urlDoc.clickCount += 1;
    urlDoc.clickEvents.push({
      referrer,
      userAgent,
      ipAddress: ip,
    });

    await urlDoc.save();
  },
  {
    connection: bullRedis,
    concurrency: 10,
  }
);

worker.on('completed', (job) =>
  console.log(`Click job ${job.id} completed`)
);

worker.on('failed', (job, err) =>
  console.error(`Click job ${job?.id} failed:`, err)
);

const addClickJob = async (
  shortCode,
  referrer,
  userAgent,
  ip
) => {
  await clickQueue.add('click', {
    shortCode,
    referrer,
    userAgent,
    ip,
  });
};

module.exports = { addClickJob, worker };