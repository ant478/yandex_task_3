function start () {
    var camera = document.querySelector('.camera'),
        video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
        FPSBlock = document.querySelector('.controls__fps'),
        resolutionBlock = document.querySelector('.controls__resolution'),
        filters_container = document.querySelector('.controls__filter_container'),
        filters_wrapper = document.querySelector('.controls__filters_wrapper'),
        filters_next_button = document.querySelector('.controls__filter_next'),
        filters_previous_button = document.querySelector('.controls__filter_previous'),
        controls_buttons_container = document.querySelector('.controls__buttons'),
        controls_buttons_wrapper = document.querySelector('.controls__buttons_wrapper'),
        play_button = document.querySelector('.controls__buttons_play'),
        pause_button = document.querySelector('.controls__buttons_pause'), // получаем нужные HTML элементы
        context = canvas.getContext('2d'), // инициализируем глобальные переменные
        imageData = null,
        selectedFilter = null,
        width = 0,
        height = 0,
        FPS = 0;
        index = 0,
        pixels = [],
        filters = [
            {filter: noop, name: "Без фильтра"},    // инициализируем массив с фильтрами
            {filter: invert, name: "Инвертировать"}, 
            {filter: threshold, name: "Черно-белый"}, 
            {filter: grayscale, name: "Оттенки серого"},
            {filter: sepia, name: "Сепия"}
        ];

    // инициализируем обработчики событий
    window.addEventListener("resize", resizeCanvas);  // изменить размер canvas при ресайзе окна
    filters_next_button.addEventListener("click", selectNextFilter); // выбрать следующий фильтр в списке при клике на сооиветствующую кнопку
    filters_previous_button.addEventListener("click", selectPreviousFilter); // выбрать предыдущий фильтр в списке при клике на сооиветствующую кнопку
    play_button.addEventListener("click", play);  // возобновить воспроизведение при клике на сооиветствующую кнопку
    pause_button.addEventListener("click", pause); // приостановить воспроизведение  при клике на сооиветствующую кнопку

    window.requestAnimFrame = (function() { // инициализируем функцию requestAnimationFrame
        return  window.requestAnimationFrame   ||
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

    // функция которая ничего не делает
    function noop () {};

    // применяет к массиву pixels фильтр инвертирования
    function invert () {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = 255 - pixels[index];
            pixels[index + 1] = 255 - pixels[index + 1];
            pixels[index + 2] = 255 - pixels[index + 2];
        }
    };

    // применяет к массиву pixels монохромный фильтр фильтр 
    function threshold () {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = pixels[index + 1] = pixels[index + 2] = 
                (0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2] >= 128) ? 255 : 0;
        }
    };

    // применяет к массиву pixels фильтр "оттенки серого"
    function grayscale () {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = pixels[index + 1] = pixels[index + 2] = 
                0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2];
        }
    };

    // применяет к массиву pixels фильтр "сепия"
    function sepia() {
        for (index = 0; index < pixels.length; index += 4) {
            pixels[index] = 0.393 * pixels[index] + 0.769 * pixels[index + 1] + 0.189 * pixels[index + 2];
            pixels[index + 1] = 0.349 * pixels[index] + 0.686 * pixels[index + 1] + 0.168 * pixels[index + 2];
            pixels[index + 2] = 0.272 * pixels[index] + 0.534 * pixels[index + 1] + 0.131 * pixels[index + 2];
        }
    }

    // рисует следующий кадр применяя к нему выбранный фильтр и снова вызывает renderNextFrame
    function renderNextFrame () {
        try { // смотри комментарий 1 в readme
            if (video.currentTime > 0 && !video.paused && !video.ended) {
                width = canvas.width = camera.offsetWidth; // рефрешим canvas сбрасывая его длину и ширину
                height = canvas.height = camera.offsetHeight;
                context.drawImage(video, 0, 0, width, height); // копируем изображение с video на canvas
                imageData = context.getImageData(0, 0, width, height); // смотри комментарий 2 в readme
                pixels = imageData.data; // олучаем массив пикселей
                selectedFilter.filter(); // применяем к массиву пикселей выбранный фильтр
                context.putImageData(imageData, 0, 0); // рисуем на canvas что получилось
                FPS++; // инкрементим счетчик кадров
            }
        } finally {            
            window.requestAnimFrame(renderNextFrame); // переходим к следующей итерации
        }
    };

    // делает фильтр с индексом index из массива filters текущим
    function selectFilter (index) { 
        if (index >= 0 && index < filters.length) {
            selectedFilter = filters[index];
            filters_wrapper.style.left = -index * filters_container.offsetWidth + 'px';
        }
    };

    // делает предыдущий в списке фильтр текущим
    function selectPreviousFilter () {
        selectFilter(filters.indexOf(selectedFilter) - 1);
    };

    // делает следующий в списке фильтр текущим
    function selectNextFilter () {
        selectFilter(filters.indexOf(selectedFilter) + 1);
    };

    // отображает колличество кадров в секунду, сбрасывает счетчик кадров
    function showFPS () {
        FPSBlock.textContent = FPS + " fps";
        FPS = 0;
    };

    // отображает текущую высоту и ширину, заданные для элемента canvas
    function showResolution () {
        resolutionBlock.textContent = width + 'x' + height;
    };

    // возобновляет воспроизведение видео
    function play () {
        video.play();
        controls_buttons_wrapper.style.left = '0px';
    };

    // приостанавливает воспроизведение видео
    function pause () {
        video.pause();
        controls_buttons_wrapper.style.left = -controls_buttons_container.offsetWidth + 'px';
        FPS = 0;
    };

    // устанавливает размеры элемента canvas в зависимости от размера окна
    function resizeCanvas () {
        width = canvas.width = camera.offsetWidth;
        height = canvas.height = camera.offsetHeight;
        showResolution();
    };

    // генерирует html элементы с именами фильтров на основе массива filters, помещает их на станицу
    function generateFilterTags() {
        for (var i = 0; i < filters.length; i++) {
            var element = document.createElement('div');
            element.className = "controls__filter";
            element.textContent = filters[i].name;
            filters_wrapper.appendChild(element);
        }
    }

    // задает начальные значения переменным, запускает рендеринг кадров
    function init () {
        generateFilterTags(); // генерируем элементы с именами фильтров и помещаем их на страницу
        selectFilter(0); // выбираем фильтр 0 в списке
        resizeCanvas(); // устанавливаем резмеры элемента canvas
        showFPS(); // инициализируем счетчик кадров
        setInterval(showFPS, 1000); // запускаем счетчик кадров
        renderNextFrame(); // запускаем рендеринг кадров
    };

    getVideoStream(init); // получаем видео поток
};

window.addEventListener("DOMContentLoaded", start); // выполняем скрипт когда элементы страницы загружены
