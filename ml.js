// GLOBAL VARIABLES
let webcam;
let webcamSketch;
let resultsSketch;
let classifier;
let predictions = [];
let label = "Waiting for webcam...";
let recognizing = false;

const modelURL = "https://teachablemachine.withgoogle.com/models/vkwnlSIHj/";

// SETUP & LOAD MODEL
function setup() {

    // Load classifier
    classifier = ml5.imageClassifier(modelURL + "model.json");

    createWebcamSketch();

    createPredictionSketch();

    // Start webcam when link is clicked
    document.getElementById("start-recognition").addEventListener("click", startRecognition);
}

// START WEBCAM
function startRecognition(event) {
    event.preventDefault();

    if (recognizing) {
        stopRecognition();
        return;
    }

    recognizing = true;

    const button = document.getElementById("start-recognition");
    button.textContent = "Stop Recognition";

    webcam = webcamSketch.createCapture(VIDEO, () => {
        webcam.size(416, 264);
        webcam.hide();
        classifyVideo();
    });
}

// STOP WEBCAM
function stopRecognition() {

    recognizing = false;

    if (webcam) {
        webcam.elt.srcObject.getTracks().forEach(track => track.stop());
        webcam.remove();
        webcam = null;
    }

    predictions = [];
    label = "Waiting for webcam...";

    const button = document.getElementById("start-recognition");
    button.textContent = "Start Recognition";
}

// CLASSIFICATION

function classifyVideo() {

    if (!webcam || !recognizing) {
        return;
    }

    classifier.classify(webcam, gotResults);
}

function gotResults(results) {

    if (!recognizing) {
        return;
    }

    if (results.length > 0) {
        predictions = results;
        label = results[0].label;
    }
    
    classifyVideo();

}

function createWebcamSketch() {
    
    const sketch = (p) => {

        p.setup = () => {
            const canvas = p.createCanvas(416, 264);
            canvas.parent(document.querySelector(".webcam-canvas"));
        };

        p.draw = () => {

            p.background("#555555");

            if (webcam) {
                p.push();

                p.translate(p.width, 0);
                p.scale(-1, 1);

                p.image(webcam, 0, 0, p.width, p.height);
                p.pop();
            }
            else {
                p.fill("#D2F901");
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textStyle(p.BOLD);
                p.textSize(28);

                p.text("Waiting for webcam...", p.width / 2, 48);
            }
        };
    };
    webcamSketch = new p5(sketch);
}

function createPredictionSketch() {

    const sketch = (p) => {

        p.setup = () => {
            const canvas = p.createCanvas(416, 264);
            canvas.parent(document.querySelector(".results-canvas"));
        };

        p.draw = () => {
            p.background("#555555");
            p.noStroke();

            // Top prediction
            p.fill("#D2F901");
            p.textAlign(p.CENTER);
            p.textStyle(p.BOLD);
            p.textSize(28);
            p.text(label, p.width / 2, 48);

            // Top prediction confidence
            if (predictions.length > 0) {
                const confidence = (predictions[0].confidence * 100).toFixed(1);

                p.fill("#FFFFFF");
                p.textSize(18);

                p.text(`${confidence}% confidence`, p.width / 2, 78);
            }

            // Divider
            p.stroke("#D2F901");
            p.line(0, 105, p.width, 105);
            p.noStroke();

            // All Predictions
            p.fill("#FFFFFF");
            p.textStyle(p.BOLD);
            p.textSize(15);

            p.text("All Predictions", p.width / 2, 139);

            // Prediction rows
            p.textStyle(p.NORMAL);
            p.textSize(14);

            predictions.forEach((prediction, index) => {

                const y = 170 + (index * 22);

                const confidence = (prediction.confidence * 100).toFixed(1);

                // Label
                p.textAlign(p.LEFT);
                p.text(prediction.label, 110, y);

                // Percentage
                p.textAlign(p.RIGHT);
                p.text(`${confidence}%`, 306, y);
            });
        };
    };
    resultsSketch = new p5(sketch);
}
