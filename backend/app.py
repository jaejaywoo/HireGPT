from flask import Flask

app = Flask(__name__)


@app.route('/test')
def hello():
    return "Hello World is good!"

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)