"use client";

import { useEffect, useState, useRef } from "react";
import { pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { Document as DocxDocument, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

// Configure worker with a strict version match from unpkg
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfEditableViewerProps {
    file: File;
    onTextUpdate?: (text: string) => void;
}

export default function PdfEditableViewer({ file, onTextUpdate }: PdfEditableViewerProps) {
    const [resumeText, setResumeText] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!file) {
            setResumeText("");
            if (onTextUpdate) onTextUpdate("");
            return;
        }

        let isMounted = true;

        async function extractText() {
            setIsExtracting(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                const textContent = await page.getTextContent();

                // Sort items by Y descending, then X ascending to ensure reading order
                const items = textContent.items.map((item: any) => ({
                    str: item.str,
                    x: item.transform[4],
                    y: item.transform[5],
                    height: item.height,
                }));

                items.sort((a, b) => {
                    if (Math.abs(a.y - b.y) > 5) {
                        return b.y - a.y; // Descending Y
                    }
                    return a.x - b.x; // Ascending X
                });

                let formattedText = "";
                let lastY = null;

                for (const item of items) {
                    if (lastY !== null && Math.abs(lastY - item.y) > 8) {
                        formattedText += "\n";
                        // Add extra newline for larger gaps (paragraphs)
                        if (Math.abs(lastY - item.y) > item.height * 1.5) {
                            formattedText += "\n";
                        }
                    } else if (lastY !== null && formattedText.length > 0 && !formattedText.endsWith(" ") && !formattedText.endsWith("\n")) {
                        formattedText += " "; // Space between words on same line
                    }
                    formattedText += item.str;
                    lastY = item.y;
                }

                // Cleanup multiple spaces/newlines
                formattedText = formattedText.replace(/[ \t]+/g, " ");

                if (isMounted) {
                    setResumeText(formattedText);
                    if (onTextUpdate) onTextUpdate(formattedText);
                }
            } catch (err) {
                console.error("Failed to extract PDF text", err);
            } finally {
                if (isMounted) setIsExtracting(false);
            }
        }

        extractText();

        return () => {
            isMounted = false;
        };
    }, [file]);

    const handleInput = () => {
        if (contentRef.current) {
            const newText = contentRef.current.innerText;
            setResumeText(newText);
            if (onTextUpdate) onTextUpdate(newText);
        }
    };

    async function exportUpdatedPDF() {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        const textLines = resumeText.split('\n');

        let currentY = height - 50;
        const fontSize = 11;
        const lineSpacing = 16;
        const marginX = 50;

        for (const line of textLines) {
            if (currentY < 50) {
                page = pdfDoc.addPage();
                currentY = page.getSize().height - 50;
            }

            page.drawText(line, {
                x: marginX,
                y: currentY,
                size: fontSize,
                color: rgb(0, 0, 0),
            });

            currentY -= lineSpacing;
        }

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Updated_Resume.pdf";
        a.click();
    }

    function exportAsWord() {
        const textParagraphs = resumeText.split('\n').map(line => new Paragraph(line));

        const doc = new DocxDocument({
            sections: [
                {
                    children: textParagraphs
                }
            ]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "Updated_Resume.docx");
        });
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex gap-4 w-full justify-center flex-wrap shrink-0 pb-4 border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={exportUpdatedPDF}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    Download clean PDF
                </button>
                <button
                    onClick={exportAsWord}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    Download as Word
                </button>
            </div>

            {isExtracting ? (
                <div className="flex flex-col items-center justify-center p-10 min-h-[400px]">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3" />
                    <p className="text-gray-500 animate-pulse">Extracting and structuring PDF text...</p>
                </div>
            ) : (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    className="w-full min-h-[1000px] p-10 bg-white text-black focus:outline-none border border-gray-200 dark:border-slate-800 rounded-2xl font-sans text-sm leading-relaxed whitespace-pre-wrap break-words shadow-inner"
                >
                    {resumeText}
                </div>
            )}
        </div>
    );
}
