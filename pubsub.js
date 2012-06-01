var http = require('http');

Array.prototype.remove = function(e) {
    for (var i = 0; i < this.length; i++) {
	if (e == this[i]) { return this.splice(i, 1); }
    }
};

var getters = [];

http.createServer(function(request, response) {
    if (request.method == 'GET') {
	getters.push(response);

	response.on('close', function() {
	    getters.remove(response);
	});
    }

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
