// Author: Nicole Beecher
// Game of Thrones Final Project

var express = require("express");
var bodyParser = require("body-parser");
var mysql = require('./dbcon.js');

var app = express();
app.use(bodyParser.urlencoded({extended: true})); 

//allows me to leave off .ejs
//from exampled "home.ejs"
app.set("view engine", "ejs");

//allows public folder to be used within templates
app.use(express.static("public"));

//server port
app.set('port', 8080);

///////////////////////////////////////////////////////////////////////////////////
// Main menu Page

app.get("/", function(req, res){
	res.render("home");	
});

///////////////////////////////////////////////////////////////////////////////
// List, Add, Update or Delete a person page

var fnameI = [];
var lnameI = [];

app.post("/addPerson", function(req, res){
	var fNI = req.body.fnameInput;
	var lNI = req.body.lnameInput;
	var sI = req.body.statusInput;
	var rI = req.body.personRegionAdd;
	var aI = req.body.personAllegianceAdd;
	fnameI.push(fNI);
	lnameI.push(lNI);	
	var context = {};
	var sql = "INSERT INTO person (fname, lname, status, location, allegiance) VALUES (?, ?, ?, ?, ?)"
	mysql.pool.query(sql, [fnameI, lnameI, sI, rI, aI], function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {person: result};
			fnameI = [];
			lnameI = [];			
		}
	});

	res.redirect("/person");
});

app.post("/updatePerson", function(req, res){
	var updateID = req.body.personForU;
	var fU = req.body.firstNameUpdate;
	var lU = req.body.lastNameUpdate;
	var sU = req.body.statusInputUpdate;
	var rU = req.body.personRegionUpdate;
	var aU = req.body.personAllegianceUpdate;
	var sql = "UPDATE person SET fname= ?, lname= ?, status= ?, location= ?, allegiance= ? WHERE person_id= ?";
	mysql.pool.query(sql, [fU, lU, sU, rU, aU, updateID], function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {person: result};		
		}

	});
	fnameI = [];
	lnameI = [];
	res.redirect("/person");
});

app.get("/deletePerson/:id", function(req, res){
	var deleteID = req.params.id;
	var context = {};
	mysql.pool.query("DELETE FROM person WHERE person_id ='" + deleteID + "'", function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {person: result};
	}
});
	res.redirect("/person");
});


function getPersonForU(req,res,next){
	var SQL = "SELECT person.person_id, CONCAT(fname, ' ', lname) AS name FROM person ORDER BY name";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.personForU = result;
			return next();
		}
	});
}

function getPersonRegion(req,res,next){
	var SQL = "SELECT region.region_id, region.name AS region FROM region";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.personRegionAdd = result;
			req.personRegionUpdate = result;
			return next();
		}
	});
}

function getPersonAllegiance(req,res,next){
	var SQL = "SELECT allegiance.a_id, allegiance.house AS allegiance FROM allegiance";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.personAllegianceAdd = result;
			req.personAllegianceUpdate = result;
			return next();
		}
	});
}

function getPersonList(req,res,next){
	var SQL = "SELECT person.person_id, person.fname, person.lname, person.status, region.name AS region, allegiance.house AS allegiance FROM person INNER JOIN region ON region.region_id = person.location INNER JOIN allegiance ON allegiance.a_id = person.allegiance";
	mysql.pool.query(SQL, function (err, result){
		req.person = result;
		next();
	});
}

function renderPersonPage(req,res){
	res.render("person", {
		personRegionAdd: req.personRegionAdd,
		personAllegianceAdd: req.personAllegianceAdd,
		personRegionUpdate: req.personRegionUpdate,
		personAllegianceUpdate: req.personAllegianceUpdate,
		personForU: req.personForU,
		person: req.person
	});
}

app.get("/person", getPersonForU, getPersonRegion,getPersonAllegiance, getPersonList, renderPersonPage);

///////////////////////////////////////////////////////////////////////////////////////////////
// List, Add, or Delete a region page

var regionName = [];
var regionPop = [];

app.post("/addRegion", function(req, res){
	var rN = req.body.regionName;
	var rP = req.body.regionPop;
	regionName.push(rN);
	regionPop.push(rP);
	var context = {};
	var sql = "INSERT INTO region (name, population) VALUES (?, ?)"
	mysql.pool.query(sql, [regionName, regionPop], function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {region: result};
			regionName = [];
			regionPop = [];
		}
	});

	res.redirect("/region");
});

app.get("/deleteRegion/:id", function(req, res){
	var deleteID = req.params.id;
	var context = {};	
	mysql.pool.query("DELETE FROM region WHERE region_id ='" + deleteID + "'", function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {region: result};
	}
});
	res.redirect("/region");
});

app.get("/region", function(req, res){	
	var context = {};
	mysql.pool.query("SELECT region.region_id, region.name AS name, region.population AS population FROM region", function (err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {region: result};
			res.render("region", context);			
		}			
	});	
});

