
module.exports = {
    seleccionarHabilidades: (seleccionadas = [], opciones) => {
        const habilidades = ['Proactivo', 'Trabajo en Equipo', 'Responsable', 'Big Data', 'Excel Avanzado', 'Power BI', 'Google Data Studio', 'Google Analytics', 'Analítico', 'dinámico', 'Atención a clientes', 'Ventas', 'Compras', 'Finanzas']
        console.log(opciones.fn())

        let html = '';
        habilidades.forEach(habilidad => {
            html += `
            <li ${seleccionadas.includes(habilidad) ? ' class="activo"' : ''}>${habilidad}</li>
            
            `;
        });

        return opciones.fn().html = html;
   
    },

   tipoContrato: (seleccionados, opciones) => {
       return opciones.fn(this).replace (
           new RegExp(` value="${seleccionados}"`), '$& selected="selected"'
       )
   },

   mostrarAlertas: (errores = {}, alertas) => {
      const categorias = Object.keys(errores);
      console.log(categorias);


      let html = ``
      if(categorias.length) {
        errores[categorias].forEach(error => {
            html+= `<div class="${categorias} alerta">
            ${error}
            </div> 
            
            
            `

        });
      }

      return  alertas.fn().html = html;
   }
   

}