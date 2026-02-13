const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", (req, res) =>{
res.render("login")
});

app.listen(port, () =>{
    console.log(`truck app is live at port ${port}`);
    
});
