// Función auxiliar para ajustar texto al ancho disponible
export function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

export function renderContent(pdfDoc, page, font, boldFont, options, formData) {
    const { title, titleFontSize, content, fontSize, margin, pageWidth, yStart } = options;
    let yPosition = yStart;
    let currentPage = page;
    const lineHeight = fontSize * 1.5;
    const minY = margin;

    // Guardar el tamaño real de la página
    const pageWidthPx = page.getWidth();
    const pageHeightPx = page.getHeight();
    const usableWidth = pageWidthPx - margin * 2;
    
    // Saltar página si es necesario por espacio insuficiente
    function checkPageBreak() {
        if (yPosition < minY) {
            currentPage = pdfDoc.addPage([pageWidthPx, pageHeightPx]);
            yPosition = yStart;
        }
    }

    // Dibujar título centrado
    if (title) {
        const titleLines = wrapText(title, boldFont, titleFontSize, pageWidth);
        titleLines.forEach(line => {
            checkPageBreak();
            const titleWidth = boldFont.widthOfTextAtSize(line, titleFontSize);
            const titleX = (currentPage.getWidth() - titleWidth) / 2;
            currentPage.drawText(line, {
                x: titleX,
                y: yPosition,
                size: titleFontSize,
                font: boldFont,
                color: window.PDFLib.rgb(0, 0, 0),
            });
            yPosition -= titleFontSize * 1.5;
        });
        
        // Espacio después del título
        yPosition -= titleFontSize * 0.5;
    }

    // Procesar contenido línea por línea
    const contentLines = content.split('\n');
    
    contentLines.forEach(line => {
        if (!line.trim()) {
            // Línea vacía
            yPosition -= lineHeight * 0.5;
            return;
        }

        // Ajustar texto al ancho disponible
        const wrappedLines = wrapText(line, font, fontSize, usableWidth);
        
        wrappedLines.forEach(wrappedLine => {
            checkPageBreak();
            
            currentPage.drawText(wrappedLine, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: window.PDFLib.rgb(0, 0, 0),
            });
            
            yPosition -= lineHeight;
        });
    });

    return { currentPage, yPosition };
}