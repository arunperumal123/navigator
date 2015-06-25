'use strict';

/**
 * Include the config file and required MongoDB package
 * */
var config      = require('../../config/config.js'),
    MongoClient = require('mongodb').MongoClient,
    Server      = require('mongodb').Server,
    ObjectID    = require('mongodb').ObjectId,
    mongoHost   = config.server.mongoHost,
    mongoPort   = config.server.mongoPort,
    DB          = config.server.DB;

var Model = function (host, port) {

    var self = this;

    // Set up the connection to the local db
    var mongoclient = new MongoClient(new Server("localhost", 27017), {native_parser: true});

    // Open the connection to the server
    mongoclient.open(function(err, MONGOCLIENT) {
        if (!MONGOCLIENT) {
            console.error("Error! Exiting... Must start MongoDB first");
        }

        // Keep the database reference in a property
        self.db = MONGOCLIENT.db(DB);
    });
};

Model.prototype.getCollection = function(collectionName, callback) {
    this.db.collection(collectionName, function(error, rovi_collection) {
        if( error ) {
            callback(error);
        } else {
            callback(null, rovi_collection);
        }
    });
};

/*
 Find Channel ID/SourceId
 URL: http://localhost:8080/epg/channels?user=rovi
*/

Model.prototype.findAll = function (collectionName, callback) {
    this.getCollection(collectionName, function (error, rovi_collection) {
        if (error) {
            callback(error);
        } else {
            rovi_collection.find({}, {"SourceId": 1,"channelImage": 1, "_id": 0}).toArray( function (error, results) {
                if (error) {
                    callback(error);
                } else {
                    callback(results);
                }
            });
        }
    });
};

Model.prototype.findById = function (id, callback) {
  this.getCollection(function (error, rovi_collection) {
      if (error) {
          callback(error);
      } else {
          rovi_collection.findOne({_id: rovi_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(result);
            }
          });
      }
  });
};

/*
 Find Program of a particular SourceId
 http://localhost:8080/epg/programs?user=rovi&sourceId=16503&userStartTime=2015-04-14T00:00:00Z&userEndTime=2015-04-14T03:30:00Z
*/

Model.prototype.findPrograms = function (collectionName, sourceId, userStartTime, userEndTime ,callback) {
    this.getCollection(collectionName, function (error, rovi_collection) {
        if (error) {
            callback(error);
        } else {
            rovi_collection.aggregate([

                { "$unwind": "$Programs" },
                { "$match": {
                    "SourceId": parseInt(sourceId),
                    $and: [
                            {"Programs.AiringTime": {$gte: userStartTime}},
                            {"Programs.AiringTime": {$lte: userEndTime}},
                        ]
                    }
                }

            ],function(error,doc) {

                if (error){
                    console.log(" ERROR");
                    callback(error)
                }
                else {
                    console.log("Pass");
                    callback(doc);
                }
            });
        }
    });
};


Model.prototype.findSimilarTestPrograms = function (collectionName, title, callback) {

    console.log('Log: Nishanth : title='+title);

    this.getCollection(collectionName, function (error, rovi_collection) {
        if (error) {
            callback(error);
        } else {
			rovi_collection.aggregate([

                { "$unwind": "$Programs" },
                { "$match": {"Programs.Title":{$regex :(".*"+title+".*")}}}

            ],function(error,doc) {

                if (error){
                    console.log(" ERROR");
                    callback(error)
                }
                else {
                    console.log("Pass");
                    callback(doc);
                }
            });

/*
		var searchString= new RegExp(title, "i");
	        rovi_collection.find({"Programs.Title":searchString}).toArray( function (error, results) {
                if (error) {
                    callback(error);
                } else {
				    console.log('Log: oooooopppp Nishanth : title='+title);

                    callback(results);
                }
            });
			*/
        }
    });
};

Model.prototype.findSimilarPrograms = function (collectionName, title, callback) {

    console.log('Log: Nishanth : title='+title);

    this.getCollection(collectionName, function (error, rovi_collection) {
        if (error) {
            callback(error);
        } else {

		var searchString= new RegExp(title, "i");
rovi_collection.aggregate([

                { "$unwind": "$Programs" },
                { "$match": {"Programs.Title":{$regex :(searchString)}}}

            ],function(error,doc) {

                if (error){
                    console.log(" ERROR");
                    callback(error)
                }
                else {
                    console.log("Pass");
                    callback(doc);
                }
            });


	        /*rovi_collection.find({"Programs.Title":searchString}).toArray( function (error, results) {
                if (error) {
                    callback(error);
                } else {
                    callback(results);
                }
            });*/
        }
    });
};


Model.prototype.getProgramDetails = function (collectionName, programID, airingTime, callback) {

console.log("Nishanth:pid="+programID);
console.log("Nishanth:airingTime="+airingTime);


    this.getCollection(collectionName, function (error, rovi_collection) {
        if (error) {
            callback(error);
        } else {
            rovi_collection.aggregate([

                { "$unwind": "$Programs" },
                { "$match": {
                    "Programs.ProgramId": {$eq: programID},
					$and: [
                            {"Programs.AiringTime": {$eq: airingTime}}
                        ]
                    }
                }

            ],function(error,doc) {

                if (error){
                    console.log(" ERROR");
                    callback(error)
                }
                else {
                    console.log("Pass");
                    callback(doc);
                }
            });
        }
    });
	 /*   this.getCollection(collectionName, function (error, rovi_collection) {
        if (error) {
            callback(error);
        } else {
            rovi_collection.aggregate([

                { "$unwind": "$Programs" },
                { "$match": {
                    "_id": {$eq: "553dcdf1baa13725e383532f"}
                    }
                }

            ],function(error,doc) {

                if (error){
                    console.log(" ERROR");
                    callback(error)
                }
                else {
                    console.log("Pass");
                    callback(doc);
                }
            });
        }
    });*/
};

module.exports = new Model(mongoHost, mongoPort);