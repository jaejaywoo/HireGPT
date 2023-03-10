import os
import openai

from tika import parser
from flask import Flask, request
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'data'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000


@app.route('/apikey', methods=['POST'])
def upload_apikey():
    data = request.get_json()
    if 'OPENAI_API_KEY' in data:
        openai.api_key = data['OPENAI_API_KEY']
        return openai.Model.list()
    return 'No API key is received'

# Define a function to extract text and metadata from a PDF file using the Tika parser
def extract_pdf_data(filename):
    parsed_pdf = parser.from_file(filename)
    return parsed_pdf['content'], parsed_pdf['metadata']

@app.route('/resume', methods=['POST'])
def upload_file():
    if 'file' in request.files:
        file = request.files['file']

        # Save the uploaded file to local dir
        filename = secure_filename(file.filename)
        filename = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filename)

        # TODO: Do something with the extracted text
        print('Extracting resume information...')
        text, metadata = extract_pdf_data(filename)

        return 'File uploaded successfully'
    
    return 'No file uploaded.'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)