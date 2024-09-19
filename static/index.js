let canvas
let context
let paint
let clickX = []
let clickY = []
let clickDrag = []

function startCanvas() {
  canvas = document.getElementById("canvas")
  context = canvas.getContext("2d")

  context.strokeStyle = "#000000"
  context.lineJoin = "round"
  context.lineWidth = 8

  canvas.addEventListener("touchstart", function (e) {
    var touch = e.touches[0]
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    canvas.dispatchEvent(mouseEvent)
  })

  canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0]
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    canvas.dispatchEvent(mouseEvent)
  })

  canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup")
    canvas.dispatchEvent(mouseEvent)
  })

  $('#canvas').mousedown(function (e) {
    paint = true
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false)
    drawCanvas()
  })

  $('#canvas').mousemove(function (e) {
    if (paint) {
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true)
      drawCanvas()
    }
  })

  $('#canvas').mouseup(function (e) {
    paint = false
    drawCanvas()
  })

  $('#canvas').mouseleave(function (e) {
    paint = false
  })
}

function addClick(x, y, dragging) {
  clickX.push(x)
  clickY.push(y)
  clickDrag.push(dragging)
}

function clearCanvas() {
  context.clearRect(0, 0, 200, 200)

  // Get the quadrant canvases
  const topLeft = document.getElementById("top-left");
  const topRight = document.getElementById("top-right");
  const bottomLeft = document.getElementById("bottom-left");
  const bottomRight = document.getElementById("bottom-right");

  // Get their contexts
  const ctxTopLeft = topLeft.getContext("2d")
  const ctxTopRight = topRight.getContext("2d")
  const ctxBottomLeft = bottomLeft.getContext("2d")
  const ctxBottomRight = bottomRight.getContext("2d")

  // Clear each quadrant canvas
  ctxTopLeft.clearRect(0, 0, topLeft.width, topLeft.height)
  ctxTopRight.clearRect(0, 0, topRight.width, topRight.height)
  ctxBottomLeft.clearRect(0, 0, bottomLeft.width, bottomLeft.height)
  ctxBottomRight.clearRect(0, 0, bottomRight.width, bottomRight.height)
}

function resetCanvas() {
  clickX = []
  clickY = []
  clickDrag = []
  clearCanvas()
}

function drawCanvas() {
//   clearCanvas()
  
  for(let i=0; i<clickX.length; i++) {
    context.beginPath()
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i - 1], clickY[i - 1])
    } else {
      context.moveTo(clickX[i] - 1, clickY[i])
    }
    context.lineTo(clickX[i], clickY[i])
    context.closePath()
    context.stroke()
  }
}

function splitAndDisplayQuadrants() {
  const halfWidth = canvas.width / 2
  const halfHeight = canvas.height / 2

  // Get the image data for each quadrant
  const topLeftData = context.getImageData(0, 0, halfWidth, halfHeight)
  const topRightData = context.getImageData(halfWidth, 0, halfWidth, halfHeight)
  const bottomLeftData = context.getImageData(0, halfHeight, halfWidth, halfHeight)
  const bottomRightData = context.getImageData(halfWidth, halfHeight, halfWidth, halfHeight)

  // Get contexts for each quadrant canvas
  const topLeftCanvas = document.getElementById("top-left").getContext("2d")
  const topRightCanvas = document.getElementById("top-right").getContext("2d")
  const bottomLeftCanvas = document.getElementById("bottom-left").getContext("2d")
  const bottomRightCanvas = document.getElementById("bottom-right").getContext("2d")

  // Draw the image data onto the respective canvases
  topLeftCanvas.putImageData(topLeftData, 0, 0)
  topRightCanvas.putImageData(topRightData, 0, 0)
  bottomLeftCanvas.putImageData(bottomLeftData, 0, 0)
  bottomRightCanvas.putImageData(bottomRightData, 0, 0)
}

// this is shrinking the image, but still grabbing the important parts of it
function getPixels() {
  let rawPixels = context.getImageData(0, 0, 200, 200).data
  let _pixels = []
  let pixels = []
//50x50
  for (i=0; i < rawPixels.length; i += 4) {
    _pixels.push(rawPixels[i + 3])
  }

  for (i=0; i < _pixels.length; i += 800) {
    for (j=0; j < 200; j += 4) {
      pixels.push(_pixels[i+j])
    }
  }

  return pixels
}

function regAction() {
    let pixels = getPixels()
    document.getElementById('pixels').value = pixels
    document.getElementById("practice-form").submit()
}

// function regAction() {
//   let pixels = getPixels();
//   document.getElementById('pixels').value = pixels;

//   // Display CNN
//    layer1 = splitAndDisplayQuadrants();
// //   layer2 = splitAndDisplayQuadrants(layer1);
  
//   // Use Fetch API to send form data without reloading
//   const formData = new FormData(document.getElementById("practice-form"));

//   console.log('inside regAction')

//   fetch('/recognize', {
//       method: 'POST',
//       body: formData
//   })
//   .then(response => {
//       if (response.ok) {
//           return response.json(); // Or response.text(), depending on your server response
//       }
//       throw new Error('Network response was not ok.');
//   })
//   .then(data => {
//       // Handle success (e.g., update the UI)
//       console.log(data);
//   })
//   .catch(error => {
//       console.error('There was a problem with the fetch operation:', error);
//   });
// }
