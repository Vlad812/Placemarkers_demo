/**
 *
 */
$(function () {
    let placemarksApp = (function () {

        // Объект страницы управлениями меток
        let app = {

            // Инициализация
            'init': function () {

                ymaps.ready(function init() {

                    // Создание экземпляра карты и его привязка к контейнеру с
                    // заданным id ("map").
                    let myMap = new ymaps.Map('map', {
                        // При инициализации карты обязательно нужно указать
                        // её центр и коэффициент масштабирования.
                        center: [59.94, 30.31], //
                        zoom: 15
                    }, {
                        searchControlProvider: 'yandex#search'
                    });

                    //
                    myMap.events.add('click', function (e) {

                        let coords = e.get('coords');
                        let lat    = coords[0].toPrecision(8);
                        let lon    = coords[1].toPrecision(8);

                        $('#latitube-field').val(lat);
                        $('#longtube-field').val(lon);

                        createPlace(lat, lon);
                    });

                    $('input.coords').change(function () {

                        let lat = $('#latitube-field').val();
                        let lon = $('#longtube-field').val();

                        createPlace(lat, lon);
                    });

                    function createPlace(lat, lon) {

                        // Создаем геообъект с типом геометрии "Точка".
                        let myGeoObject = new ymaps.GeoObject({
                            // Описание геометрии.
                            geometry: {
                                type: "Point",
                                coordinates: [lat, lon]
                            },
                            // Свойства.
                            properties: {
                                // Контент метки.
                                iconContent: 'Новая Метка !'

                            }
                        });

                        myMap.geoObjects.removeAll();
                        myMap.geoObjects.add(myGeoObject);
                    }
                });

                //
                this.setActionHandler();
                this.setDelHandler();
                this.setEditHandler();

                $('form').get(0).reset();
            },

            'reset': function () {
                this.response.id         = '';
                this.response.status     = '';
                this.response.incidentId = '';
                this.response.msg        = '';
                this.request.id          = '';
                this.request.action      = '';
                this.request.node        = '';
            },

            'response': {
                'id'         : '',
                'status'     : '',
                'msg'        : '',
                'incidentId' : ''
            },

            'request': {
                // сущность 'метка'
                'placemark': {
                    'name': '',
                    'lat' : '',
                    'lon' : ''
                },

                // режим манипуляции (добавление/удаление..)
                'action': '',
                'id'    : '',  // id метки
                'node'  : '',
                'url'   : function () {
                            let id = '';
                            if (this.id) {
                                id = '/' + this.id;
                            }
                            return '/placemarks/' + this.action + id;
                },

                "createJSON": function () {
                    return JSON.stringify(this.placemark);
                },

                "send": function (data) {
                    $.ajax ({
                        type: "GET",
                        async: false,
                        url: this.url(),
                        data: data,
                        success: function (data) {
                            app.response.id     = data.id;
                            app.response.status = !!data.status;
                            app.response.msg    = data.msg;
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            app.response.incidentId = jqXHR.responseJSON.incidentId;
                        }
                    });
                }
            },

            // Кнопка Добавить / Сохранить изменения
            'setActionHandler': function () {
                $('form').on('click', '#actionPlacemark', function (e) {

                    e.preventDefault();
                    let actionMode = $(this).attr('name');

                    switch (actionMode) {
                        case 'add':
                            app.addPlacemark();
                            break;
                        case 'save':
                            app.saveEditPlacemark();
                            break;
                    }
                });
            },

            // Добавление Метки
            'addPlacemark': function () {

                let name = $('#name-placemark').val();
                if(!name) {
                    alert('Заполните поле Название Метки !')
                    return;
                }

                let lat = $('#latitube-field').val();
                let lon = $('#longtube-field').val();

                if(!lat || !lon) {
                    alert('Поставьте метку на Яндекс карте !')
                    return;
                }

                this.request.placemark.name = name;
                this.request.placemark.lat  = lat;
                this.request.placemark.lon  = lon;
                this.request.action         = 'add';

                this.request.send({'user_data': this.request.createJSON()});

                if (this.response.status === true) {
                    let row = "<tr class = 'bg-new-row' data-id =" + this.response.id + " >" +
                        "<td class = 'name-placemark'>" + name + "</td> <td class = 'lat-placemark'>" + lat + "</td> <td class = 'lon-placemark'>" + lon + "</td>" +
                        "<td class='action-edit'> Edit </td> <td class='action-del'>Del</td> <tr>";
                    $('table tbody').append(row);
                }
                else {
                    alert('Service Error : ' + this.response.incidentId);
                }
                this.reset();
            },

            //
            'setDelHandler': function () {
                $('table').on('click', 'td.action-del', function () {
                    app.delPlacemark(this);
                });
            },

            // удаление метки
            'delPlacemark': function (node) {
                let row             = $(node).parent('tr');
                this.request.id     = $(row).data('id');
                this.request.action = 'delete';

                this.request.send(null);

                if (this.response.status === true) {
                    //удаление DOM элемента
                    $(row).remove();
                }
                else {
                    alert('Service Error : ' + this.response.incidentId);
                }
                this.reset();
            },

            //
            'setEditHandler': function () {
                $('table').on('click', 'td.action-edit', function () {
                    app.editPlacemark(this);
                });
            },

            // Редактировать Метку
            'editPlacemark': function (node) {

                let row             = $(node).parent('tr');
                this.request.id     = $(row).data('id');
                this.request.node   = row;
                this.request.action = 'edit';

                $('form #actionPlacemark').val('Сохранить Изменения ').attr('name', 'save');

                let name = $(row).children('td.name-placemark').text();
                let lat  = $(row).children('td.lat-placemark').text();
                let lon  = $(row).children('td.lon-placemark').text();

                //  Вставка в форму для редактирования
                $('#name-placemark').val(name);
                $('#latitube-field').val(lat);
                $('#longtube-field').val(lon);
            },

            //
            'saveEditPlacemark': function () {

                let name = $('#name-placemark').val();
                let lat  = $('#latitube-field').val();
                let lon  = $('#longtube-field').val();

                this.request.placemark.name = name;
                this.request.placemark.lat  = lat;
                this.request.placemark.lon  = lon;

                this.request.send({'user_data': this.request.createJSON()});

                if (this.response.status === true) {

                    // обновляем отредактированую строку
                    $(this.request.node).attr('class', 'edit-bg');
                    $(this.request.node).children('td.name-placemark').text(name);
                    $(this.request.node).children('td.lat-placemark').text(lat);
                    $(this.request.node).children('td.lon-placemark').text(lon);

                    $('form #actionPlacemark').val('Добавить Метку').attr('name', 'add');
                }
                else {
                    alert('Service Error : ' + this.response.incidentId);
                }
                $('form').get(0).reset();
                this.reset();
            }
        };

        // Карта - указать область поиска
        let search = {

            'init': function () {

                ymaps.ready(function init() {

                    // Создание экземпляра карты и его привязка к контейнеру с
                    // заданным id ("map").
                    let sMap = new ymaps.Map('searchYndexMap', {
                        // При инициализации карты обязательно нужно указать
                        // её центр и коэффициент масштабирования.
                        center: [59.94, 30.31], //
                        zoom: 12
                    }, {
                        searchControlProvider: 'yandex#search'
                    });

                    let Circle = MapCircleHandler();

                    Circle.initModule(sMap, {initSearch: true});
                    Circle.drawCircle([window.x, window.y], 1000);

                    $('.btn').on('click', function () {
                        let cor    = Circle.getCenter();
                        let lat    = cor[0].toPrecision(6);
                        let lon    = cor[1].toPrecision(6);
                        let radius = parseInt(Circle.getRadius()) / 1000;
                        let url    = '/result?' + 'lat=' + lat + '&lon=' + lon + '&radius=' + radius;
                        window.open(url, '_blank');
                    });
                });
            }
        };

        // Карта с результатом
        let result = {

            'init': function (resJson, searchArea) {

                ymaps.ready().done(function (ym) {

                    let myMap = new ym.Map('resultMap', {
                        center: [59.94, 30.31],
                        zoom: 12
                    }, {
                        searchControlProvider: 'yandex#search'
                    });

                    // Создаем круг в котором осуществляется поиск.
                    let myCircle = new ymaps.Circle([
                        // Координаты центра круга.
                        //[59.9492, 30.3149],
                        [searchArea.lat, searchArea.lon],
                        // Радиус круга в метрах.
                        searchArea.radius
                    ], {
                        // Описываем свойства круга.
                        // Содержимое балуна.
                        balloonContent: "Радиус круга - " + searchArea.radius / 1000 + "км",
                        // Содержимое хинта.
                        //hintContent: "Облать поиска"
                    }, {
                        // Задаем опции круга.

                        // Цвет заливки.
                        // Последний байт (77) определяет прозрачность.
                        // Прозрачность заливки также можно задать используя опцию "fillOpacity".
                        fillColor: "#DB709327",
                        // Цвет обводки.
                        strokeColor: "#990066",
                        // Прозрачность обводки.
                        strokeOpacity: 0.5,
                        // Ширина обводки в пикселях.
                        strokeWidth: 2
                    });

                    // Добавляем круг на карту.
                    myMap.geoObjects.add(myCircle);

                    objectManager = new ymaps.ObjectManager({
                        // Чтобы метки начали кластеризоваться, выставляем опцию.
                        clusterize: true,
                        // ObjectManager принимает те же опции, что и кластеризатор.
                        gridSize: 32
                    });

                    // Чтобы задать опции одиночным объектам и кластерам,
                    // обратимся к дочерним коллекциям ObjectManager.
                    objectManager.objects.options.set('preset', 'islands#greenDotIcon');
                    objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
                    myMap.geoObjects.add(objectManager);

                    objectManager.add(resJson);

                    // связанность: карта-таблица

                    objectManager.objects.events.add(['mouseenter', 'mouseleave'], function (e) {

                        // id объекта в json структуре
                        let objectId = e.get('objectId');

                        let row = 'tr[data-place-id = ' + objectId + ']';

                        if (e.get('type') == 'mouseenter') {
                            // Метод setObjectOptions позволяет задавать опции объекта "на лету".
                            objectManager.objects.setObjectOptions(objectId, {
                                preset: 'islands#yellowIcon'
                            });

                            $(row).addClass('bg-row');

                        } else {
                            objectManager.objects.setObjectOptions(objectId, {
                                preset: 'islands#greenIcon'
                            });
                            $(row).removeClass('bg-row');
                        }
                    });
                    // связанность: таблица-карта

                    $('[data-place-id]').on('mouseenter', function () {

                        let id = $(this).data('place-id');

                        objectManager.objects.setObjectOptions(id, {
                            preset: 'islands#yellowIcon'
                        });
                    });
                    $('[data-place-id]').on('mouseleave', function () {

                        let id = $(this).data('place-id');

                        objectManager.objects.setObjectOptions(id, {
                            preset: 'islands#greenIcon'
                        });
                    });
                });
            }
        };

        return {
            'app': function () {
                app.init();
            },
            'search': function () {
                search.init();
            },

            'result': function () {
                result.init(resJson, searchArea);
            }
        };
    })();

    let type = $('.map').data('type-map');

    placemarksApp[type]();
});