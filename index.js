function start () {
    var camera = document.querySelector('.camera'),
        video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
        FPSBlock = document.querySelector('.controls__fps'),
        resolutionBlock = document.querySelector('.controls__resolution'),
        filters_container = document.querySelector('.controls__filter_container'),
        filters_wrapper = document.querySelector('.filters_wrapper'),
        select_next_filter_button = document.querySelector('.controls__filter_next'),
        select_previous_filter_button = document.querySelector('.controls__filter_previous'),
        buttons_container = document.querySelector('.controls__buttons'),
        buttons_wrapper = document.querySelector('.controls__buttons_wrapper'),
        play_button = document.querySelector('.controls__buttons_play'),
        pause_button = document.querySelector('.controls__buttons_pause'),
        context = canvas.getContext('2d'),
        imageData = null,
        selectedFilter = null,
        width = 0,
        height = 0,        
        FPS = 0;
        index = 0,
        pixels = [],
        filters = [
            {filter: noop, name: "Без фильтра"}, 
            {filter: invert, name: "Инвертировать"}, 
            {filter: threshold, name: "Черно-белый"}, 
            {filter: grayscale, name: "Оттенки серого"}
        ];


    window.addEventListener("resize", resizeCanvas);
    select_next_filter_button.addEventListener("click", selectNextFilter);
    select_previous_filter_button.addEventListener("click", selectPreviousFilter);
    play_button.addEventListener("click", play);
    pause_button.addEventListener("click", pause);

    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

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

    function noop () {};

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
            if (video.currentTime > 0 && !video.paused && !video.ended) {
                width = canvas.width = camera.offsetWidth;
                height = canvas.height = camera.offsetHeight;
                context.drawImage(video, 0, 0, width, height);
                imageData = context.getImageData(0, 0, width, height);
                pixels = imageData.data;
                selectedFilter.filter();
                context.putImageData(imageData, 0, 0);
                FPS++;
            }
        } finally {            
            window.requestAnimFrame(applyFilter);
        }
    };

    function selectFilter (index) {
        if (index >= 0 && index < filters.length) {
            selectedFilter = filters[index];
            filters_wrapper.style.left = -index * filters_container.offsetWidth + 'px';
        }
    };

    function selectPreviousFilter () {
        selectFilter(filters.indexOf(selectedFilter) - 1);
    };

    function selectNextFilter () {
        selectFilter(filters.indexOf(selectedFilter) + 1);
    };

    function showFPS () {
        FPSBlock.textContent = FPS + " fps";
        FPS = 0;
    };

    function showResolution () {
        resolutionBlock.textContent = width + 'x' + height;
    };

    function play () {
        video.play();
        buttons_wrapper.style.left = '0px';
    };

    function pause () {
        video.pause();
        buttons_wrapper.style.left = -buttons_container.offsetWidth + 'px';
        FPS = 0;
    };

    function resizeCanvas () {
        width = canvas.width = camera.offsetWidth;
        height = canvas.height = camera.offsetHeight;
        showResolution();
    };

    function generateFilterTags() {
        for (var i = 0; i < filters.length; i++) {
            var element = document.createElement('div');
            element.className = "controls__filter";
            element.textContent = filters[i].name;
            filters_wrapper.appendChild(element);
        }
    }

    function init () {
        generateFilterTags();
        selectFilter(0);
        resizeCanvas();
        showFPS();
        setInterval(showFPS, 1000);
        applyFilter();        
    };

    getVideoStream(init);
};

window.addEventListener("DOMContentLoaded", start);
