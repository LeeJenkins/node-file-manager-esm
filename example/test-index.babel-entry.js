#! /usr/bin/node

// register babel hook
require('babel-core/register')({
    extensions: ['.js', '.mjs'],
});
// register application
module.exports = require('./test-index.mjs').default;
