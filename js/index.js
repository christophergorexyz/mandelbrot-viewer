(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mandelbrot = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * @class TemplateTag
 * @classdesc Consumes a pipeline of composeable transformer plugins and produces a template tag.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['', ''], ['', '']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TemplateTag = function () {
  /**
   * constructs a template tag
   * @constructs TemplateTag
   * @param  {...Object} [...transformers] - an array or arguments list of transformers
   * @return {Function}                    - a template tag
   */
  function TemplateTag() {
    for (var _len = arguments.length, transformers = Array(_len), _key = 0; _key < _len; _key++) {
      transformers[_key] = arguments[_key];
    }

    (0, _classCallCheck3.default)(this, TemplateTag);

    // if first argument is an array, extrude it as a list of transformers
    if (transformers.length && Array.isArray(transformers[0])) {
      transformers = transformers[0];
    }

    // if any transformers are functions, this means they are not initiated - automatically initiate them
    this.transformers = transformers.map(function (transformer) {
      return typeof transformer === 'function' ? transformer() : transformer;
    });

    // return an ES2015 template tag
    return this.tag.bind(this);
  }

  /**
   * Applies all transformers to a template literal tagged with this method.
   * If a function is passed as the first argument, assumes the function is a template tag
   * and applies it to the template, returning a template tag.
   * @param  {(Function|Array<String>)} args[0] - Either a template tag or an array containing template strings separated by identifier
   * @param  {...*} [args[1]]                   - Optional list of substitution values.
   * @return {(String|Function)}                - Either an intermediary tag function or the results of processing the template.
   */


  (0, _createClass3.default)(TemplateTag, [{
    key: 'tag',
    value: function tag() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      // if the first argument passed is a function, assume it is a template tag and return
      // an intermediary tag that processes the template using the aforementioned tag, passing the
      // result to our tag
      if (typeof args[0] === 'function') {
        return this.interimTag.bind(this, args.shift());
      }

      // else, return a transformed end result of processing the template with our tag
      return this.transformEndResult(args.shift().reduce(this.processSubstitutions.bind(this, args)));
    }

    /**
     * An intermediary template tag that receives a template tag and passes the result of calling the template with the received
     * template tag to our own template tag.
     * @param  {Function}        nextTag          - the received template tag
     * @param  {Array<String>}   template         - the template to process
     * @param  {...*}            ...substitutions - `substitutions` is an array of all substitutions in the template
     * @return {*}                                - the final processed value
     */

  }, {
    key: 'interimTag',
    value: function interimTag(previousTag, template) {
      for (var _len3 = arguments.length, substitutions = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        substitutions[_key3 - 2] = arguments[_key3];
      }

      return this.tag(_templateObject, previousTag.apply(undefined, [template].concat(substitutions)));
    }

    /**
     * Performs bulk processing on the tagged template, transforming each substitution and then
     * concatenating the resulting values into a string.
     * @param  {Array<*>} substitutions - an array of all remaining substitutions present in this template
     * @param  {String}   resultSoFar   - this iteration's result string so far
     * @param  {String}   remainingPart - the template chunk after the current substitution
     * @return {String}                 - the result of joining this iteration's processed substitution with the result
     */

  }, {
    key: 'processSubstitutions',
    value: function processSubstitutions(substitutions, resultSoFar, remainingPart) {
      var substitution = this.transformSubstitution(substitutions.shift(), resultSoFar);
      return resultSoFar + substitution + remainingPart;
    }

    /**
     * When a substitution is encountered, iterates through each transformer and applies the transformer's
     * `onSubstitution` method to the substitution.
     * @param  {*}      substitution - The current substitution
     * @param  {String} resultSoFar  - The result up to and excluding this substitution.
     * @return {*}                   - The final result of applying all substitution transformations.
     */

  }, {
    key: 'transformSubstitution',
    value: function transformSubstitution(substitution, resultSoFar) {
      var cb = function cb(res, transform) {
        return transform.onSubstitution ? transform.onSubstitution(res, resultSoFar) : res;
      };
      return this.transformers.reduce(cb, substitution);
    }

    /**
     * Iterates through each transformer, applying the transformer's `onEndResult` method to the
     * template literal after all substitutions have finished processing.
     * @param  {String} endResult - The processed template, just before it is returned from the tag
     * @return {String}           - The final results of processing each transformer
     */

  }, {
    key: 'transformEndResult',
    value: function transformEndResult(endResult) {
      var cb = function cb(res, transform) {
        return transform.onEndResult ? transform.onEndResult(res) : res;
      };
      return this.transformers.reduce(cb, endResult);
    }
  }]);
  return TemplateTag;
}();

