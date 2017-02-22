(function (name, definition) {
  var theModule = definition();
  var hasDefine = typeof define === 'function' && define.amd;
  var hasExports = typeof module !== 'undefined' && module.exports;

  // AMD Module
  if (hasDefine) {
    define(theModule);
  }
  // Node.js Module
  else if (hasExports) {
    module.exports = theModule;
  }
  // Assign to common namespaces or simply the global object (window)
  else {
    (this.NB = this.NB || {})[name] = theModule;
  }
})('Cutty', function () {
  var moduleName = 'Cutty';

  var currentValues = [];

  /**
   *
   * @param  {Object} config
   * @return {Cutty}
   */
  function Cutty(config) {
    this.config = jQuery.extend({
      debug: false, // {Boolean},
      mediaqueries: {
        small: 'only screen and (min-width: 0px)',
        medium: 'only screen and (min-width: 640px)',
        large: 'only screen and (min-width: 992px)',
        xlarge: 'only screen and (min-width: 1440px)',
        xxlarge: 'only screen and (min-width: 1920px)',
        landscape: 'only screen and (orientation: landscape)',
        portrait: 'only screen and (orientation: portrait)',
        // http://css-tricks.com/snippets/css/retina-display-media-query
        retina: 'only screen and (-webkit-min-device-pixel-ratio: 2), ' +
          'only screen and (min--moz-device-pixel-ratio: 2), ' +
          'only screen and (-o-min-device-pixel-ratio: 2/1), ' +
          'only screen and (min-device-pixel-ratio: 2), ' +
          'only screen and (min-resolution: 192dpi), ' +
          'only screen and (min-resolution: 2dppx)'
      } // {Object}
    }, config);

    this.flags = {
      init: false,
      console: !!console
    };
  }

  Cutty.prototype = {
    prototype: Cutty,
    /**
     *
     * @return {Cutty}
     */
    init: function () {
      if (this.flags.init) {
        return this;
      }

      this.log(moduleName + '.init()');

      this.flags.init = true;

      var self = this;

      jQuery(window).on('resize.cutty', _.throttle(function () {
        self.update();
      }, 60));

      self.update();

      return this;
    },
    /**
     *
     */
    destroy: function () {
      if (!this.flags.init) {
        return;
      }

      this.log(moduleName + '.destroy()');
    },
    /**
     *
     * @param {String} msg
     */
    log: function (msg) {
      if (this.config.debug && this.flags.console) {
        console.debug(msg);
      }
    },
    /**
     *
     * @returns {void}
     */
    update: function () {
      this.log(moduleName + '.update()');

      var nextValues = [];

      _.forEach(this.config.mediaqueries, function (mq, name) {
        if (picturefill._.matchesMedia(mq)) {
          nextValues.push(name);
        }
      });

      // If matched media queries has not changed, then do nothing further.
      if (_.isEqual(currentValues, nextValues)) {
        return;
      }

      var oldValues = _.clone(currentValues);
      currentValues = nextValues;

      this.emit('update', nextValues, oldValues);
    },
    /**
     *
     * @param {String} srcset
     * @returns {Array}
     */
    parseSrcset: function (srcset) {
      return _.map(srcset.split(','), function (candidate) {
        candidate = candidate.replace(/\s+/g, ' ');
        candidate = _.trim(candidate);

        var parts = candidate.split(' ');

        return {
          url: parts[0],
          names: parts.slice(1)
        };
      });
    },
    /**
     *
     * @param  {Array} candidates
     * @param  {Array} mqNames
     * @return {Object}
     */
    pickBestCandidate: function (candidates, mqNames) {
      var matchedCandidates = [];

      _.forEach(candidates, function (candidate) {
        var matches = _.intersection(candidate.names, mqNames).length;
        if (matches > 0) {
          var clone = _.clone(candidate);
          clone.matches = matches;
          matchedCandidates.push(clone);
        }
      });

      if (!matchedCandidates.length) {
        return _.first(candidates);
      }

      return _.last(_.sortBy(matchedCandidates, ['matches']));
    }
  };

  asEvented.call(Cutty.prototype);

  return Cutty;
});
