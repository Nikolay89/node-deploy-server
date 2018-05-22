/**
 * Author: Andrey Gromozdov
 * Date: 04.12.13
 * Time: 0:09
 */

"use strict";

var path = require('path');
var fs = require('fs');
var Service;
var platform = require('./common');

if (platform.isWin32 || platform.isWin64) {
    console.log('install windows service...');
    Service = require('../lib/service/windows').Service;
	//Service = require('node-windows').Service;
	
	console.log('install windows service ok');
}

if (platform.isLinux) {
    console.log('install linux daemon...');
    Service = require('../lib/service/systemv/index').Service;
}

if (!Service) {
    throw Error("Not supported platform: " + platform.platformName);
}

var svc = new Service({
    name: 'nodehosting',
    description: 'The node.js deploy service',
    script: './lib/server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.on('start',function(){
  console.log(svc.name+' started!');
});

//svc.on('uninstall',function(){
//  console.log('Uninstall complete.');
//  console.log('The service exists: ',svc.exists);
//});
// Just in case this file is run twice.
svc.on('alreadyinstalled',function(){
	//svc.uninstall();
  console.log('This service is already installed.');
});

// Listen for the "start" event and let us know when the
// process has actually started working.


var installConfigTemplate = function() {
    console.log('Target configuration: ' + platform.configFile);
    var exists = fs.existsSync(platform.configFile);
    if (exists) {
        console.log('Configuration file exist. Skiping...');
        return;
    }

    console.log('Source configuration: ' + platform.configFileSource);

    var data = fs.readFileSync(platform.configFileSource);
    fs.writeFileSync(platform.configFile, data, {mode : '0666'});

    console.log('Configuration created');
};

installConfigTemplate();
svc.install();
