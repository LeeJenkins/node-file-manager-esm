#!/usr/bin/env node
'strict';

// manually handling the --logging param to have debug be set up before anything else
import debug from 'debug';
import fs from 'fs-extra';
let argv_logging = 'undefined';
if (process.env.FM_LOGGING) {
    debug.enable('fm:' + process.env.FM_LOGGING);
    argv_logging = process.env.FM_LOGGING;
}
process.argv.forEach((val, index) => {
    let params = val.split('=');
    if ('--logging' == params[0].toLocaleLowerCase() || '-l' == params[0].toLocaleLowerCase()) {
        let param = params.length == 2 ? params.pop() : (params.length == 1 && process.argv[index + 1] && process.argv[index + 1][0] != '-' ? process.argv[index + 1] : '*');
        argv_logging = param;
        debug.enable('fm:' + param);
    }
});


import url from 'url';
import auth from 'http-auth';
import path from 'path';
import Koa from 'koa';
import koaStatic from 'koa-static';
import open from 'open';
import optimist from 'optimist';
import Tools from '../lib/tools.mjs';
import IndexRouter from '../lib/routes.mjs';

const d = debug('fm:start');
const dso = debug('fm:options');

let __dir_name = (typeof __dirname !== 'undefined') ? __dirname : '';
if (!__dir_name) {
    const im = import.meta;
    __dir_name = (() => { let x = path.dirname(decodeURI(new url.URL(im.url).pathname)); return path.resolve((process.platform == "win32") ? x.substr(1) : x); })(); // fix node module
}

// user should have the possibility to set it to '' to allow all.
let defaultFileFilter = (
    'zip | tar.gz | 7z | 7zip | tar | gz | tgz | tbz | tar.bz2 | tar.bz | ' + // packed files
    'txt | md | doc | docx | otf | ppt | pptx | xls | xlsx | csv | indd |' + // text and doc formats
    'jpg | jpeg | heic | heif | png | ps |' +  // pixel images
    'svg | ai | ' + // vector images
    'avi | mp4 | mpg | wav | flac | m4a | aac | mpeg | mov ' // media formats
).replaceAll(' ', '');

let defaultMimeFilter = (
    'video/* | audio/* | image/* '  // mime types, important to mobile phones (android)
).replaceAll(' ', '');


(async _ => {

    // broken node 13.8
    //import package_json from './package.json';
    const package_json = JSON.parse(await fs.readFile(__dir_name + '/../package.json', 'utf-8'));

    let argv = optimist
        .usage(['USAGE: $0 [-p <port>] [-d <directory>] ...'])
        .option('port', {
            alias: 'p',
            default: process.env.FM_PORT || process.env.PORT || 5000,
            description: 'Server Port'
        })
        .option('directory', {
            alias: 'd',
            default: process.env.FM_DIRECTORY || undefined,
            description: 'The path to provide the files from'
        })
        .option('secure', {
            alias: 's',
            default: process.env.FM_SECURE || undefined,
            description: 'Use BASIC-AUTH with the htpasswd of the path provided, or the htpasswd within the current bin directory (default login is adam:adam)'
        })
        .option('maxsize', {
            alias: 'm',
            default: process.env.FM_MAXSIZE || '300',
            description: 'Set the max filesize in MB'
        })
        .option('logging', {
            alias: 'l',
            default: process.env.FM_LOGGING || undefined,
            description: 'output logging info [using just `-l` or `--logging` resolves to `--logging "*"` and can be set as environment variable with `DEBUG=fm:*` as well. `-l traffic` will only show `fm:traffic`]  To see all possible output, set `DEBUG=*`'
        })
        .option('filter', {
            alias: 'f',
            default: process.env.FM_FILTER || defaultFileFilter,
            description: 'Important files to filter for. Example: zip|mp4|txt'
        })
        .option('mimefilter', {
            alias: 'mf',
            default: process.env.FM_MIMEFILTER || defaultMimeFilter,
            description: 'Only for file selection. Example: video/*|image/*'
        })
        .option('version', {
            alias: 'v',
            description: 'Show server version'
        })
        .option('open', {
            alias: 'o',
            description: 'Open the website to this service'
        })
        .option('help', {
            alias: 'h',
            description: 'Display This Help Message'
        })
        .argv;

    if (argv.help) {
        optimist.showHelp(console.log);
        process.exit(0);
    }

    if (argv.version) {
        console.log('FileManager', package_json.version);
        process.exit(0);
    }

    if (argv.logging) {
        d('FileManager version ' + package_json.version);
    }


    global.NODEFILEMANAGER = {
        BASEPATH: path.resolve(__dir_name, '../'),
        DATA_ROOT: argv.directory || process.cwd(),
        FILEFILTER: argv.filter,
        MIMEFILTER: argv.mimefilter,
        MAXSIZE: argv.maxsize * 1024 * 1024
    };
    dso('--directory:', NODEFILEMANAGER.DATA_ROOT);
    dso('--secure:', 'secure' in argv ? argv.secure : 'undefined');
    dso('--maxsize:', argv.maxsize, 'MB');
    dso('--logging:', 'logging' in argv ? (argv.logging === true ? true : argv_logging) : 'undefined'); // preserve 'true' for no value
    dso('--filter:', NODEFILEMANAGER.FILEFILTER);
    dso('--mimefilter:', NODEFILEMANAGER.MIMEFILTER);

    // Start Server
    let startServer = function (app, port) {
        app.listen(port, function () { if (argv.open) open('http://localhost:' + port); });
        d('listening on *:' + port);
    };

    let app = new Koa();
    app.name = 'filemanager';

    app.proxy = true;
    app.use(Tools.logTraffic);
    app.use(Tools.handleError);
    app.use(Tools.realIp);



    // Enable auth. KOA compatible. htpasswd file.
    if (argv.secure) {
        let htpasswd = path.resolve(process.cwd(), (typeof argv.secure == 'string' ? argv.secure : './htpasswd'));

        let basic = auth.basic({
            realm: 'File Manager',
            file: htpasswd
        });

        app.use(async function auth(ctx, next) {
            debug('fm:auth')('check');

            let check = basic.check(function basicCheck(req, res, err) {
                if (err) {
                    debug('fm:auth:error')(err);
                    throw err;
                } else {
                    debug('fm:auth')('passed.');
                }
            });

            check(ctx.req, ctx.res);

            await next();
        });
    }


    app.use(IndexRouter);

    app.use(koaStatic(path.join(NODEFILEMANAGER.BASEPATH, './lib/public/')));


    startServer(app, +argv.port);

})()
