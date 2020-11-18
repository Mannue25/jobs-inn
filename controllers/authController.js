
const Mongoose = require('mongoose');
const passport = require('passport');
const Vacante = Mongoose.model('Vacante')
const Usuarios = Mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'

});

//Revisar si el usuario está autenticado.

exports.verificarUsuario = (req, res, next) => {

    //Revisar el Usuario.

    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/iniciar-sesion');
}


exports.mostrarPanel = async (req, res) => {

    // constar el usuario autenticado

const vacantes = await Vacante.find({autor: req.user._id})

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagLine: 'Crea y Administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    });

};

exports.cerrarSesion = (req, res) => {
    req.logout();

    req.flash('correcto', 'Cerraste sesión correctamente')
    return res.redirect('/iniciar-sesion')
}

// formulario para reestablecer password
exports.formReestablecerPassword = (req, res ) => {
    res.render('reestablecer-password', {
        nombrePagina : 'Reestablece tu Password',
        tagline : 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    })
}


exports.enviarToken = async(req, res, next) => {
    const usuario = await Usuarios.findOne({email: req.body.email});

    if(!usuario) {
        req.flash('error', 'No existe es cuenta');
        return res.redirect('/iniciar-sesion')
    }

    // Si el usuario existe generar un token

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;


    // Guardar el usuario

    await usuario.save();

    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    console.log(resetUrl);

   // Enviar notificcaión por EMail.

    await enviarEmail.enviar({
        usuario,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Revisa tu Email')
    res.redirect('/iniciar-sesion')

}


exports.reestablecerPassword = async(req, res) => {
    const usuario = await Usuarios.findOne( {
        token : req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta nuevamente');

    return res.redirect('/reestablecer-password')
    }

    // Todo bien, mostrar el formulario.

    res.render('nuevo-password', {
        nombrePagina: 'Nuevo password'
    })
}

// Almacena el password en la base de datos.

exports.guardarPassword = async (req, res) => {

    const usuario = await Usuarios.findOne( {
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    // El usaurio no existe, el token es invalido.
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta nuevamente');

    return res.redirect('/reestablecer-password')
    }

    // Guardar en la base de dato, limpiar valores previos.
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // Agregar y elminar valores del objeto

    await usuario.save()

    req.flash('correcto', 'Passoword Modificado Correctamente' );
    res.redirect('/iniciar-sesion')
}