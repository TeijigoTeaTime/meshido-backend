var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
	res.render('index', {
		title: 'Express'
	});
});

router.post('/login', function(req, res, next) {
  req.session.user = {
    name: req.body.name,
    email: req.body.email,
    groupe: req.body.group,
  };

  var response =   {
    "user": {
        "name": req.session.user.name,
        "email": req.session.user.email,
    },
    "_links": {
        "self" : { "method": "GET", "href": "/me" },
        "calendar" : { "method": "GET", "href": "/group/group12345/calender" },
        "logout" : { "method": "GET", "href": "/logout" },
    },
    "_embeded": "",
  }

  res.send(response);
});

router.get('/me', function(req, res, next) {

  var response = "";
  if (req.session.user) {
    response =   {
      "user": {
          "name": req.session.user.name,
          "email": req.session.user.email,
      },
      "_links": {
          "self" : { "method": "GET", "href": "/me" },
      },
      "_embeded": "",
    }
  } else {
    response =   {
      "_links": {
          "self" : { "method": "GET", "href": "/me" },
      },
      "_embeded": "",
    }
  }

  res.send(response);
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();

  var response =   {
    "_links": "",
    "_embeded": "",
  }

  res.send(response);
});

module.exports = router;
