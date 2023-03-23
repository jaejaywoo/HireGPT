const SERVER_URL = "http://127.0.0.1:8000";

const apiSubmitButton = document.getElementById("api-key-btn");
const loadingSpinner = document.getElementById("spinner");
var API_KEY_INFO = null;

var currentWriting = null;
var coverLetterButton = null;
var whyUsButton = null;
var uploadResumeButton = null;
var uploadResumeForm = null;
var generateButton = null;
var goBackButton = null;


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
    let response = await makeRequest(
        method='post',
        url=`${SERVER_URL}/apikey`,
        data={ 'OPENAI_API_KEY': API_KEY_INFO }
    );
    console.log(response.data);
}

async function uploadResume(event) {
    event.preventDefault();

    let formData = new FormData();
    formData.append("file", this.file.files[0]);

    let response = await makeRequest(
        method='post',
        url=`${SERVER_URL}/resume`,
        data=formData,
        headers={ "Content-Type": "multipart/form-data" }
    );
    
    // Fill in the user background
    console.log(response);
    let userBackground = document.getElementById("user-background");
    userBackground.value = response.data.text;
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
    let company_name = document.getElementById("company-info").value;
    let role_description = document.getElementById("role-description").value;
    let user_background = document.getElementById("user-background").value;
    let job_position = document.getElementById("job-position").value;

    if (!company_name) {
        alert('⚠️ You did not specify the company name! Please write the name of the company.');
    } else if (!role_description) {
        alert('⚠️ The role description section is missing! Please tell us more about the role you are applying for.');
    } else if (!user_background) {
        alert('⚠️ You forgot to tell me your background! I cannot generate text without knowing who you are. Please write a brief summary of your background.');
    } else if (!job_position) {
        alert('⚠️ You did not specify which position you are applying for! Please write down the job position.');
    } else {
        let response = await requestCompletion(
            company_name=company_name,
            role_description=role_description,
            user_background=user_background,
            job_position=job_position
        );
        console.log(response);
        createParagraphs(response.data.text);
    }
}

async function requestCompletion(company_name, role_description, user_background, job_position) {
    const info = {
        'company_name': company_name,
        'role_description': role_description,
        'user_background': user_background,
        'job_position': job_position,
        'question_type': currentWriting
    }
    let response = await makeRequest(
        method='post',
        url=`${SERVER_URL}/completion`,
        data=info
    );
    return response;
}

async function makeRequest(method, url, data, ...extras) {
    showSpinner();
    try {
        const requestConfig = {
            method: method,
            url: url,
            data: data,
            ...extras
        }
        let response = await axios(requestConfig);
        return response;
    } catch (e) {
        console.error(e);
        alert(e);
    } finally {
        hideSpinner();
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

function showSpinner() {
    loadingSpinner.style.display = 'flex';
    loadingSpinner.style.zIndex = 10;
}

function hideSpinner() {
    loadingSpinner.style.display = 'none';
}

showSpinner();
setTimeout(hideSpinner, 4000); // Hide spinner after 3 seconds