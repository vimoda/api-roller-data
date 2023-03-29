const config = require('config');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var cors = require('cors');
// const paginate = require('express-paginate');

//Import Routes
var productsApiRouter = require('./components/product/routes/api');

var app = express();
app.use(cors());

app.use(logger(config.get('logger')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// keep this before all routes that will use pagination
// app.use(paginate.middleware(10, 50));

//views
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, 'public')));
//Routes Web
//routes API
app.use('/api/v1', productsApiRouter);

//database conecction
mongoose.connect(config.get("mongodb.uri"),{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then( () => console.log("Conected to MongoDB") )
.catch( (error) => console.error("Error on MondoDB: ", error) );

module.exports = app;
