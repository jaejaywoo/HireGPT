const SERVER_URL = "http://127.0.0.1:5000";

const apiSubmitButton = document.getElementById("api-key-btn");

var currentWriting = null;
var coverLetterButton = null;
var whyUsButton = null;
var uploadResumeButton = null;
var uploadResumeForm = null;
var generateButton = null;
var goBackButton = null;

var API_KEY_INFO = null;
var COMPANY_NAME = null;
var ROLE_DESCRIPTION = null;
var USER_BACKGROUND = null;
var JOB_POSITION = null;

apiSubmitButton.addEventListener("click", async event => {
    // Get the API key from the user
    API_KEY_INFO = document.getElementById("api-key-txt").value;

    let mainPage = document.getElementById("main-page");
    let apiKeyPage = document.getElementById("api-key-page");
    mainPage.style.display = "block";
    apiKeyPage.style.display = "none";

    // Cover letter button click
    coverLetterButton = waitUntilLoad('cover-letter-btn');
    coverLetterButton.addEventListener('click', selectCoverLetterBtn);

    // Why button click
    whyUsButton = waitUntilLoad('why-us-btn');
    whyUsButton.addEventListener('click', selectWhyUsBtn);

    // Default
    selectCoverLetterBtn();

    // Upload resume submit
    uploadResumeForm = waitUntilLoad('upload-resume-form');
    uploadResumeForm.addEventListener('submit', uploadResume);

    // Generate button click
    generateButton = waitUntilLoad('generate-btn');
    generateButton.addEventListener("click", onClickGenerateButton);

    // Go back button click
    goBackButton = waitUntilLoad('go-back-btn');
    goBackButton.addEventListener("click", onClickGoBackButton);
});

function selectCoverLetterBtn() {
    coverLetterButton.style.backgroundColor = "#9cc0f7";  // selected
    whyUsButton.style.backgroundColor = "#d2e4ff";
    currentWriting = 'cover-letter';
}

function selectWhyUsBtn() {
    coverLetterButton.style.backgroundColor = "#d2e4ff";
    whyUsButton.style.backgroundColor = "#9cc0f7";  // selected
    currentWriting = 'why-us';
}

async function uploadResume(event) {
    event.preventDefault();

    let formData = new FormData();
    formData.append("file", this.file.files[0]);

    axios.post(`${SERVER_URL}/resume`, formData, {
        headers: { 
            "Content-Type": "multipart/form-data"
        }
    })
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.error(error);
    });

}

function waitUntilLoad(id) {
    let ele = null;
    do {
        ele = document.getElementById(id);
    } while (ele == null);
    return ele;
}

async function onClickGoBackButton() {
    let mainPage = document.getElementById("main-page");
    let apiKeyPage = document.getElementById("api-key-page");
    mainPage.style.display = "none";
    apiKeyPage.style.display = "block";
}

async function onClickGenerateButton() {
    // Prep company & user info
    COMPANY_NAME = document.getElementById("company-info").value;
    ROLE_DESCRIPTION = document.getElementById("role-description").value;
    USER_BACKGROUND = document.getElementById("user-background").value;
    JOB_POSITION = document.getElementById("job-position").value;

    if (!COMPANY_NAME) {
        alert('⚠️ You did not specify the company name! Please write the name of the company.');
    } else if (!ROLE_DESCRIPTION) {
        alert('⚠️ The role description section is missing! Please tell us more about the role you are applying for.');
    } else if (!USER_BACKGROUND) {
        alert('⚠️ You forgot to tell me your background! I cannot generate text without knowing who you are. Please write a brief summary of your background.');
    } else if (!JOB_POSITION) {
        alert('⚠️ You did not specify which position you are applying for! Please write down the job position.');
    } else {
        // Get response from OpenAPI
        let prompt = null;
        if (currentWriting == "cover-letter") {
            prompt = generateCoverLetterPrompt();
        } else if (currentWriting == "why-us") {
            prompt = generateWhyUsPrompt();
        } else {
            alert('⚠️ Unknown writing format!');
        }

        let response = await requestCompletion(prompt);
        createParagraphs(response);

        console.log(`Prompt: ${prompt}`);
    }
}

async function requestCompletion(prompt) {
    try {
        let requestOptions = getRequestOptions(prompt);
        let response = await fetch("https://api.openai.com/v1/completions", requestOptions);

        if (response.ok) {
            let data = await response.json();
            return data.choices[0].text;
        } else {
            handleErrors(response);
        }
    } catch (e) {
        console.log(e);
        alert(e);
    }
}

function getRequestOptions(prompt) {
    const params = {
        "prompt": prompt,
        "model": "text-davinci-003",
        "max_tokens": 700,
        "temperature": 0.2,
        "n": 1,
    }
    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + API_KEY_INFO,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    }
    return requestOptions
}

function createParagraphs(text) {
    let answerDiv = document.getElementById('answer');
    answerDiv.innerHTML = "";
    answerDiv.style.color = "#123693";

    let texts = text.split(/\r\n|\r|\n/);
    for (let i in texts) {
        let p = document.createElement("p");
        p.innerHTML = texts[i];
        answerDiv.appendChild(p);
    }
}

function handleErrors(response) {
    switch (response.status) {
        case 401: // 401: Unauthorized: API key is wrong
            throw new Error('Please double-check your API key.');
        case 429: // 429: Too Many Requests: Need to pay
            throw new Error('You exceeded your current quota, please check your plan and billing details.');
        case 405: // 405: Wrong HTTP method
            throw new Error('Your current HTTP method is not compatible with the request.');
        default:
            throw new Error(`Error occurred (error code: ${response.status})`);
    }
}

function generateCoverLetterPrompt() {
    return `Write a professional cover letter for the ${JOB_POSITION} position at ${COMPANY_NAME}.` +
    "\n\nHere is the role description:\n" +
    `${ROLE_DESCRIPTION}` +
    "\n\nThis is my background:\n" +
    `${USER_BACKGROUND}`
}

function generateWhyUsPrompt() {
    return `Explain why I would be a great fit for the ${JOB_POSITION} position at ${COMPANY_NAME}.` +
    "\n\nThis is the role description:\n" +
    `${ROLE_DESCRIPTION}` +
    "\n\nHere is my background:\n" +
    `${USER_BACKGROUND}`

}