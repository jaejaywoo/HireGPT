import os 

from tika import parser
from flask import Flask, request
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'data'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000


# Define a function to extract text and metadata from a PDF file using the Tika parser
def extract_pdf_data(filename):
    parsed_pdf = parser.from_file(filename)
    return parsed_pdf['content'], parsed_pdf['metadata']

@app.route('/', methods=['POST'])
def upload_file():
    if 'file' in request.files:
        file = request.files['file']
        print(f'request file: {file}')
        print(f'filename: {file.filename}')

        # Save the uploaded file to local dir
        filename = secure_filename(file.filename)
        filename = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filename)

        text, metadata = extract_pdf_data(filename)
        print(f'parsed metadata: {metadata}')
        print(f'parsed text: {text}')
        return 'File uploaded successfully'
    
    return 'No file uploaded.'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)