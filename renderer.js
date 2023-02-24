const apiSubmitButton = document.getElementById("api-key-btn");
var generateButton = null;
var goBackButton = null;

var API_KEY_INFO = null;
var COMPANY_NAME = null;
var USER_BACKGROUND = null;
var JOB_POSITION = null;

apiSubmitButton.addEventListener("click", async event => {
    // Get the API key from the user
    API_KEY_INFO = document.getElementById("api-key-txt").value;

    let mainPage = document.getElementById("main-page");
    let apiKeyPage = document.getElementById("api-key-page");
    mainPage.style.display = "block";
    apiKeyPage.style.display = "none";

    // Generate button click
    do {
        generateButton = document.getElementById("generate-btn");
    } while (generateButton == null);
    generateButton.addEventListener("click", onClickGenerateButton);

    // Go back button click
    do {
        goBackButton = document.getElementById("go-back-btn");
    } while (goBackButton == null);
    goBackButton.addEventListener("click", onClickGoBackButton);
});

async function onClickGoBackButton() {
    let mainPage = document.getElementById("main-page");
    let apiKeyPage = document.getElementById("api-key-page");
    mainPage.style.display = "none";
    apiKeyPage.style.display = "block";
};

async function onClickGenerateButton() {
    // Prep company & user info
    COMPANY_NAME = document.getElementById("company-info").value;
    USER_BACKGROUND = document.getElementById("user-background").value;
    JOB_POSITION = document.getElementById("job-position").value;

    if (!COMPANY_NAME) {
        alert('⚠️ You did not specify the company name! Please write the name of the company.');
    } else if (!USER_BACKGROUND) {
        alert('⚠️ You forgot to tell me your background! I cannot generate text without knowing who you are. Please write a brief summary of your background.');
    } else if (!JOB_POSITION) {
        alert('⚠️ You did not specify which position you are applying for! Please write down the job position.');
    } else {
        // let prompt = generatePrompt();
        // let prompt = `Say this is a test.`;

        // Get response from OpenAPI
        let company_info = await requestCompletion(`What is the mission statement of ${COMPANY_NAME}? Give me a brief summary.`);
        let prompt = generatePrompt_v1(company_info);
        let response = await requestCompletion(prompt);
        createParagraphs(response);

        console.log(`Company Info: ${company_info}`);
        console.log(`Prompt: ${prompt}`);
    }
};

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
};

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
};

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
};

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
};

function generatePrompt_v1(company_info) {
    return "Using the following company information and my background, " +
    `write a professional cover letter for ${JOB_POSITION} role to Hiring Manager.` +
    "\nCompany information:\n" +
    `${company_info}` +
    "\nMy background:\n" +
    `${USER_BACKGROUND}`
};

function generatePrompt_v2() {
    return `Think about the mission statement of ${COMPANY_NAME} ` +
    `and write a professional cover letter for ${JOB_POSITION} role. ` +
    `The cover letter must align the mission of ${COMPANY_NAME} ` +
    "with my background provided below:\n" +
    `${USER_BACKGROUND}`
};