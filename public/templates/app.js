
import { renderContent } from './renderContent.js';
import {replaceVariables} from './utils.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
const {PDFDocument,StandardFonts,rgb,BlendMode} = PDFLib;

//Variables globales



    //Campos globales para datos de comparecientes , representantes, etc.
    const camposPorCategoria = {
        compareciente : ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'RUT', 'Email', 'Telefono'],
        representante: ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'RUT', 'Email', 'Telefono']
    };


    //Array para almacenar campos de datos dinamicos
    let campos = [] ;

        // Estado de la aplicación
        const state = {
            templates: [],
            currentTemplate: null,
            formData: {}
        };

        let signatureFields = [];

        //Almacena los bytes del PDF rederizado
        let pdfBytesCache = null;


        //Indicador para evitar renderizaciones simultaneas
        let isRendering = false;

        // Función para resetear el estado de renderización si se queda bloqueado
        function resetRenderingState() {
            if (isRendering) {
                console.warn('Resetting stuck rendering state');
                isRendering = false;
            }
        }

        // Resetear cada 5 segundos si está bloqueado
        setInterval(resetRenderingState, 5000);

        // Reset inmediato al cargar la página
        setTimeout(() => {
            isRendering = false;
            console.log('Forcing reset of rendering state on page load');
        }, 1000);

        // Variables para arrastrar y redimensionar
        let draggingField = null;
        let resizingField = null;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        let resizeCorner = null;


        //VARIABLES PARA TAMAÑO DE PAGINA PDF CANVAS 
        const PAGE_SIZES = {
            letter:{width:612, height:792}, 
            oficio:{width:612, height:936},
        };


        //VARIABLES PARA PAGINACION PDF/CANVAS
        let currentSignaturePage = 1;
        let totalSignaturePages = 1;


        //SIMULACION DE PERSONA EN LA BD 
        const personaDB = {
            '20295756-0':{
                rut:'20295756-0',
                nombre: 'Rositamelo Perez',
                apellidoPaterno: 'Moreno',
                apellidoMaterno: 'Rojas',
                rut: '20295756-0',
                email: 'benjamin@gmail.com',
                telefono: '934656428',
            }
        };


        // Elementos del DOM
        const signatureCanvas = document.getElementById('signatureCanvas');
        const templatesListEl = document.getElementById('templatesList');
        const newTemplateBtn = document.getElementById('newTemplateBtn');
        const saveTemplateBtn = document.getElementById('saveTemplateBtn');
        const generatePdfBtn = document.getElementById('generatePdfBtn');
        const templateNameEl = document.getElementById('templateName');
        const templateContentEl = document.getElementById('templateContent');
        const formFieldsEl = document.getElementById('formFields');
        const designTab = document.getElementById('designTab');
        const fillTab = document.getElementById('fillTab');
        const tabs = document.querySelectorAll('.tab');
        const currentTemplateNameEl = document.getElementById('currentTemplateName');
        const pdfPreviewEl = document.getElementById('pdfPreview');
        const generatedPdfPreviewEl = document.getElementById('generatedPdfPreview');
        const templateTitleEl = document.getElementById('templateTitle');
        const pageSizeEl = document.getElementById('pageSize');
        const fontSizeEl = document.getElementById('fontSize');
        const titleFontSizeEl = document.getElementById('titleFontSize');




        //FUNCION PARA ARRASTRAR CUADRO DE VARIABLES MINIMIZAR Y EXPANDIR 
        const panel = document.getElementById('insertVarPanel');
        const minimizeBtn = document.getElementById('minimizeInsertVarPanel');
        minimizeBtn.addEventListener('click', () => {
            panel.classList.toggle('minimized');
            minimizeBtn.innerHTML = panel.classList.contains('minimized') ? '+' : '&#8211;';
        });

        //Hacer el panel arrastrable 
        const header = document.getElementById('insertVarPanelHeader');
        let offsetX = 0, offsetY = 0, isDragging = false;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.getBoundingClientRect().left;
            offsetY = e.clientY - panel.getBoundingClientRect().top;
            document.body.style.userSelect = 'none'; // Deshabilitar selección de texto
        });

        document.addEventListener('mousemove', (e) => {
            if(!isDragging) return;
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
            panel.style.right = 'auto'; // Asegurar que no se ajuste al lado derecho
        });


        document.addEventListener('mouseup',() => {
            isDragging = false;
            document.body.style.userSelect = ''; // Habilitar selección de texto
        });
        
        

        // Cargar plantillas guardadas del localStorage
        function loadTemplates() {
            const savedTemplates = JSON.parse(localStorage.getItem('pdfTemplates')) || [];
            state.templates = savedTemplates;
            renderTemplatesList();
        }

        if(state.currentTemplate){
            state.currentTemplate.signatureFields = [...signatureFields];
        }
            redrawCanvas();
            updateSignatureFieldsJson();


        //Funcion para manejar la eliminacion de plantillas 
        function deleteTemplate(templateId) {
            if (!confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
                return; // Si el usuario cancela, no hacer nada
            }
            state.templates = state.templates.filter(template => template.id !== templateId);

            //Actualiza el LocalStorageeeleal
            localStorage.setItem('pdfTemplates', JSON.stringify(state.templates));

            //Renderizar plantilla actualizada 
            renderTemplatesList();
            
            alert('Plantilla eliminada correctamente!');
        }

        //Actualizar el tamaño de la fuente
        fontSizeEl.addEventListener('change', (e) => {
            state.fontSize = parseInt(e.target.value,12);
            generateDesignPreview();
        });
        //Documento tiene por defecto un 12 de tamaño de letra 
        state.fontSize = parseInt(fontSizeEl.value, 12);


        //Cambiar el titulo a la plantilla
        templateTitleEl.addEventListener('input', (e) => {
            state.title = e.target.value;
            generateDesignPreview(); // Metodo para actualizar la vista previa 
        });


        // Cambiar el tamaño de la fuente del título
        titleFontSizeEl.addEventListener('change', (e) => {
            state.titleFontSize = parseInt(e.target.value, 18);
            generateDesignPreview(); // Metodo para actualizar la vista previa 
        });

        //Inicializar valores por defento del titulo 
        state.title = '';
        state.titleFontSize = parseInt(titleFontSizeEl.value, 10 || 18);


        // Renderizar lista de plantillas
        function renderTemplatesList() {
            templatesListEl.innerHTML = '';
            
            if (state.templates.length === 0) {
                templatesListEl.innerHTML = '<div class="empty-state">No hay plantillas guardadas</div>';
                return;
            }
            
            state.templates.forEach(template => {
                const templateEl = document.createElement('div');
                templateEl.className = 'template-card';
                if (state.currentTemplate?.id === template.id) {
                    templateEl.classList.add('active');
                }
                
                templateEl.innerHTML = `
                    <h3>${template.name}</h3>
                    <p>${template.fields.length} campos variables</p>
                    <small>Creada: ${new Date(template.createdAt).toLocaleDateString()}</small>
                    <button class="delete-button" data-id="${template.id}">Eliminar</button>
                `;
                

                // Evento para seleccionar plantilla
                templateEl.addEventListener('click', () => {
                    selectTemplate(template);
                });

                //Evitar que el clic en el boton de eliminar seleccione la plantilla
                templateEl.querySelector('.delete-button').addEventListener('click', (e) => {
                    e.stopPropagation(); // Evitar que el clic se propague al contenedor
                    deleteTemplate(template.id);
                });
                
                templatesListEl.appendChild(templateEl);
            });
        }

        // Seleccionar plantilla
        function selectTemplate(template) {
            clearSignatureCanvasAndFields(); // Limpiar canvas y campos de firma

            // Limpiar campos de entrada
            state.currentTemplate = template;

            //Ajustar el tamaño del canvas
            const size = PAGE_SIZES[template.pageSize || 'oficio'];
            signatureCanvas.width = size.width;
            signatureCanvas.height = size.height;

            // Mostrar contenido de la plantilla
            currentTemplateNameEl.textContent = template.name;
            pageSizeEl.value = template.pageSize || 'oficio'; // Tamaño de página


            //Cargar las coordenadas de la firma de la plantilla seleccionada 
            signatureFields = [];


            // Mostrar contenido de la plantilla redendizado
            renderTemplatesList();
            
            renderFormFields();

            state.title = template.title;
            state.titleFontSize = template.titleFontSize || 20;
            templateTitleEl.value = state.title;

           // Cambias a pestaña "Rellenar"
            switchTab('fill');
            // Mostrar vista previa vacía
            generatePDF(true);
            updateSignatureCanvasPreview();
        }

        // Renderizar campos del formulario
        function renderFormFields() {
            if (!state.currentTemplate) return;
            
            formFieldsEl.innerHTML = '';
            state.formData = {}; // Resetear datos del formulario


            //Usar los campos estructurados de la plantilla y ordenarlos por rol e indice :
            const camposOrdenados = (state.currentTemplate.campos || []).slice().sort((a, b) => {
                if(a.rol !== b.rol) return a.rol.localeCompare(b.rol);
                return a.indice - b.indice;
             });

             if(camposOrdenados.length === 0){
                formFieldsEl.innerHTML = `<div class="empty-state">Esta plantilla no tiene campos variables</div>`;
                generatePdfBtn.style.display = 'none';
                return;
             }
            
            generatePdfBtn.style.display = 'block';
            
            camposOrdenados.forEach(campo => {
                const fieldGroup = document.createElement('div');
                fieldGroup.className = 'form-group';


                 fieldGroup.innerHTML = `
                    <label for="field_${campo.marcador}">${campo.nombreCampo}:</label>
                    <input type="text" id="field_${campo.marcador}" 
                           placeholder="Ingrese ${campo.nombreCampo.toLowerCase()}" 
                           data-field="${campo.marcador}">
                `;                
            
                const input = fieldGroup.querySelector('input');
                //Si es rut, agregar el evento de autocompletar 
                if(campo.nombreCampo.toLowerCase().includes('rut')){
                    input.addEventListener('blur', (e) => {
                        const rut = e.target.value;
                        if(personaDB[rut]){
                            //Autocompletar los demas campos si existen en la plantilla 
                            Object.keys(personaDB[rut]).forEach(key => {
                                //Buscar el input correspondiente
                                const cleanKey = key.toUpperCase();
                                const otherInput = document.getElementById('field_{{' + cleanKey + '}}');
                                if(otherInput){
                                    otherInput.value = personaDB[rut][key];
                                    state.formData[cleanKey] = personaDB[rut][key];
                                }
                            });
                            generatePDF(true);
                            updateSignatureCanvasPreview();
                        }
                    });
                }

                fieldGroup.querySelector('input').addEventListener('input', (e) => {
                    // Limpiar el marcador de llaves dobles si las tiene
                    const cleanMarker = campo.marcador.replace(/^\{\{|\}\}$/g, '');
                    state.formData[cleanMarker] = e.target.value;
                    console.log('Input changed:', cleanMarker, e.target.value);
                    console.log('Current formData:', state.formData);
                    generatePDF(true); // Actualizar vista previa al escribir
                    updateSignatureCanvasPreview(); // Actualizar el canvas de firma
                });
                
                formFieldsEl.appendChild(fieldGroup);
            });
        }

        // Funcion para envolar texto segun el ancho maximo
    export  function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = line + (line ? ' ' : '') + words[i];
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width <= maxWidth) {
            line = testLine;
        } else {
            lines.push(line);
            line = words[i];
        }
    }
    if (line) {
        lines.push(line);
    }

    return lines;
}


        // Generar PDF
        async function generatePDF(forPreview = false) {

            if (!state.currentTemplate) return;
            
            console.log('generatePDF called with forPreview:', forPreview);
            console.log('Current template:', state.currentTemplate);
            console.log('Current formData:', state.formData);
            
            // Crear nuevo PDF
            const { PDFDocument, StandardFonts } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            const pageSize = PAGE_SIZES[state.currentTemplate?.pageSize || 'oficio'];
            const page = pdfDoc.addPage([pageSize.width, pageSize.height]); // <-- CORRECTO// MEDIDAS CREADAS CON VARIABLE GLOBAS 
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            //Reemplazar variables en el contenido con funcion externa utils.js
            const finalContent = replaceVariables(state.currentTemplate.content, state.formData);
            console.log('Original content:', state.currentTemplate.content);
            console.log('Final content after replaceVariables:', finalContent);
            

            //Orden pagina para que se ajuste al salto de lineas en distintas paginas
            const margin = 50;
            const pageWidth = page.getWidth();
            const usableWidth = pageWidth - margin * 2; // Ancho util de la pagina menos los margene

            const options = {
                title: state.title,
                titleFontSize: state.titleFontSize || 20,
                content: finalContent,
                fontSize: state.fontSize || 12,
                margin: 50,
                pageWidth: usableWidth, // Ancho de la pagina menos los margenes 
                yStart: page.getHeight() - margin, //Altura inicial documento
            };

            renderContent(pdfDoc, page, font,boldFont, options,state.formData);

            //Asegurar de tener muchas paginas para las firmas
            const maxPage = Math.max(1, ...signatureFields.map(f => f.page || 1));
            while (pdfDoc.getPageCount() < maxPage) {
            pdfDoc.addPage([pageSize.width, pageSize.height]);
            }

            // Dibujar todos los cuadros de firma 
            signatureFields.forEach((field) => {

                //Asegurar que esta definida la pagina donde se realizara la firma 
                const pageIndex = (field.page || 1) - 1; // Restar 1 para obtener el índice de la página
                const pdfPage = pdfDoc.getPage(pageIndex);
                pdfPage.drawRectangle({
                    x: field.x,
                    y: page.getHeight() - field.y - field.height, // Invertir la coordenada Y
                    width: field.width,
                    height: field.height,
                    borderWidth: 1,
                    color: rgb(0, 0, 0),
                    borderColor: rgb(0, 0, 0),

        });
    });

            const pdfBytes = await pdfDoc.save();

            if (forPreview) {
                // Para vista previa
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                generatedPdfPreviewEl.src = url;
            } else {
                // Para descarga
                download(pdfBytes, `${state.currentTemplate.name}_${new Date().toISOString().slice(0,10)}.pdf`, "application/pdf");
            }
        }

        //FUNCION PARA CREAR PDF BINARIO EN EL CANVAS
        async function generatePDFBytes() {
        const { PDFDocument, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const pageSize = PAGE_SIZES[state.currentTemplate?.pageSize || 'oficio'];
        const page = pdfDoc.addPage([pageSize.width, pageSize.height]); // <-- CORRECTO// MEDIDAS CREADAS CON VARIABLE GLOBAS 
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const finalContent = replaceVariables(state.currentTemplate.content, state.formData);


                    //Orden pagina para que se ajuste al salto de lineas en distintas paginas
            const margin = 50;
            const pageWidth = page.getWidth();
            const usableWidth = pageWidth - margin * 2; // Ancho util de la pagina menos los margene

        const options = {
            title: state.title,
            titleFontSize: state.titleFontSize || 20,
            content: finalContent,
            fontSize: state.fontSize || 12,
            margin: 50,
            pageWidth: usableWidth, // Ancho de la pagina menos los margenes
             yStart: page.getHeight() - margin,
    };

    renderContent(pdfDoc, page,font, boldFont, options,state.formData);

    //Asegurar de tener muchas paginas para las firmas (mas de una pagina poder poner firmas)
    const maxPage = Math.max(1, ...signatureFields.map(f => f.page || 1 ));
    while (pdfDoc.getPageCount() < maxPage){
        pdfDoc.addPage([pageSize.width, pageSize.height]);
    }

    //Dibujar todos los cuadros de firma 
    signatureFields.forEach((field) => {
        const pageIndex = (field.page ||  1) -1; // Restar 1 para obtener el índice de la página
        const pdfPage = pdfDoc.getPage(pageIndex);
        pdfPage.drawRectangle({
            x: field.x,
            y: page.getHeight() - field.y - field.height, // Invertir la coordenada Y
            width: field.width,
            height: field.height,
            borderWidth: 1,
            color: rgb(0, 0, 0),
            borderColor: rgb(0, 0, 0),
        });
    });

    return await pdfDoc.save();
}


/////FUNCIONES PARA JSON MANDAR A API
        //Funcion para crear JSON con coordenadas de firma 
        function generateSignatureFieldsJson(){
            return signatureFields.map(field => ({
                nombre: field.nombre,
                x: field.x,
                y: field.y,
                width: field.width,
                height: field.height,
                page: field.page 
        }));
    }



    //Funcion para mostrar JSON de las firmas en la interfaz 
    function updateSignatureFieldsJson(){
        const signatureFieldsJsonEl = document.getElementById('signatureFieldsJson');
        if(signatureFields.length === 0){
            signatureFieldsJsonEl.textContent = 'No hay campos de firma';
        }else{
        const signatureData = signatureFields.map(field => ({
            nombre: field.nombre,
            x: field.x,
            y: field.y,
            width: field.width,
            height: field.height,
            page: field.page
        }));
        signatureFieldsJsonEl.textContent = 'Campo de firma: ' + JSON.stringify(signatureData, null, 2);
    }
    }


    //////////FUNCION CUANDO PUEDA UTILIZAR ESIGN 
//     async function sendToESign() {
//     const signatureData = generateSignatureFieldsJson();

//     try {
//         const response = await fetch('https://api.esign.com/signatures', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${yourApiToken}`
//             },
//             body: JSON.stringify({
//                 documentId: state.currentTemplate.id,
//                 signatures: signatureData
//             })
//         });

//         if (!response.ok) {
//             throw new Error('Error al enviar los datos a eSign');
//         }

//         const result = await response.json();
//         alert('Firmas enviadas correctamente a eSign');
//         console.log(result);
//     } catch (error) {
//         console.error(error);
//         alert('Hubo un error al enviar las firmas a eSign');
//     }
// }


/////////FUNCIONES PARA MOVER Y REDIMENSIONAR EL CUADRO DE FIRMA Y FIRMA EN GENERAL 




  //Funcion para detectar click para mover o redimensionar el cuadro de firma
signatureCanvas.addEventListener('mousedown', (e) => {
    const {x,y} = getCanvasRelativeCoords(e, signatureCanvas);
    draggingField = null;
    resizingField = null;
    resizeCorner = null;

    

   let overResize = false;
    for (let field of signatureFields) {
        // Coordenadas del recuadro en el canvas (sin conversión 72/96)
        const fx = field.x;
        const fy = field.y;
       //Esta dentro del recuadro???
        if (
            x >= fx && x<= fx + field.width &&
            y >= fy && y <= fy + field.height
        ) {

            //Esta en la esquina designaada para redimensionar
            if(
                x >= fx + field.width - 10 &&
                x <= fx + field.width &&
                y >= fy + field.height - 10 &&
                y <= fy + field.height
            ){
                overResize = true;
                resizingField = field;
                resizeCorner = {
                    startX: x,
                    startY: y,
                    startWidth: field.width,
                    startHeight: field.height
                };
            } else {
                draggingField = field;
                dragOffsetX = x - fx;
                dragOffsetY = y - fy;
            }
            //No crear firma si estamos sobre un cuadro existente
            return;
        }
    }
    signatureCanvas.style.cursor = overResize ? 'nwse-resize' : 'default';
    });

        //FUNCION PARA MOBER O REDIMENSIONAR EL CUADRO DE FIRMA
        signatureCanvas.addEventListener('mousemove', (e) => {

        const {x,y} = getCanvasRelativeCoords(e, signatureCanvas);
        ///Cambiar el cursor si estamos sobre un cuadro de firma en la esquina para expandir 
        let overResize = false;
        for (let field of signatureFields){
            const fx = field.x;
            const fy = field.y;
            if(
                x >= fx + field.width - 10 &&
                x <= fx + field.width &&
                y >= fy + field.height - 10 &&
                y <= fy + field.height
            ){
                overResize = true;
                break;
            }
        }
        signatureCanvas.style.cursor = overResize ? 'nwse-resize' : 'default';

    if (draggingField || resizingField) {
        

        if (draggingField) {
            draggingField.x = x - dragOffsetX;
            draggingField.y = y - dragOffsetY;
        } else if (resizingField && resizeCorner) {
            resizingField.width = Math.max(30, resizeCorner.startWidth + (x - resizeCorner.startX));
            resizingField.height = Math.max(20, resizeCorner.startHeight + (y - resizeCorner.startY));
        }
        redrawCanvas();
        updateSignatureFieldsJson();
        generatePDF(true); // Actualizar vista previa al mover o redimensionar
    }
});

signatureCanvas.addEventListener('mouseup', () => {
    draggingField = null;
    resizingField = null;
    resizeCorner = null;
});


//FUNCION PARA ELIMINAR CUADRO DE FIRMA
signatureCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
const {x,y} = getCanvasRelativeCoords(e, signatureCanvas);

    for (let i = 0; i < signatureFields.length; i++) {
        const field = signatureFields[i];
        const fx = field.x;
        const fy = field.y;
        if (
            x >= fx && x <= fx + field.width &&
            y >= fy && y <= fy + field.height
        ) {
            if (confirm(`¿Eliminar recuadro de firma de ${field.signerName}?`)) {
                signatureFields.splice(i, 1);
                redrawCanvas();
                updateSignatureFieldsJson();
                generatePDF(true); // Actualizar vista previa al eliminar
            }
            break;
        }
    }
});



        ///EVENTO PARA CREAR CLICKS EN EL CANVAS 
        signatureCanvas.addEventListener('click', (e) =>{
            if (draggingField || resizingField) return;

            const {x,y} = getCanvasRelativeCoords(e, signatureCanvas);

            // Verificar si se hizo clic en un campo de firma existente
            for (let field of signatureFields){
                const fx = field.x;
                const fy = field.y;
                if(
                    x >= fx && x <= fx + field.width &&
                    y >= fy && y <= fy + field.height
                ){
                    alert(`Campo de firma existente: ${field.signerName}`);
                    return; // Si se hace clic en un campo existente, salir
                }
            }  
            //Obtener tipo y numero desde los inputs en rellenar firma
            const tipo = document.getElementById('signatureType').value;
            const numero = document.getElementById('signatureNumber').value;
            const nombreFirma = numero ? `${tipo}${numero}`: tipo;



            // Convertir coordenadas a puntos PDF (72 puntos por pulgada)
            const newSignatureField = {
                tipo,
                numero: numero? parseInt(numero) : null,
                nombre: nombreFirma,
                x:x,
                y:y,// Invertir la coordenada Y para que coincida con el sistema de coordenadas del PDF
                width: 100,
                height: 50,
                page: currentSignaturePage // Página actual
                 };


                 //Agregar el nuevo recuadro al array 
                 signatureFields.push(newSignatureField);



                 //Redibujar el canvas
                 redrawCanvas();

                 //Actualizar el JSON mostrado 
                 updateSignatureFieldsJson();
        });


