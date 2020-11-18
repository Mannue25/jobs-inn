const mongoose = require("mongoose");
const Usuarios = mongoose.model("Usuarios");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");

exports.subirImagen = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      if (error instanceof multer.MulterError) {
         if  (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande: Máximo 200kb ");
        } else {
          req.flash("error", error.message);
        }
      } else {
        req.flash("error", error.message);
      }
      res.redirect("/administracion");
      return;
    } else {
      return next();
    }
  });
};

// Opciones de Multer
const configuracionMulter = {
  limits: { fileSize: 200000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/perfiles");
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortid.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      // el callback se ejecuta como true o false : true cuando la imagen se acepta
      cb(null, true);
    } else {
      cb(new Error("Formato No Válido"), false);
    }
  },
};

const upload = multer(configuracionMulter).single("imagen");

exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en Jobs Inn",
    tagLine:
      "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta.",
  });
};

exports.validarRegistro = async (req, res, next) => {
  //sanitizar los campos
  const rules = [
    body("nombre")
      .not()
      .isEmpty()
      .withMessage("El nombre es obligatorio")
      .escape(),
    body("email")
      .isEmail()
      .withMessage("El Correo es obligatorio")
      .normalizeEmail(),
    body("password")
      .not()
      .isEmpty()
      .withMessage("La Contraseña es obligatorio")
      .escape(),
    body("confirmar")
      .not()
      .isEmpty()
      .withMessage("Confirmar contraseña es obligatorio")
      .escape(),
    body("confirmar")
      .equals(req.body.password)
      .withMessage("Las Contraseñas no son iguales"),
  ];

  await Promise.all(rules.map((validation) => validation.run(req)));
  const errores = validationResult(req);
  //si hay errores

  if (!errores.isEmpty()) {
    req.flash(
      "error",
      errores.array().map((error) => error.msg)
    );
    res.render("crear-cuenta", {
      nombrePagina: "Crea tu cuenta en Jobs Inn",
      tagLine:
        "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta.",
      mensajes: req.flash(),
    });

    return;
  }

  //si toda la validacion es correcta
  next();
};

exports.crearUsuario = async (req, res, next) => {
  // crear el usuario
  const usuario = new Usuarios(req.body);
  try {
    await usuario.save();
    res.redirect("/iniciar-sesion");
  } catch (error) {
    req.flash("error", error);
    res.redirect("/crear-cuenta");
  }
};

// formaulario para iniciar

exports.formIniciarSesion = (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesión en Jobs Inn",
  });
};

// Form editar el Perfil
exports.formEditarPerfil = (req, res) => {
  res.render("editar-perfil", {
    nombrePagina: "Edita tu perfil en Jobs Inn",
    usuario: req.user,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
  });
};

exports.editarPerfil = async (req, res) => {
  const usuario = await Usuarios.findById(req.user._id);

  usuario.nombre = req.body.nombre;
  usuario.email = req.body.email;
  if (req.body.password) {
    usuario.password = req.body.password;
  }

  if (req.file) {
    usuario.imagen = req.file.filename;
  }

  await usuario.save();

  req.flash("correcto", "Cambios Guardados Correctamente");
  // redirect
  res.redirect("/administracion");
};

// Sanitinizar y validar el formulario de editar perfiles.

exports.validarPerfiles = async (req, res, next) => {
  //Sanitizar

  const rules = [
    body("nombre")
      .not()
      .isEmpty()
      .withMessage("El nombre no puede ir vacío")
      .escape(),
    body("email")
      .isEmail()
      .withMessage("El correo no debe ir vacío")
      .normalizeEmail(),
  ];

  if (req.body.password) {
    body("password")
      .not()
      .isEmpty()
      .withMessage("Ingrese su contraseña")
      .escape();
  }
  await Promise.all(rules.map((validation) => validation.run(req)));
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    req.flash(
      "error",
      errores.array().map((error) => error.msg)
    );
    res.render("editar-perfil", {
      nombrePagina: "Edita tu perfil en Jobs Inn",
      usuario: req.user,
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen,
      mensajes: req.flash(),
    });
  }
  next();
};
