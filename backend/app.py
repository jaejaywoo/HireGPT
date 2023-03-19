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

# OpenAI configurations
PARAMS = {
    'model': "gpt-3.5-turbo",
    'temperature': 0.2,
    'max_tokens': 1000,
}

@app.route('/apikey', methods=['POST'])
def upload_apikey():
    data = request.get_json()
    if 'OPENAI_API_KEY' in data:
        openai.api_key = data['OPENAI_API_KEY']
        return 'API key received'
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

        # Parse resume pdf and create background summary
        text, _ = extract_pdf_data(filename)
        text = text.strip()

        prompt = generateResumeSummarizationPrompt(text)
        # response = openai.Completion.create(
        #     # prompt="Say this is a test.",  # XXX debugging purpose
        #     prompt=prompt,
        #     **PARAMS
        # )
        # return {
        #     'text': response['choices'][0]['text'].strip()
        # }

        # XXX ChatGPT model
        response = openai.ChatCompletion.create(
            # messages=[{'role': 'user', 'content': 'Say this is test.'}],  # XXX debugging purpose
            messages=[{'role': 'user', 'content': prompt}],
            **PARAMS
        )
        return {
            'text': response['choices'][0]['message']['content'].strip()
        }
    
    return 'No file uploaded.'


@app.route('/completion', methods=['POST'])
def request_completion():
    data = request.get_json()
    company_name = data['company_name']
    user_background = data['user_background']
    role_description = data['role_description']
    job_position = data['job_position']

    if data['question_type'] == 'cover-letter':
        prompt = generateCoverLetterPrompt(company_name, user_background, role_description, job_position)
    elif data['question_type'] == 'why-us':
        prompt = generateWhyUsPrompt(company_name, user_background, role_description, job_position)
    else:
        raise ValueError("Unknown question type.")

    # response = openai.Completion.create(
    #     # prompt="Say this is a test.",  # XXX debugging purpose
    #     prompt=prompt,
    #     **PARAMS
    # )
    # return response

    print(f'{prompt}', flush=True)
    # XXX ChatGPT model
    response = openai.ChatCompletion.create(
        # messages=[{'role': 'user', 'content': 'Say this is test.'}],  # XXX debugging purpose
        messages=[{'role': 'user', 'content': prompt}],
        **PARAMS
    )
    return {
        'text': response['choices'][0]['message']['content'].strip()
    }


def generateResumeSummarizationPrompt(resume):
    return f"""Summarize my resume by extracting the work experience section. Use first person pronouns and make it sound impressive.
Here is my resume:
{resume}
"""

def generateCoverLetterPrompt(company_name, user_background, role_description, job_position):
    return f"""Write a professional cover letter for the {job_position} position at {company_name}.
Here is the role description:
{role_description}

This is my background:
{user_background}
"""

def generateWhyUsPrompt(company_name, user_background, role_description, job_position):
    return f"""Explain why I would be a great fit for the ${job_position} position at ${company_name}.
This is the role description:
{role_description}

Here is my background:
{user_background}
"""

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)