exports.default = TemplateTag;
module.exports = exports['default'];

},{"babel-runtime/helpers/classCallCheck":53,"babel-runtime/helpers/createClass":54,"babel-runtime/helpers/taggedTemplateLiteral":55}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _TemplateTag = require('./TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _TemplateTag2.default;
module.exports = exports['default'];

},{"./TemplateTag":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _html = require('../html');

var _html2 = _interopRequireDefault(_html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _html2.default;
module.exports = exports['default'];

},{"../html":11}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commaLists = new _TemplateTag2.default((0, _inlineArrayTransformer2.default)({ separator: ',' }), _stripIndentTransformer2.default, _trimResultTransformer2.default);

exports.default = commaLists;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../stripIndentTransformer":42,"../trimResultTransformer":46}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _commaLists = require('./commaLists');

var _commaLists2 = _interopRequireDefault(_commaLists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _commaLists2.default;
module.exports = exports['default'];

},{"./commaLists":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commaListsAnd = new _TemplateTag2.default((0, _inlineArrayTransformer2.default)({ separator: ',', conjunction: 'and' }), _stripIndentTransformer2.default, _trimResultTransformer2.default);

exports.default = commaListsAnd;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../stripIndentTransformer":42,"../trimResultTransformer":46}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _commaListsAnd = require('./commaListsAnd');

var _commaListsAnd2 = _interopRequireDefault(_commaListsAnd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _commaListsAnd2.default;
module.exports = exports['default'];

},{"./commaListsAnd":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commaListsOr = new _TemplateTag2.default((0, _inlineArrayTransformer2.default)({ separator: ',', conjunction: 'or' }), _stripIndentTransformer2.default, _trimResultTransformer2.default);

exports.default = commaListsOr;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../stripIndentTransformer":42,"../trimResultTransformer":46}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _commaListsOr = require('./commaListsOr');

var _commaListsOr2 = _interopRequireDefault(_commaListsOr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _commaListsOr2.default;
module.exports = exports['default'];

},{"./commaListsOr":8}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _splitStringTransformer = require('../splitStringTransformer');

var _splitStringTransformer2 = _interopRequireDefault(_splitStringTransformer);

var _removeNonPrintingValuesTransformer = require('../removeNonPrintingValuesTransformer');

var _removeNonPrintingValuesTransformer2 = _interopRequireDefault(_removeNonPrintingValuesTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var html = new _TemplateTag2.default((0, _splitStringTransformer2.default)('\n'), _removeNonPrintingValuesTransformer2.default, _inlineArrayTransformer2.default, _stripIndentTransformer2.default, _trimResultTransformer2.default);

exports.default = html;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../removeNonPrintingValuesTransformer":29,"../splitStringTransformer":38,"../stripIndentTransformer":42,"../trimResultTransformer":46}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _html2.default;
module.exports = exports['default'];

},{"./html":10}],12:[function(require,module,exports){
'use strict';

// core

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stripIndents = exports.stripIndent = exports.oneLineInlineLists = exports.inlineLists = exports.oneLineCommaListsAnd = exports.oneLineCommaListsOr = exports.oneLineCommaLists = exports.oneLineTrim = exports.oneLine = exports.safeHtml = exports.source = exports.codeBlock = exports.html = exports.commaListsOr = exports.commaListsAnd = exports.commaLists = exports.removeNonPrintingValuesTransformer = exports.splitStringTransformer = exports.inlineArrayTransformer = exports.replaceSubstitutionTransformer = exports.replaceResultTransformer = exports.stripIndentTransformer = exports.trimResultTransformer = exports.TemplateTag = undefined;

var _TemplateTag2 = require('./TemplateTag');

var _TemplateTag3 = _interopRequireDefault(_TemplateTag2);

var _trimResultTransformer2 = require('./trimResultTransformer');

var _trimResultTransformer3 = _interopRequireDefault(_trimResultTransformer2);

var _stripIndentTransformer2 = require('./stripIndentTransformer');

var _stripIndentTransformer3 = _interopRequireDefault(_stripIndentTransformer2);

var _replaceResultTransformer2 = require('./replaceResultTransformer');

var _replaceResultTransformer3 = _interopRequireDefault(_replaceResultTransformer2);

var _replaceSubstitutionTransformer2 = require('./replaceSubstitutionTransformer');

var _replaceSubstitutionTransformer3 = _interopRequireDefault(_replaceSubstitutionTransformer2);

var _inlineArrayTransformer2 = require('./inlineArrayTransformer');

var _inlineArrayTransformer3 = _interopRequireDefault(_inlineArrayTransformer2);

var _splitStringTransformer2 = require('./splitStringTransformer');

var _splitStringTransformer3 = _interopRequireDefault(_splitStringTransformer2);

var _removeNonPrintingValuesTransformer2 = require('./removeNonPrintingValuesTransformer');

var _removeNonPrintingValuesTransformer3 = _interopRequireDefault(_removeNonPrintingValuesTransformer2);

var _commaLists2 = require('./commaLists');

var _commaLists3 = _interopRequireDefault(_commaLists2);

var _commaListsAnd2 = require('./commaListsAnd');

var _commaListsAnd3 = _interopRequireDefault(_commaListsAnd2);

var _commaListsOr2 = require('./commaListsOr');

var _commaListsOr3 = _interopRequireDefault(_commaListsOr2);

var _html2 = require('./html');

var _html3 = _interopRequireDefault(_html2);

var _codeBlock2 = require('./codeBlock');

var _codeBlock3 = _interopRequireDefault(_codeBlock2);

var _source2 = require('./source');

var _source3 = _interopRequireDefault(_source2);

var _safeHtml2 = require('./safeHtml');

var _safeHtml3 = _interopRequireDefault(_safeHtml2);

var _oneLine2 = require('./oneLine');

var _oneLine3 = _interopRequireDefault(_oneLine2);

var _oneLineTrim2 = require('./oneLineTrim');

var _oneLineTrim3 = _interopRequireDefault(_oneLineTrim2);

var _oneLineCommaLists2 = require('./oneLineCommaLists');

var _oneLineCommaLists3 = _interopRequireDefault(_oneLineCommaLists2);

var _oneLineCommaListsOr2 = require('./oneLineCommaListsOr');

var _oneLineCommaListsOr3 = _interopRequireDefault(_oneLineCommaListsOr2);

var _oneLineCommaListsAnd2 = require('./oneLineCommaListsAnd');

var _oneLineCommaListsAnd3 = _interopRequireDefault(_oneLineCommaListsAnd2);

var _inlineLists2 = require('./inlineLists');

var _inlineLists3 = _interopRequireDefault(_inlineLists2);

var _oneLineInlineLists2 = require('./oneLineInlineLists');

var _oneLineInlineLists3 = _interopRequireDefault(_oneLineInlineLists2);

var _stripIndent2 = require('./stripIndent');

var _stripIndent3 = _interopRequireDefault(_stripIndent2);

var _stripIndents2 = require('./stripIndents');

var _stripIndents3 = _interopRequireDefault(_stripIndents2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.TemplateTag = _TemplateTag3.default;

// transformers

exports.trimResultTransformer = _trimResultTransformer3.default;
exports.stripIndentTransformer = _stripIndentTransformer3.default;
exports.replaceResultTransformer = _replaceResultTransformer3.default;
exports.replaceSubstitutionTransformer = _replaceSubstitutionTransformer3.default;
exports.inlineArrayTransformer = _inlineArrayTransformer3.default;
exports.splitStringTransformer = _splitStringTransformer3.default;
exports.removeNonPrintingValuesTransformer = _removeNonPrintingValuesTransformer3.default;

// tags

exports.commaLists = _commaLists3.default;
exports.commaListsAnd = _commaListsAnd3.default;
exports.commaListsOr = _commaListsOr3.default;
exports.html = _html3.default;
exports.codeBlock = _codeBlock3.default;
exports.source = _source3.default;
exports.safeHtml = _safeHtml3.default;
exports.oneLine = _oneLine3.default;
exports.oneLineTrim = _oneLineTrim3.default;
exports.oneLineCommaLists = _oneLineCommaLists3.default;
exports.oneLineCommaListsOr = _oneLineCommaListsOr3.default;
exports.oneLineCommaListsAnd = _oneLineCommaListsAnd3.default;
exports.inlineLists = _inlineLists3.default;
exports.oneLineInlineLists = _oneLineInlineLists3.default;
exports.stripIndent = _stripIndent3.default;
exports.stripIndents = _stripIndents3.default;

},{"./TemplateTag":2,"./codeBlock":3,"./commaLists":5,"./commaListsAnd":7,"./commaListsOr":9,"./html":11,"./inlineArrayTransformer":13,"./inlineLists":15,"./oneLine":17,"./oneLineCommaLists":19,"./oneLineCommaListsAnd":21,"./oneLineCommaListsOr":23,"./oneLineInlineLists":25,"./oneLineTrim":27,"./removeNonPrintingValuesTransformer":29,"./replaceResultTransformer":31,"./replaceSubstitutionTransformer":33,"./safeHtml":35,"./source":37,"./splitStringTransformer":38,"./stripIndent":40,"./stripIndentTransformer":42,"./stripIndents":44,"./trimResultTransformer":46}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _inlineArrayTransformer = require('./inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _inlineArrayTransformer2.default;
module.exports = exports['default'];

},{"./inlineArrayTransformer":14}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaults = {
  separator: '',
  conjunction: '',
  serial: false
};

/**
 * Converts an array substitution to a string containing a list
 * @param  {String} [opts.separator = ''] - the character that separates each item
 * @param  {String} [opts.conjunction = '']  - replace the last separator with this
 * @param  {Boolean} [opts.serial = false] - include the separator before the conjunction? (Oxford comma use-case)
 *
 * @return {Object}                     - a TemplateTag transformer
 */
var inlineArrayTransformer = function inlineArrayTransformer() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults;
  return {
    onSubstitution: function onSubstitution(substitution, resultSoFar) {
      // only operate on arrays
      if (Array.isArray(substitution)) {
        var separator = opts.separator;
        var conjunction = opts.conjunction;
        var serial = opts.serial;
        // join each item in the array into a string where each item is separated by separator
        // be sure to maintain indentation
        var indent = resultSoFar.match(/(\s+)$/);
        if (indent) {
          substitution = substitution.join(separator + indent[1]);
        } else {
          substitution = substitution.join(separator + ' ');
        }
        // if conjunction is set, replace the last separator with conjunction
        if (conjunction) {
          var separatorIndex = substitution.lastIndexOf(separator);
          substitution = substitution.substr(0, separatorIndex) + (serial ? separator : '') + ' ' + conjunction + substitution.substr(separatorIndex + 1);
        }
      }
      return substitution;
    }
  };
};

exports.default = inlineArrayTransformer;
module.exports = exports['default'];

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _inlineLists = require('./inlineLists');

var _inlineLists2 = _interopRequireDefault(_inlineLists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _inlineLists2.default;
module.exports = exports['default'];

},{"./inlineLists":16}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inlineLists = new _TemplateTag2.default(_inlineArrayTransformer2.default, _stripIndentTransformer2.default, _trimResultTransformer2.default);

exports.default = inlineLists;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../stripIndentTransformer":42,"../trimResultTransformer":46}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _oneLine = require('./oneLine');

var _oneLine2 = _interopRequireDefault(_oneLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _oneLine2.default;
module.exports = exports['default'];

},{"./oneLine":18}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _replaceResultTransformer = require('../replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneLine = new _TemplateTag2.default((0, _replaceResultTransformer2.default)(/(?:\s+)/g, ' '), _trimResultTransformer2.default);

exports.default = oneLine;
module.exports = exports['default'];

},{"../TemplateTag":2,"../replaceResultTransformer":31,"../trimResultTransformer":46}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _oneLineCommaLists = require('./oneLineCommaLists');

var _oneLineCommaLists2 = _interopRequireDefault(_oneLineCommaLists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _oneLineCommaLists2.default;
module.exports = exports['default'];

},{"./oneLineCommaLists":20}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _replaceResultTransformer = require('../replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneLineCommaLists = new _TemplateTag2.default((0, _inlineArrayTransformer2.default)({ separator: ',' }), (0, _replaceResultTransformer2.default)(/(?:\s+)/g, ' '), _trimResultTransformer2.default);

exports.default = oneLineCommaLists;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../replaceResultTransformer":31,"../trimResultTransformer":46}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _oneLineCommaListsAnd = require('./oneLineCommaListsAnd');

var _oneLineCommaListsAnd2 = _interopRequireDefault(_oneLineCommaListsAnd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _oneLineCommaListsAnd2.default;
module.exports = exports['default'];

},{"./oneLineCommaListsAnd":22}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _replaceResultTransformer = require('../replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneLineCommaListsAnd = new _TemplateTag2.default((0, _inlineArrayTransformer2.default)({ separator: ',', conjunction: 'and' }), (0, _replaceResultTransformer2.default)(/(?:\s+)/g, ' '), _trimResultTransformer2.default);

exports.default = oneLineCommaListsAnd;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../replaceResultTransformer":31,"../trimResultTransformer":46}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _oneLineCommaListsOr = require('./oneLineCommaListsOr');

var _oneLineCommaListsOr2 = _interopRequireDefault(_oneLineCommaListsOr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _oneLineCommaListsOr2.default;
module.exports = exports['default'];

},{"./oneLineCommaListsOr":24}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _replaceResultTransformer = require('../replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneLineCommaListsOr = new _TemplateTag2.default((0, _inlineArrayTransformer2.default)({ separator: ',', conjunction: 'or' }), (0, _replaceResultTransformer2.default)(/(?:\s+)/g, ' '), _trimResultTransformer2.default);

exports.default = oneLineCommaListsOr;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../replaceResultTransformer":31,"../trimResultTransformer":46}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _oneLineInlineLists = require('./oneLineInlineLists');

var _oneLineInlineLists2 = _interopRequireDefault(_oneLineInlineLists);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _oneLineInlineLists2.default;
module.exports = exports['default'];

},{"./oneLineInlineLists":26}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _replaceResultTransformer = require('../replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneLineInlineLists = new _TemplateTag2.default(_inlineArrayTransformer2.default, (0, _replaceResultTransformer2.default)(/(?:\s+)/g, ' '), _trimResultTransformer2.default);

exports.default = oneLineInlineLists;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../replaceResultTransformer":31,"../trimResultTransformer":46}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _oneLineTrim = require('./oneLineTrim');

var _oneLineTrim2 = _interopRequireDefault(_oneLineTrim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _oneLineTrim2.default;
module.exports = exports['default'];

},{"./oneLineTrim":28}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _replaceResultTransformer = require('../replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneLineTrim = new _TemplateTag2.default((0, _replaceResultTransformer2.default)(/(?:\n\s+)/g, ''), _trimResultTransformer2.default);

exports.default = oneLineTrim;
module.exports = exports['default'];

},{"../TemplateTag":2,"../replaceResultTransformer":31,"../trimResultTransformer":46}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _removeNonPrintingValuesTransformer = require('./removeNonPrintingValuesTransformer');

var _removeNonPrintingValuesTransformer2 = _interopRequireDefault(_removeNonPrintingValuesTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _removeNonPrintingValuesTransformer2.default;
module.exports = exports['default'];

},{"./removeNonPrintingValuesTransformer":30}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isValidValue = function isValidValue(x) {
  return x != null && !(0, _isNan2.default)(x) && typeof x !== 'boolean';
};

var removeNonPrintingValuesTransformer = function removeNonPrintingValuesTransformer() {
  return {
    onSubstitution: function onSubstitution(substitution) {
      if (Array.isArray(substitution)) {
        return substitution.filter(isValidValue);
      }
      if (isValidValue(substitution)) {
        return substitution;
      }
      return '';
    }
  };
};

exports.default = removeNonPrintingValuesTransformer;
module.exports = exports['default'];

},{"babel-runtime/core-js/number/is-nan":49}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _replaceResultTransformer = require('./replaceResultTransformer');

var _replaceResultTransformer2 = _interopRequireDefault(_replaceResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _replaceResultTransformer2.default;
module.exports = exports['default'];

},{"./replaceResultTransformer":32}],32:[function(require,module,exports){
'use strict';

/**
 * Replaces tabs, newlines and spaces with the chosen value when they occur in sequences
 * @param  {(String|RegExp)} replaceWhat - the value or pattern that should be replaced
 * @param  {*}               replaceWith - the replacement value
 * @return {Object}                      - a TemplateTag transformer
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
var replaceResultTransformer = function replaceResultTransformer(replaceWhat, replaceWith) {
  return {
    onEndResult: function onEndResult(endResult) {
      if (replaceWhat == null || replaceWith == null) {
        throw new Error('replaceResultTransformer requires at least 2 arguments.');
      }
      return endResult.replace(replaceWhat, replaceWith);
    }
  };
};

exports.default = replaceResultTransformer;
module.exports = exports['default'];

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _replaceSubstitutionTransformer = require('./replaceSubstitutionTransformer');

var _replaceSubstitutionTransformer2 = _interopRequireDefault(_replaceSubstitutionTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _replaceSubstitutionTransformer2.default;
module.exports = exports['default'];

},{"./replaceSubstitutionTransformer":34}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var replaceSubstitutionTransformer = function replaceSubstitutionTransformer(replaceWhat, replaceWith) {
  return {
    onSubstitution: function onSubstitution(substitution, resultSoFar) {
      if (replaceWhat == null || replaceWith == null) {
        throw new Error('replaceSubstitutionTransformer requires at least 2 arguments.');
      }

      // Do not touch if null or undefined
      if (substitution == null) {
        return substitution;
      } else {
        return substitution.toString().replace(replaceWhat, replaceWith);
      }
    }
  };
};

exports.default = replaceSubstitutionTransformer;
module.exports = exports['default'];

},{}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _safeHtml = require('./safeHtml');

var _safeHtml2 = _interopRequireDefault(_safeHtml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _safeHtml2.default;
module.exports = exports['default'];

},{"./safeHtml":36}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _inlineArrayTransformer = require('../inlineArrayTransformer');

var _inlineArrayTransformer2 = _interopRequireDefault(_inlineArrayTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

var _splitStringTransformer = require('../splitStringTransformer');

var _splitStringTransformer2 = _interopRequireDefault(_splitStringTransformer);

var _replaceSubstitutionTransformer = require('../replaceSubstitutionTransformer');

var _replaceSubstitutionTransformer2 = _interopRequireDefault(_replaceSubstitutionTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var safeHtml = new _TemplateTag2.default((0, _splitStringTransformer2.default)('\n'), _inlineArrayTransformer2.default, _stripIndentTransformer2.default, _trimResultTransformer2.default, (0, _replaceSubstitutionTransformer2.default)(/&/g, '&amp;'), (0, _replaceSubstitutionTransformer2.default)(/</g, '&lt;'), (0, _replaceSubstitutionTransformer2.default)(/>/g, '&gt;'), (0, _replaceSubstitutionTransformer2.default)(/"/g, '&quot;'), (0, _replaceSubstitutionTransformer2.default)(/'/g, '&#x27;'), (0, _replaceSubstitutionTransformer2.default)(/`/g, '&#x60;'));

exports.default = safeHtml;
module.exports = exports['default'];

},{"../TemplateTag":2,"../inlineArrayTransformer":13,"../replaceSubstitutionTransformer":33,"../splitStringTransformer":38,"../stripIndentTransformer":42,"../trimResultTransformer":46}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _html = require('../html');

var _html2 = _interopRequireDefault(_html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _html2.default;
module.exports = exports['default'];

},{"../html":11}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _splitStringTransformer = require('./splitStringTransformer');

var _splitStringTransformer2 = _interopRequireDefault(_splitStringTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _splitStringTransformer2.default;
module.exports = exports['default'];

},{"./splitStringTransformer":39}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var splitStringTransformer = function splitStringTransformer(splitBy) {
  return {
    onSubstitution: function onSubstitution(substitution, resultSoFar) {
      if (splitBy != null && typeof splitBy === 'string') {
        if (typeof substitution === 'string' && substitution.includes(splitBy)) {
          substitution = substitution.split(splitBy);
        }
      } else {
        throw new Error('You need to specify a string character to split by.');
      }
      return substitution;
    }
  };
};

exports.default = splitStringTransformer;
module.exports = exports['default'];

},{}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _stripIndent = require('./stripIndent');

var _stripIndent2 = _interopRequireDefault(_stripIndent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _stripIndent2.default;
module.exports = exports['default'];

},{"./stripIndent":41}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stripIndent = new _TemplateTag2.default(_stripIndentTransformer2.default, _trimResultTransformer2.default);

exports.default = stripIndent;
module.exports = exports['default'];

},{"../TemplateTag":2,"../stripIndentTransformer":42,"../trimResultTransformer":46}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _stripIndentTransformer = require('./stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _stripIndentTransformer2.default;
module.exports = exports['default'];

},{"./stripIndentTransformer":43}],43:[function(require,module,exports){
'use strict';

/**
 * strips indentation from a template literal
 * @param  {String} type = 'initial' - whether to remove all indentation or just leading indentation. can be 'all' or 'initial'
 * @return {Object}                  - a TemplateTag transformer
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stripIndentTransformer = function stripIndentTransformer() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'initial';
  return {
    onEndResult: function onEndResult(endResult) {
      if (type === 'initial') {
        // remove the shortest leading indentation from each line
        var match = endResult.match(/^[ \t]*(?=\S)/gm);
        // return early if there's nothing to strip
        if (match === null) {
          return endResult;
        }
        var indent = Math.min.apply(Math, (0, _toConsumableArray3.default)(match.map(function (el) {
          return el.length;
        })));
        var regexp = new RegExp('^[ \\t]{' + indent + '}', 'gm');
        endResult = indent > 0 ? endResult.replace(regexp, '') : endResult;
      } else if (type === 'all') {
        // remove all indentation from each line
        endResult = endResult.split('\n').map(function (line) {
          return line.trimLeft();
        }).join('\n');
      } else {
        throw new Error('Unknown type: ' + type);
      }
      return endResult;
    }
  };
};

exports.default = stripIndentTransformer;
module.exports = exports['default'];

},{"babel-runtime/helpers/toConsumableArray":56}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _stripIndents = require('./stripIndents');

var _stripIndents2 = _interopRequireDefault(_stripIndents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _stripIndents2.default;
module.exports = exports['default'];

},{"./stripIndents":45}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TemplateTag = require('../TemplateTag');

var _TemplateTag2 = _interopRequireDefault(_TemplateTag);

var _stripIndentTransformer = require('../stripIndentTransformer');

var _stripIndentTransformer2 = _interopRequireDefault(_stripIndentTransformer);

var _trimResultTransformer = require('../trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stripIndents = new _TemplateTag2.default((0, _stripIndentTransformer2.default)('all'), _trimResultTransformer2.default);

exports.default = stripIndents;
module.exports = exports['default'];

},{"../TemplateTag":2,"../stripIndentTransformer":42,"../trimResultTransformer":46}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _trimResultTransformer = require('./trimResultTransformer');

var _trimResultTransformer2 = _interopRequireDefault(_trimResultTransformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _trimResultTransformer2.default;
module.exports = exports['default'];

},{"./trimResultTransformer":47}],47:[function(require,module,exports){
'use strict';

/**
 * TemplateTag transformer that trims whitespace on the end result of a tagged template
 * @param  {String} side = '' - The side of the string to trim. Can be 'left' or 'right'
 * @return {Object}           - a TemplateTag transformer
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
var trimResultTransformer = function trimResultTransformer() {
  var side = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return {
    onEndResult: function onEndResult(endResult) {
      side = side.toLowerCase();
      // uppercase the first letter of side value
      if (side === 'left' || side === 'right') {
        side = side.charAt(0).toUpperCase() + side.slice(1);
      } else if (side !== '') {
        throw new Error('Side not supported: ' + side);
      }
      return endResult['trim' + side]();
    }
  };
};

exports.default = trimResultTransformer;
module.exports = exports['default'];

},{}],48:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":57}],49:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/is-nan"), __esModule: true };
},{"core-js/library/fn/number/is-nan":58}],50:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-properties"), __esModule: true };
},{"core-js/library/fn/object/define-properties":59}],51:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":60}],52:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/freeze"), __esModule: true };
},{"core-js/library/fn/object/freeze":61}],53:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],54:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":51}],55:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperties = require("../core-js/object/define-properties");

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _freeze = require("../core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (strings, raw) {
  return (0, _freeze2.default)((0, _defineProperties2.default)(strings, {
    raw: {
      value: (0, _freeze2.default)(raw)
    }
  }));
};
},{"../core-js/object/define-properties":50,"../core-js/object/freeze":52}],56:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _from = require("../core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
},{"../core-js/array/from":48}],57:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":67,"../../modules/es6.array.from":113,"../../modules/es6.string.iterator":118}],58:[function(require,module,exports){
require('../../modules/es6.number.is-nan');
module.exports = require('../../modules/_core').Number.isNaN;
},{"../../modules/_core":67,"../../modules/es6.number.is-nan":114}],59:[function(require,module,exports){
require('../../modules/es6.object.define-properties');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperties(T, D){
  return $Object.defineProperties(T, D);
};
},{"../../modules/_core":67,"../../modules/es6.object.define-properties":115}],60:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":67,"../../modules/es6.object.define-property":116}],61:[function(require,module,exports){
require('../../modules/es6.object.freeze');
module.exports = require('../../modules/_core').Object.freeze;
},{"../../modules/_core":67,"../../modules/es6.object.freeze":117}],62:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],63:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":83}],64:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":104,"./_to-iobject":106,"./_to-length":107}],65:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":66,"./_wks":111}],66:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],67:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],68:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":92,"./_property-desc":98}],69:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":62}],70:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],71:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":75}],72:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":76,"./_is-object":83}],73:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],74:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":67,"./_ctx":69,"./_global":76,"./_hide":78}],75:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],76:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],77:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],78:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":71,"./_object-dp":92,"./_property-desc":98}],79:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":76}],80:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":71,"./_dom-create":72,"./_fails":75}],81:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":66}],82:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":88,"./_wks":111}],83:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],84:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":63}],85:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":78,"./_object-create":91,"./_property-desc":98,"./_set-to-string-tag":100,"./_wks":111}],86:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":74,"./_has":77,"./_hide":78,"./_iter-create":85,"./_iterators":88,"./_library":89,"./_object-gpo":94,"./_redefine":99,"./_set-to-string-tag":100,"./_wks":111}],87:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":111}],88:[function(require,module,exports){
module.exports = {};
},{}],89:[function(require,module,exports){
module.exports = true;
},{}],90:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":75,"./_has":77,"./_is-object":83,"./_object-dp":92,"./_uid":110}],91:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};
},{"./_an-object":63,"./_dom-create":72,"./_enum-bug-keys":73,"./_html":79,"./_object-dps":93,"./_shared-key":101}],92:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":63,"./_descriptors":71,"./_ie8-dom-define":80,"./_to-primitive":109}],93:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":63,"./_descriptors":71,"./_object-dp":92,"./_object-keys":96}],94:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":77,"./_shared-key":101,"./_to-object":108}],95:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":64,"./_has":77,"./_shared-key":101,"./_to-iobject":106}],96:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":73,"./_object-keys-internal":95}],97:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":67,"./_export":74,"./_fails":75}],98:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],99:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":78}],100:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":77,"./_object-dp":92,"./_wks":111}],101:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":102,"./_uid":110}],102:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":76}],103:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":70,"./_to-integer":105}],104:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":105}],105:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],106:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":70,"./_iobject":81}],107:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":105}],108:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":70}],109:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":83}],110:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],111:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":76,"./_shared":102,"./_uid":110}],112:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":65,"./_core":67,"./_iterators":88,"./_wks":111}],113:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":68,"./_ctx":69,"./_export":74,"./_is-array-iter":82,"./_iter-call":84,"./_iter-detect":87,"./_to-length":107,"./_to-object":108,"./core.get-iterator-method":112}],114:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./_export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"./_export":74}],115:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperties: require('./_object-dps')});
},{"./_descriptors":71,"./_export":74,"./_object-dps":93}],116:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":71,"./_export":74,"./_object-dp":92}],117:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"./_is-object":83,"./_meta":90,"./_object-sap":97}],118:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":86,"./_string-at":103}],119:[function(require,module,exports){
'use strict';
module.exports = function (hex) {
	if (typeof hex !== 'string') {
		throw new TypeError('Expected a string');
	}

	hex = hex.replace(/^#/, '');

	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	var num = parseInt(hex, 16);

	return [num >> 16, num >> 8 & 255, num & 255];
};

},{}],120:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    Set = getNative(root, 'Set'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set(values);
};

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.uniq` except that it accepts `comparator` which
 * is invoked to compare elements of `array`. The comparator is invoked with
 * two arguments: (arrVal, othVal).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
 *
 * _.uniqWith(objects, _.isEqual);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 */
function uniqWith(array, comparator) {
  return (array && array.length)
    ? baseUniq(array, undefined, comparator)
    : [];
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = uniqWith;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],121:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _palette2 = require('./palette');

var _palette3 = _interopRequireDefault(_palette2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//this is a bitshift operation, not a boolean comparison
//i normally wouldn't, but it's really convenient here
var MAX_RADIUS_CONTINUOUS = 1 << 16;

var MAX_RADIUS_DISTANCE_ESTIMATION = 1 << 20;

var MAX_RADIUS_ESCAPE_TIME = 1 << 2;

var MAX_ITERATIONS = 1000;

var DEFAULT_SETTINGS = {
    palette: 'default',
    mandelbrotColor: {
        r: 0,
        g: 0,
        b: 0
    },
    loopPalette: false
};

function loopPalette(palette) {
    if (palette.length > 2) {
        return palette.concat(palette.slice(1, palette.length - 1).reverse());
    }
    return palette;
}

//An implementation of the Escape Time Algorithm with continuous coloring
//almost directly from https://en.wikipedia.org/wiki/Mandelbrot_set#Escape_time_algorithm
//with https://en.wikipedia.org/wiki/Mandelbrot_set#Continuous_.28smooth.29_coloring
function _escapeTime(x0, y0, options) {
    options = Object.assign({}, DEFAULT_SETTINGS, options);
    var _palette = options.loopPalette ? loopPalette(_palette3.default[options.palette]) : _palette3.default[options.palette];

    var _maxIterations = MAX_ITERATIONS + MAX_ITERATIONS % _palette.length;

    var x = 0.0;
    var y = 0.0;
    var iteration = 0;

    while (x * x + y * y < MAX_RADIUS_ESCAPE_TIME && iteration < _maxIterations) {
        var tempX = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = tempX;
        iteration++;
    }

    //deafult to black unless we managed to rule this pixel out
    var color = options.mandelbrotColor;

    if (iteration < _maxIterations) {
        color = _palette[Math.floor(iteration % _palette.length)];
    }

    return color;
}

function _interpolateValue(val1, val2, fraction) {
    return (1 - fraction) * val1 + fraction * val2;
}

function _interpolateColor(color1, color2, fraction) {
    return {
        r: _interpolateValue(color1.r, color2.r, fraction),
        g: _interpolateValue(color1.g, color2.g, fraction),
        b: _interpolateValue(color1.b, color2.b, fraction)
    };
}

function _continuousColoring(x0, y0, options) {
    options = Object.assign({}, DEFAULT_SETTINGS, options);
    var _palette = options.loopPalette ? loopPalette(_palette3.default[options.palette]) : _palette3.default[options.palette];
    var _maxIterations = MAX_ITERATIONS + MAX_ITERATIONS % _palette.length;

    var x = 0.0;
    var y = 0.0;
    var iteration = 0;
    while (x * x + y * y < MAX_RADIUS_CONTINUOUS * 2 && iteration < _maxIterations) {
        var tempX = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = tempX;
        iteration++;
    }

    //deafult to black unless we managed to rule this pixel out
    var color = options.mandelbrotColor;

    if (iteration < _maxIterations) {
        //TODO: explicate the math here–  not it's non-trivial
        var log_zn = Math.log(x * x + y * y) / 2;
        var nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        iteration = iteration + 1 - nu;

        var color1 = _palette[Math.floor(iteration) % _palette.length];
        var color2 = _palette[(Math.floor(iteration) + 1) % _palette.length];

        color = _interpolateColor(color1, color2, iteration % 1);
    }

    return color;
}

function _exteriorDistanceEstimation(cx, cy, options) {
    options = Object.assign({}, DEFAULT_SETTINGS, options);
    var _palette = options.loopPalette ? loopPalette(_palette3.default[options.palette]) : _palette3.default[options.palette];
    var _maxIterations = MAX_ITERATIONS + MAX_ITERATIONS % _palette.length;
    var _maxDistance = options.pixelSize * options.canvasWidth * 0.0333;

    var zx = 0.0;
    var zy = 0.0;
    var dx = 0.0;
    var dy = 0.0;
    var iteration = 0;
    while (zx * zx + zy * zy < MAX_RADIUS_DISTANCE_ESTIMATION && iteration < _maxIterations) {

        dx = 2 * zx * dx - 2 * zy * dx + 1;
        dy = 4 * zx * dy;

        var tempZx = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = tempZx;
        iteration++;
    }

    var distanceEstimate = Math.sqrt((zx * zx + zy * zy) / (dx * dx + dy * dy)) * 0.5 * Math.log(zx * zx + zy * zy);

    var color = options.mandelbrotColor;

    if (iteration < _maxIterations) {
        var color1 = _palette[Math.floor(distanceEstimate / _maxDistance) % _palette.length];
        var color2 = _palette[(Math.floor(distanceEstimate / _maxDistance) + 1) % _palette.length];

        color = _interpolateColor(color1, color2, distanceEstimate / _maxDistance);
    }

    return color;
}

exports.default = {
    'default': _continuousColoring,
    'escape-time': _escapeTime,
    'continuous-coloring': _continuousColoring,
    'exterior-distance-estimation': _exteriorDistanceEstimation
};

},{"./palette":122}],122:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.uniqwith');

var _lodash2 = _interopRequireDefault(_lodash);

var _hexRgb = require('hex-rgb');

var _hexRgb2 = _interopRequireDefault(_hexRgb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rgb(colorArray) {
    return {
        r: colorArray[0],
        g: colorArray[1],
        b: colorArray[2]
    };
}

function hex(hexstring) {
    return rgb((0, _hexRgb2.default)(hexstring));
}

/*
 * the following loop was
 * modified from rainbowify
 * (https://github.com/maxogden/rainbowify)
 * which lifted from mocha
 * (https://github.com/visionmedia/mocha/blob/master/lib/reporters/nyan.js)
 * to generate the color palette
 */
var _rainbow = [];
for (var i = 0; i < 6 * 7; i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = i * (1.0 / 6);

    var r = Math.floor(3 * Math.sin(n) + 3) * 255 / 5;
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3) * 255 / 5;
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3) * 255 / 5;

    _rainbow.push(rgb([r, g, b]));
}

_rainbow = (0, _lodash2.default)(_rainbow, function (val1, val2) {
    return val1.r === val2.r && val1.g === val2.g && val1.b === val2.b;
});

var _colorSchemerPastelRainbow = [hex('#FFCCCC'), hex('#FFE0CC'), hex('#FFEACC'), hex('#FFF4CC'), hex('#FFFECC'), hex('#EFFAC8'), hex('#C7F5C4'), hex('#C4F0F4'), hex('#C4DAF4'), hex('#C9C4F4'), hex('#E1C4F4'), hex('#F6C6E6')];

var _materialDesignRed = [hex('#FFEBEE'), hex('#FFCDD2'), hex('#EF9A9A'), hex('#E57373'), hex('#EF5350'), hex('#F44336'), hex('#E53935'), hex('#D32F2F'), hex('#C62828'), hex('#B71C1C')];

var _materialDesignRedAlt = [hex('#FF8A80'), hex('#FF5252'), hex('#FF1744'), hex('#D50000')];

var _materialDesignPink = [hex('#FCE4EC'), hex('#F8BBD0'), hex('#F48FB1'), hex('#F06292'), hex('#EC407A'), hex('#E91E63'), hex('#D81B60'), hex('#C2185B'), hex('#AD1457'), hex('#880E4F')];

var _materialDesignPinkAlt = [hex('#FF80AB'), hex('#FF4081'), hex('#F50057'), hex('#C51162')];

var _materialDesignPurple = [hex('#F3E5F5'), hex('#E1BEE7'), hex('#CE93D8'), hex('#BA68C8'), hex('#AB47BC'), hex('#9C27B0'), hex('#8E24AA'), hex('#7B1FA2'), hex('#6A1B9A'), hex('#4A148C')];

var _materialDesignPurpleAlt = [hex('#EA80FC'), hex('#E040FB'), hex('#D500F9'), hex('#AA00FF')];

var _materialDesignDeepPurple = [hex('#EDE7F6'), hex('#D1C4E9'), hex('#B39DDB'), hex('#9575CD'), hex('#7E57C2'), hex('#673AB7'), hex('#5E35B1'), hex('#512DA8'), hex('#4527A0'), hex('#311B92')];

var _materialDesignDeepPurpleAlt = [hex('#B388FF'), hex('#7C4DFF'), hex('#651FFF'), hex('#6200EA')];

var _materialDesignIndigo = [hex('#E8EAF6'), hex('#C5CAE9'), hex('#9FA8DA'), hex('#7986CB'), hex('#5C6BC0'), hex('#3F51B5'), hex('#3949AB'), hex('#303F9F'), hex('#283593'), hex('#1A237E')];

var _materialDesignIndigoAlt = [hex('#8C9EFF'), hex('#536DFE'), hex('#3D5AFE'), hex('#304FFE')];

var _materialDesignBlue = [hex('#E3F2FD'), hex('#BBDEFB'), hex('#90CAF9'), hex('#64B5F6'), hex('#42A5F5'), hex('#2196F3'), hex('#1E88E5'), hex('#1976D2'), hex('#1565C0'), hex('#0D47A1')];

var _materialDesignBlueAlt = [hex('#82B1FF'), hex('#448AFF'), hex('#2979FF'), hex('#2962FF')];

var _materialDesignLightBlue = [hex('#E1F5FE'), hex('#B3E5FC'), hex('#81D4FA'), hex('#4FC3F7'), hex('#29B6F6'), hex('#03A9F4'), hex('#039BE5'), hex('#0288D1'), hex('#0277BD'), hex('#01579B')];

var _materialDesignLightBlueAlt = [hex('#80D8FF'), hex('#40C4FF'), hex('#00B0FF'), hex('#0091EA')];

var _materialDesignCyan = [hex('#E0F7FA'), hex('#B2EBF2'), hex('#80DEEA'), hex('#4DD0E1'), hex('#26C6DA'), hex('#00BCD4'), hex('#00ACC1'), hex('#0097A7'), hex('#00838F'), hex('#006064')];

var _materialDesignCyanAlt = [hex('#84FFFF'), hex('#18FFFF'), hex('#00E5FF'), hex('#00B8D4')];

var _materialDesignTeal = [hex('#E0F2F1'), hex('#B2DFDB'), hex('#80CBC4'), hex('#4DB6AC'), hex('#26A69A'), hex('#009688'), hex('#00897B'), hex('#00796B'), hex('#00695C'), hex('#004D40')];

var _materialDesignTealAlt = [hex('#A7FFEB'), hex('#64FFDA'), hex('#1DE9B6'), hex('#00BFA5')];

var _materialDesignGreen = [hex('#E8F5E9'), hex('#C8E6C9'), hex('#A5D6A7'), hex('#81C784'), hex('#66BB6A'), hex('#4CAF50'), hex('#43A047'), hex('#388E3C'), hex('#2E7D32'), hex('#1B5E20')];

var _materialDesignGreenAlt = [hex('#B9F6CA'), hex('#69F0AE'), hex('#00E676'), hex('#00C853')];

var _materialDesignLightGreen = [hex('#F1F8E9'), hex('#DCEDC8'), hex('#C5E1A5'), hex('#AED581'), hex('#9CCC65'), hex('#8BC34A'), hex('#7CB342'), hex('#689F38'), hex('#558B2F'), hex('#33691E')];

var _materialDesignLightGreenAlt = [hex('#CCFF90'), hex('#B2FF59'), hex('#76FF03'), hex('#64DD17')];

var _materialDesignLime = [hex('#F9FBE7'), hex('#F0F4C3'), hex('#E6EE9C'), hex('#DCE775'), hex('#D4E157'), hex('#CDDC39'), hex('#C0CA33'), hex('#AFB42B'), hex('#9E9D24'), hex('#827717')];

var _materialDesignLimeAlt = [hex('#F4FF81'), hex('#EEFF41'), hex('#C6FF00'), hex('#AEEA00')];

var _materialDesignYellow = [hex('#FFFDE7'), hex('#FFF9C4'), hex('#FFF59D'), hex('#FFF176'), hex('#FFEE58'), hex('#FFEB3B'), hex('#FDD835'), hex('#FBC02D'), hex('#F9A825'), hex('#F57F17')];

var _materialDesignYellowAlt = [hex('#FFFF8D'), hex('#FFFF00'), hex('#FFEA00'), hex('#FFD600')];

var _materialDesignAmber = [hex('#FFF8E1'), hex('#FFECB3'), hex('#FFE082'), hex('#FFD54F'), hex('#FFCA28'), hex('#FFC107'), hex('#FFB300'), hex('#FFA000'), hex('#FF8F00'), hex('#FF6F00')];

var _materialDesignAmberAlt = [hex('#FFE57F'), hex('#FFD740'), hex('#FFC400'), hex('#FFAB00')];

var _materialDesignOrange = [hex('#FFF3E0'), hex('#FFE0B2'), hex('#FFCC80'), hex('#FFB74D'), hex('#FFA726'), hex('#FF9800'), hex('#FB8C00'), hex('#F57C00'), hex('#EF6C00'), hex('#E65100')];

var _materialDesignOrangeAlt = [hex('#FFD180'), hex('#FFAB40'), hex('#FF9100'), hex('#FF6D00')];

var _materialDesignDeepOrange = [hex('#FBE9E7'), hex('#FFCCBC'), hex('#FFAB91'), hex('#FF8A65'), hex('#FF7043'), hex('#FF5722'), hex('#F4511E'), hex('#E64A19'), hex('#D84315'), hex('#BF360C')];

var _materialDesignDeepOrangeAlt = [hex('#FF9E80'), hex('#FF6E40'), hex('#FF3D00'), hex('#DD2C00')];

var _materialDesignBrown = [hex('#EFEBE9'), hex('#D7CCC8'), hex('#BCAAA4'), hex('#A1887F'), hex('#8D6E63'), hex('#795548'), hex('#6D4C41'), hex('#5D4037'), hex('#4E342E'), hex('#3E2723')];

var _materialDesignGrey = [hex('#FAFAFA'), hex('#F5F5F5'), hex('#EEEEEE'), hex('#E0E0E0'), hex('#BDBDBD'), hex('#9E9E9E'), hex('#757575'), hex('#616161'), hex('#424242'), hex('#212121')];

var _materialDesignBlueGrey = [hex('#ECEFF1'), hex('#CFD8DC'), hex('#B0BEC5'), hex('#90A4AE'), hex('#78909C'), hex('#607D8B'), hex('#546E7A'), hex('#455A64'), hex('#37474F'), hex('#263238')];

var _materialDesignRainbow500 = [rgb([244, 67, 54]), rgb([233, 30, 99]), rgb([156, 39, 176]), rgb([103, 58, 183]), rgb([63, 81, 181]), rgb([33, 150, 243]), rgb([3, 169, 244]), rgb([0, 188, 212]), rgb([0, 150, 136]), rgb([76, 175, 80]), rgb([139, 195, 74]), rgb([205, 220, 57]), rgb([255, 235, 59]), rgb([255, 193, 7]), rgb([255, 152, 0]), rgb([255, 87, 34])];

var _materialDesignRainbowA400 = [rgb([255, 23, 68]), rgb([245, 0, 87]), rgb([213, 0, 249]), rgb([101, 31, 255]), rgb([61, 90, 254]), rgb([41, 121, 255]), rgb([0, 176, 255]), rgb([0, 229, 255]), rgb([29, 233, 182]), rgb([0, 230, 118]), rgb([118, 255, 3]), rgb([198, 255, 0]), rgb([255, 234, 0]), rgb([255, 196, 0]), rgb([255, 145, 0]), rgb([255, 61, 0])];

var _hueShiftRainbowChocolate = [hex('#d2691e'), hex('#e76038'), hex('#f45956'), hex('#f95477'), hex('#f65298'), hex('#ea53b7'), hex('#d656d2'), hex('#bc5be7'), hex('#9e63f4'), hex('#7d6cf9'), hex('#5c77f6'), hex('#3d81ea'), hex('#228bd6'), hex('#0d94bc'), hex('#009b9e'), hex('#00a07d'), hex('#00a25c'), hex('#0aa13d'), hex('#1e9e22'), hex('#38990d'), hex('#569100'), hex('#778800'), hex('#987d00'), hex('#b7730a')];

var _blueBlack = [hex('#000000'), hex('#10142d'), hex('#20295b'), hex('#303d88'), hex('#3F51B5')];

var _grayScale = [rgb([255, 255, 255]), rgb([0, 0, 0, 0])];

exports.default = {
    'default': _rainbow,
    'rainbow': _rainbow,

    'color-schemer-pastel-rainbow': _colorSchemerPastelRainbow,

    'material-design-red': _materialDesignRed,
    'material-design-red-alt': _materialDesignRedAlt,

    'material-design-pink': _materialDesignPink,
    'material-design-pink-alt': _materialDesignPinkAlt,

    'material-design-purple': _materialDesignPurple,
    'material-design-purple-alt': _materialDesignPurpleAlt,

    'material-design-deep-purple': _materialDesignDeepPurple,
    'material-design-deep-purple-alt': _materialDesignDeepPurpleAlt,

    'material-design-indigo': _materialDesignIndigo,
    'material-design-indigo-alt': _materialDesignIndigoAlt,

    'material-design-blue': _materialDesignBlue,
    'material-design-blue-alt': _materialDesignBlueAlt,

    'material-design-light-blue': _materialDesignLightBlue,
    'material-design-light-blue-alt': _materialDesignLightBlueAlt,

    'material-design-cyan': _materialDesignCyan,
    'material-design-cyan-alt': _materialDesignCyanAlt,

    'material-design-teal': _materialDesignTeal,
    'material-design-teal-alt': _materialDesignTealAlt,

    'material-design-green': _materialDesignGreen,
    'material-design-green-alt': _materialDesignGreenAlt,

    'material-design-light-green': _materialDesignLightGreen,
    'material-design-light-green-alt': _materialDesignLightGreenAlt,

    'material-design-lime': _materialDesignLime,
    'material-design-lime-alt': _materialDesignLimeAlt,

    'material-design-yellow': _materialDesignYellow,
    'material-design-yellow-alt': _materialDesignYellowAlt,

    'material-design-amber': _materialDesignAmber,
    'material-design-amber-alt': _materialDesignAmberAlt,

    'material-design-orange': _materialDesignOrange,
    'material-design-orange-alt': _materialDesignOrangeAlt,

    'material-design-deep-orange': _materialDesignDeepOrange,
    'material-design-deep-orange-alt': _materialDesignDeepOrangeAlt,

    'material-design-brown': _materialDesignBrown,
    'material-design-grey': _materialDesignGrey,
    'material-design-blue-grey': _materialDesignBlueGrey,

    'material-design-rainbow-500': _materialDesignRainbow500,
    'material-design-rainbow-a400': _materialDesignRainbowA400,
    'gray-scale': _grayScale,
    'blue-black': _blueBlack,

    'hue-shift-rainbow-chocolate': _hueShiftRainbowChocolate
};

//TODO: allow users to CRUD their own color palettes to localstorage

},{"hex-rgb":119,"lodash.uniqwith":120}],123:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _coloringMethod = require('./coloring-method');

var _coloringMethod2 = _interopRequireDefault(_coloringMethod);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//the bounds of the set
var LEFT_EDGE = -2.5;
var RIGHT_EDGE = 1;
var TOP_EDGE = -1;
var BOTTOM_EDGE = 1;

//because the bounds of the set are uneven, we're horizontally offset this much
var HORIZONTAL_OFFSET = LEFT_EDGE - (LEFT_EDGE - RIGHT_EDGE) / 2;

//width / height ratio of the bounds of the set
var MANDEL_RATIO = (RIGHT_EDGE - LEFT_EDGE) / (BOTTOM_EDGE - TOP_EDGE);

var MIMETYPE_PNG = 'image/png';

var DEFAULT_SETTINGS = {
    coloringMethod: 'default',
    palette: 'default',
    loopPalette: false
};

var Renderer = function () {
    function Renderer(canvas, options) {
        _classCallCheck(this, Renderer);

        this._options = Object.assign({}, DEFAULT_SETTINGS, options);

        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._data = this._imageData.data;

        this._coloringMethod = _coloringMethod2.default[this._options.coloringMethod];

        this.updateViewportSize();

        this._scale = 1;
        this._dx = HORIZONTAL_OFFSET;
        this._dy = 0;
    }

    _createClass(Renderer, [{
        key: 'plot',
        value: function plot(x, y, color) {
            //the canvas pixel data is a bit awkward to get at...
            //see: https://www.w3.org/TR/2dcontext/#pixel-manipulation
            var dataIndex = (y * this._imageData.width + x) * 4;
            if (dataIndex < this._data.length && dataIndex >= 0) {
                this._data[dataIndex] = color.r;
                this._data[dataIndex + 1] = color.g;
                this._data[dataIndex + 2] = color.b;
                this._data[dataIndex + 3] = 255; //max saturation
            }
        }
    }, {
        key: 'updateViewportSize',
        value: function updateViewportSize() {
            //width / height ratio of the viewport
            this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
            this._data = this._imageData.data;
            this._imageRatio = this._imageData.width / this._imageData.height;

            var ratio = 1;
            var product = 0;

            this._topEdge = TOP_EDGE;
            this._bottomEdge = BOTTOM_EDGE;
            this._leftEdge = LEFT_EDGE;
            this._rightEdge = RIGHT_EDGE;

            //modify the bounds we display based on the
            //difference between the viewport ratio and
            //the ratio of the bounds of the mandelbrot
            if (this._imageRatio > MANDEL_RATIO) {
                ratio = this._imageRatio / MANDEL_RATIO;
                product = (RIGHT_EDGE - LEFT_EDGE) * ratio;

                this._leftEdge = -product * (2.5 / 3.5);
                this._rightEdge = product * (1 / 3.5);
            } else {
                ratio = MANDEL_RATIO / this._imageRatio;
                product = (BOTTOM_EDGE - TOP_EDGE) * ratio;

                this._topEdge = -product / 2.0;
                this._bottomEdge = product / 2.0;
            }
        }
    }, {
        key: 'updateRealBoundaries',
        value: function updateRealBoundaries() {
            //the Real (ℝ) boundaries of the rendering given the zoom and offset
            this.xMax = this._rightEdge / this._scale + this._dx;
            this.xMin = this._leftEdge / this._scale + this._dx;
            this.yMax = this._bottomEdge / this._scale + this._dy;
            this.yMin = this._topEdge / this._scale + this._dy;

            //translation of "Pixel space" to Real (ℝ) space
            //i.e., these variables represent the Real difference
            //between two pixels, horizonatally and vertically
            this.xStep = (this.xMax - this.xMin) / this._imageData.width;
            this.yStep = (this.yMax - this.yMin) / this._imageData.height;
        }

        //scale: how far we've zoomed in from the default
        //dx0: displacement of perspective horizontally
        //dy0: displacement of perspective vertically

    }, {
        key: 'render',
        value: function render(scale, dx0, dy0) {
            this._scale = scale;

            this._dx = dx0 - HORIZONTAL_OFFSET / this._scale;
            this._dy = dy0;

            this.updateRealBoundaries();

            for (var canvasY = 0; canvasY < this._imageData.height; canvasY++) {
                for (var canvasX = 0; canvasX < this._imageData.width; canvasX++) {
                    //scale the pixel values to be within the bounds of the set
                    var pos = this.realPositionToComplexPosition(canvasX, canvasY);
                    var x0 = pos.x;
                    var y0 = pos.y;

                    var color = this._coloringMethod(x0, y0, Object.assign(this._options, {
                        pixelSize: this.xStep,
                        canvasWidth: this._canvas.width
                    }));

                    this.plot(canvasX, canvasY, color);
                }
            }

            //draw it!
            this._context.putImageData(this._imageData, 0, 0);
        }

        //r= the real part of the number
        //c= the complex part of the number

    }, {
        key: 'complexPositionToRealPosition',
        value: function complexPositionToRealPosition(r, i) {
            return {
                x: parseInt((r - this.xMin) / this.xStep),
                y: parseInt((i - this.yMin) / this.yStep)
            };
        }
    }, {
        key: 'realPositionToComplexPosition',
        value: function realPositionToComplexPosition(realX, realY) {
            //scale the pixel values to frame the bounds of the set
            return {
                x: this.xMin + this.xStep * realX,
                y: this.yMin + this.yStep * realY
            };
        }
    }, {
        key: 'DataUrl',
        get: function get() {
            return this._canvas.toDataURL(MIMETYPE_PNG);
        }
    }]);

    return Renderer;
}();

exports.default = Renderer;

},{"./coloring-method":121}],124:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UI = exports.Palette = exports.Renderer = undefined;

