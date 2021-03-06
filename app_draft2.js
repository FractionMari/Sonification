window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var image = document.querySelector('img');
  
  
    
  //ToneJs
  
  const gainNode = new Tone.Gain().toMaster();
  const autoFilter = new Tone.AutoWah().connect(gainNode);
  const synth = new Tone.AMSynth().connect(autoFilter);
  const synth2 = new Tone.FMSynth().connect(autoFilter);
  const osc = new Tone.Oscillator().connect(gainNode);
  gainNode.gain.value = 0.5;
  synth.frequency.value = 440;

  //Tone.Transport.scheduleRepeat((time) => {
  //  // use the callback time to schedule events
  //  osc.start(time).stop(time + 0.1);
  //}, "8n");

  
  /// Pixelating code:
  
  // Create new image element.
  //var image = new Image();
  
  // Set an image.
  //image.src = 'assets/zappa.jpg';
  image.src = URL.createObjectURL(this.files[0]); // set src to blob url
  
  // Append image to body.
  document.body.appendChild(image);
  
  // After image has been loaded in memory invoke a callback.
  image.onload = imageLoaded;
  
  // Image loaded callback.
  function imageLoaded() {
  
  //synth.triggerAttack(); 
  //synth2.triggerAttack(); 
    URL.revokeObjectURL(image.src);  // no longer needed, free memory
    // Get the dimensions of loaded image.
  
    var width = image.clientWidth;
    var height = image.clientHeight;
  
    // Create canvas element.
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // This is what gives us that blocky pixel styling, rather than a blend between pixels.
    canvas.style.cssText = 'image-rendering: optimizeSpeed;' + // FireFox < 6.0
                           'image-rendering: -moz-crisp-edges;' + // FireFox
                           'image-rendering: -o-crisp-edges;' +  // Opera
                           'image-rendering: -webkit-crisp-edges;' + // Chrome
                           'image-rendering: crisp-edges;' + // Chrome
                           'image-rendering: -webkit-optimize-contrast;' + // Safari
                           'image-rendering: pixelated; ' + // Future browsers
                           '-ms-interpolation-mode: nearest-neighbor;'; // IE
  
    // Grab the drawing context object. It's what lets us draw on the canvas.
    var context = canvas.getContext('2d');
  
    // Use nearest-neighbor scaling when images are resized instead of the resizing algorithm to create blur.
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
  
    // We'll be pixelating the image by 80% (20% of original size).
    var percent = 0.05;
  
    // Calculate the scaled dimensions.
    var scaledWidth = width * percent;
    var scaledHeight = height * percent;
  
    // Render image smaller.
    context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
  
    // Stretch the smaller image onto larger context.
    context.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);
  
    // Here are what the above parameters mean:
    // canvasElement, canvasXOffsetForImage, canvasYOffsetForImage, imageWidth, imageHeight, imageXOffset, imageYOffset, destinationImageWidth, destinationImageHeight
  
    // Append canvas to body.
    document.body.appendChild(canvas);
  
    //image.style.display = 'none';
  
    function pick2(event, destination) {
      var x = event.layerX;
      var y = event.layerY;
      var pixel = context.getImageData(x, y, 1, 1);
      var data = pixel.data;
    
        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;

        destination.style.background = rgba;
        destination.textContent = rgba;
        let pitchValue1 = (data[0]);
        let pitchValue2 = (data[1]);
        let pitchValue3 = (data[2]);

        const highest = Math.max((data[0]), (data[1]), (data[2]) );
        const lowest = Math.min((data[0]), (data[1]), (data[2]) );
        let brightness = (highest + lowest) / 2 / 255;

        synth.frequency.value = pitchValue1;
        synth2.frequency.value = pitchValue2;
        osc.frequency.value = (pitchValue1 + pitchValue3) / 2;

        
        //console.log(highest);
        //console.log(lowest);
        console.log(brightness);
    //console.log(yMoveValue / 50);
/*     let index = 0;

    Tone.Transport.scheduleRepeat(repeat, '3n');
    function repeat(time) {
      let step = index % 2;
      for (let i = 0; i < 2; i++) {
        //let synth = synths[i];
        if (brightness > 0.4) synth.triggerAttackRelease(pitchValue1, '8n', time);
        if (brightness > 0.4) synth2.triggerAttackRelease(pitchValue2, '8n', time);
        if (brightness > 0.4) synth.triggerAttackRelease(pitchValue1, '8n', time + 1);
        if (brightness > 0.4) synth2.triggerAttackRelease(pitchValue2, '8n', time + 1);
            
      }
      index++;
    } */
        return rgba;
    }
  
    canvas.addEventListener('mousemove', function(event) {
      pick2(event, hoveredColor2);
    yMoveValue = (Math.floor(event.layerY * percent));
    xMoveValue = (Math.floor(event.layerX * percent));
    autoFilter.baseFrequency = xMoveValue * 10;
    //gainValue.gain.value = yMoveValue / 100;
  

  });
  canvas.addEventListener('click', function(event) {
      pick2(event, selectedColor2);
    console.log(Math.floor(event.layerY * percent));
  
          
  
  
    //console.log(event.screenY);
    //console.log(typeof(event));
    console.log(event);
    //console.log(event[3]);
      // transport must be started before it starts invoking events
    //Tone.Transport.start();


    Tone.Transport.start();


  
  });
  }
  
  var hoveredColor2 = document.getElementById('hovered-color');
  var selectedColor2 = document.getElementById('selected-color');
  
  
  document.getElementById("mute").addEventListener("click", function(){
  
  
  if(this.className == 'is-playing'){
    this.className = "";
    this.innerHTML = "MUTE: ON"
    gainNode.gain.rampTo(0, 0.2);
  }else{
  
    this.className = "is-playing";
    this.innerHTML = "MUTE: OFF";
    gainNode.gain.rampTo(0.5, 0.2);
  
  }
  
  
  
  });
  
  }
  });
  });
  
  