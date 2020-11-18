
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid')

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagLine: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
};

//Agregar las vacantes a la base de datos.

exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);


    // Usuario autor de la vacante.
    vacante.autor = req.user._id;
    // Crear Arreglo de Habilidades

    vacante.habilidades = req.body.habilidades.split(', ')

    // guardar en la base de datos.
    const nuevaVacante = await vacante.save();

    //redireccionar

    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

// Muestra una vacante

exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');    
   
    
    // Si no hay resultados.

    if(!vacante)   return  next();
    
    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true,

       
    });  


}


exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.nombre

    });

}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.habilidades = req.body.habilidades.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url},
    vacanteActualizada, {
        new: true,
        runValidators: true
    });
    res.redirect(`/vacantes/${vacante.url}`)
}

// Validar y Sanitizar los campos de la nuevas vacantes
const { body, validationResult } = require('express-validator');
exports.validarVacante = async (req, res, next) => {

    const rules = [
        body('titulo').not().isEmpty().withMessage('Agrega un título a la vacante').escape(),
        body('empresa').not().isEmpty().withMessage('Agrega una empresa').escape(),
        body('ubicacion').not().isEmpty().withMessage('Agrega una ubicación').escape(),
        body('contrato').not().isEmpty().withMessage('Seleccione el tipo de contrato').escape(),
        body('habilidades').not().isEmpty().withMessage('Agrega un título a la vacante').escape()
    ];
    //sanitizar los campos
  

    //Validar errores

    await Promise.all(rules.map(validation => validation.run(req)))
  

    const errores = validationResult(req);

    if(!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
        tagLine: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes: req.flash()
        });

        return;
 
        
}
       // Si toda la validación es correcta.
next();

}

// Eliminar una vacante

exports.eliminarVacante = async(req, res) => {
    const {id} = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        // Todo bien, si es el usuario, eliminar.
        vacante.remove();
        res.status(200).send('Vacante Eliminada Corectamente');
    } else {
        // no permitido+
        res.status(403).send('Error');
    }


}
    
const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario.id)) {
        return false;
    } 
    return true;
}

//subir archivo en PDF

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
          if (error instanceof multer.MulterError) {
            console.log(error)
            if (error.code === "LIMIT_FILE_SIZE") {
              req.flash("error", "El archivo es muy grande: Máximo 200kb ");
            } else {
              req.flash("error", error.message);
            }
          } else {
            req.flash("error", error.message);
          }
          res.redirect("back");
          return;
        } else {
          return next();
        }
      })
}

// Opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 200000 },
    storage: fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname+ "../../public/uploads/cv");
      },
      filename: (req, file, cb) => {
        const extension = file.mimetype.split("/")[1];
        cb(null, `${shortid.generate()}.${extension}`);
      },
    }),
    fileFilter(req, file, cb) {
      if (file.mimetype === "application/pdf") {
        // el callback se ejecuta como true o false : true cuando la imagen se acepta
        cb(null, true);
      } else {
        cb(new Error("Formato No Válido"), false);
      }
    },
  };
const upload = multer(configuracionMulter).single("cv");



// almacenar los candidatos a la base de datos.
exports.contactar = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url});

    //sino existe la vacante.

    if(!vacante) return next();

    // todo bien, construir el nuevo objeto.
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    // Almancenar la vacante.
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // Mensaje y redirección

    req.flash('correcto', 'Tu CV se envío de manera correcta')
    res.redirect('/');

}


exports.mostrarCandidatos = async (req, res, next) => {

  const vacante = await Vacante.findById(req.params.id);


  if(vacante.autor != req.user._id.toString()) {
    return next()
  } 
    if(!vacante) {
      return next()

    }
  
res.render('candidatos', {
  nombrePagina: `Candidatos Vacante - ${vacante.titulo} `,
  cerrarSesion: true,
  nombre: req.user.nombre,
  imagen: req.user.imagen,
  candidatos: vacante.candidatos
})

}

exports.buscarVacantes = async(req, res) => {
  const vacantes = await Vacante.find({
    $text: {
      $search: req.body.q
    }
  });

  // Mostrar las vacantes

  res.render('home', {
    nombrePagina: `Resultados de la búsqueda : ${req.body.q} `,
    barra: true,
    vacantes
  })
}
