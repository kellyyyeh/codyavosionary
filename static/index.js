// adapted from http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
// for mobile & touch https://stackoverflow.com/questions/17656292/html5-canvas-support-in-mobile-phone-browser

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
}

function resetCanvas() {
  clickX = []
  clickY = []
  clickDrag = []
  clearCanvas()
}

function drawCanvas() {
  clearCanvas()

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

// this is shrinking the image, but still grabbing the important parts of it
function getPixels() {
  let rawPixels = context.getImageData(0, 0, 200, 200).data
  let _pixels = []
  let pixels = []
//25x25
  for (i=0; i < rawPixels.length; i += 8) {
    _pixels.push(rawPixels[i + 7])
  }

  for (i=0; i < _pixels.length; i += 800) {
    for (j=0; j < 200; j += 8) {
      pixels.push(_pixels[i+j])
    }
  }

  return pixels
}

// function regAction() {
//     let pixels = getPixels()
//     document.getElementById('pixels').value = pixels
//     document.getElementById("practice-form").submit()
// }

function regAction() {
  let pixels = getPixels();
  document.getElementById('pixels').value = pixels;

  // Use Fetch API to send form data without reloading
  const formData = new FormData(document.getElementById("practice-form"));

  fetch('recognize', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (response.ok) {
          return response.json(); // Or response.text(), depending on your server response
      }
      throw new Error('Network response was not ok.');
  })
  .then(data => {
      // Handle success (e.g., update the UI)
      console.log(data);
  })
  .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
  });
}
