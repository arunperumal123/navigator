cloudStbApp.controller('channelController', ['$scope', 'channelData', '$timeout', 'VideoPlayer', function ($scope, channelData, $timeout, VideoPlayer) {

    // Service IDs i.e. channel Ids
    var channelList = channelData.data;
	
    for(var i=0; i<channelList.length; i++) {
		var channelObj= channelList[i];
		var channelImage =(channelObj.channelImage).replace("http://172.28.11.54/epg/image_icon/","/dist/assets/channels_logo/");
		channelObj.channelImage = channelImage;
		channelList[i]=channelObj;
    }
    $scope.channelList = channelList;

    //VideoPlayer.play('192.168.0.33/epg/WebKit.mp4');
	VideoPlayer.play('http://localhost:5000/src/assets/posters/sample-1.mp4');

}]);

cloudStbApp.controller('programController', ['$scope', 'data', '$stateParams', 'programList', 'twitter', function ($scope, data, $stateParams, programList, twitter) {

   // var _videoURL;
      var _channelIndex;

    // Access the source id from url
    if ($stateParams.cid) {
        // Pass SourceID/ChannelId to fetch program info for that channel based on start & end time
        $scope.programList = programList.data;

        /*
         * Following Code block will be removed later. Here we are hard coding program ID patterns with
         * Video URLs.
         * */
       if ($stateParams.cid == 14874 || $stateParams.cid == 17017 || $stateParams.cid == 18294 || $stateParams.cid == 12436 || $stateParams.cid == 11920) {
            //_videoURL = "http://172.28.95.150:8080/vldms/tuner?ocap_locator=ocap://0x26";
           _channelIndex = 0;
        } if ($stateParams.cid == 13604 || $stateParams.cid == 28173 || $stateParams.cid == 21961 || $stateParams.cid == 11846 || $stateParams.cid == 52139) {
           // _videoURL = "http://172.28.95.150:8080/vldms/tuner?ocap_locator=ocap://0x27";
            _channelIndex = 1;
        } if ($stateParams.cid == 38012 || $stateParams.cid == 17719 || $stateParams.cid == 11951 || $stateParams.cid == 34824 || $stateParams.cid == 43572) {
           // _videoURL = "http://172.28.95.150:8080/vldms/tuner?ocap_locator=ocap://0x29";
            _channelIndex = 3;
        } if ($stateParams.cid == 17719 || $stateParams.cid == 11887 || $stateParams.cid == 11966 || $stateParams.cid == 53731) {
           // _videoURL = "http://172.28.95.150:8080/vldms/tuner?ocap_locator=ocap://0x33";
        } if ($stateParams.cid == 14133 || $stateParams.cid == 14412 || $stateParams.cid == 19935 || $stateParams.cid == 14610) {
            //_videoURL = "http://172.28.95.150:8080/vldms/tuner?ocap_locator=ocap://0x27";
            _channelIndex = 5;
        }

        /*  VideoPlayer.play(_videoURL);*/
       // VideoPlayer.play('192.168.0.33/epg/WebKit.mp4');

        //playMyChannel(_channelIndex);
    }

    var _programInfo = {};

    // If ProgramId exists then, we can traverse programList to find Program Info for that particular id
    if ($stateParams.pid) {
        var _programList =  $scope.programList;

       // var _programInfo = {};

        angular.forEach(_programList, function(singleProgram, key) {
            if (singleProgram.Programs['ProgramId'] === $stateParams.pid) {

                //Store the Program Title in scope to be accessed in 'Tweet' Button click
                _programInfo.Title = $scope.currentProgramTitle = singleProgram.Programs['Title'];
                _programInfo.Category = singleProgram.Programs['Category'];
                _programInfo.Duration = singleProgram.Programs['Duration'];
                _programInfo.Subcategory = singleProgram.Programs['Subcategory'];
                _programInfo.TVRating = singleProgram.Programs['TVRating'];
                _programInfo.AiringTime = singleProgram.Programs['AiringTime'];
                _programInfo.Dolby = singleProgram.Programs['Dolby'];
                _programInfo.Stereo = singleProgram.Programs['Stereo'];

                $scope.programInfo = _programInfo;
            }
        });

        //Read the twits against a program #hashTag
        /*twitter.getTwits(_programInfo.Title).then(function (response) {
            $scope.twits = response.data.tData;

        }, function (error) {

        });*/
    }

    //Tweet the current program
    /*$scope.sendTweet = function () {
        twitter.sendTweets(_programInfo.Title).then(function (response) {
            console.log(response);
        }, function (err) {
            console.log(err);
        });
    };*/

}]);
cloudStbApp.controller('searchController', ['$scope','data', '$stateParams', function ($scope,data, $stateParams) {

    $scope.search = function () {
		if($scope.keywords.length<3){
			alert("Please enter atleast 3 characters for searching program");
			return;
		}
		var searchReq = data.getSearchResult($scope.keywords);
		searchReq.success(function(data, status, headers, config) {  
			//alert(data.length);
			
			   for(var i=0; i<data.length; i++) {
					var programObj= data[i];
					var channelImage =(programObj.channelImage).replace("http://172.28.11.54/epg/image_icon/","/dist/assets/channels_logo/");
					programObj.channelImage = channelImage;
					data[i]=programObj;
				}
			$scope.searchData = data;

	  });
	};
}]);

cloudStbApp.controller('searchResultsInfoController', ['$scope', 'data', '$stateParams', 'programDetails', 'twitter', function ($scope, data, $stateParams, programDetails, twitter) {

	var _programInfo = {};
	$scope.programDetails= programDetails.data;
    // If ProgramId exists then, we can traverse programList to find Program Info for that particular id
    if ($stateParams.pid) {
        var _programList =  $scope.programDetails;

        angular.forEach(_programList, function(singleProgram, key) {
            if (singleProgram.Programs['ProgramId'] === $stateParams.pid) {

                //Store the Program Title in scope to be accessed in 'Tweet' Button click
                _programInfo.Title = $scope.currentProgramTitle = singleProgram.Programs['Title'];
                _programInfo.Category = singleProgram.Programs['Category'];
                _programInfo.Duration = singleProgram.Programs['Duration'];
                _programInfo.Subcategory = singleProgram.Programs['Subcategory'];
                _programInfo.TVRating = singleProgram.Programs['TVRating'];
                _programInfo.AiringTime = singleProgram.Programs['AiringTime'];
                _programInfo.Dolby = singleProgram.Programs['Dolby'];
                _programInfo.Stereo = singleProgram.Programs['Stereo'];

                $scope.programInfo = _programInfo;
            }
        });

    }
}]);
/*
cloudStbApp.controller('searchController', ['$scope', 'searchData', '$timeout', function ($scope, searchData, $timeout) {
alert('searchController');
    // Service IDs i.e. channel Ids
    var channelList = $scope.searchData;

}]);*/
