/*  Server.js  */
/* Team Name - Bug Riders */
var express = require("express");
var app = express();
var moment = require('moment');
var HTTP_PORT = process.env.PORT || 8080;

function OnHttpStart() {
    console.log("Express server started on port: " + HTTP_PORT);
}

const isEmpty = require('./tests/function');
const inRange = require('./tests/function');
const isLength = require('./tests/validation');
const checkIfEmpty = require('./tests/function');
const forgetpasswordFunctions = require('./models/forgetpassword')
const validateForgetPasswordForm = forgetpasswordFunctions.validateFormForEmpty;


var bodyParser = require("body-parser");
var path = require("path");
app.use(express.urlencoded({ extended: false }));

const ehbs = require('express-handlebars');
app.engine('.hbs', ehbs({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
    }
}));

app.set('view engine', '.hbs');
// database connections
const config = require("./js/config");
const mongoose = require("mongoose");
// database models



// database connection
mongoose.connect(config.dbconn, { useNewUrlParser: true, useUnifiedTopology: true });

// Sessions and Cookies for persistance
const clientSessions = require("client-sessions");
const EmployeeModel = require("./models/EmployeeModel");
const AttendanceModel = require("./models/AttendanceModel");
const ContactModel = require("./models/ContactModel");
app.use(clientSessions({
    cookieName: "myCompanySession",
    secret: "cap805_week6_sessionKeyword",
    duration: 2 * 60 * 1000, // 2 minutes - life of cookie
    activeDuration: 1000 * 180 // 1 minutes life of session
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

app.get("/report", ensureAdminLogin, (req, res) => {
    // alert("working");

    AttendanceModel.find()
        .lean()
        .exec()
        .then((att) => {

            res.render("report", { att: att, hasattendance: !!att.length, user: req.myCompanySession.user, layout: false })
        })
})
// Routes
app.get("/", (req, res) => {
    res.render("login", { user: req.myCompanySession.user, layout: false })
});
app.get("/login", (req, res) => {
    res.render("login", { user: req.myCompanySession.user, layout: false })
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // do stuff for authentication
    if (username === "" || password === "") {
        return res.render("login", { user: req.myCompanySession.user, errorMsg: "Both fields are required!", layout: false })
    }

    // goto the database
    EmployeeModel.findOne({ username: username })
        .exec()
        .then((usr) => {
            if (!usr) {
                res.render("login", { errorMsg: "Login does not exist!", user: req.myCompanySession.user, layout: false });
            }
            if (password != usr.password) {
                res.render("login", { errorMsg: "Password does not match!", user: req.myCompanySession.user, layout: false });

            }

            else {
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
                        hire_date: moment(usr.hire_date).format('YYYY-MM-DD'),
                    };
                    if (usr.isAdmin) {
                        res.redirect("/admindashboard");
                    }
                    else {
                        res.redirect("/mainDashboard");
                    }


                } else {
                    res.render("login", { errorMsg: "Password does not match!", user: req.session.user, layout: false });
                }
            }

        })
        .catch((err) => { console.log("An error occurred: ${err}" + err) });

})

app.get("/logout", (req, res) => {
    req.myCompanySession.reset();
    res.redirect("/");  // home page
})
//Forgot Password
app.get("/forgetpassword", (req, res) => {
    // res.render("forgetpassword", { user: req.myCompanySession.user, layout: false });
    res.render("forgetpassword", {
        user: req.myCompanySession.user,
        layout: false,
        username: "",
        email: "",
        password: "",
        confirmpassword: ""
    });
});

app.post("/forgetpassword", (req, res) => {
    var errorCustom = "";
    var error = '';
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    const isValid = validateForgetPasswordForm(username, email, password, confirmpassword);

    if (isValid.trim() === "valid") {
        EmployeeModel.findOne({ username: username }).exec().then((usr) => {
            if (!usr) {
                errorCustom = 'User does not exists';
                res.render("forgetpassword", {
                    user: req.myCompanySession.user, layout: false, username: req.body.username,
                    email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
                    , errorMsg: "User does not exists"
                });
            } else {
                if (email === usr.email) {
                    EmployeeModel.updateOne(
                        { username: username },
                        {
                            $set: {
                                password: password
                            }
                        }
                    ).exec().then((err) => {
                        if (!err) {
                            res.render("forgetpassword", {
                                user: req.myCompanySession.user, layout: false, username: req.body.username,
                                email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
                                , errorMsg: "Some error occurred while updating the password"
                            });
                        }
                        else {
                            EmployeeModel.updateOne({ username: username }, {
                                $set: {
                                    password: password
                                }
                            }).exec().then((done) => {
                                if (done) {
                                    res.render("login", { user: req.myCompanySession.user, layout: false, successMsg: "Password updated successfully!! Go back to Login Page" });
                                }
                                else {
                                    res.render("forgetpassword", {
                                        user: req.myCompanySession.user, layout: false, username: req.body.username,
                                        email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
                                        , errorMsg: "Some error occurred while updating the password"
                                    });
                                }
                            });
                        }
                    });
                } else {

                    res.render("forgetpassword", {
                        user: req.myCompanySession.user, layout: false, username: req.body.username,
                        email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
                        , errorMsg: "Please enter an email registered with this user"
                    });
                }
            }
        }).catch((err) => {
            error = "Some error occurred while validating the user"
            res.render("forgetpassword", {
                user: req.myCompanySession.user, layout: false, username: req.body.username,
                email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
                , errorMsg: "Some error occurred while validating the user"
            });
        });

    }
    else {
        res.render("forgetpassword", {
            user: req.myCompanySession.user,
            layout: false,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            confirmpassword: req.body.confirmpassword,
            errorMsg: isValid
        });
    }
});

//Forgot Password


// Secure Pages
app.get("/mainDashboard", ensureLogin, (req, res) => {
    res.render("mainDashboard", { user: req.myCompanySession.user, layout: false, success: 'User Login Successful!!' })
});
app.get("/adminDashboard", ensureAdminLogin, (req, res) => {
    res.render("adminDashboard", { user: req.myCompanySession.user, layout: false, success: 'Admin Login Successful!!' })
});
app.get("/profile", ensureLogin, (req, res) => {
    res.render("profile", { user: req.myCompanySession.user, layout: false })
});

app.post("/attendanceSetup", (req, res) => {
    //isoString.split(/[T ]/i, 1)[0] // => '2019-01-01'
    const username = req.myCompanySession.user.username;
    const start_date = req.body.start_date;
    const break_time = req.body.break_time;
    const end_date = req.body.end_date;
    if (inRange(break_time) === false) {
        return res.render("attendance", { user: req.myCompanySession.user, break_errorMsg: "**Break time should between 1 to 5 hours**", layout: false })
    }

    var Attendc = new AttendanceModel({

        username: username,
        start_date: start_date,
        end_date: end_date,
        break_time: break_time,
    });

    console.log("Got here after creating attendance model");
    Attendc.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating : " + Attendc.username + " " + err);
        }
        else {
            console.log(Attendc.username + " was created");
        }
    });
    console.log("Got here after saving " + Attendc.username);
    res.redirect("attendance");
})
// On-Boarding 
app.post("/firstrunsetup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const SIN = req.body.SIN;
    const addressStreet = req.body.addressStreet;
    const addressCity = req.body.addressCity;
    const addressProvince = req.body.addressProvince;
    const zip = req.body.zip;
    const status = req.body.status;
    const departmentID = req.body.departmentID;
    const contactNum = req.body.contactNum;
    const position = req.body.position;
    const hire_date = req.body.hire_date;
    const isAdmin = req.body.isAdmin;

    var Emp = new EmployeeModel({
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        email: email,
        SIN: SIN,
        addressStreet: addressStreet,
        addressCity: addressCity,
        addressProvince: addressProvince,
        zip: zip,
        status: status,
        departmentID: departmentID,
        contactNum: contactNum,
        position: position,
        hire_date: moment(hire_date).format('YYYY-MM-DD'),
        isAdmin: isAdmin
    });

    console.log("Got here after creating user model");
    Emp.save((err) => {
        console.log("Error: " + err + ";");
        if (err) {
            console.log("There was an error creating : " + Emp.firstName + " " + err);
        }
        else {
            console.log(Emp.firstName + " was created");
        }
    });


    res.render("onBoarding",{ user: req.myCompanySession.user, successmsg: "**Employee added successfully!!**", layout: false });
})
//On-Boarding
app.post("/contactusSetup", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const contactNum = req.body.contactNum;
    const query_message = req.body.query_message;


    if (isLength(query_message) === true) {
        return res.render("contactUs", { user: req.myCompanySession.user, query_msg_errorMsg: "**Query message should be minimum of 50 characters!**", layout: false })
    }
    if (checkIfEmpty(query_message) === false) {
        return res.render("contactUs", { user: req.myCompanySession.user, query_msg_errorMsg: "**Query message should not be empty!**", layout: false })
    }
    if (query_message === null || query_message === undefined || contactNum === null || contactNum === undefined || contactNum === "" || username === null || username === undefined || username === "" || email === null || email === undefined || email === "") {
        return res.render("contactUs", { user: req.myCompanySession.user, errorMsg: "**All fields are required!**", layout: false })

    }

    EmployeeModel.findOne({ username: username })
        .exec()
        .then((usr) => {
            if (!usr) {
                res.render("contactUs", { errorMsg: "**User does not exist!**", user: req.myCompanySession.user, layout: false });
            }
            else {
                var ContactUs = new ContactModel({
                    username: username,
                    email: email,
                    contactNum: contactNum,
                    query_message: query_message
                });

                ContactUs.save((error) => {
                    console.log("Error: " + error + ";");
                    if (error) {
                        console.log("There was an error : " + error);
                    }
                    else {
                        console.log(ContactUs.username + " was created");
                    }
                });
                console.log("Got here after saving " + ContactUs.username);
                res.redirect("/contactUs");

            }
        })
        .catch((err) => {
            console.log("An error occurred: ${err}" + err);

        });
})

