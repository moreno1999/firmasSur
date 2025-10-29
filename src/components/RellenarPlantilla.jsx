import React, { useState, useEffect } from 'react';
import { useTemplates } from '../hooks/useTemplates';

const RellenarPlantilla = () => {
    const { 
        templates, 
        currentTemplate, 
        formData, 
        selectTemplate, 
        updateFormData, 
        generatePDF 
    } = useTemplates();
    
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleTemplateSelect = (templateId) => {
        const template = templates.find(t => t.id === parseInt(templateId));
        if (template) {
            selectTemplate(template);
            setSelectedTemplateId(templateId);
        }
    };

    const handleFieldChange = (field, value) => {
        updateFormData(field, value);
    };

    const generatePreview = async () => {
        if (!currentTemplate) return;

        try {
            const url = await generatePDF(true);
            setPreviewUrl(url);
        } catch (error) {
            console.error('Error generating preview:', error);
        }
    };

    const handleDownloadPdf = async () => {
        if (!currentTemplate) {
            alert('Por favor seleccione una plantilla');
            return;
        }

        setIsGeneratingPdf(true);
        try {
            await generatePDF(false);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Generar vista previa cuando cambien los datos del formulario
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (currentTemplate) {
                generatePreview();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [formData, currentTemplate]);

    // Simulación de base de datos de personas (como en tu código original)
    const personaDB = {
        '20295756-0': {
            rut: '20295756-0',
            nombre: 'Rositamelo Perez',
            apellidoPaterno: 'Moreno',
            apellidoMaterno: 'Rojas',
            email: 'benjamin@gmail.com',
            telefono: '934656428',
        }
    };

    const autoFillFromDB = (rut, prefix) => {
        const persona = personaDB[rut];
        if (persona) {
            Object.keys(persona).forEach(key => {
                const fieldName = `${prefix}_${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (currentTemplate?.fields?.includes(fieldName)) {
                    handleFieldChange(fieldName, persona[key]);
                }
            });
        } else {
            alert('RUT no encontrado en la base de datos');
        }
    };

    return (
        <div style={{ padding: '2rem', marginTop: '5rem', maxWidth: '1400px', margin: '5rem auto 2rem' }}>
            <h2>Rellenar Plantilla</h2>

            {/* Selector de plantilla */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Seleccionar Plantilla:
                </label>
                <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem'
                    }}
                >
                    <option value="">Seleccione una plantilla...</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>
                            {template.name} ({template.fields?.length || 0} campos)
                        </option>
                    ))}
                </select>
            </div>

            {currentTemplate && (
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Panel de formulario */}
                    <div style={{ flex: 1, maxWidth: '500px' }}>
                        <div style={{
                            background: '#f8f9fa',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                                {currentTemplate.name}
                            </h3>

                            {/* Campos del formulario */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1rem', color: '#495057' }}>
                                    Datos del Documento
                                </h4>
                                
                                {currentTemplate.fields?.map(field => {
                                    const isRutField = field.toLowerCase().includes('rut');
                                    const fieldCategory = field.split('_')[0]; // compareciente1, representante1, etc.
                                    
                                    return (
                                        <div key={field} style={{ marginBottom: '1rem' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.25rem',
                                                fontWeight: '500',
                                                color: '#495057'
                                            }}>
                                                {field.replace(/_/g, ' ')}:
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={formData[field] || ''}
                                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        border: '1px solid #ced4da',
                                                        borderRadius: '4px',
                                                        fontSize: '0.95rem'
                                                    }}
                                                    placeholder={`Ingrese ${field.replace(/_/g, ' ').toLowerCase()}`}
                                                />
                                                {isRutField && (
                                                    <button
                                                        onClick={() => autoFillFromDB(formData[field], fieldCategory)}
                                                        disabled={!formData[field]}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#007bff',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: formData[field] ? 'pointer' : 'not-allowed',
                                                            fontSize: '0.85rem',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        title="Auto-rellenar desde base de datos"
                                                    >
                                                        Auto-fill
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Información de campos completados */}
                            <div style={{
                                background: '#e7f3ff',
                                padding: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #b8daff',
                                marginBottom: '1.5rem'
                            }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#004085' }}>
                                    Estado del Formulario
                                </h5>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#004085' }}>
                                    Campos completados: {
                                        Object.values(formData).filter(value => value && value.trim()).length
                                    } / {currentTemplate.fields?.length || 0}
                                </p>
                            </div>

                            {/* Botón de descarga */}
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}
                            </button>

                            {/* Información de RUTs disponibles para prueba */}
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#fff3cd',
                                border: '1px solid #ffeaa7',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                            }}>
                                <strong>Para pruebas:</strong><br />
                                RUT disponible: 20295756-0<br />
                                <em>Use este RUT en cualquier campo RUT y presione "Auto-fill"</em>
                            </div>
                        </div>
                    </div>

                    {/* Panel de vista previa */}
                    <div style={{ flex: 2 }}>
                        <h3>Vista Previa del Documento</h3>
                        <div style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: '#ffffff',
                            minHeight: '700px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    style={{
                                        width: '100%',
                                        height: '700px',
                                        border: 'none',
                                        borderRadius: '8px'
                                    }}
                                    title="Vista previa del documento"
                                />
                            ) : (
                                <div style={{
                                    height: '700px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    color: '#6c757d'
                                }}>
                                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                        Vista previa no disponible
                                    </p>
                                    <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                                        Complete algunos campos para ver la vista previa del documento
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {templates.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ color: '#6c757d' }}>No hay plantillas disponibles</h3>
                    <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                        Debe crear al menos una plantilla antes de poder rellenarla.
                    </p>
                    <p style={{ color: '#6c757d' }}>
                        Vaya a la sección "Crear Plantilla" para comenzar.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RellenarPlantilla;