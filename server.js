/* Team Name - Bug Riders */ 
var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;

function OnHttpStart() {
    console.log("Express server started on port: " + HTTP_PORT);
}



var bodyParser = require("body-parser");
var path = require("path");
app.use(express.urlencoded({extended: false}));

const ehbs = require('express-handlebars');
app.engine('.hbs',ehbs({ 
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
    }}));

app.set('view engine', '.hbs');
// database connections
const config = require("./js/config");
const mongoose = require("mongoose");
// database models
const UserModel = require("./models/UserModel");


// database connection
mongoose.connect(config.dbconn, {useNewUrlParser: true, useUnifiedTopology: true});

// Sessions and Cookies for persistance
const clientSessions = require("client-sessions");
const userModel = require("./models/UserModel");
const EmployeeModel = require("./models/EmployeeModel");
const AttendanceModel = require("./models/AttendanceModel");
const MainTableModel = require("./models/MainTableModel");
const ContactModel = require("./models/ContactModel");
app.use(clientSessions({
    cookieName: "myCompanySession",
    secret: "cap805_week6_sessionKeyword",
    duration: 2*60*1000, // 2 minutes - life of cookie
    activeDuration: 1000*60 // 1 minutes life of session
}));

// Security for Role management
function ensureLogin(req, res, next) {
    if (!req.myCompanySession.user) {
        res.redirect("/login");
    } 
    else { 
        next();
    }
}

function ensureAdminLogin(req, res, next) {
    if (!req.myCompanySession.user.isAdmin) {
        res.redirect("/login");
    } 
    else { 
        next();
    }
}


app.use(express.static("views"));
app.use(express.static("public"));

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


// Security for Role management
/*
const usr = {
    username: "user",
    password: "1234",
}
const adminUsr = {
    username: "admin",
    password: "1234",

}
*/

// Routes
app.get("/", (req, res) => { 
    res.render("login", { user: req.myCompanySession.user, layout:false })
});
app.get("/login", (req, res) => { 
    res.render("login", { user: req.myCompanySession.user, layout:false })
});
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // do stuff for authentication
    if (username === "" || password === "") {
        return res.render("login", {user: req.myCompanySession.user, errorMsg: "Both fields are required!", layout: false})
    }

    // goto the database
    MainTableModel.findOne({ username: username })
        .exec()
        .then((usr) => {
            if (!usr) {
                res.render("login", {errorMsg: "Login does not exist!", user: req.myCompanySession.user, layout: false});
            } else {
                // means the user exists
                if (password == usr.password) {
                    // successful login
                    req.myCompanySession.user = {
                        username: usr.username,
                        email: usr.email,
                        firstName: usr.firstName,
                        lastName: usr.lastName,
                        isAdmin: usr.isAdmin,
                        SIN: usr.SIN,
                        addressStreet: usr.addressStreet,
                        addressCity: usr.addressCity,
                        addressProvince: usr.addressProvince,
                        zip: usr.zip,
                        status: usr.status,
                        departmentID: usr.departmentID,
                        contactNum: usr.contactNum,
                        position: usr.position,
                        hire_date: usr.hire_date,
                    };
                    if (usr.isAdmin) {
                        res.redirect("/admindashboard");
                    }
                    else {
                        res.redirect("/mainDashboard");
                    }

                
                } else {
                    res.render("login", {errorMsg: "Password does not match!", user: req.session.user, layout: false});  
                }
            }

        })
        .catch((err) => { console.log("An error occurred: ${err}" + err) });

})

app.get("/logout", (req, res) => {
    req.myCompanySession.reset();
    res.redirect("/");  // home page
})



// Secure Pages
app.get("/mainDashboard", ensureLogin, (req, res) => { 
    res.render("mainDashboard", { user: req.myCompanySession.user, layout:false })
});
app.get("/adminDashboard", ensureAdminLogin,  (req, res) => { 
    res.render("adminDashboard", { user: req.myCompanySession.user, layout:false })
});
app.get("/profile", ensureLogin, (req, res) => { 
    res.render("profile", { user: req.myCompanySession.user, layout:false })
});

