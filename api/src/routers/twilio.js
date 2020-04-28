const _ = require('lodash');
const Router = require('@koa/router');
const { ObjectId } = require('mongodb');
const { MessagingResponse } = require('twilio').twiml;

const router = new Router();

router.post('/twilio', async ctx => {
    const twiml = new MessagingResponse();
    ctx.response.status = 200;
    ctx.response.type = 'application/xml';
    ctx.response.body = twiml.toString();

    console.log(ctx.request.query);
    console.log(ctx.request.body);

    const options = { attempts: 1, removeOnComplete: true };
    queue.add('process-whatapp-msg', ctx.request.body, options);
});

module.exports = router;
