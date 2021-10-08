
var server = require("./lib/server");
var router = require("./lib/router/router");
var requesthandler = require("./lib/controller/employee-request-handler");
var handle = {}
handle["DELETE/dataService"] = requesthandler.deleteEmployee;
handle["GET/dataService"] = requesthandler.getEmployee;
handle["PUT/dataService"] = requesthandler.updateEmployee;
handle["POST/dataService"] = requesthandler.addEmployee;
handle["/"] = requesthandler.getEmployee;
server.start(router.route, handle);