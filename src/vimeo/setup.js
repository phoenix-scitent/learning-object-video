import R from 'ramda';
import * as most from 'most';
import $ from 'jquery';
import Player from '@vimeo/player';
import { eventObject } from '../eventObject.js';
import { vimeoLoaded } from './loaded.js';

var documentEvents = eventObject($(document));

var setup = function({ sessionId, $element, data }){
  // TODO: add 'datatype' object to represent all attributes of video -- pass into videoLoaded...
  //var video = {
  //  id:
  //  $parent:
  //  $wrapper:
  //  $iframe:
  //}

  //TODO: data is aready stale... setup data helpers, to push to drivers and send messages on updates (update ui and data available)

  var $elementParent = $element.parent();

  //////////////////////////////////////////////////////
  // https://github.com/vimeo/player.js#embed-options //
  //////////////////////////////////////////////////////

  var defaultOptions = {
    id: 'https://player.vimeo.com/video/199167955',
    width: $elementParent.width() || $(window).width(),
    loop: false
  };

  var options = R.merge(defaultOptions, {});

  ////////////
  // stream //
  ////////////

  //TODO: pull this from data...
  //TODO: merge stream/overlay etc into single cue idea... then pass API in and allow functions
  //TODO: set 'default' stream object to merge with set stream
  var stream = {
    timeline: {
      dimensions: {
        height: 50
      },
      colors: {
        lineFill: 'black',
        midgroundFill: 'green',
        backgroundFill: 'yellow',
        dots: {
          'poll': '#FFC300',
          'resource': '#FF5733',
          'note': '#C70039'
        }
      },
      data: [
        {time: 5,  episode: 4, type: 'poll',      name: 'A New Hope',           body: '<div><a target="_" href="http://www.google.com">GOOG</a></div>' },
        {time: 10, episode: 5, type: 'poll',      name: 'The Empire Strikes Back'},
        {time: 25, episode: 6, type: 'poll',      name: 'Return of the Jedi'},
        {time: 30, episode: 1, type: 'resource',  name: 'The Phantom Menace'},
        {time: 40, episode: 2, type: 'resource',  name: 'Attack of the Clones'},
        {time: 55, episode: 3, type: 'resource',  name: 'Revenge of the Sith'},
        {time: 70, episode: 7, type: 'note',      name: 'The Force Awakens'}
      ]
    }
  };

  var data = R.merge(data, { stream });

  ////////////////////////////////////////////////////////
  // https://github.com/vimeo/player.js#create-a-player //
  ////////////////////////////////////////////////////////

  //TODO: how to garbage collect Vimeo.Player object? (window.player = player, doesnt go away when element does...)
  var player = new Player($element.get(0), options);
  var playerEvents = eventObject(player);

  // TODO: is this the `video` datatype?
  var video = {
    data,
    sessionId,
    player,
    $element
  };

  //TODO: research `loaded` event is not called until video is visible in viewport
  most.fromEvent('loaded', playerEvents)
    .map(R.always(video))
    .tap(vimeoLoaded)
    .takeUntil(most.fromEvent(`teardownVideo-${sessionId}`, documentEvents))
    .drain();

};

module.exports = {
  vimeoSetup: setup
};