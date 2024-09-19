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
  context.lineWidth = 20

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

  const layer1Canvases = document.querySelectorAll('.layer1');
  layer1Canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  });

  const layer21Canvases = document.querySelectorAll('.layer2-1');
  layer21Canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  });

  const layer22Canvases = document.querySelectorAll('.layer2-2');
  layer22Canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  });
}

function resetCanvas() {
  clickX = []
  clickY = []
  clickDrag = []
  clearCanvas()
}

function drawCanvas() {  
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

function splitAndDisplayQuadrants(cnvs, className) {
  const context = cnvs.getContext("2d");
  const halfWidth = cnvs.width / 2;
  const halfHeight = cnvs.height / 2;

  const imageData = [
    context.getImageData(0, 0, halfWidth, halfHeight), // Top-left
    context.getImageData(halfWidth, 0, halfWidth, halfHeight), // Top-right
    context.getImageData(0, halfHeight, halfWidth, halfHeight), // Bottom-left
    context.getImageData(halfWidth, halfHeight, halfWidth, halfHeight) // Bottom-right
  ];

  const quadrantCanvases = document.querySelectorAll(className);

  quadrantCanvases.forEach((canvas, index) => {
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData[index], 0, 0);
  });
  
  return quadrantCanvases
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

function pixelate(cntxt) {
  let rawPixels = cntxt.getImageData(0, 0, 200, 200).data
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

// refresh page
// function regAction() {
//     let pixels = getPixels()
//     document.getElementById('pixels').value = pixels
//     document.getElementById("practice-form").submit()
// }


// don't refresh page
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

function regAction() {
  let pixels = getPixels();
  // let pixels = pixelate(context);
  document.getElementById('pixels').value = pixels; // Still set the hidden input if needed

  layer1Canvases = splitAndDisplayQuadrants(canvas, '.layer1');
  // layer1Canvases.forEach(layer1 => {
  //   splitAndDisplayQuadrants(layer1, '.layer2');
  // });
  for (let i = 0; i < layer1Canvases.length; i++) {
    splitAndDisplayQuadrants(layer1Canvases[i], `.layer2-${i}`);
  }

  // Create a FormData object
  const formData = new FormData(document.getElementById("practice-form"));

  // Use Fetch API to send form data without reloading the page
  fetch('/recognize', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (response.ok) {
          return response.json(); // Parse JSON response
      }
      throw new Error('Network response was not ok.');
  })
  .then(data => {
      console.log(data);
      document.getElementById('prediction-output').innerText = `Prediction: ${data.pred}`;
    })
  .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
  });
}
