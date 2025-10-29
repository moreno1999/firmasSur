import React, { useState, useEffect } from 'react';
import { useTemplates } from '../hooks/useTemplates';

const CrearPlantilla = () => {
    const { saveTemplate, generatePDF } = useTemplates();
    const [templateName, setTemplateName] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [templateTitle, setTemplateTitle] = useState('');
    const [fontSize, setFontSize] = useState(12);
    const [titleFontSize, setTitleFontSize] = useState(20);
    const [pageSize, setPageSize] = useState('oficio');
    const [previewUrl, setPreviewUrl] = useState('');

    // Campos predefinidos para insertar variables
    const camposPorCategoria = {
        compareciente: ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'RUT', 'Email', 'Telefono'],
        representante: ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'RUT', 'Email', 'Telefono']
    };

    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedCampo, setSelectedCampo] = useState('');
    const [selectedIndice, setSelectedIndice] = useState('');

    const insertVariable = () => {
        if (selectedCategoria && selectedCampo && selectedIndice) {
            const variable = `{{${selectedCategoria}${selectedIndice}_${selectedCampo}}}`;
            setTemplateContent(prev => prev + variable);
        }
    };

    const handleSave = async () => {
        if (!templateName.trim() || !templateContent.trim()) {
            alert('Por favor complete el nombre y contenido de la plantilla');
            return;
        }

        try {
            // Extraer campos únicos de la plantilla
            const fields = [...new Set(
                templateContent.match(/\{\{(.*?)\}\}/g) || []
            )].map(f => f.replace(/\{\{|\}\}/g, ''));

            const templateData = {
                name: templateName.trim(),
                content: templateContent.trim(),
                fields,
                title: templateTitle,
                titleFontSize: parseInt(titleFontSize),
                fontSize: parseInt(fontSize),
                pageSize
            };

            await saveTemplate(templateData);
            
            // Limpiar formulario
            setTemplateName('');
            setTemplateContent('');
            setTemplateTitle('');
            setPreviewUrl('');
            
            alert('Plantilla guardada correctamente!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error al guardar la plantilla');
        }
    };

    const generatePreview = async () => {
        if (!templateContent) {
            setPreviewUrl('');
            return;
        }

        try {
            // Crear plantilla temporal para vista previa
            const tempTemplate = {
                name: templateName || 'Vista Previa',
                content: templateContent,
                title: templateTitle,
                titleFontSize: parseInt(titleFontSize),
                fontSize: parseInt(fontSize),
                pageSize
            };

            // Aquí necesitarías adaptar la función generatePDF para trabajar con plantilla temporal
            // Por ahora, simplemente mostramos el contenido
            console.log('Generating preview for:', tempTemplate);
        } catch (error) {
            console.error('Error generating preview:', error);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            generatePreview();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [templateContent, templateTitle, fontSize, titleFontSize, pageSize]);

    return (
        <div style={{ padding: '2rem', marginTop: '5rem', maxWidth: '1200px', margin: '5rem auto 2rem' }}>
            <h2>Crear Nueva Plantilla</h2>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                {/* Panel de creación */}
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Nombre de la Plantilla:
                        </label>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                            placeholder="Ej: Contrato de Compraventa"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Título del Documento:
                        </label>
                        <input
                            type="text"
                            value={templateTitle}
                            onChange={(e) => setTemplateTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                            placeholder="Título que aparecerá en el PDF"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Tamaño de Página:
                            </label>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            >
                                <option value="carta">Carta</option>
                                <option value="oficio">Oficio</option>
                                <option value="a4">A4</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Tamaño Fuente:
                            </label>
                            <input
                                type="number"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                min="8"
                                max="24"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Tamaño Título:
                            </label>
                            <input
                                type="number"
                                value={titleFontSize}
                                onChange={(e) => setTitleFontSize(e.target.value)}
                                min="12"
                                max="36"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Panel para insertar variables */}
                    <div style={{ 
                        background: '#f5f5f5', 
                        padding: '1rem', 
                        borderRadius: '4px', 
                        marginBottom: '1rem' 
                    }}>
                        <h4>Insertar Variables</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                    Categoría:
                                </label>
                                <select
                                    value={selectedCategoria}
                                    onChange={(e) => setSelectedCategoria(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="">Seleccione categoría</option>
                                    {Object.keys(camposPorCategoria).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                    Campo:
                                </label>
                                <select
                                    value={selectedCampo}
                                    onChange={(e) => setSelectedCampo(e.target.value)}
                                    disabled={!selectedCategoria}
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="">Seleccione campo</option>
                                    {selectedCategoria && camposPorCategoria[selectedCategoria]?.map(campo => (
                                        <option key={campo} value={campo}>{campo}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                    Índice:
                                </label>
                                <select
                                    value={selectedIndice}
                                    onChange={(e) => setSelectedIndice(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.375rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="">Seleccione índice</option>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={insertVariable}
                                disabled={!selectedCategoria || !selectedCampo || !selectedIndice}
                                style={{
                                    padding: '0.375rem 1rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: selectedCategoria && selectedCampo && selectedIndice ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Insertar
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Contenido de la Plantilla:
                        </label>
                        <textarea
                            value={templateContent}
                            onChange={(e) => setTemplateContent(e.target.value)}
                            rows={15}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem'
                            }}
                            placeholder="Escriba el contenido de su plantilla aquí. Use {{variable}} para insertar campos dinámicos."
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        style={{
                            padding: '0.75rem 2rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        Guardar Plantilla
                    </button>
                </div>

                {/* Panel de vista previa */}
                <div style={{ flex: 1 }}>
                    <h3>Vista Previa</h3>
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        minHeight: '600px',
                        background: '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {previewUrl ? (
                            <iframe
                                src={previewUrl}
                                style={{
                                    width: '100%',
                                    height: '600px',
                                    border: 'none'
                                }}
                                title="Vista previa de la plantilla"
                            />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666' }}>
                                <p>La vista previa aparecerá aquí</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Escriba contenido en la plantilla para ver la vista previa
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearPlantilla;