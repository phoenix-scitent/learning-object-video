import * as most from 'most';
import $ from 'jquery';
import { eventObject } from './eventObject.js';

var documentEvents = eventObject($(document));

// TODO: abstract commonly used pieces as functions which take specific caller vars [watcher, observer teardown, etc...]

const watch$ = function(message, setup){

  return most.fromEvent(message, documentEvents)
    .map(R.nth(1))
    // TODO: should we wait for 'learning element done setting up message to transform (sooner transformed, sooner action allows page to show)? probly not, mutation observer will keep checking, unless we have firebase queue like semaphore
    .tap(function($element){ $element.attr('transformed', true); })

};

module.exports = {
  watch$
};