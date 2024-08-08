// Make sure to include tracking.js in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/tracking-min.js"></script>

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureBtn = document.getElementById('captureBtn');
const saveBtn = document.getElementById('saveBtn');

let isCapturing = false;
let features = [];

// Load images
const images = {
    leftHorn: { src: 'items/L-horn.png', img: new Image() },
    rightHorn: { src: 'items/R-horn.png', img: new Image() },
    eye: { src: 'items/eye.png', img: new Image() },
    morr: { src: 'items/morr.png', img: new Image() }
};

function loadImages() {
    return Promise.all(Object.values(images).map(img => {
        return new Promise((resolve, reject) => {
            img.img.onload = () => {
                console.log(`Loaded ${img.src}`);
                resolve();
            };
            img.img.onerror = () => reject(`Failed to load ${img.src}`);
            img.img.src = img.src;
        });
    }));
}

// Set up video streaming
function setupCamera() {
    return navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
        })
        .catch(function(err) {
            console.error("Camera error:", err);
            alert("Unable to access the camera. Please make sure you've granted the necessary permissions.");
        });
}

function initializeApp() {
    Promise.all([loadImages(), setupCamera()])
        .then(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
            trackFace();
        })
        .catch(error => {
            console.error("Initialization error:", error);
            alert("There was an error initializing the app. Please check the console for more details.");
        });
}

function trackFace() {
    const tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    tracking.track('#video', tracker, { camera: true });

    tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        console.log("Detected faces:", event.data.length);

        event.data.forEach(function(rect) {
            if (isCapturing) {
                drawFeatures(rect);
            }
        });
    });
}

function drawFeatures(rect) {
    const scale = Math.min(rect.width, rect.height);
    console.log("Face rectangle:", rect);
    
    // Draw horns
    const hornWidth = scale * 0.8;
    const hornHeight = hornWidth * (images.leftHorn.img.height / images.leftHorn.img.width);
    context.drawImage(images.leftHorn.img, rect.x - hornWidth * 0.3, rect.y - hornHeight * 0.8, hornWidth, hornHeight);
    context.drawImage(images.rightHorn.img, rect.x + rect.width - hornWidth * 0.7, rect.y - hornHeight * 0.8, hornWidth, hornHeight);

    // Draw eyes
    const eyeSize = scale * 0.3;
    context.drawImage(images.eye.img, rect.x + rect.width * 0.25 - eyeSize / 2, rect.y + rect.height * 0.3 - eyeSize / 2, eyeSize, eyeSize);
    context.drawImage(images.eye.img, rect.x + rect.width * 0.75 - eyeSize / 2, rect.y + rect.height * 0.3 - eyeSize / 2, eyeSize, eyeSize);

    // Draw whiskers
    const morrWidth = rect.width * 1.2;
    const morrHeight = morrWidth * (images.morr.img.height / images.morr.img.width);
    context.drawImage(images.morr.img, rect.x + rect.width / 2 - morrWidth / 2, rect.y + rect.height * 0.7, morrWidth, morrHeight);
}

captureBtn.addEventListener('click', function() {
    isCapturing = !isCapturing;
    captureBtn.textContent = isCapturing ? "Reset" : "Capture and Add Features";
    console.log("Capture mode:", isCapturing);
});

saveBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'demon-meme.png';
    link.href = canvas.toDataURL();
    link.click();
    console.log("Meme saved");
});

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);

// Add this line to check if the script is loading
console.log("Script loaded:", new Date().toISOString());