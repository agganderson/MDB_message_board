var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/message_board');

var nameValidator = [
	validate({
		validator: 'isLength',
		arguments: [4,50],
		message: 'Name needs to be at least 4 characters'
		})
	];

var PostSchema = new mongoose.Schema({
	name: String,
	message: String,
	comments: [{type: Schema.Types.ObjectId, required: true, validate: nameValidator, ref: 'Comment'}]
});

var CommentSchema = new mongoose.Schema({
	_post: {type: Schema.Types.ObjectId, required: true, validate: nameValidator, ref: 'Post'},
	name: String,
	comment: String
});



mongoose.model('Post', PostSchema);
var Post = mongoose.model('Post');
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	Post.find({}).populate('comments').exec(function(err, message){
		if(err){
			console.log("Check your code, something is wrong");
		}
		else{
			console.log("WOOOOO");
			res.render('index', {message:message});
		}
	});
});

app.post('/post_message', function(req, res){
	console.log('POST DATA', req.body);
	var message = new Post({name:req.body.name, message:req.body.message});
	message.save(function(err){
		if(err){
			console.log("Didn't get that message, check your code");
		}
		else{
			console.log("Message received");
			res.redirect('/');
		}
	});
});

app.post('/post_comment/:id', function(req, res){
	console.log('POST DATA', req.body);
	Post.findOne({_id:req.params.id}, function(err, post){
		var comment = new Comment({name:req.body.name, comment:req.body.comment});
		comment._post = post._id;
		post.comments.push(comment);
		comment.save(function(err){
			post.save(function(err){
				if(err){
					console.log('Error in post_comment route');
				}
				else{
					res.redirect('/');
				}
			});
		});
	});
});

var server = app.listen(8003, function(){
	console.log('Listening to Message Board on port 8003');
});