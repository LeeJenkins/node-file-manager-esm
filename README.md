# File Manager

![screenshot v3](https://user-images.githubusercontent.com/1894723/74705515-7a209280-5214-11ea-8547-79287118ef43.png)

File manager web server based on Node.js with Koa, Angular.js and Bootstrap, updated to use a recent Koa and be mount compatible and is rewritten to be an ECMAScript Module (or Babel). Has multi file upload. Reduced dependencies. Usable from cli.

Supported: ESM-importable, standalone, docker

# Usage

## koa app: how to mount

```js
import fm from 'node-file-manager-esm';
// see CLI params below: -d & -f & -mf & -m & -n (only -d is required)
let appFm = fm('/tmp/uploadpath', 'zip|txt|mp4', 'image/*', 300).app;

//mainApp.use(mount('/fm', appFm));  // could be mounted to path on another Koa App
appFm.listen(8080);
```

So we can use it as koa app, mounted within another koa instance.

## as Docker container
see [DockerHub - docker-node-filemanager-esm](https://hub.docker.com/r/bananaacid/docker-node-filemanager-esm)

## Standalone / CLI
Requires Node >= v10.5

We can run node-file-manager in terminal directly. The port add data root dir can be set by `-p` and `-d`, defaults to 5000 and current directory.

Then, we can view http://localhost:5000/ in our browser.

To make it available over the net, see below `Access it over the internet`.


**Instant start**: no installation required (linux, osx, win)
```shell
$ npx node-file-manager-esm --logging --open
```
*What it does: Show log (`--logging`) info the let you know whats going an and open the browser (`--open`) on the UI showing all files from the current folder*

**Instant start**: configure basics - no installation required (linux, osx, win)
```shell
$ npx node-file-manager-esm -p 8080 -d /path/to/show --logging --secure --user me:secret --open
```

**Install globally** and use on a folder
```shell
$ npm install -g node-file-manager-esm
$ node-file-manager-esm -p 8080 -d /path/to/show
```

**Use with port as environment variable** (Heroku, Linux, OSX, IIS: iisnode uses the port-env as well)
```shell
$    PORT=8080 node-file-manager-esm
\>   set PORT=8080 && node-file-manager-esm
ps1> $PORT=8080 ; node-file-manager-esm
```

## Standalone on old versions of Node
**Or use ESM + Node >= v4**

Save it to local folder
```shell
$ git clone https://github.com/BananaAcid/node-file-manager-esm.git && cd node-file-manager-esm && npm i && npm i --only=dev
```

and Node > v8.9.0 & < v13
```shell
$ node --experimental-modules ./bin/node-file-manager-esm.mjs [...PARAMS]
```

or Node < v12
```shell
$ node -r esm ./bin/node-file-manager-esm.mjs [...PARAMS]
```

or Node >= v13
```shell
$ node ./bin/node-file-manager-esm.mjs [...PARAMS]
```



# Major changes in this fork
- updated to use a recent Koa
- be koa-mount compatible
- rewritten to be an ECMAScript Module (or Babel), works with both as well as the preferred `esm` module
- has Multi file upload
- reduced dependencies
- added support for big files (v3.2.0)
- upload progress and file updates for all connected clients (v3.2.0)
- max upload filesize (v3.2.0)
- handling of canceled files (v3.2.0)
- full standalone support (v3.2.0)
  - relative paths support for `--directory` and `--secure` (v3.2.0) 
- file renaming if error named file exists and alike (v3.3.1)
- adding users by commandline/env (v3.3.1)
- fixed env presented to docker to be FM_USER (v3.3.2)
- added compose file (v3.3.2)
- reducing docker image from 1GB to 211MB (v3.3.3)

# Note about ES6: ESM support
The `Michael Jackson Script` or `.mjs` (or` modular JS`) extension is used by NodeJs to detect ECMAScript Modules with the `--experimental-modules` flag in NodeJS prior to v13. Since Babel does have problems `import.meta`, the `esm` npm module is used to transpill the code for older node versions. See the files within the `./bin` folder.

# Standalone / CLI
The app can be started all by itself from the command line. You shoud set the `--directory`/`-d` to use and use the `--secure` option. As well as the `--logging` option.
```sh
npm install -g node-file-manager-esm
#example:
node-file-manager-esm -p 8080 -d /path/to/show --logging --secure /path/to/htpasswd
```

## CLI params
There are some configuration options for the commandline

- `-p`  | `--port <int>` -- [5000] The server port to use 
- `-d`  | `--directory <string>` -- [current path] The path to provide the files from (realative path possible: `./data`)
- `-s`  | `--secure <string>` -- [] Is off by default! Use BASIC-AUTH with the htpasswd of the path provided. [using just `-s` or `--secure` tries to use a `./htpasswd` file] (default if using as a module, login is adam:adam) (realative path possible: `./htpasswd`)
- `-u`  | `--user <name:pw>` -- [] If `--secure` is used (or `FM_SECURE=true`), users can be added manually. `pw` can be a clear password or a password hash created by `htpasswd` (see below). It will ignore any htpasswd file from `--secure`. Using the commandline, use `--user adam:adam123 --user eve:eve123` Using the environment variable, use `FM_USER="adam:adam123\neve:eve123"`
- `-m`  | `--maxsize <int>` -- [300] Set the max file size for uploads in MB
- `-l`  | `--logging <string>` -- [] Output logging info [using just `-l` or `--logging` resolves to `--logging "*"` and can be set as environment variable with `DEBUG=fm:*` as well. `-l traffic` will only show `fm:traffic`]  To see all possible output, set `DEBUG=*`
- `-f`  | `--filter <string|null>` -- ["zip|tar.gz|7z|..."] Important files to filter for. The pattern is seperated by `|`. Example: zip|mp4|txt
- `-mf` | `--mimefilter <string>` -- ["video/*|audio/*|image/*"] Only for file selection upload dialog in the web interface. Example: `video/*|image/*`
- `-n`  | `--name` .. ["File Manager"] Overwrite the web ui title
- `-v`  | `--version` -- Show server version
- `-o`  | `--open` -- Open the website to this service in browser, when the server started (localhost with selected port) - if `--port` ist not a pipe.

**Note**: 
- If you got problems selecting any file type for upload, you could set `--filter ""` and `--mimefilter ""` to allow any file.
- For the password and especially a password hash, be aware of chars that have to be escaped on commandline (yes: windows, mac, linux need it)

## Environment variables
Fallback, if no param was used

- `FM_PORT` -- like `--port` -- if no port param was given, tries `FM_PORT` then `PORT` 
- `FM_DIRECTORY` -- like `--directory`
- `FM_SECURE` -- like `--secure` -- to use `FM_USER` or `--user`, set `FM_SECURE=true`
- `FM_USER` -- like `--user` -- but multiple users seperated by `\n`
- `FM_MAXSIZE` -- like `--maxsize`
- `FM_LOGGING` -- like `--logging`
- `FM_FILTER` -- like `--filter`
- `FM_MIMEFILTER` -- like `--mimefilter`
- `FM_NAME` -- like `--name`

## HTTP Basic Auth
The app is protected with simple http basic auth, so it's recommended to use it just over TLS (HTTPS). Let's Encrypt is your friend. ;)

### Shortcut
Google for "online htpasswd generator". The more secure way is getting the required tools to generate a htpasswd file.

### Manually install password tool
If you use linux/mac you can simply use `htpasswd` comming with `apache2-utils` (on Debian/Ubuntu)

On Debian/Ubuntu do:
```shell
$ sudo apt-get update
$ sudo apt-get -y install apache2-utils
```

On Mac, it is included natively.

On Windows, it is included in XAMPP.

### Manually add a user
The following command creates a new `htpasswd` file in the current folder with the user `adam`. After creating a new file copy it into a parent folder of your data folder (in case of docker, into the `secure/` folder) or append the content of the new file to the existing one.
```bash
# new file:
htpasswd -c ./htpasswd adam
# add second
htpasswd ./htpasswd john
```

# Access it over the internet

## Quickly tunnel for free
After starting the tools, they provide you with a subdomain you can use in a browser from anywhere to access the server.

- [Localtunnel](https://localtunnel.github.io/www/)
  - run `npx localtunnel -p 5000` and you got a temporary subdomain (naming he subdomain is possible as well)
  - translates to https with working SSL Certificate
  - has a warning first time connecting
- [ngrok.io](https://ngrok.com/)
  - run `npx ngrok http 5000`
  - has a 2h timelimit, can be paid for 
  - SSL Certificate is blocked in Chrome showing a bad warning, http tunnel works fine
- ... and others

## Port forwarding / Hosting at home
After setting this up, you are actually hosting the server "Dynamic DNS" style permanently at your device/PC.

- configure your router to forward port 80 from the outside to your device/PC to port 5000
- now it should be available using your internet IP
- you can add a free dynmic subdomain using [free.afraid.com](https://freedns.afraid.org/)
  - in case you got a domain, you can add a subdomain and CNAME it to the freedns domain