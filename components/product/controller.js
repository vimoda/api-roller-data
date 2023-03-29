const ProductSchema = require("./model");

const list = async (req, res, next) => {
    try {
        const per_page = req.query.per_page ? parseInt(req.query.per_page) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (per_page * page) - per_page;
        const find = {};
        ProductSchema
            .find(find)
            .skip(offset)
            .limit(per_page)
            .then(async (data) => {
                const count = await ProductSchema.count(find);
                const pages = Math.ceil(count / per_page);
                res.json({
                    success: true,
                    message: "ok",
                    paginate: {
                        per_page: per_page,
                        total: count,
                        pages: pages,
                        page: page,
                        previous_page: (page > 1 ? (page - 1) : 1),
                        next_page: ((page < pages) ? (page + 1) : page)
                    },
                    data: data
                });
            })
            .catch((error) => res.json({ success: false, message: error, data: {} }));
    } catch (error) {
        console.log(error.message);
    }
};

const create = async (req, res, next) => {
    let product = await ProductSchema
        .findOne({ id: req.body.id });
    if (product) {
        let new_history_price = {date: new Date(), price: 0, currencie: "RLT", is_min_price: false};
        Object.entries(req.body).forEach(([key, value]) => {
            let average_price = 0;
            if (key == "type" && value!="") { product.type = value; }
            if (key == "caracteristics") { product.caracteristics = value; }
            if (key == "orders") { product.orders = value; }
            if (key == "current_price") {
                product.current_price = value;
                new_history_price.price = parseFloat(value.price);
                new_history_price.currencie = value.currencie;
                if(product.minimal_cost == undefined){
                    product.minimal_cost = {"prev_price":value.price,"price":value.price,"at_minimum_price":false, "percentage":100};
                }else{
                    const new_price = parseFloat(value.price);
                    const current_min_price = parseFloat(product.minimal_cost.price);
                    product.minimal_cost.at_minimum_price = false;

                    if(product.history_price.length>0){
                        //Calcular el promedio de precios
                        const prices = product.history_price.map(hp => hp.price);
                        if(prices.length > 0) { average_price = prices.reduce((total, price) => total + price) / prices.length; }
                    }
                    
                    if(new_price<average_price){
                        is_promotion = true;
                        if(new_price<current_min_price){
                            const percentage = parseFloat(((new_price*100)/current_min_price).toFixed(4));
                            product.minimal_cost = {"prev_price":current_min_price, "price": new_price, "at_minimum_price":true, "percentage":percentage};
                            new_history_price.is_min_price = true;
                        }
                    }
                }
            }
            if (key == "image") { product.image = value; }
            if (key == "price_for_ghs") { product.price_for_ghs = value; }
            if (key == "ghs_for_usd") { product.ghs_for_usd = value; }
            if (key == "buy_link") { product.buy_link = value; }
        });
        product.history_price.push(new_history_price);
        product.save().then((data) => res.json({ success: true, message: "ok", data: data })).catch((error) => res.json({ success: false, message: error, data: {} }));
    } else {
        let product = new ProductSchema(req.body);
        product.minimal_cost = product.minimal_cost = {"prev_price":parseFloat(req.body.current_price.price),"price":parseFloat(req.body.current_price.price),"at_minimum_price":false, "percentage":100};
        product.at_minimum_price = false;
        product.history_price.push({date:new Date(),price:parseFloat(req.body.current_price.price),currencie:req.body.current_price.currencie,is_min_price:false})
        product.save().then((data) => res.json({ success: true, message: "ok", data: data })).catch((error) => res.json({ success: false, message: error, data: {} }));
    }
};

const find = (req, res, next) => {
    const { id } = req.params;
    ProductSchema
        .findById(id)
        .then((data) => res.json({ success: true, message: "ok", data: data }))
        .catch((error) => res.json({ success: false, message: error, data: {} }))
};



const findbyIdRollercoin = (req, res, next) => {
    const { id } = req.params;
    ProductSchema
        .find({id})
        .then((data) => res.json({ success: true, message: "ok", data: data }))
        .catch((error) => res.json({ success: false, message: error, data: {} }))
};

