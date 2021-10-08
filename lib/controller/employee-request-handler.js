const Ajv = require('ajv')
const getRawBody = require('raw-body')
var url = require("url");
var querystring = require("querystring");
const database = require('../db/database')

const {
  ok,
  created,
  error,
  errorNotFound,
  errorNotValid
} = require('../util/response')
const schema = require('../schema/Employee-schema')

const ajv = new Ajv({
  allErrors: true
})

function getEmployee(response, request) {
  console.log("Request handler 'getEmployee' was called.");
  var urll = url.parse(request.url)
  var params = querystring.decode(urll.query)
  console.log(params.id)
  var temp = {
    employeeId: params.id,
    org: request.headers.org
  }
  const valid = ajv.validate(schema.employeeIdSchema, temp)
  var validatonError = ajv.errors
  if (valid) {
    if (request.headers.all === "1") {
      database.getEmployeeAllDb(params.id, request.headers)
        .then((result) => {
          ok(response, result)
        })
        .catch((err) => {
          console.log(err)
          if (err === "شناسه پیدا نشد")
            errorNotFound(response, err)
          else
            error(response, err)
        })

    } else {
      database.getEmployeeByIdDb(params.id, request.headers)
        .then((result) => {
          ok(response, result)
        })
        .catch((err) => {
          console.log(err)
          if (err === "شناسه پیدا نشد")
            errorNotFound(response, err)
          else
            error(response, err)
        })
    }
  } else {
    error(response, validatonError)
  }
}

function updateEmployee(response, request) {
  console.log("Request handler 'updateEmployee' was called.");

  getRawBody(request)
    .then((bodyBuffer) => {

      const body = JSON.parse(bodyBuffer.toString())

      temp = {
        employeeId: body.employeeId,
        data: body.data,
        parent: body.parent,
        org: request.headers.org
      }
      const valid = ajv.validate(schema.employeeSchema, temp)
      var validatonError = ajv.errors

      if (valid) {
        database.updateEmployeeDb(body, request.headers)
          .then((result) => {
            console.log(result);
            ok(response, "داده ها بروز رسانی شد")
          })
          .catch((err) => {
            if (err === "شناسه وجود ندارد")
              errorNotFound(response, err)
            else
              error(response, err)

          })
      } else {
        error(response, validatonError)
      }
    }
    ).catch((err) => {
      error(response, err)
    })
}

function addEmployee(response, request) {


  console.log("Request handler 'addEmployee' was called.");
  getRawBody(request)
    .then((bodyBuffer) => {
      console.log(bodyBuffer.toString())
      console.log(JSON.parse(bodyBuffer.toString()))
      const body = JSON.parse(bodyBuffer.toString())
      temp = {
        employeeId: body.employeeId,
        data: body.data,
        parent: body.parent,
        org: request.headers.org
      }
      const valid = ajv.validate(schema.employeeSchema, temp)
      var validatonError = ajv.errors
      if (valid) {
        database.addEmployeeDb(body, request.headers)
          .then((result) => {
            console.log(result)
            created(response, result)
          })
          .catch((err) => {
            console.log("1")
            error(response, err)
          })
      } else {
        console.log("2")
        error(response, validatonError)
      }
    }
    ).catch((err) => {
      console.log("3")
      error(response, err)
    })
}

function deleteEmployee(response, request) {
  console.log("Request handler 'deleteEmployee' was called.");
  var urll = url.parse(request.url)
  var params = querystring.decode(urll.query)
  console.log(params.id)
  var temp = {
    employeeId: params.id,
    org: request.headers.org
  }
  const valid = ajv.validate(schema.employeeIdSchema, temp)
  var validatonError = ajv.errors
  if (valid) {
    database.deleteEmployeeByIdDb(params.id, request.headers)
      .then((result) => {
        ok(response, "کارمند حذف شد")
      })
      .catch((err) => {
        console.log(err)
        if (err === "شناسه پیدا نشد")
          errorNotFound(response, err)
        else
          error(response, err)
      })
  } else {
    error(response, validatonError)
  }
}
exports.getEmployee = getEmployee;
exports.updateEmployee = updateEmployee;
exports.addEmployee = addEmployee;
exports.deleteEmployee = deleteEmployee;