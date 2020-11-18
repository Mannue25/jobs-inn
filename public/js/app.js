import axios from 'axios';
import Swal from 'sweetalert2';


document.addEventListener('DOMContentLoaded', () => {
    const habilidades = document.querySelector('.lista-conocimientos');
// limpiar alertas 

const alertas = document.querySelector('.alertas')

if(alertas) {
    limpiarAlertas();
}
    if(habilidades) {
        habilidades.addEventListener('click', agregarHabilidades);

        // Una vez seleccionados llamar la función

        habilidadesSeleccionado () 

        
    }

    const vacantesListado = document.querySelector('.panel-administracion');
    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado)
    }
});
const habilidades = new Set();
const agregarHabilidades = e => {
    if(e.target.tagName === 'LI') {
       if(e.target.classList.contains('activo')) {

        //Quitarlo del SET y quitar Clase
        habilidades.delete(e.target.textContent);
        e.target.classList.remove('activo')
       } else {
           // agregarlo al SET y agregar la Clase
        habilidades.add(e.target.textContent);
        e.target.classList.add('activo')
       }
    } 
const habilidadesArray = [...habilidades]
  document.querySelector('#habilidades').value = habilidadesArray;
}

const habilidadesSeleccionado = () => {
    const seleccionados = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionados.forEach(seleccionados => {
        habilidades.add(seleccionados.textContent);
    })
    // inyectarlo en el Hideen
    const habilidadesArray = [...habilidades]
  document.querySelector('#habilidades').value = habilidadesArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas')
    const inverval = setInterval(()=>{
        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if(alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas)
            clearInterval(inverval)
        }
    },2000)
}

//Eliminar Vacantes

const accionesListado = e => {
  e.preventDefault();

    if(e.target.dataset.eliminar){
        //Eliminar por medio de axios

        Swal.fire({
            title: '¿Confirmar Eliminación',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {

                // Enviar la petición con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                // axios para eliminar el registro

                axios.delete(url, {params: {url}} )
                .then(function(respuesta) {
                    if(respuesta.status === 200){
                        Swal.fire(
                            'Eliminado',
                            respuesta.data,
                            'success'
                        );

                        //TODO: Eliminar del DOM

                        e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                    }
                })

                .catch(() => {
                    Swal.fire({
                        type: 'error',
                        title: 'Hubo un error',
                        text: 'No se pudo eliminar'
                    })
                })
            }
          })
    } else if (e.target.tagName === 'A') {
        window.location.href = e.target.href
    }
        
    
}