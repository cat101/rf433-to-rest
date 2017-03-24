'use strict'
// rsync -rvi --existing --exclude 'node_modules' --exclude 'modules' --progress -e ssh /Users/fmcuenca/Documents/mov/CasaC/src/Apps/CasaC/rf433-to-rest/ root@raspi-living:/mybin/CasaC/rf433-to-rest/
// git://github.com/cat101/rc-switch
// git://github.com/sui77/rc-switch
// http://wiringpi.com/download-and-install/

/**
 * Module Dependencies
 */
const config        = require('./config'),
      restify       = require('restify'),
      bunyan        = require('bunyan'),  // restify uses bunyan internally
      bunyanWinston = require('bunyan-winston-adapter');

/**
 * Initialize Server
 */
global.server = restify.createServer({
    name    : config.name,
    version : config.version,
    log     : bunyanWinston.createAdapter(logger),
})

/**
 * Middleware
 */
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: true }));
server.use(restify.bodyParser({ mapParams: true })); //Understand several types of body (JSON, form,etc) and map to parameters
server.use(restify.fullResponse());

var webHooks = require('./routes/webhooks');

/**
 * Error Handling
 */
server.on('uncaughtException', (req, res, route, err) => {
    logger.error(err.stack)
    res.send(err)
});

// Run the RFSniffer as a child process and capture its stdout
const spawn = require('child_process').spawn;
const rfSniffer=spawn('stdbuf',['-oL', './RFSniffer']);

rfSniffer.stdout.setEncoding('utf8');
rfSniffer.stdout.on('data', function(data) {
    // console.log(data); 
    // logger.info('RFSniffer: %s',data);
    var obj = JSON.parse(data);
    obj.receiver=config.receiver_location;
    logger.info('RFSniffer: %s',JSON.stringify(obj));
    webHooks.trigger('all', obj);
    webHooks.trigger(obj.code, obj);
});
rfSniffer.on('close', (code) => {
  logger.error(`RFSniffer process exited with code ${code}`);
  process.exit();
});
logger.info('RF receiver initialized');

/**
 * Start HTTP server
 */
server.listen(config.port, function() {
    logger.info(
        '%s v%s ready to accept connections on port %s in %s environment.',
        server.name,
        config.version,
        config.port,
        config.env
    )
})


