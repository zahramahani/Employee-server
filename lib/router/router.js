function route(handle, pathname, response, request, params) {
    console.log("About to route a request for " + pathname);
    if (typeof handle[request.method + "" + pathname] === 'function') {
        handle[request.method + "" + pathname](response, request);
    } else {
        console.log("No request handler found for " + request.method + "" + pathname);
        response.writeHead(404, { "Content-Type": "text/html" });
        response.write("404 Not found");
        response.end();
    }
}
exports.route = route;