/////////////////////////////////////////////////////////////////////////////
// List, Add, or Delete a title page

var titlePost = [];

app.post("/addTitle", function(req, res){
	var aT = req.body.addTitle;
	titlePost.push(aT);
	var context = {};
	mysql.pool.query("INSERT INTO title (designation) VALUES ('" + titlePost + "')", function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {title: result};
			titlePost = [];
		}
	});

	res.redirect("/title");
});

app.get("/deleteTitle/:id", function(req, res){
	var deleteID = req.params.id;
	var context = {};
	mysql.pool.query("DELETE FROM title WHERE title_id ='" + deleteID + "'", function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {title: result};
	}
});
	res.redirect("/title");
});

app.get("/title", function(req, res){	
	var context = {};
	mysql.pool.query("SELECT title.title_id, title.designation AS title FROM title", function (err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {title: result};
			res.render("title", context);
		}			
	});
});

////////////////////////////////////////////////////////////////////////////////
// List, Add, or Delete an allegiance page

var allegiancePost = [];

app.post("/addAllegiance", function(req, res){
	var aN = req.body.aName;
	allegiancePost.push(aN);
	var context = {};
	mysql.pool.query("INSERT INTO allegiance (house) VALUES ('" + allegiancePost + "')", function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {allegiance: result};
			allegiancePost = [];
		}
	});

	res.redirect("/allegiance");
});


app.get("/deleteAllegiance/:id", function(req, res){
	var deleteID = req.params.id;
	var context = {};
	mysql.pool.query("DELETE FROM allegiance WHERE a_id ='" + deleteID + "'", function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {allegiance: result};
	}
});
	res.redirect("/allegiance");
});

app.get("/allegiance", function(req, res){	
	var context = {};
	mysql.pool.query("SELECT allegiance.a_id, allegiance.house AS house FROM allegiance", function (err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {allegiance: result};
			res.render("allegiance", context);
		}			
	});
});

////////////////////////////////////////////////////////////////////////////////////
// List, Add, or Delete a castle page

var castleName = [];
var rulerN = [];
var regionN = [];

app.post("/addCastle", function(req, res){
	var cN = req.body.castleName;
	var ruN = req.body.rulerInput;
	var rN = req.body.regionInput;
	castleName.push(cN);
	rulerN.push(ruN);
	regionN.push(rN);
	var context = {};
	var sql = "INSERT INTO castle (name, ruler, region) VALUES (?, ?, ?)"
	mysql.pool.query(sql, [castleName, rulerN, rN], function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {castle: result};
			castleName = [];
			var rulerN = [];
			var regionN = [];
		}
	});

	res.redirect("/castle");
});


app.get("/deleteCastle/:id", function(req, res){
	var deleteID = req.params.id;
	var context = {};
	mysql.pool.query("DELETE FROM castle WHERE castle_id ='" + deleteID + "'", function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {castle: result};
	}
});
	res.redirect("/castle");
});

function getRegions(req,res,next){
	var regionSQL = "SELECT region.region_id, region.name AS name FROM region";
	mysql.pool.query(regionSQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.regionInput = result;
			return next();
		}
	});
}

function getRulers(req,res,next){
	var rulerSQL = "SELECT allegiance.a_id, allegiance.house AS ruler FROM allegiance";
	mysql.pool.query(rulerSQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.rulerInput = result;
			return next();
		}
	});
}

function getCastleList(req,res,next){
	var listSQL = "SELECT castle.castle_id, castle.name AS name, allegiance.house AS ruler, region.name AS region FROM castle INNER JOIN allegiance ON ruler = allegiance.a_id INNER JOIN region ON region = region.region_id";
	mysql.pool.query(listSQL, function (err, result){
		req.list = result;
		next();
	});
}

function renderCastlePage(req,res){
	res.render("castle", {
		regionInput: req.regionInput,
		rulerInput: req.rulerInput,
		castle: req.list
	});
}

app.get("/castle", getRegions, getRulers, getCastleList, renderCastlePage);

//////////////////////////////////////////////////////////////////////////////////////
// List and change a title for a person page
// Many to many

app.get("/deleteTitleM/:pid/:tid", function(req, res){
	var deletePID = req.params.pid;
	var deleteTID = req.params.tid;
	var context = {};
	var SQL = "DELETE FROM person_title WHERE p_id= ? AND t_id= ?"
	mysql.pool.query(SQL, [deletePID, deleteTID], function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {person_title: result};
	}
});
	res.redirect("/title/m");
});

var upPID = [];
var upTID = [];

app.get("/updateTitleM/:pid/:tid", function(req, res){	
	var updatePID = req.params.pid;
	var updateTID = req.params.tid;	
	upPID.push(updatePID);
	upTID.push(updateTID);

	res.redirect("/updateTitle/m");	
	
});

function getUpdateTitleM(req,res,next){
	var SQL = "SELECT title.title_id, title.designation AS title FROM title";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.updateTitle_m = result;
			return next();
		}
	});
}

