const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await  Vacante.find().lean();

    if(!vacantes) return next();
    res.render('home', {
        nombrePagina: 'Jobs Inn',
        tagLine: 'Encuentra el Empleo Ideal Para Ti',
        barra: true,
        boton: true,
        vacantes
    });

  
}