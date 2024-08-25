
import auth from 'http-auth';
import debug from 'debug';
import koaSession from 'koa-session';

const AUTH_TYPE_TBD = 'tbd';
const AUTH_TYPE_NONE = 'none';
const AUTH_TYPE_BASIC = 'basic';
const AUTH_TYPE_REST = 'rest';
let assignedAuthType = AUTH_TYPE_TBD;

const init = {
    [AUTH_TYPE_NONE]: initializeNoAuth,
    [AUTH_TYPE_BASIC]: initializeBasicAuth,
    [AUTH_TYPE_REST]: initializeRestAuth,
};

export default {
    setAuthType: function filePath(authType, options) {
        if (assignedAuthType !== AUTH_TYPE_TBD) {
            throw new Error(`Cannot reassign auth type`);
        }
        if (!Object.keys(init).includes(authType)) {
            throw new Error(`Invalid auth type '${authType}'`);
        }
        assignedAuthType = authType;
        initializeAuthTypeHandler(options, authType);
        init[authType](options);
    },
    getAuthType: function filePath() {
        return assignedAuthType;
    },
};

function initializeAuthTypeHandler(options, authType) {
    const {app} = options;
    app.use(async (ctx, next) => {
        if (ctx.path === '/auth/type' && ctx.method === 'GET') {
            ctx.body = {authType};
            return;
        }
        await next();
    });
}

function initializeNoAuth(options) {
    const {app, realm, file} = options;
    const basic = auth.basic({realm, file});

    // app.use(async (ctx, next) => {
    //     if (ctx.path === '/auth/logout' && ctx.method === 'GET') {
    //         ctx.status = 200;
    //         ctx.body = { message: 'this is not needed right?' };
    //         return;
    //     }
    //     await next();
    // });

    app.use(async (ctx, next) => {
        if (ctx.path === '/auth/status' && ctx.method === 'GET') {
            ctx.status = 200;
            ctx.message = 'user is logged in';
            return;
        }
        await next();
    });
}

function createResClone(response) {
    let clone = {header:{}};
    Object.assign(clone, response);
    clone.setHeader = (name, value) => {
        clone.header[name] = value;
    };
    clone.writeHead = (status) => {
        clone.status = status;
    };
    clone.end = (message) => {
        clone.message = message;
    };
    return clone;
}

function initializeBasicAuth(options) {

    const {app, realm, file} = options;
    const basic = auth.basic({realm, file});

    app.use(async (ctx, next) => {
        if (ctx.path === '/auth/logout' && ctx.method === 'GET') {
            ctx.status = 401;
            ctx.body = { message: 'Logged out successfully' };
            return;
        }
        await next();
    });

    app.use(async function auth(ctx, next) {
        let check = basic.check(function basicCheck(req, res, err) {
            if (err) {
                // the err condition seems never to be truthy
                debug('fm:auth:error')(req.user, err);
                throw err;
            } else {
                debug('fm:auth:passed')(req.user);
            }
        });

        try {
            // the basic.check() function in http-auth is not koa-friendly.
            // for a 401 (unauthorized) result, basic.check() writes and
            // sends a message to the browser, but that message does not
            // give a good user experience. the following code detects the
            // 401 error and sends a message with a corrective action.
            let resClone = createResClone(ctx.res);
            check(ctx.req, resClone);
            const status = resClone.status || resClone.statusCode;
            if (status === 401 || typeof(status) === 'undefined') {
                ctx.status = status;
                const header = resClone.header || resClone._header;
                ctx.set('WWW-Authenticate', header['WWW-Authenticate'] || 'Basic realm="Micromanager"');
                ctx.message = `Unauthorized. You must login to gain access. Reload the page for the login prompt.`;
                return;
            }
        }
        catch (err) {
            console.log(`caught an error in basic.check function:`,err);
        }

        await next();
    });

    app.use(async (ctx, next) => {
        if (ctx.path === '/auth/status' && ctx.method === 'GET') {
            ctx.status = 200;
            ctx.message = 'user is logged in';
            return;
        }
        await next();
    });

}

function initializeRestAuth(options) {

    const sessionConfig = {
        key: 'koa:sess',
        maxAge: 15 * 60 * 1000, // Session timeout set to 15 minutes
        autoCommit: true,
        overwrite: true,
        httpOnly: true,
        signed: false,
        rolling: true,
        renew: true, // Renew session when it's about to expire
    };
    
    // Use koaSession middleware
    app.use(koaSession(sessionConfig, app));

    // app.use(async (ctx) => {
    //     if (!ctx.session.user) {
    //         ctx.status = 401;
    //         ctx.body = 'Unauthorized';
    //         return;
    //     }
    //     await next();
    // });
    
    // // Add a route for logout
    // app.use(async (ctx, next) => {
    //     if (ctx.path === '/auth/logout' && ctx.method === 'POST') {
    //         console.log(`received POST /logout`);
    //         ctx.session = null; // Clear the session
    //         ctx.status = 200;
    //         ctx.body = { message: 'Logged out successfully' };
    //         console.log(`ctx:`);
    //         console.log(`\t session = ${ctx.session}`);
    //         console.log(`\t status = ${ctx.status}`);
    //         console.log(`\t body = ${JSON.stringify(ctx.body)}`);
    //         return;
    //     }
    //     await next();
    // });

}