async function redrawCanvas() {
    if (isRendering) {
        console.warn('Renderizacion en curso, espera que termine');
        return;
    }

    const ctx = signatureCanvas.getContext('2d');
    // Limpiar el canvas
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);

    // Renderizar el PDF en el canvas
    if (pdfBytesCache) {
        isRendering = true; // Marcar como renderizando
        try {
            const pageSize = PAGE_SIZES[state.currentTemplate?.pageSize || 'oficio'];
            signatureCanvas.width = pageSize.width;
            signatureCanvas.height = pageSize.height;

            const pdf = await pdfjsLib.getDocument({ data: pdfBytesCache }).promise;
            totalSignaturePages = pdf.numPages; // Obtener el número total de páginas
            const page = await pdf.getPage(currentSignaturePage); // Renderizar la pagina actual

            const viewport = page.getViewport({ scale: 1 });
            signatureCanvas.width = viewport.width;
            signatureCanvas.height = viewport.height;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
            };
            await page.render(renderContext).promise;
        } catch (error) {
            console.error('Error rendering PDF:', error);
        } finally {
            isRendering = false; // Marcar que la renderización ha terminado
        }
    }

    // Dibujar todos los campos de firma
    signatureFields
        .filter(field => (field.page || 1) === currentSignaturePage) // Filtrar por página)
        .forEach((field) => {
        const x = field.x;  // Convertir a puntos PDF
        const y = signatureCanvas.height - field.y; // Convertir el eje Y

        // Dibujar el rectángulo de la firma
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(field.x, field.y, field.width, field.height);

        // Dibujar índice del firmante
        ctx.font = '12px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText(field.numero !== null && field.numero !== undefined ? field.numero : '', x - 45, y - 10);

        // Dibujar nombre del firmante centrado en el recuadro
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            field.nombre || '',
            field.x + field.width / 2,
            field.y + field.height / 2,
        );
        ctx.fillStyle = 'gray';
        ctx.fillRect(field.x + field.width - 10, field.y + field.height - 10, 10, 10);
        ctx.restore();
    });
}


        //Renderizar el PDF en el canvas
        async function renderPDFInCanvas(pdfBytes) {
            if(isRendering){
                console.warn('Renderizacion en curso, espera que termine');
                return;  //Si hay una renderizacion en progreso,salirse.
            }
            isRendering = true; // Marcar como renderizando

    try{
        const canvas = document.getElementById('signatureCanvas');
        const ctx = canvas.getContext('2d');
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cargar el PDF usando PDF.js
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const page = await pdf.getPage(1); // Renderizar la primera página

        // Configurar el tamaño del canvas según el tamaño del PDF
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

         // Renderizar la página en el canvas
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };
        await page.render(renderContext).promise;
    }finally{
        isRendering = false; // Marcar que la renderización ha terminado
        }
    }

        // Generar vista previa del diseño
        async function generateDesignPreview() {
            console.log('Generando vista previa...', templateContentEl.value);
            
            if (!templateContentEl.value) {
                console.log('No hay contenido, limpiando vista previa');
                pdfPreviewEl.src = '';
                return;
            }
            
            try {
                const { PDFDocument, StandardFonts } = PDFLib;
                const pdfDoc = await PDFDocument.create();
                const pageSize = PAGE_SIZES[pageSizeEl.value || 'oficio'];
                const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);


            //Orden pagina para que se ajuste al salto de lineas en distintas paginas
            const margin = 50;
            const pageWidth = page.getWidth();
            const usableWidth = pageWidth - margin * 2; // Ancho util de la pagina menos los margenes

            // Limpia tabulaciones y saltos de línea
            const cleanedContent = templateContentEl.value
            .replace(/\t/g, ' ')
            .replace(/\r\n|\r|\n/g, '\n');

                // --- Aquí: reemplaza variables por su nombre en mayúsculas ---
    const previewContent = cleanedContent.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        return `[${p1.trim().toUpperCase()}]`;
    });

            const options ={
                title: state.title,
                titleFontSize: state.titleFontSize || 20,
                content : previewContent,
                fontSize: state.fontSize || 12,
                margin: 50,
                pageWidth: usableWidth, // Ancho de la pagina menos los margenes 
                yStart: page.getHeight() - margin, //Altura inicial documento
            };

            renderContent(pdfDoc, page,font,boldFont,options, state.formData);

            //Guardar los bytes del PDF en el cache
            pdfBytesCache = await pdfDoc.save();


            //Renderizar el PDF en el canvas
            await renderPDFInCanvas(pdfBytesCache);

            const blob = new Blob([pdfBytesCache], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            pdfPreviewEl.src = url;
            console.log('Vista previa generada exitosamente');
            
            } catch (error) {
                console.error('Error generando vista previa:', error);
            }
        }


            ////FUNCION RENDERIZAR EL PDF EN EL CANVAS VISTA RELLENAR PLANTILLA 
            async function updateSignatureCanvasPreview() {
            if (!state.currentTemplate) return;

            // Genera el PDF con los datos rellenados
            const pdfBytes = await generatePDFBytes();

            // Guarda los bytes en cache para el canvas
            pdfBytesCache = pdfBytes;

            // Dibuja los recuadros de firma sobre el canvas
            await redrawCanvas();
}


