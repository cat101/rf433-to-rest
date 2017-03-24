# Why do you need a RF to REST bridge?
I wrote this REST frontend in order to integrate readily available & cheap wireless sensors to building automation software like OpenHab.

At its core this frontend runs an rcswitch based sniffer on a Raspberry Pi and provides a webhook mechanism to notify other REST services when a code is decoded.


# About the hardware setup
I used a RXB12 receiver which I hooked to a Raspberry Pi as shown on the diagram below. The wiring is straight forward. We only need a voltage divider to interface the 5V output of the RF module to the 3.3V input on the Raspberry.

<img src="images/breadboard%20view.png" width="40%"><img src="images/schematics.png" width="40%">

My goal was to support a collection of sensors, garage openers and push buttons. RCSwitch can handle most of them out of the box. I only had to add support for Holtek's HT12E (the changes have been contributed back to RCSwitch).

Here is a picture of the sensors I have tested successfully. All of them operate on 433Mhz. Some of them are branded Kerui, but I have found that any cheap 433Mhz sensor works.

<img src="images/sample%20remotes.jpg" width="50%">

# About the software setup
The server is written in NodeJS and uses restify to handle the HTTP connections. The webhook API leverages node-webhooks. In order to install the server just clone the repository and do `npn install`. As part of the installation npn will clone the rcswitch repository and make a native RFSniffer. RFSniffer requires git, build-essential and WiringPi to be installed on the Raspberry Pi.

# Using the REST bridge

Callbacks can be registered using the following API. The webhook name can be `'all'` or the RF code in hex (for example: `'0x00C03562'`)

- `GET /api/webhook/get` Return the list of all the registered hooks.
- `GET /api/webhook/get/[WebHookShortname]` Return the selected WebHook.
- `POST /api/webhook/add/[WebHookShortname]` Add a new URL for the selected webHook. Requires JSON params:
- `GET /api/webhook/delete/[WebHookShortname]` Remove all the urls attached to the selected webHook.
- `POST /api/webhook/delete/[WebHookShortname]` Remove only one single url attached to the selected webHook. A json body with the url parameter is required: { "url": "http://..." }
- `POST /api/webhook/trigger/[WebHookShortname]` Trigger a webHook. It requires a JSON body that will be turned over to the webHook URLs. You can also provide custom headers.

If the registration is successful, when an RF code is received you will get a callback with a JSON body like the following
```JSON
{
	"code":"0x007A8F99",
	"bits":"24",
	"protocol":"1",
	"delay":"324",
	"receiver":"living"
}
```

