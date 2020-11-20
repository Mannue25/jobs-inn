
const mongoose = require('mongoose');
require('./config/db')
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path')
const router = require('./routes');
const cookieParse = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createErros = require('http-errors')
const passport = require('./config/passport');
const cors = require('cors');
require('dotenv').config({path: 'variables.env'});



const app = express();

// Habilitar BodyParser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))



//configurar Handlebars.

app.engine('handlebars',
exphbs({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
})
);

app.set('view engine', 'handlebars');

//static feils.

app.use(express.static(path.join(__dirname, 'public')));

// mindleware configuración / conexión a mongoDB Atlas
app.use(cookieParse());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

// Iniciarlizar passport

app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash message

app.use(flash());

//Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use(cors())
    
app.use('/', router());

// 404 página no existente.

app.use((req, res, next) => {
    next(createErros(400, 'No Econtrado'));
});

// Administración de los errores.
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});




app.listen(process.env.PORT)