var http = require('http');

var getters = [];

http.createServer(function(request, response) {
    if (request.method == 'GET')
	getters.push(response);

    else if (request.method == 'POST') {
	request.on('data', function(data) {
	    getters.forEach(function(getter) {
		getter.write(data);
	    });
	});

	request.on('end', function() {
	    response.end();
	});
    }
}).listen(8080);
