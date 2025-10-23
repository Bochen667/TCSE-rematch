export async function extractPdfText(file: File): Promise<string> {
  if (typeof window === "undefined") {
    console.warn("Server tried to call extractPdfText — skipping.");
    return "";
  }

  try {
    const pdfjsLib = await Function("return import('pdfjs-dist/legacy/build/pdf')")();
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  } catch (error) {
    console.error("PDF 解析失敗", error);
    return "❌ 無法解析 PDF 檔案";
  }
}