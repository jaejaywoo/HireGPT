const SERVER_URL = "http://127.0.0.1:5000";

// Check server connection
(() => {
    axios.get(`${SERVER_URL}/`)
    .then((response) => {
        console.log(response.data);
        console.log('server connected');
    })
    .catch((error) => {
        console.error(error);
    });
})();