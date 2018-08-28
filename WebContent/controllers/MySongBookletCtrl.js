var app = angular.module( "mysongbooklet", [] );
app.controller(
		"MySongBookletCtrl",['$scope','$http', function( $scope,$http ) {

			$scope.editMode=false;
			$scope.arrowKeyGroup=undefined;
			$scope.inputInFocus='';
			$scope.songs={};
			$scope.testSongs=[{'testing':'hi1'},{'testing':'hi2'},{'testing':'hi3'}];
			$scope.songGroup={};
			$scope.songGroup['All Songs']=[];
			$scope.selectedSong={};
			$scope.searchTextBoxSelection={};
			$scope.filteredSongs={};
			$scope.activeSongList=undefined;
			$scope.getSongDetailsFrmServer=function getSongDetailsFrmServerAsync()
			{
				
				try{
					var config = {headers:  {
						'Authorization': 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==',
						'Content-Type': 'application/json',
						'x-api-key': 'z3kTAJHQm13CgAIZEzsyM10LfGHgHlfMaVSs8GpA'
						}
					};
					var theUrl="https://157py8chif.execute-api.us-west-2.amazonaws.com/prod/getdata";
					$http.get(theUrl,config)
					.success(function(json) {
						//alert('I have a response'+json.Items[0].SongName.S);
						var lastSong;
						for(var songIdx=0;songIdx<json.Items.length;songIdx++){
							var currSong=json.Items[songIdx];
							$scope.addSongToCollections(currSong);
							lastSong=currSong.songKey;
						}
						$scope.selectedSong=lastSong;
			        })
			        .error(function(json) {
			        	alert("Error!");
			        });
				}
				catch(ex){
					alert(ex.message);
				}
			}
			$scope.getSongListsFrmServer=function()
			{	
				try{
					var config = {headers:  {
						'Authorization': 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==',
						'Content-Type': 'application/json',
						'x-api-key': 'z3kTAJHQm13CgAIZEzsyM10LfGHgHlfMaVSs8GpA'
						}
					};
					var theUrl="https://157py8chif.execute-api.us-west-2.amazonaws.com/prod/getsonggroups";
					$http.get(theUrl,config)
					.success(function(json) {
						if(json.Items.length>0){
							for(var itemIdx=0;itemIdx<json.Items.length;itemIdx++){
								if($scope.songGroup[json.Items[itemIdx].GroupName.S]===undefined){
									$scope.songGroup[json.Items[itemIdx].GroupName.S]=[];
								}
								$scope.songGroup[json.Items[itemIdx].GroupName.S].push(json.Items[itemIdx].SongName.S);
							}
						}
			        })
			        .error(function(json) {
			        	alert("Error!");
			        });
				}
				catch(ex){
					alert(ex.message);
				}
			}
			$scope.addSongToCollections=function(song){
				var songKey=song.SongName.S+song.ProgramOwner.S;
				
				$scope.songs[songKey]=song;
				$scope.songs[songKey].publisher=song.ProgramOwner.S;
				$scope.songGroup['All Songs'].push(songKey);
			}
			$scope.loadSong=function(selectedSongKey){
				$scope.selectedSong=selectedSongKey;
			}
			$scope.keyPressEvent=function(keyEvent){
				
				if(keyEvent.which===39||keyEvent.which===37||keyEvent.which===38||keyEvent.which===40){
					var arrayToMoveAround=undefined;
					var currentIndex=-1;
					var result=undefined;
					if(keyEvent.which===38||keyEvent.which===40){
						if($scope.inputInFocus!=undefined){							
							arrayToMoveAround=$scope.filteredSongs[$scope.inputInFocus];
							currentIndex=$scope.filteredSongs[$scope.inputInFocus].indexOf($scope.searchTextBoxSelection);
						}
					}else{
						if($scope.activeSongList!=undefined){
							currentIndex=$scope.songGroup[$scope.activeSongList].indexOf($scope.selectedSong);
							arrayToMoveAround=$scope.songGroup[$scope.activeSongList]
						}
						else if($scope.arrowKeyGroup==='AllSongs'){
							currentIndex=$scope.songGroup['All Songs'].indexOf($scope.selectedSong);
							arrayToMoveAround=$scope.songGroup['All Songs']
						}
					}

					if((keyEvent.which==39||keyEvent.which==40) && currentIndex<arrayToMoveAround.length){
						result=arrayToMoveAround[currentIndex+1];
					}
					if((keyEvent.which==37||keyEvent.which==38) && currentIndex>0){
						result=arrayToMoveAround[currentIndex-1];
					}
					if(keyEvent.which===38||keyEvent.which===40){
						$scope.searchTextBoxSelection=result;
					}
					else if($scope.editMode!=true){
						$scope.selectedSong=result;
					}else{
						alert('Scroll disabled in edit mode!');
					}
				}
				else if (keyEvent.which==13){
					$scope.populateSelection($scope.inputInFocus,$scope.searchTextBoxSelection);
					
				}
			}
			$scope.prepareForNewSong=function(){
				$scope.selectedSong=undefined;
				$scope.songs[undefined]=undefined;
			}
			$scope.saveSong=function(){
				
				{
					var dataForSong={
						'songname':$scope.songs[$scope.selectedSong].SongName.S,
						'programowner':$scope.songs[$scope.selectedSong].ProgramOwner.S,
						'style':$scope.songs[$scope.selectedSong].Style.S,
						'tempo':$scope.songs[$scope.selectedSong].Tempo.S,
						'scale':$scope.songs[$scope.selectedSong].Scale.S,
						'timesignature':$scope.songs[$scope.selectedSong].TimeSignature.S,
						'additionalComments':$scope.songs[$scope.selectedSong].additionalComments.S
					}
					var config = {
						method : 'POST',
						url: 'https://157py8chif.execute-api.us-west-2.amazonaws.com/prod/addsongdata',
						data: dataForSong,
						headers:  {
						'Authorization': 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==',
						'Content-Type': 'application/json',
						'x-api-key': 'z3kTAJHQm13CgAIZEzsyM10LfGHgHlfMaVSs8GpA'
						}
					};
					
					var theUrl="https://157py8chif.execute-api.us-west-2.amazonaws.com/prod/addsongdata";
					//$http.post(theUrl,data,config)
					$http(config)
					.success(function(json) {
						alert('Success!');
						if($scope.selectedSong==undefined){
							$scope.addSongToCollections($scope.songs[$scope.selectedSong]);
						}
			        })
			        .error(function(json) {
			        	alert("Error!");
			        });
				}
			}
			$scope.loadList=function(songListkeyToLoad,askConfirmation){
				
				var songLists=Object.keys($scope.songGroup);
				var listFound=false;
				for(var listIdx=0;listIdx<songLists.length;listIdx++){
					if(songListkeyToLoad==songLists[listIdx]){
						listFound=true;
					}
				}
				var contnueWithLoad=false;
				if(songListkeyToLoad==undefined){
					alert("Selection Invalid!");
				}else if(!listFound){
					contnueWithLoad=confirm("Do you want to load the list - \""+songListkeyToLoad+"\" as a new List?");
					if(contnueWithLoad){
						$scope.songGroup[songListkeyToLoad]=[];
					}
				}else if(askConfirmation!=undefined&&askConfirmation==true){
					contnueWithLoad=true;
				}
				if(contnueWithLoad){
					$scope.activeSongList=songListkeyToLoad;
					$('#myModal').modal('hide');
					$scope.searchSongList=undefined;
				}
				
			}
			$scope.getFilteredSongLists=function(){
				var songLists=Object.keys($scope.songGroup);
				var filteredList=[];
				for(var listIdx=0;listIdx<songLists.length;listIdx++){
					if(songLists[listIdx]!='All Songs'){
						var string1=songLists[listIdx].toLowerCase();
						var string2='';
						if($scope.searchSongList!=undefined){
							string2=$scope.searchSongList.toLowerCase();
						}
						if(string1.includes(string2)){
							filteredList.push(songLists[listIdx]);
						}
					}
				}
				return filteredList;
			}
			$scope.getFilteredSongNames=function(){
				var allSongs=$scope.songGroup['All Songs'];
				var filteredList=[];
				for(var songIndex=0;songIndex<allSongs.length;songIndex++){
					var string1=$scope.songs[allSongs[songIndex]].SongName.S.toLowerCase();
					var string2=$scope.songSearch.toLowerCase();
					if(string1.includes(string2)){
						filteredList.push(allSongs[songIndex]);
					}
				}
				$scope.filteredSongs['SongName']=filteredList;
				return filteredList;
			}
			$scope.getFilteredListOfSongData=function(filteringInput,string2Source){
				var filteredSongList=[];
				if(filteringInput===$scope.inputInFocus){
				var allSongs=$scope.songGroup['All Songs'];
				for(var songIdx=0;songIdx<allSongs.length;songIdx++){
					
					var string1=undefined;
						var filteredSongDetails=$scope.songs[allSongs[songIdx]];
						if(filteredSongDetails!=undefined){
							var filteredSongsAttribute=filteredSongDetails[filteringInput];
							if(filteredSongsAttribute!=undefined&&filteredSongsAttribute.S!=undefined){
								string1=filteredSongsAttribute.S.toLowerCase();
							}
						}
						var string2=undefined;
						if(string2Source==undefined){
						var selectedSongDetails=$scope.songs[$scope.selectedSong];
						if(selectedSongDetails!=undefined){
							var selectedSongsAttribute=selectedSongDetails[filteringInput];
							if(selectedSongsAttribute!=undefined&&selectedSongsAttribute.S!=undefined){
								string2=selectedSongsAttribute.S.toLowerCase();
							}
						}
						}else{
							string2=string2Source.toLowerCase();
						}
						var check=$scope.inputInFocus==filteringInput;
						var check2=string2!=''&&string2!=undefined&&string1!=undefined&&string1.includes(string2);
						result=check && check2;
						if(result==true&&filteredSongList.indexOf(allSongs[songIdx])==-1){
							filteredSongList.push(allSongs[songIdx]);
						}
				}
			}
			
			
				$scope.filteredSongs[filteringInput]=filteredSongList;
				return filteredSongList;
			}
			$scope.populateSelection=function(destinationField,sourceSongKey){
				if($scope.inputInFocus==='SongName'){
					$scope.selectedSong= sourceSongKey;
					$scope.songSearch='';
					
				}else if($scope.inputInFocus!=undefined||$scope.inputInFocus!=''){
					$scope.songs[$scope.selectedSong][destinationField].S=$scope.songs[sourceSongKey][destinationField].S;
					$scope.inputInFocus='';
				}
			}
			$scope.addSongToActiveList=function(){
				if($scope.activeSongList==undefined){
					alert('Please load a list first');
				}
				if($scope.selectedSong==undefined){
					var saveAndLoad=confirm("Save Song and Load?");
					if(saveAndLoad){
						$scope.addSongToList($scope.activeSongList,$scope.selectedSong);
					}
				}
				else{
					$scope.addSongToList($scope.activeSongList,$scope.selectedSong);
				}
			}
			$scope.addSongToList=function(groupname,songKey){
				var songListEntry={
						'GroupName':groupname,
						'SongName':songKey
					}
					var config = {
						method : 'POST',
						url: 'https://157py8chif.execute-api.us-west-2.amazonaws.com/prod/addsongtogroup',
						data: songListEntry,
						headers:  {
						'Authorization': 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==',
						'Content-Type': 'application/json',
						'x-api-key': 'z3kTAJHQm13CgAIZEzsyM10LfGHgHlfMaVSs8GpA'
						}
					};
					
					$http(config)
					.success(function(json) {
						alert('Song added to list');
						$scope.songGroup[$scope.activeSongList].push($scope.selectedSong);
			        })
			        .error(function(json) {
			        	alert("Failed to add song to list!");
			        });
			}
		}
]);

