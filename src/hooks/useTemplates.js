import { useState, useEffect } from 'react';
import { replaceVariables } from '../utils/replaceVariables.js';
import { renderContent } from '../utils/renderContent.js';

// Importar las librerías necesarias (asegúrate de tenerlas instaladas)
// npm install pdflib pdf-lib
// Las librerías de PDF.js también deben estar disponibles globalmente

const PAGE_SIZES = {
    carta: { width: 612, height: 792 },
    oficio: { width: 612, height: 1008 },
    a4: { width: 595, height: 842 }
};

export const useTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [signatureFields, setSignatureFields] = useState([]);

    // Cargar plantillas del localStorage
    useEffect(() => {
        const savedTemplates = JSON.parse(localStorage.getItem('pdfTemplates')) || [];
        setTemplates(savedTemplates);
    }, []);

    // Guardar plantillas en localStorage cuando cambien
    useEffect(() => {
        localStorage.setItem('pdfTemplates', JSON.stringify(templates));
    }, [templates]);

    const saveTemplate = async (templateData) => {
        const newTemplate = {
            id: Date.now(),
            name: templateData.name,
            content: templateData.content,
            fields: templateData.fields,
            title: templateData.title,
            titleFontSize: templateData.titleFontSize || 20,
            fontSize: templateData.fontSize || 12,
            pageSize: templateData.pageSize || 'oficio',
            signatureFields: signatureFields,
            createdAt: new Date().toISOString(),
        };

        setTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    };

    const deleteTemplate = (templateId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
            setTemplates(prev => prev.filter(template => template.id !== templateId));
            if (currentTemplate?.id === templateId) {
                setCurrentTemplate(null);
                setFormData({});
            }
        }
    };

    const selectTemplate = (template) => {
        setCurrentTemplate(template);
        setSignatureFields(template.signatureFields || []);
        
        // Inicializar formData con campos vacíos
        const initialFormData = {};
        template.fields?.forEach(field => {
            initialFormData[field] = '';
        });
        setFormData(initialFormData);
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generatePDF = async (forPreview = false) => {
        if (!currentTemplate) return null;

        try {
            // Asegúrate de que PDFLib esté disponible globalmente
            const { PDFDocument, StandardFonts } = window.PDFLib;
            
            const pdfDoc = await PDFDocument.create();
            const pageSize = PAGE_SIZES[currentTemplate.pageSize || 'oficio'];
            const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Reemplazar variables en el contenido
            const finalContent = replaceVariables(currentTemplate.content, formData);

            const margin = 50;
            const pageWidth = page.getWidth();
            const usableWidth = pageWidth - margin * 2;

            const options = {
                title: currentTemplate.title,
                titleFontSize: currentTemplate.titleFontSize || 20,
                content: finalContent,
                fontSize: currentTemplate.fontSize || 12,
                margin: 50,
                pageWidth: usableWidth,
                yStart: page.getHeight() - margin,
            };

            // Aquí usamos la función renderContent importada
            renderContent(pdfDoc, page, font, boldFont, options, formData);

            const pdfBytes = await pdfDoc.save();

            if (forPreview) {
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                return URL.createObjectURL(blob);
            } else {
                // Para descarga
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentTemplate.name}_${new Date().toISOString().slice(0,10)}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    };

    return {
        templates,
        currentTemplate,
        formData,
        signatureFields,
        saveTemplate,
        deleteTemplate,
        selectTemplate,
        updateFormData,
        generatePDF,
        setSignatureFields
    };
};