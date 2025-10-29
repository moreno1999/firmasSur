import React from 'react';

const TemplateApp = () => {
    React.useEffect(() => {
        // Cargar tu app.js original cuando el componente se monte
        const script = document.createElement('script');
        script.src = '/src/document/templates/app.js';
        script.type = 'module';
        document.head.appendChild(script);

        return () => {
            // Limpiar cuando el componente se desmonte
            document.head.removeChild(script);
        };
    }, []);

    return (
        <div style={{ padding: '2rem', marginTop: '5rem' }}>
            {/* Tu HTML original aquí */}
            <div className="app-container">
                <div className="sidebar">
                    <h2>Plantillas PDF</h2>
                    
                    <div className="templates-section">
                        <h3>Plantillas Guardadas</h3>
                        <div id="templatesList" className="templates-list">
                            {/* Se llena dinámicamente por app.js */}
                        </div>
                        <button id="newTemplateBtn" className="btn btn-primary">Nueva Plantilla</button>
                    </div>
                </div>

                <div className="main-content">
                    <div className="tabs">
                        <button className="tab active" data-tab="design">Diseñar</button>
                        <button className="tab" data-tab="fill">Rellenar</button>
                    </div>

                    {/* Pestaña Diseñar */}
                    <div id="designTab" className="tab-content">
                        <div className="template-form">
                            <div className="form-group">
                                <label>Nombre de la plantilla:</label>
                                <input type="text" id="templateName" placeholder="Ej: Contrato de Compraventa" />
                            </div>
                            
                            <div className="form-group">
                                <label>Título del documento:</label>
                                <input type="text" id="templateTitle" placeholder="Título que aparecerá en el PDF" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tamaño de página:</label>
                                    <select id="pageSize">
                                        <option value="carta">Carta</option>
                                        <option value="oficio" selected>Oficio</option>
                                        <option value="a4">A4</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tamaño de fuente:</label>
                                    <input type="number" id="fontSize" defaultValue="12" min="8" max="24" />
                                </div>
                                <div className="form-group">
                                    <label>Tamaño fuente título:</label>
                                    <input type="number" id="titleFontSize" defaultValue="20" min="12" max="36" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Contenido de la plantilla:</label>
                                <textarea 
                                    id="templateContent" 
                                    rows="15" 
                                    placeholder="Escriba el contenido de su plantilla aquí. Use {{variable}} para campos dinámicos."
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button id="saveTemplateBtn" className="btn btn-success">Guardar Plantilla</button>
                                <button id="downloadTemplateBtn" className="btn btn-info">Descargar JSON</button>
                            </div>
                        </div>

                        <div className="preview-section">
                            <h3>Vista Previa</h3>
                            <iframe id="pdfPreview" style={{width: '100%', height: '600px', border: '1px solid #ddd'}}></iframe>
                        </div>
                    </div>

                    {/* Pestaña Rellenar */}
                    <div id="fillTab" className="tab-content" style={{display: 'none'}}>
                        <div className="fill-form">
                            <div className="template-info">
                                <h3 id="currentTemplateName">Seleccione una plantilla</h3>
                            </div>

                            <div id="formFields" className="form-fields">
                                {/* Se genera dinámicamente */}
                            </div>

                            <div className="form-actions">
                                <button id="generatePdfBtn" className="btn btn-success">Generar PDF</button>
                            </div>
                        </div>

                        <div className="canvas-section">
                            <h3>Vista Previa con Firmas</h3>
                            <div className="canvas-container">
                                <canvas id="signatureCanvas" width="612" height="1008"></canvas>
                            </div>
                            <iframe id="generatedPdfPreview" style={{width: '100%', height: '400px', border: '1px solid #ddd'}}></iframe>
                        </div>
                    </div>
                </div>

                {/* Panel flotante para insertar variables */}
                <div id="insertVarPanel" className="insert-var-panel">
                    <div id="insertVarPanelHeader" className="panel-header">
                        <span>Insertar Variables</span>
                        <button id="minimizeInsertVarPanel" className="minimize-btn">−</button>
                    </div>
                    <div className="panel-content">
                        <div className="form-group">
                            <label>Categoría:</label>
                            <select id="categoriaSelect">
                                <option value="">Seleccione categoría</option>
                                <option value="compareciente">Compareciente</option>
                                <option value="representante">Representante</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Índice:</label>
                            <select id="indiceSelect">
                                <option value="">Seleccione n° de índice</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Campo:</label>
                            <select id="campoSelect">
                                <option value="">Seleccione campo</option>
                            </select>
                        </div>
                        <button id="insertVarBtn" className="btn btn-primary">Insertar Variable</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateApp;