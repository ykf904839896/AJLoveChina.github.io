/**
 * Created by hejie2.0
 * Coding love on 2017/3/19.
 */
hejie.directive("randomListItemStyle", function () {
    // name on html should be 'random-list-item-style'
    var i = 0;
    return function (scope, ele, attr) {
        var arr = ["success", "info", "warning", "danger"];

        ele.addClass("list-group-item-" + arr[i++ % 4]);
    }
});


hejie.directive("pagination", function () {
   return {
       restrict : "E",
       templateUrl : "src/tpl/includes/pagination.html",
       scope: {
           page : '=page',
           maxPage : '=',
           onClick : "="
       }
   }
});

hejie.directive("blogShow", function () {
    return {
        restrict: "E",
        templateUrl: "src/tpl/includes/blog.html",
        scope: {
            item: "=item"
        }
    }
});


hejie.directive("weather", function () {
    return {
        restrict : "A",
        link : function (scope, ele, attr) {
            var val = scope.$eval(attr.weather);
            var result = "&#xe6df;"; // sun
            var title = "写作的那天阳光正好";
            switch (val) {
                case "rain":
                    result = "&#xe604;";
                    title = "写作的那天细雨蒙蒙";
                    break;
                case "cloud":
                    result = "&#xe653;";
                    title = "写作的那天乌云密布";
                    break;
                case "snow":
                    result = "&#xe645;";
                    title = "写作的那天大雪纷飞";
                    break;
                case "sun":
                default:
                    result = "&#xe6df;";
                    title = "写作的那天阳光正好";
                    break;
            }
            ele.css("font-family", "iconfont");
            ele.attr("title", title);
            ele.html(result);
        }
    }
});

hejie.directive("comment", function () {
    return {
        restrict: "E",
        templateUrl: "src/tpl/includes/comment.html",
        scope: {
            items: "=items",
            reply : "=reply"
        }
    }
});

hejie.directive("showPop", function (commonService, $rootScope) {
    return function (scope, ele, attrs) {
        ele.on("click", function () {
            var selector = attrs.showPop,
                width = attrs.width,
                title = attrs.title;

            var dom = $(selector);
            commonService.layerOpen({
                type: 1,
                content: dom,
                area: width + "px",
                title: title
            });
            $rootScope.$broadcast("event.showPop." + attrs.showPop.replace(/[^\w]/g, ""));
        });
    }
});

hejie.directive("hidePop", function () {
    return function (scope, ele, attrs) {
        ele.on("click", function () {
            var sele = attrs.hidePop;
            var index = parseInt($(sele).data("pop-zIndex"));
            layer.close(index);
        })
    }
});

hejie.directive("stateListPrefix", function ($state) {
    return function (scope, ele, attrs) {
        var prefix = attrs.stateListPrefix;
        var result = [];
        var regExp = new RegExp("^" + prefix + "\.");
        $state.get().forEach(function (item) {
            if (regExp.test(item.name)) {
                result.push(item);
            }
        });

        var ul = $("<ul>");
        result.forEach(function (item) {
            var li = $("<li>"),
                a = $("<a>");
            a.attr("href", "#/" + prefix + item.url);
            a.html(item.name);
            li.append(a);
            ul.append(li);
        });
        ele.html(ul);
    }
});

/**
 * 教程
 */
