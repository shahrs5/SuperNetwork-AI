import * as pdfjsLib from 'pdfjs-dist'

// Set up the worker - using jsdelivr CDN for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`

export async function extractTextFromPDF(file) {
  try {
    console.log('Starting PDF extraction for file:', file.name)

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength)

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    console.log('PDF loaded successfully, pages:', pdf.numPages)

    let fullText = ''

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }

    console.log('Text extraction complete, length:', fullText.length)
    return fullText
  } catch (error) {
    console.error('Detailed PDF error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    throw new Error(`Failed to read PDF: ${error.message}`)
  }
}

export async function extractTextFromFile(file) {
  // Check file type
  const fileType = file.type

  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file)
  } else if (fileType === 'text/plain') {
    // For .txt files
    return await file.text()
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or TXT file.')
  }
}
