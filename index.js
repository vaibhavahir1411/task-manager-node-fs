//require all needed thing from node
const express = require("express");
const app = express();
const Path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");//for generate unique id for individual user

// use all
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, "public")));
app.use(cookieParser());

// Assign a unique user ID using cookies
app.use((req, res, next) => {
    if (!req.cookies.userId) {//if there is no user of that id
        const userId = uuidv4();//it will create new id
        res.cookie("userId", userId, { maxAge: 30 * 24 * 60 * 60 * 1000 }); //stire it fo 30 days(it is in milisecond)
        const userFolder = `./tasks/${userId}`;// it will create new folder in task for perticular user as per id
        if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
        //check that the folder exist if not then it will create new one 
        //recursive : true means, create all missing parent folder ex. you have given path  ./tasks/${userId} if tasks folder doesn't exist it will create
    }
    next();//for show middlewere is completed now move on next
});

app.get("/", function (req, res) {
    const userFolder = `./tasks/${req.cookies.userId}`;

    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder);
    }

    fs.readdir(userFolder, function (err, tasks) {
        if (err || !Array.isArray(tasks)) return res.render("index", { tasks: [] });
        // there is error or array is empty it will return empty array
        tasks.sort((a, b) => {
            const aTime = fs.statSync(`${userFolder}/${a}`).birthtimeMs;
            const bTime = fs.statSync(`${userFolder}/${b}`).birthtimeMs;
            return bTime - aTime;
        });//to sort task as per time

        res.render("index", { tasks });
    });
});

app.get("/file/:filename", function (req, res) {
    const userFolder = `./tasks/${req.cookies.userId}`;
    fs.readFile(`${userFolder}/${req.params.filename}`, "utf-8", function (err, filedata) {
        res.render("showtask", { filename: req.params.filename, filedata });
    });
});

app.get("/delete/:filename", function (req, res) {
    const userFolder = `./tasks/${req.cookies.userId}`;
    fs.unlink(`${userFolder}/${req.params.filename}`, function (err) {
        res.redirect("/");
    });
});

app.get("/edit/:filename", function (req, res) {
    const userFolder = `./tasks/${req.cookies.userId}`;
    fs.readFile(`${userFolder}/${req.params.filename}`, "utf-8", function (err, filedata) {
        res.render("edit", { filename: req.params.filename, filedata });
    });
});

app.post("/update/:filename", function (req, res) {
    const userFolder = `./tasks/${req.cookies.userId}`;
    const newTitle = req.body.title;
    const newDesc = req.body.desc;

    fs.unlink(`${userFolder}/${req.params.filename}`, function (err) {
        fs.writeFile(`${userFolder}/${newTitle}`, newDesc, function (err) {
            res.redirect("/");
        });
    });
});

app.post("/create", function (req, res) {
    const userFolder = `./tasks/${req.cookies.userId}`;
    fs.writeFile(`${userFolder}/${req.body.title}`, req.body.desc, function (err) {
        res.redirect("/");
    });
});

app.listen(3000);
