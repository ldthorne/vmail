// Meteor.subscribe("thePosts");
Meteor.subscribe("theComments");
Meteor.subscribe("theProfiles");
Meteor.subscribe("theSentMessages");
Meteor.subscribe("theReceivedMessages");
Meteor.subscribe("theEmojis");
Meteor.subscribe("farPosts");
// Meteor.subscribe("closePosts")

var currentPosition;

function currentLocation() {
	watcher = navigator.geolocation.watchPosition(function(position){
		currentPosition = position;
	  	var current = new Point(position.coords.latitude,position.coords.longitude);
		Session.set("currentLocation",position.coords); 
		Session.set("theLat",position.coords.latitude);
		Session.set("theLng",position.coords.longitude);
		console.log("in currentlocation: lat="+ current.x+", lng="+current.y);
	});
	return Session.get("currentLocation");

}

function Point(x,y) {
	this.x = x;
  	this.y = y;
}

currentLocation();

Deps.autorun(function(){
	var position = Session.get("currentLocation");
	var lat = Session.get("theLat");
	var lng = Session.get("theLng");
	console.log("in autorun: lat="+lat+" lng="+lng);
	if(!lat) return;
	//onsole.log("in autorun: position = "+JSON.stringify(currentPosition));
	Meteor.subscribe('closePosts', {latitude:lat,longitude:lng});
	console.log("in Autorun: changed position to "+ JSON.stringify(position));
})