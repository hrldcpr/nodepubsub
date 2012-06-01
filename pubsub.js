var http = require('http');

var getters = [];

http.createServer(function(request, response) {
    if (request.method == 'GET')
	getters.push(response);

    else if (request.method == 'POST') {
	console.log(getters.length + ' getters');
	getters.forEach(function(getter) {
	    request.pipe(getter);
	});

	request.on('end', function() {
	    response.end();
	    getters = [];
	});
    }
}).listen(8080);