var _renderer = require('../../graphics/renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _palette = require('../../graphics/palette');

var _palette2 = _interopRequireDefault(_palette);

var _ui = require('./ui');

var _ui2 = _interopRequireDefault(_ui);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Renderer = _renderer2.default;
exports.Palette = _palette2.default;
exports.UI = _ui2.default;

},{"../../graphics/palette":122,"../../graphics/renderer":123,"./ui":125}],125:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n        <div>\n            <a id="get-png" href="#" target="_blank">GET PNG</a>\n        </div>\n        <div>\n            <button onclick="zoomIn();">+</button>\n            <button onclick="zoomOut();">-</button>\n            <button onclick="reset();">Reset</button>\n        </div>\n        <div>\n            <button onclick="save();">Save</button>\n        </div>\n        <div id="location">\n            <div>\n                <label for="scale">Scale</label>\n                <input id="scale" type="text" value="', '"  />\n            </div>\n            <div>\n                <label for="x-location">X</label>\n                <input id="x-location" type="text" value="', '" />\n            </div>\n            <div>\n                <label for="y-location">Y</label>\n                <input id="y-location" type="text" value="', '" />\n            </div>\n            <button onclick="setLocation();">go</button>\n        </div>\n        <div id="saved-list">', '</div>\n        <div id="mandelog">', '</div>\n    '], ['\n        <div>\n            <a id="get-png" href="#" target="_blank">GET PNG</a>\n        </div>\n        <div>\n            <button onclick="zoomIn();">+</button>\n            <button onclick="zoomOut();">-</button>\n            <button onclick="reset();">Reset</button>\n        </div>\n        <div>\n            <button onclick="save();">Save</button>\n        </div>\n        <div id="location">\n            <div>\n                <label for="scale">Scale</label>\n                <input id="scale" type="text" value="', '"  />\n            </div>\n            <div>\n                <label for="x-location">X</label>\n                <input id="x-location" type="text" value="', '" />\n            </div>\n            <div>\n                <label for="y-location">Y</label>\n                <input id="y-location" type="text" value="', '" />\n            </div>\n            <button onclick="setLocation();">go</button>\n        </div>\n        <div id="saved-list">', '</div>\n        <div id="mandelog">', '</div>\n    ']),
    _templateObject2 = _taggedTemplateLiteral(['\n                <div>\n                    <a href="#" class="saved-location" data-location-index="', '">', '}\n                </div>\n            '], ['\n                <div>\n                    <a href="#" class="saved-location" data-location-index="', '">', '}\n                </div>\n            ']),
    _templateObject3 = _taggedTemplateLiteral(['<p>', ': ', '</p>'], ['<p>', ': ', '</p>']);

var _renderer = require('../../graphics/renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _commonTags = require('common-tags');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _renderScene(r, viewData) {
    r.render(viewData.scale, viewData.x, viewData.y);
}

function _renderControls(ui, viewData) {
    return (0, _commonTags.html)(_templateObject, viewData.scale, viewData.x, viewData.y, viewData.savedLocations.map(function (l, i) {
        return (0, _commonTags.html)(_templateObject2, i, l.name);
    }), viewData.mandelog.map(function (l, i) {
        return (0, _commonTags.html)(_templateObject3, i, l);
    }));
}

