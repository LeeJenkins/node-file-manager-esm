For more info see https://www.npmjs.com/package/node-file-manager-esm 

![screenshot v3](https://user-images.githubusercontent.com/1894723/74706364-003dd880-5217-11ea-8f26-b616f99eb39a.png)

# File Manager
File manager web server based on Node.js with Koa, Angular.js and Bootstrap, updated to use a recent Koa and be mount compatible and is rewritten to be an ECMAScript Module (or Babel). Has multi file upload. Reduced dependencies. Usable from cli.

## Environment variables
These are relevant for the container

- `FM_PORT` -- [5000] The server port to use, if no port param was given, tries `FM_PORT` then `PORT`  
- `FM_SECURE` -- Is off by default! Use BASIC-AUTH with the htpasswd of the path provided, or the htpasswd within the current bin directory. To use `FM_USER` or `--user`, set `FM_SECURE=true`
- `FM_USER` -- If `FM_SECURE` is used (or `FM_SECURE=true`), users can be added manually. `pw` can be a clear password or a password hash created by `htpasswd`. It will ignore any htpasswd file from `FM_SECURE`. Example `FM_USER="adam:adam123\neve:eve123"`
- `FM_MAXSIZE` -- [300] Set the max file size for uploads in MB
- `FM_LOGGING` -- Output logging info [using just `*` resolves to `fm:*` and can be set as environment variable with `DEBUG=fm:*` as well. `FM_LOGGING=traffic` will only show `fm:traffic`]  To see all possible output, set `DEBUG=*`
- `FM_FILTER` -- ["zip|tar.gz|7z|..."] Important files to filter for. The pattern is seperated by `|`. Example: zip|mp4|txt
- `FM_MIMEFILTER` -- ["video/*|audio/*|image/*"] Only for file selection upload dialog in the web interface. Example: `video/*|image/*`
- `FM_NAME` -- ["File Manager"] Overwrite the web ui title

## Volumes
Exposed are

- `/data` for the folder to use
- `/logs` for the folder to save any logs to
- `/secure` for the folder where the htpasswd file is

## Use

```bash
\> docker run -p 5000:5000 -it --volume D:\:/data --name node-filemanager-esm bananaacid/docker-node-filemanager-esm
```

## Changes
- added support for big files (v3.2.0)
- upload progress and file updates for all connected clients (v3.2.0)
- max upload filesize (v3.2.0)
- handling of canceled files (v3.2.0)
- full standalone support (v3.2.0)
  - relative paths support for `--directory` and `--secure` (v3.2.0) 
- file renaming if error named file exists and alike (v3.2.1)
- adding users by commandline/env (v3.2.1)