function renderUpdatePage(req,res){
	console.log(upPID);
	console.log(upTID);
	res.render("updateTitle_m", {
		updateTitle_m: req.updateTitle_m
	});
}

app.get("/updateTitle/m", getUpdateTitleM, renderUpdatePage);

app.post("/updateTm", function(req, res){
	var updateT = req.body.updateTitle_m;
	var updatePID = upPID;
	var updateTID = upTID;
	var SQL = "UPDATE person_title SET t_id = ? WHERE p_id= ? AND t_id= ?";
	mysql.pool.query(SQL, [updateT, updatePID, updateTID], function(err, result){
		if(err){
			console.log(err);
		}
		else{
			upPID = [];
			upTID = [];	
			context = {person_title: result};
		}
	});

	res.redirect("/title/m");
});

app.post("/addTitleM", function(req, res){
	var updateID = req.body.addName_m;
	var tN = req.body.addTitle_m;
	//updateP.push(updateID)
	//updateRe.push(tN);	
	var sql = "INSERT INTO person_title (p_id, t_id) VALUES (?, ?)";
	mysql.pool.query(sql, [updateID, tN], function(err, result){
		if(err){
			console.log(err);
		}
		else{
			context = {person_title: result};		
		}

	});
	res.redirect("/title/m");
});

function getPersonM(req,res,next){
	var SQL = "SELECT person.person_id, CONCAT(person.fname, ' ', person.lname) AS name FROM person";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.addName_m = result;
			return next();
		}
	});
}

function getTitleM(req,res,next){
	var SQL = "SELECT title.title_id, title.designation AS title FROM title";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.addTitle_m = result;
			return next();
		}
	});
}


function getTitleMList(req,res,next){
	var SQL = "SELECT person.person_id, CONCAT(person.fname,' ',person.lname) AS name, title.title_id, title.designation AS title FROM person INNER JOIN person_title ON person.person_id = person_title.p_id INNER JOIN title ON title.title_id = person_title.t_id ORDER BY name, title";
	mysql.pool.query(SQL, function (err, result){
		req.title_m = result;
		next();
	});
}

function renderTitleMPage(req,res){
	res.render("title_m", {
		addName_m: req.addName_m,
		addTitle_m: req.addTitle_m,
		updateTitle_m: req.updateTitle_m,
		title_m: req.title_m
	});
}

app.get("/title/m", getPersonM, getTitleM, getTitleMList, renderTitleMPage);

///////////////////////////////////////////////////////////////////////////////////////////
// List and change region for a person page

app.post("/updateRegion", function(req, res){
	var updateID = req.body.personUpdate;
	var rN = req.body.regionUpdate;
	var sql = "UPDATE person SET location= ? WHERE person_id = ?";
	mysql.pool.query(sql, [rN, updateID], function(err, result){
	if(err){
		console.log(err);
	}
	else{
		context = {person: result};		
	}

});

	res.redirect("/region/1");
});

function getRegionForUpdate(req,res,next){
	var SQL = "SELECT region.region_id, region.name AS name FROM region";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.regionUpdate = result;
			return next();
		}
	});
}

function getPersonForUdpdate(req,res,next){
	var SQL = "SELECT person.person_id, CONCAT(fname, ' ', lname) AS name FROM person ORDER BY name";
	mysql.pool.query(SQL, function (err, result){
		if(err){
			console.log(err);
		}
		else{
			req.personUpdate = result;
			return next();
		}
	});
}

function getPtoRList(req,res,next){
	var SQL = "SELECT person.person_id, CONCAT(fname,' ',lname) AS name, region.region_id, region.name AS region FROM person INNER JOIN region ON region.region_id = person.location ORDER BY name, region";
	mysql.pool.query(SQL, function (err, result){
		req.list = result;
		next();
	});
}

function renderRegion1Page(req,res){
	res.render("region_1", {
		regionUpdate: req.regionUpdate,
		personUpdate: req.personUpdate,
		region_1: req.list
	});
}

app.get("/region/1", getRegionForUpdate, getPersonForUdpdate, getPtoRList, renderRegion1Page);

//////////////////////////////////////////////////////////////////////////////////////////////////
// Search page

var searchPost = [];

app.post("/submitSearch", function(req, res){
	var querySearch = req.body.lastName;
	searchPost.push(querySearch);
	res.redirect("/search");
});

app.get("/search", function(req, res){
	var context = {};
	mysql.pool.query("SELECT person.person_id, person.fname, person.lname, person.status, region.name AS region, allegiance.house AS allegiance FROM person INNER JOIN region ON region.region_id = person.location INNER JOIN allegiance ON allegiance.a_id = person.allegiance WHERE person.lname = '" + searchPost + "'", function (err, result){
		if(err){
			console.log(err);			
		}
		else{
			context = {search: result};			
			res.render("search", context);
		}			
	});

	//clear array for next search
	searchPost = [];
});

//set up server
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});