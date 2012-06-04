var fs = require('fs');
var https = require('https');
var url = require('url');

Array.prototype.remove = function(x) {
    for (var i in this) {
	if (this[i] == x) return this.splice(i, 1);
    }
};

// map from path -> [getters]
var pathGetters = {};

function printStats() {
    for (var path in pathGetters)
	console.log(path + ': ' + pathGetters[path].length + ' getters');
}

https.createServer({
    ca: fs.readFileSync('sub.class1.server.ca.pem'),
    key: fs.readFileSync('ssl.key'),
    cert: fs.readFileSync('ssl.crt')
}, function(request, response) {
    var path = url.parse(request.url).pathname;

    if (request.method == 'GET') {
	if (!pathGetters[path])
	    pathGetters[path] = [];
	pathGetters[path].push(response);
	console.log('GET ' + path);
	printStats();

	// listening for 'end' doesn't work, so we have to hack:
	response._end = response.end;
	response.end = function() {
	    pathGetters[path].remove(response);
	    if (pathGetters[path].length == 0)
		delete pathGetters[path];
	    console.log('/GET ' + path);
	    printStats();
	    return response._end();
	}

	// if connection closes prematurely:
	response.on('close', function() {
	    response.end();
	});
    }

    else if (request.method == 'POST') {
	console.log('POST ' + path);
	request.pipe(process.stdout);
	if (pathGetters[path]) {
	    pathGetters[path].forEach(function(getter) {
		request.pipe(getter);
	    });
	}
	request.on('end', function() {
	    response.end();
	});
	request.on('close', function() {
	    response.end();
	});
    }
}).listen(443);
