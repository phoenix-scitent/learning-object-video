import R from 'ramda';
import * as most from 'most';
import $ from 'jquery';
import { dynamicResize } from '../dynamicResize.js';
import { initTimeline } from '../addons/timeline.js';
import { eventObject } from '../eventObject.js';
import { generateUUID } from '../helpers.js';

var documentEvents = eventObject($(document));

var loaded = function(video){
  var { data, player, $element, sessionId } = video;

  var $elementParent = $element.parent();
  var $iframe = $element.find('iframe');

  //TODO: union type timeline datatype....
  var timelineData = R.pathOr({}, ['stream', 'timeline'])(data);
  var cues = R.propOr({}, 'overlays', data);

  var playerEvents = eventObject(player);

  var isVideo = function($videoElement){
    return $videoElement.get(0) === $iframe.get(0);
  };

  //////////////////////
  // DATA PERSISTANCE //
  //////////////////////

  // need $element and $elementParent (via video datatype object passed around)

  // listen & react //

  most.fromEvent('video::data', documentEvents)
    .filter(function({ ref }){ return $element.attr('learning-element-ref') === ref })
    // update UI
    // update client data
    // rerun any setup (idempotent and/or able to change arbitrary amount of times...)

  // send out to be set //
  //TODO: queue messages, not direct updates

  ////////////
  // EVENTS //
  ////////////

  //registerEvent(s) -- universal eventDriver to share all video types and emit same universal events
  //var eventDriver({ play: , pause: , ... })
  // if not implemented, send warning (to console?)



  // https://github.com/vimeo/player.js
  // universal html5 / vimeo / etc... method and event api (also teardown `off`)

  //player.play();
  //player.setVolume(0);

  most.fromEvent('play', playerEvents)
      .tap(function(){ console.log('played the video!'); })
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

  most.fromEvent('timeupdate', playerEvents)
      .tap(function(update){
        // TODO: dry up config into timeline datatype?
        $(document).trigger('video::timeupdate', [ { $video: $iframe, timeline: timelineData, duration: update.duration , time: update.seconds } ])
      })
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

  most.fromEvent('video::updateTime', documentEvents)
      .map(function(params){ return { videoElement: params[1], time: params[2] } })
      .filter(function(params){ return isVideo(params.videoElement); })
      .tap(function(params){ player.setCurrentTime(params.time); })
      .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
      .drain();

  ////////////////
  // PUBLIC API //
  ////////////////

  var api = {
    play: function(){ player.play(); },
    pause: function(){ player.pause(); }
    // ...
  };

  //////////
  // CUES //
  //////////

  R.compose(
    R.map(R.merge({ id: generateUUID({ prefix: 'timeline-event' }) })),
    R.propOr([], 'data')
  )(timelineData).forEach(function(cue){
    player.addCuePoint(cue.time, cue)
        .then(function(id){
          // cue point was added successfully
        })
        .catch(function(error){
          switch (error.name) {
            case 'UnsupportedError':
              // cue points are not supported with the current player or browser
              break;
            case 'RangeError':
              // the time was less than 0 or greater than the video’s duration
              break;
            default:
              // some other error occurred
              break;
          }
        });
  });

  var runCue = function(cuedata){
    var currentTime = R.path(['cuepoint', 'time'])(cuedata);
    var cue = R.compose(R.find(R.pathEq(['timing', 'start'], currentTime)), R.pathOr([], ['cues']))(cuedata);
    var setup = R.propOr(function(){}, 'setup', cue);

    setup(R.pathOr({}, ['api'], cuedata));
  };

  most.fromEvent('cuepoint', playerEvents)
    .map(function(cuepoint){ return { video: $iframe, cues: cues, cuepoint: cuepoint, api: api } })
    .tap(runCue)
    .tap(function(cuedata){ $(document).trigger('video::cuepoint', [ cuedata ]); })
    .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
    .drain();

  /////////////////////
  // STREAM/TIMELINE //
  /////////////////////

  most.fromPromise(player.getDuration())
    .map(function(duration){
      return {
        id: generateUUID({ prefix: 'timeline' }),
        sessionId,
        $video: $iframe,
        isVideo,
        duration,
        timelineData
      }
    })
    .tap(initTimeline)
    .drain();

  ////////////////////
  // DYNAMIC RESIZE //
  ////////////////////

  dynamicResize({
    $fluidElement: $elementParent,
    $dynamicElement: $iframe,
    teardown$: most.fromEvent(`teardownVideo-${sessionId}`, documentEvents)
  });

  //////////////
  // TEARDOWN //
  //////////////

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      var removed = R.contains($element.get(0))(mutation.removedNodes);
      if(removed){ $(document).trigger(`teardownVideo-${sessionId}`); console.log(`bye ${sessionId}`); observer.disconnect(); }
    });
  });

  // TODO: find way to not rely on unknown parent... maybe create parent above the mount point and remove it on removal of child?
  observer.observe($element.parent().get(0), { attributes: true, childList: true, characterData: true, subtree: true });

};

module.exports = {
  vimeoLoaded: loaded
};