app.post("/attendanceSetup", (req, res) => {
    const username = req.myCompanySession.user.username;
    const start_date = req.body.start_date;
    const break_time = req.body.break_time;
    const end_date = req.body.end_date;
    var Attendc = new AttendanceModel({
        
        username: username,
        start_date: start_date, 
        end_date: end_date, 
        break_time:break_time,        
    });

    console.log("Got here after creating attendance model");
    Attendc.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating : "+Attendc.username+" " + err);
        }
        else {
            console.log(Attendc.username+" was created");
        }
    });
    console.log("Got here after saving "+Attendc.username);
    res.redirect("/");
})
app.get("/contactusSetup", (req, res) => {
    var ContactUs = new ContactModel({
        username: 'divya',
        firstName: 'Divya', 
        lastName: 'Basir', 
        email: 'dbasir@myseneca.ca',  
        contactNum: '6476661111',
        query_message: 'error is coming in about us page- test'        
    });

    console.log("Got here after creating user model");
    ContactUs.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating : "+ContactUs.username+" " + err);
        }
        else {
            console.log(ContactUs.username+" was created");
        }
    });
    console.log("Got here after saving "+ContactUs.username);
    res.redirect("/");
})
app.get("/firstrunsetup", (req, res) => {
    var Emp = new EmployeeModel({
        username: 'harsh',
        password: '1234',
        firstName: 'Harsh',
        lastName: 'Patel',
        email: 'hppatel26@myseneca.ca',
        SIN: '223886780',
        addressStreet: 'Fernforest',
        addressCity: 'North York',
        addressProvince: 'Ontario',
        zip: 'L6R2E6',
        status: 'full-time',
        departmentID: '1',
        contactNum: '6476454456',
        position: 'admin',
        hire_date: '2020-02-12',
        isAdmin: false
    });

    console.log("Got here after creating user model");
    Emp.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating : "+Emp.firstName+" " + err);
        }
        else {
            console.log(Emp.firstName+" was created");
        }
    });
    console.log("Got here after saving "+Emp.firstName);
    var maintbl = new MainTableModel({
        username: Emp.username,
        password: Emp.password,
        firstName: Emp.firstName,
        lastName: Emp.lastName,
        email: Emp.email,
        SIN: Emp.SIN,
        addressStreet: Emp.addressStreet,
        addressCity: Emp.addressCity,
        addressProvince: Emp.addressProvince,
        zip: Emp.zip,
        status: Emp.status,
        departmentID: Emp.departmentID,
        contactNum: Emp.contactNum,
        position: Emp.position,
        hire_date: Emp.hire_date,
        isAdmin: Emp.isAdmin,
        start_date: '2020-02-12', 
        end_date: '2020-02-12', 
        break_time: '1', 
    });
    console.log("Got here after creating user model in main table");
    maintbl.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating user in main table : "+maintbl.firstName+" " + err);
        }
        else {
            console.log(maintbl.firstName+" was created in main table");
        }
    });
    res.redirect("/");
})
// Secure Admin Pages
app.get("/attendance", ensureLogin, (req, res) => { 
    res.render("attendance", { user: req.myCompanySession.user, layout:false })
});
app.get("/report", ensureLogin,  (req, res) => { 
    res.render("report", { user: req.myCompanySession.user, layout:false })
});

app.get("/contactUs", ensureLogin, (req, res) => { 
    res.render("contactUs", { user: req.myCompanySession.user, layout:false })
});

app.get("/onboarding", ensureLogin, (req, res) => { 
    res.render("onBoarding", { user: req.myCompanySession.user, layout:false })
});

app.get("/offboarding", ensureLogin, (req, res) => { 
    res.render("offBoarding", { user: req.myCompanySession.user, layout:false })
});
app.get("/editDetails", ensureLogin, (req, res) => { 
    res.render("editDetails", { user: req.myCompanySession.user, layout:false })
});
app.post("/editdetails", ensureLogin, (req, res) => { 
    const username = req.body.username;
    const start_date = req.body.start_date;
    const break_time = req.body.break_time;
    const end_date = req.body.end_date;
    MainTableModel.updateOne(
        {username: username},
        {$set: {
            start_date  : start_date,
            break_time  : break_time,
            end_date    : end_date

        }}
    ).exec()
    .then((err)=>{
        if(err){
            console.log("An error occured while editing details "+err );

        }
        else{req.myCompanySession.user ={
            username    : username,
            start_date  : start_date,
            break_time  : break_time,
            end_date    : end_date
        }}
        
        res.redirect("/editDetails");
    })
    
});
app.get("/aboutus", ensureLogin, (req, res) => { 
    res.render("aboutUs", { user: req.myCompanySession.user, layout:false })
});



// Start Express Server
app.listen(HTTP_PORT, OnHttpStart);