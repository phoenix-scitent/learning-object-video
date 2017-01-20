import R from 'ramda';
import * as most from 'most';
import $ from 'jquery';
import d3 from '../../lib/d3kit-timeline/d3.js';
import d3KitTimeline from '../../lib/d3kit-timeline/d3kit-timeline.js';
import { eventObject } from '../eventObject.js';

const documentEvents = eventObject($(document));
const windowEvents = eventObject($(window));

var initTimeline = function(element){
  var { id, $video, duration, isVideo, sessionId, timelineData } = element;

  //TODO: pass in mount (and its width) optional to have it somewhere else

  var data = R.pathOr([], ['data'], timelineData);
  var dotColors = R.pathOr({}, ['colors', 'dots'], timelineData);

  var secondsToPixels = function(fullWidth, fullDuration, currentTime){
    return Math.floor((fullWidth * currentTime) / fullDuration);
  };
  var pixelsToSeconds = function(fullWidth, fullDuration, currentPixels){
    return Math.floor((fullDuration * currentPixels) / fullWidth);
  };
  var svgClickEventToCoordinates = function(event){
    var dim = event.target.getBoundingClientRect();
    var x = event.clientX - dim.left;
    var y = event.clientY - dim.top;

    return {
      x: x,
      y: y
    }
  };
  var color = function(data){
    return R.propOr('#777', data.type, dotColors);
  };

  $(`<div id=${id}></div>`).insertAfter($video);

  var createTimeline = function(){

    var initialWidth = $video.width();

    // var initialWidth = $video.parent().width();
    // var currentWidth = function(){ return $video.parent().width(); };

    // http://stackoverflow.com/a/14002735

    //TODO: how to garbage collect
    var timeline = new d3KitTimeline($(`#${id}`).get(0), {
      direction: 'down',
      margin: { left: 0, right: 0 },
      initialWidth: initialWidth,
      initialHeight: R.pathOr(50, ['dimensions', 'height'], data),
      labelBgColor: color,
      linkColor: color,
      dotColor: color,
      scale: d3.scale.linear(),
      domain: [0, parseFloat(element.duration)],
      textFn: function(data){ return data.time + ' - ' + data.name; }
    });

    //TODO: CONFIG.events.trigger('video::timeline::mounted', [ timeline, data ]);

    // ticks is count of how many
    // thinner tickSize is 1 ? 0 is no axis, negative and 2 are thick

    timeline.axis.tickFormat(function(time){ return time + '\''; });
    timeline.axis.ticks(0);
    timeline.axis.tickSize(1);
    timeline.data(data);

    $(`#${id} .label-layer`).hide();
    $(`#${id} .link-layer`).hide();

    most.fromEvent('mouseover', documentEvents)
      .filter(function(event){ return event.target.matches(`#${id} .dot`); })
      .tap(function(event){ $(event.target).attr('r', 6); })
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

    most.fromEvent('mouseout', documentEvents)
      .filter(function(event){ return event.target.matches(`#${id} .dot`); })
      .tap(function(event){ $(event.target).attr('r', 3); })
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

    //TODO: how to garbage collect (stream from timeline obj on/off: like documentEvents...)
    timeline.on('dotMouseover', function(data, index){
      //TODO: CONFIG.events.trigger('video::timeline::hover', [ data ]);
    });

    //TODO: how to garbage collect (stream from timeline obj on/off: like documentEvents...)
    timeline.on('dotClick', function(data, index){
      var time = data.time;

      //TODO: CONFIG.events.trigger('video::timeline::select', [ data ]);

      $(document).trigger('video::updateTime', [ $video, time ]);
    });

    var initialHeight = R.pathOr(50, ['dimensions', 'height'], data);
    var lineFill = R.pathOr('black', ['colors', 'lineFill'], data);
    var backgroundFill = R.pathOr('green', ['colors', 'backgroundFill'], data);

    // timeline
    d3.select($(`#${id} .axis-layer .domain`).get(0))
      .attr("d", `M0,${initialHeight / 8}V${(initialHeight / 8) - 1}H${initialWidth}V${initialHeight / 8}`)
      .attr("fill", lineFill)

    // background
    d3.select($(`#${id} .axis-layer`).get(0)).append("path")
      .attr("id", `${id}-background`)
      .attr("d", `M0,-20V${initialHeight}H${initialWidth}V-20`)
      .attr("opacity", 0.3)
      .attr("fill", backgroundFill);

    var handleSelectTimeline = function(event){
      var nextTime = pixelsToSeconds(
        initialWidth,
        parseFloat(duration),
        svgClickEventToCoordinates(event)['x']
      );

      $(document).trigger('video::updateTime', [ $video, nextTime ]);
    };

    most.fromEvent('mousedown', documentEvents)
      .filter(function(event){ return event.target.matches(`#${id}-background, #${id}-midground`); })
      .tap(handleSelectTimeline)
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

    most.fromEvent('mouseover', documentEvents)
      .filter(function(event){ return event.target.matches(`#${id}-background, #${id}-midground`); })
      .tap(function(event){
        //TODO: have 'indicator' bar drawn on mouseover to show where your mouse is pointing?
      })
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

    var highlightDot = function($currentDot){
      $currentDot.attr('r', 6);
      setTimeout(function(){ $currentDot.attr('r', 3); }, 1000);
    };

    var handleCuepoint = function(cuepoint){
      var nextLocation = secondsToPixels(
        initialWidth,
        parseFloat(duration),
        cuepoint.time
      );

      var $currentDot = $(`#${id} .dot`).filter(function(index, dot){
        return parseInt($(dot).attr('cx')) === nextLocation;
      });

      highlightDot($currentDot);
    };

    most.fromEvent('video::cuepoint', documentEvents)
      .map(R.nth(1))
      .filter(function(cuepoint){ return element.isVideo(cuepoint.video) })
      .tap(handleCuepoint)
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

    var handleTimeupdate = function(update){
      var nextLocation = secondsToPixels(
        initialWidth,
        parseFloat(update.duration),
        update.time
      );

      if($(`#${id}-midground`).length > 0){
        d3.select($(`#${id}-midground`).get(0)).remove();
      }

      var updateHeight = R.pathOr(50, ['timeline', 'dimensions', 'height'], update);
      var midgroundFill = R.pathOr('red', ['timeline', 'colors', 'midgroundFill'], update);

      d3.select($(`#${id} .axis-layer`).get(0)).append("path")
        .attr("id", `${id}-midground`)
        .attr("d", `M0,-20V${updateHeight}H${nextLocation}V-20`)
        .attr("opacity", 0.3)
        .attr("fill", midgroundFill);

      var currentTimelineEvents = data.filter(function(timelineEvent){ return timelineEvent.time === Math.round(update.time) });

      if(R.compose(R.not, R.isEmpty)(currentTimelineEvents)){
        //TODO: this will run 2 or 3 times per second, make sure these only run once...
        //TODO: CONFIG.events.trigger('video::timeline::hover', [ R.head(currentTimelineEvents) ]);
        //var $currentDot = R.head($(`#${id} .dot`).filter(function(index, dot){ return parseInt($(dot).attr('cx')) === nextLocation }))
        //highlightDot($currentDot);
      }
    };

    most.fromEvent('video::timeupdate', documentEvents)
      .map(R.nth(1))
      .filter(function(update){ return element.isVideo(update.$video) })
      .tap(handleTimeupdate)
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

    $(`#${id} .dot`).each(function(index, element){
      var dotLocation = element.cx.baseVal.value;
      var dotFill = element.style.fill;

      $(element).attr('cy', initialHeight / 8);
      $(element).css('cursor', 'pointer');

      d3.select($(`#${id} .axis-layer`).get(0)).append("path")
        .attr("id", `${id}-dot-indicator`)
        .attr("d", `M${dotLocation - 1},-20V${initialHeight}H${dotLocation}V-20`)
        .attr("opacity", 0.5)
        .attr("fill", dotFill);
    });

    var handleCreateDot = function(){
      var currentTime = Math.round($($video).get(0).currentTime);
      var currentData = timeline.data();

      timeline.data(R.append(newData, currentData));
    };

    most.fromEvent('video::timeline::createDot', documentEvents)
      .map(R.nth(1))
      .filter(function(update){ return element.isVideo(update.video) })
      .tap(handleCreateDot)
      .takeUntil(most.fromEvent(`teardownTimeline-${id}`, documentEvents))
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

  };

  createTimeline();

  var handleResize = function(){
    $(`#${id}`).empty();
    $(document).trigger(`teardownTimeline-${id}`);
    createTimeline();
  };

  most.fromEvent('resize', windowEvents)
    .tap(handleResize)
    .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
    .drain();

};

module.exports = {
  initTimeline
};