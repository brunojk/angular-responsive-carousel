(function (namespace) {

    angular.module(namespace, ['ngAnimate'])
    .directive(namespace, function ($interval, $templateCache, $compile, $animate) {
        return {
            restrict: 'A',
            scope: {},
            link: function ($scope, element, attrs) {
                // get options
                var time = parseInt(attrs[namespace + 'Time']),
                    type = attrs[namespace + 'Type'],
                    timeTransition = parseInt(attrs[namespace + 'TimeTransition']),
                    classItems = attrs[namespace + 'ClassItems'],
                    navTemplate = $templateCache.get(attrs[namespace + 'Nav']),
                    navscope = $scope.$new(true),

                // get elements
                    items = angular.element(element[0].querySelectorAll('.' + classItems)),

                // state
                    changing = false,

                // promisse interval (the core) and the timeout of transitions
                    core = undefined;
                    navscope.childActivated = attrs[namespace + 'Activated'] || 0;

                if( items.length <= 0 || timeTransition > time) return;

                element.addClass('uno-carousel');
                element.addClass('uno-carousel-' + type);

                $animate.addClass(items[navscope.childActivated], 'activated');

                var change = function(next){
                    if (changing) return;
                    changing = true;

                    var current = navscope.childActivated;
                    next = next < 0 ?
                        items.length-1 :
                        next >= items.length ?
                            0 :
                            next;

                    navscope.childActivated = next;

                    $animate.removeClass(items[current], 'activated');
                    $animate.addClass(items[next], 'activated').then(function () {
                        changing = false;
                    });
                }

                var goTo = function(i){ stop(); change(i); }

                var next = function() { goTo(navscope.childActivated+1); }

                var previous = function() { goTo(navscope.childActivated-1); }

                var start = function(){
                    core = $interval(function(){
                        change(navscope.childActivated+1);
                    }, time);
                }

                var stop = function(){
                    if( core !== undefined ) {
                        $interval.cancel(core);
                        core = undefined;
                    }
                }

                // if has template nav set the functions and vars
                // and compile and append to the element
                if( navscope ) {
                    navscope.showNext = true;
                    navscope.showPrevious = true;
                    navscope.next = next;
                    navscope.previous = previous;
                    navscope.goTo = goTo;
                    navscope.items = items;

                    var navCompiled = $compile(navTemplate)(navscope);
                    element.append(navCompiled);
                }

                // listen on DOM destroy (removal) event, and cancel the next UI update
                // to prevent updating time after the DOM element was removed.
                element.on('$destroy', stop);

                element.on('mouseenter', stop);
                element.on('mouseleave', start);

                start();
            }
        };
    });
})('unoCarousel');
