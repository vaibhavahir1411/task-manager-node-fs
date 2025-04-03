const express = require("express");
const app = express();
const Path = require("path");
const fs = require("fs");

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(Path.join(__dirname,"public")))

app.get("/",function (req,res) {
    fs.readdir(`./tasks`,function (err,tasks){
        //task sort by time 
        tasks.sort((a, b) => {
            const aTime = fs.statSync(`./tasks/${a}`).birthtimeMs;
            const bTime = fs.statSync(`./tasks/${b}`).birthtimeMs;
            return bTime - aTime; 
        });
        res.render("index",{tasks : tasks});
    })  
})

app.get("/file/:filename",function (req,res) {
    fs.readFile(`./tasks/${req.params.filename}`,"utf-8",function (err,filedata) {
        res.render("showtask",{filename : req.params.filename,filedata : filedata})
        
    }) 
})

app.get("/delete/:filename",function (req,res) {
    fs.unlink(`./tasks/${req.params.filename}`,function (err,filedata) {
        console.log('file deleted');
        res.redirect("/")
    }) 
})

app.get("/edit/:filename", function (req, res) {
    fs.readFile(`./tasks/${req.params.filename}`, "utf-8", function (err, filedata) {
        res.render("edit", { filename: req.params.filename, filedata: filedata });
    });
});


app.post("/update/:filename", function (req, res) {
    const newTitle = req.body.title;
    const newDesc = req.body.desc;


    fs.unlink(`./tasks/${req.params.filename}`, function (err) {
        fs.writeFile(`./tasks/${newTitle}`, newDesc, function (err) {
            res.redirect("/");
        });
    });
});


app.post("/create",function (req,res) {
    fs.writeFile(`./tasks/${req.body.title}`,req.body.desc,function (err) {
        res.redirect("/")
    })
    
})

app.listen(3000)