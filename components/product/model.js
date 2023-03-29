const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
    {
        "id": { type : String, require: true, unique: true },
        "name": { type : String, require: true},
        "name_slug": { type : String, require: true},
        "type": { type : String},
        "rarity": { type : String, default: ''},
        "number_rarity": { type : Number, required: [0,1,2,3,4,5], default: 0},
        "current_price": { type : Object},
        "price_for_ghs": { type : Number},
        "ghs_for_usd": { type : Number},
        "orders": { type : Object},
        "caracteristics":{ type : Object},
        "image": { type : String},
        "buy_link": { type : String},
        "minimal_cost": { type: Object},
        "history_price": [{
            date: Date,
            price: Number,
            currencie: String,
            is_min_price: Boolean
          }, {
            autoIndex: false, // Desactiva la creación del índice para el campo _id
          }]/**{date:,price:10,currencie:"RLT",is_min_price:true} */
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

module.exports = mongoose.model("product", ProductSchema);