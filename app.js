//jshint esversion 6
const express =require("express");
const bodypaser = require("body-parser");
const mongoose =require("mongoose");


const app =express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodypaser.urlencoded({extended:true}));


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const itemschema = new mongoose.Schema({
    name:String
});

const Item = new mongoose.model("Item",itemschema);


const item1 = new Item({
    name:"Welcome to  your  to do list"
});

const item2 = new Item({
    name:"Hit the +button to add a new item"
});

const item3 = new Item({
    name:"<-- Hit  this to  delete an iten"
});

const defaultItems =[item1 ,item2,item3];

const listSchema = {
    name:String,
    items:[itemschema]
}

const List = mongoose.model("List",listSchema);



app.get("/",function(req,res)
{

    Item.find({},function(err,itemsfound)
    {
        if(itemsfound.length==0)
        {
            Item.insertMany(defaultItems ,function(err){

                if(err)
                console.log(err);
                else 
                console.log("Insertion  Successful");
            });
            res.redirect("/");
        }
        else
        {
        res.render('list', 
        {
            listTitle:"Today",
            listitem:itemsfound
        });

        }
        
    });
 

});



app.get("/:customListName",function(req,res)
{
    const customListname =req.params.customListName;

    List.findOne({name:customListname},function(err,foundList) {
        if(!err)
        {
            if(!foundList)
            {
                //create  a new 

                const list =new List ({
                    name:customListname,
                    items:defaultItems
                });
            
                list.save();
                res.redirect("/" + customListname);
            }
            else
            {
                //show  an existing list
                res.render("list",{
                listTitle:foundList.name,
                listitem:foundList.items
            })
            }

        }

        
    });

 
});


app.post("/",function(req,res){
    
    const itemName =req.body.newItem;

    const listName =req.body.listTitle;

    const item = new Item({
        name:itemName
    });

    if(listName == "Today")
    {
        item.save();
        res.redirect("/");

    }
    else
    {

        List.findOne({name:listName},function(err,foundList)
        {

            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);

        });


    }
   
    
});

app.post("/delete",function(req,res){
    
    const checkeditem =req.body.checkbox;
     Item.findByIdAndRemove(checkeditem,function(err)
     {
        if(err)
        {
            console.log(err);
        }
     });
     res.redirect("/");
    
});




app.listen(3000,function(){
    console.log("Server is  running on Port:3000");

});