hejie.directive("tutotial", function ($http, $ocLazyLoad) {
    return function (scope, ele, attrs) {
        $http({
            url : attrs.tutotial,
            method : "GET",
            cache : true
        }).then(function (res) {
            var json = res.data;
            var div = $("<div>"),
                randomCls = _.uniqueId("hejie-slick-dynamic-");
            div.addClass("panel panel-default");
            div.addClass(randomCls);

            var homeList = json.data.filter(function (item) {
                return item.isHome;
            });
            var dataList = json.data.filter(function (item) {
                return !item.isHome;
            });

            _wrapToElement(homeList);
            _wrapToElement(dataList);


            function _wrapToElement(list) {
                list.forEach(function (item, i) {
                    var one = $("<div>"),
                        title = $("<div>"),
                        content = $("<div>"),
                        page = $("<div>");
                    title.addClass("panel-heading panel-default");
                    content.addClass("panel-body");
                    page.addClass("badge");
                    page.css("float", "right");
                    if (encodeURIComponent(item.content.replace(/%/g, "")) === item.content.replace(/%/g, "")) {
                        item.content = decodeURIComponent(item.content);
                    }
                    content.css({
                        "min-height": "80px"
                    });
                    // Your code here
                    title.html(item.title);
                    content.html(item.content);
                    if (!item.isHome) {
                        page.html(i + 1 + "/" + list.length);
                    }
                    // Your code end
                    one.append(title);
                    one.append(content);
                    title.append(page);
                    div.append(one);
                });
            }

            ele.append(div);

            $ocLazyLoad.load([
                "//cdn.bootcss.com/slick-carousel/1.6.0/slick.min.js",
                "//cdn.bootcss.com/slick-carousel/1.6.0/slick.min.css",
                "//cdn.bootcss.com/slick-carousel/1.6.0/slick-theme.min.css"
            ]).then(function () {
                $("." + randomCls).slick({
                    arrows : true,
                    infinite : false,
                    prevArrow : "<span class='hejie-arrow hejie-prev glyphicon glyphicon-chevron-left'></span>",
                    nextArrow : "<span class='hejie-arrow hejie-next glyphicon glyphicon-chevron-right'></span>",
                    dots : true,
                    lazyLoad : "ondemand",
                    fade : true,
                    adaptiveHeight : true
                });
            });
        })
    }
});

/**
 * 问卷调查
 */
hejie.directive("questionnaire", function ($http, $log, $ocLazyLoad) {
    return {
        restrict : "E",
        link : function (scope, ele, attrs) {
            var src = attrs.src;
            $http({
                url : src,
                method : "GET",
                cache : true
            }).then(function (res) {
                var data  = res.data;
                scope.data = data;
                scope.index = 0;
                scope.finished = false;
                if (scope.data.cover) {
                    scope.isBegin = false;
                } else {
                    scope.isBegin = true;
                }

                scope.selectThisChoice = function (item, choice) {
                    $log.log("Choice : " + JSON.stringify(choice));
                    item.select = choice;
                    scope.next();
                };
                scope.next = function () {
                    scope.index++;
                    if (scope.index === scope.data.items.length) {
                        scope.finished = true;
                        scope.$broadcast("event.saveData", scope.data);
                    }
                };
                scope.begin = function () {
                    scope.isBegin = true;
                };

                $ocLazyLoad.load([
                    "src/js/lib/bmob-min.js"
                ]).then(function () {
                    Bmob.initialize("261f72b925003b997332d1b2513788a1", "b873bbaddc032288425c025ab112c87c");

                    scope.$on("event.saveData", function (ev, data) {
                        $log.log(data);
                        var Questionnaire = Bmob.Object.extend("questionnaire");
                        var question = new Questionnaire();
                        question.set("time", moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
                        question.set("data", JSON.stringify(data));
                        question.set("tag", scope.data.tag);

                        question.save(null, {
                            success: function(object) {
                                $log.log("create object success, object id:"+object.id);
                            },
                            error: function(model, error) {
                                $log.log("create object fail");
                            }
                        });
                    })
                })

            });
        },
        templateUrl : "src/tpl/includes/question-naire-piece.html"
    }
});

hejie.directive("hejieTitle", function () {
    return {
        restrict : "E",
        link : function (scope, ele, attrs) {
            var title_cache = document.title;
            var title = attrs.title;
            document.title = title;

            scope.$on("$destroy", function () {
                document.title = title_cache;
            })
        }
    }
});

hejie.directive("hideTopNavText", function () {
    return function (scope, ele, attrs) {
        $(document.body).addClass("hejie-hide-top-nav-text");
        scope.$on("$destroy", function () {
            $(document.body).removeClass("hejie-hide-top-nav-text");
        })
    }
})