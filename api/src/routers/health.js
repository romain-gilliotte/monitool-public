const Router = require('@koa/router');

const router = new Router();

router.get('/health/api', async ctx => {
    ctx.response.status = 200;
    ctx.response.body = { error: null };
});

router.get('/health/database', async ctx => {
    try {
        await ctx.io.database
            .collection('project')
            .find({}, { limit: 1, projection: { _id: true } });

        ctx.response.status = 200;
        ctx.response.body = { error: null };
    } catch (e) {
        ctx.response.status = 500;
        ctx.response.body = { error: e.message };
    }
});

router.get('/health/caching', async ctx => {
    try {
        await ctx.io.redis.set('health', 'ok');
        ctx.response.status = 200;
        ctx.response.body = { error: null };
    } catch (e) {
        ctx.response.status = 500;
        ctx.response.body = { error: e.message };
    }
});

router.get('/health/workers', async ctx => {
    try {
        await Promise.race([
            ctx.io.queue
                .add('health-check', {}, { attempts: 1, removeOnComplete: true, timeout: 5000 })
                .then(job => job.finished()),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);

        ctx.response.status = 200;
        ctx.response.body = { error: null };
    } catch (e) {
        ctx.response.status = 500;
        ctx.response.body = { error: e.message };
    }
});

module.exports = router;
