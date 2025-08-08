import * as docx from 'docx';
import { ProcessedProduct, ProductData } from '../types';

const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, BorderStyle } = docx;

const createProductSection = (data: ProductData): (docx.Paragraph | docx.Table)[] => {
    const children: (docx.Paragraph | docx.Table)[] = [
        new Paragraph({
            children: [new TextRun({ text: data.productName, bold: true, size: 36, font: "Calibri" })],
            spacing: { after: 100 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Product ID: ${data.productId} • Category: ${data.category}`, size: 22, font: "Calibri", color: "595959" })],
            spacing: { after: 400 },
        }),
    ];

    if (data.prices && data.prices.length > 0) {
        children.push(new Paragraph({ text: "Pricing", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }));
        data.prices.forEach(tier => {
            children.push(new Paragraph({ text: `${tier.quantity}: ${tier.price}`, bullet: { level: 0 }, style: "Normal" }));
        });
    }

    if (data.overview) {
        children.push(new Paragraph({ text: "Overview", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
        children.push(new Paragraph({ text: data.overview, style: "Normal" }));
    }

    if (data.metaDescription) {
        children.push(new Paragraph({ text: "Meta Description", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
        children.push(new Paragraph({ text: data.metaDescription, style: "Normal" }));
    }

    if (data.features && data.features.length > 0) {
        children.push(new Paragraph({ text: "Key Features", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
        data.features.forEach(feature => {
            children.push(new Paragraph({ text: feature, bullet: { level: 0 }, style: "Normal" }));
        });
    }

    if (data.specifications && data.specifications.length > 0) {
        children.push(new Paragraph({ text: "Technical Specifications", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));

        const tableHeader = new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Specification", bold: true })] })], shading: { fill: "F2F2F2" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Value", bold: true })] })], shading: { fill: "F2F2F2" } }),
            ],
        });

        const specRows = data.specifications.map(spec => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(spec.key)] }),
                new TableCell({ children: [new Paragraph(spec.value)] }),
            ],
        }));

        const specTable = new Table({
            rows: [tableHeader, ...specRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" },
            }
        });

        children.push(specTable);
    }

    return children;
};


export const generateCombinedDocxBlob = (products: ProcessedProduct[]): Promise<Blob> => {
    const allChildren: (docx.Paragraph | docx.Table)[] = [];

    products.forEach((product, index) => {
        if (index > 0) {
            allChildren.push(new Paragraph({ pageBreakBefore: true }));
        }
        const productSections = createProductSection(product.data);
        allChildren.push(...productSections);
    });

    const doc = new Document({
        styles: {
            paragraphStyles: [
                { id: "Normal", name: "Normal", run: { font: "Calibri", size: 22 } },
                { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { font: "Calibri", size: 26, bold: true, color: "2E74B5" } }
            ]
        },
        sections: [{ children: allChildren }],
    });

    return Packer.toBlob(doc);
};
