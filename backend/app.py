from flask import Flask, request

app = Flask(__name__)


@app.route('/', methods=['POST'])
def upload_file():
    print(f'request method: {request.method}')
    print(f'request object: {request}')
    print(f'request files: {request.files}')
    print(f'request form: {request.form}')

    if 'file' in request.files:
        file = request.files['file']
        print(f'request files: {file}')
    else:
        print(f'No file')
    return "File upload complete!"

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)