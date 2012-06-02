var fs = require('fs');
var https = require('https');

var getters = [];

https.createServer({
    ca: fs.readFileSync('sub.class1.server.ca.pem'),
    key: fs.readFileSync('ssl.key'),
    cert: fs.readFileSync('ssl.crt')
}, function(request, response) {
    if (request.method == 'GET')
	getters.push(response);

    else if (request.method == 'POST') {
	console.log('SEND to ' + getters.length + ' getters');
	request.pipe(process.stdout);
	getters.forEach(function(getter) {
	    request.pipe(getter);
	});

	request.on('end', function() {
	    response.end();
	    console.log('\n/SEND');
	    getters.splice(0, getters.length); // clear
	});
    }
}).listen(443);