////FUNCION CONVERSION DE COORDENADAS 
 function getCanvasRelativeCoords(event, canvas){
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return{
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
 }
            


        // Variable de estado para el modo actual
        let currentMode = 'design';


        // Cambiar entre pestañas
        function switchTab(tabName) {
            tabs.forEach(tab => {
                if (tab.dataset.tab === tabName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
           if(designTab) designTab.style.display = tabName === 'design' ? 'block' : 'none';
            if(fillTab)fillTab.style.display = tabName === 'fill' ? 'block' : 'none';

            //Actualizar el modo actual
            currentMode = tabName;

            //Habilitar o deshabilitar el canvas para agregar firmas 
            if(tabName === 'fill'){
                signatureCanvas.style.pointerEvents = 'auto'; // Habilitar canvas
        } else {
            signatureCanvas.style.pointerEvents = 'none'; // Deshabilitar canvas
        }
    }

    // Limpieza general de canvas y recuadros de firma
    function clearSignatureCanvasAndFields() {
    signatureFields = [];
    pdfBytesCache = null;
    // Limpiar el canvas completamente
    const ctx = signatureCanvas.getContext('2d');
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    updateSignatureFieldsJson();
    }

        // Event Listeners
        newTemplateBtn.addEventListener('click', () => {

            clearSignatureCanvasAndFields(); // Limpiar el canvas y los campos de firma

            // Reiniciar el estado de plantilla actual 
            state.currentTemplate = null;
            templateNameEl.value = '';
            templateContentEl.value = '';
            pdfBytesCache = null;

            //Reiniciar las coordenadas de las firmas 
            signatureFields = [];
            redrawCanvas();  //Limpiar el canvas 

            //Limpiar el JSON de firmas
            updateSignatureFieldsJson();

            //Cambiar a la pestaña de diseño 
            switchTab('design');

            //Generar vista previa vacia 
            generateDesignPreview();
        });





        // Guardar plantilla
        saveTemplateBtn.addEventListener('click', async () => {
    if (!templateNameEl.value || !templateContentEl.value) {
        alert('Por favor complete todos los campos');
        return;
    }
    // Limpiar texto solo al guardar
    const cleanedContent = templateContentEl.value
        .replace(/\t/g, ' ')
        .replace(/\r\n|\r|\n/g, '\n')
        .trim();


    //Extraer marcadores unicos de la plantilla
    const fields = [...new Set(
        cleanedContent.match(/\{\{(.*?)\}\}/g) || []
    )].map(f => f.replace(/\{\{|\}\}/g, ''));

    //Nuevo filtar campos que no esten vacios
    campos = campos.filter(c => cleanedContent.includes(c.marcador));

    const newTemplate = {
        id: Date.now(),
        name: templateNameEl.value.trim(),
        content : cleanedContent,
        campos : [...campos],
        fields,
        title: state.title,
        titleFontSize: state.titleFontSize,
        createdAt: new Date().toISOString(),
    };

    state.templates.push(newTemplate);
    localStorage.setItem('pdfTemplates', JSON.stringify(state.templates));

    alert('Plantilla guardada correctamente!');
    renderTemplatesList();
        


    //Reiniciar el estado de la plantilla despues de guardar 
    state.currentTemplate = null;
    templateNameEl.value = '';
    templateContentEl.value = '';
    pdfBytesCache = null;
    signatureFields = []; // Limpiar campos de firma
    redrawCanvas(); // Limpiar el canvas
    switchTab('design'); // Cambiar a la pestaña de diseño
    generateDesignPreview(); // Generar vista previa vacía
    updateSignatureFieldsJson(); // Limpiar el JSON de firmas
    }
);


function toCamelCase(str){
    return str
}

//Insertar variable en el contenido de la plantilla
function insertVariableInContent (categoria,campo,indice){
    //Calcular el indice siguiente para ese rol 
    
    const marcador =`{{${categoria}.${indice}.${campo.toLowerCase().replace(/ /g, '_')}}}`;
    const label = `${campo} ${capitalize(categoria)} ${indice}`;
    const tipo = campo.toLowerCase().includes('rut') ? 'number' : 'text'; // Asumir que los RUT son números


    //Insertar el marcador en el texttarea enla posicion del cursor 
    insertArCursor(templateContentEl,marcador);

    //Agregar la dificion al array de campos si no existe
    if(!campos.some(c => c.marcador === marcador)){
        campos.push({
            marcador,
            nombreCampo: label,
            tipo,
            indice,
            rol: categoria,
            campoBD: `${categoria}.${indice}.${campo.toLowerCase().replace(/ /g, '_')}`
        });
    }
}


//Funcion para insertar texto en el cursor del textarea
function insertArCursor(textarea,text){
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + text  + textarea.value.substring(end);
    textarea.selectionStart =  textarea.selectionEnd = start + text.length; //MOVER EL CURSOR AL FINAL DEL TEXTO INSERTADO
    textarea.focus(); // Enfocar el textarea
}



//Cuando se selecciona categoria, cargar indices y campos
document.getElementById('categoriaSelect').addEventListener('change', function(){
    const categoria = this.value;

    //Indices del 1 al 5
    let indices = '';
    for (let i = 1; i <= 5; i++) {
        indices += `<option value="${i}">${i}</option>`;
    }
    document.getElementById('indiceSelect').innerHTML = `<option value="">Seleccione n° de indice</option>` + indices;

    //Campos segun la categoria que se seleccione
    let camposHtml = '';
    (camposPorCategoria[categoria] || []).forEach(campo => {
        camposHtml += `<option value="${campo}">${campo}</option>`;
    });
    document.getElementById('campoSelect').innerHTML = `<option value="">Seleccione un campo</option>` + camposHtml;
});

//Insertar variable al hacer clic en "Insertar"
document.getElementById('insertVarBtn').addEventListener('click',() =>{
    const categoria = document.getElementById('categoriaSelect').value;
    const indice = document.getElementById('indiceSelect').value;
    const campo = document.getElementById('campoSelect').value;
    if(!categoria || !indice || !campo){
        alert('Seleccione todos los campos ');
        return;
    }
    insertVariableInContent(categoria,campo,indice);
});

//Capitalizar la funcion 
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

//FUNCION BOTONES PASAR DE CANVAS 
document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentSignaturePage > 1) {
        currentSignaturePage--;
        redrawCanvas();
        updatePageIndicator();
    }
});
document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentSignaturePage < totalSignaturePages) {
        currentSignaturePage++;
        redrawCanvas();
        updatePageIndicator();
    }
});
function updatePageIndicator() {
    document.getElementById('pageIndicator').textContent = `Página ${currentSignaturePage} de ${totalSignaturePages}`;
}

