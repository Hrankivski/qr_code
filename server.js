const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const jsQR = require('jsqr');

const app = express();
app.use(express.static('public'));

app.post('/upload', upload.single('image'), async (req, res) => {
    if (req.file) {
        try {
            // Load the image into canvas
            const img = await loadImage(req.file.buffer);
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Extract the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Decode the QR code from the image data
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
                // If a QR code was found, send the result
                res.json({
                    status: "success",
                    message: "QR code decoded successfully!",
                    data: qrCode.data
                });
            } else {
                // If no QR code was found
                res.status(400).json({
                    status: "error",
                    message: "No QR code found."
                });
            }
        } catch (error) {
            console.error("Error processing image:", error);
            res.status(500).json({
                status: "error",
                message: "Failed to process image."
            });
        }
    } else {
        res.status(400).json({
            status: "error",
            message: "No file uploaded."
        });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
