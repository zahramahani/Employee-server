
const Q = require('q');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
let x;
const conectDB = () => {
  var deferred = Q.defer();
  if (x) {
    deferred.resolve(x);
  }
  else {
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
      if (err) {
        console.log("خطای ارتباط با پایگاه داده ")
        return deferred.reject("خطای ارتباط با پایگاه داده ")
      } else {
        x = client.db("employee_db");
        return deferred.resolve(x);
      }
    })
  }
  return deferred.promise;
}

exports.getEmployeeAllDb = (employeeId, headers) => {
  var deferred = Q.defer();
  if (employeeId) {
    conectDB().then((results) => {
      console.log(results);
      results.collection("dataStorage").aggregate([
        {
          $lookup:
          {
            from: 'dataMap',
            localField: 'id',
            foreignField: 'id',
            as: 'allInfo'
          }
        }
      ]).toArray(function (err, res) {
        if (err) {
          { return deferred.reject("خطای ارتباط با پایگاه داده ") }
        }
        if (res === null) {
          deferred.reject("شناسه پیدا نشد")
        }
        else {
          deferred.resolve(res)
        }
      }).catch((err) => {
        console.log(" zahra catched");
        deferred.reject(err)
      });
    });
    return deferred.promise;
  }
}

exports.getEmployeeByIdDb = (employeeId, headers) => {
  var deferred = Q.defer();
  if (employeeId) {
    conectDB().then((results) => {
      console.log(results);
      results.collection("dataStorage").findOne({ id: employeeId, org: headers.org }, function (err, result) {
        if (err) {
          { return deferred.reject("خطای ارتباط با پایگاه داده ") }
        }
        if (result === null) {
          deferred.reject("شناسه پیدا نشد")
        }
        else {
          deferred.resolve(result.data)
          console.log(result.data);
        }
      })

    }).catch((err) => {
      console.log(" zahra catched");
      deferred.reject(err)
    });

  }
  else {
    deferred.reject("شناسه پیدا نشد")
  }
  return deferred.promise;
}

exports.addEmployeeDb = (body, headers) => {
  var deferred = Q.defer();
  Q.allSettled([addDataStorage(body, headers), addDataMap(body)]).then((results) => {
    console.log("result zero is" + results[0].state)
    console.log(results[0]);
    console.log("result one is" + results[1].state)
    console.log(results[1]);
    if (results[0].state === "fulfilled" & results[1].state === "fulfilled") {
      console.log("داه ها ذخیره شد")
      deferred.resolve(results[0].value)
    }
    else if (results[0].state === "fulfilled" & results[1].state === "rejected") {
      //پاک کردن از استورج
      var storge = { id: body.employeeId, data: body.data, org: headers.org };

      conectDB().then((results) => {
        console.log(results);
        results.collection("dataStorage").deleteOne(storge, function (err, obj) {
          if (err) { return deferred.reject("خطای ارتباط با پایگاه داده ") }
          console.log("1 document deleted");
        });
      }).catch((err) => {
        console.log(" zahra catched");
        deferred.reject(err)
      });




    }
    else if (results[0].state === "rejected" & results[1].state === "fulfilled") {
      // پاک کردن از مپ
      var map = { id: body.employeeId, parent: body.parent }

      conectDB().then((results) => {
        console.log(results);
        results.collection("dataMap").deleteOne(map, function (err, obj) {
          if (err) { return deferred.reject("خطای ارتباط با پایگاه داده ") }
          console.log("1 document deleted");
        });
      }).catch((err) => {
        console.log(" zahra catched");
        deferred.reject(err)
      });
    } else {
      deferred.reject(results[0].reason)
    }
  }).catch((err) => {
    deferred.reject(err)
  });
  return deferred.promise;
}

exports.updateEmployeeDb = (body, headers) => {
  var deferred = Q.defer();
  Q.all([updateDataStorage(body, headers), updateDataMap(body)]).then((results) => {
    deferred.resolve(results)
  }).catch((err) => {
    deferred.reject(err)
  });
  return deferred.promise;
}

exports.deleteEmployeeByIdDb = (employeeId, headers) => {

  if (employeeId) {
    var deferred = Q.defer();
    Q.all([deleteDataStorage(employeeId, headers), deleteDataMap(employeeId)]).then((results) => {
      deferred.resolve(results)
    }).catch((err) => {
      deferred.reject(err)
    });
    return deferred.promise;
  }

}

