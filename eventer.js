/**
 * Created by Mosh Mage on 5/21/2016.
 */
var Eventer;

/**
 * @param IrcLib    require('irc')
 * @param IrcConf   {object}        {channelArray: [], selfNickname: 'string', debug: false, server: 'string' }
 */
Eventer = module.exports = function Eventer(IrcLib, IrcConf) {
    'use strict';
    var self = {
        EVENTS : {},
        EVENTSNET : {},
        conf : {}
    };

    var client = new IrcLib.Client(IrcConf.server, IrcConf.selfNickname, {
        channels: IrcConf.channelsArray,
        debug: IrcConf.debug
    });

    /**
     * Adds a new Parent Event as EventListener of Irc.Client() object
     *
     * @param eventType {string}    the event you want to catch
     * @param callback {function}   a callback function to be invoked
     * @returns {boolean}           false if eventType already exists
     */
    var createEventType = function (eventType, callback) {
        if (typeof self.EVENTS[eventType] === "function") {
            return false;
        }
        self.EVENTS[eventType] = callback;
        self.EVENTSNET[eventType] = [];
        client.addListener(eventType, self.EVENTS[eventType]);
        return true;
    };

    /**
     * Creates a new child-event within the EventListner created by @Eventer.createEvent
     *
     * @param eventType {string}    The event you want to hook to
     * @param wordMatch {object}    The string you want to listen to and the index is supposed to be at
     *          {word: "string",
 *           place: 0}
     * @param callback              a callback function to be invoked
     * @returns {boolean}           returns false if the Parent Event does not exist
     */
    var catchEvent = function (eventType, wordMatch, callback) {
        if (!self.EVENTS[eventType] || !wordMatch || !callback) {
            return false;
        }

        self.EVENTSNET[eventType].push({
            wordMatch: wordMatch && wordMatch.word || wordMatch,
            catchOnIndex: wordMatch && wordMatch.place || 0,
            callback: callback
        });
    };

    /**
     * Removes a child event from the list
     * @param eventType {string}
     * @param wordMatch {string}
     * @returns {boolean}
     */
    var releaseEvent = function (eventType, wordMatch) {
        var found;
        if (!self.EVENTS[eventType] || !self.EVENTSNET[eventType]) {
            return false;
        }

        self.EVENTSNET[eventType].some(function(object, index){
            if (object.wordMatch === wordMatch && wordMatch.word || object.wordMatch === wordMatch) {
                found = index;
                return true;
            }
        });

        if (found) {
            self.EVENTSNET[eventType].slice(found, 1);
            return true;
        }

        return false;
    };

    /**
     * Starts the basic listeners and assigns the Irc.Client to itself
     * @param IrcLib    require('irc')
     * @param IrcConf   {object}        {channelArray: [], selfNickname: 'string', debug: false, server: 'string' }
     */
    var startIrcService = function () {
        client.addListener('error', function (message) {
            console.log('error: ', message);
        });
    };
    
    return {
        HOOKS: self,
        client: client,
        startIrcService: startIrcService,
        releaseEvent: releaseEvent,
        catchEvent: catchEvent,
        createEventType: createEventType
    }
};

