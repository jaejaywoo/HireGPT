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
    uploadApiKey();
    document.getElementById("api-key-txt").value = '';

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

async function uploadApiKey() {
    try {
        let response = await axios.post(`${SERVER_URL}/apikey`, { 'OPENAI_API_KEY': API_KEY_INFO });
        console.log(response.data);
    } catch (e) {
        console.error(e);
        alert(e);
    }
}

async function uploadResume(event) {
    event.preventDefault();

    try {
        let formData = new FormData();
        formData.append("file", this.file.files[0]);

        let response = await axios.post(`${SERVER_URL}/resume`, formData, {
            headers: { 
                "Content-Type": "multipart/form-data"
            }
        });
        
        console.log(response.data);
        let text = response.data.choices[0].text.trim();
        let userBackground = document.getElementById("user-background");
        userBackground.value = text;
    } catch (e) {
        console.error(e);
        alert(e);
    }
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
        let response = await requestCompletion();
        createParagraphs(response.data.choices[0].text);
    }
}

async function requestCompletion() {
    try {
        const data = {
            'company_name': COMPANY_NAME,
            'role_description': ROLE_DESCRIPTION,
            'user_background': USER_BACKGROUND,
            'job_position': JOB_POSITION,
            'question_type': currentWriting
        }
        let response = await axios.post(`${SERVER_URL}/completion`, data);
        return response;
    } catch (e) {
        console.error(e);
        alert(e);
    }
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