function addDataStorage(body, headers) {
  var deferred = Q.defer();
  var storge = { id: body.employeeId, data: body.data, org: headers.org };

  conectDB().then((results) => {
    console.log(results);
    results.collection("dataStorage").findOne({ id: body.employeeId, org: headers.org }, function (err, result) {
      if (err) { deferred.reject("خطای ارتباط با پایگاه داده ") }
      if (result === null) {
        results.collection("dataStorage").insertOne(storge).then((res) => { deferred.resolve("داده ذخیره شد") }).catch((err) => {
          deferred.reject("خطای ارتباط با پایگاه داده ")
        });
      } else {
        deferred.reject("شناسه داده ها تکراری است.")
      }
    });
  }).catch((err) => {
    console.log(" zahra catched");
    deferred.reject(err)
  });
  return deferred.promise;
}

function addDataMap(body) {
  var deferred = Q.defer();
  var map = { id: body.employeeId, parent: body.parent }

  conectDB().then((results) => {
    console.log(results);
    results.collection("dataMap").findOne({ id: body.employeeId }, function (err, result) {
      if (err) { deferred.reject("خطای ارتباط با پایگاه داده ") }
      if (result === null) {
        results.collection("dataMap").insertOne(map).then((res) => { deferred.resolve("داده ذخیره شد") }).catch((err) => {
          deferred.reject("خطای ارتباط با پایگاه داده ")
        });
      } else {
        deferred.reject("شناسه داده ها تکراری است.")
      }
    });
  }).catch((err) => {
    console.log(" zahra catched");
    deferred.reject(err)
  });
  return deferred.promise;
}

function updateDataMap(body) {
  var deferred = Q.defer();
  var mapQuery = { id: body.employeeId };
  var newMap = { $set: { id: body.employeeId, parent: body.parent } };
  var map = { id: body.employeeId, parent: body.parent }


  conectDB().then((results) => {
    console.log(results);
    results.collection("dataMap").findOne({ id: body.employeeId }, function (err, result) {
      if (err) { deferred.reject("خطای ارتباط با پایگاه داده ") }
      if (result === null) {
        deferred.reject("شناسه وجود ندارد")
      } else {
        results.collection("dataMap").updateOne(mapQuery, newMap, function (err, res) {
          if (err) {
            deferred.reject("خطای ارتباط با پایگاه داده")
          }
          deferred.resolve(res)
        });
      }
    });
  }).catch((err) => {
    console.log(" zahra catched");
    deferred.reject(err)
  });
  return deferred.promise;
}

function updateDataStorage(body, headers) {
  var deferred = Q.defer();
  var storageQuery = { id: body.employeeId, org: headers.org };
  var newStorage = { $set: { id: body.employeeId, data: body.data, org: headers.org } };

  conectDB().then((results) => {
    console.log(results);
    results.collection("dataStorage").findOne({ id: body.employeeId, org: headers.org }, function (err, result) {
      if (err) { deferred.reject("خطای ارتباط با پایگاه داده ") }
      if (result === null) {
        deferred.reject("شناسه وجود ندارد")
      } else {
        results.collection("dataStorage").updateOne(storageQuery, newStorage, function (err, res) {
          if (err) {
            deferred.reject("خطای ارتباط با پایگاه داده")
          }
          deferred.resolve(res)
        });
      }
    });
  }).catch((err) => {
    console.log(" zahra catched");
    deferred.reject(err)
  });
  return deferred.promise;
}

function deleteDataMap(employeeId) {
  var deferred = Q.defer();
  var mapQuery = { id: employeeId };
  conectDB().then((results) => {
    console.log(results);
    results.collection("dataMap").deleteOne(mapQuery, function (err, res) {
      if (err) {
        deferred.reject("خطای ارتباط با پایگاه داده")
      }
      deferred.resolve(res)
    });
  }).catch((err) => {
    console.log(" zahra catched");
    deferred.reject(err)
  });
  return deferred.promise;
}

function deleteDataStorage(employeeId, headers) {
  var deferred = Q.defer();
  var storageQuery = { id: employeeId, org: headers.org };


  conectDB().then((results) => {
    console.log(results);
    results.collection("dataStorage").deleteOne(storageQuery, function (err, res) {
      if (err) {
        deferred.reject("خطای ارتباط با پایگاه داده")
      }
      deferred.resolve(res)
    });

  }).catch((err) => {
    console.log(" zahra catched");
    deferred.reject(err)
  });
  return deferred.promise;
}