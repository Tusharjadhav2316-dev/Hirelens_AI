import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/verifyAuth';

const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from a DOCX buffer using XML tag matching.
 */
function extractDocxText(buffer: Buffer): string {
    const str = buffer.toString('utf-8');
    const matches = str.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches && matches.length > 0) {
        return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ').trim();
    }
    // Fallback: strip non-printable ASCII / XML tags
    return str.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(req: Request) {
    try {
        await verifyAuth(req);
    } catch (authError) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided.' },
                { status: 400 }
            );
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit.' },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json(
                { error: 'File is empty.' },
                { status: 400 }
            );
        }

        const fileName = (file.name || 'document').toLowerCase();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let extractedText = '';

        if (fileName.endsWith('.pdf') || file.type.includes('pdf')) {
            const data = await pdfParse(buffer);
            extractedText = data.text || '';
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || file.type.includes('word')) {
            extractedText = extractDocxText(buffer);
        } else if (
            fileName.endsWith('.txt') ||
            fileName.endsWith('.md') ||
            fileName.endsWith('.json') ||
            fileName.endsWith('.csv') ||
            file.type.includes('text')
        ) {
            extractedText = buffer.toString('utf-8');
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT document.' },
                { status: 400 }
            );
        }

        extractedText = extractedText.trim();
        if (!extractedText) {
            return NextResponse.json(
                { error: 'Could not extract readable text from the uploaded document.' },
                { status: 400 }
            );
        }

        // Truncate safely at 25k characters to protect LLM context windows
        const truncatedText = extractedText.length > 25000 
            ? extractedText.substring(0, 25000) + "\n\n[Content truncated at 25,000 characters]"
            : extractedText;

        return NextResponse.json({
            filename: file.name,
            mimeType: file.type || 'text/plain',
            size: file.size,
            extractedText: truncatedText,
            text: truncatedText
        });

    } catch (error) {
        console.error('Document parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to parse uploaded document.' },
            { status: 500 }
        );
    }
}
