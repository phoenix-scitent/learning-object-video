var documentEvents = {
  addListener: function(type, listener){ return $(document).on(type, listener) },
  removeListener: function(type, listener){ return $(document).off(type, listener) }
};

//--> 'learning-element' represents web versions of LO and learning utilities

// EXAMPLE HANDLER IN SPECIFIC LE: text translation

//var translate = function(element){
//  var $el = $(element);
//  var translatedText = en[$el.attr('data-i18n')];
//  $el
//      .html(translatedText)
//      .attr('transformed', true);
//};

// 'watcher::transformable' will run at least 3 times (tap console.log) before registered complete (debugger in cond runs 12 times, because flatmap)...
// use memoization to make this idempotent: if 'watcher::transformComplete' then clear cache... otherwise, filter to those elements not in cache and add
var cache = {};

most.fromEvent('_watcher::transformable', documentEvents)
  .map(function(params){ return params[1]; })
  //.tap(console.log)
  .tap(function(elementArray){ if(elementArray.length === 0){ $(document).trigger('watcher::transformComplete'); cache = {} } })
  .flatMap(function(elementArray){ return most.from(elementArray) })
  .map(function(element){ return $(element) }) //TODO: remove jquery and get info from element itself as needed?
  .filter(function($element){ return cache[$element.attr('learning-element-ref')] !== true; })
  .tap(function($element){ cache[$element.attr('learning-element-ref')] = true; })
  .tap(R.cond([ //TODO: faster method of pattern matching?
    [function($element){ return $element.attr('learning-element') === 'text' }, function($element){ $(document).trigger('watcher::transformText', [ $element ]) }],
    [function($element){ return $element.attr('learning-element') === 'video' }, function($element){ $(document).trigger('watcher::transformVideo', [ $element ]) }],
    [function($element){ return $element.attr('learning-element') === 'test' }, function($element){ /*$element.attr('transformed', true).html('DONE!');*/ $(document).trigger('watcher::transformTest', [ $element ]) }],
    [R.T, function($element){ $element.attr('transformed', 'unknown-element') }]
  ]))
  .drain();

//TODO: pollyfills for all browsers, if some cant support... use request animation frame ticks as a 'dumber' version?
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    // TODO: better to not send if empty... halt processing via conditional here? if so, also send message 'transform complete'
    $(document).trigger('_watcher::transformable', [ document.querySelectorAll('[learning-element]:not([transformed])') ]);
  });
});

// TODO: try observe ('[learning-object]:not([transformed])') instead of full document?

observer.observe(document, { attributes: true, childList: true, characterData: true, subtree: true });

// transforming can include:
// - pulling runtime attribute object
// - pulling data from firebase
// - updating dom with structure of LE
// - adding listeners (firebase, dom, messages, etc...)

//TODO: use mutation in main activity... but use vdom from libraries?

//TODO: snabbdom removes events declaratively when the state changes... how can we do this will all the associated events?

// <vimeo-video>, <h1>.. existing elements to be decorated use <vimeo-video data-learning-element='video' ref="123">