//Validacion para el tamaño de la pagina
pageSizeEl.addEventListener('change', (e) => {
    if (!state.currentTemplate) return;
        state.currentTemplate.pageSize = e.target.value;

        //Ajusta el tamaño real del canvas
        const size = PAGE_SIZES[e.target.value];
        signatureCanvas.width = size.width;
        signatureCanvas.height = size.height;
        //Ajusta el tamaño del canvas de vista previa
    state.currentTemplate.pageSize = e.target.value;
    generateDesignPreview();
    updateSignatureCanvasPreview();
});


    ///funcion para descargar plantilla en formato JSON 
    function downloadCurrentTemplateAsJson() {
    if (!state.currentTemplate) {
        alert('No hay plantilla seleccionada.');
        return;
    }

    //Agregar los datos actuales de las firmas a la plantilla 
    state.currentTemplate.signatureFields = signatureFields.map(field => ({
        nombre : field.nombre,
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
        page: field.page
    }))

    const json = JSON.stringify(state.currentTemplate, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentTemplate.name || 'plantilla'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


document.getElementById('downloadTemplateBtn').addEventListener('click', downloadCurrentTemplateAsJson);

        generatePdfBtn.addEventListener('click', () => {
            generatePDF();
        });

        //Tiempo de espera para evitar renderizaciones simultaneas
        let previewTimeout;   
        templateContentEl.addEventListener('input', () => {
            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(() => {
                generateDesignPreview();
            }, 300);
          // Esperar 500ms antes de generar la vista previa
        });


        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
            });
        });

        // Inicialización
        console.log('Inicializando aplicación...');
        loadTemplates();
        switchTab('design');
        
        // Generar vista previa inicial
        setTimeout(() => {
            console.log('Generando vista previa inicial...');
            generateDesignPreview();
        }, 500);





        