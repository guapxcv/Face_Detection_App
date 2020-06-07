const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"), // smaller and quicker
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"), // 68parts of face
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"), // detects facial expression
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " year old  " + detection.gender.toUpperCase(),
      });
      drawBox.draw(canvas);
    });
  }, 80);
});
