require('isomorphic-fetch');
require('dotenv').config();
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth, verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const { default: graphQLProxy, ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const getSubscriptionUrl = require('./server/getSubscriptionUrl');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks')


const PORT = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const API_VERSION = ApiVersion.January20;
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST } = process.env;

app.prepare().then(() => {
    const server = new Koa();
    const router = new Router();
    console.log(1, server)
    server.use(session({ secure: true, sameSite: 'none' }, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];

    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products', 'write_products'],
            async afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;
                ctx.cookies.set('shopOrigin', shop, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });

                const registration = await registerWebhook({
                    address: `${HOST}/webhooks/products/create`,
                    topic: 'PRODUCTS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: API_VERSION
                })

                if(registration.success) {
                    console.log('Successfully, registered webhook!')
                } else {
                    console.log('Failed to register webook', registration.result)
                }

                await getSubscriptionUrl(ctx, accessToken, shop, API_VERSION);
            }
        })
    );

    const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET_KEY});

    router.post('/webhooks/products/create', webhook, ctx => {
        console.log('received webhook: ', ctx.state.webhook)
    });

    server.use(graphQLProxy({ version: API_VERSION }));
    
    router.get('*', verifyRequest(), async ctx => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    });

    server.use(router.allowedMethods());
    server.use(router.routes())


    server.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`)
    })
});