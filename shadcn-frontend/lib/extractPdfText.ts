'use client';

export async function extractPdfText(file: File): Promise<string> {
  if (typeof window === 'undefined') return '';

  try {
    // 動態import，確保只有在瀏覽器端執行
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText;
  } catch (error) {
    console.error('extractPdfText error:', error);
    return 'pdf text extraction failed';
  }
}