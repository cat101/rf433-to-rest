"use strict";
// const config        = require('../config');
var WebHooks = require('node-webhooks')


var webHooks = new WebHooks({
    db: './webHooksDB.json', // json file that store webhook URLs
})

// logger.info("Loading");

// webHooks: GET /api/webhook/get (get all the stored webHooks)
server.get('/api/webhook/get', function (req, res){
	webHooks.getDB().then(function(data){
		if (data)
			res.send(200, {status: 'OK', data: data});
		else res.send(400, {status: 'error', error: 'error retrieving the data'});
	}).catch(function(err){ res.send(400, {status: 'error', error: err }); });
});

// webHooks: GET /api/webhook/get/:webHookShortname (get the selected webHook data)
server.get('/api/webhook/get/:webHookShortname', function (req, res){
	if (typeof req.params.webHookShortname !== 'undefined'){
		webHooks.getWebHook(req.params.webHookShortname).then(function(data){
			if (data)
				res.send(200, {status: 'OK', data: data});
			else res.send(400, {status: 'error', error: 'error retrieving the data'});
		}).catch(function(err){ res.send(400, {status: 'error', error: err }); });
	} else res.send(400, {status: 'error', error: 'Please provide a valid webHook shortname'});
});

// webHooks: POST /api/webhook/add/:webHookShortname (add a new webHook url for a specified webhook event name)
server.post('/api/webhook/add/:webHookShortname', function (req, res){
	if (typeof req.params.webHookShortname !== 'undefined'){
		// console.log(JSON.stringify(req.params));
		// console.log(JSON.stringify(req.body));
		if (req.body.hasOwnProperty('url'))
			webHooks.add(req.params.webHookShortname, req.body.url).then(function(outcome){
				if (outcome)
					res.send(200, {status: 'OK', message: 'webHook added!', added: true});
				else res.send(400, {status: 'error', message: 'webHook not added.', added: false});
			}).catch(function(err){ res.send(400, {status: 'error', error: err, added: false }); });
		else res.send(400, {status: 'error', error: 'JSON url parameter is required'});
	} else res.send(400, {status: 'error', error: 'Please provide a valid webHook shortname'});
});

// webHooks: GET /api/webhook/delete/:webHookShortname (remove all the urls attached to the webHook selected)
server.get('/api/webhook/delete/:webHookShortname', function (req, res){
	if (typeof req.params.webHookShortname !== 'undefined'){
		webHooks.remove(req.params.webHookShortname).then(function(outcome){
			if (outcome)
				res.send(200, {status: 'OK', message: 'webHook removed!', deleted: true});
			else res.send(400, {status: 'OK', message: 'webHook not found', deleted: false});
		}).catch(function(err){ res.send(400, {status: 'error', error: err }); });
	}else res.send(400, {status: 'error', error: 'Please provide a valid webHook shortname'});
});

// webHooks: POST /api/webhook/delete/:webHookShortname (remove a single webhook url for the selected webHook.)
server.post('/api/webhook/delete/:webHookShortname', function (req, res){
	if (typeof req.params.webHookShortname !== 'undefined'){
		var body = req.body;
		if (body)
			webHooks.remove(req.params.webHookShortname, body.url).then(function(outcome){
				if (outcome)
					res.send(200, {status: 'OK', message: 'webHook removed!', deleted: true});
				else res.send(400, {status: 'OK', message: 'webHook not found', deleted: false});
			}).catch(function(err){ res.send(400, {status: 'error', error: err }); });
		else res.send(400, {status: 'error', error: 'Body not valid.'});
	} else res.send(400, {status: 'error', error: 'Please provide a valid webHook shortname'});
});

// webHooks: POST /api/webhook/trigger/:webHookShortname (trigger a webHook. It requires a JSON body that will be turned over to the webHook URLs.)
server.post('/api/webhook/trigger/:webHookShortname', function (req, res){
	if (typeof req.params.webHookShortname !== 'undefined'){
		var body = req.body;
		webHooks.trigger(req.params.webHookShortname, body);
		res.send(200, {status: 'OK', message: 'webHooks called!', called: true});

	} else res.send(400, {status: 'error', error: 'Please provide a valid webHook shortname'});
});

module.exports = webHooks;