import os 

from tika import parser
from flask import Flask, request
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'data')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Define a function to extract text and metadata from a PDF file using the Tika parser
def extract_pdf_data(file):
    parsed_pdf = parser.from_file(file)
    return parsed_pdf['content'], parsed_pdf['metadata']

@app.route('/', methods=['POST'])
def upload_file():
    print(f'request method: {request.method}')
    print(f'request object: {request}')
    # print(f'request files: {request.files}')
    # print(f'request form: {request.form}')

    if 'file' in request.files:
        file = request.files['file']
        print(f'request file: {file}')
        print(f'filename: {file.filename}')
        # print(f'file read: {file.read().decode("latin-1")}')
        print(f'folder: {app.config["UPLOAD_FOLDER"]}')

        # Save the uploaded file to local dir
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        # text, metadata = extract_pdf_data(file)
        # Do something with the extracted text and metadata
        return 'PDF file uploaded successfully'
    else:
        print(f'No file')
    return "File upload complete!"

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)