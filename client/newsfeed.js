Session.set('voices',window.speechSynthesis.getVoices());
voices = [];
theVoice=null;
audio = new Audio('audio/bark.wav');
Session.set('postsSort', {submitted: -1});







/*

var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['packageName', 'description'];

PackageSearch = new SearchSource('packages', fields, options);

Template.searchResult.helpers({
  getPackages: function() {
    return PackageSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "<b>$&</b>")
      },
      sort: {isoScore: -1}
    });
  },
  
  isLoading: function() {
    return PackageSearch.getStatus().loading;
  }
});

Template.searchResult.rendered = function() {
  PackageSearch.search('');
};

Template.searchBox.events({
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    PackageSearch.search(text);
  }, 200)
});

*/







Template.newsfeed.helpers({
  posts: function() {
    return Posts.find({}, {sort: Session.get('postsSort')});
  }

});

Template.postInfo.helpers({
  ismyrow: function(){
    return Meteor.userId() == this.owner;
  },
  commentCount: function(){return Comments.find({fromPost:this._id}).count()}
});

Template.postInfo.events({
  'click #say': function(event){
    currentPost = this._id;
    var msg = new SpeechSynthesisUtterance(Posts.findOne({_id:this._id}).post);
    if (theVoice) msg.voice=theVoice;
    window.speechSynthesis.speak(msg);
  },
  
  'click .jbsapp-delete-icon': function(){removePost(this._id);},

  'click #comment': function(){
    if(Meteor.user()){
      Meteor.defer(function() {Router.go('comment');});
    } else {
      alert("You must be logged in to comment. Login and try again.");
    }
  }

 
});


function playAudio(){
  audio.play();
}

Template.newsfeed.events({
    'click': function(){
      var postId = this._id;
      Session.set('post', postId);
      //checkVotes(Posts.findOne({_id: postId})); 
    },
    'click #increment': function () {
      if(Meteor.user()) {
        var selectedAnime = Posts.findOne({_id:this._id});
        if($.inArray(Meteor.userId(), selectedAnime.voted) !== -1) {
          if($.inArray(Meteor.userId(), selectedAnime.upVoted) !== -1){
            //console.log("up vote & vote removed");
            var postId = Session.get('post');
            Posts.update(postId, {$inc: {score: -1}});
            Posts.update(postId, {$pull: {voted: Meteor.userId()}});
            Posts.update(postId, {$pull: {upVoted: Meteor.userId()}});
          } else {
            //console.log("up voted; down vote removed");
            var postId = Session.get('post');
            Posts.update(postId, {$inc: {score: 2}});
            Posts.update(postId, {$addToSet: {upVoted: Meteor.userId()}});
            Posts.update(postId, {$pull: {downVoted: Meteor.userId()}});
          }
        } else {
          //console.log("up voted & voted");
          var postId = Session.get('post');
          Posts.update(postId, {$inc: {score: 1}});
          Posts.update(postId, {$addToSet: {voted: Meteor.userId()}});
          Posts.update(postId, {$addToSet: {upVoted: Meteor.userId()}});
        }
        checkVotes(selectedAnime);
      } else {
        alert("You must log in to vote. Log in and try again.");
      }
      
    },

    'click #decrement': function(){

      if(Meteor.user()) {
        var selectedAnime = Posts.findOne({_id:this._id});
        if($.inArray(Meteor.userId(), selectedAnime.voted) !== -1) {
          if($.inArray(Meteor.userId(), selectedAnime.downVoted) !== -1){
            //console.log("down vote & vote removed");
            var postId = Session.get('post');
            Posts.update(postId, {$inc: {score: 1}});
            Posts.update(postId, {$pull: {voted: Meteor.userId()}});
            Posts.update(postId, {$pull: {downVoted: Meteor.userId()}});
          } else {
            //console.log("down voted; up vote removed");
            var postId = Session.get('post');
            Posts.update(postId, {$inc: {score: -2}});
            Posts.update(postId, {$addToSet: {downVoted: Meteor.userId()}});
            Posts.update(postId, {$pull: {upVoted: Meteor.userId()}});
          }
        } else {
          //console.log("down voted & voted");
          var postId =Session.get('post');
          Posts.update(postId, {$inc: {score: -1}});
          Posts.update(postId, {$addToSet: {voted: Meteor.userId()}});
          Posts.update(postId, {$addToSet: {downVoted: Meteor.userId()}});
        } 
        checkVotes(selectedAnime);
      } else {
        alert("You must log in to vote. Log in and try again.");
      }
      
  },

  'click #messageButton': function(){
    if(Meteor.user()){
      Meteor.defer(function() {Router.go('message');});
    } else {
      alert("You must be logged in to send a message. Login and try again.");
    }
  },

   'click #readAll': function(){
    allPosts = Posts.find().fetch();
    console.log(allPosts);
    
    var posts = _.pluck(allPosts, 'post');
    var reversePosts = posts.reverse()

    _.each(reversePosts, function(post){
      var msg = new SpeechSynthesisUtterance(post);
      msg.onend = function(){
        playAudio();      
      }      
      window.speechSynthesis.speak(msg);
    })
  },

  'click #timeUp':function(){
        Session.set('postsSort', {submitted: -1});
               
    },

    'click #timeDown':function(){
        Session.set('postsSort', {submitted: 1});
       
    },
    'click #voteUp':function(){
        Session.set('postsSort', {score: -1});
             
    },

    'click #voteDown':function(){
        Session.set('postsSort', {score: 1});
        
    },

});

function checkVotes(selected){
    var p = Posts.findOne({_id:selected._id});
    //numbers may seem off.. were not sure how to fix

    //console.log(selected.score);
   if(selected.score >=5 && selected.score <10){
    Posts.update({_id: p._id}, {$set: {radius:4}});
    //console.log("radius should be 4");
     //console.log(selected.radius);
  } else if(selected.score >=10 && selected.score <20){
    Posts.update({_id: p._id}, {$set: {radius:6}});
     //console.log("radius should be 6");
     //console.log(selected.radius);
  }else if(selected.score >=20 && selected.score <40){
    Posts.update({_id: p._id}, {$set: {radius:8}});
  }else if(selected.score >=40 && selected.score <50){
    Posts.update({_id: p._id}, {$set: {radius:10}});
  }else if(selected.score >=50 && selected.score <100){
    Posts.update({_id: p._id}, {$set: {radius:15}});
  }else if(selected.score >=100 && selected.score <200){
    Posts.update({_id: p._id}, {$set: {radius:20}});
  }else if(selected.score >=200 && selected.score <400){
    Posts.update({_id: p._id}, {$set: {radius:30}});
  }else if(selected.score >=400 && selected.score <800){
    Posts.update({_id: p._id}, {$set: {radius:35}});
  }else if(selected.score >=800 && selected.score <1600){
    Posts.update({_id: p._id}, {$set: {radius:50}});
  }else if(selected.score >=1600 && selected.score <3200){
    Posts.update({_id: p._id}, {$set: {radius:100}});
  }else if(selected.score >=1600){
    Posts.update({_id: p._id}, {$set: {radius:1000000}});
  }
  if(selected.score <= -4){
    removePost(selected._id);
    //console.log("should delete");
  } else {
    //console.log('should not delete');
  }
}


function removePost(selectedId){
  _.each(Comments.find({fromPost:selectedId}).fetch(), function(comment){
    Comments.remove(comment._id);
  }); 
  _.each(Messages.find({postId:selectedId}).fetch(), function(message){
    Messages.remove(message._id)
  });
  Posts.remove(selectedId);
}