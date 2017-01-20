import R from 'ramda';
import $ from 'jquery';
import { eventObject } from './eventObject.js';

const documentEvents = eventObject($(document));

//TODO: need handle (semaphore/sentinel) to takeUntil listeners (video listener 'updater' can be in file with id, but need to send signal to driver to shut down?)
//TODO: extract into module (universal to many drivers), (shareable generic module or just here?)
//TODO: changes dont mean the same as with active elements like polls, etc..... can notify user of updates and allow refresh, can add branches dynamically, add cues,

var dataSetup = function({ sessionId, ref }){

  // "send message with callback payload async work with callback value that is the video datastructure"
  // message ~> VideoDatastructure ***
  $(document).trigger('activity::observeVideo::start', [{
    sessionId,
    callback: function(videoData){ $(document).trigger('video::data', [ { ref, data: videoData } ]) }
  }]);

  //TODO: use as semaphore. takeUntil activity::observeVideo::stop filter by sessionId
  most.fromEvent(`teardownVideo-${sessionId}`, documentEvents)
    .tap(function(){ $(document).trigger('activity::observeVideo::stop', [ { sessionId } ]) })
    .drain();

// decorated with user, section, etc.. in activty, then pushed off to persistance driver
// ref.on('value', function(snap){ callback(snap.val()) })
// setTimeout(() => { var provideData = () => { callback({}) }; setInterval(provideData, 60000) }, 1000 );

  ///////////////
  // FAKERBASE //
  ///////////////

  //TODO: remove for real hookup:
  var test = {
    type: 'video',
    src: '194060126',
    width: '100%',
    classes: 'video-cust',
    autoPlay: true,
    stream:{
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
    },
    overlays: [
      {
        type: 'html',
        pause: true,
        html: '',
        setup: function(video){
          $('#vivian0').on('hidden.bs.modal', function (e) {
            $('body').undim(); video.play()
          })
          $('.modal').modal('hide')
          $('#vivian0').modal('show')
        },
        location: {
          top: '0%',
          bottom: '0%',
          left: '0%',
          right: '0%'
        },
        timing: {
          start: 50,
          end: 51
        }
      },
      {
        type: 'html',
        pause: true,
        html: '',
        setup: function(video){
          $('#pullQuote1').on('hidden.bs.modal', function (e) {
            $('body').undim(); video.play()
          })
          $('.modal').modal('hide')
          $('#pullQuote1').modal('show')
        },
        location: {
          top: '0%',
          bottom: '0%',
          left: '0%',
          right: '0%'
        },
        timing: {
          start: 133,
          end: 134
        }
      },
      {
        type: 'html',
        pause: true,
        html: '',
        setup: function(video){
          $('#vivian1').on('hidden.bs.modal', function (e) {
            $('body').undim(); video.play()
          })
          $('.modal').modal('hide')
          $('#vivian1').modal('show')
        },
        location: {
          top: '0%',
          bottom: '0%',
          left: '0%',
          right: '0%'
        },
        timing: {
          start: 150,
          end: 151
        }
      },
      {
        type: 'html',
        pause: true,
        html: '',
        setup: function(video){
          $('#vivian2').on('hidden.bs.modal', function (e) {
            $('body').undim(); video.play()
          })
          $('.modal').modal('hide')
          $('#vivian2').modal('show')
        },
        location: {
          top: '0%',
          bottom: '0%',
          left: '0%',
          right: '0%'
        },
        timing: {
          start: 325,
          end: 326
        }
      }
    ]
  };

  $(document).trigger('video::data', [ { ref, data: test } ])
  setInterval(function(){
    $(document).trigger('video::data', [ { ref, data: test } ])
  }, 1000)

  ///////////////
  ///////////////
  ///////////////

};

module.exports = {
  dataSetup
};
