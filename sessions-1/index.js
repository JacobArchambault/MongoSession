/*    sessions    */
var express = require('express');
var app = express();

var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs({defaultLayout: 'main'})); 
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var User = require('./modules/User.js');

session = require('express-session');  // we are storing session data in MemoryStore; use for development purposes only 
app.use(session({secret: 'random text', resave: true, saveUninitialized: true}))


app.get('/', function(req, res){
	req.session.views = (!req.session.views) ? 1 : req.session.views + 1;   // incrrement visit cou
	res.render('loginForm', {views: req.session.views});
});


app.use('/summary', function(req, res){  
	
	if(req.method == 'POST') {
	
		username = req.body.username;   // get info from posted html form
		pw = req.body.password;
	
		User.findOne( {username: username, password: pw}, function(err, user) {  // is user in the db?
			if(err) {
				res.render('errorPage', {msg : err});
			}
			else if (!user) {
		    	res.render('errorPage', {msg : "No user with these credentials. Please log in."});
			}
			else {                                  // user is in database       
				req.session.loggedIn = username;   // set login cookie name and value
				req.session.fullname = user.full_name;
				req.session.flavor = user.preference;   // get flavor from db, set in session
				req.session.age = user.user_age;
				req.session.tickets = user.violations;
			
			
				if(user.violations < 2) 
					getsIceCream = true;
				else
			    	getsIceCream = false;
			
			
				res.render('summary', {
					name: req.session.fullname, 
					age: req.session.age, 
					flavor: req.session.flavor,
					visits: req.session.views,
					tickets: req.session.tickets,
					iceCream: getsIceCream
				});
			}
    	}); 
	}
	else if (req.method == 'GET' && req.session.loggedIn) {
		res.render('summary', {
			name: req.session.fullname, 
			age: req.session.age, 
			flavor: req.session.flavor,
			visits: req.session.views,
			tickets: req.session.tickets,
			iceCream: getsIceCream
		});
	}
	else {
		res.redirect('/');
	}

});


app.use('/page3', function(req, res){   // sort by city
	
	if(req.session.fullname) {    // user has logged in
	
		if(req.method == "GET") {       // user is logged in and clicked the page 3 link
	    	res.render('page3', {tableVisible: false} );	
		
		}
		else {                             // user posted the city name
	    	var selectedCity = req.body.city;
	
	    	User.find( {city: selectedCity}, function(err, users) {    // filter documents by city
		   		if (err) {
		        	res.render('errorPage', {msg : err});
		    	}
		    	else if (!users) {
		        	res.render('errorPage', {msg : "No user with these credentials. Please log in."});
		    	}
		    	else {                                   // users from selected city    
			    	console.log(users)
			    	res.render('page3', {tableVisible: true, cityUsers: users} );   // make table visible, populate with users
		    	}
        	});   
		}
		
	}
	else {
		res.redirect('/');   // if not logged in, redirect to login
	}
});


app.listen(3000,  function() {
	console.log('Listening on port 3000, ctrl-c to quit');
    });
