const mongoose = require("mongoose")

const subCategorySchema =new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"The SubCategory is required"],
            unique:[true,"The SubCategory must Be unique"],
            maxlength:[32,"Too long SubCategory"],
            minlength:[2,"Too Short SubCategory"]
        },
        slug:{
            type:String,
            lowercase:true,
        },
        category:{
            type:mongoose.Schema.ObjectId,
            ref:"Categories",
            required:[true,"SubCategory must belong to parent Category "],
        } 
        // Foreign Key (in Sql that refers to other table )
        

    },
    {timestamps:true}
)

module.exports  = mongoose.model("SubCategory",subCategorySchema) ;