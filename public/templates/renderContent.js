import { wrapText } from "./app.js";

export function renderContent(pdfDoc, page, font, boldFont, options, formData) {
    const { title, titleFontSize, content, fontSize, margin, pageWidth, yStart } = options;
    let yPosition = yStart;
    let currentPage = page;
    const lineHeight = fontSize * 1.5;
    const minY = margin;

    //Guardar el tamaño real de la pagina (De creacion de plantilla)
    const pageWidthPx = page.getWidth();
    const pageHeightPx = page.getHeight();
    const usableWidth = pageWidthPx - margin * 2;
    
    //Saltar pagina si es necesario por espacio insuficiente 
    function checkPageBreak() {
        if(yPosition < minY) {
            currentPage = pdfDoc.addPage([pageWidthPx, pageHeightPx]);
            yPosition = yStart;
        }
    }

    // Dibujar título centrado
    if (title) {
        const titleLines = wrapText(title, font, titleFontSize, pageWidth);
        titleLines.forEach(line => {
            checkPageBreak();
            const titleWidth = font.widthOfTextAtSize(line, titleFontSize);
            const titleX = (currentPage.getWidth() - titleWidth) / 2;
            currentPage.drawText(line, {
                x: titleX,
                y: yPosition,
                size: titleFontSize,
                font: font,
            });
            yPosition -= titleFontSize * 1.5;
        });
        yPosition -= titleFontSize;
    }

    const paragraphs = content.split('\n');
    paragraphs.forEach(paragraph => {
        if (paragraph === '') {
            yPosition -= lineHeight; // Espacio entre párrafos
            checkPageBreak();
        } else {
            const wrapped = wrapText(paragraph, font, fontSize, usableWidth);
            wrapped.forEach(line => {
                checkPageBreak();
                let x = margin;
                // Divide la línea en fragmentos normales y [[B]]...[[/B]]
                const parts = line.split(/(\[\[B\]\].*?\[\[\/B\]\])/g);
                console.log('Processing line:', line);
                console.log('Parts:', parts);
                parts.forEach(part => {
                    if (part.startsWith('[[B]]') && part.endsWith('[[/B]]')) {
                        const text = part.slice(5, -5);
                        console.log('Bold text:', text);
                        currentPage.drawText(text, {
                            x, y: yPosition, size: fontSize, font: boldFont
                        });
                        x += boldFont.widthOfTextAtSize(text, fontSize);
                    } else if (part.trim() !== '') {
                        console.log('Normal text:', part);
                        currentPage.drawText(part, {
                            x, y: yPosition, size: fontSize, font: font
                        });
                        x += font.widthOfTextAtSize(part, fontSize);
                    }
                });
                yPosition -= lineHeight;
            });
        }
    });

    return currentPage;
}