const search = async (req, res, next) => {
    try {
        const per_page = req.query.per_page ? parseInt(req.query.per_page) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (per_page * page) - per_page;
        let query = {};
        if(req.body.filters){
            Object.entries(req.body.filters).forEach(([key, filter]) => {
                if(filter.type == "equal"){ query[filter.name] = filter.value; }
                else if(filter.type == "l_than"){query[filter.name] = { $lte: filter.value };}
                else if(filter.type == "g_than"){query[filter.name] = { $gte: filter.value };}
                else if(filter.type == "between"){
                    if(!filter.value2){throw ("requiere value2");}
                    query[filter.name] = { $gte: filter.value, $lte: filter.value2 };
                }
                else if(filter.type == "different"){}
            });
            console.log(query)
        }
        
        let sort = {};
        if (req.body.sort) {
            Object.entries(req.body.sort).forEach(([key, value]) => {
                sort[key] = value;
            });
        }

        let select = { id: 1, name: 1, name_slug: 1, type: 1, rarity: 1, current_price: 1 };
        if (req.body.select) {
            select = {};
            Object.entries(req.body.select).forEach(([key, value]) => {
                select[key] = value;
            });
        }
        //if(by_town){query.slug_town = { $regex: '.*' + town + '.*' };}
        ProductSchema
            .find(query)
            .skip(offset)
            .limit(per_page)
            .sort(sort)
            .select(select)
            .then(async (data) => {
                const count = await ProductSchema.count(query);
                const pages = Math.ceil(count / per_page);
                res.json({
                    success: true,
                    message: "ok",
                    paginate: {
                        per_page: per_page,
                        total: count,
                        pages: pages,
                        page: page,
                        previous_page: (page > 1 ? (page - 1) : 1),
                        next_page: ((page < pages) ? (page + 1) : page)
                    },
                    data: data
                });
            })
            .catch((error) => res.json({ success: false, message: error, data: {} }));
    } catch (error) {
        res.json({ success: false, message: error.message, data: {} })
    }
    
};

const edit = (req, res, next) => {
    const { id } = req.params;
    const { name, api } = req.body;
    ProductSchema
        .updateOne({ _id: id }, { $set: { name, api } })
        .then((data) => res.json({ success: true, message: "ok", data: data }))
        .catch((error) => res.json({ success: false, message: error, data: {} }))
};


const remove = (req, res, next) => {
    const { id } = req.params;
    ProductSchema
        .remove({ _id: id })
        .then((data) => res.json({ success: true, message: "ok", data: data }))
        .catch((error) => res.json({ success: false, message: error, data: {} }))
};

const deleteManyById = (req, res, next) => {
    const {ids} = req.body;
    const promise = new Promise((resolve, reject) => {
        let resul = [];
        let promises = Object.entries(ids).map(async ([id, value]) => {
            if(value!=""){
                console.log(`Eliminar id: ${value}`)
                await ProductSchema.deleteOne({ _id: value });
                let exist = await ProductSchema.findById(value);
                resul[value] = {"delete":((exist)?false:true)};
            }
        });
        Promise.all(promises).then(() => {
            resolve(resul);
        }).catch((error) => {
            reject(error.message);
        });
    });
    promise.then((message) => {
        res.status(200).send({ success: true, message: "ok", data: JSON.stringify(message) });
    }).catch((error) => {
        res.status(500).send(error.message);
    });
};