var UI = function () {
    function UI(canvas, controls) {
        var _this = this;

        _classCallCheck(this, UI);

        this._canvas = canvas instanceof Node ? canvas : document.getElementById(canvas);
        this._controls = controls instanceof Node ? controls : document.getElementById(controls);

        this._r = new _renderer2.default(this._canvas, {
            coloringMethod: 'continuous-coloring',
            //palette: 'material-design-rainbow-a400',
            palette: 'hue-shift-rainbow-chocolate'
        });

        //loopPalette: true
        this._initViewData = {
            scale: this._r._scale,
            x: this._r._dx, //horizontal offset, used for centering the set
            y: this._r._dy,
            canvasWidth: this._canvas.width,
            canvasHeight: this._canvas.height,
            savedLocations: [],
            mandelog: []
        };

        this._viewHistory = [this._initViewData];
        this._viewData = Object.assign({}, this._initViewData);

        var savedData = window.localStorage.getItem('locations');
        if (savedData) {
            var savedJSON = JSON.parse(savedData);
            if (savedJSON instanceof Array) {
                this._viewData.savedLocations = savedJSON;
            }
        }

        var ui = this;
        var resizeCanvas = function resizeCanvas(timestamp) {
            if (ui._viewHistory[0].canvasWidth !== ui._canvas.width || ui._viewHistory[0].canvasHeight !== ui._canvas.height) {
                ui.mandelog('viewport size changed');
                ui._viewHistory = [Object.assign({}, ui._viewData)].concat(ui._viewHistory);
                ui._r.updateViewportSize();
                Object.assign(ui._viewData, {
                    canvasWidth: _this._canvas.width,
                    canvasHeight: _this._canvas.height
                });
                ui.render();
            }
            window.requestAnimationFrame(resizeCanvas);
        };
        window.requestAnimationFrame(resizeCanvas);

        this._canvas.addEventListener('click', function (e) {
            e.preventDefault();
            var pos = ui._r.realPositionToComplexPosition(e.layerX, e.layerY);
            ui._viewData.x = pos.x;
            ui._viewData.y = pos.y;
            ui.zoomIn();
        });
    }

    _createClass(UI, [{
        key: 'zoomIn',
        value: function zoomIn() {
            this._viewData.scale *= 2;
            this.render();
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut() {
            this._viewData.scale /= 2;
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            //_renderControls(this, this._viewData);
            _renderScene(this._r, this._viewData);
        }
        //log to the UI's console

    }, {
        key: 'mandelog',
        value: function mandelog(msg) {
            this._viewData.mandelog.push(+new Date() + ' ' + msg + '.');
        }
    }, {
        key: 'reset',
        value: function reset() {
            Object.assign(this._viewData, {
                scale: this._initViewData.scale,
                x: this._initViewData.x,
                y: this._initViewData.y
            });
            this.render();
        }
    }, {
        key: 'saveLocation',
        value: function saveLocation() {
            var saveData = {};
            saveData.name = 'location ' + (this._viewData.savedLocations.length + 1);
            saveData.x = this._viewData.x;
            saveData.y = this._viewData.y;
            saveData.scale = this._viewData.scale;
            this._viewData.savedLocations.push(saveData);
            window.localStorage.setItem('locations', JSON.stringify(this._viewData.savedLocations));
            this._controls.innerHTML = _renderControls(this, this._viewData);
        }
    }, {
        key: 'load',
        value: function load(l) {
            Object.assign(this._viewData, l);
            this.render();
        }
    }, {
        key: 'bindControls',
        value: function bindControls() {
            this._controls.getElementsByClassName('saved-location').each(function (i) {
                var _this2 = this;

                i.addEventListener('click', function (e) {
                    e.preventDefault();
                    var index = e.target.getAttribute('data-location-index');
                    var loc = _this2._viewData.savedLocations[index];
                    console.log(loc);
                    //load(loc);
                });
            });
        }
    }]);

    return UI;
}();

module.exports = UI;

//TODO: update canvas compositor to a proper ES6 module, and use it for more interactivity

},{"../../graphics/renderer":123,"common-tags":12}]},{},[124])(124)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL1RlbXBsYXRlVGFnL1RlbXBsYXRlVGFnLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9UZW1wbGF0ZVRhZy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvY29kZUJsb2NrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9jb21tYUxpc3RzL2NvbW1hTGlzdHMuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL2NvbW1hTGlzdHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL2NvbW1hTGlzdHNBbmQvY29tbWFMaXN0c0FuZC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvY29tbWFMaXN0c0FuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvY29tbWFMaXN0c09yL2NvbW1hTGlzdHNPci5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvY29tbWFMaXN0c09yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9odG1sL2h0bWwuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL2h0bWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9pbmxpbmVBcnJheVRyYW5zZm9ybWVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9pbmxpbmVBcnJheVRyYW5zZm9ybWVyL2lubGluZUFycmF5VHJhbnNmb3JtZXIuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL2lubGluZUxpc3RzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9pbmxpbmVMaXN0cy9pbmxpbmVMaXN0cy5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvb25lTGluZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvb25lTGluZS9vbmVMaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9vbmVMaW5lQ29tbWFMaXN0cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvb25lTGluZUNvbW1hTGlzdHMvb25lTGluZUNvbW1hTGlzdHMuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL29uZUxpbmVDb21tYUxpc3RzQW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9vbmVMaW5lQ29tbWFMaXN0c0FuZC9vbmVMaW5lQ29tbWFMaXN0c0FuZC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvb25lTGluZUNvbW1hTGlzdHNPci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvb25lTGluZUNvbW1hTGlzdHNPci9vbmVMaW5lQ29tbWFMaXN0c09yLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9vbmVMaW5lSW5saW5lTGlzdHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL29uZUxpbmVJbmxpbmVMaXN0cy9vbmVMaW5lSW5saW5lTGlzdHMuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL29uZUxpbmVUcmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9vbmVMaW5lVHJpbS9vbmVMaW5lVHJpbS5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvcmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvcmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lci9yZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lci9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3JlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyL3JlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lci5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvc2FmZUh0bWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3NhZmVIdG1sL3NhZmVIdG1sLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9zb3VyY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3NwbGl0U3RyaW5nVHJhbnNmb3JtZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3NwbGl0U3RyaW5nVHJhbnNmb3JtZXIvc3BsaXRTdHJpbmdUcmFuc2Zvcm1lci5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvc3RyaXBJbmRlbnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3N0cmlwSW5kZW50L3N0cmlwSW5kZW50LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9zdHJpcEluZGVudFRyYW5zZm9ybWVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy9zdHJpcEluZGVudFRyYW5zZm9ybWVyL3N0cmlwSW5kZW50VHJhbnNmb3JtZXIuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvc3JjL3N0cmlwSW5kZW50cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvc3RyaXBJbmRlbnRzL3N0cmlwSW5kZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9zcmMvdHJpbVJlc3VsdFRyYW5zZm9ybWVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL3NyYy90cmltUmVzdWx0VHJhbnNmb3JtZXIvdHJpbVJlc3VsdFRyYW5zZm9ybWVyLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL251bWJlci9pcy1uYW4uanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb21tb24tdGFncy9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2NvbW1vbi10YWdzL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy90YWdnZWRUZW1wbGF0ZUxpdGVyYWwuanMiLCJub2RlX21vZHVsZXMvY29tbW9uLXRhZ3Mvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vbnVtYmVyL2lzLW5hbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jbGFzc29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NyZWF0ZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3R4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kZWZpbmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2h0bWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlcmF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1ncG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXNhcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQta2V5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3N0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1wcmltaXRpdmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubnVtYmVyLmlzLW5hbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZnJlZXplLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvaGV4LXJnYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gudW5pcXdpdGgvaW5kZXguanMiLCJzcmMvZ3JhcGhpY3MvY29sb3JpbmctbWV0aG9kLmpzIiwic3JjL2dyYXBoaWNzL3BhbGV0dGUuanMiLCJzcmMvZ3JhcGhpY3MvcmVuZGVyZXIuanMiLCJzcmMvc3RhdGljL2pzL2luZGV4LmpzIiwic3JjL3N0YXRpYy9qcy91aS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBSXFCLFc7QUFDbkI7Ozs7OztBQU1BLHlCQUE4QjtBQUFBLHNDQUFkLFlBQWM7QUFBZCxrQkFBYztBQUFBOztBQUFBOztBQUM1QjtBQUNBLFFBQUksYUFBYSxNQUFiLElBQXVCLE1BQU0sT0FBTixDQUFjLGFBQWEsQ0FBYixDQUFkLENBQTNCLEVBQTJEO0FBQ3pELHFCQUFlLGFBQWEsQ0FBYixDQUFmO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLLFlBQUwsR0FBb0IsYUFBYSxHQUFiLENBQWlCLFVBQUMsV0FBRCxFQUFpQjtBQUNwRCxhQUFPLE9BQU8sV0FBUCxLQUF1QixVQUF2QixHQUNILGFBREcsR0FFSCxXQUZKO0FBR0QsS0FKbUIsQ0FBcEI7O0FBTUE7QUFDQSxXQUFTLEtBQUssR0FBZCxNQUFTLElBQVQ7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7OzBCQVFjO0FBQUEseUNBQU4sSUFBTTtBQUFOLFlBQU07QUFBQTs7QUFDWjtBQUNBO0FBQ0E7QUFDQSxVQUFJLE9BQU8sS0FBSyxDQUFMLENBQVAsS0FBbUIsVUFBdkIsRUFBbUM7QUFDakMsZUFBTyxLQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsS0FBSyxLQUFMLEVBQTNCLENBQVA7QUFDRDs7QUFFRDtBQUNBLGFBQU8sS0FBSyxrQkFBTCxDQUNMLEtBQUssS0FBTCxHQUFhLE1BQWIsQ0FBb0IsS0FBSyxvQkFBTCxDQUEwQixJQUExQixDQUErQixJQUEvQixFQUFxQyxJQUFyQyxDQUFwQixDQURLLENBQVA7QUFHRDs7QUFFRDs7Ozs7Ozs7Ozs7K0JBUVksVyxFQUFhLFEsRUFBNEI7QUFBQSx5Q0FBZixhQUFlO0FBQWYscUJBQWU7QUFBQTs7QUFDbkQsYUFBTyxLQUFL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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0EsaUJBQUssU0FBTCxDQUFlLFNBQWYsR0FBMkIsZ0JBQWdCLElBQWhCLEVBQXNCLEtBQUssU0FBM0IsQ0FBM0I7QUFDSDs7OzZCQUVJLEMsRUFBRztBQUNKLG1CQUFPLE1BQVAsQ0FBYyxLQUFLLFNBQW5CLEVBQThCLENBQTlCO0FBQ0EsaUJBQUssTUFBTDtBQUNIOzs7dUNBQ2M7QUFDWCxpQkFBSyxTQUFMLENBQWUsc0JBQWYsQ0FBc0MsZ0JBQXRDLEVBQXdELElBQXhELENBQTZELFVBQVMsQ0FBVCxFQUFXO0FBQUE7O0FBQ3BFLGtCQUFFLGdCQUFGLENBQW1CLE9BQW5CLEVBQTRCLGFBQUk7QUFDNUIsc0JBQUUsY0FBRjtBQUNBLHdCQUFJLFFBQVEsRUFBRSxNQUFGLENBQVMsWUFBVCxDQUFzQixxQkFBdEIsQ0FBWjtBQUNBLHdCQUFJLE1BQU0sT0FBSyxTQUFMLENBQWUsY0FBZixDQUE4QixLQUE5QixDQUFWO0FBQ0EsNEJBQVEsR0FBUixDQUFZLEdBQVo7O0FBRUgsaUJBTkQ7QUFPSCxhQVJEO0FBU0g7Ozs7OztBQUdMLE9BQU8sT0FBUCxHQUFpQixFQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBAY2xhc3MgVGVtcGxhdGVUYWdcbiAqIEBjbGFzc2Rlc2MgQ29uc3VtZXMgYSBwaXBlbGluZSBvZiBjb21wb3NlYWJsZSB0cmFuc2Zvcm1lciBwbHVnaW5zIGFuZCBwcm9kdWNlcyBhIHRlbXBsYXRlIHRhZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVtcGxhdGVUYWcge1xuICAvKipcbiAgICogY29uc3RydWN0cyBhIHRlbXBsYXRlIHRhZ1xuICAgKiBAY29uc3RydWN0cyBUZW1wbGF0ZVRhZ1xuICAgKiBAcGFyYW0gIHsuLi5PYmplY3R9IFsuLi50cmFuc2Zvcm1lcnNdIC0gYW4gYXJyYXkgb3IgYXJndW1lbnRzIGxpc3Qgb2YgdHJhbnNmb3JtZXJzXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufSAgICAgICAgICAgICAgICAgICAgLSBhIHRlbXBsYXRlIHRhZ1xuICAgKi9cbiAgY29uc3RydWN0b3IgKC4uLnRyYW5zZm9ybWVycykge1xuICAgIC8vIGlmIGZpcnN0IGFyZ3VtZW50IGlzIGFuIGFycmF5LCBleHRydWRlIGl0IGFzIGEgbGlzdCBvZiB0cmFuc2Zvcm1lcnNcbiAgICBpZiAodHJhbnNmb3JtZXJzLmxlbmd0aCAmJiBBcnJheS5pc0FycmF5KHRyYW5zZm9ybWVyc1swXSkpIHtcbiAgICAgIHRyYW5zZm9ybWVycyA9IHRyYW5zZm9ybWVyc1swXVxuICAgIH1cblxuICAgIC8vIGlmIGFueSB0cmFuc2Zvcm1lcnMgYXJlIGZ1bmN0aW9ucywgdGhpcyBtZWFucyB0aGV5IGFyZSBub3QgaW5pdGlhdGVkIC0gYXV0b21hdGljYWxseSBpbml0aWF0ZSB0aGVtXG4gICAgdGhpcy50cmFuc2Zvcm1lcnMgPSB0cmFuc2Zvcm1lcnMubWFwKCh0cmFuc2Zvcm1lcikgPT4ge1xuICAgICAgcmV0dXJuIHR5cGVvZiB0cmFuc2Zvcm1lciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRyYW5zZm9ybWVyKClcbiAgICAgICAgOiB0cmFuc2Zvcm1lclxuICAgIH0pXG5cbiAgICAvLyByZXR1cm4gYW4gRVMyMDE1IHRlbXBsYXRlIHRhZ1xuICAgIHJldHVybiA6OnRoaXMudGFnXG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBhbGwgdHJhbnNmb3JtZXJzIHRvIGEgdGVtcGxhdGUgbGl0ZXJhbCB0YWdnZWQgd2l0aCB0aGlzIG1ldGhvZC5cbiAgICogSWYgYSBmdW5jdGlvbiBpcyBwYXNzZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LCBhc3N1bWVzIHRoZSBmdW5jdGlvbiBpcyBhIHRlbXBsYXRlIHRhZ1xuICAgKiBhbmQgYXBwbGllcyBpdCB0byB0aGUgdGVtcGxhdGUsIHJldHVybmluZyBhIHRlbXBsYXRlIHRhZy5cbiAgICogQHBhcmFtICB7KEZ1bmN0aW9ufEFycmF5PFN0cmluZz4pfSBhcmdzWzBdIC0gRWl0aGVyIGEgdGVtcGxhdGUgdGFnIG9yIGFuIGFycmF5IGNvbnRhaW5pbmcgdGVtcGxhdGUgc3RyaW5ncyBzZXBhcmF0ZWQgYnkgaWRlbnRpZmllclxuICAgKiBAcGFyYW0gIHsuLi4qfSBbYXJnc1sxXV0gICAgICAgICAgICAgICAgICAgLSBPcHRpb25hbCBsaXN0IG9mIHN1YnN0aXR1dGlvbiB2YWx1ZXMuXG4gICAqIEByZXR1cm4geyhTdHJpbmd8RnVuY3Rpb24pfSAgICAgICAgICAgICAgICAtIEVpdGhlciBhbiBpbnRlcm1lZGlhcnkgdGFnIGZ1bmN0aW9uIG9yIHRoZSByZXN1bHRzIG9mIHByb2Nlc3NpbmcgdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgdGFnICguLi5hcmdzKSB7XG4gICAgLy8gaWYgdGhlIGZpcnN0IGFyZ3VtZW50IHBhc3NlZCBpcyBhIGZ1bmN0aW9uLCBhc3N1bWUgaXQgaXMgYSB0ZW1wbGF0ZSB0YWcgYW5kIHJldHVyblxuICAgIC8vIGFuIGludGVybWVkaWFyeSB0YWcgdGhhdCBwcm9jZXNzZXMgdGhlIHRlbXBsYXRlIHVzaW5nIHRoZSBhZm9yZW1lbnRpb25lZCB0YWcsIHBhc3NpbmcgdGhlXG4gICAgLy8gcmVzdWx0IHRvIG91ciB0YWdcbiAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVyaW1UYWcuYmluZCh0aGlzLCBhcmdzLnNoaWZ0KCkpXG4gICAgfVxuXG4gICAgLy8gZWxzZSwgcmV0dXJuIGEgdHJhbnNmb3JtZWQgZW5kIHJlc3VsdCBvZiBwcm9jZXNzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIG91ciB0YWdcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1FbmRSZXN1bHQoXG4gICAgICBhcmdzLnNoaWZ0KCkucmVkdWNlKHRoaXMucHJvY2Vzc1N1YnN0aXR1dGlvbnMuYmluZCh0aGlzLCBhcmdzKSlcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQW4gaW50ZXJtZWRpYXJ5IHRlbXBsYXRlIHRhZyB0aGF0IHJlY2VpdmVzIGEgdGVtcGxhdGUgdGFnIGFuZCBwYXNzZXMgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIHRoZSByZWNlaXZlZFxuICAgKiB0ZW1wbGF0ZSB0YWcgdG8gb3VyIG93biB0ZW1wbGF0ZSB0YWcuXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSAgICAgICAgbmV4dFRhZyAgICAgICAgICAtIHRoZSByZWNlaXZlZCB0ZW1wbGF0ZSB0YWdcbiAgICogQHBhcmFtICB7QXJyYXk8U3RyaW5nPn0gICB0ZW1wbGF0ZSAgICAgICAgIC0gdGhlIHRlbXBsYXRlIHRvIHByb2Nlc3NcbiAgICogQHBhcmFtICB7Li4uKn0gICAgICAgICAgICAuLi5zdWJzdGl0dXRpb25zIC0gYHN1YnN0aXR1dGlvbnNgIGlzIGFuIGFycmF5IG9mIGFsbCBzdWJzdGl0dXRpb25zIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiBAcmV0dXJuIHsqfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSB0aGUgZmluYWwgcHJvY2Vzc2VkIHZhbHVlXG4gICAqL1xuICBpbnRlcmltVGFnIChwcmV2aW91c1RhZywgdGVtcGxhdGUsIC4uLnN1YnN0aXR1dGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50YWdgJHtwcmV2aW91c1RhZyh0ZW1wbGF0ZSwgLi4uc3Vic3RpdHV0aW9ucyl9YFxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGJ1bGsgcHJvY2Vzc2luZyBvbiB0aGUgdGFnZ2VkIHRlbXBsYXRlLCB0cmFuc2Zvcm1pbmcgZWFjaCBzdWJzdGl0dXRpb24gYW5kIHRoZW5cbiAgICogY29uY2F0ZW5hdGluZyB0aGUgcmVzdWx0aW5nIHZhbHVlcyBpbnRvIGEgc3RyaW5nLlxuICAgKiBAcGFyYW0gIHtBcnJheTwqPn0gc3Vic3RpdHV0aW9ucyAtIGFuIGFycmF5IG9mIGFsbCByZW1haW5pbmcgc3Vic3RpdHV0aW9ucyBwcmVzZW50IGluIHRoaXMgdGVtcGxhdGVcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgIHJlc3VsdFNvRmFyICAgLSB0aGlzIGl0ZXJhdGlvbidzIHJlc3VsdCBzdHJpbmcgc28gZmFyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICByZW1haW5pbmdQYXJ0IC0gdGhlIHRlbXBsYXRlIGNodW5rIGFmdGVyIHRoZSBjdXJyZW50IHN1YnN0aXR1dGlvblxuICAgKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgICAgICAgICAgICAtIHRoZSByZXN1bHQgb2Ygam9pbmluZyB0aGlzIGl0ZXJhdGlvbidzIHByb2Nlc3NlZCBzdWJzdGl0dXRpb24gd2l0aCB0aGUgcmVzdWx0XG4gICAqL1xuICBwcm9jZXNzU3Vic3RpdHV0aW9ucyAoc3Vic3RpdHV0aW9ucywgcmVzdWx0U29GYXIsIHJlbWFpbmluZ1BhcnQpIHtcbiAgICBjb25zdCBzdWJzdGl0dXRpb24gPSB0aGlzLnRyYW5zZm9ybVN1YnN0aXR1dGlvbihcbiAgICAgIHN1YnN0aXR1dGlvbnMuc2hpZnQoKSxcbiAgICAgIHJlc3VsdFNvRmFyXG4gICAgKVxuICAgIHJldHVybiByZXN1bHRTb0ZhciArIHN1YnN0aXR1dGlvbiArIHJlbWFpbmluZ1BhcnRcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGEgc3Vic3RpdHV0aW9uIGlzIGVuY291bnRlcmVkLCBpdGVyYXRlcyB0aHJvdWdoIGVhY2ggdHJhbnNmb3JtZXIgYW5kIGFwcGxpZXMgdGhlIHRyYW5zZm9ybWVyJ3NcbiAgICogYG9uU3Vic3RpdHV0aW9uYCBtZXRob2QgdG8gdGhlIHN1YnN0aXR1dGlvbi5cbiAgICogQHBhcmFtICB7Kn0gICAgICBzdWJzdGl0dXRpb24gLSBUaGUgY3VycmVudCBzdWJzdGl0dXRpb25cbiAgICogQHBhcmFtICB7U3RyaW5nfSByZXN1bHRTb0ZhciAgLSBUaGUgcmVzdWx0IHVwIHRvIGFuZCBleGNsdWRpbmcgdGhpcyBzdWJzdGl0dXRpb24uXG4gICAqIEByZXR1cm4geyp9ICAgICAgICAgICAgICAgICAgIC0gVGhlIGZpbmFsIHJlc3VsdCBvZiBhcHBseWluZyBhbGwgc3Vic3RpdHV0aW9uIHRyYW5zZm9ybWF0aW9ucy5cbiAgICovXG4gIHRyYW5zZm9ybVN1YnN0aXR1dGlvbiAoc3Vic3RpdHV0aW9uLCByZXN1bHRTb0Zhcikge1xuICAgIGNvbnN0IGNiID0gKHJlcywgdHJhbnNmb3JtKSA9PiB0cmFuc2Zvcm0ub25TdWJzdGl0dXRpb25cbiAgICAgID8gdHJhbnNmb3JtLm9uU3Vic3RpdHV0aW9uKHJlcywgcmVzdWx0U29GYXIpXG4gICAgICA6IHJlc1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVycy5yZWR1Y2UoY2IsIHN1YnN0aXR1dGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIGVhY2ggdHJhbnNmb3JtZXIsIGFwcGx5aW5nIHRoZSB0cmFuc2Zvcm1lcidzIGBvbkVuZFJlc3VsdGAgbWV0aG9kIHRvIHRoZVxuICAgKiB0ZW1wbGF0ZSBsaXRlcmFsIGFmdGVyIGFsbCBzdWJzdGl0dXRpb25zIGhhdmUgZmluaXNoZWQgcHJvY2Vzc2luZy5cbiAgICogQHBhcmFtICB7U3RyaW5nfSBlbmRSZXN1bHQgLSBUaGUgcHJvY2Vzc2VkIHRlbXBsYXRlLCBqdXN0IGJlZm9yZSBpdCBpcyByZXR1cm5lZCBmcm9tIHRoZSB0YWdcbiAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgLSBUaGUgZmluYWwgcmVzdWx0cyBvZiBwcm9jZXNzaW5nIGVhY2ggdHJhbnNmb3JtZXJcbiAgICovXG4gIHRyYW5zZm9ybUVuZFJlc3VsdCAoZW5kUmVzdWx0KSB7XG4gICAgY29uc3QgY2IgPSAocmVzLCB0cmFuc2Zvcm0pID0+IHRyYW5zZm9ybS5vbkVuZFJlc3VsdFxuICAgICAgPyB0cmFuc2Zvcm0ub25FbmRSZXN1bHQocmVzKVxuICAgICAgOiByZXNcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lcnMucmVkdWNlKGNiLCBlbmRSZXN1bHQpXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmcm9tICcuL1RlbXBsYXRlVGFnJ1xuIiwiZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi4vaHRtbCdcbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnXG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJ1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcidcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBjb21tYUxpc3RzID0gbmV3IFRlbXBsYXRlVGFnKFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyKHsgc2VwYXJhdG9yOiAnLCcgfSksXG4gIHN0cmlwSW5kZW50VHJhbnNmb3JtZXIsXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuKVxuXG5leHBvcnQgZGVmYXVsdCBjb21tYUxpc3RzXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9jb21tYUxpc3RzJ1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZydcbmltcG9ydCBzdHJpcEluZGVudFRyYW5zZm9ybWVyIGZyb20gJy4uL3N0cmlwSW5kZW50VHJhbnNmb3JtZXInXG5pbXBvcnQgaW5saW5lQXJyYXlUcmFuc2Zvcm1lciBmcm9tICcuLi9pbmxpbmVBcnJheVRyYW5zZm9ybWVyJ1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInXG5cbmNvbnN0IGNvbW1hTGlzdHNBbmQgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIoeyBzZXBhcmF0b3I6ICcsJywgY29uanVuY3Rpb246ICdhbmQnIH0pLFxuICBzdHJpcEluZGVudFRyYW5zZm9ybWVyLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXJcbilcblxuZXhwb3J0IGRlZmF1bHQgY29tbWFMaXN0c0FuZFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vY29tbWFMaXN0c0FuZCdcbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnXG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJ1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcidcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBjb21tYUxpc3RzT3IgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIoeyBzZXBhcmF0b3I6ICcsJywgY29uanVuY3Rpb246ICdvcicgfSksXG4gIHN0cmlwSW5kZW50VHJhbnNmb3JtZXIsXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuKVxuXG5leHBvcnQgZGVmYXVsdCBjb21tYUxpc3RzT3JcbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmcm9tICcuL2NvbW1hTGlzdHNPcidcbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnXG5pbXBvcnQgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lciBmcm9tICcuLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJ1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcidcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuaW1wb3J0IHNwbGl0U3RyaW5nVHJhbnNmb3JtZXIgZnJvbSAnLi4vc3BsaXRTdHJpbmdUcmFuc2Zvcm1lcidcbmltcG9ydCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyIGZyb20gJy4uL3JlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXInXG5cbmNvbnN0IGh0bWwgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIHNwbGl0U3RyaW5nVHJhbnNmb3JtZXIoJ1xcbicpLFxuICByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyLFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyLFxuICBzdHJpcEluZGVudFRyYW5zZm9ybWVyLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXJcbilcblxuZXhwb3J0IGRlZmF1bHQgaHRtbFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vaHRtbCdcbiIsIid1c2Ugc3RyaWN0J1xuXG4vLyBjb3JlXG5leHBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi9UZW1wbGF0ZVRhZydcblxuLy8gdHJhbnNmb3JtZXJzXG5leHBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuZXhwb3J0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXIgZnJvbSAnLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJ1xuZXhwb3J0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuL3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcidcbmV4cG9ydCByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIgZnJvbSAnLi9yZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXInXG5leHBvcnQgaW5saW5lQXJyYXlUcmFuc2Zvcm1lciBmcm9tICcuL2lubGluZUFycmF5VHJhbnNmb3JtZXInXG5leHBvcnQgc3BsaXRTdHJpbmdUcmFuc2Zvcm1lciBmcm9tICcuL3NwbGl0U3RyaW5nVHJhbnNmb3JtZXInXG5leHBvcnQgcmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lciBmcm9tICcuL3JlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXInXG5cbi8vIHRhZ3NcbmV4cG9ydCBjb21tYUxpc3RzIGZyb20gJy4vY29tbWFMaXN0cydcbmV4cG9ydCBjb21tYUxpc3RzQW5kIGZyb20gJy4vY29tbWFMaXN0c0FuZCdcbmV4cG9ydCBjb21tYUxpc3RzT3IgZnJvbSAnLi9jb21tYUxpc3RzT3InXG5leHBvcnQgaHRtbCBmcm9tICcuL2h0bWwnXG5leHBvcnQgY29kZUJsb2NrIGZyb20gJy4vY29kZUJsb2NrJ1xuZXhwb3J0IHNvdXJjZSBmcm9tICcuL3NvdXJjZSdcbmV4cG9ydCBzYWZlSHRtbCBmcm9tICcuL3NhZmVIdG1sJ1xuZXhwb3J0IG9uZUxpbmUgZnJvbSAnLi9vbmVMaW5lJ1xuZXhwb3J0IG9uZUxpbmVUcmltIGZyb20gJy4vb25lTGluZVRyaW0nXG5leHBvcnQgb25lTGluZUNvbW1hTGlzdHMgZnJvbSAnLi9vbmVMaW5lQ29tbWFMaXN0cydcbmV4cG9ydCBvbmVMaW5lQ29tbWFMaXN0c09yIGZyb20gJy4vb25lTGluZUNvbW1hTGlzdHNPcidcbmV4cG9ydCBvbmVMaW5lQ29tbWFMaXN0c0FuZCBmcm9tICcuL29uZUxpbmVDb21tYUxpc3RzQW5kJ1xuZXhwb3J0IGlubGluZUxpc3RzIGZyb20gJy4vaW5saW5lTGlzdHMnXG5leHBvcnQgb25lTGluZUlubGluZUxpc3RzIGZyb20gJy4vb25lTGluZUlubGluZUxpc3RzJ1xuZXhwb3J0IHN0cmlwSW5kZW50IGZyb20gJy4vc3RyaXBJbmRlbnQnXG5leHBvcnQgc3RyaXBJbmRlbnRzIGZyb20gJy4vc3RyaXBJbmRlbnRzJ1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcidcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgc2VwYXJhdG9yOiAnJyxcbiAgY29uanVuY3Rpb246ICcnLFxuICBzZXJpYWw6IGZhbHNlXG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYXJyYXkgc3Vic3RpdHV0aW9uIHRvIGEgc3RyaW5nIGNvbnRhaW5pbmcgYSBsaXN0XG4gKiBAcGFyYW0gIHtTdHJpbmd9IFtvcHRzLnNlcGFyYXRvciA9ICcnXSAtIHRoZSBjaGFyYWN0ZXIgdGhhdCBzZXBhcmF0ZXMgZWFjaCBpdGVtXG4gKiBAcGFyYW0gIHtTdHJpbmd9IFtvcHRzLmNvbmp1bmN0aW9uID0gJyddICAtIHJlcGxhY2UgdGhlIGxhc3Qgc2VwYXJhdG9yIHdpdGggdGhpc1xuICogQHBhcmFtICB7Qm9vbGVhbn0gW29wdHMuc2VyaWFsID0gZmFsc2VdIC0gaW5jbHVkZSB0aGUgc2VwYXJhdG9yIGJlZm9yZSB0aGUgY29uanVuY3Rpb24/IChPeGZvcmQgY29tbWEgdXNlLWNhc2UpXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICAgICAgICAgIC0gYSBUZW1wbGF0ZVRhZyB0cmFuc2Zvcm1lclxuICovXG5jb25zdCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyID0gKG9wdHMgPSBkZWZhdWx0cykgPT4gKHtcbiAgb25TdWJzdGl0dXRpb24gKHN1YnN0aXR1dGlvbiwgcmVzdWx0U29GYXIpIHtcbiAgICAvLyBvbmx5IG9wZXJhdGUgb24gYXJyYXlzXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3Vic3RpdHV0aW9uKSkge1xuICAgICAgY29uc3Qgc2VwYXJhdG9yID0gb3B0cy5zZXBhcmF0b3JcbiAgICAgIGNvbnN0IGNvbmp1bmN0aW9uID0gb3B0cy5jb25qdW5jdGlvblxuICAgICAgY29uc3Qgc2VyaWFsID0gb3B0cy5zZXJpYWxcbiAgICAgIC8vIGpvaW4gZWFjaCBpdGVtIGluIHRoZSBhcnJheSBpbnRvIGEgc3RyaW5nIHdoZXJlIGVhY2ggaXRlbSBpcyBzZXBhcmF0ZWQgYnkgc2VwYXJhdG9yXG4gICAgICAvLyBiZSBzdXJlIHRvIG1haW50YWluIGluZGVudGF0aW9uXG4gICAgICBjb25zdCBpbmRlbnQgPSByZXN1bHRTb0Zhci5tYXRjaCgvKFxccyspJC8pXG4gICAgICBpZiAoaW5kZW50KSB7XG4gICAgICAgIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbi5qb2luKHNlcGFyYXRvciArIGluZGVudFsxXSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbi5qb2luKHNlcGFyYXRvciArICcgJylcbiAgICAgIH1cbiAgICAgIC8vIGlmIGNvbmp1bmN0aW9uIGlzIHNldCwgcmVwbGFjZSB0aGUgbGFzdCBzZXBhcmF0b3Igd2l0aCBjb25qdW5jdGlvblxuICAgICAgaWYgKGNvbmp1bmN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNlcGFyYXRvckluZGV4ID0gc3Vic3RpdHV0aW9uLmxhc3RJbmRleE9mKHNlcGFyYXRvcilcbiAgICAgICAgc3Vic3RpdHV0aW9uID0gc3Vic3RpdHV0aW9uXG4gICAgICAgICAgLnN1YnN0cigwLCBzZXBhcmF0b3JJbmRleCkgKyAoc2VyaWFsID8gc2VwYXJhdG9yIDogJycpICsgJyAnICtcbiAgICAgICAgICAgIGNvbmp1bmN0aW9uICsgc3Vic3RpdHV0aW9uLnN1YnN0cihzZXBhcmF0b3JJbmRleCArIDEpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWJzdGl0dXRpb25cbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgaW5saW5lQXJyYXlUcmFuc2Zvcm1lclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vaW5saW5lTGlzdHMnXG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJ1xuaW1wb3J0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXIgZnJvbSAnLi4vc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcidcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInXG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcidcblxuY29uc3QgaW5saW5lTGlzdHMgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIsXG4gIHN0cmlwSW5kZW50VHJhbnNmb3JtZXIsXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuKVxuXG5leHBvcnQgZGVmYXVsdCBpbmxpbmVMaXN0c1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vb25lTGluZSdcbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnXG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcidcbmltcG9ydCByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBvbmVMaW5lID0gbmV3IFRlbXBsYXRlVGFnKFxuICByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIoLyg/OlxccyspL2csICcgJyksXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuKVxuXG5leHBvcnQgZGVmYXVsdCBvbmVMaW5lXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9vbmVMaW5lQ29tbWFMaXN0cydcbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnXG5pbXBvcnQgaW5saW5lQXJyYXlUcmFuc2Zvcm1lciBmcm9tICcuLi9pbmxpbmVBcnJheVRyYW5zZm9ybWVyJ1xuaW1wb3J0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi90cmltUmVzdWx0VHJhbnNmb3JtZXInXG5pbXBvcnQgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcidcblxuY29uc3Qgb25lTGluZUNvbW1hTGlzdHMgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIGlubGluZUFycmF5VHJhbnNmb3JtZXIoeyBzZXBhcmF0b3I6ICcsJyB9KSxcbiAgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyKC8oPzpcXHMrKS9nLCAnICcpLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXJcbilcblxuZXhwb3J0IGRlZmF1bHQgb25lTGluZUNvbW1hTGlzdHNcbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmcm9tICcuL29uZUxpbmVDb21tYUxpc3RzQW5kJ1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZydcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInXG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcidcbmltcG9ydCByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBvbmVMaW5lQ29tbWFMaXN0c0FuZCA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgaW5saW5lQXJyYXlUcmFuc2Zvcm1lcih7IHNlcGFyYXRvcjogJywnLCBjb25qdW5jdGlvbjogJ2FuZCcgfSksXG4gIHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lcigvKD86XFxzKykvZywgJyAnKSxcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyXG4pXG5cbmV4cG9ydCBkZWZhdWx0IG9uZUxpbmVDb21tYUxpc3RzQW5kXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9vbmVMaW5lQ29tbWFMaXN0c09yJ1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmltcG9ydCBUZW1wbGF0ZVRhZyBmcm9tICcuLi9UZW1wbGF0ZVRhZydcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInXG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcidcbmltcG9ydCByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBvbmVMaW5lQ29tbWFMaXN0c09yID0gbmV3IFRlbXBsYXRlVGFnKFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyKHsgc2VwYXJhdG9yOiAnLCcsIGNvbmp1bmN0aW9uOiAnb3InIH0pLFxuICByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIoLyg/OlxccyspL2csICcgJyksXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuKVxuXG5leHBvcnQgZGVmYXVsdCBvbmVMaW5lQ29tbWFMaXN0c09yXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9vbmVMaW5lSW5saW5lTGlzdHMnXG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJ1xuaW1wb3J0IGlubGluZUFycmF5VHJhbnNmb3JtZXIgZnJvbSAnLi4vaW5saW5lQXJyYXlUcmFuc2Zvcm1lcidcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuaW1wb3J0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciBmcm9tICcuLi9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXInXG5cbmNvbnN0IG9uZUxpbmVJbmxpbmVMaXN0cyA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgaW5saW5lQXJyYXlUcmFuc2Zvcm1lcixcbiAgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyKC8oPzpcXHMrKS9nLCAnICcpLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXJcbilcblxuZXhwb3J0IGRlZmF1bHQgb25lTGluZUlubGluZUxpc3RzXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9vbmVMaW5lVHJpbSdcbiIsIid1c2Ugc3RyaWN0J1xuXG5pbXBvcnQgVGVtcGxhdGVUYWcgZnJvbSAnLi4vVGVtcGxhdGVUYWcnXG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcidcbmltcG9ydCByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBvbmVMaW5lVHJpbSA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgcmVwbGFjZVJlc3VsdFRyYW5zZm9ybWVyKC8oPzpcXG5cXHMrKS9nLCAnJyksXG4gIHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuKVxuXG5leHBvcnQgZGVmYXVsdCBvbmVMaW5lVHJpbVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vcmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lcidcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBpc1ZhbGlkVmFsdWUgPSAoeCkgPT5cbiAgeCAhPSBudWxsICYmXG4gICFOdW1iZXIuaXNOYU4oeCkgJiZcbiAgdHlwZW9mIHggIT09ICdib29sZWFuJ1xuXG5jb25zdCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyID0gKCkgPT4gKHtcbiAgb25TdWJzdGl0dXRpb24gKHN1YnN0aXR1dGlvbikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHN1YnN0aXR1dGlvbikpIHtcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24uZmlsdGVyKGlzVmFsaWRWYWx1ZSlcbiAgICB9XG4gICAgaWYgKGlzVmFsaWRWYWx1ZShzdWJzdGl0dXRpb24pKSB7XG4gICAgICByZXR1cm4gc3Vic3RpdHV0aW9uXG4gICAgfVxuICAgIHJldHVybiAnJ1xuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9yZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXInXG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBSZXBsYWNlcyB0YWJzLCBuZXdsaW5lcyBhbmQgc3BhY2VzIHdpdGggdGhlIGNob3NlbiB2YWx1ZSB3aGVuIHRoZXkgb2NjdXIgaW4gc2VxdWVuY2VzXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cCl9IHJlcGxhY2VXaGF0IC0gdGhlIHZhbHVlIG9yIHBhdHRlcm4gdGhhdCBzaG91bGQgYmUgcmVwbGFjZWRcbiAqIEBwYXJhbSAgeyp9ICAgICAgICAgICAgICAgcmVwbGFjZVdpdGggLSB0aGUgcmVwbGFjZW1lbnQgdmFsdWVcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgICAgICAgICAgICAgLSBhIFRlbXBsYXRlVGFnIHRyYW5zZm9ybWVyXG4gKi9cbmNvbnN0IHJlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciA9IChyZXBsYWNlV2hhdCwgcmVwbGFjZVdpdGgpID0+ICh7XG4gIG9uRW5kUmVzdWx0IChlbmRSZXN1bHQpIHtcbiAgICBpZiAocmVwbGFjZVdoYXQgPT0gbnVsbCB8fCByZXBsYWNlV2l0aCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcGxhY2VSZXN1bHRUcmFuc2Zvcm1lciByZXF1aXJlcyBhdCBsZWFzdCAyIGFyZ3VtZW50cy4nKVxuICAgIH1cbiAgICByZXR1cm4gZW5kUmVzdWx0LnJlcGxhY2UocmVwbGFjZVdoYXQsIHJlcGxhY2VXaXRoKVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByZXBsYWNlUmVzdWx0VHJhbnNmb3JtZXJcbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmcm9tICcuL3JlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcidcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIgPSAocmVwbGFjZVdoYXQsIHJlcGxhY2VXaXRoKSA9PiAoe1xuICBvblN1YnN0aXR1dGlvbiAoc3Vic3RpdHV0aW9uLCByZXN1bHRTb0Zhcikge1xuICAgIGlmIChyZXBsYWNlV2hhdCA9PSBudWxsIHx8IHJlcGxhY2VXaXRoID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyIHJlcXVpcmVzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG4gICAgfVxuXG4gICAgLy8gRG8gbm90IHRvdWNoIGlmIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgaWYgKHN1YnN0aXR1dGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3Vic3RpdHV0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24udG9TdHJpbmcoKS5yZXBsYWNlKHJlcGxhY2VXaGF0LCByZXBsYWNlV2l0aClcbiAgICB9XG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vc2FmZUh0bWwnXG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJ1xuaW1wb3J0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXIgZnJvbSAnLi4vc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcidcbmltcG9ydCBpbmxpbmVBcnJheVRyYW5zZm9ybWVyIGZyb20gJy4uL2lubGluZUFycmF5VHJhbnNmb3JtZXInXG5pbXBvcnQgdHJpbVJlc3VsdFRyYW5zZm9ybWVyIGZyb20gJy4uL3RyaW1SZXN1bHRUcmFuc2Zvcm1lcidcbmltcG9ydCBzcGxpdFN0cmluZ1RyYW5zZm9ybWVyIGZyb20gJy4uL3NwbGl0U3RyaW5nVHJhbnNmb3JtZXInXG5pbXBvcnQgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyIGZyb20gJy4uL3JlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcidcblxuY29uc3Qgc2FmZUh0bWwgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIHNwbGl0U3RyaW5nVHJhbnNmb3JtZXIoJ1xcbicpLFxuICBpbmxpbmVBcnJheVRyYW5zZm9ybWVyLFxuICBzdHJpcEluZGVudFRyYW5zZm9ybWVyLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXIsXG4gIHJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcigvJi9nLCAnJmFtcDsnKSxcbiAgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyKC88L2csICcmbHQ7JyksXG4gIHJlcGxhY2VTdWJzdGl0dXRpb25UcmFuc2Zvcm1lcigvPi9nLCAnJmd0OycpLFxuICByZXBsYWNlU3Vic3RpdHV0aW9uVHJhbnNmb3JtZXIoL1wiL2csICcmcXVvdDsnKSxcbiAgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyKC8nL2csICcmI3gyNzsnKSxcbiAgcmVwbGFjZVN1YnN0aXR1dGlvblRyYW5zZm9ybWVyKC9gL2csICcmI3g2MDsnKVxuKVxuXG5leHBvcnQgZGVmYXVsdCBzYWZlSHRtbFxuIiwiZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi4vaHRtbCdcbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmcm9tICcuL3NwbGl0U3RyaW5nVHJhbnNmb3JtZXInXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3Qgc3BsaXRTdHJpbmdUcmFuc2Zvcm1lciA9IChzcGxpdEJ5KSA9PiAoe1xuICBvblN1YnN0aXR1dGlvbiAoc3Vic3RpdHV0aW9uLCByZXN1bHRTb0Zhcikge1xuICAgIGlmIChzcGxpdEJ5ICE9IG51bGwgJiYgdHlwZW9mIHNwbGl0QnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAodHlwZW9mIHN1YnN0aXR1dGlvbiA9PT0gJ3N0cmluZycgJiYgc3Vic3RpdHV0aW9uLmluY2x1ZGVzKHNwbGl0QnkpKSB7XG4gICAgICAgIHN1YnN0aXR1dGlvbiA9IHN1YnN0aXR1dGlvbi5zcGxpdChzcGxpdEJ5KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgYSBzdHJpbmcgY2hhcmFjdGVyIHRvIHNwbGl0IGJ5LicpXG4gICAgfVxuICAgIHJldHVybiBzdWJzdGl0dXRpb25cbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgc3BsaXRTdHJpbmdUcmFuc2Zvcm1lclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGZyb20gJy4vc3RyaXBJbmRlbnQnXG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJ1xuaW1wb3J0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXIgZnJvbSAnLi4vc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcidcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBzdHJpcEluZGVudCA9IG5ldyBUZW1wbGF0ZVRhZyhcbiAgc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcixcbiAgdHJpbVJlc3VsdFRyYW5zZm9ybWVyXG4pXG5cbmV4cG9ydCBkZWZhdWx0IHN0cmlwSW5kZW50XG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9zdHJpcEluZGVudFRyYW5zZm9ybWVyJ1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogc3RyaXBzIGluZGVudGF0aW9uIGZyb20gYSB0ZW1wbGF0ZSBsaXRlcmFsXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGUgPSAnaW5pdGlhbCcgLSB3aGV0aGVyIHRvIHJlbW92ZSBhbGwgaW5kZW50YXRpb24gb3IganVzdCBsZWFkaW5nIGluZGVudGF0aW9uLiBjYW4gYmUgJ2FsbCcgb3IgJ2luaXRpYWwnXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICAgICAgICAgLSBhIFRlbXBsYXRlVGFnIHRyYW5zZm9ybWVyXG4gKi9cbmNvbnN0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXIgPSAodHlwZSA9ICdpbml0aWFsJykgPT4gKHtcbiAgb25FbmRSZXN1bHQgKGVuZFJlc3VsdCkge1xuICAgIGlmICh0eXBlID09PSAnaW5pdGlhbCcpIHtcbiAgICAgIC8vIHJlbW92ZSB0aGUgc2hvcnRlc3QgbGVhZGluZyBpbmRlbnRhdGlvbiBmcm9tIGVhY2ggbGluZVxuICAgICAgY29uc3QgbWF0Y2ggPSBlbmRSZXN1bHQubWF0Y2goL15bIFxcdF0qKD89XFxTKS9nbSlcbiAgICAgIC8vIHJldHVybiBlYXJseSBpZiB0aGVyZSdzIG5vdGhpbmcgdG8gc3RyaXBcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZW5kUmVzdWx0XG4gICAgICB9XG4gICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLm1pbiguLi5tYXRjaC5tYXAoZWwgPT4gZWwubGVuZ3RoKSlcbiAgICAgIGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ15bIFxcXFx0XXsnICsgaW5kZW50ICsgJ30nLCAnZ20nKVxuICAgICAgZW5kUmVzdWx0ID0gaW5kZW50ID4gMCA/IGVuZFJlc3VsdC5yZXBsYWNlKHJlZ2V4cCwgJycpIDogZW5kUmVzdWx0XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnYWxsJykge1xuICAgICAgLy8gcmVtb3ZlIGFsbCBpbmRlbnRhdGlvbiBmcm9tIGVhY2ggbGluZVxuICAgICAgZW5kUmVzdWx0ID0gZW5kUmVzdWx0LnNwbGl0KCdcXG4nKS5tYXAobGluZSA9PiBsaW5lLnRyaW1MZWZ0KCkpLmpvaW4oJ1xcbicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0eXBlOiAke3R5cGV9YClcbiAgICB9XG4gICAgcmV0dXJuIGVuZFJlc3VsdFxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpcEluZGVudFRyYW5zZm9ybWVyXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi9zdHJpcEluZGVudHMnXG4iLCIndXNlIHN0cmljdCdcblxuaW1wb3J0IFRlbXBsYXRlVGFnIGZyb20gJy4uL1RlbXBsYXRlVGFnJ1xuaW1wb3J0IHN0cmlwSW5kZW50VHJhbnNmb3JtZXIgZnJvbSAnLi4vc3RyaXBJbmRlbnRUcmFuc2Zvcm1lcidcbmltcG9ydCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgZnJvbSAnLi4vdHJpbVJlc3VsdFRyYW5zZm9ybWVyJ1xuXG5jb25zdCBzdHJpcEluZGVudHMgPSBuZXcgVGVtcGxhdGVUYWcoXG4gIHN0cmlwSW5kZW50VHJhbnNmb3JtZXIoJ2FsbCcpLFxuICB0cmltUmVzdWx0VHJhbnNmb3JtZXJcbilcblxuZXhwb3J0IGRlZmF1bHQgc3RyaXBJbmRlbnRzXG4iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnJvbSAnLi90cmltUmVzdWx0VHJhbnNmb3JtZXInXG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBUZW1wbGF0ZVRhZyB0cmFuc2Zvcm1lciB0aGF0IHRyaW1zIHdoaXRlc3BhY2Ugb24gdGhlIGVuZCByZXN1bHQgb2YgYSB0YWdnZWQgdGVtcGxhdGVcbiAqIEBwYXJhbSAge1N0cmluZ30gc2lkZSA9ICcnIC0gVGhlIHNpZGUgb2YgdGhlIHN0cmluZyB0byB0cmltLiBDYW4gYmUgJ2xlZnQnIG9yICdyaWdodCdcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgIC0gYSBUZW1wbGF0ZVRhZyB0cmFuc2Zvcm1lclxuICovXG5jb25zdCB0cmltUmVzdWx0VHJhbnNmb3JtZXIgPSAoc2lkZSA9ICcnKSA9PiAoe1xuICBvbkVuZFJlc3VsdCAoZW5kUmVzdWx0KSB7XG4gICAgc2lkZSA9IHNpZGUudG9Mb3dlckNhc2UoKVxuICAgIC8vIHVwcGVyY2FzZSB0aGUgZmlyc3QgbGV0dGVyIG9mIHNpZGUgdmFsdWVcbiAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnIHx8IHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgIHNpZGUgPSBzaWRlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc2lkZS5zbGljZSgxKVxuICAgIH0gZWxzZSBpZiAoc2lkZSAhPT0gJycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU2lkZSBub3Qgc3VwcG9ydGVkOiAke3NpZGV9YClcbiAgICB9XG4gICAgcmV0dXJuIGVuZFJlc3VsdFtgdHJpbSR7c2lkZX1gXSgpXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IHRyaW1SZXN1bHRUcmFuc2Zvcm1lclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb21cIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vbnVtYmVyL2lzLW5hblwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2RlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZpbmVQcm9wZXJ0eSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAoMCwgX2RlZmluZVByb3BlcnR5Mi5kZWZhdWx0KSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2RlZmluZVByb3BlcnRpZXMgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXNcIik7XG5cbnZhciBfZGVmaW5lUHJvcGVydGllczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZpbmVQcm9wZXJ0aWVzKTtcblxudmFyIF9mcmVlemUgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9vYmplY3QvZnJlZXplXCIpO1xuXG52YXIgX2ZyZWV6ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9mcmVlemUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc3RyaW5ncywgcmF3KSB7XG4gIHJldHVybiAoMCwgX2ZyZWV6ZTIuZGVmYXVsdCkoKDAsIF9kZWZpbmVQcm9wZXJ0aWVzMi5kZWZhdWx0KShzdHJpbmdzLCB7XG4gICAgcmF3OiB7XG4gICAgICB2YWx1ZTogKDAsIF9mcmVlemUyLmRlZmF1bHQpKHJhdylcbiAgICB9XG4gIH0pKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZnJvbSA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL2FycmF5L2Zyb21cIik7XG5cbnZhciBfZnJvbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9mcm9tKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgYXJyMltpXSA9IGFycltpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyMjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKDAsIF9mcm9tMi5kZWZhdWx0KShhcnIpO1xuICB9XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuQXJyYXkuZnJvbTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5udW1iZXIuaXMtbmFuJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5OdW1iZXIuaXNOYU47IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoVCwgRCl7XG4gIHJldHVybiAkT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVCwgRCk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYyl7XG4gIHJldHVybiAkT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2MpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZnJlZXplJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3QuZnJlZXplOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgdG9MZW5ndGggID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCB0b0luZGV4ICAgPSByZXF1aXJlKCcuL190by1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9IHRvSU9iamVjdCgkdGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpXG4gICAgICAsIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICBpZih2YWx1ZSAhPSB2YWx1ZSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSN0b0luZGV4IGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTsiLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpXG4gICwgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi40LjAnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXHJcbiAgLCBjcmVhdGVEZXNjICAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgaW5kZXgsIHZhbHVlKXtcclxuICBpZihpbmRleCBpbiBvYmplY3QpJGRlZmluZVByb3BlcnR5LmYob2JqZWN0LCBpbmRleCwgY3JlYXRlRGVzYygwLCB2YWx1ZSkpO1xyXG4gIGVsc2Ugb2JqZWN0W2luZGV4XSA9IHZhbHVlO1xyXG59OyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXHJcbm1vZHVsZS5leHBvcnRzID0gKFxyXG4gICdjb25zdHJ1Y3RvcixoYXNPd25Qcm9wZXJ0eSxpc1Byb3RvdHlwZU9mLHByb3BlcnR5SXNFbnVtZXJhYmxlLHRvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnXHJcbikuc3BsaXQoJywnKTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCBJU19XUkFQICAgPSB0eXBlICYgJGV4cG9ydC5XXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgZXhwUHJvdG8gID0gZXhwb3J0c1tQUk9UT1RZUEVdXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBrZXksIG93biwgb3V0O1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24oQyl7XG4gICAgICB2YXIgRiA9IGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQyl7XG4gICAgICAgICAgc3dpdGNoKGFyZ3VtZW50cy5sZW5ndGgpe1xuICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gbmV3IEM7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBuZXcgQyhhKTtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIG5ldyBDKGEsIGIpO1xuICAgICAgICAgIH0gcmV0dXJuIG5ldyBDKGEsIGIsIGMpO1xuICAgICAgICB9IHJldHVybiBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5tZXRob2RzLiVOQU1FJVxuICAgIGlmKElTX1BST1RPKXtcbiAgICAgIChleHBvcnRzLnZpcnR1YWwgfHwgKGV4cG9ydHMudmlydHVhbCA9IHt9KSlba2V5XSA9IG91dDtcbiAgICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5wcm90b3R5cGUuJU5BTUUlXG4gICAgICBpZih0eXBlICYgJGV4cG9ydC5SICYmIGV4cFByb3RvICYmICFleHBQcm90b1trZXldKWhpZGUoZXhwUHJvdG8sIGtleSwgb3V0KTtcbiAgICB9XG4gIH1cbn07XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgIFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTsiLCJ2YXIgZFAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiBkUC5mKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7IiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xyXG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcclxufSk7IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwiLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxudmFyIEl0ZXJhdG9ycyAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZSAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY3JlYXRlJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4vX29iamVjdC1ncG8nKVxuICAsIElURVJBVE9SICAgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCAkZW50cmllcyAgID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZFxuICAgICwgJGFueU5hdGl2ZSA9IE5BTUUgPT0gJ0FycmF5JyA/IHByb3RvLmVudHJpZXMgfHwgJG5hdGl2ZSA6ICRuYXRpdmVcbiAgICAsIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJGFueU5hdGl2ZSl7XG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZigkYW55TmF0aXZlLmNhbGwobmV3IEJhc2UpKTtcbiAgICBpZihJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSl7XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAgIC8vIGZpeCBmb3Igc29tZSBvbGQgZW5naW5lc1xuICAgICAgaWYoIUxJQlJBUlkgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZihERUZfVkFMVUVTICYmICRuYXRpdmUgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKXtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6ICBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICRlbnRyaWVzXG4gICAgfTtcbiAgICBpZihGT1JDRUQpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSlyZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59OyIsInZhciBJVEVSQVRPUiAgICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMsIHNraXBDbG9zaW5nKXtcbiAgaWYoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgcmV0dXJuIHtkb25lOiBzYWZlID0gdHJ1ZX07IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7IiwidmFyIE1FVEEgICAgID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKVxuICAsIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBoYXMgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgc2V0RGVzYyAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mXG4gICwgaWQgICAgICAgPSAwO1xudmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24oaXQpe1xuICBzZXREZXNjKGl0LCBNRVRBLCB7dmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9fSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbihpdCwgY3JlYXRlKXtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZighaXNPYmplY3QoaXQpKXJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmKCFoYXMoaXQsIE1FVEEpKXtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmKCFpc0V4dGVuc2libGUoaXQpKXJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZighY3JlYXRlKXJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIG9iamVjdCBJRFxuICB9IHJldHVybiBpdFtNRVRBXS5pO1xufTtcbnZhciBnZXRXZWFrID0gZnVuY3Rpb24oaXQsIGNyZWF0ZSl7XG4gIGlmKCFoYXMoaXQsIE1FVEEpKXtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmKCFpc0V4dGVuc2libGUoaXQpKXJldHVybiB0cnVlO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKXNldE1ldGEoaXQpO1xuICByZXR1cm4gaXQ7XG59O1xudmFyIG1ldGEgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgS0VZOiAgICAgIE1FVEEsXG4gIE5FRUQ6ICAgICBmYWxzZSxcbiAgZmFzdEtleTogIGZhc3RLZXksXG4gIGdldFdlYWs6ICBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07IiwiLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXHJcbnZhciBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXHJcbiAgLCBkUHMgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKVxyXG4gICwgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJylcclxuICAsIElFX1BST1RPICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpXHJcbiAgLCBFbXB0eSAgICAgICA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH1cclxuICAsIFBST1RPVFlQRSAgID0gJ3Byb3RvdHlwZSc7XHJcblxyXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXHJcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24oKXtcclxuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xyXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpXHJcbiAgICAsIGkgICAgICA9IGVudW1CdWdLZXlzLmxlbmd0aFxyXG4gICAgLCBndCAgICAgPSAnPidcclxuICAgICwgaWZyYW1lRG9jdW1lbnQ7XHJcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxyXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XHJcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xyXG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XHJcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xyXG4gIGlmcmFtZURvY3VtZW50LndyaXRlKCc8c2NyaXB0PmRvY3VtZW50LkY9T2JqZWN0PC9zY3JpcHQnICsgZ3QpO1xyXG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XHJcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XHJcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xyXG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpe1xyXG4gIHZhciByZXN1bHQ7XHJcbiAgaWYoTyAhPT0gbnVsbCl7XHJcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XHJcbiAgICByZXN1bHQgPSBuZXcgRW1wdHk7XHJcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcclxuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcclxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xyXG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XHJcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xyXG59OyIsInZhciBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGRQICAgICAgICAgICAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyl7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKU9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07IiwidmFyIGRQICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcclxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcclxuICAsIGdldEtleXMgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKXtcclxuICBhbk9iamVjdChPKTtcclxuICB2YXIga2V5cyAgID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpID0gMFxyXG4gICAgLCBQO1xyXG4gIHdoaWxlKGxlbmd0aCA+IGkpZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcclxuICByZXR1cm4gTztcclxufTsiLCIvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxyXG52YXIgaGFzICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxyXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuL190by1vYmplY3QnKVxyXG4gICwgSUVfUFJPVE8gICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJylcclxuICAsIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uKE8pe1xyXG4gIE8gPSB0b09iamVjdChPKTtcclxuICBpZihoYXMoTywgSUVfUFJPVE8pKXJldHVybiBPW0lFX1BST1RPXTtcclxuICBpZih0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKXtcclxuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcclxuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xyXG59OyIsInZhciBoYXMgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxyXG4gICwgdG9JT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXHJcbiAgLCBhcnJheUluZGV4T2YgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxyXG4gICwgSUVfUFJPVE8gICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIG5hbWVzKXtcclxuICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KG9iamVjdClcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCByZXN1bHQgPSBbXVxyXG4gICAgLCBrZXk7XHJcbiAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xyXG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcclxuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XHJcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59OyIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxyXG52YXIgJGtleXMgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpXHJcbiAgLCBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKXtcclxuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xyXG59OyIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBmYWlscyAgID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBleGVjKXtcbiAgdmFyIGZuICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZXhwID0ge307XG4gIGV4cFtLRVldID0gZXhlYyhmbik7XG4gICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogZmFpbHMoZnVuY3Rpb24oKXsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpOyIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mXG4gICwgaGFzID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTsiLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ2tleXMnKVxyXG4gICwgdWlkICAgID0gcmVxdWlyZSgnLi9fdWlkJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcclxuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xyXG59OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIGRlZmluZWQgICA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbi8vIHRydWUgIC0+IFN0cmluZyNhdFxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRPX1NUUklORyl7XG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xuICAgIHZhciBzID0gU3RyaW5nKGRlZmluZWQodGhhdCkpXG4gICAgICAsIGkgPSB0b0ludGVnZXIocG9zKVxuICAgICAgLCBsID0gcy5sZW5ndGhcbiAgICAgICwgYSwgYjtcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcbiAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgUyl7XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZih0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07IiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07IiwidmFyIHN0b3JlICAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJylcbiAgLCB1aWQgICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJylcbiAgLCBTeW1ib2wgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sXG4gICwgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcblxudmFyICRleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7IiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgIT0gdW5kZWZpbmVkKXJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgdG9PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL190by1vYmplY3QnKVxuICAsIGNhbGwgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciAgICA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgICAgID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCBjcmVhdGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2NyZWF0ZS1wcm9wZXJ0eScpXG4gICwgZ2V0SXRlckZuICAgICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlLyosIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKi8pe1xuICAgIHZhciBPICAgICAgID0gdG9PYmplY3QoYXJyYXlMaWtlKVxuICAgICAgLCBDICAgICAgID0gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheVxuICAgICAgLCBhTGVuICAgID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBtYXBmbiAgID0gYUxlbiA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWRcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgYUxlbiA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQsIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IGNhbGwoaXRlcmF0b3IsIG1hcGZuLCBbc3RlcC52YWx1ZSwgaW5kZXhdLCB0cnVlKSA6IHN0ZXAudmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGluZGV4LCBtYXBwaW5nID8gbWFwZm4oT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuIiwiLy8gMjAuMS4yLjQgTnVtYmVyLmlzTmFOKG51bWJlcilcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5TLCAnTnVtYmVyJywge1xuICBpc05hTjogZnVuY3Rpb24gaXNOYU4obnVtYmVyKXtcbiAgICByZXR1cm4gbnVtYmVyICE9IG51bWJlcjtcbiAgfVxufSk7IiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcclxuLy8gMTkuMS4yLjMgLyAxNS4yLjMuNyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxyXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0Jywge2RlZmluZVByb3BlcnRpZXM6IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKX0pOyIsInZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XHJcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyksICdPYmplY3QnLCB7ZGVmaW5lUHJvcGVydHk6IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZ9KTsiLCIvLyAxOS4xLjIuNSBPYmplY3QuZnJlZXplKE8pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIG1ldGEgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpLm9uRnJlZXplO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2ZyZWV6ZScsIGZ1bmN0aW9uKCRmcmVlemUpe1xuICByZXR1cm4gZnVuY3Rpb24gZnJlZXplKGl0KXtcbiAgICByZXR1cm4gJGZyZWV6ZSAmJiBpc09iamVjdChpdCkgPyAkZnJlZXplKG1ldGEoaXQpKSA6IGl0O1xuICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCAgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGluZGV4ID0gdGhpcy5faVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiB7dmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZX07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7dmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZX07XG59KTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChoZXgpIHtcblx0aWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcblx0fVxuXG5cdGhleCA9IGhleC5yZXBsYWNlKC9eIy8sICcnKTtcblxuXHRpZiAoaGV4Lmxlbmd0aCA9PT0gMykge1xuXHRcdGhleCA9IGhleFswXSArIGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXTtcblx0fVxuXG5cdHZhciBudW0gPSBwYXJzZUludChoZXgsIDE2KTtcblxuXHRyZXR1cm4gW251bSA+PiAxNiwgbnVtID4+IDggJiAyNTUsIG51bSAmIDI1NV07XG59O1xuIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXSc7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmluY2x1ZGVzYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIHNwZWNpZnlpbmcgYW4gaW5kZXggdG8gc2VhcmNoIGZyb20uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IHRhcmdldCBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdGFyZ2V0YCBpcyBmb3VuZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheUluY2x1ZGVzKGFycmF5LCB2YWx1ZSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICByZXR1cm4gISFsZW5ndGggJiYgYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCAwKSA+IC0xO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZSBgYXJyYXlJbmNsdWRlc2AgZXhjZXB0IHRoYXQgaXQgYWNjZXB0cyBhIGNvbXBhcmF0b3IuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IHRhcmdldCBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbXBhcmF0b3IgVGhlIGNvbXBhcmF0b3IgaW52b2tlZCBwZXIgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdGFyZ2V0YCBpcyBmb3VuZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheUluY2x1ZGVzV2l0aChhcnJheSwgdmFsdWUsIGNvbXBhcmF0b3IpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoY29tcGFyYXRvcih2YWx1ZSwgYXJyYXlbaW5kZXhdKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5maW5kSW5kZXhgIGFuZCBgXy5maW5kTGFzdEluZGV4YCB3aXRob3V0XG4gKiBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGZyb21JbmRleCBUaGUgaW5kZXggdG8gc2VhcmNoIGZyb20uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGaW5kSW5kZXgoYXJyYXksIHByZWRpY2F0ZSwgZnJvbUluZGV4LCBmcm9tUmlnaHQpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIGluZGV4ID0gZnJvbUluZGV4ICsgKGZyb21SaWdodCA/IDEgOiAtMSk7XG5cbiAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICBpZiAocHJlZGljYXRlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaW5kZXhPZmAgd2l0aG91dCBgZnJvbUluZGV4YCBib3VuZHMgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gIGlmICh2YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gYmFzZUZpbmRJbmRleChhcnJheSwgYmFzZUlzTmFOLCBmcm9tSW5kZXgpO1xuICB9XG4gIHZhciBpbmRleCA9IGZyb21JbmRleCAtIDEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYU5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbnVtYmVyIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYE5hTmAsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmFOKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdmFsdWU7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGNhY2hlIFRoZSBjYWNoZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBjYWNoZUhhcyhjYWNoZSwga2V5KSB7XG4gIHJldHVybiBjYWNoZS5oYXMoa2V5KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLFxuICAgIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKSxcbiAgICBTZXQgPSBnZXROYXRpdmUocm9vdCwgJ1NldCcpLFxuICAgIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIEhhc2hcbiAqL1xuZnVuY3Rpb24gaGFzaENsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmF0aXZlQ3JlYXRlID8gbmF0aXZlQ3JlYXRlKG51bGwpIDoge307XG59XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICByZXR1cm4gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGFzaEdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAobmF0aXZlQ3JlYXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGRhdGFba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpID8gZGF0YVtrZXldIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIGhhc2ggdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hIYXMoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgcmV0dXJuIG5hdGl2ZUNyZWF0ZSA/IGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkIDogaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIGhhc2ggYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBoYXNoU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBkYXRhW2tleV0gPSAobmF0aXZlQ3JlYXRlICYmIHZhbHVlID09PSB1bmRlZmluZWQpID8gSEFTSF9VTkRFRklORUQgOiB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBIYXNoYC5cbkhhc2gucHJvdG90eXBlLmNsZWFyID0gaGFzaENsZWFyO1xuSGFzaC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gaGFzaERlbGV0ZTtcbkhhc2gucHJvdG90eXBlLmdldCA9IGhhc2hHZXQ7XG5IYXNoLnByb3RvdHlwZS5oYXMgPSBoYXNoSGFzO1xuSGFzaC5wcm90b3R5cGUuc2V0ID0gaGFzaFNldDtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGxpc3QgY2FjaGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBMaXN0Q2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IFtdO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgbGFzdEluZGV4ID0gZGF0YS5sZW5ndGggLSAxO1xuICBpZiAoaW5kZXggPT0gbGFzdEluZGV4KSB7XG4gICAgZGF0YS5wb3AoKTtcbiAgfSBlbHNlIHtcbiAgICBzcGxpY2UuY2FsbChkYXRhLCBpbmRleCwgMSk7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBhc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIGxpc3QgY2FjaGUgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGxpc3QgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIGRhdGEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9IGVsc2Uge1xuICAgIGRhdGFbaW5kZXhdWzFdID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuTGlzdENhY2hlLnByb3RvdHlwZS5jbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuTGlzdENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBsaXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbkxpc3RDYWNoZS5wcm90b3R5cGUuaGFzID0gbGlzdENhY2hlSGFzO1xuTGlzdENhY2hlLnByb3RvdHlwZS5zZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcCBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBNYXBDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA/IGVudHJpZXMubGVuZ3RoIDogMDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBtYXAgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlR2V0KGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmdldChrZXkpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIG1hcCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLnNldChrZXksIHZhbHVlKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG5NYXBDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBtYXBDYWNoZUNsZWFyO1xuTWFwQ2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IG1hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuTWFwQ2FjaGUucHJvdG90eXBlLmhhcyA9IG1hcENhY2hlSGFzO1xuTWFwQ2FjaGUucHJvdG90eXBlLnNldCA9IG1hcENhY2hlU2V0O1xuXG4vKipcbiAqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNhY2hlIG9iamVjdCB0byBzdG9yZSB1bmlxdWUgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXNdIFRoZSB2YWx1ZXMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFNldENhY2hlKHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcyA/IHZhbHVlcy5sZW5ndGggOiAwO1xuXG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGU7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdGhpcy5hZGQodmFsdWVzW2luZGV4XSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzIGB2YWx1ZWAgdG8gdGhlIGFycmF5IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBhZGRcbiAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuICogQGFsaWFzIHB1c2hcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNhY2hlLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlQWRkKHZhbHVlKSB7XG4gIHRoaXMuX19kYXRhX18uc2V0KHZhbHVlLCBIQVNIX1VOREVGSU5FRCk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGluIHRoZSBhcnJheSBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgU2V0Q2FjaGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlSGFzKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh2YWx1ZSk7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTZXRDYWNoZWAuXG5TZXRDYWNoZS5wcm90b3R5cGUuYWRkID0gU2V0Q2FjaGUucHJvdG90eXBlLnB1c2ggPSBzZXRDYWNoZUFkZDtcblNldENhY2hlLnByb3RvdHlwZS5oYXMgPSBzZXRDYWNoZUhhcztcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gKGlzRnVuY3Rpb24odmFsdWUpIHx8IGlzSG9zdE9iamVjdCh2YWx1ZSkpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuaXFCeWAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZV0gVGhlIGl0ZXJhdGVlIGludm9rZWQgcGVyIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29tcGFyYXRvcl0gVGhlIGNvbXBhcmF0b3IgaW52b2tlZCBwZXIgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGR1cGxpY2F0ZSBmcmVlIGFycmF5LlxuICovXG5mdW5jdGlvbiBiYXNlVW5pcShhcnJheSwgaXRlcmF0ZWUsIGNvbXBhcmF0b3IpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBpbmNsdWRlcyA9IGFycmF5SW5jbHVkZXMsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBpc0NvbW1vbiA9IHRydWUsXG4gICAgICByZXN1bHQgPSBbXSxcbiAgICAgIHNlZW4gPSByZXN1bHQ7XG5cbiAgaWYgKGNvbXBhcmF0b3IpIHtcbiAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgIGluY2x1ZGVzID0gYXJyYXlJbmNsdWRlc1dpdGg7XG4gIH1cbiAgZWxzZSBpZiAobGVuZ3RoID49IExBUkdFX0FSUkFZX1NJWkUpIHtcbiAgICB2YXIgc2V0ID0gaXRlcmF0ZWUgPyBudWxsIDogY3JlYXRlU2V0KGFycmF5KTtcbiAgICBpZiAoc2V0KSB7XG4gICAgICByZXR1cm4gc2V0VG9BcnJheShzZXQpO1xuICAgIH1cbiAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgIGluY2x1ZGVzID0gY2FjaGVIYXM7XG4gICAgc2VlbiA9IG5ldyBTZXRDYWNoZTtcbiAgfVxuICBlbHNlIHtcbiAgICBzZWVuID0gaXRlcmF0ZWUgPyBbXSA6IHJlc3VsdDtcbiAgfVxuICBvdXRlcjpcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF0sXG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSkgOiB2YWx1ZTtcblxuICAgIHZhbHVlID0gKGNvbXBhcmF0b3IgfHwgdmFsdWUgIT09IDApID8gdmFsdWUgOiAwO1xuICAgIGlmIChpc0NvbW1vbiAmJiBjb21wdXRlZCA9PT0gY29tcHV0ZWQpIHtcbiAgICAgIHZhciBzZWVuSW5kZXggPSBzZWVuLmxlbmd0aDtcbiAgICAgIHdoaWxlIChzZWVuSW5kZXgtLSkge1xuICAgICAgICBpZiAoc2VlbltzZWVuSW5kZXhdID09PSBjb21wdXRlZCkge1xuICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWluY2x1ZGVzKHNlZW4sIGNvbXB1dGVkLCBjb21wYXJhdG9yKSkge1xuICAgICAgaWYgKHNlZW4gIT09IHJlc3VsdCkge1xuICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzZXQgb2JqZWN0IG9mIGB2YWx1ZXNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBhZGQgdG8gdGhlIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBzZXQuXG4gKi9cbnZhciBjcmVhdGVTZXQgPSAhKFNldCAmJiAoMSAvIHNldFRvQXJyYXkobmV3IFNldChbLC0wXSkpWzFdKSA9PSBJTkZJTklUWSkgPyBub29wIDogZnVuY3Rpb24odmFsdWVzKSB7XG4gIHJldHVybiBuZXcgU2V0KHZhbHVlcyk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHVzZSBhcyB1bmlxdWUgb2JqZWN0IGtleS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleWFibGUodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAodHlwZSA9PSAnc3RyaW5nJyB8fCB0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicpXG4gICAgPyAodmFsdWUgIT09ICdfX3Byb3RvX18nKVxuICAgIDogKHZhbHVlID09PSBudWxsKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLnVuaXFgIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgYGNvbXBhcmF0b3JgIHdoaWNoXG4gKiBpcyBpbnZva2VkIHRvIGNvbXBhcmUgZWxlbWVudHMgb2YgYGFycmF5YC4gVGhlIGNvbXBhcmF0b3IgaXMgaW52b2tlZCB3aXRoXG4gKiB0d28gYXJndW1lbnRzOiAoYXJyVmFsLCBvdGhWYWwpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBBcnJheVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29tcGFyYXRvcl0gVGhlIGNvbXBhcmF0b3IgaW52b2tlZCBwZXIgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGR1cGxpY2F0ZSBmcmVlIGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFt7ICd4JzogMSwgJ3knOiAyIH0sIHsgJ3gnOiAyLCAneSc6IDEgfSwgeyAneCc6IDEsICd5JzogMiB9XTtcbiAqXG4gKiBfLnVuaXFXaXRoKG9iamVjdHMsIF8uaXNFcXVhbCk7XG4gKiAvLyA9PiBbeyAneCc6IDEsICd5JzogMiB9LCB7ICd4JzogMiwgJ3knOiAxIH1dXG4gKi9cbmZ1bmN0aW9uIHVuaXFXaXRoKGFycmF5LCBjb21wYXJhdG9yKSB7XG4gIHJldHVybiAoYXJyYXkgJiYgYXJyYXkubGVuZ3RoKVxuICAgID8gYmFzZVVuaXEoYXJyYXksIHVuZGVmaW5lZCwgY29tcGFyYXRvcilcbiAgICA6IFtdO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA4LTkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXkgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGlzT2JqZWN0KHZhbHVlKSA/IG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGB1bmRlZmluZWRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi4zLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5ub29wKTtcbiAqIC8vID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAqL1xuZnVuY3Rpb24gbm9vcCgpIHtcbiAgLy8gTm8gb3BlcmF0aW9uIHBlcmZvcm1lZC5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1bmlxV2l0aDtcbiIsImltcG9ydCBwYWxldHRlIGZyb20gJy4vcGFsZXR0ZSc7XG5cbi8vdGhpcyBpcyBhIGJpdHNoaWZ0IG9wZXJhdGlvbiwgbm90IGEgYm9vbGVhbiBjb21wYXJpc29uXG4vL2kgbm9ybWFsbHkgd291bGRuJ3QsIGJ1dCBpdCdzIHJlYWxseSBjb252ZW5pZW50IGhlcmVcbmNvbnN0IE1BWF9SQURJVVNfQ09OVElOVU9VUyA9ICgxIDw8IDE2KTtcblxuY29uc3QgTUFYX1JBRElVU19ESVNUQU5DRV9FU1RJTUFUSU9OID0gKDEgPDwgMjApO1xuXG5jb25zdCBNQVhfUkFESVVTX0VTQ0FQRV9USU1FID0gKDEgPDwgMik7XG5cbmNvbnN0IE1BWF9JVEVSQVRJT05TID0gMTAwMDtcblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgICBwYWxldHRlOiAnZGVmYXVsdCcsXG4gICAgbWFuZGVsYnJvdENvbG9yOiB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGc6IDAsXG4gICAgICAgIGI6IDBcbiAgICB9LFxuICAgIGxvb3BQYWxldHRlOiBmYWxzZVxufTtcblxuZnVuY3Rpb24gbG9vcFBhbGV0dGUocGFsZXR0ZSl7XG4gICAgaWYocGFsZXR0ZS5sZW5ndGggPiAyKXtcbiAgICAgICAgcmV0dXJuIHBhbGV0dGUuY29uY2F0KHBhbGV0dGUuc2xpY2UoMSxwYWxldHRlLmxlbmd0aC0xKS5yZXZlcnNlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gcGFsZXR0ZTtcbn1cblxuLy9BbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgRXNjYXBlIFRpbWUgQWxnb3JpdGhtIHdpdGggY29udGludW91cyBjb2xvcmluZ1xuLy9hbG1vc3QgZGlyZWN0bHkgZnJvbSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYW5kZWxicm90X3NldCNFc2NhcGVfdGltZV9hbGdvcml0aG1cbi8vd2l0aCBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYW5kZWxicm90X3NldCNDb250aW51b3VzXy4yOHNtb290aC4yOV9jb2xvcmluZ1xuZnVuY3Rpb24gX2VzY2FwZVRpbWUoeDAsIHkwLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIG9wdGlvbnMpO1xuICAgIHZhciBfcGFsZXR0ZSA9IG9wdGlvbnMubG9vcFBhbGV0dGUgPyBsb29wUGFsZXR0ZShwYWxldHRlW29wdGlvbnMucGFsZXR0ZV0pOiBwYWxldHRlW29wdGlvbnMucGFsZXR0ZV07XG5cbiAgICB2YXIgX21heEl0ZXJhdGlvbnMgPSBNQVhfSVRFUkFUSU9OUyArIChNQVhfSVRFUkFUSU9OUyAlIF9wYWxldHRlLmxlbmd0aCk7XG5cbiAgICB2YXIgeCA9IDAuMDtcbiAgICB2YXIgeSA9IDAuMDtcbiAgICB2YXIgaXRlcmF0aW9uID0gMDtcblxuICAgIHdoaWxlICh4ICogeCArIHkgKiB5IDwgTUFYX1JBRElVU19FU0NBUEVfVElNRSAmJiBpdGVyYXRpb24gPCBfbWF4SXRlcmF0aW9ucykge1xuICAgICAgICB2YXIgdGVtcFggPSB4ICogeCAtIHkgKiB5ICsgeDA7XG4gICAgICAgIHkgPSAyICogeCAqIHkgKyB5MDtcbiAgICAgICAgeCA9IHRlbXBYO1xuICAgICAgICBpdGVyYXRpb24rKztcbiAgICB9XG5cbiAgICAvL2RlYWZ1bHQgdG8gYmxhY2sgdW5sZXNzIHdlIG1hbmFnZWQgdG8gcnVsZSB0aGlzIHBpeGVsIG91dFxuICAgIHZhciBjb2xvciA9IG9wdGlvbnMubWFuZGVsYnJvdENvbG9yO1xuXG4gICAgaWYgKGl0ZXJhdGlvbiA8IF9tYXhJdGVyYXRpb25zKSB7XG4gICAgICAgIGNvbG9yID0gX3BhbGV0dGVbTWF0aC5mbG9vcihpdGVyYXRpb24gJSBfcGFsZXR0ZS5sZW5ndGgpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29sb3I7XG59XG5cbmZ1bmN0aW9uIF9pbnRlcnBvbGF0ZVZhbHVlKHZhbDEsIHZhbDIsIGZyYWN0aW9uKSB7XG4gICAgcmV0dXJuICgxIC0gZnJhY3Rpb24pICogdmFsMSArIGZyYWN0aW9uICogdmFsMjtcbn1cblxuZnVuY3Rpb24gX2ludGVycG9sYXRlQ29sb3IoY29sb3IxLCBjb2xvcjIsIGZyYWN0aW9uKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogX2ludGVycG9sYXRlVmFsdWUoY29sb3IxLnIsIGNvbG9yMi5yLCBmcmFjdGlvbiksXG4gICAgICAgIGc6IF9pbnRlcnBvbGF0ZVZhbHVlKGNvbG9yMS5nLCBjb2xvcjIuZywgZnJhY3Rpb24pLFxuICAgICAgICBiOiBfaW50ZXJwb2xhdGVWYWx1ZShjb2xvcjEuYiwgY29sb3IyLmIsIGZyYWN0aW9uKSxcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBfY29udGludW91c0NvbG9yaW5nKHgwLCB5MCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBvcHRpb25zKTtcbiAgICB2YXIgX3BhbGV0dGUgPSBvcHRpb25zLmxvb3BQYWxldHRlID8gbG9vcFBhbGV0dGUocGFsZXR0ZVtvcHRpb25zLnBhbGV0dGVdKTogcGFsZXR0ZVtvcHRpb25zLnBhbGV0dGVdO1xuICAgIHZhciBfbWF4SXRlcmF0aW9ucyA9IE1BWF9JVEVSQVRJT05TICsgKE1BWF9JVEVSQVRJT05TICUgX3BhbGV0dGUubGVuZ3RoKTtcblxuXG4gICAgdmFyIHggPSAwLjA7XG4gICAgdmFyIHkgPSAwLjA7XG4gICAgdmFyIGl0ZXJhdGlvbiA9IDA7XG4gICAgd2hpbGUgKHggKiB4ICsgeSAqIHkgPCBNQVhfUkFESVVTX0NPTlRJTlVPVVMgKiAyICYmIGl0ZXJhdGlvbiA8IF9tYXhJdGVyYXRpb25zKSB7XG4gICAgICAgIHZhciB0ZW1wWCA9IHggKiB4IC0geSAqIHkgKyB4MDtcbiAgICAgICAgeSA9IDIgKiB4ICogeSArIHkwO1xuICAgICAgICB4ID0gdGVtcFg7XG4gICAgICAgIGl0ZXJhdGlvbisrO1xuICAgIH1cblxuICAgIC8vZGVhZnVsdCB0byBibGFjayB1bmxlc3Mgd2UgbWFuYWdlZCB0byBydWxlIHRoaXMgcGl4ZWwgb3V0XG4gICAgdmFyIGNvbG9yID0gb3B0aW9ucy5tYW5kZWxicm90Q29sb3I7XG5cbiAgICBpZiAoaXRlcmF0aW9uIDwgX21heEl0ZXJhdGlvbnMpIHtcbiAgICAgICAgLy9UT0RPOiBleHBsaWNhdGUgdGhlIG1hdGggaGVyZeKAkyAgbm90IGl0J3Mgbm9uLXRyaXZpYWxcbiAgICAgICAgdmFyIGxvZ196biA9IE1hdGgubG9nKHggKiB4ICsgeSAqIHkpIC8gMjtcbiAgICAgICAgdmFyIG51ID0gTWF0aC5sb2cobG9nX3puIC8gTWF0aC5sb2coMikpIC8gTWF0aC5sb2coMik7XG4gICAgICAgIGl0ZXJhdGlvbiA9IGl0ZXJhdGlvbiArIDEgLSBudTtcblxuICAgICAgICB2YXIgY29sb3IxID0gX3BhbGV0dGVbTWF0aC5mbG9vcihpdGVyYXRpb24pICUgX3BhbGV0dGUubGVuZ3RoXTtcbiAgICAgICAgdmFyIGNvbG9yMiA9IF9wYWxldHRlWyhNYXRoLmZsb29yKGl0ZXJhdGlvbikgKyAxKSAlIF9wYWxldHRlLmxlbmd0aF07XG5cbiAgICAgICAgY29sb3IgPSBfaW50ZXJwb2xhdGVDb2xvcihjb2xvcjEsIGNvbG9yMiwgaXRlcmF0aW9uICUgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbG9yO1xufVxuXG5mdW5jdGlvbiBfZXh0ZXJpb3JEaXN0YW5jZUVzdGltYXRpb24oY3gsIGN5LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIG9wdGlvbnMpO1xuICAgIHZhciBfcGFsZXR0ZSA9IG9wdGlvbnMubG9vcFBhbGV0dGUgPyBsb29wUGFsZXR0ZShwYWxldHRlW29wdGlvbnMucGFsZXR0ZV0pOiBwYWxldHRlW29wdGlvbnMucGFsZXR0ZV07XG4gICAgdmFyIF9tYXhJdGVyYXRpb25zID0gTUFYX0lURVJBVElPTlMgKyAoTUFYX0lURVJBVElPTlMgJSBfcGFsZXR0ZS5sZW5ndGgpO1xuICAgIHZhciBfbWF4RGlzdGFuY2UgPSBvcHRpb25zLnBpeGVsU2l6ZSpvcHRpb25zLmNhbnZhc1dpZHRoKjAuMDMzMztcblxuXG4gICAgdmFyIHp4ID0gMC4wO1xuICAgIHZhciB6eSA9IDAuMDtcbiAgICB2YXIgZHggPSAwLjA7XG4gICAgdmFyIGR5ID0gMC4wO1xuICAgIHZhciBpdGVyYXRpb24gPSAwO1xuICAgIHdoaWxlICh6eCAqIHp4ICsgenkgKiB6eSA8IE1BWF9SQURJVVNfRElTVEFOQ0VfRVNUSU1BVElPTiAmJiBpdGVyYXRpb24gPCBfbWF4SXRlcmF0aW9ucykge1xuXG4gICAgICAgIGR4ID0gKDIgKiB6eCAqIGR4KSAtICgyICogenkgKiBkeCkgKyAxO1xuICAgICAgICBkeSA9IDQgKiB6eCAqIGR5O1xuXG4gICAgICAgIHZhciB0ZW1wWnggPSAoenggKiB6eCkgLSAoenkgKiB6eSkgKyBjeDtcbiAgICAgICAgenkgPSAoMiAqIHp4ICogenkpICsgY3k7XG4gICAgICAgIHp4ID0gdGVtcFp4O1xuICAgICAgICBpdGVyYXRpb24rKztcbiAgICB9XG5cbiAgICB2YXIgZGlzdGFuY2VFc3RpbWF0ZSA9IE1hdGguc3FydCgoenggKiB6eCArIHp5ICogenkpIC8gKGR4ICogZHggKyBkeSAqIGR5KSkgKiAwLjUgKiBNYXRoLmxvZyh6eCAqIHp4ICsgenkgKiB6eSk7XG5cbiAgICB2YXIgY29sb3IgPSBvcHRpb25zLm1hbmRlbGJyb3RDb2xvcjtcblxuICAgIGlmIChpdGVyYXRpb24gPCBfbWF4SXRlcmF0aW9ucykge1xuICAgICAgICB2YXIgY29sb3IxID0gX3BhbGV0dGVbTWF0aC5mbG9vcihkaXN0YW5jZUVzdGltYXRlL19tYXhEaXN0YW5jZSkgJSBfcGFsZXR0ZS5sZW5ndGhdO1xuICAgICAgICB2YXIgY29sb3IyID0gX3BhbGV0dGVbKE1hdGguZmxvb3IoZGlzdGFuY2VFc3RpbWF0ZS9fbWF4RGlzdGFuY2UpICsgMSkgJSBfcGFsZXR0ZS5sZW5ndGhdO1xuXG4gICAgICAgIGNvbG9yID0gX2ludGVycG9sYXRlQ29sb3IoY29sb3IxLCBjb2xvcjIsIGRpc3RhbmNlRXN0aW1hdGUvX21heERpc3RhbmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29sb3I7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICAnZGVmYXVsdCc6IF9jb250aW51b3VzQ29sb3JpbmcsXG4gICAgJ2VzY2FwZS10aW1lJzogX2VzY2FwZVRpbWUsXG4gICAgJ2NvbnRpbnVvdXMtY29sb3JpbmcnOiBfY29udGludW91c0NvbG9yaW5nLFxuICAgICdleHRlcmlvci1kaXN0YW5jZS1lc3RpbWF0aW9uJzogX2V4dGVyaW9yRGlzdGFuY2VFc3RpbWF0aW9uXG59O1xuIiwiaW1wb3J0IHVuaXF3aXRoIGZyb20gJ2xvZGFzaC51bmlxd2l0aCc7XG5pbXBvcnQgaGV4cmdiIGZyb20gJ2hleC1yZ2InO1xuXG5mdW5jdGlvbiByZ2IoY29sb3JBcnJheSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHI6IGNvbG9yQXJyYXlbMF0sXG4gICAgICAgIGc6IGNvbG9yQXJyYXlbMV0sXG4gICAgICAgIGI6IGNvbG9yQXJyYXlbMl1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoZXgoaGV4c3RyaW5nKSB7XG4gICAgcmV0dXJuIHJnYihoZXhyZ2IoaGV4c3RyaW5nKSk7XG59XG5cbi8qXG4gKiB0aGUgZm9sbG93aW5nIGxvb3Agd2FzXG4gKiBtb2RpZmllZCBmcm9tIHJhaW5ib3dpZnlcbiAqIChodHRwczovL2dpdGh1Yi5jb20vbWF4b2dkZW4vcmFpbmJvd2lmeSlcbiAqIHdoaWNoIGxpZnRlZCBmcm9tIG1vY2hhXG4gKiAoaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL21vY2hhL2Jsb2IvbWFzdGVyL2xpYi9yZXBvcnRlcnMvbnlhbi5qcylcbiAqIHRvIGdlbmVyYXRlIHRoZSBjb2xvciBwYWxldHRlXG4gKi9cbnZhciBfcmFpbmJvdyA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAoNiAqIDcpOyBpKyspIHtcbiAgICB2YXIgcGkzID0gTWF0aC5mbG9vcihNYXRoLlBJIC8gMyk7XG4gICAgdmFyIG4gPSAoaSAqICgxLjAgLyA2KSk7XG5cbiAgICB2YXIgciA9IE1hdGguZmxvb3IoMyAqIE1hdGguc2luKG4pICsgMykgKiAyNTUgLyA1O1xuICAgIHZhciBnID0gTWF0aC5mbG9vcigzICogTWF0aC5zaW4obiArIDIgKiBwaTMpICsgMykgKiAyNTUgLyA1O1xuICAgIHZhciBiID0gTWF0aC5mbG9vcigzICogTWF0aC5zaW4obiArIDQgKiBwaTMpICsgMykgKiAyNTUgLyA1O1xuXG4gICAgX3JhaW5ib3cucHVzaChyZ2IoW3IsIGcsIGJdKSk7XG59XG5cbl9yYWluYm93ID0gdW5pcXdpdGgoX3JhaW5ib3csIGZ1bmN0aW9uICh2YWwxLCB2YWwyKSB7XG4gICAgcmV0dXJuIHZhbDEuciA9PT0gdmFsMi5yICYmIHZhbDEuZyA9PT0gdmFsMi5nICYmIHZhbDEuYiA9PT0gdmFsMi5iO1xufSk7XG5cbnZhciBfY29sb3JTY2hlbWVyUGFzdGVsUmFpbmJvdyA9IFtcbiAgICBoZXgoJyNGRkNDQ0MnKSxcbiAgICBoZXgoJyNGRkUwQ0MnKSxcbiAgICBoZXgoJyNGRkVBQ0MnKSxcbiAgICBoZXgoJyNGRkY0Q0MnKSxcbiAgICBoZXgoJyNGRkZFQ0MnKSxcbiAgICBoZXgoJyNFRkZBQzgnKSxcbiAgICBoZXgoJyNDN0Y1QzQnKSxcbiAgICBoZXgoJyNDNEYwRjQnKSxcbiAgICBoZXgoJyNDNERBRjQnKSxcbiAgICBoZXgoJyNDOUM0RjQnKSxcbiAgICBoZXgoJyNFMUM0RjQnKSxcbiAgICBoZXgoJyNGNkM2RTYnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnblJlZCA9IFtcbiAgICBoZXgoJyNGRkVCRUUnKSxcbiAgICBoZXgoJyNGRkNERDInKSxcbiAgICBoZXgoJyNFRjlBOUEnKSxcbiAgICBoZXgoJyNFNTczNzMnKSxcbiAgICBoZXgoJyNFRjUzNTAnKSxcbiAgICBoZXgoJyNGNDQzMzYnKSxcbiAgICBoZXgoJyNFNTM5MzUnKSxcbiAgICBoZXgoJyNEMzJGMkYnKSxcbiAgICBoZXgoJyNDNjI4MjgnKSxcbiAgICBoZXgoJyNCNzFDMUMnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnblJlZEFsdCA9IFtcbiAgICBoZXgoJyNGRjhBODAnKSxcbiAgICBoZXgoJyNGRjUyNTInKSxcbiAgICBoZXgoJyNGRjE3NDQnKSxcbiAgICBoZXgoJyNENTAwMDAnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnblBpbmsgPSBbXG4gICAgaGV4KCcjRkNFNEVDJyksXG4gICAgaGV4KCcjRjhCQkQwJyksXG4gICAgaGV4KCcjRjQ4RkIxJyksXG4gICAgaGV4KCcjRjA2MjkyJyksXG4gICAgaGV4KCcjRUM0MDdBJyksXG4gICAgaGV4KCcjRTkxRTYzJyksXG4gICAgaGV4KCcjRDgxQjYwJyksXG4gICAgaGV4KCcjQzIxODVCJyksXG4gICAgaGV4KCcjQUQxNDU3JyksXG4gICAgaGV4KCcjODgwRTRGJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25QaW5rQWx0ID0gW1xuICAgIGhleCgnI0ZGODBBQicpLFxuICAgIGhleCgnI0ZGNDA4MScpLFxuICAgIGhleCgnI0Y1MDA1NycpLFxuICAgIGhleCgnI0M1MTE2MicpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduUHVycGxlID0gW1xuICAgIGhleCgnI0YzRTVGNScpLFxuICAgIGhleCgnI0UxQkVFNycpLFxuICAgIGhleCgnI0NFOTNEOCcpLFxuICAgIGhleCgnI0JBNjhDOCcpLFxuICAgIGhleCgnI0FCNDdCQycpLFxuICAgIGhleCgnIzlDMjdCMCcpLFxuICAgIGhleCgnIzhFMjRBQScpLFxuICAgIGhleCgnIzdCMUZBMicpLFxuICAgIGhleCgnIzZBMUI5QScpLFxuICAgIGhleCgnIzRBMTQ4QycpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduUHVycGxlQWx0ID0gW1xuICAgIGhleCgnI0VBODBGQycpLFxuICAgIGhleCgnI0UwNDBGQicpLFxuICAgIGhleCgnI0Q1MDBGOScpLFxuICAgIGhleCgnI0FBMDBGRicpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduRGVlcFB1cnBsZSA9IFtcbiAgICBoZXgoJyNFREU3RjYnKSxcbiAgICBoZXgoJyNEMUM0RTknKSxcbiAgICBoZXgoJyNCMzlEREInKSxcbiAgICBoZXgoJyM5NTc1Q0QnKSxcbiAgICBoZXgoJyM3RTU3QzInKSxcbiAgICBoZXgoJyM2NzNBQjcnKSxcbiAgICBoZXgoJyM1RTM1QjEnKSxcbiAgICBoZXgoJyM1MTJEQTgnKSxcbiAgICBoZXgoJyM0NTI3QTAnKSxcbiAgICBoZXgoJyMzMTFCOTInKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkRlZXBQdXJwbGVBbHQgPSBbXG4gICAgaGV4KCcjQjM4OEZGJyksXG4gICAgaGV4KCcjN0M0REZGJyksXG4gICAgaGV4KCcjNjUxRkZGJyksXG4gICAgaGV4KCcjNjIwMEVBJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25JbmRpZ28gPSBbXG4gICAgaGV4KCcjRThFQUY2JyksXG4gICAgaGV4KCcjQzVDQUU5JyksXG4gICAgaGV4KCcjOUZBOERBJyksXG4gICAgaGV4KCcjNzk4NkNCJyksXG4gICAgaGV4KCcjNUM2QkMwJyksXG4gICAgaGV4KCcjM0Y1MUI1JyksXG4gICAgaGV4KCcjMzk0OUFCJyksXG4gICAgaGV4KCcjMzAzRjlGJyksXG4gICAgaGV4KCcjMjgzNTkzJyksXG4gICAgaGV4KCcjMUEyMzdFJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25JbmRpZ29BbHQgPSBbXG4gICAgaGV4KCcjOEM5RUZGJyksXG4gICAgaGV4KCcjNTM2REZFJyksXG4gICAgaGV4KCcjM0Q1QUZFJyksXG4gICAgaGV4KCcjMzA0RkZFJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25CbHVlID0gW1xuICAgIGhleCgnI0UzRjJGRCcpLFxuICAgIGhleCgnI0JCREVGQicpLFxuICAgIGhleCgnIzkwQ0FGOScpLFxuICAgIGhleCgnIzY0QjVGNicpLFxuICAgIGhleCgnIzQyQTVGNScpLFxuICAgIGhleCgnIzIxOTZGMycpLFxuICAgIGhleCgnIzFFODhFNScpLFxuICAgIGhleCgnIzE5NzZEMicpLFxuICAgIGhleCgnIzE1NjVDMCcpLFxuICAgIGhleCgnIzBENDdBMScpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduQmx1ZUFsdCA9IFtcbiAgICBoZXgoJyM4MkIxRkYnKSxcbiAgICBoZXgoJyM0NDhBRkYnKSxcbiAgICBoZXgoJyMyOTc5RkYnKSxcbiAgICBoZXgoJyMyOTYyRkYnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkxpZ2h0Qmx1ZSA9IFtcbiAgICBoZXgoJyNFMUY1RkUnKSxcbiAgICBoZXgoJyNCM0U1RkMnKSxcbiAgICBoZXgoJyM4MUQ0RkEnKSxcbiAgICBoZXgoJyM0RkMzRjcnKSxcbiAgICBoZXgoJyMyOUI2RjYnKSxcbiAgICBoZXgoJyMwM0E5RjQnKSxcbiAgICBoZXgoJyMwMzlCRTUnKSxcbiAgICBoZXgoJyMwMjg4RDEnKSxcbiAgICBoZXgoJyMwMjc3QkQnKSxcbiAgICBoZXgoJyMwMTU3OUInKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkxpZ2h0Qmx1ZUFsdCA9IFtcbiAgICBoZXgoJyM4MEQ4RkYnKSxcbiAgICBoZXgoJyM0MEM0RkYnKSxcbiAgICBoZXgoJyMwMEIwRkYnKSxcbiAgICBoZXgoJyMwMDkxRUEnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkN5YW4gPSBbXG4gICAgaGV4KCcjRTBGN0ZBJyksXG4gICAgaGV4KCcjQjJFQkYyJyksXG4gICAgaGV4KCcjODBERUVBJyksXG4gICAgaGV4KCcjNEREMEUxJyksXG4gICAgaGV4KCcjMjZDNkRBJyksXG4gICAgaGV4KCcjMDBCQ0Q0JyksXG4gICAgaGV4KCcjMDBBQ0MxJyksXG4gICAgaGV4KCcjMDA5N0E3JyksXG4gICAgaGV4KCcjMDA4MzhGJyksXG4gICAgaGV4KCcjMDA2MDY0Jylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25DeWFuQWx0ID0gW1xuICAgIGhleCgnIzg0RkZGRicpLFxuICAgIGhleCgnIzE4RkZGRicpLFxuICAgIGhleCgnIzAwRTVGRicpLFxuICAgIGhleCgnIzAwQjhENCcpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduVGVhbCA9IFtcbiAgICBoZXgoJyNFMEYyRjEnKSxcbiAgICBoZXgoJyNCMkRGREInKSxcbiAgICBoZXgoJyM4MENCQzQnKSxcbiAgICBoZXgoJyM0REI2QUMnKSxcbiAgICBoZXgoJyMyNkE2OUEnKSxcbiAgICBoZXgoJyMwMDk2ODgnKSxcbiAgICBoZXgoJyMwMDg5N0InKSxcbiAgICBoZXgoJyMwMDc5NkInKSxcbiAgICBoZXgoJyMwMDY5NUMnKSxcbiAgICBoZXgoJyMwMDRENDAnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnblRlYWxBbHQgPSBbXG4gICAgaGV4KCcjQTdGRkVCJyksXG4gICAgaGV4KCcjNjRGRkRBJyksXG4gICAgaGV4KCcjMURFOUI2JyksXG4gICAgaGV4KCcjMDBCRkE1Jylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25HcmVlbiA9IFtcbiAgICBoZXgoJyNFOEY1RTknKSxcbiAgICBoZXgoJyNDOEU2QzknKSxcbiAgICBoZXgoJyNBNUQ2QTcnKSxcbiAgICBoZXgoJyM4MUM3ODQnKSxcbiAgICBoZXgoJyM2NkJCNkEnKSxcbiAgICBoZXgoJyM0Q0FGNTAnKSxcbiAgICBoZXgoJyM0M0EwNDcnKSxcbiAgICBoZXgoJyMzODhFM0MnKSxcbiAgICBoZXgoJyMyRTdEMzInKSxcbiAgICBoZXgoJyMxQjVFMjAnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkdyZWVuQWx0ID0gW1xuICAgIGhleCgnI0I5RjZDQScpLFxuICAgIGhleCgnIzY5RjBBRScpLFxuICAgIGhleCgnIzAwRTY3NicpLFxuICAgIGhleCgnIzAwQzg1MycpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduTGlnaHRHcmVlbiA9IFtcbiAgICBoZXgoJyNGMUY4RTknKSxcbiAgICBoZXgoJyNEQ0VEQzgnKSxcbiAgICBoZXgoJyNDNUUxQTUnKSxcbiAgICBoZXgoJyNBRUQ1ODEnKSxcbiAgICBoZXgoJyM5Q0NDNjUnKSxcbiAgICBoZXgoJyM4QkMzNEEnKSxcbiAgICBoZXgoJyM3Q0IzNDInKSxcbiAgICBoZXgoJyM2ODlGMzgnKSxcbiAgICBoZXgoJyM1NThCMkYnKSxcbiAgICBoZXgoJyMzMzY5MUUnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkxpZ2h0R3JlZW5BbHQgPSBbXG4gICAgaGV4KCcjQ0NGRjkwJyksXG4gICAgaGV4KCcjQjJGRjU5JyksXG4gICAgaGV4KCcjNzZGRjAzJyksXG4gICAgaGV4KCcjNjRERDE3JylcbiAgICBdO1xuXG52YXIgX21hdGVyaWFsRGVzaWduTGltZSA9IFtcbiAgICBoZXgoJyNGOUZCRTcnKSxcbiAgICBoZXgoJyNGMEY0QzMnKSxcbiAgICBoZXgoJyNFNkVFOUMnKSxcbiAgICBoZXgoJyNEQ0U3NzUnKSxcbiAgICBoZXgoJyNENEUxNTcnKSxcbiAgICBoZXgoJyNDRERDMzknKSxcbiAgICBoZXgoJyNDMENBMzMnKSxcbiAgICBoZXgoJyNBRkI0MkInKSxcbiAgICBoZXgoJyM5RTlEMjQnKSxcbiAgICBoZXgoJyM4Mjc3MTcnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkxpbWVBbHQgPSBbXG4gICAgaGV4KCcjRjRGRjgxJyksXG4gICAgaGV4KCcjRUVGRjQxJyksXG4gICAgaGV4KCcjQzZGRjAwJyksXG4gICAgaGV4KCcjQUVFQTAwJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25ZZWxsb3cgPSBbXG4gICAgaGV4KCcjRkZGREU3JyksXG4gICAgaGV4KCcjRkZGOUM0JyksXG4gICAgaGV4KCcjRkZGNTlEJyksXG4gICAgaGV4KCcjRkZGMTc2JyksXG4gICAgaGV4KCcjRkZFRTU4JyksXG4gICAgaGV4KCcjRkZFQjNCJyksXG4gICAgaGV4KCcjRkREODM1JyksXG4gICAgaGV4KCcjRkJDMDJEJyksXG4gICAgaGV4KCcjRjlBODI1JyksXG4gICAgaGV4KCcjRjU3RjE3Jylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25ZZWxsb3dBbHQgPSBbXG4gICAgaGV4KCcjRkZGRjhEJyksXG4gICAgaGV4KCcjRkZGRjAwJyksXG4gICAgaGV4KCcjRkZFQTAwJyksXG4gICAgaGV4KCcjRkZENjAwJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25BbWJlciA9IFtcbiAgICBoZXgoJyNGRkY4RTEnKSxcbiAgICBoZXgoJyNGRkVDQjMnKSxcbiAgICBoZXgoJyNGRkUwODInKSxcbiAgICBoZXgoJyNGRkQ1NEYnKSxcbiAgICBoZXgoJyNGRkNBMjgnKSxcbiAgICBoZXgoJyNGRkMxMDcnKSxcbiAgICBoZXgoJyNGRkIzMDAnKSxcbiAgICBoZXgoJyNGRkEwMDAnKSxcbiAgICBoZXgoJyNGRjhGMDAnKSxcbiAgICBoZXgoJyNGRjZGMDAnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkFtYmVyQWx0ID0gW1xuICAgIGhleCgnI0ZGRTU3RicpLFxuICAgIGhleCgnI0ZGRDc0MCcpLFxuICAgIGhleCgnI0ZGQzQwMCcpLFxuICAgIGhleCgnI0ZGQUIwMCcpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduT3JhbmdlID0gW1xuICAgIGhleCgnI0ZGRjNFMCcpLFxuICAgIGhleCgnI0ZGRTBCMicpLFxuICAgIGhleCgnI0ZGQ0M4MCcpLFxuICAgIGhleCgnI0ZGQjc0RCcpLFxuICAgIGhleCgnI0ZGQTcyNicpLFxuICAgIGhleCgnI0ZGOTgwMCcpLFxuICAgIGhleCgnI0ZCOEMwMCcpLFxuICAgIGhleCgnI0Y1N0MwMCcpLFxuICAgIGhleCgnI0VGNkMwMCcpLFxuICAgIGhleCgnI0U2NTEwMCcpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduT3JhbmdlQWx0ID0gW1xuICAgIGhleCgnI0ZGRDE4MCcpLFxuICAgIGhleCgnI0ZGQUI0MCcpLFxuICAgIGhleCgnI0ZGOTEwMCcpLFxuICAgIGhleCgnI0ZGNkQwMCcpXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduRGVlcE9yYW5nZSA9IFtcbiAgICBoZXgoJyNGQkU5RTcnKSxcbiAgICBoZXgoJyNGRkNDQkMnKSxcbiAgICBoZXgoJyNGRkFCOTEnKSxcbiAgICBoZXgoJyNGRjhBNjUnKSxcbiAgICBoZXgoJyNGRjcwNDMnKSxcbiAgICBoZXgoJyNGRjU3MjInKSxcbiAgICBoZXgoJyNGNDUxMUUnKSxcbiAgICBoZXgoJyNFNjRBMTknKSxcbiAgICBoZXgoJyNEODQzMTUnKSxcbiAgICBoZXgoJyNCRjM2MEMnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkRlZXBPcmFuZ2VBbHQgPSBbXG4gICAgaGV4KCcjRkY5RTgwJyksXG4gICAgaGV4KCcjRkY2RTQwJyksXG4gICAgaGV4KCcjRkYzRDAwJyksXG4gICAgaGV4KCcjREQyQzAwJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25Ccm93biA9IFtcbiAgICBoZXgoJyNFRkVCRTknKSxcbiAgICBoZXgoJyNEN0NDQzgnKSxcbiAgICBoZXgoJyNCQ0FBQTQnKSxcbiAgICBoZXgoJyNBMTg4N0YnKSxcbiAgICBoZXgoJyM4RDZFNjMnKSxcbiAgICBoZXgoJyM3OTU1NDgnKSxcbiAgICBoZXgoJyM2RDRDNDEnKSxcbiAgICBoZXgoJyM1RDQwMzcnKSxcbiAgICBoZXgoJyM0RTM0MkUnKSxcbiAgICBoZXgoJyMzRTI3MjMnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnbkdyZXkgPSBbXG4gICAgaGV4KCcjRkFGQUZBJyksXG4gICAgaGV4KCcjRjVGNUY1JyksXG4gICAgaGV4KCcjRUVFRUVFJyksXG4gICAgaGV4KCcjRTBFMEUwJyksXG4gICAgaGV4KCcjQkRCREJEJyksXG4gICAgaGV4KCcjOUU5RTlFJyksXG4gICAgaGV4KCcjNzU3NTc1JyksXG4gICAgaGV4KCcjNjE2MTYxJyksXG4gICAgaGV4KCcjNDI0MjQyJyksXG4gICAgaGV4KCcjMjEyMTIxJylcbl07XG5cbnZhciBfbWF0ZXJpYWxEZXNpZ25CbHVlR3JleSA9IFtcbiAgICBoZXgoJyNFQ0VGRjEnKSxcbiAgICBoZXgoJyNDRkQ4REMnKSxcbiAgICBoZXgoJyNCMEJFQzUnKSxcbiAgICBoZXgoJyM5MEE0QUUnKSxcbiAgICBoZXgoJyM3ODkwOUMnKSxcbiAgICBoZXgoJyM2MDdEOEInKSxcbiAgICBoZXgoJyM1NDZFN0EnKSxcbiAgICBoZXgoJyM0NTVBNjQnKSxcbiAgICBoZXgoJyMzNzQ3NEYnKSxcbiAgICBoZXgoJyMyNjMyMzgnKVxuXTtcblxudmFyIF9tYXRlcmlhbERlc2lnblJhaW5ib3c1MDAgPSBbXG4gICAgcmdiKFsyNDQsIDY3LCA1NF0pLFxuICAgIHJnYihbMjMzLCAzMCwgOTldKSxcbiAgICByZ2IoWzE1NiwgMzksIDE3Nl0pLFxuICAgIHJnYihbMTAzLCA1OCwgMTgzXSksXG4gICAgcmdiKFs2MywgODEsIDE4MV0pLFxuICAgIHJnYihbMzMsIDE1MCwgMjQzXSksXG4gICAgcmdiKFszLCAxNjksIDI0NF0pLFxuICAgIHJnYihbMCwgMTg4LCAyMTJdKSxcbiAgICByZ2IoWzAsIDE1MCwgMTM2XSksXG4gICAgcmdiKFs3NiwgMTc1LCA4MF0pLFxuICAgIHJnYihbMTM5LCAxOTUsIDc0XSksXG4gICAgcmdiKFsyMDUsIDIyMCwgNTddKSxcbiAgICByZ2IoWzI1NSwgMjM1LCA1OV0pLFxuICAgIHJnYihbMjU1LCAxOTMsIDddKSxcbiAgICByZ2IoWzI1NSwgMTUyLCAwXSksXG4gICAgcmdiKFsyNTUsIDg3LCAzNF0pXG5dO1xuXG52YXIgX21hdGVyaWFsRGVzaWduUmFpbmJvd0E0MDAgPSBbXG4gICAgcmdiKFsyNTUsIDIzLCA2OF0pLFxuICAgIHJnYihbMjQ1LCAwLCA4N10pLFxuICAgIHJnYihbMjEzLCAwLCAyNDldKSxcbiAgICByZ2IoWzEwMSwgMzEsIDI1NV0pLFxuICAgIHJnYihbNjEsIDkwLCAyNTRdKSxcbiAgICByZ2IoWzQxLCAxMjEsIDI1NV0pLFxuICAgIHJnYihbMCwgMTc2LCAyNTVdKSxcbiAgICByZ2IoWzAsIDIyOSwgMjU1XSksXG4gICAgcmdiKFsyOSwgMjMzLCAxODJdKSxcbiAgICByZ2IoWzAsIDIzMCwgMTE4XSksXG4gICAgcmdiKFsxMTgsIDI1NSwgM10pLFxuICAgIHJnYihbMTk4LCAyNTUsIDBdKSxcbiAgICByZ2IoWzI1NSwgMjM0LCAwXSksXG4gICAgcmdiKFsyNTUsIDE5NiwgMF0pLFxuICAgIHJnYihbMjU1LCAxNDUsIDBdKSxcbiAgICByZ2IoWzI1NSwgNjEsIDBdKVxuXTtcblxudmFyIF9odWVTaGlmdFJhaW5ib3dDaG9jb2xhdGUgPSBbXG4gICAgaGV4KCcjZDI2OTFlJyksXG4gICAgaGV4KCcjZTc2MDM4JyksXG4gICAgaGV4KCcjZjQ1OTU2JyksXG4gICAgaGV4KCcjZjk1NDc3JyksXG4gICAgaGV4KCcjZjY1Mjk4JyksXG4gICAgaGV4KCcjZWE1M2I3JyksXG4gICAgaGV4KCcjZDY1NmQyJyksXG4gICAgaGV4KCcjYmM1YmU3JyksXG4gICAgaGV4KCcjOWU2M2Y0JyksXG4gICAgaGV4KCcjN2Q2Y2Y5JyksXG4gICAgaGV4KCcjNWM3N2Y2JyksXG4gICAgaGV4KCcjM2Q4MWVhJyksXG4gICAgaGV4KCcjMjI4YmQ2JyksXG4gICAgaGV4KCcjMGQ5NGJjJyksXG4gICAgaGV4KCcjMDA5YjllJyksXG4gICAgaGV4KCcjMDBhMDdkJyksXG4gICAgaGV4KCcjMDBhMjVjJyksXG4gICAgaGV4KCcjMGFhMTNkJyksXG4gICAgaGV4KCcjMWU5ZTIyJyksXG4gICAgaGV4KCcjMzg5OTBkJyksXG4gICAgaGV4KCcjNTY5MTAwJyksXG4gICAgaGV4KCcjNzc4ODAwJyksXG4gICAgaGV4KCcjOTg3ZDAwJyksXG4gICAgaGV4KCcjYjc3MzBhJylcbl1cblxudmFyIF9ibHVlQmxhY2sgPSBbXG4gICAgaGV4KCcjMDAwMDAwJyksXG4gICAgaGV4KCcjMTAxNDJkJyksXG4gICAgaGV4KCcjMjAyOTViJyksXG4gICAgaGV4KCcjMzAzZDg4JyksXG4gICAgaGV4KCcjM0Y1MUI1Jylcbl07XG5cbnZhciBfZ3JheVNjYWxlID0gW1xuICAgIHJnYihbMjU1LCAyNTUsIDI1NV0pLFxuICAgIHJnYihbMCwgMCwgMCwgMF0pXG5dO1xuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICAnZGVmYXVsdCc6IF9yYWluYm93LFxuICAgICdyYWluYm93JzogX3JhaW5ib3csXG5cbiAgICAnY29sb3Itc2NoZW1lci1wYXN0ZWwtcmFpbmJvdyc6IF9jb2xvclNjaGVtZXJQYXN0ZWxSYWluYm93LFxuXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1yZWQnOiBfbWF0ZXJpYWxEZXNpZ25SZWQsXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1yZWQtYWx0JzogX21hdGVyaWFsRGVzaWduUmVkQWx0LFxuXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1waW5rJzogX21hdGVyaWFsRGVzaWduUGluayxcbiAgICAnbWF0ZXJpYWwtZGVzaWduLXBpbmstYWx0JzogX21hdGVyaWFsRGVzaWduUGlua0FsdCxcblxuICAgICdtYXRlcmlhbC1kZXNpZ24tcHVycGxlJzogX21hdGVyaWFsRGVzaWduUHVycGxlLFxuICAgICdtYXRlcmlhbC1kZXNpZ24tcHVycGxlLWFsdCc6IF9tYXRlcmlhbERlc2lnblB1cnBsZUFsdCxcblxuICAgICdtYXRlcmlhbC1kZXNpZ24tZGVlcC1wdXJwbGUnOiBfbWF0ZXJpYWxEZXNpZ25EZWVwUHVycGxlLFxuICAgICdtYXRlcmlhbC1kZXNpZ24tZGVlcC1wdXJwbGUtYWx0JzogX21hdGVyaWFsRGVzaWduRGVlcFB1cnBsZUFsdCxcblxuICAgICdtYXRlcmlhbC1kZXNpZ24taW5kaWdvJzogX21hdGVyaWFsRGVzaWduSW5kaWdvLFxuICAgICdtYXRlcmlhbC1kZXNpZ24taW5kaWdvLWFsdCc6IF9tYXRlcmlhbERlc2lnbkluZGlnb0FsdCxcblxuICAgICdtYXRlcmlhbC1kZXNpZ24tYmx1ZSc6IF9tYXRlcmlhbERlc2lnbkJsdWUsXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1ibHVlLWFsdCc6IF9tYXRlcmlhbERlc2lnbkJsdWVBbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLWxpZ2h0LWJsdWUnOiBfbWF0ZXJpYWxEZXNpZ25MaWdodEJsdWUsXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1saWdodC1ibHVlLWFsdCc6IF9tYXRlcmlhbERlc2lnbkxpZ2h0Qmx1ZUFsdCxcblxuICAgICdtYXRlcmlhbC1kZXNpZ24tY3lhbic6IF9tYXRlcmlhbERlc2lnbkN5YW4sXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1jeWFuLWFsdCc6IF9tYXRlcmlhbERlc2lnbkN5YW5BbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLXRlYWwnOiBfbWF0ZXJpYWxEZXNpZ25UZWFsLFxuICAgICdtYXRlcmlhbC1kZXNpZ24tdGVhbC1hbHQnOiBfbWF0ZXJpYWxEZXNpZ25UZWFsQWx0LFxuXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1ncmVlbic6IF9tYXRlcmlhbERlc2lnbkdyZWVuLFxuICAgICdtYXRlcmlhbC1kZXNpZ24tZ3JlZW4tYWx0JzogX21hdGVyaWFsRGVzaWduR3JlZW5BbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLWxpZ2h0LWdyZWVuJzogX21hdGVyaWFsRGVzaWduTGlnaHRHcmVlbixcbiAgICAnbWF0ZXJpYWwtZGVzaWduLWxpZ2h0LWdyZWVuLWFsdCc6IF9tYXRlcmlhbERlc2lnbkxpZ2h0R3JlZW5BbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLWxpbWUnOiBfbWF0ZXJpYWxEZXNpZ25MaW1lLFxuICAgICdtYXRlcmlhbC1kZXNpZ24tbGltZS1hbHQnOiBfbWF0ZXJpYWxEZXNpZ25MaW1lQWx0LFxuXG4gICAgJ21hdGVyaWFsLWRlc2lnbi15ZWxsb3cnOiBfbWF0ZXJpYWxEZXNpZ25ZZWxsb3csXG4gICAgJ21hdGVyaWFsLWRlc2lnbi15ZWxsb3ctYWx0JzogX21hdGVyaWFsRGVzaWduWWVsbG93QWx0LFxuXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1hbWJlcic6IF9tYXRlcmlhbERlc2lnbkFtYmVyLFxuICAgICdtYXRlcmlhbC1kZXNpZ24tYW1iZXItYWx0JzogX21hdGVyaWFsRGVzaWduQW1iZXJBbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLW9yYW5nZSc6IF9tYXRlcmlhbERlc2lnbk9yYW5nZSxcbiAgICAnbWF0ZXJpYWwtZGVzaWduLW9yYW5nZS1hbHQnOiBfbWF0ZXJpYWxEZXNpZ25PcmFuZ2VBbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLWRlZXAtb3JhbmdlJzogX21hdGVyaWFsRGVzaWduRGVlcE9yYW5nZSxcbiAgICAnbWF0ZXJpYWwtZGVzaWduLWRlZXAtb3JhbmdlLWFsdCc6IF9tYXRlcmlhbERlc2lnbkRlZXBPcmFuZ2VBbHQsXG5cbiAgICAnbWF0ZXJpYWwtZGVzaWduLWJyb3duJzogX21hdGVyaWFsRGVzaWduQnJvd24sXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1ncmV5JzogX21hdGVyaWFsRGVzaWduR3JleSxcbiAgICAnbWF0ZXJpYWwtZGVzaWduLWJsdWUtZ3JleSc6IF9tYXRlcmlhbERlc2lnbkJsdWVHcmV5LFxuXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1yYWluYm93LTUwMCc6IF9tYXRlcmlhbERlc2lnblJhaW5ib3c1MDAsXG4gICAgJ21hdGVyaWFsLWRlc2lnbi1yYWluYm93LWE0MDAnOiBfbWF0ZXJpYWxEZXNpZ25SYWluYm93QTQwMCxcbiAgICAnZ3JheS1zY2FsZSc6IF9ncmF5U2NhbGUsXG4gICAgJ2JsdWUtYmxhY2snOiBfYmx1ZUJsYWNrLFxuXG4gICAgJ2h1ZS1zaGlmdC1yYWluYm93LWNob2NvbGF0ZSc6IF9odWVTaGlmdFJhaW5ib3dDaG9jb2xhdGVcbn07XG5cbi8vVE9ETzogYWxsb3cgdXNlcnMgdG8gQ1JVRCB0aGVpciBvd24gY29sb3IgcGFsZXR0ZXMgdG8gbG9jYWxzdG9yYWdlXG4iLCJpbXBvcnQgY29sb3JpbmdNZXRob2QgZnJvbSAnLi9jb2xvcmluZy1tZXRob2QnO1xuXG4vL3RoZSBib3VuZHMgb2YgdGhlIHNldFxuY29uc3QgTEVGVF9FREdFID0gLTIuNTtcbmNvbnN0IFJJR0hUX0VER0UgPSAxO1xuY29uc3QgVE9QX0VER0UgPSAtMTtcbmNvbnN0IEJPVFRPTV9FREdFID0gMTtcblxuLy9iZWNhdXNlIHRoZSBib3VuZHMgb2YgdGhlIHNldCBhcmUgdW5ldmVuLCB3ZSdyZSBob3Jpem9udGFsbHkgb2Zmc2V0IHRoaXMgbXVjaFxuY29uc3QgSE9SSVpPTlRBTF9PRkZTRVQgPSBMRUZUX0VER0UgLSAoKExFRlRfRURHRSAtIFJJR0hUX0VER0UpIC8gMik7XG5cbi8vd2lkdGggLyBoZWlnaHQgcmF0aW8gb2YgdGhlIGJvdW5kcyBvZiB0aGUgc2V0XG5jb25zdCBNQU5ERUxfUkFUSU8gPSAoUklHSFRfRURHRSAtIExFRlRfRURHRSkgLyAoQk9UVE9NX0VER0UgLSBUT1BfRURHRSk7XG5cbmNvbnN0IE1JTUVUWVBFX1BORyA9ICdpbWFnZS9wbmcnO1xuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xuICAgIGNvbG9yaW5nTWV0aG9kOiAnZGVmYXVsdCcsXG4gICAgcGFsZXR0ZTogJ2RlZmF1bHQnLFxuICAgIGxvb3BQYWxldHRlOiBmYWxzZVxufTtcblxuY2xhc3MgUmVuZGVyZXIge1xuICAgIGNvbnN0cnVjdG9yKGNhbnZhcywgb3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5faW1hZ2VEYXRhID0gdGhpcy5fY29udGV4dC5jcmVhdGVJbWFnZURhdGEodGhpcy5fY2FudmFzLndpZHRoLCB0aGlzLl9jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2ltYWdlRGF0YS5kYXRhO1xuXG4gICAgICAgIHRoaXMuX2NvbG9yaW5nTWV0aG9kID0gY29sb3JpbmdNZXRob2RbdGhpcy5fb3B0aW9ucy5jb2xvcmluZ01ldGhvZF07XG5cbiAgICAgICAgdGhpcy51cGRhdGVWaWV3cG9ydFNpemUoKTtcblxuICAgICAgICB0aGlzLl9zY2FsZSA9IDE7XG4gICAgICAgIHRoaXMuX2R4ID0gSE9SSVpPTlRBTF9PRkZTRVQ7XG4gICAgICAgIHRoaXMuX2R5ID0gMDtcbiAgICB9XG5cbiAgICBnZXQgRGF0YVVybCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhcy50b0RhdGFVUkwoTUlNRVRZUEVfUE5HKTtcbiAgICB9XG5cbiAgICBwbG90KHgsIHksIGNvbG9yKSB7XG4gICAgICAgIC8vdGhlIGNhbnZhcyBwaXhlbCBkYXRhIGlzIGEgYml0IGF3a3dhcmQgdG8gZ2V0IGF0Li4uXG4gICAgICAgIC8vc2VlOiBodHRwczovL3d3dy53My5vcmcvVFIvMmRjb250ZXh0LyNwaXhlbC1tYW5pcHVsYXRpb25cbiAgICAgICAgdmFyIGRhdGFJbmRleCA9ICh5ICogdGhpcy5faW1hZ2VEYXRhLndpZHRoICsgeCkgKiA0O1xuICAgICAgICBpZiAoZGF0YUluZGV4IDwgdGhpcy5fZGF0YS5sZW5ndGggJiYgZGF0YUluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFbZGF0YUluZGV4XSA9IGNvbG9yLnI7XG4gICAgICAgICAgICB0aGlzLl9kYXRhW2RhdGFJbmRleCArIDFdID0gY29sb3IuZztcbiAgICAgICAgICAgIHRoaXMuX2RhdGFbZGF0YUluZGV4ICsgMl0gPSBjb2xvci5iO1xuICAgICAgICAgICAgdGhpcy5fZGF0YVtkYXRhSW5kZXggKyAzXSA9IDI1NTsgLy9tYXggc2F0dXJhdGlvblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlVmlld3BvcnRTaXplKCkge1xuICAgICAgICAvL3dpZHRoIC8gaGVpZ2h0IHJhdGlvIG9mIHRoZSB2aWV3cG9ydFxuICAgICAgICB0aGlzLl9pbWFnZURhdGEgPSB0aGlzLl9jb250ZXh0LmNyZWF0ZUltYWdlRGF0YSh0aGlzLl9jYW52YXMud2lkdGgsIHRoaXMuX2NhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLl9kYXRhID0gdGhpcy5faW1hZ2VEYXRhLmRhdGE7XG4gICAgICAgIHRoaXMuX2ltYWdlUmF0aW8gPSB0aGlzLl9pbWFnZURhdGEud2lkdGggLyB0aGlzLl9pbWFnZURhdGEuaGVpZ2h0O1xuXG4gICAgICAgIHZhciByYXRpbyA9IDE7XG4gICAgICAgIHZhciBwcm9kdWN0ID0gMDtcblxuICAgICAgICB0aGlzLl90b3BFZGdlID0gVE9QX0VER0U7XG4gICAgICAgIHRoaXMuX2JvdHRvbUVkZ2UgPSBCT1RUT01fRURHRTtcbiAgICAgICAgdGhpcy5fbGVmdEVkZ2UgPSBMRUZUX0VER0U7XG4gICAgICAgIHRoaXMuX3JpZ2h0RWRnZSA9IFJJR0hUX0VER0U7XG5cbiAgICAgICAgLy9tb2RpZnkgdGhlIGJvdW5kcyB3ZSBkaXNwbGF5IGJhc2VkIG9uIHRoZVxuICAgICAgICAvL2RpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdmlld3BvcnQgcmF0aW8gYW5kXG4gICAgICAgIC8vdGhlIHJhdGlvIG9mIHRoZSBib3VuZHMgb2YgdGhlIG1hbmRlbGJyb3RcbiAgICAgICAgaWYgKHRoaXMuX2ltYWdlUmF0aW8gPiBNQU5ERUxfUkFUSU8pIHtcbiAgICAgICAgICAgIHJhdGlvID0gKHRoaXMuX2ltYWdlUmF0aW8gLyBNQU5ERUxfUkFUSU8pO1xuICAgICAgICAgICAgcHJvZHVjdCA9IChSSUdIVF9FREdFIC0gTEVGVF9FREdFKSAqIHJhdGlvO1xuXG4gICAgICAgICAgICB0aGlzLl9sZWZ0RWRnZSA9IC1wcm9kdWN0ICogKDIuNSAvIDMuNSk7XG4gICAgICAgICAgICB0aGlzLl9yaWdodEVkZ2UgPSBwcm9kdWN0ICogKDEgLyAzLjUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmF0aW8gPSAoTUFOREVMX1JBVElPIC8gdGhpcy5faW1hZ2VSYXRpbyk7XG4gICAgICAgICAgICBwcm9kdWN0ID0gKEJPVFRPTV9FREdFIC0gVE9QX0VER0UpICogcmF0aW87XG5cbiAgICAgICAgICAgIHRoaXMuX3RvcEVkZ2UgPSAtcHJvZHVjdCAvIDIuMDtcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbUVkZ2UgPSBwcm9kdWN0IC8gMi4wO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlUmVhbEJvdW5kYXJpZXMoKSB7XG4gICAgICAgIC8vdGhlIFJlYWwgKOKEnSkgYm91bmRhcmllcyBvZiB0aGUgcmVuZGVyaW5nIGdpdmVuIHRoZSB6b29tIGFuZCBvZmZzZXRcbiAgICAgICAgdGhpcy54TWF4ID0gdGhpcy5fcmlnaHRFZGdlIC8gdGhpcy5fc2NhbGUgKyB0aGlzLl9keDtcbiAgICAgICAgdGhpcy54TWluID0gdGhpcy5fbGVmdEVkZ2UgLyB0aGlzLl9zY2FsZSArIHRoaXMuX2R4O1xuICAgICAgICB0aGlzLnlNYXggPSB0aGlzLl9ib3R0b21FZGdlIC8gdGhpcy5fc2NhbGUgKyB0aGlzLl9keTtcbiAgICAgICAgdGhpcy55TWluID0gdGhpcy5fdG9wRWRnZSAvIHRoaXMuX3NjYWxlICsgdGhpcy5fZHk7XG5cbiAgICAgICAgLy90cmFuc2xhdGlvbiBvZiBcIlBpeGVsIHNwYWNlXCIgdG8gUmVhbCAo4oSdKSBzcGFjZVxuICAgICAgICAvL2kuZS4sIHRoZXNlIHZhcmlhYmxlcyByZXByZXNlbnQgdGhlIFJlYWwgZGlmZmVyZW5jZVxuICAgICAgICAvL2JldHdlZW4gdHdvIHBpeGVscywgaG9yaXpvbmF0YWxseSBhbmQgdmVydGljYWxseVxuICAgICAgICB0aGlzLnhTdGVwID0gKHRoaXMueE1heCAtIHRoaXMueE1pbikgLyB0aGlzLl9pbWFnZURhdGEud2lkdGg7XG4gICAgICAgIHRoaXMueVN0ZXAgPSAodGhpcy55TWF4IC0gdGhpcy55TWluKSAvIHRoaXMuX2ltYWdlRGF0YS5oZWlnaHQ7XG4gICAgfVxuXG4gICAgLy9zY2FsZTogaG93IGZhciB3ZSd2ZSB6b29tZWQgaW4gZnJvbSB0aGUgZGVmYXVsdFxuICAgIC8vZHgwOiBkaXNwbGFjZW1lbnQgb2YgcGVyc3BlY3RpdmUgaG9yaXpvbnRhbGx5XG4gICAgLy9keTA6IGRpc3BsYWNlbWVudCBvZiBwZXJzcGVjdGl2ZSB2ZXJ0aWNhbGx5XG4gICAgcmVuZGVyKHNjYWxlLCBkeDAsIGR5MCkge1xuICAgICAgICB0aGlzLl9zY2FsZSA9IHNjYWxlO1xuXG4gICAgICAgIHRoaXMuX2R4ID0gZHgwIC0gKEhPUklaT05UQUxfT0ZGU0VUIC8gdGhpcy5fc2NhbGUpO1xuICAgICAgICB0aGlzLl9keSA9IGR5MDtcblxuICAgICAgICB0aGlzLnVwZGF0ZVJlYWxCb3VuZGFyaWVzKCk7XG5cbiAgICAgICAgZm9yICh2YXIgY2FudmFzWSA9IDA7IGNhbnZhc1kgPCB0aGlzLl9pbWFnZURhdGEuaGVpZ2h0OyBjYW52YXNZKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNhbnZhc1ggPSAwOyBjYW52YXNYIDwgdGhpcy5faW1hZ2VEYXRhLndpZHRoOyBjYW52YXNYKyspIHtcbiAgICAgICAgICAgICAgICAvL3NjYWxlIHRoZSBwaXhlbCB2YWx1ZXMgdG8gYmUgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIHNldFxuICAgICAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLnJlYWxQb3NpdGlvblRvQ29tcGxleFBvc2l0aW9uKGNhbnZhc1gsIGNhbnZhc1kpO1xuICAgICAgICAgICAgICAgIHZhciB4MCA9IHBvcy54O1xuICAgICAgICAgICAgICAgIHZhciB5MCA9IHBvcy55O1xuXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5fY29sb3JpbmdNZXRob2QoeDAsIHkwLCBPYmplY3QuYXNzaWduKHRoaXMuX29wdGlvbnMsIHtcbiAgICAgICAgICAgICAgICAgICAgcGl4ZWxTaXplOiB0aGlzLnhTdGVwLFxuICAgICAgICAgICAgICAgICAgICBjYW52YXNXaWR0aDogdGhpcy5fY2FudmFzLndpZHRoXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wbG90KGNhbnZhc1gsIGNhbnZhc1ksIGNvbG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vZHJhdyBpdCFcbiAgICAgICAgdGhpcy5fY29udGV4dC5wdXRJbWFnZURhdGEodGhpcy5faW1hZ2VEYXRhLCAwLCAwKTtcbiAgICB9XG5cbiAgICAvL3I9IHRoZSByZWFsIHBhcnQgb2YgdGhlIG51bWJlclxuICAgIC8vYz0gdGhlIGNvbXBsZXggcGFydCBvZiB0aGUgbnVtYmVyXG4gICAgY29tcGxleFBvc2l0aW9uVG9SZWFsUG9zaXRpb24ociwgaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcGFyc2VJbnQoKHIgLSB0aGlzLnhNaW4pIC8gdGhpcy54U3RlcCksXG4gICAgICAgICAgICB5OiBwYXJzZUludCgoaSAtIHRoaXMueU1pbikgLyB0aGlzLnlTdGVwKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlYWxQb3NpdGlvblRvQ29tcGxleFBvc2l0aW9uKHJlYWxYLCByZWFsWSkge1xuICAgICAgICAvL3NjYWxlIHRoZSBwaXhlbCB2YWx1ZXMgdG8gZnJhbWUgdGhlIGJvdW5kcyBvZiB0aGUgc2V0XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB0aGlzLnhNaW4gKyB0aGlzLnhTdGVwICogcmVhbFgsXG4gICAgICAgICAgICB5OiB0aGlzLnlNaW4gKyB0aGlzLnlTdGVwICogcmVhbFlcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmVyO1xuIiwiaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4uLy4uL2dyYXBoaWNzL3JlbmRlcmVyJztcbmltcG9ydCBQYWxldHRlIGZyb20gJy4uLy4uL2dyYXBoaWNzL3BhbGV0dGUnO1xuaW1wb3J0IFVJIGZyb20gJy4vdWknO1xuZXhwb3J0IHtcbiAgICBSZW5kZXJlclxufTtcbmV4cG9ydCB7XG4gICAgUGFsZXR0ZVxufTtcbmV4cG9ydCB7XG4gICAgVUlcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZW5kZXJlciBmcm9tICcuLi8uLi9ncmFwaGljcy9yZW5kZXJlcic7XG5pbXBvcnQge1xuICAgIGh0bWxcbn0gZnJvbSAnY29tbW9uLXRhZ3MnO1xuXG5mdW5jdGlvbiBfcmVuZGVyU2NlbmUociwgdmlld0RhdGEpIHtcbiAgICByLnJlbmRlcih2aWV3RGF0YS5zY2FsZSwgdmlld0RhdGEueCwgdmlld0RhdGEueSk7XG59XG5cbmZ1bmN0aW9uIF9yZW5kZXJDb250cm9scyh1aSwgdmlld0RhdGEpIHtcbiAgICByZXR1cm4gaHRtbCBgXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8YSBpZD1cImdldC1wbmdcIiBocmVmPVwiI1wiIHRhcmdldD1cIl9ibGFua1wiPkdFVCBQTkc8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiem9vbUluKCk7XCI+KzwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiem9vbU91dCgpO1wiPi08L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gb25jbGljaz1cInJlc2V0KCk7XCI+UmVzZXQ8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9XCJzYXZlKCk7XCI+U2F2ZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD1cImxvY2F0aW9uXCI+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzY2FsZVwiPlNjYWxlPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJzY2FsZVwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3ZpZXdEYXRhLnNjYWxlfVwiICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJ4LWxvY2F0aW9uXCI+WDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGlucHV0IGlkPVwieC1sb2NhdGlvblwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3ZpZXdEYXRhLnh9XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwieS1sb2NhdGlvblwiPlk8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cInktbG9jYXRpb25cIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwiJHt2aWV3RGF0YS55fVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gb25jbGljaz1cInNldExvY2F0aW9uKCk7XCI+Z288L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgaWQ9XCJzYXZlZC1saXN0XCI+JHt2aWV3RGF0YS5zYXZlZExvY2F0aW9ucy5tYXAoKGwsIGkpPT57XG4gICAgICAgICAgICByZXR1cm4gaHRtbCBgXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIiBjbGFzcz1cInNhdmVkLWxvY2F0aW9uXCIgZGF0YS1sb2NhdGlvbi1pbmRleD1cIiR7aX1cIj4ke2wubmFtZX19XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICB9KX08L2Rpdj5cbiAgICAgICAgPGRpdiBpZD1cIm1hbmRlbG9nXCI+JHt2aWV3RGF0YS5tYW5kZWxvZy5tYXAoKGwsIGkpPT57XG4gICAgICAgICAgICByZXR1cm4gaHRtbCBgPHA+JHtpfTogJHtsfTwvcD5gO1xuICAgICAgICB9KX08L2Rpdj5cbiAgICBgO1xufVxuXG5jbGFzcyBVSSB7XG4gICAgY29uc3RydWN0b3IoY2FudmFzLCBjb250cm9scykge1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBjYW52YXMgaW5zdGFuY2VvZiBOb2RlID8gY2FudmFzIDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcbiAgICAgICAgdGhpcy5fY29udHJvbHMgPSBjb250cm9scyBpbnN0YW5jZW9mIE5vZGUgPyBjb250cm9scyA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRyb2xzKTtcblxuICAgICAgICB0aGlzLl9yID0gbmV3IFJlbmRlcmVyKHRoaXMuX2NhbnZhcywge1xuICAgICAgICAgICAgY29sb3JpbmdNZXRob2Q6ICdjb250aW51b3VzLWNvbG9yaW5nJyxcbiAgICAgICAgICAgIC8vcGFsZXR0ZTogJ21hdGVyaWFsLWRlc2lnbi1yYWluYm93LWE0MDAnLFxuICAgICAgICAgICAgcGFsZXR0ZTogJ2h1ZS1zaGlmdC1yYWluYm93LWNob2NvbGF0ZScsXG4gICAgICAgICAgICAvL2xvb3BQYWxldHRlOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2luaXRWaWV3RGF0YSA9IHtcbiAgICAgICAgICAgIHNjYWxlOiB0aGlzLl9yLl9zY2FsZSxcbiAgICAgICAgICAgIHg6IHRoaXMuX3IuX2R4LCAvL2hvcml6b250YWwgb2Zmc2V0LCB1c2VkIGZvciBjZW50ZXJpbmcgdGhlIHNldFxuICAgICAgICAgICAgeTogdGhpcy5fci5fZHksXG4gICAgICAgICAgICBjYW52YXNXaWR0aDogdGhpcy5fY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgY2FudmFzSGVpZ2h0OiB0aGlzLl9jYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgc2F2ZWRMb2NhdGlvbnM6IFtdLFxuICAgICAgICAgICAgbWFuZGVsb2c6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fdmlld0hpc3RvcnkgPSBbdGhpcy5faW5pdFZpZXdEYXRhXTtcbiAgICAgICAgdGhpcy5fdmlld0RhdGEgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9pbml0Vmlld0RhdGEpO1xuXG4gICAgICAgIHZhciBzYXZlZERhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xvY2F0aW9ucycpO1xuICAgICAgICBpZiAoc2F2ZWREYXRhKSB7XG4gICAgICAgICAgICB2YXIgc2F2ZWRKU09OID0gSlNPTi5wYXJzZShzYXZlZERhdGEpO1xuICAgICAgICAgICAgaWYoIHNhdmVkSlNPTiBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3RGF0YS5zYXZlZExvY2F0aW9ucyA9IHNhdmVkSlNPTjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgbGV0IHVpID0gdGhpcztcbiAgICAgICAgdmFyIHJlc2l6ZUNhbnZhcyA9ICh0aW1lc3RhbXApPT57XG4gICAgICAgICAgICBpZiAodWkuX3ZpZXdIaXN0b3J5WzBdLmNhbnZhc1dpZHRoICE9PSB1aS5fY2FudmFzLndpZHRoIHx8IHVpLl92aWV3SGlzdG9yeVswXS5jYW52YXNIZWlnaHQgIT09IHVpLl9jYW52YXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdWkubWFuZGVsb2coYHZpZXdwb3J0IHNpemUgY2hhbmdlZGApO1xuICAgICAgICAgICAgICAgIHVpLl92aWV3SGlzdG9yeSA9IFtPYmplY3QuYXNzaWduKHt9LCB1aS5fdmlld0RhdGEpXS5jb25jYXQodWkuX3ZpZXdIaXN0b3J5KTtcbiAgICAgICAgICAgICAgICB1aS5fci51cGRhdGVWaWV3cG9ydFNpemUoKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHVpLl92aWV3RGF0YSwge1xuICAgICAgICAgICAgICAgICAgICBjYW52YXNXaWR0aDogdGhpcy5fY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBjYW52YXNIZWlnaHQ6IHRoaXMuX2NhbnZhcy5oZWlnaHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB1aS5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzaXplQ2FudmFzKTtcbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNpemVDYW52YXMpO1xuXG4gICAgICAgIHRoaXMuX2NhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgcG9zID0gdWkuX3IucmVhbFBvc2l0aW9uVG9Db21wbGV4UG9zaXRpb24oZS5sYXllclgsIGUubGF5ZXJZKTtcbiAgICAgICAgICAgIHVpLl92aWV3RGF0YS54ID0gcG9zLng7XG4gICAgICAgICAgICB1aS5fdmlld0RhdGEueSA9IHBvcy55O1xuICAgICAgICAgICAgdWkuem9vbUluKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHpvb21JbigpIHtcbiAgICAgICAgdGhpcy5fdmlld0RhdGEuc2NhbGUgKj0gMjtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICB6b29tT3V0KCkge1xuICAgICAgICB0aGlzLl92aWV3RGF0YS5zY2FsZSAvPSAyO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vX3JlbmRlckNvbnRyb2xzKHRoaXMsIHRoaXMuX3ZpZXdEYXRhKTtcbiAgICAgICAgX3JlbmRlclNjZW5lKHRoaXMuX3IsIHRoaXMuX3ZpZXdEYXRhKTtcbiAgICB9XG4gICAgICAgIC8vbG9nIHRvIHRoZSBVSSdzIGNvbnNvbGVcbiAgICBtYW5kZWxvZyhtc2cpIHtcbiAgICAgICAgdGhpcy5fdmlld0RhdGEubWFuZGVsb2cucHVzaChgJHsrbmV3IERhdGUoKX0gJHttc2d9LmApO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLl92aWV3RGF0YSwge1xuICAgICAgICAgICAgc2NhbGU6IHRoaXMuX2luaXRWaWV3RGF0YS5zY2FsZSxcbiAgICAgICAgICAgIHg6IHRoaXMuX2luaXRWaWV3RGF0YS54LFxuICAgICAgICAgICAgeTogdGhpcy5faW5pdFZpZXdEYXRhLnlcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgc2F2ZUxvY2F0aW9uKCkge1xuICAgICAgICB2YXIgc2F2ZURhdGEgPSB7fTtcbiAgICAgICAgc2F2ZURhdGEubmFtZSA9ICdsb2NhdGlvbiAnICsgKHRoaXMuX3ZpZXdEYXRhLnNhdmVkTG9jYXRpb25zLmxlbmd0aCArIDEpO1xuICAgICAgICBzYXZlRGF0YS54ID0gdGhpcy5fdmlld0RhdGEueDtcbiAgICAgICAgc2F2ZURhdGEueSA9IHRoaXMuX3ZpZXdEYXRhLnk7XG4gICAgICAgIHNhdmVEYXRhLnNjYWxlID0gdGhpcy5fdmlld0RhdGEuc2NhbGU7XG4gICAgICAgIHRoaXMuX3ZpZXdEYXRhLnNhdmVkTG9jYXRpb25zLnB1c2goc2F2ZURhdGEpO1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xvY2F0aW9ucycsIEpTT04uc3RyaW5naWZ5KHRoaXMuX3ZpZXdEYXRhLnNhdmVkTG9jYXRpb25zKSk7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xzLmlubmVySFRNTCA9IF9yZW5kZXJDb250cm9scyh0aGlzLCB0aGlzLl92aWV3RGF0YSk7XG4gICAgfVxuXG4gICAgbG9hZChsKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5fdmlld0RhdGEsIGwpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgICBiaW5kQ29udHJvbHMoKSB7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xzLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NhdmVkLWxvY2F0aW9uJykuZWFjaChmdW5jdGlvbihpKXtcbiAgICAgICAgICAgIGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9jYXRpb24taW5kZXgnKTtcbiAgICAgICAgICAgICAgICB2YXIgbG9jID0gdGhpcy5fdmlld0RhdGEuc2F2ZWRMb2NhdGlvbnNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvYyk7XG4gICAgICAgICAgICAgICAgLy9sb2FkKGxvYyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVJO1xuXG4vL1RPRE86IHVwZGF0ZSBjYW52YXMgY29tcG9zaXRvciB0byBhIHByb3BlciBFUzYgbW9kdWxlLCBhbmQgdXNlIGl0IGZvciBtb3JlIGludGVyYWN0aXZpdHlcbiJdfQ==