// Secure Admin Pages
app.get("/attendance", ensureLogin, (req, res) => {
    res.render("attendance", { user: req.myCompanySession.user, layout: false })
});
app.get("/report", ensureLogin, (req, res) => {
    res.render("report", { user: req.myCompanySession.user, layout: false })
});

app.get("/contactUs", ensureLogin, (req, res) => {
    res.render("contactUs", { user: req.myCompanySession.user, layout: false })
});

app.get("/onboarding", ensureLogin, (req, res) => {
    res.render("onBoarding", { user: req.myCompanySession.user, layout: false, successfull: 'Employee added successfully' })
});

app.get("/offboarding", ensureLogin, (req, res) => {
    res.render("offBoarding", { user: req.myCompanySession.user, layout: false })
});
app.get("/editDetails", ensureLogin, (req, res) => {
    res.render("editDetails", { user: req.myCompanySession.user, layout: false })
});
app.get("/editDetails/:id", ensureAdminLogin, (req, res) => {
    const id = req.params.id;


    AttendanceModel.findOne({ _id: id })
        .lean()
        .exec()
        .then((att) => {
            console.log(att);
            res.render("editDetails", { user: req.myCompanySession.user, att: att, layout: false })

        }).
        catch((err) => { console.log("An error occurred: ${err}" + err); });
});
app.post("/editdetails", ensureLogin, (req, res) => {
    const _id = req.body.ID;
    const username = req.body.username;
    const start_date = req.body.start_date;
    const break_time = req.body.break_time;
    const end_date = req.body.end_date;
    console.log(_id);
    AttendanceModel.updateOne(
        { _id: _id },
        {
            $set: {
                start_date: start_date,
                break_time: break_time,
                end_date: end_date
            }
        }
    ).exec()
        .then(() => {
            req.myCompanySession.user = {
                username: username,
                start_date: start_date,
                break_time: break_time,
                end_date: end_date
            }
            res.render("editDetails",{ user: req.myCompanySession.user, successmsg: "**Employee details updated**", layout: false });
        })
        .catch((err) => { console.log("An error occurred: ${err}" + err); });


});
app.post("/inactiveEmployee", ensureLogin, (req, res) => {
    const username = req.body.username;
    const status = "inactive";
    EmployeeModel.findOne({ username: username }).exec().then((usr) => {
        if (!usr) {
            errorCustom = 'User does not exists';
            res.render("offBoarding", {
                user: req.myCompanySession.user, layout: false, username: req.body.username,
                email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
                , errorMsg: "User does not exists"
            });
        } 
        else{
            EmployeeModel.updateOne(
                { username: username },
                {
                    $set: {
                        status: status
        
                    }
                }
            ).exec()
                .then((username) => {

                        res.render("offBoarding", { user: req.myCompanySession.user, successmsg: "**Employee updated inactive**", layout: false });
                    
                })
        }
    }).catch((err) => {
        error = "Some error occurred while validating the user"
        res.render("forgetpassword", {
            user: req.myCompanySession.user, layout: false, username: req.body.username,
            email: req.body.email, password: req.body.password, confirmpassword: req.body.confirmpassword
            , errorMsg: "Some error occurred while validating the user"
        });
    });
    

});
app.get("/aboutus", ensureLogin, (req, res) => {
    res.render("aboutUs", { user: req.myCompanySession.user, layout: false })
});



// Start Express Server
app.listen(HTTP_PORT, OnHttpStart);