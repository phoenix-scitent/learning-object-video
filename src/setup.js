import R from 'ramda';
import * as most from 'most';
import $ from 'jquery';
import { eventObject } from './eventObject.js';
import { generateUUID } from './helpers.js';
import { watch$ } from './watch.js';
import { dataSetup } from './data.js';
import { vimeoSetup } from './vimeo/setup.js';
//import { html5Setup } from './html5/setup.js';

var documentEvents = eventObject($(document));

watch$('watcher::transformVideo')
  .map(function($element){ return { sessionId: generateUUID({ prefix: 'video-session' }), $element } })
  .tap(function({ sessionId, $element }){ dataSetup({ sessionId, ref: $element.attr('learning-element-ref') }) })
  .flatMap(({ sessionId, $element }) => {
    //TODO: setup may finish before this is 'initalized'? never catch first message? or is it already 'initialized' and listening?
    return most.fromEvent('video::data', documentEvents)
      .map(R.nth(1))
      .filter(function({ ref }){ return $element.attr('learning-element-ref') === ref }) //TODO figure out how to encapsulate this logic in the message
      .map(function({ data }){ return { sessionId, $element, data } })
      .take(1)
  })
  .tap(R.cond([
    //TODO: maybe select based:
    // presidence highest to lowest
    // 1. runtime addition via [attrs] html attrs (attrs vs data, attrs win)
    // 2. runtime addition via [hooks] imperative api `config` / `embed` (attrs win, config next, data last)
    // 3. [data] pull data FIRST and check that as well
    // 4. [defaults] have code defaults to be the final merge
    // R.mergeAll([ defaults, data, hooks, attrs ])
    [R.T, vimeoSetup] // { sessionId, $element, data }
  ]))
  .drain();




// TODO: add this to readme and code in...
// ORDER OF IMPORTANCE FOR SETUP DATA
// 1. attrs (*preferred*)
// 2. hooks (`config` function that takes object sent back from import of this library, merged in) [only place you can add functions]
// 3. persisted data
// 4. defaults in `<video/>setup.js`