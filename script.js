```javascript
// First, include tracking.js in your HTML:
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

Object.values(images).forEach(img => {
    img.img.src = img.src;
    img.img.onload = () => console.log(`Loaded ${img.src}`);
});

// Set up video streaming
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });

video.addEventListener('play', function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    trackFace();
});

function trackFace() {
    const tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    tracking.track('#video', tracker, { camera: true });

    tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        event.data.forEach(function(rect) {
            if (isCapturing) {
                drawFeatures(rect);
            }
        });
    });
}

function drawFeatures(rect) {
    const scale = Math.min(rect.width, rect.height);
    
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
});

saveBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'demon-meme.png';
    link.href = canvas.toDataURL();
    link.click();
});
```