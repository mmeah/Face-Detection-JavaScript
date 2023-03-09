const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    const landmarks = await faceapi.detectFaceLandmarksTiny(video);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const resizedLandmarks = faceapi.resizeResults(landmarks, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    const ctx = canvas.getContext("2d");
    const nose = resizedLandmarks.positions;
    const noseX = nose[0]._x;
    const noseY = nose[0]._y;
    const circle = new Path2D();
    circle.arc(noseX, noseY, 25, 0, 2 * Math.PI);
    ctx.fill(circle);

    const text = [
      'landmarks:'+landmarks.length,
      'landmarks2:'+resizedLandmarks.length,
      'NoseX:'+noseX,
      'NoseY'+noseY,
      'This is a textline!',
      'This is another textline!'
    ]
    const anchor = { x: 50, y: 50 }
    // see DrawTextField below
    const drawOptions = {
      anchorPosition: 'TOP_LEFT',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }
    const drawBox = new faceapi.draw.DrawTextField(text, anchor, drawOptions)
    drawBox.draw(canvas, resizedDetections)
    

  }, 500)
})