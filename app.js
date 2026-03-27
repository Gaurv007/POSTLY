const express = require("express");
const app = express();
const path = require("path");
const port = 8080;
const usermodel = require("./model/user");
const postmodel = require("./model/post");

require("dotenv").config();

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

const session = require("express-session");
const flash = require("connect-flash");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.set("view engine","ejs")
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res)=>{ 
   res.render("index.ejs");
})

// login
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.post("/login", async (req, res) => {
    let { email, password } = req.body;
    let user = await usermodel.findOne({ email });

    if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/login"); // return stops execution
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            req.flash("error", "Something went wrong");
            return res.redirect("/login");
        }

        if (result) {
            let token = jwt.sign({ email, userid: user._id }, "secret");
            res.cookie("token", token);  
            return res.redirect("/profile"); // redirect instead of render
        } else {
            req.flash("error", "Invalid password");
            return res.redirect("/login"); // return prevents multiple responses
        }
    });
});


app.get("/profile",(req,res)=>{
    res.render("profile.ejs")
})

//register
app.get("/register",(req,res)=>{
    res.render("register.ejs");
})

app.post("/register", async (req,res)=>{
    let {fullname , name, email , password , number} = req.body;
    
    let user = await usermodel.findOne({email});
    if(user){
        req.flash('error', 'user already exis!');
       return  res.redirect("/register")
  
    }
    
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password , salt ,async (err,hash)=>{
        let newuser = await usermodel.create({
        fullname,
        name,
        email,
        password:hash
        ,number
    });

    let token = jwt.sign({email:email , userid:newuser._id},"secret");
    res.cookie("token",token);
    res.render("profile.ejs");
    
        })
    })
})

//logout
app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
})


//middleware.
function isloggedin(req, res, next) {
    if (!req.cookies.token) return res.redirect("/login");

    try {
        let data = jwt.verify(req.cookies.token, "secret");
        req.user = data;
        next();
    } catch (err) {
        req.flash("error", "Session expired, please login again");
       return  res.redirect("/login");
    }
}

app.listen(port , (req,res)=>{
    
    console.log("app is start listing on port 8080");
})
