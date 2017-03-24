'use strict'

// Set up config variables
var config = module.exports = {
    name: 'RF433-to-REST',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    var_dir: process.env.VAR_DIR || '/tmp',
    port: process.env.PORT || 8000,
    base_url: process.env.BASE_URL || 'http://localhost:8000',
    receiver_location: "living"
}

// Start logging services
const winston = require('winston');
global.logger = winston.loggers.add('devLog', {
  console: {
    silent: (config.env=="development")?false:true,
    level: 'debug',
    colorize: true,
    // label: 'devLog',
    handleExceptions: true,  //catches uncaught exceptions
    humanReadableUnhandledException: true
  },
  File: {
    // label: 'devLog',
    level: 'debug',
    // colorize: true,
    handleExceptions: true,
    filename: config.var_dir+'/debug.log', 
    maxsize: 1000000,
    tailable:true,
    maxFiles:7
  }
});

function exitHandler(options, err) {
    if (options.cleanup){
        // This section gets executed after process.exit()
        logger.info('Service stopping');
    } 
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches kill event
process.on('SIGTERM', exitHandler.bind(null, {exit:true}));

logger.info('Service started');
