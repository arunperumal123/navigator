var http = require('http'),
    express = require('express'),
    path = require('path'),
    roviReq = require('request'),
    MongoClient = require('mongodb').MongoClient,
    CronJob = require('cron').CronJob,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver;
 
var app = express();
app.set('port', process.env.PORT || 3000); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.bodyParser()); // <-- add

var mongoHost = 'localhost'; //A
var mongoPort = 27017; 
var collectionDriver;
var collectionName = "DB4";
var channelList = [];
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
	
	var myJob = new CronJob('0 0 * * *', function(){
	     initialize();

	});
	myJob.start();

});

app.use(express.static(path.join(__dirname, 'public')));
 


app.get('/', function (req, res) {
res.send('<html><body><h1>Welcome to EPG Server</h1></body></html>');
});


app.get('/:collection/epgService/programLists', function(req, res, next) { 
  var channelId = req.query.channelIds;
  var userStartTime = req.query.userStartTime;
  var userEndTime = req.query.userEndTime;


  //var chanelName = req.query.namee;
  var params = req.params;
  console.log("Request Data"+params);
  var entity = channelId;
  console.log("channelName = "+channelId + " userStartTime = "+userStartTime+" userEndTime= " +userEndTime );
  var collection = params.collection;
  console.log("collection Data"+collection);
  console.log("get all programlist:::::::::::::::"+channelId);
   if (entity) {
       collectionDriver.programList(collection, channelId,userStartTime,userEndTime,  function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }


});


function initialize() {
collectionDriver.find(collectionName,function(err, obj) {
	var dt = new Date(obj).getUTCDate();
	var da = new Date().getUTCDate();
	//if ((obj !== undefined) || (da !== dt)) {
		collectionDriver.delete(collectionName,function(err, obj) {
	
		epgChannelList(function(channelList) {
		epgProgramList();

		});

	     	});
	//}
});

};

function epgChannelList(callback) {
	var obj, collection = collectionName;
	var url = "http://api.rovicorp.com/TVlistings/v9/listings/gridschedule/20394/info?locale=en-US&duration=30&includechannelimages=false&format=json&apikey=2pf79jxpfqsqjd2jcrcw65as";
	rovicall(url, function(body){
		var sourceId = "";
		if (body){ data = JSON.parse(body);}
		obj = data.GridScheduleResult.GridChannels;
		//obj.created_at = new Date(); 
		var count = 0;
		for (var i = 0; i < obj.length; i++) {
			channelList.push(obj[i].SourceId);
			if (i == (obj.length -1)) {
callback(channelList);}
		}
	
		
	});

};
 
function epgProgramList() {
	var dt = new Date();
	var utcTime = dt.toISOString();
	dt.setUTCMinutes(00);dt.setUTCSeconds(00); dt.setUTCHours(00);dt.setUTCMilliseconds(00);
	var urlList = [];

	for (var i = 0; i < 6; i++) {
		console.log("dt.toISOString::::"+dt.toISOString());//http://api.rovicorp.com/TVlistings/v9/listings/////
		var url = "http://api.rovicorp.com/TVlistings/v9/listings/gridschedule/20394/info?apikey=s8brrx2spxjb82wy7w42s583&sig=sig&includechannelimages=true&locale=en-US&startdate="+dt.toISOString()+"&duration=240";
		programListArray(url, i, function(err1, obj1) {
			
		if (err1) { console.log(err1); }
		   else {

			collectionDriver.removeDuplicate(collectionName, channelList, function(err, obj) { 

			if(!err) {}
			});
		   }



		});
		dt.setUTCHours(dt.getUTCHours() + 4);

	}

};

//Display all program list
function programListArray(url,i, callback) {
		rovicall(url, function(body){
		var data = JSON.parse(body);
		var collection = collectionName;
		obj = data.GridScheduleResult.GridChannels;
		//obj.created_at = new Date(); 
		collectionDriver.savePrograms(collection,obj, function(error, objs) {
		   if (error) { console.log(error); }
		   else {
			if (i == 5){ console.log("noww");
			callback();}
		   }
		});
		
	});	
};


function rovicall(url, callback) {
console.log("rovicall");
roviReq(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
	
	callback(body);
  }
})

};

 
app.get('/:collection', function(req, res, next) {  
   var params = req.params;
   var query = req.query; //1
console.log("before query " + req.params.collection);
console.log("before query " + req.query.query);
   
   if (query) {
        //query = JSON.parse(query); //2
console.log("inside get with query"+query);
        collectionDriver.query(req.params.collection, query, returnCollectionResults(req,res)); //3
   } else {
        collectionDriver.findAll(req.params.collection, returnCollectionResults(req,res)); //4
   }
});


 
function returnCollectionResults(req, res) {
    return function(error, objs) { //5
	  	
        if (error) {console.log("in error of returnCollectionResults"); res.send(400, error); }
	        else { 
                    if (!req.accepts('html')) { //6
                        res.render('data',{objects: objs, collection: req.params.collection});
                    } else {
                        res.set('Content-Type','application/json');
                        console.log("some data has been found");
                        res.send(200, objs);
                }
        }
    };
}; 


app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});


 
app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
