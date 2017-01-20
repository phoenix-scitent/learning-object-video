import * as most from 'most';
import $ from 'jquery';
import { eventObject } from './eventObject.js';

var windowEvents = eventObject($(window));

//TODO: seperate this into reusable module
// https://css-tricks.com/NetMag/FluidWidthVideo/Article-FluidWidthVideo.php
const dynamicResize = function({ $fluidElement = $('body'), $dynamicElement, teardown$ = most.never() }){

  $dynamicElement
    .data('aspectRatio', ($dynamicElement.height() / $dynamicElement.width()))
    .removeAttr('height')
    .removeAttr('width');

  var handleResize = function(){
    var newWidth = $fluidElement.width();

    $dynamicElement
      .width(newWidth)
      .height((newWidth * $dynamicElement.data('aspectRatio')));
  };

  most.fromEvent('resize', windowEvents)
    .startWith('initial resize')
    .tap(handleResize)
    .takeUntil(teardown$)
    .drain();

};

module.exports = {
  dynamicResize
};