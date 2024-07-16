document.getElementById('fileUploader').addEventListener('change', function() {
    // Store the file globally or in a better-scoped variable
    window.fileToUpload = this.files[0];
});

function uploadImage() {
    const file = window.fileToUpload;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    displayResult(code.data);
                } 
                else {
                    document.getElementById('qrResult').textContent = 'No QR code found.';
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select a file first.");
    }
}

function displayResult(data) {
    const resultElement = document.getElementById('qrResult');
    if (isValidUrl(data)) {
        resultElement.innerHTML = `Found URL: <a href="${data}" target="_blank">${data}</a>`;
    } else {
        resultElement.textContent = `Found text: ${data}`;
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}