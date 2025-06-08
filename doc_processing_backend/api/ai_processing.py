import random

def perform_ocr(file_path):
    print(f"Performing OCR on {file_path}...")
    return "This is dummy text extracted from the document. It contains an Invoice Number INV-12345 and a Total Amount of $99.99."

def classify_document(text_content):
    print("Classifying document...")
    doc_types = ["invoice", "receipt", "contract", "report"]
    return random.choice(doc_types)

def extract_information(text_content):
    print("Extracting information...")
    return {
        'Invoice Number': 'INV-12345',
        'Date': '2025-06-07',
        'Company Name': 'Fake Corp',
        'Total Amount': '$99.99',
        'Tax': '$8.00'
    }

def summarize_text(text_content):
    print("Summarizing text...")
    return "This is a brief summary of the document, highlighting the most important terms and figures for quick review."

# You would call this function from your view after a document is uploaded
# from .models import Document, ExtractedData
# def process_document(document_id):
#     doc = Document.objects.get(id=document_id)
#     text = perform_ocr(doc.file.path)
#     doc_type = classify_document(text)
#     extracted_info = extract_information(text)
#     for key, value in extracted_info.items():
#         ExtractedData.objects.create(document=doc, key=key, value=value)
#     doc.document_type = doc_type
#     doc.status = 'completed'
#     doc.save() 