const update = (req, res, next) => {
    let power = 0;
    let price = 0;

    const promise = new Promise((resolve, reject) => {
        
        let result_update = req.body;
        let promises = Object.entries(req.body).map(async ([id, value]) => {
            try{
                let product = await ProductSchema.findOne({ "id": id });
                if (product) {
                    const result = await product.updateOne(
                        { id: id },
                        { $pull: { history_price: { price: { $exists: false } } } }
                    );
                    console.log(`Se ${id} eliminaron ${result.modifiedCount} historiales de precios con índice "price"`);
                    product = await ProductSchema.findOne({ "id": id });
                    console.log(`ID: ${id} ${value.type}`)
                    if(value.type && value.type!=""){ product.type = value.type;}
                    let promotion = {};
                    let average_price = 0, is_promotion = false, percentage_discount = 0, discount = 0;
                    
                    let new_history_price = {date: new Date(), price: 0, currencie: "RLT", is_min_price: false};
                    new_history_price.price = parseFloat(value.price);
                    new_history_price.currencie = value.currency;
                    if(product.current_price){
                        if (product.current_price.price) {
                            product.current_price.price = value.price;
                            if(product.minimal_cost == undefined){
                                product.minimal_cost = {"prev_price":parseFloat(value.price),"price":parseFloat(value.price),"at_minimum_price":false, "percentage":100};
                            }else{
                                const new_price = parseFloat(value.price);
                                const current_min_price = parseFloat(product.minimal_cost.price);
                                product.minimal_cost.at_minimum_price = false;
                                if(product.history_price.length>0){
                                    //Calcular el promedio de precios
                                    const prices = product.history_price.map(hp => hp.price);
                                    if(prices.length > 0) { average_price = parseFloat((prices.reduce((total, price) => total + price) / prices.length).toFixed(4)); }
                                }
                                
                                if(new_price<average_price){
                                    is_promotion = true;
                                    discount = parseFloat((average_price-new_price).toFixed(4));
                                    percentage_discount = parseFloat(((discount*100)/new_price).toFixed(4));
                                    if(new_price<current_min_price){
                                        const percentage = parseFloat(((new_price*100)/current_min_price).toFixed(4));
                                        product.minimal_cost = {"prev_price":current_min_price, "price": new_price, "at_minimum_price":true, "percentage":percentage};
                                        new_history_price.is_min_price = true;
                                    }
                                }
                            }
                        }
                    }else{
                        product.current_price = {"price":value.price, "currency":value.currency}
                    }
                    if (product.type == "miner" && product.caracteristics && product.caracteristics.power && product.caracteristics.power.value) {
                        power = product.caracteristics.power.value;
                        price = value.price;
                        product.price_for_ghs = price / power;
                        product.ghs_for_usd = power / price;
                    }
                    if (product.image == "" && value.img !="") { product.image = value.img; }
                    product.history_price.push(new_history_price);
                    
                    await product.save();
                    result_update[id]["result"] = { "in_api": "yes", "message": "update", success: true };
                    result_update[id]["minimun"] = product.minimal_cost;
                    result_update[id]["caracteristics"] = product.caracteristics;
                    result_update[id]["price_for_ghs"] = product.price_for_ghs;                    
                    result_update[id]["ghs_for_usd"] = product.ghs_for_usd;
                    result_update[id]["average_price"] = average_price;
                    result_update[id]["is_promotion"] = is_promotion;
                    result_update[id]["discount"] = discount;
                    result_update[id]["percentage_discount"] = percentage_discount;
                    console.log(`ID ${id} ${product.type}`)
                } else {
                    result_update[id]["result"] = { "in_api": "not", "message": "product not found", success: false};
                }
            } catch (error) {
                const stack = error.stack;
                let message = error.message;
                console.error(`ID: ${id}`,message,stack);
                result_update[id]["result"] = { "in_api": "yes", "message": `Error: ${message}`, success:false };
            }
        });
        Promise.all(promises).then(() => {
            resolve(result_update);
        }).catch((error) => {
            reject(error);
        });
    });
    promise.then((message) => {
        res.send({ success: true, message: "ok", data: message });
    }).catch((error) => {
        res.status(500).send(error);
    });
}

const updatePriceHistoryByIdRollercoin = (req, res, next) => {
    let power = 0;
    let price = 0;

    const promise = new Promise((resolve, reject) => {
        
        let result_update = req.body;
        let promises = Object.entries(req.body).map(async ([id, value]) => {
            try{
                
                let product = await ProductSchema.findOne({ "id": id });
                if (product) {
                    const result = await product.updateOne(
                        { _id: product._id },
                        { $pull: { history_price: { price: { $exists: true } } } }
                    );
                    console.log(`Se eliminaron ${result.nModified} historiales de precios con índice "price"`);
                } else {
                    result_update[id]["result"] = { "in_api": "not", "message": "product not found", success: false};
                }
            } catch (error) {
                const stack = new Error(error).stack;
                const errorLine = stack.split('\n')[1];
                let message = error.message;
                console.error(`ID: ${id}`,message,errorLine);
                result_update[id]["result"] = { "in_api": "yes", "message": `Error: ${message}`, success:false };
            }
        });
        Promise.all(promises).then(() => {
            resolve(result_update);
        }).catch((error) => {
            reject(error);
        });
    });
    promise.then((message) => {
        res.send({ success: true, message: "ok", data: message });
    }).catch((error) => {
        res.status(500).send(error);
    });
}

module.exports = {
    list,
    create,
    find,
    search,
    edit,
    remove,
    update,
    findbyIdRollercoin,
    deleteManyById,
    updatePriceHistoryByIdRollercoin
}