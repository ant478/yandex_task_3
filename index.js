function start () {
    var camera = document.querySelector('.camera'),
        video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
        FPSBlock = document.querySelector('.fps'),
        context = canvas.getContext('2d'),
        filterName = '',
        imageData = null,
        width = 0,
        height = 0,        
        FPS = 0;
        index = 0,
        pixels = [],
        filters = {
            invert: invert,
            threshold: threshold,
            grayscale: grayscale
        };

    function getVideoStream (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.onloadedmetadata = function (e) {
                        video.play();
                        callback();
                    };
                    video.src = window.URL.createObjectURL(stream);
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    function invert () {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = 255 - pixels[index];
            pixels[index + 1] = 255 - pixels[index + 1];
            pixels[index + 2] = 255 - pixels[index + 2];
        }
    };

    function threshold () {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = pixels[index + 1] = pixels[index + 2] = 
                (0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2] >= 128) ? 255 : 0;
        }
    };

    function grayscale () {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = pixels[index + 1] = pixels[index + 2] = 
                0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2];
        }
    };

    function applyFilter () {
        try {
            resizeCanvas();
            context.drawImage(video, 0, 0, width, height);
            imageData = context.getImageData(0, 0, width, height);
            pixels = imageData.data;
            filters[filterName]();
            context.putImageData(imageData, 0, 0);
            FPS++;
        } finally {
            window.requestAnimFrame(applyFilter);
        }
    };

    function changeFilter (event) {
        filterName = event.target.value;
    };

    function showFPS () {
        FPSBlock.textContent = FPS + " fps";
        FPS = 0;
    };

    function resizeCanvas () {
        width = canvas.width = camera.offsetWidth;
        height = canvas.height = camera.offsetHeight;
    };

    function init () {
        window.requestAnimFrame = (function() {
          return  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                  };
        })();
        var controlFilters = document.getElementsByClassName('controls__filter');
        for (var i = 0; i < controlFilters.length; i++) {
            controlFilters[i].addEventListener("change", changeFilter);
            if (controlFilters[i].checked) {
                filterName = controlFilters[i].value;
            }
        }
        if (!filterName) 
            filterName = 'grayscale';
        width = canvas.width = camera.offsetWidth;
        height = canvas.height = camera.offsetHeight;
        window.addEventListener("resize", resizeCanvas);
        setInterval(showFPS, 1000);
        applyFilter();        
    }

    getVideoStream(init);
};

window.addEventListener("DOMContentLoaded", start);
