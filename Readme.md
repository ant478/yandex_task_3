Задание на оптимизацию
======================

Во время разработки программы планировалось, что она будет выводить на экран изображение с камеры, обработанное фильтром. 
Однако было допущено несколько ошибок, и теперь программа работает очень медленно. Нужно найти и исправить эти ошибки, 
чтобы приложение работало плавно. Код можно переписывать как угодно.


С чего начать?
--------------

1. клонируйте репозиторий;
2. с помощью [npm](https://npmjs.org) установите зависимости (команда npm install);
3. запустите пример npm start.


Вероятно, после запуска программы ваш браузер повиснет. Не расстраивайтесь и начните с отключения главного 
цикла — это поможет подойти к решению. Только потом не забудьте включить его обратно.

Для оптимизации кода я объявил переменные используемые в главном цикле в глобальной области видимости, убрал из главного цикла инициализацию переменных, запросы к DOM, передачу параметров по значению, перенес части кода которые нет необходимости выполнять на каждой итерации за пределы цикла, немного оптимизировал вычисление выражений в функциях фильтров. Также подрефакторил код, улучшил дизайн. Добавил динамическую генерацию тегов чтобы для добавления фильтра не нужно было менять html. В коммите ddcab2734eb58a2f846213335840e8b931ffdef9 добавил фильтр "Сепия", чтобы проилюстрировать что при добавлении фильтра меняется только массив filters и добавляется функция фильтра. Добавил счетчик кадров, для мониторинга производительности. Добивил кнопки "play" и "pause". ~~Как это часто бывает, я только хотел оптимизировать код и тут понеслось.~~ Чтобы всё заработало используйте браузер, который поддерживает getUserMedia - http://caniuse.com/#search=getUserMedia. Также не забудьте включить поддержку HTTPS .

Приложение 1:
Баг в firefox: при вызове drawImage иногда возникает ошибка NS_ERROR_NOT_AVAILABLE, и никакими событиями её не отловить.
https://bugzilla.mozilla.org/show_bug.cgi?id=879717

Приложение 2:
Баг в chrome: вызов getImageData приводит к утечке памяти (причем достаточно быстрой при большом размере канваса).
https://bugs.chromium.org/p/chromium/issues/detail?id=242215
