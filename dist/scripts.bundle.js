
;(function() {
"use strict";

/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A component handler interface using the revealing module design pattern.
 * More details on this design pattern here:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @author Jason Mayes.
 */
/* exported componentHandler */

// Pre-defining the componentHandler interface, for closure documentation and
// static verification.
var componentHandler = {
  /**
   * Searches existing DOM for elements of our component type and upgrades them
   * if they have not already been upgraded.
   *
   * @param {string=} optJsClass the programatic name of the element class we
   * need to create a new instance of.
   * @param {string=} optCssClass the name of the CSS class elements of this
   * type will have.
   */
  upgradeDom: function(optJsClass, optCssClass) {},
  /**
   * Upgrades a specific element rather than all in the DOM.
   *
   * @param {!Element} element The element we wish to upgrade.
   * @param {string=} optJsClass Optional name of the class we want to upgrade
   * the element to.
   */
  upgradeElement: function(element, optJsClass) {},
  /**
   * Upgrades a specific list of elements rather than all in the DOM.
   *
   * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
   * The elements we wish to upgrade.
   */
  upgradeElements: function(elements) {},
  /**
   * Upgrades all registered components found in the current DOM. This is
   * automatically called on window load.
   */
  upgradeAllRegistered: function() {},
  /**
   * Allows user to be alerted to any upgrades that are performed for a given
   * component type
   *
   * @param {string} jsClass The class name of the MDL component we wish
   * to hook into for any upgrades performed.
   * @param {function(!HTMLElement)} callback The function to call upon an
   * upgrade. This function should expect 1 parameter - the HTMLElement which
   * got upgraded.
   */
  registerUpgradedCallback: function(jsClass, callback) {},
  /**
   * Registers a class for future use and attempts to upgrade existing DOM.
   *
   * @param {componentHandler.ComponentConfigPublic} config the registration configuration
   */
  register: function(config) {},
  /**
   * Downgrade either a given node, an array of nodes, or a NodeList.
   *
   * @param {!Node|!Array<!Node>|!NodeList} nodes
   */
  downgradeElements: function(nodes) {}
};

componentHandler = (function() {
  'use strict';

  /** @type {!Array<componentHandler.ComponentConfig>} */
  var registeredComponents_ = [];

  /** @type {!Array<componentHandler.Component>} */
  var createdComponents_ = [];

  var componentConfigProperty_ = 'mdlComponentConfigInternal_';

  /**
   * Searches registered components for a class we are interested in using.
   * Optionally replaces a match with passed object if specified.
   *
   * @param {string} name The name of a class we want to use.
   * @param {componentHandler.ComponentConfig=} optReplace Optional object to replace match with.
   * @return {!Object|boolean}
   * @private
   */
  function findRegisteredClass_(name, optReplace) {
    for (var i = 0; i < registeredComponents_.length; i++) {
      if (registeredComponents_[i].className === name) {
        if (typeof optReplace !== 'undefined') {
          registeredComponents_[i] = optReplace;
        }
        return registeredComponents_[i];
      }
    }
    return false;
  }

  /**
   * Returns an array of the classNames of the upgraded classes on the element.
   *
   * @param {!Element} element The element to fetch data from.
   * @return {!Array<string>}
   * @private
   */
  function getUpgradedListOfElement_(element) {
    var dataUpgraded = element.getAttribute('data-upgraded');
    // Use `['']` as default value to conform the `,name,name...` style.
    return dataUpgraded === null ? [''] : dataUpgraded.split(',');
  }

  /**
   * Returns true if the given element has already been upgraded for the given
   * class.
   *
   * @param {!Element} element The element we want to check.
   * @param {string} jsClass The class to check for.
   * @returns {boolean}
   * @private
   */
  function isElementUpgraded_(element, jsClass) {
    var upgradedList = getUpgradedListOfElement_(element);
    return upgradedList.indexOf(jsClass) !== -1;
  }

  /**
   * Create an event object.
   *
   * @param {string} eventType The type name of the event.
   * @param {boolean} bubbles Whether the event should bubble up the DOM.
   * @param {boolean} cancelable Whether the event can be canceled.
   * @returns {!Event}
   */
  function createEvent_(eventType, bubbles, cancelable) {
    if ('CustomEvent' in window && typeof window.CustomEvent === 'function') {
      return new CustomEvent(eventType, {
        bubbles: bubbles,
        cancelable: cancelable
      });
    } else {
      var ev = document.createEvent('Events');
      ev.initEvent(eventType, bubbles, cancelable);
      return ev;
    }
  }

  /**
   * Searches existing DOM for elements of our component type and upgrades them
   * if they have not already been upgraded.
   *
   * @param {string=} optJsClass the programatic name of the element class we
   * need to create a new instance of.
   * @param {string=} optCssClass the name of the CSS class elements of this
   * type will have.
   */
  function upgradeDomInternal(optJsClass, optCssClass) {
    if (typeof optJsClass === 'undefined' &&
        typeof optCssClass === 'undefined') {
      for (var i = 0; i < registeredComponents_.length; i++) {
        upgradeDomInternal(registeredComponents_[i].className,
            registeredComponents_[i].cssClass);
      }
    } else {
      var jsClass = /** @type {string} */ (optJsClass);
      if (typeof optCssClass === 'undefined') {
        var registeredClass = findRegisteredClass_(jsClass);
        if (registeredClass) {
          optCssClass = registeredClass.cssClass;
        }
      }

      var elements = document.querySelectorAll('.' + optCssClass);
      for (var n = 0; n < elements.length; n++) {
        upgradeElementInternal(elements[n], jsClass);
      }
    }
  }

  /**
   * Upgrades a specific element rather than all in the DOM.
   *
   * @param {!Element} element The element we wish to upgrade.
   * @param {string=} optJsClass Optional name of the class we want to upgrade
   * the element to.
   */
  function upgradeElementInternal(element, optJsClass) {
    // Verify argument type.
    if (!(typeof element === 'object' && element instanceof Element)) {
      throw new Error('Invalid argument provided to upgrade MDL element.');
    }
    // Allow upgrade to be canceled by canceling emitted event.
    var upgradingEv = createEvent_('mdl-componentupgrading', true, true);
    element.dispatchEvent(upgradingEv);
    if (upgradingEv.defaultPrevented) {
      return;
    }

    var upgradedList = getUpgradedListOfElement_(element);
    var classesToUpgrade = [];
    // If jsClass is not provided scan the registered components to find the
    // ones matching the element's CSS classList.
    if (!optJsClass) {
      var classList = element.classList;
      registeredComponents_.forEach(function(component) {
        // Match CSS & Not to be upgraded & Not upgraded.
        if (classList.contains(component.cssClass) &&
            classesToUpgrade.indexOf(component) === -1 &&
            !isElementUpgraded_(element, component.className)) {
          classesToUpgrade.push(component);
        }
      });
    } else if (!isElementUpgraded_(element, optJsClass)) {
      classesToUpgrade.push(findRegisteredClass_(optJsClass));
    }

    // Upgrade the element for each classes.
    for (var i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
      registeredClass = classesToUpgrade[i];
      if (registeredClass) {
        // Mark element as upgraded.
        upgradedList.push(registeredClass.className);
        element.setAttribute('data-upgraded', upgradedList.join(','));
        var instance = new registeredClass.classConstructor(element);
        instance[componentConfigProperty_] = registeredClass;
        createdComponents_.push(instance);
        // Call any callbacks the user has registered with this component type.
        for (var j = 0, m = registeredClass.callbacks.length; j < m; j++) {
          registeredClass.callbacks[j](element);
        }

        if (registeredClass.widget) {
          // Assign per element instance for control over API
          element[registeredClass.className] = instance;
        }
      } else {
        throw new Error(
          'Unable to find a registered component for the given class.');
      }

      var upgradedEv = createEvent_('mdl-componentupgraded', true, false);
      element.dispatchEvent(upgradedEv);
    }
  }

  /**
   * Upgrades a specific list of elements rather than all in the DOM.
   *
   * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
   * The elements we wish to upgrade.
   */
  function upgradeElementsInternal(elements) {
    if (!Array.isArray(elements)) {
      if (elements instanceof Element) {
        elements = [elements];
      } else {
        elements = Array.prototype.slice.call(elements);
      }
    }
    for (var i = 0, n = elements.length, element; i < n; i++) {
      element = elements[i];
      if (element instanceof HTMLElement) {
        upgradeElementInternal(element);
        if (element.children.length > 0) {
          upgradeElementsInternal(element.children);
        }
      }
    }
  }

  /**
   * Registers a class for future use and attempts to upgrade existing DOM.
   *
   * @param {componentHandler.ComponentConfigPublic} config
   */
  function registerInternal(config) {
    // In order to support both Closure-compiled and uncompiled code accessing
    // this method, we need to allow for both the dot and array syntax for
    // property access. You'll therefore see the `foo.bar || foo['bar']`
    // pattern repeated across this method.
    var widgetMissing = (typeof config.widget === 'undefined' &&
        typeof config['widget'] === 'undefined');
    var widget = true;

    if (!widgetMissing) {
      widget = config.widget || config['widget'];
    }

    var newConfig = /** @type {componentHandler.ComponentConfig} */ ({
      classConstructor: config.constructor || config['constructor'],
      className: config.classAsString || config['classAsString'],
      cssClass: config.cssClass || config['cssClass'],
      widget: widget,
      callbacks: []
    });

    registeredComponents_.forEach(function(item) {
      if (item.cssClass === newConfig.cssClass) {
        throw new Error('The provided cssClass has already been registered: ' + item.cssClass);
      }
      if (item.className === newConfig.className) {
        throw new Error('The provided className has already been registered');
      }
    });

    if (config.constructor.prototype
        .hasOwnProperty(componentConfigProperty_)) {
      throw new Error(
          'MDL component classes must not have ' + componentConfigProperty_ +
          ' defined as a property.');
    }

    var found = findRegisteredClass_(config.classAsString, newConfig);

    if (!found) {
      registeredComponents_.push(newConfig);
    }
  }

  /**
   * Allows user to be alerted to any upgrades that are performed for a given
   * component type
   *
   * @param {string} jsClass The class name of the MDL component we wish
   * to hook into for any upgrades performed.
   * @param {function(!HTMLElement)} callback The function to call upon an
   * upgrade. This function should expect 1 parameter - the HTMLElement which
   * got upgraded.
   */
  function registerUpgradedCallbackInternal(jsClass, callback) {
    var regClass = findRegisteredClass_(jsClass);
    if (regClass) {
      regClass.callbacks.push(callback);
    }
  }

  /**
   * Upgrades all registered components found in the current DOM. This is
   * automatically called on window load.
   */
  function upgradeAllRegisteredInternal() {
    for (var n = 0; n < registeredComponents_.length; n++) {
      upgradeDomInternal(registeredComponents_[n].className);
    }
  }

  /**
   * Check the component for the downgrade method.
   * Execute if found.
   * Remove component from createdComponents list.
   *
   * @param {?componentHandler.Component} component
   */
  function deconstructComponentInternal(component) {
    if (component) {
      var componentIndex = createdComponents_.indexOf(component);
      createdComponents_.splice(componentIndex, 1);

      var upgrades = component.element_.getAttribute('data-upgraded').split(',');
      var componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
      upgrades.splice(componentPlace, 1);
      component.element_.setAttribute('data-upgraded', upgrades.join(','));

      var ev = createEvent_('mdl-componentdowngraded', true, false);
      component.element_.dispatchEvent(ev);
    }
  }

  /**
   * Downgrade either a given node, an array of nodes, or a NodeList.
   *
   * @param {!Node|!Array<!Node>|!NodeList} nodes
   */
  function downgradeNodesInternal(nodes) {
    /**
     * Auxiliary function to downgrade a single node.
     * @param  {!Node} node the node to be downgraded
     */
    var downgradeNode = function(node) {
      createdComponents_.filter(function(item) {
        return item.element_ === node;
      }).forEach(deconstructComponentInternal);
    };
    if (nodes instanceof Array || nodes instanceof NodeList) {
      for (var n = 0; n < nodes.length; n++) {
        downgradeNode(nodes[n]);
      }
    } else if (nodes instanceof Node) {
      downgradeNode(nodes);
    } else {
      throw new Error('Invalid argument provided to downgrade MDL nodes.');
    }
  }

  // Now return the functions that should be made public with their publicly
  // facing names...
  return {
    upgradeDom: upgradeDomInternal,
    upgradeElement: upgradeElementInternal,
    upgradeElements: upgradeElementsInternal,
    upgradeAllRegistered: upgradeAllRegisteredInternal,
    registerUpgradedCallback: registerUpgradedCallbackInternal,
    register: registerInternal,
    downgradeElements: downgradeNodesInternal
  };
})();

/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: Function,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: (string|boolean|undefined)
 * }}
 */
componentHandler.ComponentConfigPublic;  // jshint ignore:line

/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: !Function,
 *   className: string,
 *   cssClass: string,
 *   widget: (string|boolean),
 *   callbacks: !Array<function(!HTMLElement)>
 * }}
 */
componentHandler.ComponentConfig;  // jshint ignore:line

/**
 * Created component (i.e., upgraded element) type as managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   element_: !HTMLElement,
 *   className: string,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: string
 * }}
 */
componentHandler.Component;  // jshint ignore:line

// Export all symbols, for the benefit of Closure compiler.
// No effect on uncompiled code.
componentHandler['upgradeDom'] = componentHandler.upgradeDom;
componentHandler['upgradeElement'] = componentHandler.upgradeElement;
componentHandler['upgradeElements'] = componentHandler.upgradeElements;
componentHandler['upgradeAllRegistered'] =
    componentHandler.upgradeAllRegistered;
componentHandler['registerUpgradedCallback'] =
    componentHandler.registerUpgradedCallback;
componentHandler['register'] = componentHandler.register;
componentHandler['downgradeElements'] = componentHandler.downgradeElements;
window.componentHandler = componentHandler;
window['componentHandler'] = componentHandler;

window.addEventListener('load', function() {
  'use strict';

  /**
   * Performs a "Cutting the mustard" test. If the browser supports the features
   * tested, adds a mdl-js class to the <html> element. It then upgrades all MDL
   * components requiring JavaScript.
   */
  if ('classList' in document.createElement('div') &&
      'querySelector' in document &&
      'addEventListener' in window && Array.prototype.forEach) {
    document.documentElement.classList.add('mdl-js');
    componentHandler.upgradeAllRegistered();
  } else {
    /**
     * Dummy function to avoid JS errors.
     */
    componentHandler.upgradeElement = function() {};
    /**
     * Dummy function to avoid JS errors.
     */
    componentHandler.register = function() {};
  }
});

// Source: https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js
// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
// MIT license
if (!Date.now) {
    /**
     * Date.now polyfill.
     * @return {number} the current Date
     */
    Date.now = function () {
        return new Date().getTime();
    };
    Date['now'] = Date.now;
}
var vendors = [
    'webkit',
    'moz'
];
for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    window['requestAnimationFrame'] = window.requestAnimationFrame;
    window['cancelAnimationFrame'] = window.cancelAnimationFrame;
}
if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    /**
     * requestAnimationFrame polyfill.
     * @param  {!Function} callback the callback function.
     */
    window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
            callback(lastTime = nextTime);
        }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
    window['requestAnimationFrame'] = window.requestAnimationFrame;
    window['cancelAnimationFrame'] = window.cancelAnimationFrame;
}
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Button MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialButton = function MaterialButton(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialButton'] = MaterialButton;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialButton.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialButton.prototype.CssClasses_ = {
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-button__ripple-container',
    RIPPLE: 'mdl-ripple'
};
/**
   * Handle blur of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialButton.prototype.blurHandler_ = function (event) {
    if (event) {
        this.element_.blur();
    }
};
// Public methods.
/**
   * Disable button.
   *
   * @public
   */
MaterialButton.prototype.disable = function () {
    this.element_.disabled = true;
};
MaterialButton.prototype['disable'] = MaterialButton.prototype.disable;
/**
   * Enable button.
   *
   * @public
   */
MaterialButton.prototype.enable = function () {
    this.element_.disabled = false;
};
MaterialButton.prototype['enable'] = MaterialButton.prototype.enable;
/**
   * Initialize element.
   */
MaterialButton.prototype.init = function () {
    if (this.element_) {
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            var rippleContainer = document.createElement('span');
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleElement_ = document.createElement('span');
            this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
            rippleContainer.appendChild(this.rippleElement_);
            this.boundRippleBlurHandler = this.blurHandler_.bind(this);
            this.rippleElement_.addEventListener('mouseup', this.boundRippleBlurHandler);
            this.element_.appendChild(rippleContainer);
        }
        this.boundButtonBlurHandler = this.blurHandler_.bind(this);
        this.element_.addEventListener('mouseup', this.boundButtonBlurHandler);
        this.element_.addEventListener('mouseleave', this.boundButtonBlurHandler);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialButton,
    classAsString: 'MaterialButton',
    cssClass: 'mdl-js-button',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Checkbox MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialCheckbox = function MaterialCheckbox(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialCheckbox'] = MaterialCheckbox;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialCheckbox.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialCheckbox.prototype.CssClasses_ = {
    INPUT: 'mdl-checkbox__input',
    BOX_OUTLINE: 'mdl-checkbox__box-outline',
    FOCUS_HELPER: 'mdl-checkbox__focus-helper',
    TICK_OUTLINE: 'mdl-checkbox__tick-outline',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-checkbox__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked',
    IS_UPGRADED: 'is-upgraded'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onChange_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialCheckbox.prototype.onMouseUp_ = function (event) {
    this.blur_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialCheckbox.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialCheckbox.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the inputs toggle state and update display.
   *
   * @public
   */
MaterialCheckbox.prototype.checkToggleState = function () {
    if (this.inputElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialCheckbox.prototype['checkToggleState'] = MaterialCheckbox.prototype.checkToggleState;
/**
   * Check the inputs disabled state and update display.
   *
   * @public
   */
MaterialCheckbox.prototype.checkDisabled = function () {
    if (this.inputElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialCheckbox.prototype['checkDisabled'] = MaterialCheckbox.prototype.checkDisabled;
/**
   * Disable checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.disable = function () {
    this.inputElement_.disabled = true;
    this.updateClasses_();
};
MaterialCheckbox.prototype['disable'] = MaterialCheckbox.prototype.disable;
/**
   * Enable checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.enable = function () {
    this.inputElement_.disabled = false;
    this.updateClasses_();
};
MaterialCheckbox.prototype['enable'] = MaterialCheckbox.prototype.enable;
/**
   * Check checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.check = function () {
    this.inputElement_.checked = true;
    this.updateClasses_();
};
MaterialCheckbox.prototype['check'] = MaterialCheckbox.prototype.check;
/**
   * Uncheck checkbox.
   *
   * @public
   */
MaterialCheckbox.prototype.uncheck = function () {
    this.inputElement_.checked = false;
    this.updateClasses_();
};
MaterialCheckbox.prototype['uncheck'] = MaterialCheckbox.prototype.uncheck;
/**
   * Initialize element.
   */
MaterialCheckbox.prototype.init = function () {
    if (this.element_) {
        this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        var boxOutline = document.createElement('span');
        boxOutline.classList.add(this.CssClasses_.BOX_OUTLINE);
        var tickContainer = document.createElement('span');
        tickContainer.classList.add(this.CssClasses_.FOCUS_HELPER);
        var tickOutline = document.createElement('span');
        tickOutline.classList.add(this.CssClasses_.TICK_OUTLINE);
        boxOutline.appendChild(tickOutline);
        this.element_.appendChild(tickContainer);
        this.element_.appendChild(boxOutline);
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            this.rippleContainerElement_ = document.createElement('span');
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
            this.boundRippleMouseUp = this.onMouseUp_.bind(this);
            this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            this.rippleContainerElement_.appendChild(ripple);
            this.element_.appendChild(this.rippleContainerElement_);
        }
        this.boundInputOnChange = this.onChange_.bind(this);
        this.boundInputOnFocus = this.onFocus_.bind(this);
        this.boundInputOnBlur = this.onBlur_.bind(this);
        this.boundElementMouseUp = this.onMouseUp_.bind(this);
        this.inputElement_.addEventListener('change', this.boundInputOnChange);
        this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
        this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
        this.element_.addEventListener('mouseup', this.boundElementMouseUp);
        this.updateClasses_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialCheckbox,
    classAsString: 'MaterialCheckbox',
    cssClass: 'mdl-js-checkbox',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for icon toggle MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialIconToggle = function MaterialIconToggle(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialIconToggle'] = MaterialIconToggle;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialIconToggle.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialIconToggle.prototype.CssClasses_ = {
    INPUT: 'mdl-icon-toggle__input',
    JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-icon-toggle__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onChange_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialIconToggle.prototype.onMouseUp_ = function (event) {
    this.blur_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialIconToggle.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialIconToggle.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the inputs toggle state and update display.
   *
   * @public
   */
MaterialIconToggle.prototype.checkToggleState = function () {
    if (this.inputElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialIconToggle.prototype['checkToggleState'] = MaterialIconToggle.prototype.checkToggleState;
/**
   * Check the inputs disabled state and update display.
   *
   * @public
   */
MaterialIconToggle.prototype.checkDisabled = function () {
    if (this.inputElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialIconToggle.prototype['checkDisabled'] = MaterialIconToggle.prototype.checkDisabled;
/**
   * Disable icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.disable = function () {
    this.inputElement_.disabled = true;
    this.updateClasses_();
};
MaterialIconToggle.prototype['disable'] = MaterialIconToggle.prototype.disable;
/**
   * Enable icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.enable = function () {
    this.inputElement_.disabled = false;
    this.updateClasses_();
};
MaterialIconToggle.prototype['enable'] = MaterialIconToggle.prototype.enable;
/**
   * Check icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.check = function () {
    this.inputElement_.checked = true;
    this.updateClasses_();
};
MaterialIconToggle.prototype['check'] = MaterialIconToggle.prototype.check;
/**
   * Uncheck icon toggle.
   *
   * @public
   */
MaterialIconToggle.prototype.uncheck = function () {
    this.inputElement_.checked = false;
    this.updateClasses_();
};
MaterialIconToggle.prototype['uncheck'] = MaterialIconToggle.prototype.uncheck;
/**
   * Initialize element.
   */
MaterialIconToggle.prototype.init = function () {
    if (this.element_) {
        this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        if (this.element_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            this.rippleContainerElement_ = document.createElement('span');
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleContainerElement_.classList.add(this.CssClasses_.JS_RIPPLE_EFFECT);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
            this.boundRippleMouseUp = this.onMouseUp_.bind(this);
            this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            this.rippleContainerElement_.appendChild(ripple);
            this.element_.appendChild(this.rippleContainerElement_);
        }
        this.boundInputOnChange = this.onChange_.bind(this);
        this.boundInputOnFocus = this.onFocus_.bind(this);
        this.boundInputOnBlur = this.onBlur_.bind(this);
        this.boundElementOnMouseUp = this.onMouseUp_.bind(this);
        this.inputElement_.addEventListener('change', this.boundInputOnChange);
        this.inputElement_.addEventListener('focus', this.boundInputOnFocus);
        this.inputElement_.addEventListener('blur', this.boundInputOnBlur);
        this.element_.addEventListener('mouseup', this.boundElementOnMouseUp);
        this.updateClasses_();
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialIconToggle,
    classAsString: 'MaterialIconToggle',
    cssClass: 'mdl-js-icon-toggle',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for dropdown MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialMenu = function MaterialMenu(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialMenu'] = MaterialMenu;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialMenu.prototype.Constant_ = {
    // Total duration of the menu animation.
    TRANSITION_DURATION_SECONDS: 0.3,
    // The fraction of the total duration we want to use for menu item animations.
    TRANSITION_DURATION_FRACTION: 0.8,
    // How long the menu stays open after choosing an option (so the user can see
    // the ripple).
    CLOSE_TIMEOUT: 150
};
/**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */
MaterialMenu.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP_ARROW: 38,
    DOWN_ARROW: 40
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialMenu.prototype.CssClasses_ = {
    CONTAINER: 'mdl-menu__container',
    OUTLINE: 'mdl-menu__outline',
    ITEM: 'mdl-menu__item',
    ITEM_RIPPLE_CONTAINER: 'mdl-menu__item-ripple-container',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    // Statuses
    IS_UPGRADED: 'is-upgraded',
    IS_VISIBLE: 'is-visible',
    IS_ANIMATING: 'is-animating',
    // Alignment options
    BOTTOM_LEFT: 'mdl-menu--bottom-left',
    // This is the default.
    BOTTOM_RIGHT: 'mdl-menu--bottom-right',
    TOP_LEFT: 'mdl-menu--top-left',
    TOP_RIGHT: 'mdl-menu--top-right',
    UNALIGNED: 'mdl-menu--unaligned'
};
/**
   * Initialize element.
   */
MaterialMenu.prototype.init = function () {
    if (this.element_) {
        // Create container for the menu.
        var container = document.createElement('div');
        container.classList.add(this.CssClasses_.CONTAINER);
        this.element_.parentElement.insertBefore(container, this.element_);
        this.element_.parentElement.removeChild(this.element_);
        container.appendChild(this.element_);
        this.container_ = container;
        // Create outline for the menu (shadow and background).
        var outline = document.createElement('div');
        outline.classList.add(this.CssClasses_.OUTLINE);
        this.outline_ = outline;
        container.insertBefore(outline, this.element_);
        // Find the "for" element and bind events to it.
        var forElId = this.element_.getAttribute('for') || this.element_.getAttribute('data-mdl-for');
        var forEl = null;
        if (forElId) {
            forEl = document.getElementById(forElId);
            if (forEl) {
                this.forElement_ = forEl;
                forEl.addEventListener('click', this.handleForClick_.bind(this));
                forEl.addEventListener('keydown', this.handleForKeyboardEvent_.bind(this));
            }
        }
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
        this.boundItemKeydown_ = this.handleItemKeyboardEvent_.bind(this);
        this.boundItemClick_ = this.handleItemClick_.bind(this);
        for (var i = 0; i < items.length; i++) {
            // Add a listener to each menu item.
            items[i].addEventListener('click', this.boundItemClick_);
            // Add a tab index to each menu item.
            items[i].tabIndex = '-1';
            // Add a keyboard listener to each menu item.
            items[i].addEventListener('keydown', this.boundItemKeydown_);
        }
        // Add ripple classes to each item, if the user has enabled ripples.
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            for (i = 0; i < items.length; i++) {
                var item = items[i];
                var rippleContainer = document.createElement('span');
                rippleContainer.classList.add(this.CssClasses_.ITEM_RIPPLE_CONTAINER);
                var ripple = document.createElement('span');
                ripple.classList.add(this.CssClasses_.RIPPLE);
                rippleContainer.appendChild(ripple);
                item.appendChild(rippleContainer);
                item.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            }
        }
        // Copy alignment classes to the container, so the outline can use them.
        if (this.element_.classList.contains(this.CssClasses_.BOTTOM_LEFT)) {
            this.outline_.classList.add(this.CssClasses_.BOTTOM_LEFT);
        }
        if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
            this.outline_.classList.add(this.CssClasses_.BOTTOM_RIGHT);
        }
        if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
            this.outline_.classList.add(this.CssClasses_.TOP_LEFT);
        }
        if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
            this.outline_.classList.add(this.CssClasses_.TOP_RIGHT);
        }
        if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
            this.outline_.classList.add(this.CssClasses_.UNALIGNED);
        }
        container.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
/**
   * Handles a click on the "for" element, by positioning the menu and then
   * toggling it.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleForClick_ = function (evt) {
    if (this.element_ && this.forElement_) {
        var rect = this.forElement_.getBoundingClientRect();
        var forRect = this.forElement_.parentElement.getBoundingClientRect();
        if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
        } else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
            // Position below the "for" element, aligned to its right.
            this.container_.style.right = forRect.right - rect.right + 'px';
            this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
        } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
            // Position above the "for" element, aligned to its left.
            this.container_.style.left = this.forElement_.offsetLeft + 'px';
            this.container_.style.bottom = forRect.bottom - rect.top + 'px';
        } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
            // Position above the "for" element, aligned to its right.
            this.container_.style.right = forRect.right - rect.right + 'px';
            this.container_.style.bottom = forRect.bottom - rect.top + 'px';
        } else {
            // Default: position below the "for" element, aligned to its left.
            this.container_.style.left = this.forElement_.offsetLeft + 'px';
            this.container_.style.top = this.forElement_.offsetTop + this.forElement_.offsetHeight + 'px';
        }
    }
    this.toggle(evt);
};
/**
   * Handles a keyboard event on the "for" element.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleForKeyboardEvent_ = function (evt) {
    if (this.element_ && this.container_ && this.forElement_) {
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
        if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
            if (evt.keyCode === this.Keycodes_.UP_ARROW) {
                evt.preventDefault();
                items[items.length - 1].focus();
            } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
                evt.preventDefault();
                items[0].focus();
            }
        }
    }
};
/**
   * Handles a keyboard event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleItemKeyboardEvent_ = function (evt) {
    if (this.element_ && this.container_) {
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM + ':not([disabled])');
        if (items && items.length > 0 && this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
            var currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);
            if (evt.keyCode === this.Keycodes_.UP_ARROW) {
                evt.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1].focus();
                } else {
                    items[items.length - 1].focus();
                }
            } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
                evt.preventDefault();
                if (items.length > currentIndex + 1) {
                    items[currentIndex + 1].focus();
                } else {
                    items[0].focus();
                }
            } else if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
                evt.preventDefault();
                // Send mousedown and mouseup to trigger ripple.
                var e = new MouseEvent('mousedown');
                evt.target.dispatchEvent(e);
                e = new MouseEvent('mouseup');
                evt.target.dispatchEvent(e);
                // Send click.
                evt.target.click();
            } else if (evt.keyCode === this.Keycodes_.ESCAPE) {
                evt.preventDefault();
                this.hide();
            }
        }
    }
};
/**
   * Handles a click event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialMenu.prototype.handleItemClick_ = function (evt) {
    if (evt.target.hasAttribute('disabled')) {
        evt.stopPropagation();
    } else {
        // Wait some time before closing menu, so the user can see the ripple.
        this.closing_ = true;
        window.setTimeout(function (evt) {
            this.hide();
            this.closing_ = false;
        }.bind(this), this.Constant_.CLOSE_TIMEOUT);
    }
};
/**
   * Calculates the initial clip (for opening the menu) or final clip (for closing
   * it), and applies it. This allows us to animate from or to the correct point,
   * that is, the point it's aligned to in the "for" element.
   *
   * @param {number} height Height of the clip rectangle
   * @param {number} width Width of the clip rectangle
   * @private
   */
MaterialMenu.prototype.applyClip_ = function (height, width) {
    if (this.element_.classList.contains(this.CssClasses_.UNALIGNED)) {
        // Do not clip.
        this.element_.style.clip = '';
    } else if (this.element_.classList.contains(this.CssClasses_.BOTTOM_RIGHT)) {
        // Clip to the top right corner of the menu.
        this.element_.style.clip = 'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
    } else if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT)) {
        // Clip to the bottom left corner of the menu.
        this.element_.style.clip = 'rect(' + height + 'px 0 ' + height + 'px 0)';
    } else if (this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
        // Clip to the bottom right corner of the menu.
        this.element_.style.clip = 'rect(' + height + 'px ' + width + 'px ' + height + 'px ' + width + 'px)';
    } else {
        // Default: do not clip (same as clipping to the top left corner).
        this.element_.style.clip = '';
    }
};
/**
   * Cleanup function to remove animation listeners.
   *
   * @param {Event} evt
   * @private
   */
MaterialMenu.prototype.removeAnimationEndListener_ = function (evt) {
    evt.target.classList.remove(MaterialMenu.prototype.CssClasses_.IS_ANIMATING);
};
/**
   * Adds an event listener to clean up after the animation ends.
   *
   * @private
   */
MaterialMenu.prototype.addAnimationEndListener_ = function () {
    this.element_.addEventListener('transitionend', this.removeAnimationEndListener_);
    this.element_.addEventListener('webkitTransitionEnd', this.removeAnimationEndListener_);
};
/**
   * Displays the menu.
   *
   * @public
   */
MaterialMenu.prototype.show = function (evt) {
    if (this.element_ && this.container_ && this.outline_) {
        // Measure the inner element.
        var height = this.element_.getBoundingClientRect().height;
        var width = this.element_.getBoundingClientRect().width;
        // Apply the inner element's size to the container and outline.
        this.container_.style.width = width + 'px';
        this.container_.style.height = height + 'px';
        this.outline_.style.width = width + 'px';
        this.outline_.style.height = height + 'px';
        var transitionDuration = this.Constant_.TRANSITION_DURATION_SECONDS * this.Constant_.TRANSITION_DURATION_FRACTION;
        // Calculate transition delays for individual menu items, so that they fade
        // in one at a time.
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
        for (var i = 0; i < items.length; i++) {
            var itemDelay = null;
            if (this.element_.classList.contains(this.CssClasses_.TOP_LEFT) || this.element_.classList.contains(this.CssClasses_.TOP_RIGHT)) {
                itemDelay = (height - items[i].offsetTop - items[i].offsetHeight) / height * transitionDuration + 's';
            } else {
                itemDelay = items[i].offsetTop / height * transitionDuration + 's';
            }
            items[i].style.transitionDelay = itemDelay;
        }
        // Apply the initial clip to the text before we start animating.
        this.applyClip_(height, width);
        // Wait for the next frame, turn on animation, and apply the final clip.
        // Also make it visible. This triggers the transitions.
        window.requestAnimationFrame(function () {
            this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
            this.element_.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
            this.container_.classList.add(this.CssClasses_.IS_VISIBLE);
        }.bind(this));
        // Clean up after the animation is complete.
        this.addAnimationEndListener_();
        // Add a click listener to the document, to close the menu.
        var callback = function (e) {
            // Check to see if the document is processing the same event that
            // displayed the menu in the first place. If so, do nothing.
            // Also check to see if the menu is in the process of closing itself, and
            // do nothing in that case.
            // Also check if the clicked element is a menu item
            // if so, do nothing.
            if (e !== evt && !this.closing_ && e.target.parentNode !== this.element_) {
                document.removeEventListener('click', callback);
                this.hide();
            }
        }.bind(this);
        document.addEventListener('click', callback);
    }
};
MaterialMenu.prototype['show'] = MaterialMenu.prototype.show;
/**
   * Hides the menu.
   *
   * @public
   */
MaterialMenu.prototype.hide = function () {
    if (this.element_ && this.container_ && this.outline_) {
        var items = this.element_.querySelectorAll('.' + this.CssClasses_.ITEM);
        // Remove all transition delays; menu items fade out concurrently.
        for (var i = 0; i < items.length; i++) {
            items[i].style.removeProperty('transition-delay');
        }
        // Measure the inner element.
        var rect = this.element_.getBoundingClientRect();
        var height = rect.height;
        var width = rect.width;
        // Turn on animation, and apply the final clip. Also make invisible.
        // This triggers the transitions.
        this.element_.classList.add(this.CssClasses_.IS_ANIMATING);
        this.applyClip_(height, width);
        this.container_.classList.remove(this.CssClasses_.IS_VISIBLE);
        // Clean up after the animation is complete.
        this.addAnimationEndListener_();
    }
};
MaterialMenu.prototype['hide'] = MaterialMenu.prototype.hide;
/**
   * Displays or hides the menu, depending on current state.
   *
   * @public
   */
MaterialMenu.prototype.toggle = function (evt) {
    if (this.container_.classList.contains(this.CssClasses_.IS_VISIBLE)) {
        this.hide();
    } else {
        this.show(evt);
    }
};
MaterialMenu.prototype['toggle'] = MaterialMenu.prototype.toggle;
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialMenu,
    classAsString: 'MaterialMenu',
    cssClass: 'mdl-js-menu',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Progress MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialProgress = function MaterialProgress(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialProgress'] = MaterialProgress;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialProgress.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialProgress.prototype.CssClasses_ = { INDETERMINATE_CLASS: 'mdl-progress__indeterminate' };
/**
   * Set the current progress of the progressbar.
   *
   * @param {number} p Percentage of the progress (0-100)
   * @public
   */
MaterialProgress.prototype.setProgress = function (p) {
    if (this.element_.classList.contains(this.CssClasses_.INDETERMINATE_CLASS)) {
        return;
    }
    this.progressbar_.style.width = p + '%';
};
MaterialProgress.prototype['setProgress'] = MaterialProgress.prototype.setProgress;
/**
   * Set the current progress of the buffer.
   *
   * @param {number} p Percentage of the buffer (0-100)
   * @public
   */
MaterialProgress.prototype.setBuffer = function (p) {
    this.bufferbar_.style.width = p + '%';
    this.auxbar_.style.width = 100 - p + '%';
};
MaterialProgress.prototype['setBuffer'] = MaterialProgress.prototype.setBuffer;
/**
   * Initialize element.
   */
MaterialProgress.prototype.init = function () {
    if (this.element_) {
        var el = document.createElement('div');
        el.className = 'progressbar bar bar1';
        this.element_.appendChild(el);
        this.progressbar_ = el;
        el = document.createElement('div');
        el.className = 'bufferbar bar bar2';
        this.element_.appendChild(el);
        this.bufferbar_ = el;
        el = document.createElement('div');
        el.className = 'auxbar bar bar3';
        this.element_.appendChild(el);
        this.auxbar_ = el;
        this.progressbar_.style.width = '0%';
        this.bufferbar_.style.width = '100%';
        this.auxbar_.style.width = '0%';
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialProgress,
    classAsString: 'MaterialProgress',
    cssClass: 'mdl-js-progress',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Radio MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialRadio = function MaterialRadio(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialRadio'] = MaterialRadio;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialRadio.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialRadio.prototype.CssClasses_ = {
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked',
    IS_UPGRADED: 'is-upgraded',
    JS_RADIO: 'mdl-js-radio',
    RADIO_BTN: 'mdl-radio__button',
    RADIO_OUTER_CIRCLE: 'mdl-radio__outer-circle',
    RADIO_INNER_CIRCLE: 'mdl-radio__inner-circle',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-radio__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onChange_ = function (event) {
    // Since other radio buttons don't get change events, we need to look for
    // them to update their classes.
    var radios = document.getElementsByClassName(this.CssClasses_.JS_RADIO);
    for (var i = 0; i < radios.length; i++) {
        var button = radios[i].querySelector('.' + this.CssClasses_.RADIO_BTN);
        // Different name == different group, so no point updating those.
        if (button.getAttribute('name') === this.btnElement_.getAttribute('name')) {
            if (typeof radios[i]['MaterialRadio'] !== 'undefined') {
                radios[i]['MaterialRadio'].updateClasses_();
            }
        }
    }
};
/**
   * Handle focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRadio.prototype.onMouseup_ = function (event) {
    this.blur_();
};
/**
   * Update classes.
   *
   * @private
   */
MaterialRadio.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialRadio.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.btnElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the components disabled state.
   *
   * @public
   */
MaterialRadio.prototype.checkDisabled = function () {
    if (this.btnElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialRadio.prototype['checkDisabled'] = MaterialRadio.prototype.checkDisabled;
/**
   * Check the components toggled state.
   *
   * @public
   */
MaterialRadio.prototype.checkToggleState = function () {
    if (this.btnElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialRadio.prototype['checkToggleState'] = MaterialRadio.prototype.checkToggleState;
/**
   * Disable radio.
   *
   * @public
   */
MaterialRadio.prototype.disable = function () {
    this.btnElement_.disabled = true;
    this.updateClasses_();
};
MaterialRadio.prototype['disable'] = MaterialRadio.prototype.disable;
/**
   * Enable radio.
   *
   * @public
   */
MaterialRadio.prototype.enable = function () {
    this.btnElement_.disabled = false;
    this.updateClasses_();
};
MaterialRadio.prototype['enable'] = MaterialRadio.prototype.enable;
/**
   * Check radio.
   *
   * @public
   */
MaterialRadio.prototype.check = function () {
    this.btnElement_.checked = true;
    this.onChange_(null);
};
MaterialRadio.prototype['check'] = MaterialRadio.prototype.check;
/**
   * Uncheck radio.
   *
   * @public
   */
MaterialRadio.prototype.uncheck = function () {
    this.btnElement_.checked = false;
    this.onChange_(null);
};
MaterialRadio.prototype['uncheck'] = MaterialRadio.prototype.uncheck;
/**
   * Initialize element.
   */
MaterialRadio.prototype.init = function () {
    if (this.element_) {
        this.btnElement_ = this.element_.querySelector('.' + this.CssClasses_.RADIO_BTN);
        this.boundChangeHandler_ = this.onChange_.bind(this);
        this.boundFocusHandler_ = this.onChange_.bind(this);
        this.boundBlurHandler_ = this.onBlur_.bind(this);
        this.boundMouseUpHandler_ = this.onMouseup_.bind(this);
        var outerCircle = document.createElement('span');
        outerCircle.classList.add(this.CssClasses_.RADIO_OUTER_CIRCLE);
        var innerCircle = document.createElement('span');
        innerCircle.classList.add(this.CssClasses_.RADIO_INNER_CIRCLE);
        this.element_.appendChild(outerCircle);
        this.element_.appendChild(innerCircle);
        var rippleContainer;
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            rippleContainer = document.createElement('span');
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CENTER);
            rippleContainer.addEventListener('mouseup', this.boundMouseUpHandler_);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            rippleContainer.appendChild(ripple);
            this.element_.appendChild(rippleContainer);
        }
        this.btnElement_.addEventListener('change', this.boundChangeHandler_);
        this.btnElement_.addEventListener('focus', this.boundFocusHandler_);
        this.btnElement_.addEventListener('blur', this.boundBlurHandler_);
        this.element_.addEventListener('mouseup', this.boundMouseUpHandler_);
        this.updateClasses_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialRadio,
    classAsString: 'MaterialRadio',
    cssClass: 'mdl-js-radio',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Slider MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialSlider = function MaterialSlider(element) {
    this.element_ = element;
    // Browser feature detection.
    this.isIE_ = window.navigator.msPointerEnabled;
    // Initialize instance.
    this.init();
};
window['MaterialSlider'] = MaterialSlider;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSlider.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSlider.prototype.CssClasses_ = {
    IE_CONTAINER: 'mdl-slider__ie-container',
    SLIDER_CONTAINER: 'mdl-slider__container',
    BACKGROUND_FLEX: 'mdl-slider__background-flex',
    BACKGROUND_LOWER: 'mdl-slider__background-lower',
    BACKGROUND_UPPER: 'mdl-slider__background-upper',
    IS_LOWEST_VALUE: 'is-lowest-value',
    IS_UPGRADED: 'is-upgraded'
};
/**
   * Handle input on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSlider.prototype.onInput_ = function (event) {
    this.updateValueStyles_();
};
/**
   * Handle change on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSlider.prototype.onChange_ = function (event) {
    this.updateValueStyles_();
};
/**
   * Handle mouseup on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSlider.prototype.onMouseUp_ = function (event) {
    event.target.blur();
};
/**
   * Handle mousedown on container element.
   * This handler is purpose is to not require the use to click
   * exactly on the 2px slider element, as FireFox seems to be very
   * strict about this.
   *
   * @param {Event} event The event that fired.
   * @private
   * @suppress {missingProperties}
   */
MaterialSlider.prototype.onContainerMouseDown_ = function (event) {
    // If this click is not on the parent element (but rather some child)
    // ignore. It may still bubble up.
    if (event.target !== this.element_.parentElement) {
        return;
    }
    // Discard the original event and create a new event that
    // is on the slider element.
    event.preventDefault();
    var newEvent = new MouseEvent('mousedown', {
        target: event.target,
        buttons: event.buttons,
        clientX: event.clientX,
        clientY: this.element_.getBoundingClientRect().y
    });
    this.element_.dispatchEvent(newEvent);
};
/**
   * Handle updating of values.
   *
   * @private
   */
MaterialSlider.prototype.updateValueStyles_ = function () {
    // Calculate and apply percentages to div structure behind slider.
    var fraction = (this.element_.value - this.element_.min) / (this.element_.max - this.element_.min);
    if (fraction === 0) {
        this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE);
    }
    if (!this.isIE_) {
        this.backgroundLower_.style.flex = fraction;
        this.backgroundLower_.style.webkitFlex = fraction;
        this.backgroundUpper_.style.flex = 1 - fraction;
        this.backgroundUpper_.style.webkitFlex = 1 - fraction;
    }
};
// Public methods.
/**
   * Disable slider.
   *
   * @public
   */
MaterialSlider.prototype.disable = function () {
    this.element_.disabled = true;
};
MaterialSlider.prototype['disable'] = MaterialSlider.prototype.disable;
/**
   * Enable slider.
   *
   * @public
   */
MaterialSlider.prototype.enable = function () {
    this.element_.disabled = false;
};
MaterialSlider.prototype['enable'] = MaterialSlider.prototype.enable;
/**
   * Update slider value.
   *
   * @param {number} value The value to which to set the control (optional).
   * @public
   */
MaterialSlider.prototype.change = function (value) {
    if (typeof value !== 'undefined') {
        this.element_.value = value;
    }
    this.updateValueStyles_();
};
MaterialSlider.prototype['change'] = MaterialSlider.prototype.change;
/**
   * Initialize element.
   */
MaterialSlider.prototype.init = function () {
    if (this.element_) {
        if (this.isIE_) {
            // Since we need to specify a very large height in IE due to
            // implementation limitations, we add a parent here that trims it down to
            // a reasonable size.
            var containerIE = document.createElement('div');
            containerIE.classList.add(this.CssClasses_.IE_CONTAINER);
            this.element_.parentElement.insertBefore(containerIE, this.element_);
            this.element_.parentElement.removeChild(this.element_);
            containerIE.appendChild(this.element_);
        } else {
            // For non-IE browsers, we need a div structure that sits behind the
            // slider and allows us to style the left and right sides of it with
            // different colors.
            var container = document.createElement('div');
            container.classList.add(this.CssClasses_.SLIDER_CONTAINER);
            this.element_.parentElement.insertBefore(container, this.element_);
            this.element_.parentElement.removeChild(this.element_);
            container.appendChild(this.element_);
            var backgroundFlex = document.createElement('div');
            backgroundFlex.classList.add(this.CssClasses_.BACKGROUND_FLEX);
            container.appendChild(backgroundFlex);
            this.backgroundLower_ = document.createElement('div');
            this.backgroundLower_.classList.add(this.CssClasses_.BACKGROUND_LOWER);
            backgroundFlex.appendChild(this.backgroundLower_);
            this.backgroundUpper_ = document.createElement('div');
            this.backgroundUpper_.classList.add(this.CssClasses_.BACKGROUND_UPPER);
            backgroundFlex.appendChild(this.backgroundUpper_);
        }
        this.boundInputHandler = this.onInput_.bind(this);
        this.boundChangeHandler = this.onChange_.bind(this);
        this.boundMouseUpHandler = this.onMouseUp_.bind(this);
        this.boundContainerMouseDownHandler = this.onContainerMouseDown_.bind(this);
        this.element_.addEventListener('input', this.boundInputHandler);
        this.element_.addEventListener('change', this.boundChangeHandler);
        this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
        this.element_.parentElement.addEventListener('mousedown', this.boundContainerMouseDownHandler);
        this.updateValueStyles_();
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSlider,
    classAsString: 'MaterialSlider',
    cssClass: 'mdl-js-slider',
    widget: true
});
/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Snackbar MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialSnackbar = function MaterialSnackbar(element) {
    this.element_ = element;
    this.textElement_ = this.element_.querySelector('.' + this.cssClasses_.MESSAGE);
    this.actionElement_ = this.element_.querySelector('.' + this.cssClasses_.ACTION);
    if (!this.textElement_) {
        throw new Error('There must be a message element for a snackbar.');
    }
    if (!this.actionElement_) {
        throw new Error('There must be an action element for a snackbar.');
    }
    this.active = false;
    this.actionHandler_ = undefined;
    this.message_ = undefined;
    this.actionText_ = undefined;
    this.queuedNotifications_ = [];
    this.setActionHidden_(true);
};
window['MaterialSnackbar'] = MaterialSnackbar;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSnackbar.prototype.Constant_ = {
    // The duration of the snackbar show/hide animation, in ms.
    ANIMATION_LENGTH: 250
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSnackbar.prototype.cssClasses_ = {
    SNACKBAR: 'mdl-snackbar',
    MESSAGE: 'mdl-snackbar__text',
    ACTION: 'mdl-snackbar__action',
    ACTIVE: 'mdl-snackbar--active'
};
/**
   * Display the snackbar.
   *
   * @private
   */
MaterialSnackbar.prototype.displaySnackbar_ = function () {
    this.element_.setAttribute('aria-hidden', 'true');
    if (this.actionHandler_) {
        this.actionElement_.textContent = this.actionText_;
        this.actionElement_.addEventListener('click', this.actionHandler_);
        this.setActionHidden_(false);
    }
    this.textElement_.textContent = this.message_;
    this.element_.classList.add(this.cssClasses_.ACTIVE);
    this.element_.setAttribute('aria-hidden', 'false');
    setTimeout(this.cleanup_.bind(this), this.timeout_);
};
/**
   * Show the snackbar.
   *
   * @param {Object} data The data for the notification.
   * @public
   */
MaterialSnackbar.prototype.showSnackbar = function (data) {
    if (data === undefined) {
        throw new Error('Please provide a data object with at least a message to display.');
    }
    if (data['message'] === undefined) {
        throw new Error('Please provide a message to be displayed.');
    }
    if (data['actionHandler'] && !data['actionText']) {
        throw new Error('Please provide action text with the handler.');
    }
    if (this.active) {
        this.queuedNotifications_.push(data);
    } else {
        this.active = true;
        this.message_ = data['message'];
        if (data['timeout']) {
            this.timeout_ = data['timeout'];
        } else {
            this.timeout_ = 2750;
        }
        if (data['actionHandler']) {
            this.actionHandler_ = data['actionHandler'];
        }
        if (data['actionText']) {
            this.actionText_ = data['actionText'];
        }
        this.displaySnackbar_();
    }
};
MaterialSnackbar.prototype['showSnackbar'] = MaterialSnackbar.prototype.showSnackbar;
/**
   * Check if the queue has items within it.
   * If it does, display the next entry.
   *
   * @private
   */
MaterialSnackbar.prototype.checkQueue_ = function () {
    if (this.queuedNotifications_.length > 0) {
        this.showSnackbar(this.queuedNotifications_.shift());
    }
};
/**
   * Cleanup the snackbar event listeners and accessiblity attributes.
   *
   * @private
   */
MaterialSnackbar.prototype.cleanup_ = function () {
    this.element_.classList.remove(this.cssClasses_.ACTIVE);
    setTimeout(function () {
        this.element_.setAttribute('aria-hidden', 'true');
        this.textElement_.textContent = '';
        if (!Boolean(this.actionElement_.getAttribute('aria-hidden'))) {
            this.setActionHidden_(true);
            this.actionElement_.textContent = '';
            this.actionElement_.removeEventListener('click', this.actionHandler_);
        }
        this.actionHandler_ = undefined;
        this.message_ = undefined;
        this.actionText_ = undefined;
        this.active = false;
        this.checkQueue_();
    }.bind(this), this.Constant_.ANIMATION_LENGTH);
};
/**
   * Set the action handler hidden state.
   *
   * @param {boolean} value
   * @private
   */
MaterialSnackbar.prototype.setActionHidden_ = function (value) {
    if (value) {
        this.actionElement_.setAttribute('aria-hidden', 'true');
    } else {
        this.actionElement_.removeAttribute('aria-hidden');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSnackbar,
    classAsString: 'MaterialSnackbar',
    cssClass: 'mdl-js-snackbar',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Spinner MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   * @constructor
   */
var MaterialSpinner = function MaterialSpinner(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialSpinner'] = MaterialSpinner;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSpinner.prototype.Constant_ = { MDL_SPINNER_LAYER_COUNT: 4 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSpinner.prototype.CssClasses_ = {
    MDL_SPINNER_LAYER: 'mdl-spinner__layer',
    MDL_SPINNER_CIRCLE_CLIPPER: 'mdl-spinner__circle-clipper',
    MDL_SPINNER_CIRCLE: 'mdl-spinner__circle',
    MDL_SPINNER_GAP_PATCH: 'mdl-spinner__gap-patch',
    MDL_SPINNER_LEFT: 'mdl-spinner__left',
    MDL_SPINNER_RIGHT: 'mdl-spinner__right'
};
/**
   * Auxiliary method to create a spinner layer.
   *
   * @param {number} index Index of the layer to be created.
   * @public
   */
MaterialSpinner.prototype.createLayer = function (index) {
    var layer = document.createElement('div');
    layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER);
    layer.classList.add(this.CssClasses_.MDL_SPINNER_LAYER + '-' + index);
    var leftClipper = document.createElement('div');
    leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
    leftClipper.classList.add(this.CssClasses_.MDL_SPINNER_LEFT);
    var gapPatch = document.createElement('div');
    gapPatch.classList.add(this.CssClasses_.MDL_SPINNER_GAP_PATCH);
    var rightClipper = document.createElement('div');
    rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
    rightClipper.classList.add(this.CssClasses_.MDL_SPINNER_RIGHT);
    var circleOwners = [
        leftClipper,
        gapPatch,
        rightClipper
    ];
    for (var i = 0; i < circleOwners.length; i++) {
        var circle = document.createElement('div');
        circle.classList.add(this.CssClasses_.MDL_SPINNER_CIRCLE);
        circleOwners[i].appendChild(circle);
    }
    layer.appendChild(leftClipper);
    layer.appendChild(gapPatch);
    layer.appendChild(rightClipper);
    this.element_.appendChild(layer);
};
MaterialSpinner.prototype['createLayer'] = MaterialSpinner.prototype.createLayer;
/**
   * Stops the spinner animation.
   * Public method for users who need to stop the spinner for any reason.
   *
   * @public
   */
MaterialSpinner.prototype.stop = function () {
    this.element_.classList.remove('is-active');
};
MaterialSpinner.prototype['stop'] = MaterialSpinner.prototype.stop;
/**
   * Starts the spinner animation.
   * Public method for users who need to manually start the spinner for any reason
   * (instead of just adding the 'is-active' class to their markup).
   *
   * @public
   */
MaterialSpinner.prototype.start = function () {
    this.element_.classList.add('is-active');
};
MaterialSpinner.prototype['start'] = MaterialSpinner.prototype.start;
/**
   * Initialize element.
   */
MaterialSpinner.prototype.init = function () {
    if (this.element_) {
        for (var i = 1; i <= this.Constant_.MDL_SPINNER_LAYER_COUNT; i++) {
            this.createLayer(i);
        }
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSpinner,
    classAsString: 'MaterialSpinner',
    cssClass: 'mdl-js-spinner',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Checkbox MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialSwitch = function MaterialSwitch(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialSwitch'] = MaterialSwitch;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialSwitch.prototype.Constant_ = { TINY_TIMEOUT: 0.001 };
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialSwitch.prototype.CssClasses_ = {
    INPUT: 'mdl-switch__input',
    TRACK: 'mdl-switch__track',
    THUMB: 'mdl-switch__thumb',
    FOCUS_HELPER: 'mdl-switch__focus-helper',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE_CONTAINER: 'mdl-switch__ripple-container',
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE: 'mdl-ripple',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_CHECKED: 'is-checked'
};
/**
   * Handle change of state.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onChange_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle mouseup.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialSwitch.prototype.onMouseUp_ = function (event) {
    this.blur_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialSwitch.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkToggleState();
};
/**
   * Add blur.
   *
   * @private
   */
MaterialSwitch.prototype.blur_ = function () {
    // TODO: figure out why there's a focus event being fired after our blur,
    // so that we can avoid this hack.
    window.setTimeout(function () {
        this.inputElement_.blur();
    }.bind(this), this.Constant_.TINY_TIMEOUT);
};
// Public methods.
/**
   * Check the components disabled state.
   *
   * @public
   */
MaterialSwitch.prototype.checkDisabled = function () {
    if (this.inputElement_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialSwitch.prototype['checkDisabled'] = MaterialSwitch.prototype.checkDisabled;
/**
   * Check the components toggled state.
   *
   * @public
   */
MaterialSwitch.prototype.checkToggleState = function () {
    if (this.inputElement_.checked) {
        this.element_.classList.add(this.CssClasses_.IS_CHECKED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
    }
};
MaterialSwitch.prototype['checkToggleState'] = MaterialSwitch.prototype.checkToggleState;
/**
   * Disable switch.
   *
   * @public
   */
MaterialSwitch.prototype.disable = function () {
    this.inputElement_.disabled = true;
    this.updateClasses_();
};
MaterialSwitch.prototype['disable'] = MaterialSwitch.prototype.disable;
/**
   * Enable switch.
   *
   * @public
   */
MaterialSwitch.prototype.enable = function () {
    this.inputElement_.disabled = false;
    this.updateClasses_();
};
MaterialSwitch.prototype['enable'] = MaterialSwitch.prototype.enable;
/**
   * Activate switch.
   *
   * @public
   */
MaterialSwitch.prototype.on = function () {
    this.inputElement_.checked = true;
    this.updateClasses_();
};
MaterialSwitch.prototype['on'] = MaterialSwitch.prototype.on;
/**
   * Deactivate switch.
   *
   * @public
   */
MaterialSwitch.prototype.off = function () {
    this.inputElement_.checked = false;
    this.updateClasses_();
};
MaterialSwitch.prototype['off'] = MaterialSwitch.prototype.off;
/**
   * Initialize element.
   */
MaterialSwitch.prototype.init = function () {
    if (this.element_) {
        this.inputElement_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        var track = document.createElement('div');
        track.classList.add(this.CssClasses_.TRACK);
        var thumb = document.createElement('div');
        thumb.classList.add(this.CssClasses_.THUMB);
        var focusHelper = document.createElement('span');
        focusHelper.classList.add(this.CssClasses_.FOCUS_HELPER);
        thumb.appendChild(focusHelper);
        this.element_.appendChild(track);
        this.element_.appendChild(thumb);
        this.boundMouseUpHandler = this.onMouseUp_.bind(this);
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            this.element_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            this.rippleContainerElement_ = document.createElement('span');
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_EFFECT);
            this.rippleContainerElement_.classList.add(this.CssClasses_.RIPPLE_CENTER);
            this.rippleContainerElement_.addEventListener('mouseup', this.boundMouseUpHandler);
            var ripple = document.createElement('span');
            ripple.classList.add(this.CssClasses_.RIPPLE);
            this.rippleContainerElement_.appendChild(ripple);
            this.element_.appendChild(this.rippleContainerElement_);
        }
        this.boundChangeHandler = this.onChange_.bind(this);
        this.boundFocusHandler = this.onFocus_.bind(this);
        this.boundBlurHandler = this.onBlur_.bind(this);
        this.inputElement_.addEventListener('change', this.boundChangeHandler);
        this.inputElement_.addEventListener('focus', this.boundFocusHandler);
        this.inputElement_.addEventListener('blur', this.boundBlurHandler);
        this.element_.addEventListener('mouseup', this.boundMouseUpHandler);
        this.updateClasses_();
        this.element_.classList.add('is-upgraded');
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialSwitch,
    classAsString: 'MaterialSwitch',
    cssClass: 'mdl-js-switch',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Tabs MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
var MaterialTabs = function MaterialTabs(element) {
    // Stores the HTML element.
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialTabs'] = MaterialTabs;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string}
   * @private
   */
MaterialTabs.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialTabs.prototype.CssClasses_ = {
    TAB_CLASS: 'mdl-tabs__tab',
    PANEL_CLASS: 'mdl-tabs__panel',
    ACTIVE_CLASS: 'is-active',
    UPGRADED_CLASS: 'is-upgraded',
    MDL_JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    MDL_RIPPLE_CONTAINER: 'mdl-tabs__ripple-container',
    MDL_RIPPLE: 'mdl-ripple',
    MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events'
};
/**
   * Handle clicks to a tabs component
   *
   * @private
   */
MaterialTabs.prototype.initTabs_ = function () {
    if (this.element_.classList.contains(this.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
        this.element_.classList.add(this.CssClasses_.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);
    }
    // Select element tabs, document panels
    this.tabs_ = this.element_.querySelectorAll('.' + this.CssClasses_.TAB_CLASS);
    this.panels_ = this.element_.querySelectorAll('.' + this.CssClasses_.PANEL_CLASS);
    // Create new tabs for each tab element
    for (var i = 0; i < this.tabs_.length; i++) {
        new MaterialTab(this.tabs_[i], this);
    }
    this.element_.classList.add(this.CssClasses_.UPGRADED_CLASS);
};
/**
   * Reset tab state, dropping active classes
   *
   * @private
   */
MaterialTabs.prototype.resetTabState_ = function () {
    for (var k = 0; k < this.tabs_.length; k++) {
        this.tabs_[k].classList.remove(this.CssClasses_.ACTIVE_CLASS);
    }
};
/**
   * Reset panel state, droping active classes
   *
   * @private
   */
MaterialTabs.prototype.resetPanelState_ = function () {
    for (var j = 0; j < this.panels_.length; j++) {
        this.panels_[j].classList.remove(this.CssClasses_.ACTIVE_CLASS);
    }
};
/**
   * Initialize element.
   */
MaterialTabs.prototype.init = function () {
    if (this.element_) {
        this.initTabs_();
    }
};
/**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {Element} tab The HTML element for the tab.
   * @param {MaterialTabs} ctx The MaterialTabs object that owns the tab.
   */
function MaterialTab(tab, ctx) {
    if (tab) {
        if (ctx.element_.classList.contains(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT)) {
            var rippleContainer = document.createElement('span');
            rippleContainer.classList.add(ctx.CssClasses_.MDL_RIPPLE_CONTAINER);
            rippleContainer.classList.add(ctx.CssClasses_.MDL_JS_RIPPLE_EFFECT);
            var ripple = document.createElement('span');
            ripple.classList.add(ctx.CssClasses_.MDL_RIPPLE);
            rippleContainer.appendChild(ripple);
            tab.appendChild(rippleContainer);
        }
        tab.addEventListener('click', function (e) {
            if (tab.getAttribute('href').charAt(0) === '#') {
                e.preventDefault();
                var href = tab.href.split('#')[1];
                var panel = ctx.element_.querySelector('#' + href);
                ctx.resetTabState_();
                ctx.resetPanelState_();
                tab.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
                panel.classList.add(ctx.CssClasses_.ACTIVE_CLASS);
            }
        });
    }
}
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialTabs,
    classAsString: 'MaterialTabs',
    cssClass: 'mdl-js-tabs'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Textfield MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialTextfield = function MaterialTextfield(element) {
    this.element_ = element;
    this.maxRows = this.Constant_.NO_MAX_ROWS;
    // Initialize instance.
    this.init();
};
window['MaterialTextfield'] = MaterialTextfield;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialTextfield.prototype.Constant_ = {
    NO_MAX_ROWS: -1,
    MAX_ROWS_ATTRIBUTE: 'maxrows'
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialTextfield.prototype.CssClasses_ = {
    LABEL: 'mdl-textfield__label',
    INPUT: 'mdl-textfield__input',
    IS_DIRTY: 'is-dirty',
    IS_FOCUSED: 'is-focused',
    IS_DISABLED: 'is-disabled',
    IS_INVALID: 'is-invalid',
    IS_UPGRADED: 'is-upgraded',
    HAS_PLACEHOLDER: 'has-placeholder'
};
/**
   * Handle input being entered.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onKeyDown_ = function (event) {
    var currentRowCount = event.target.value.split('\n').length;
    if (event.keyCode === 13) {
        if (currentRowCount >= this.maxRows) {
            event.preventDefault();
        }
    }
};
/**
   * Handle focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onFocus_ = function (event) {
    this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle lost focus.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onBlur_ = function (event) {
    this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};
/**
   * Handle reset event from out side.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTextfield.prototype.onReset_ = function (event) {
    this.updateClasses_();
};
/**
   * Handle class updates.
   *
   * @private
   */
MaterialTextfield.prototype.updateClasses_ = function () {
    this.checkDisabled();
    this.checkValidity();
    this.checkDirty();
    this.checkFocus();
};
// Public methods.
/**
   * Check the disabled state and update field accordingly.
   *
   * @public
   */
MaterialTextfield.prototype.checkDisabled = function () {
    if (this.input_.disabled) {
        this.element_.classList.add(this.CssClasses_.IS_DISABLED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
    }
};
MaterialTextfield.prototype['checkDisabled'] = MaterialTextfield.prototype.checkDisabled;
/**
  * Check the focus state and update field accordingly.
  *
  * @public
  */
MaterialTextfield.prototype.checkFocus = function () {
    if (Boolean(this.element_.querySelector(':focus'))) {
        this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
    }
};
MaterialTextfield.prototype['checkFocus'] = MaterialTextfield.prototype.checkFocus;
/**
   * Check the validity state and update field accordingly.
   *
   * @public
   */
MaterialTextfield.prototype.checkValidity = function () {
    if (this.input_.validity) {
        if (this.input_.validity.valid) {
            this.element_.classList.remove(this.CssClasses_.IS_INVALID);
        } else {
            this.element_.classList.add(this.CssClasses_.IS_INVALID);
        }
    }
};
MaterialTextfield.prototype['checkValidity'] = MaterialTextfield.prototype.checkValidity;
/**
   * Check the dirty state and update field accordingly.
   *
   * @public
   */
MaterialTextfield.prototype.checkDirty = function () {
    if (this.input_.value && this.input_.value.length > 0) {
        this.element_.classList.add(this.CssClasses_.IS_DIRTY);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
    }
};
MaterialTextfield.prototype['checkDirty'] = MaterialTextfield.prototype.checkDirty;
/**
   * Disable text field.
   *
   * @public
   */
MaterialTextfield.prototype.disable = function () {
    this.input_.disabled = true;
    this.updateClasses_();
};
MaterialTextfield.prototype['disable'] = MaterialTextfield.prototype.disable;
/**
   * Enable text field.
   *
   * @public
   */
MaterialTextfield.prototype.enable = function () {
    this.input_.disabled = false;
    this.updateClasses_();
};
MaterialTextfield.prototype['enable'] = MaterialTextfield.prototype.enable;
/**
   * Update text field value.
   *
   * @param {string} value The value to which to set the control (optional).
   * @public
   */
MaterialTextfield.prototype.change = function (value) {
    this.input_.value = value || '';
    this.updateClasses_();
};
MaterialTextfield.prototype['change'] = MaterialTextfield.prototype.change;
/**
   * Initialize element.
   */
MaterialTextfield.prototype.init = function () {
    if (this.element_) {
        this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
        this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);
        if (this.input_) {
            if (this.input_.hasAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE)) {
                this.maxRows = parseInt(this.input_.getAttribute(this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
                if (isNaN(this.maxRows)) {
                    this.maxRows = this.Constant_.NO_MAX_ROWS;
                }
            }
            if (this.input_.hasAttribute('placeholder')) {
                this.element_.classList.add(this.CssClasses_.HAS_PLACEHOLDER);
            }
            this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
            this.boundFocusHandler = this.onFocus_.bind(this);
            this.boundBlurHandler = this.onBlur_.bind(this);
            this.boundResetHandler = this.onReset_.bind(this);
            this.input_.addEventListener('input', this.boundUpdateClassesHandler);
            this.input_.addEventListener('focus', this.boundFocusHandler);
            this.input_.addEventListener('blur', this.boundBlurHandler);
            this.input_.addEventListener('reset', this.boundResetHandler);
            if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
                // TODO: This should handle pasting multi line text.
                // Currently doesn't.
                this.boundKeyDownHandler = this.onKeyDown_.bind(this);
                this.input_.addEventListener('keydown', this.boundKeyDownHandler);
            }
            var invalid = this.element_.classList.contains(this.CssClasses_.IS_INVALID);
            this.updateClasses_();
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
            if (invalid) {
                this.element_.classList.add(this.CssClasses_.IS_INVALID);
            }
            if (this.input_.hasAttribute('autofocus')) {
                this.element_.focus();
                this.checkFocus();
            }
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialTextfield,
    classAsString: 'MaterialTextfield',
    cssClass: 'mdl-js-textfield',
    widget: true
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Tooltip MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialTooltip = function MaterialTooltip(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialTooltip'] = MaterialTooltip;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialTooltip.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialTooltip.prototype.CssClasses_ = {
    IS_ACTIVE: 'is-active',
    BOTTOM: 'mdl-tooltip--bottom',
    LEFT: 'mdl-tooltip--left',
    RIGHT: 'mdl-tooltip--right',
    TOP: 'mdl-tooltip--top'
};
/**
   * Handle mouseenter for tooltip.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialTooltip.prototype.handleMouseEnter_ = function (event) {
    var props = event.target.getBoundingClientRect();
    var left = props.left + props.width / 2;
    var top = props.top + props.height / 2;
    var marginLeft = -1 * (this.element_.offsetWidth / 2);
    var marginTop = -1 * (this.element_.offsetHeight / 2);
    if (this.element_.classList.contains(this.CssClasses_.LEFT) || this.element_.classList.contains(this.CssClasses_.RIGHT)) {
        left = props.width / 2;
        if (top + marginTop < 0) {
            this.element_.style.top = '0';
            this.element_.style.marginTop = '0';
        } else {
            this.element_.style.top = top + 'px';
            this.element_.style.marginTop = marginTop + 'px';
        }
    } else {
        if (left + marginLeft < 0) {
            this.element_.style.left = '0';
            this.element_.style.marginLeft = '0';
        } else {
            this.element_.style.left = left + 'px';
            this.element_.style.marginLeft = marginLeft + 'px';
        }
    }
    if (this.element_.classList.contains(this.CssClasses_.TOP)) {
        this.element_.style.top = props.top - this.element_.offsetHeight - 10 + 'px';
    } else if (this.element_.classList.contains(this.CssClasses_.RIGHT)) {
        this.element_.style.left = props.left + props.width + 10 + 'px';
    } else if (this.element_.classList.contains(this.CssClasses_.LEFT)) {
        this.element_.style.left = props.left - this.element_.offsetWidth - 10 + 'px';
    } else {
        this.element_.style.top = props.top + props.height + 10 + 'px';
    }
    this.element_.classList.add(this.CssClasses_.IS_ACTIVE);
};
/**
   * Hide tooltip on mouseleave or scroll
   *
   * @private
   */
MaterialTooltip.prototype.hideTooltip_ = function () {
    this.element_.classList.remove(this.CssClasses_.IS_ACTIVE);
};
/**
   * Initialize element.
   */
MaterialTooltip.prototype.init = function () {
    if (this.element_) {
        var forElId = this.element_.getAttribute('for') || this.element_.getAttribute('data-mdl-for');
        if (forElId) {
            this.forElement_ = document.getElementById(forElId);
        }
        if (this.forElement_) {
            // It's left here because it prevents accidental text selection on Android
            if (!this.forElement_.hasAttribute('tabindex')) {
                this.forElement_.setAttribute('tabindex', '0');
            }
            this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
            this.boundMouseLeaveAndScrollHandler = this.hideTooltip_.bind(this);
            this.forElement_.addEventListener('mouseenter', this.boundMouseEnterHandler, false);
            this.forElement_.addEventListener('touchend', this.boundMouseEnterHandler, false);
            this.forElement_.addEventListener('mouseleave', this.boundMouseLeaveAndScrollHandler, false);
            window.addEventListener('scroll', this.boundMouseLeaveAndScrollHandler, true);
            window.addEventListener('touchstart', this.boundMouseLeaveAndScrollHandler);
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialTooltip,
    classAsString: 'MaterialTooltip',
    cssClass: 'mdl-tooltip'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Layout MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialLayout = function MaterialLayout(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialLayout'] = MaterialLayout;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialLayout.prototype.Constant_ = {
    MAX_WIDTH: '(max-width: 1024px)',
    TAB_SCROLL_PIXELS: 100,
    RESIZE_TIMEOUT: 100,
    MENU_ICON: '&#xE5D2;',
    CHEVRON_LEFT: 'chevron_left',
    CHEVRON_RIGHT: 'chevron_right'
};
/**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */
MaterialLayout.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32
};
/**
   * Modes.
   *
   * @enum {number}
   * @private
   */
MaterialLayout.prototype.Mode_ = {
    STANDARD: 0,
    SEAMED: 1,
    WATERFALL: 2,
    SCROLL: 3
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialLayout.prototype.CssClasses_ = {
    CONTAINER: 'mdl-layout__container',
    HEADER: 'mdl-layout__header',
    DRAWER: 'mdl-layout__drawer',
    CONTENT: 'mdl-layout__content',
    DRAWER_BTN: 'mdl-layout__drawer-button',
    ICON: 'material-icons',
    JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-layout__tab-ripple-container',
    RIPPLE: 'mdl-ripple',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    HEADER_SEAMED: 'mdl-layout__header--seamed',
    HEADER_WATERFALL: 'mdl-layout__header--waterfall',
    HEADER_SCROLL: 'mdl-layout__header--scroll',
    FIXED_HEADER: 'mdl-layout--fixed-header',
    OBFUSCATOR: 'mdl-layout__obfuscator',
    TAB_BAR: 'mdl-layout__tab-bar',
    TAB_CONTAINER: 'mdl-layout__tab-bar-container',
    TAB: 'mdl-layout__tab',
    TAB_BAR_BUTTON: 'mdl-layout__tab-bar-button',
    TAB_BAR_LEFT_BUTTON: 'mdl-layout__tab-bar-left-button',
    TAB_BAR_RIGHT_BUTTON: 'mdl-layout__tab-bar-right-button',
    TAB_MANUAL_SWITCH: 'mdl-layout__tab-manual-switch',
    PANEL: 'mdl-layout__tab-panel',
    HAS_DRAWER: 'has-drawer',
    HAS_TABS: 'has-tabs',
    HAS_SCROLLING_HEADER: 'has-scrolling-header',
    CASTING_SHADOW: 'is-casting-shadow',
    IS_COMPACT: 'is-compact',
    IS_SMALL_SCREEN: 'is-small-screen',
    IS_DRAWER_OPEN: 'is-visible',
    IS_ACTIVE: 'is-active',
    IS_UPGRADED: 'is-upgraded',
    IS_ANIMATING: 'is-animating',
    ON_LARGE_SCREEN: 'mdl-layout--large-screen-only',
    ON_SMALL_SCREEN: 'mdl-layout--small-screen-only'
};
/**
   * Handles scrolling on the content.
   *
   * @private
   */
MaterialLayout.prototype.contentScrollHandler_ = function () {
    if (this.header_.classList.contains(this.CssClasses_.IS_ANIMATING)) {
        return;
    }
    var headerVisible = !this.element_.classList.contains(this.CssClasses_.IS_SMALL_SCREEN) || this.element_.classList.contains(this.CssClasses_.FIXED_HEADER);
    if (this.content_.scrollTop > 0 && !this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
        this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
        this.header_.classList.add(this.CssClasses_.IS_COMPACT);
        if (headerVisible) {
            this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
        }
    } else if (this.content_.scrollTop <= 0 && this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
        this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
        this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
        if (headerVisible) {
            this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
        }
    }
};
/**
   * Handles a keyboard event on the drawer.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialLayout.prototype.keyboardEventHandler_ = function (evt) {
    // Only react when the drawer is open.
    if (evt.keyCode === this.Keycodes_.ESCAPE && this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
        this.toggleDrawer();
    }
};
/**
   * Handles changes in screen size.
   *
   * @private
   */
MaterialLayout.prototype.screenSizeHandler_ = function () {
    if (this.screenSizeMediaQuery_.matches) {
        this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN);
    } else {
        this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN);
        // Collapse drawer (if any) when moving to a large screen size.
        if (this.drawer_) {
            this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
            this.obfuscator_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
        }
    }
};
/**
   * Handles events of drawer button.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
MaterialLayout.prototype.drawerToggleHandler_ = function (evt) {
    if (evt && evt.type === 'keydown') {
        if (evt.keyCode === this.Keycodes_.SPACE || evt.keyCode === this.Keycodes_.ENTER) {
            // prevent scrolling in drawer nav
            evt.preventDefault();
        } else {
            // prevent other keys
            return;
        }
    }
    this.toggleDrawer();
};
/**
   * Handles (un)setting the `is-animating` class
   *
   * @private
   */
MaterialLayout.prototype.headerTransitionEndHandler_ = function () {
    this.header_.classList.remove(this.CssClasses_.IS_ANIMATING);
};
/**
   * Handles expanding the header on click
   *
   * @private
   */
MaterialLayout.prototype.headerClickHandler_ = function () {
    if (this.header_.classList.contains(this.CssClasses_.IS_COMPACT)) {
        this.header_.classList.remove(this.CssClasses_.IS_COMPACT);
        this.header_.classList.add(this.CssClasses_.IS_ANIMATING);
    }
};
/**
   * Reset tab state, dropping active classes
   *
   * @private
   */
MaterialLayout.prototype.resetTabState_ = function (tabBar) {
    for (var k = 0; k < tabBar.length; k++) {
        tabBar[k].classList.remove(this.CssClasses_.IS_ACTIVE);
    }
};
/**
   * Reset panel state, droping active classes
   *
   * @private
   */
MaterialLayout.prototype.resetPanelState_ = function (panels) {
    for (var j = 0; j < panels.length; j++) {
        panels[j].classList.remove(this.CssClasses_.IS_ACTIVE);
    }
};
/**
  * Toggle drawer state
  *
  * @public
  */
MaterialLayout.prototype.toggleDrawer = function () {
    var drawerButton = this.element_.querySelector('.' + this.CssClasses_.DRAWER_BTN);
    this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
    this.obfuscator_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
    // Set accessibility properties.
    if (this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
        this.drawer_.setAttribute('aria-hidden', 'false');
        drawerButton.setAttribute('aria-expanded', 'true');
    } else {
        this.drawer_.setAttribute('aria-hidden', 'true');
        drawerButton.setAttribute('aria-expanded', 'false');
    }
};
MaterialLayout.prototype['toggleDrawer'] = MaterialLayout.prototype.toggleDrawer;
/**
   * Initialize element.
   */
MaterialLayout.prototype.init = function () {
    if (this.element_) {
        var container = document.createElement('div');
        container.classList.add(this.CssClasses_.CONTAINER);
        var focusedElement = this.element_.querySelector(':focus');
        this.element_.parentElement.insertBefore(container, this.element_);
        this.element_.parentElement.removeChild(this.element_);
        container.appendChild(this.element_);
        if (focusedElement) {
            focusedElement.focus();
        }
        var directChildren = this.element_.childNodes;
        var numChildren = directChildren.length;
        for (var c = 0; c < numChildren; c++) {
            var child = directChildren[c];
            if (child.classList && child.classList.contains(this.CssClasses_.HEADER)) {
                this.header_ = child;
            }
            if (child.classList && child.classList.contains(this.CssClasses_.DRAWER)) {
                this.drawer_ = child;
            }
            if (child.classList && child.classList.contains(this.CssClasses_.CONTENT)) {
                this.content_ = child;
            }
        }
        window.addEventListener('pageshow', function (e) {
            if (e.persisted) {
                // when page is loaded from back/forward cache
                // trigger repaint to let layout scroll in safari
                this.element_.style.overflowY = 'hidden';
                requestAnimationFrame(function () {
                    this.element_.style.overflowY = '';
                }.bind(this));
            }
        }.bind(this), false);
        if (this.header_) {
            this.tabBar_ = this.header_.querySelector('.' + this.CssClasses_.TAB_BAR);
        }
        var mode = this.Mode_.STANDARD;
        if (this.header_) {
            if (this.header_.classList.contains(this.CssClasses_.HEADER_SEAMED)) {
                mode = this.Mode_.SEAMED;
            } else if (this.header_.classList.contains(this.CssClasses_.HEADER_WATERFALL)) {
                mode = this.Mode_.WATERFALL;
                this.header_.addEventListener('transitionend', this.headerTransitionEndHandler_.bind(this));
                this.header_.addEventListener('click', this.headerClickHandler_.bind(this));
            } else if (this.header_.classList.contains(this.CssClasses_.HEADER_SCROLL)) {
                mode = this.Mode_.SCROLL;
                container.classList.add(this.CssClasses_.HAS_SCROLLING_HEADER);
            }
            if (mode === this.Mode_.STANDARD) {
                this.header_.classList.add(this.CssClasses_.CASTING_SHADOW);
                if (this.tabBar_) {
                    this.tabBar_.classList.add(this.CssClasses_.CASTING_SHADOW);
                }
            } else if (mode === this.Mode_.SEAMED || mode === this.Mode_.SCROLL) {
                this.header_.classList.remove(this.CssClasses_.CASTING_SHADOW);
                if (this.tabBar_) {
                    this.tabBar_.classList.remove(this.CssClasses_.CASTING_SHADOW);
                }
            } else if (mode === this.Mode_.WATERFALL) {
                // Add and remove shadows depending on scroll position.
                // Also add/remove auxiliary class for styling of the compact version of
                // the header.
                this.content_.addEventListener('scroll', this.contentScrollHandler_.bind(this));
                this.contentScrollHandler_();
            }
        }
        // Add drawer toggling button to our layout, if we have an openable drawer.
        if (this.drawer_) {
            var drawerButton = this.element_.querySelector('.' + this.CssClasses_.DRAWER_BTN);
            if (!drawerButton) {
                drawerButton = document.createElement('div');
                drawerButton.setAttribute('aria-expanded', 'false');
                drawerButton.setAttribute('role', 'button');
                drawerButton.setAttribute('tabindex', '0');
                drawerButton.classList.add(this.CssClasses_.DRAWER_BTN);
                var drawerButtonIcon = document.createElement('i');
                drawerButtonIcon.classList.add(this.CssClasses_.ICON);
                drawerButtonIcon.innerHTML = this.Constant_.MENU_ICON;
                drawerButton.appendChild(drawerButtonIcon);
            }
            if (this.drawer_.classList.contains(this.CssClasses_.ON_LARGE_SCREEN)) {
                //If drawer has ON_LARGE_SCREEN class then add it to the drawer toggle button as well.
                drawerButton.classList.add(this.CssClasses_.ON_LARGE_SCREEN);
            } else if (this.drawer_.classList.contains(this.CssClasses_.ON_SMALL_SCREEN)) {
                //If drawer has ON_SMALL_SCREEN class then add it to the drawer toggle button as well.
                drawerButton.classList.add(this.CssClasses_.ON_SMALL_SCREEN);
            }
            drawerButton.addEventListener('click', this.drawerToggleHandler_.bind(this));
            drawerButton.addEventListener('keydown', this.drawerToggleHandler_.bind(this));
            // Add a class if the layout has a drawer, for altering the left padding.
            // Adds the HAS_DRAWER to the elements since this.header_ may or may
            // not be present.
            this.element_.classList.add(this.CssClasses_.HAS_DRAWER);
            // If we have a fixed header, add the button to the header rather than
            // the layout.
            if (this.element_.classList.contains(this.CssClasses_.FIXED_HEADER)) {
                this.header_.insertBefore(drawerButton, this.header_.firstChild);
            } else {
                this.element_.insertBefore(drawerButton, this.content_);
            }
            var obfuscator = document.createElement('div');
            obfuscator.classList.add(this.CssClasses_.OBFUSCATOR);
            this.element_.appendChild(obfuscator);
            obfuscator.addEventListener('click', this.drawerToggleHandler_.bind(this));
            this.obfuscator_ = obfuscator;
            this.drawer_.addEventListener('keydown', this.keyboardEventHandler_.bind(this));
            this.drawer_.setAttribute('aria-hidden', 'true');
        }
        // Keep an eye on screen size, and add/remove auxiliary class for styling
        // of small screens.
        this.screenSizeMediaQuery_ = window.matchMedia(this.Constant_.MAX_WIDTH);
        this.screenSizeMediaQuery_.addListener(this.screenSizeHandler_.bind(this));
        this.screenSizeHandler_();
        // Initialize tabs, if any.
        if (this.header_ && this.tabBar_) {
            this.element_.classList.add(this.CssClasses_.HAS_TABS);
            var tabContainer = document.createElement('div');
            tabContainer.classList.add(this.CssClasses_.TAB_CONTAINER);
            this.header_.insertBefore(tabContainer, this.tabBar_);
            this.header_.removeChild(this.tabBar_);
            var leftButton = document.createElement('div');
            leftButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
            leftButton.classList.add(this.CssClasses_.TAB_BAR_LEFT_BUTTON);
            var leftButtonIcon = document.createElement('i');
            leftButtonIcon.classList.add(this.CssClasses_.ICON);
            leftButtonIcon.textContent = this.Constant_.CHEVRON_LEFT;
            leftButton.appendChild(leftButtonIcon);
            leftButton.addEventListener('click', function () {
                this.tabBar_.scrollLeft -= this.Constant_.TAB_SCROLL_PIXELS;
            }.bind(this));
            var rightButton = document.createElement('div');
            rightButton.classList.add(this.CssClasses_.TAB_BAR_BUTTON);
            rightButton.classList.add(this.CssClasses_.TAB_BAR_RIGHT_BUTTON);
            var rightButtonIcon = document.createElement('i');
            rightButtonIcon.classList.add(this.CssClasses_.ICON);
            rightButtonIcon.textContent = this.Constant_.CHEVRON_RIGHT;
            rightButton.appendChild(rightButtonIcon);
            rightButton.addEventListener('click', function () {
                this.tabBar_.scrollLeft += this.Constant_.TAB_SCROLL_PIXELS;
            }.bind(this));
            tabContainer.appendChild(leftButton);
            tabContainer.appendChild(this.tabBar_);
            tabContainer.appendChild(rightButton);
            // Add and remove tab buttons depending on scroll position and total
            // window size.
            var tabUpdateHandler = function () {
                if (this.tabBar_.scrollLeft > 0) {
                    leftButton.classList.add(this.CssClasses_.IS_ACTIVE);
                } else {
                    leftButton.classList.remove(this.CssClasses_.IS_ACTIVE);
                }
                if (this.tabBar_.scrollLeft < this.tabBar_.scrollWidth - this.tabBar_.offsetWidth) {
                    rightButton.classList.add(this.CssClasses_.IS_ACTIVE);
                } else {
                    rightButton.classList.remove(this.CssClasses_.IS_ACTIVE);
                }
            }.bind(this);
            this.tabBar_.addEventListener('scroll', tabUpdateHandler);
            tabUpdateHandler();
            // Update tabs when the window resizes.
            var windowResizeHandler = function () {
                // Use timeouts to make sure it doesn't happen too often.
                if (this.resizeTimeoutId_) {
                    clearTimeout(this.resizeTimeoutId_);
                }
                this.resizeTimeoutId_ = setTimeout(function () {
                    tabUpdateHandler();
                    this.resizeTimeoutId_ = null;
                }.bind(this), this.Constant_.RESIZE_TIMEOUT);
            }.bind(this);
            window.addEventListener('resize', windowResizeHandler);
            if (this.tabBar_.classList.contains(this.CssClasses_.JS_RIPPLE_EFFECT)) {
                this.tabBar_.classList.add(this.CssClasses_.RIPPLE_IGNORE_EVENTS);
            }
            // Select element tabs, document panels
            var tabs = this.tabBar_.querySelectorAll('.' + this.CssClasses_.TAB);
            var panels = this.content_.querySelectorAll('.' + this.CssClasses_.PANEL);
            // Create new tabs for each tab element
            for (var i = 0; i < tabs.length; i++) {
                new MaterialLayoutTab(tabs[i], tabs, panels, this);
            }
        }
        this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
};
/**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {HTMLElement} tab The HTML element for the tab.
   * @param {!Array<HTMLElement>} tabs Array with HTML elements for all tabs.
   * @param {!Array<HTMLElement>} panels Array with HTML elements for all panels.
   * @param {MaterialLayout} layout The MaterialLayout object that owns the tab.
   */
function MaterialLayoutTab(tab, tabs, panels, layout) {
    /**
     * Auxiliary method to programmatically select a tab in the UI.
     */
    function selectTab() {
        var href = tab.href.split('#')[1];
        var panel = layout.content_.querySelector('#' + href);
        layout.resetTabState_(tabs);
        layout.resetPanelState_(panels);
        tab.classList.add(layout.CssClasses_.IS_ACTIVE);
        panel.classList.add(layout.CssClasses_.IS_ACTIVE);
    }
    if (layout.tabBar_.classList.contains(layout.CssClasses_.JS_RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(layout.CssClasses_.RIPPLE_CONTAINER);
        rippleContainer.classList.add(layout.CssClasses_.JS_RIPPLE_EFFECT);
        var ripple = document.createElement('span');
        ripple.classList.add(layout.CssClasses_.RIPPLE);
        rippleContainer.appendChild(ripple);
        tab.appendChild(rippleContainer);
    }
    if (!layout.tabBar_.classList.contains(layout.CssClasses_.TAB_MANUAL_SWITCH)) {
        tab.addEventListener('click', function (e) {
            if (tab.getAttribute('href').charAt(0) === '#') {
                e.preventDefault();
                selectTab();
            }
        });
    }
    tab.show = selectTab;
}
window['MaterialLayoutTab'] = MaterialLayoutTab;
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialLayout,
    classAsString: 'MaterialLayout',
    cssClass: 'mdl-js-layout'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Data Table Card MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
var MaterialDataTable = function MaterialDataTable(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialDataTable'] = MaterialDataTable;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialDataTable.prototype.Constant_ = {};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialDataTable.prototype.CssClasses_ = {
    DATA_TABLE: 'mdl-data-table',
    SELECTABLE: 'mdl-data-table--selectable',
    SELECT_ELEMENT: 'mdl-data-table__select',
    IS_SELECTED: 'is-selected',
    IS_UPGRADED: 'is-upgraded'
};
/**
   * Generates and returns a function that toggles the selection state of a
   * single row (or multiple rows).
   *
   * @param {Element} checkbox Checkbox that toggles the selection state.
   * @param {Element} row Row to toggle when checkbox changes.
   * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
   * @private
   */
MaterialDataTable.prototype.selectRow_ = function (checkbox, row, opt_rows) {
    if (row) {
        return function () {
            if (checkbox.checked) {
                row.classList.add(this.CssClasses_.IS_SELECTED);
            } else {
                row.classList.remove(this.CssClasses_.IS_SELECTED);
            }
        }.bind(this);
    }
    if (opt_rows) {
        return function () {
            var i;
            var el;
            if (checkbox.checked) {
                for (i = 0; i < opt_rows.length; i++) {
                    el = opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');
                    el['MaterialCheckbox'].check();
                    opt_rows[i].classList.add(this.CssClasses_.IS_SELECTED);
                }
            } else {
                for (i = 0; i < opt_rows.length; i++) {
                    el = opt_rows[i].querySelector('td').querySelector('.mdl-checkbox');
                    el['MaterialCheckbox'].uncheck();
                    opt_rows[i].classList.remove(this.CssClasses_.IS_SELECTED);
                }
            }
        }.bind(this);
    }
};
/**
   * Creates a checkbox for a single or or multiple rows and hooks up the
   * event handling.
   *
   * @param {Element} row Row to toggle when checkbox changes.
   * @param {(Array<Object>|NodeList)=} opt_rows Rows to toggle when checkbox changes.
   * @private
   */
MaterialDataTable.prototype.createCheckbox_ = function (row, opt_rows) {
    var label = document.createElement('label');
    var labelClasses = [
        'mdl-checkbox',
        'mdl-js-checkbox',
        'mdl-js-ripple-effect',
        this.CssClasses_.SELECT_ELEMENT
    ];
    label.className = labelClasses.join(' ');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('mdl-checkbox__input');
    if (row) {
        checkbox.checked = row.classList.contains(this.CssClasses_.IS_SELECTED);
        checkbox.addEventListener('change', this.selectRow_(checkbox, row));
    } else if (opt_rows) {
        checkbox.addEventListener('change', this.selectRow_(checkbox, null, opt_rows));
    }
    label.appendChild(checkbox);
    componentHandler.upgradeElement(label, 'MaterialCheckbox');
    return label;
};
/**
   * Initialize element.
   */
MaterialDataTable.prototype.init = function () {
    if (this.element_) {
        var firstHeader = this.element_.querySelector('th');
        var bodyRows = Array.prototype.slice.call(this.element_.querySelectorAll('tbody tr'));
        var footRows = Array.prototype.slice.call(this.element_.querySelectorAll('tfoot tr'));
        var rows = bodyRows.concat(footRows);
        if (this.element_.classList.contains(this.CssClasses_.SELECTABLE)) {
            var th = document.createElement('th');
            var headerCheckbox = this.createCheckbox_(null, rows);
            th.appendChild(headerCheckbox);
            firstHeader.parentElement.insertBefore(th, firstHeader);
            for (var i = 0; i < rows.length; i++) {
                var firstCell = rows[i].querySelector('td');
                if (firstCell) {
                    var td = document.createElement('td');
                    if (rows[i].parentNode.nodeName.toUpperCase() === 'TBODY') {
                        var rowCheckbox = this.createCheckbox_(rows[i]);
                        td.appendChild(rowCheckbox);
                    }
                    rows[i].insertBefore(td, firstCell);
                }
            }
            this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialDataTable,
    classAsString: 'MaterialDataTable',
    cssClass: 'mdl-js-data-table'
});
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
   * Class constructor for Ripple MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
var MaterialRipple = function MaterialRipple(element) {
    this.element_ = element;
    // Initialize instance.
    this.init();
};
window['MaterialRipple'] = MaterialRipple;
/**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
MaterialRipple.prototype.Constant_ = {
    INITIAL_SCALE: 'scale(0.0001, 0.0001)',
    INITIAL_SIZE: '1px',
    INITIAL_OPACITY: '0.4',
    FINAL_OPACITY: '0',
    FINAL_SCALE: ''
};
/**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
MaterialRipple.prototype.CssClasses_ = {
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    IS_ANIMATING: 'is-animating',
    IS_VISIBLE: 'is-visible'
};
/**
   * Handle mouse / finger down on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRipple.prototype.downHandler_ = function (event) {
    if (!this.rippleElement_.style.width && !this.rippleElement_.style.height) {
        var rect = this.element_.getBoundingClientRect();
        this.boundHeight = rect.height;
        this.boundWidth = rect.width;
        this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
        this.rippleElement_.style.width = this.rippleSize_ + 'px';
        this.rippleElement_.style.height = this.rippleSize_ + 'px';
    }
    this.rippleElement_.classList.add(this.CssClasses_.IS_VISIBLE);
    if (event.type === 'mousedown' && this.ignoringMouseDown_) {
        this.ignoringMouseDown_ = false;
    } else {
        if (event.type === 'touchstart') {
            this.ignoringMouseDown_ = true;
        }
        var frameCount = this.getFrameCount();
        if (frameCount > 0) {
            return;
        }
        this.setFrameCount(1);
        var bound = event.currentTarget.getBoundingClientRect();
        var x;
        var y;
        // Check if we are handling a keyboard click.
        if (event.clientX === 0 && event.clientY === 0) {
            x = Math.round(bound.width / 2);
            y = Math.round(bound.height / 2);
        } else {
            var clientX = event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
            var clientY = event.clientY !== undefined ? event.clientY : event.touches[0].clientY;
            x = Math.round(clientX - bound.left);
            y = Math.round(clientY - bound.top);
        }
        this.setRippleXY(x, y);
        this.setRippleStyles(true);
        window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
};
/**
   * Handle mouse / finger up on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
MaterialRipple.prototype.upHandler_ = function (event) {
    // Don't fire for the artificial "mouseup" generated by a double-click.
    if (event && event.detail !== 2) {
        // Allow a repaint to occur before removing this class, so the animation
        // shows for tap events, which seem to trigger a mouseup too soon after
        // mousedown.
        window.setTimeout(function () {
            this.rippleElement_.classList.remove(this.CssClasses_.IS_VISIBLE);
        }.bind(this), 0);
    }
};
/**
   * Initialize element.
   */
MaterialRipple.prototype.init = function () {
    if (this.element_) {
        var recentering = this.element_.classList.contains(this.CssClasses_.RIPPLE_CENTER);
        if (!this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT_IGNORE_EVENTS)) {
            this.rippleElement_ = this.element_.querySelector('.' + this.CssClasses_.RIPPLE);
            this.frameCount_ = 0;
            this.rippleSize_ = 0;
            this.x_ = 0;
            this.y_ = 0;
            // Touch start produces a compat mouse down event, which would cause a
            // second ripples. To avoid that, we use this property to ignore the first
            // mouse down after a touch start.
            this.ignoringMouseDown_ = false;
            this.boundDownHandler = this.downHandler_.bind(this);
            this.element_.addEventListener('mousedown', this.boundDownHandler);
            this.element_.addEventListener('touchstart', this.boundDownHandler);
            this.boundUpHandler = this.upHandler_.bind(this);
            this.element_.addEventListener('mouseup', this.boundUpHandler);
            this.element_.addEventListener('mouseleave', this.boundUpHandler);
            this.element_.addEventListener('touchend', this.boundUpHandler);
            this.element_.addEventListener('blur', this.boundUpHandler);
            /**
         * Getter for frameCount_.
         * @return {number} the frame count.
         */
            this.getFrameCount = function () {
                return this.frameCount_;
            };
            /**
         * Setter for frameCount_.
         * @param {number} fC the frame count.
         */
            this.setFrameCount = function (fC) {
                this.frameCount_ = fC;
            };
            /**
         * Getter for rippleElement_.
         * @return {Element} the ripple element.
         */
            this.getRippleElement = function () {
                return this.rippleElement_;
            };
            /**
         * Sets the ripple X and Y coordinates.
         * @param  {number} newX the new X coordinate
         * @param  {number} newY the new Y coordinate
         */
            this.setRippleXY = function (newX, newY) {
                this.x_ = newX;
                this.y_ = newY;
            };
            /**
         * Sets the ripple styles.
         * @param  {boolean} start whether or not this is the start frame.
         */
            this.setRippleStyles = function (start) {
                if (this.rippleElement_ !== null) {
                    var transformString;
                    var scale;
                    var size;
                    var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';
                    if (start) {
                        scale = this.Constant_.INITIAL_SCALE;
                        size = this.Constant_.INITIAL_SIZE;
                    } else {
                        scale = this.Constant_.FINAL_SCALE;
                        size = this.rippleSize_ + 'px';
                        if (recentering) {
                            offset = 'translate(' + this.boundWidth / 2 + 'px, ' + this.boundHeight / 2 + 'px)';
                        }
                    }
                    transformString = 'translate(-50%, -50%) ' + offset + scale;
                    this.rippleElement_.style.webkitTransform = transformString;
                    this.rippleElement_.style.msTransform = transformString;
                    this.rippleElement_.style.transform = transformString;
                    if (start) {
                        this.rippleElement_.classList.remove(this.CssClasses_.IS_ANIMATING);
                    } else {
                        this.rippleElement_.classList.add(this.CssClasses_.IS_ANIMATING);
                    }
                }
            };
            /**
         * Handles an animation frame.
         */
            this.animFrameHandler = function () {
                if (this.frameCount_-- > 0) {
                    window.requestAnimationFrame(this.animFrameHandler.bind(this));
                } else {
                    this.setRippleStyles(false);
                }
            };
        }
    }
};
// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
    constructor: MaterialRipple,
    classAsString: 'MaterialRipple',
    cssClass: 'mdl-js-ripple-effect',
    widget: false
});
}());

/*! jQuery v3.2.1 | (c) JS Foundation and other contributors | jquery.org/license */
!function(a,b){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){"use strict";var c=[],d=a.document,e=Object.getPrototypeOf,f=c.slice,g=c.concat,h=c.push,i=c.indexOf,j={},k=j.toString,l=j.hasOwnProperty,m=l.toString,n=m.call(Object),o={};function p(a,b){b=b||d;var c=b.createElement("script");c.text=a,b.head.appendChild(c).parentNode.removeChild(c)}var q="3.2.1",r=function(a,b){return new r.fn.init(a,b)},s=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,t=/^-ms-/,u=/-([a-z])/g,v=function(a,b){return b.toUpperCase()};r.fn=r.prototype={jquery:q,constructor:r,length:0,toArray:function(){return f.call(this)},get:function(a){return null==a?f.call(this):a<0?this[a+this.length]:this[a]},pushStack:function(a){var b=r.merge(this.constructor(),a);return b.prevObject=this,b},each:function(a){return r.each(this,a)},map:function(a){return this.pushStack(r.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(f.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(a<0?b:0);return this.pushStack(c>=0&&c<b?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:h,sort:c.sort,splice:c.splice},r.extend=r.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||r.isFunction(g)||(g={}),h===i&&(g=this,h--);h<i;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(r.isPlainObject(d)||(e=Array.isArray(d)))?(e?(e=!1,f=c&&Array.isArray(c)?c:[]):f=c&&r.isPlainObject(c)?c:{},g[b]=r.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},r.extend({expando:"jQuery"+(q+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===r.type(a)},isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=r.type(a);return("number"===b||"string"===b)&&!isNaN(a-parseFloat(a))},isPlainObject:function(a){var b,c;return!(!a||"[object Object]"!==k.call(a))&&(!(b=e(a))||(c=l.call(b,"constructor")&&b.constructor,"function"==typeof c&&m.call(c)===n))},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?j[k.call(a)]||"object":typeof a},globalEval:function(a){p(a)},camelCase:function(a){return a.replace(t,"ms-").replace(u,v)},each:function(a,b){var c,d=0;if(w(a)){for(c=a.length;d<c;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(s,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(w(Object(a))?r.merge(c,"string"==typeof a?[a]:a):h.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:i.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;d<c;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;f<g;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,f=0,h=[];if(w(a))for(d=a.length;f<d;f++)e=b(a[f],f,c),null!=e&&h.push(e);else for(f in a)e=b(a[f],f,c),null!=e&&h.push(e);return g.apply([],h)},guid:1,proxy:function(a,b){var c,d,e;if("string"==typeof b&&(c=a[b],b=a,a=c),r.isFunction(a))return d=f.call(arguments,2),e=function(){return a.apply(b||this,d.concat(f.call(arguments)))},e.guid=a.guid=a.guid||r.guid++,e},now:Date.now,support:o}),"function"==typeof Symbol&&(r.fn[Symbol.iterator]=c[Symbol.iterator]),r.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){j["[object "+b+"]"]=b.toLowerCase()});function w(a){var b=!!a&&"length"in a&&a.length,c=r.type(a);return"function"!==c&&!r.isWindow(a)&&("array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a)}var x=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C={}.hasOwnProperty,D=[],E=D.pop,F=D.push,G=D.push,H=D.slice,I=function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",K="[\\x20\\t\\r\\n\\f]",L="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",M="\\["+K+"*("+L+")(?:"+K+"*([*^$|!~]?=)"+K+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+L+"))|)"+K+"*\\]",N=":("+L+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+M+")*)|.*)\\)|)",O=new RegExp(K+"+","g"),P=new RegExp("^"+K+"+|((?:^|[^\\\\])(?:\\\\.)*)"+K+"+$","g"),Q=new RegExp("^"+K+"*,"+K+"*"),R=new RegExp("^"+K+"*([>+~]|"+K+")"+K+"*"),S=new RegExp("="+K+"*([^\\]'\"]*?)"+K+"*\\]","g"),T=new RegExp(N),U=new RegExp("^"+L+"$"),V={ID:new RegExp("^#("+L+")"),CLASS:new RegExp("^\\.("+L+")"),TAG:new RegExp("^("+L+"|[*])"),ATTR:new RegExp("^"+M),PSEUDO:new RegExp("^"+N),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+K+"*(even|odd|(([+-]|)(\\d*)n|)"+K+"*(?:([+-]|)"+K+"*(\\d+)|))"+K+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+K+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+K+"*((?:-\\d)?\\d*)"+K+"*\\)|)(?=[^-]|$)","i")},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=new RegExp("\\\\([\\da-f]{1,6}"+K+"?|("+K+")|.)","ig"),aa=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:d<0?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ba=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ca=function(a,b){return b?"\0"===a?"\ufffd":a.slice(0,-1)+"\\"+a.charCodeAt(a.length-1).toString(16)+" ":"\\"+a},da=function(){m()},ea=ta(function(a){return a.disabled===!0&&("form"in a||"label"in a)},{dir:"parentNode",next:"legend"});try{G.apply(D=H.call(v.childNodes),v.childNodes),D[v.childNodes.length].nodeType}catch(fa){G={apply:D.length?function(a,b){F.apply(a,H.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s=b&&b.ownerDocument,w=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==w&&9!==w&&11!==w)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==w&&(l=Z.exec(a)))if(f=l[1]){if(9===w){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(s&&(j=s.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(l[2])return G.apply(d,b.getElementsByTagName(a)),d;if((f=l[3])&&c.getElementsByClassName&&b.getElementsByClassName)return G.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==w)s=b,r=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(ba,ca):b.setAttribute("id",k=u),o=g(a),h=o.length;while(h--)o[h]="#"+k+" "+sa(o[h]);r=o.join(","),s=$.test(a)&&qa(b.parentNode)||b}if(r)try{return G.apply(d,s.querySelectorAll(r)),d}catch(x){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(P,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("fieldset");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&a.sourceIndex-b.sourceIndex;if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return function(b){return"form"in b?b.parentNode&&b.disabled===!1?"label"in b?"label"in b.parentNode?b.parentNode.disabled===a:b.disabled===a:b.isDisabled===a||b.isDisabled!==!a&&ea(b)===a:b.disabled===a:"label"in b&&b.disabled===a}}function pa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function qa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),v!==n&&(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Y.test(n.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){return a.getAttribute("id")===b}},d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}}):(d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}},d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c,d,e,f=b.getElementById(a);if(f){if(c=f.getAttributeNode("id"),c&&c.value===a)return[f];e=b.getElementsByName(a),d=0;while(f=e[d++])if(c=f.getAttributeNode("id"),c&&c.value===a)return[f]}return[]}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){if("undefined"!=typeof b.getElementsByClassName&&p)return b.getElementsByClassName(a)},r=[],q=[],(c.qsa=Y.test(n.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+K+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+K+"*(?:value|"+J+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){a.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+K+"*[*^$|!~]?="),2!==a.querySelectorAll(":enabled").length&&q.push(":enabled",":disabled"),o.appendChild(a).disabled=!0,2!==a.querySelectorAll(":disabled").length&&q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Y.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"*"),s.call(a,"[s!='']:x"),r.push("!=",N)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Y.test(o.compareDocumentPosition),t=b||Y.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?I(k,a)-I(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?I(k,a)-I(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?la(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(S,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&C.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.escape=function(a){return(a+"").replace(ba,ca)},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(_,aa),a[3]=(a[3]||a[4]||a[5]||"").replace(_,aa),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return V.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&T.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(_,aa).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+K+")"+a+"("+K+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:!b||(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(O," ")+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=I(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(P,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(_,aa),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return U.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(_,aa).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:oa(!1),disabled:oa(!0),checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:pa(function(){return[0]}),last:pa(function(a,b){return[b-1]}),eq:pa(function(a,b,c){return[c<0?c+b:c]}),even:pa(function(a,b){for(var c=0;c<b;c+=2)a.push(c);return a}),odd:pa(function(a,b){for(var c=1;c<b;c+=2)a.push(c);return a}),lt:pa(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:pa(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function ra(){}ra.prototype=d.filters=d.pseudos,d.setFilters=new ra,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=Q.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")}),h=h.slice(c.length));for(g in d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function sa(a){for(var b=0,c=a.length,d="";b<c;b++)d+=a[b].value;return d}function ta(a,b,c){var d=b.dir,e=b.next,f=e||d,g=c&&"parentNode"===f,h=x++;return b.first?function(b,c,e){while(b=b[d])if(1===b.nodeType||g)return a(b,c,e);return!1}:function(b,c,i){var j,k,l,m=[w,h];if(i){while(b=b[d])if((1===b.nodeType||g)&&a(b,c,i))return!0}else while(b=b[d])if(1===b.nodeType||g)if(l=b[u]||(b[u]={}),k=l[b.uniqueID]||(l[b.uniqueID]={}),e&&e===b.nodeName.toLowerCase())b=b[d]||b;else{if((j=k[f])&&j[0]===w&&j[1]===h)return m[2]=j[2];if(k[f]=m,m[2]=a(b,c,i))return!0}return!1}}function ua(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function va(a,b,c){for(var d=0,e=b.length;d<e;d++)ga(a,b[d],c);return c}function wa(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;h<i;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function xa(a,b,c,d,e,f){return d&&!d[u]&&(d=xa(d)),e&&!e[u]&&(e=xa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||va(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:wa(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=wa(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?I(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=wa(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):G.apply(g,r)})}function ya(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ta(function(a){return a===b},h,!0),l=ta(function(a){return I(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];i<f;i++)if(c=d.relative[a[i].type])m=[ta(ua(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;e<f;e++)if(d.relative[a[e].type])break;return xa(i>1&&ua(m),i>1&&sa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(P,"$1"),c,i<e&&ya(a.slice(i,e)),e<f&&ya(a=a.slice(e)),e<f&&sa(a))}m.push(c)}return ua(m)}function za(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=E.call(i));u=wa(u)}G.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&ga.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=ya(b[c]),f[u]?d.push(f):e.push(f);f=A(a,za(e,d)),f.selector=a}return f},i=ga.select=function(a,b,c,e){var f,i,j,k,l,m="function"==typeof a&&a,n=!e&&g(a=m.selector||a);if(c=c||[],1===n.length){if(i=n[0]=n[0].slice(0),i.length>2&&"ID"===(j=i[0]).type&&9===b.nodeType&&p&&d.relative[i[1].type]){if(b=(d.find.ID(j.matches[0].replace(_,aa),b)||[])[0],!b)return c;m&&(b=b.parentNode),a=a.slice(i.shift().value.length)}f=V.needsContext.test(a)?0:i.length;while(f--){if(j=i[f],d.relative[k=j.type])break;if((l=d.find[k])&&(e=l(j.matches[0].replace(_,aa),$.test(i[0].type)&&qa(b.parentNode)||b))){if(i.splice(f,1),a=e.length&&sa(i),!a)return G.apply(c,e),c;break}}}return(m||h(a,n))(e,b,!p,c,!b||$.test(a)&&qa(b.parentNode)||b),c},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("fieldset"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){if(!c)return a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){if(!c&&"input"===a.nodeName.toLowerCase())return a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(J,function(a,b,c){var d;if(!c)return a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);r.find=x,r.expr=x.selectors,r.expr[":"]=r.expr.pseudos,r.uniqueSort=r.unique=x.uniqueSort,r.text=x.getText,r.isXMLDoc=x.isXML,r.contains=x.contains,r.escapeSelector=x.escape;var y=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&r(a).is(c))break;d.push(a)}return d},z=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},A=r.expr.match.needsContext;function B(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()}var C=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i,D=/^.[^:#\[\.,]*$/;function E(a,b,c){return r.isFunction(b)?r.grep(a,function(a,d){return!!b.call(a,d,a)!==c}):b.nodeType?r.grep(a,function(a){return a===b!==c}):"string"!=typeof b?r.grep(a,function(a){return i.call(b,a)>-1!==c}):D.test(b)?r.filter(b,a,c):(b=r.filter(b,a),r.grep(a,function(a){return i.call(b,a)>-1!==c&&1===a.nodeType}))}r.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?r.find.matchesSelector(d,a)?[d]:[]:r.find.matches(a,r.grep(b,function(a){return 1===a.nodeType}))},r.fn.extend({find:function(a){var b,c,d=this.length,e=this;if("string"!=typeof a)return this.pushStack(r(a).filter(function(){for(b=0;b<d;b++)if(r.contains(e[b],this))return!0}));for(c=this.pushStack([]),b=0;b<d;b++)r.find(a,e[b],c);return d>1?r.uniqueSort(c):c},filter:function(a){return this.pushStack(E(this,a||[],!1))},not:function(a){return this.pushStack(E(this,a||[],!0))},is:function(a){return!!E(this,"string"==typeof a&&A.test(a)?r(a):a||[],!1).length}});var F,G=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,H=r.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||F,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:G.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof r?b[0]:b,r.merge(this,r.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),C.test(e[1])&&r.isPlainObject(b))for(e in b)r.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&(this[0]=f,this.length=1),this}return a.nodeType?(this[0]=a,this.length=1,this):r.isFunction(a)?void 0!==c.ready?c.ready(a):a(r):r.makeArray(a,this)};H.prototype=r.fn,F=r(d);var I=/^(?:parents|prev(?:Until|All))/,J={children:!0,contents:!0,next:!0,prev:!0};r.fn.extend({has:function(a){var b=r(a,this),c=b.length;return this.filter(function(){for(var a=0;a<c;a++)if(r.contains(this,b[a]))return!0})},closest:function(a,b){var c,d=0,e=this.length,f=[],g="string"!=typeof a&&r(a);if(!A.test(a))for(;d<e;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&r.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?r.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?i.call(r(a),this[0]):i.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(r.uniqueSort(r.merge(this.get(),r(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function K(a,b){while((a=a[b])&&1!==a.nodeType);return a}r.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return y(a,"parentNode")},parentsUntil:function(a,b,c){return y(a,"parentNode",c)},next:function(a){return K(a,"nextSibling")},prev:function(a){return K(a,"previousSibling")},nextAll:function(a){return y(a,"nextSibling")},prevAll:function(a){return y(a,"previousSibling")},nextUntil:function(a,b,c){return y(a,"nextSibling",c)},prevUntil:function(a,b,c){return y(a,"previousSibling",c)},siblings:function(a){return z((a.parentNode||{}).firstChild,a)},children:function(a){return z(a.firstChild)},contents:function(a){return B(a,"iframe")?a.contentDocument:(B(a,"template")&&(a=a.content||a),r.merge([],a.childNodes))}},function(a,b){r.fn[a]=function(c,d){var e=r.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=r.filter(d,e)),this.length>1&&(J[a]||r.uniqueSort(e),I.test(a)&&e.reverse()),this.pushStack(e)}});var L=/[^\x20\t\r\n\f]+/g;function M(a){var b={};return r.each(a.match(L)||[],function(a,c){b[c]=!0}),b}r.Callbacks=function(a){a="string"==typeof a?M(a):r.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=e||a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){r.each(b,function(b,c){r.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==r.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return r.each(arguments,function(a,b){var c;while((c=r.inArray(b,f,c))>-1)f.splice(c,1),c<=h&&h--}),this},has:function(a){return a?r.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||b||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j};function N(a){return a}function O(a){throw a}function P(a,b,c,d){var e;try{a&&r.isFunction(e=a.promise)?e.call(a).done(b).fail(c):a&&r.isFunction(e=a.then)?e.call(a,b,c):b.apply(void 0,[a].slice(d))}catch(a){c.apply(void 0,[a])}}r.extend({Deferred:function(b){var c=[["notify","progress",r.Callbacks("memory"),r.Callbacks("memory"),2],["resolve","done",r.Callbacks("once memory"),r.Callbacks("once memory"),0,"resolved"],["reject","fail",r.Callbacks("once memory"),r.Callbacks("once memory"),1,"rejected"]],d="pending",e={state:function(){return d},always:function(){return f.done(arguments).fail(arguments),this},"catch":function(a){return e.then(null,a)},pipe:function(){var a=arguments;return r.Deferred(function(b){r.each(c,function(c,d){var e=r.isFunction(a[d[4]])&&a[d[4]];f[d[1]](function(){var a=e&&e.apply(this,arguments);a&&r.isFunction(a.promise)?a.promise().progress(b.notify).done(b.resolve).fail(b.reject):b[d[0]+"With"](this,e?[a]:arguments)})}),a=null}).promise()},then:function(b,d,e){var f=0;function g(b,c,d,e){return function(){var h=this,i=arguments,j=function(){var a,j;if(!(b<f)){if(a=d.apply(h,i),a===c.promise())throw new TypeError("Thenable self-resolution");j=a&&("object"==typeof a||"function"==typeof a)&&a.then,r.isFunction(j)?e?j.call(a,g(f,c,N,e),g(f,c,O,e)):(f++,j.call(a,g(f,c,N,e),g(f,c,O,e),g(f,c,N,c.notifyWith))):(d!==N&&(h=void 0,i=[a]),(e||c.resolveWith)(h,i))}},k=e?j:function(){try{j()}catch(a){r.Deferred.exceptionHook&&r.Deferred.exceptionHook(a,k.stackTrace),b+1>=f&&(d!==O&&(h=void 0,i=[a]),c.rejectWith(h,i))}};b?k():(r.Deferred.getStackHook&&(k.stackTrace=r.Deferred.getStackHook()),a.setTimeout(k))}}return r.Deferred(function(a){c[0][3].add(g(0,a,r.isFunction(e)?e:N,a.notifyWith)),c[1][3].add(g(0,a,r.isFunction(b)?b:N)),c[2][3].add(g(0,a,r.isFunction(d)?d:O))}).promise()},promise:function(a){return null!=a?r.extend(a,e):e}},f={};return r.each(c,function(a,b){var g=b[2],h=b[5];e[b[1]]=g.add,h&&g.add(function(){d=h},c[3-a][2].disable,c[0][2].lock),g.add(b[3].fire),f[b[0]]=function(){return f[b[0]+"With"](this===f?void 0:this,arguments),this},f[b[0]+"With"]=g.fireWith}),e.promise(f),b&&b.call(f,f),f},when:function(a){var b=arguments.length,c=b,d=Array(c),e=f.call(arguments),g=r.Deferred(),h=function(a){return function(c){d[a]=this,e[a]=arguments.length>1?f.call(arguments):c,--b||g.resolveWith(d,e)}};if(b<=1&&(P(a,g.done(h(c)).resolve,g.reject,!b),"pending"===g.state()||r.isFunction(e[c]&&e[c].then)))return g.then();while(c--)P(e[c],h(c),g.reject);return g.promise()}});var Q=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;r.Deferred.exceptionHook=function(b,c){a.console&&a.console.warn&&b&&Q.test(b.name)&&a.console.warn("jQuery.Deferred exception: "+b.message,b.stack,c)},r.readyException=function(b){a.setTimeout(function(){throw b})};var R=r.Deferred();r.fn.ready=function(a){return R.then(a)["catch"](function(a){r.readyException(a)}),this},r.extend({isReady:!1,readyWait:1,ready:function(a){(a===!0?--r.readyWait:r.isReady)||(r.isReady=!0,a!==!0&&--r.readyWait>0||R.resolveWith(d,[r]))}}),r.ready.then=R.then;function S(){d.removeEventListener("DOMContentLoaded",S),
a.removeEventListener("load",S),r.ready()}"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(r.ready):(d.addEventListener("DOMContentLoaded",S),a.addEventListener("load",S));var T=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===r.type(c)){e=!0;for(h in c)T(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,r.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(r(a),c)})),b))for(;h<i;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},U=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function V(){this.expando=r.expando+V.uid++}V.uid=1,V.prototype={cache:function(a){var b=a[this.expando];return b||(b={},U(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[r.camelCase(b)]=c;else for(d in b)e[r.camelCase(d)]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][r.camelCase(b)]},access:function(a,b,c){return void 0===b||b&&"string"==typeof b&&void 0===c?this.get(a,b):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d=a[this.expando];if(void 0!==d){if(void 0!==b){Array.isArray(b)?b=b.map(r.camelCase):(b=r.camelCase(b),b=b in d?[b]:b.match(L)||[]),c=b.length;while(c--)delete d[b[c]]}(void 0===b||r.isEmptyObject(d))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!r.isEmptyObject(b)}};var W=new V,X=new V,Y=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Z=/[A-Z]/g;function $(a){return"true"===a||"false"!==a&&("null"===a?null:a===+a+""?+a:Y.test(a)?JSON.parse(a):a)}function _(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Z,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c=$(c)}catch(e){}X.set(a,b,c)}else c=void 0;return c}r.extend({hasData:function(a){return X.hasData(a)||W.hasData(a)},data:function(a,b,c){return X.access(a,b,c)},removeData:function(a,b){X.remove(a,b)},_data:function(a,b,c){return W.access(a,b,c)},_removeData:function(a,b){W.remove(a,b)}}),r.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=X.get(f),1===f.nodeType&&!W.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=r.camelCase(d.slice(5)),_(f,d,e[d])));W.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){X.set(this,a)}):T(this,function(b){var c;if(f&&void 0===b){if(c=X.get(f,a),void 0!==c)return c;if(c=_(f,a),void 0!==c)return c}else this.each(function(){X.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){X.remove(this,a)})}}),r.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=W.get(a,b),c&&(!d||Array.isArray(c)?d=W.access(a,b,r.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=r.queue(a,b),d=c.length,e=c.shift(),f=r._queueHooks(a,b),g=function(){r.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return W.get(a,c)||W.access(a,c,{empty:r.Callbacks("once memory").add(function(){W.remove(a,[b+"queue",c])})})}}),r.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?r.queue(this[0],a):void 0===b?this:this.each(function(){var c=r.queue(this,a,b);r._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&r.dequeue(this,a)})},dequeue:function(a){return this.each(function(){r.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=r.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=W.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var aa=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ba=new RegExp("^(?:([+-])=|)("+aa+")([a-z%]*)$","i"),ca=["Top","Right","Bottom","Left"],da=function(a,b){return a=b||a,"none"===a.style.display||""===a.style.display&&r.contains(a.ownerDocument,a)&&"none"===r.css(a,"display")},ea=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};function fa(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return r.css(a,b,"")},i=h(),j=c&&c[3]||(r.cssNumber[b]?"":"px"),k=(r.cssNumber[b]||"px"!==j&&+i)&&ba.exec(r.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,r.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var ga={};function ha(a){var b,c=a.ownerDocument,d=a.nodeName,e=ga[d];return e?e:(b=c.body.appendChild(c.createElement(d)),e=r.css(b,"display"),b.parentNode.removeChild(b),"none"===e&&(e="block"),ga[d]=e,e)}function ia(a,b){for(var c,d,e=[],f=0,g=a.length;f<g;f++)d=a[f],d.style&&(c=d.style.display,b?("none"===c&&(e[f]=W.get(d,"display")||null,e[f]||(d.style.display="")),""===d.style.display&&da(d)&&(e[f]=ha(d))):"none"!==c&&(e[f]="none",W.set(d,"display",c)));for(f=0;f<g;f++)null!=e[f]&&(a[f].style.display=e[f]);return a}r.fn.extend({show:function(){return ia(this,!0)},hide:function(){return ia(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){da(this)?r(this).show():r(this).hide()})}});var ja=/^(?:checkbox|radio)$/i,ka=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,la=/^$|\/(?:java|ecma)script/i,ma={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ma.optgroup=ma.option,ma.tbody=ma.tfoot=ma.colgroup=ma.caption=ma.thead,ma.th=ma.td;function na(a,b){var c;return c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[],void 0===b||b&&B(a,b)?r.merge([a],c):c}function oa(a,b){for(var c=0,d=a.length;c<d;c++)W.set(a[c],"globalEval",!b||W.get(b[c],"globalEval"))}var pa=/<|&#?\w+;/;function qa(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],n=0,o=a.length;n<o;n++)if(f=a[n],f||0===f)if("object"===r.type(f))r.merge(m,f.nodeType?[f]:f);else if(pa.test(f)){g=g||l.appendChild(b.createElement("div")),h=(ka.exec(f)||["",""])[1].toLowerCase(),i=ma[h]||ma._default,g.innerHTML=i[1]+r.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;r.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",n=0;while(f=m[n++])if(d&&r.inArray(f,d)>-1)e&&e.push(f);else if(j=r.contains(f.ownerDocument,f),g=na(l.appendChild(f),"script"),j&&oa(g),c){k=0;while(f=g[k++])la.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),o.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",o.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var ra=d.documentElement,sa=/^key/,ta=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,ua=/^([^.]*)(?:\.(.+)|)/;function va(){return!0}function wa(){return!1}function xa(){try{return d.activeElement}catch(a){}}function ya(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ya(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=wa;else if(!e)return a;return 1===f&&(g=e,e=function(a){return r().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=r.guid++)),a.each(function(){r.event.add(this,b,e,d,c)})}r.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=W.get(a);if(q){c.handler&&(f=c,c=f.handler,e=f.selector),e&&r.find.matchesSelector(ra,e),c.guid||(c.guid=r.guid++),(i=q.events)||(i=q.events={}),(g=q.handle)||(g=q.handle=function(b){return"undefined"!=typeof r&&r.event.triggered!==b.type?r.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(L)||[""],j=b.length;while(j--)h=ua.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n&&(l=r.event.special[n]||{},n=(e?l.delegateType:l.bindType)||n,l=r.event.special[n]||{},k=r.extend({type:n,origType:p,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&r.expr.match.needsContext.test(e),namespace:o.join(".")},f),(m=i[n])||(m=i[n]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,o,g)!==!1||a.addEventListener&&a.addEventListener(n,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),r.event.global[n]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=W.hasData(a)&&W.get(a);if(q&&(i=q.events)){b=(b||"").match(L)||[""],j=b.length;while(j--)if(h=ua.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n){l=r.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=i[n]||[],h=h[2]&&new RegExp("(^|\\.)"+o.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&p!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,o,q.handle)!==!1||r.removeEvent(a,n,q.handle),delete i[n])}else for(n in i)r.event.remove(a,n+b[j],c,d,!0);r.isEmptyObject(i)&&W.remove(a,"handle events")}},dispatch:function(a){var b=r.event.fix(a),c,d,e,f,g,h,i=new Array(arguments.length),j=(W.get(this,"events")||{})[b.type]||[],k=r.event.special[b.type]||{};for(i[0]=b,c=1;c<arguments.length;c++)i[c]=arguments[c];if(b.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,b)!==!1){h=r.event.handlers.call(this,b,j),c=0;while((f=h[c++])&&!b.isPropagationStopped()){b.currentTarget=f.elem,d=0;while((g=f.handlers[d++])&&!b.isImmediatePropagationStopped())b.rnamespace&&!b.rnamespace.test(g.namespace)||(b.handleObj=g,b.data=g.data,e=((r.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(b.result=e)===!1&&(b.preventDefault(),b.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,b),b.result}},handlers:function(a,b){var c,d,e,f,g,h=[],i=b.delegateCount,j=a.target;if(i&&j.nodeType&&!("click"===a.type&&a.button>=1))for(;j!==this;j=j.parentNode||this)if(1===j.nodeType&&("click"!==a.type||j.disabled!==!0)){for(f=[],g={},c=0;c<i;c++)d=b[c],e=d.selector+" ",void 0===g[e]&&(g[e]=d.needsContext?r(e,this).index(j)>-1:r.find(e,this,null,[j]).length),g[e]&&f.push(d);f.length&&h.push({elem:j,handlers:f})}return j=this,i<b.length&&h.push({elem:j,handlers:b.slice(i)}),h},addProp:function(a,b){Object.defineProperty(r.Event.prototype,a,{enumerable:!0,configurable:!0,get:r.isFunction(b)?function(){if(this.originalEvent)return b(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[a]},set:function(b){Object.defineProperty(this,a,{enumerable:!0,configurable:!0,writable:!0,value:b})}})},fix:function(a){return a[r.expando]?a:new r.Event(a)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==xa()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===xa()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&B(this,"input"))return this.click(),!1},_default:function(a){return B(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},r.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},r.Event=function(a,b){return this instanceof r.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?va:wa,this.target=a.target&&3===a.target.nodeType?a.target.parentNode:a.target,this.currentTarget=a.currentTarget,this.relatedTarget=a.relatedTarget):this.type=a,b&&r.extend(this,b),this.timeStamp=a&&a.timeStamp||r.now(),void(this[r.expando]=!0)):new r.Event(a,b)},r.Event.prototype={constructor:r.Event,isDefaultPrevented:wa,isPropagationStopped:wa,isImmediatePropagationStopped:wa,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=va,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=va,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=va,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},r.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(a){var b=a.button;return null==a.which&&sa.test(a.type)?null!=a.charCode?a.charCode:a.keyCode:!a.which&&void 0!==b&&ta.test(a.type)?1&b?1:2&b?3:4&b?2:0:a.which}},r.event.addProp),r.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){r.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||r.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),r.fn.extend({on:function(a,b,c,d){return ya(this,a,b,c,d)},one:function(a,b,c,d){return ya(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,r(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=wa),this.each(function(){r.event.remove(this,a,c,b)})}});var za=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,Aa=/<script|<style|<link/i,Ba=/checked\s*(?:[^=]|=\s*.checked.)/i,Ca=/^true\/(.*)/,Da=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Ea(a,b){return B(a,"table")&&B(11!==b.nodeType?b:b.firstChild,"tr")?r(">tbody",a)[0]||a:a}function Fa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function Ga(a){var b=Ca.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function Ha(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(W.hasData(a)&&(f=W.access(a),g=W.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;c<d;c++)r.event.add(b,e,j[e][c])}X.hasData(a)&&(h=X.access(a),i=r.extend({},h),X.set(b,i))}}function Ia(a,b){var c=b.nodeName.toLowerCase();"input"===c&&ja.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function Ja(a,b,c,d){b=g.apply([],b);var e,f,h,i,j,k,l=0,m=a.length,n=m-1,q=b[0],s=r.isFunction(q);if(s||m>1&&"string"==typeof q&&!o.checkClone&&Ba.test(q))return a.each(function(e){var f=a.eq(e);s&&(b[0]=q.call(this,e,f.html())),Ja(f,b,c,d)});if(m&&(e=qa(b,a[0].ownerDocument,!1,a,d),f=e.firstChild,1===e.childNodes.length&&(e=f),f||d)){for(h=r.map(na(e,"script"),Fa),i=h.length;l<m;l++)j=e,l!==n&&(j=r.clone(j,!0,!0),i&&r.merge(h,na(j,"script"))),c.call(a[l],j,l);if(i)for(k=h[h.length-1].ownerDocument,r.map(h,Ga),l=0;l<i;l++)j=h[l],la.test(j.type||"")&&!W.access(j,"globalEval")&&r.contains(k,j)&&(j.src?r._evalUrl&&r._evalUrl(j.src):p(j.textContent.replace(Da,""),k))}return a}function Ka(a,b,c){for(var d,e=b?r.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||r.cleanData(na(d)),d.parentNode&&(c&&r.contains(d.ownerDocument,d)&&oa(na(d,"script")),d.parentNode.removeChild(d));return a}r.extend({htmlPrefilter:function(a){return a.replace(za,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=r.contains(a.ownerDocument,a);if(!(o.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||r.isXMLDoc(a)))for(g=na(h),f=na(a),d=0,e=f.length;d<e;d++)Ia(f[d],g[d]);if(b)if(c)for(f=f||na(a),g=g||na(h),d=0,e=f.length;d<e;d++)Ha(f[d],g[d]);else Ha(a,h);return g=na(h,"script"),g.length>0&&oa(g,!i&&na(a,"script")),h},cleanData:function(a){for(var b,c,d,e=r.event.special,f=0;void 0!==(c=a[f]);f++)if(U(c)){if(b=c[W.expando]){if(b.events)for(d in b.events)e[d]?r.event.remove(c,d):r.removeEvent(c,d,b.handle);c[W.expando]=void 0}c[X.expando]&&(c[X.expando]=void 0)}}}),r.fn.extend({detach:function(a){return Ka(this,a,!0)},remove:function(a){return Ka(this,a)},text:function(a){return T(this,function(a){return void 0===a?r.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return Ja(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Ea(this,a);b.appendChild(a)}})},prepend:function(){return Ja(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Ea(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return Ja(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return Ja(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(r.cleanData(na(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null!=a&&a,b=null==b?a:b,this.map(function(){return r.clone(this,a,b)})},html:function(a){return T(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!Aa.test(a)&&!ma[(ka.exec(a)||["",""])[1].toLowerCase()]){a=r.htmlPrefilter(a);try{for(;c<d;c++)b=this[c]||{},1===b.nodeType&&(r.cleanData(na(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return Ja(this,arguments,function(b){var c=this.parentNode;r.inArray(this,a)<0&&(r.cleanData(na(this)),c&&c.replaceChild(b,this))},a)}}),r.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){r.fn[a]=function(a){for(var c,d=[],e=r(a),f=e.length-1,g=0;g<=f;g++)c=g===f?this:this.clone(!0),r(e[g])[b](c),h.apply(d,c.get());return this.pushStack(d)}});var La=/^margin/,Ma=new RegExp("^("+aa+")(?!px)[a-z%]+$","i"),Na=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)};!function(){function b(){if(i){i.style.cssText="box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",i.innerHTML="",ra.appendChild(h);var b=a.getComputedStyle(i);c="1%"!==b.top,g="2px"===b.marginLeft,e="4px"===b.width,i.style.marginRight="50%",f="4px"===b.marginRight,ra.removeChild(h),i=null}}var c,e,f,g,h=d.createElement("div"),i=d.createElement("div");i.style&&(i.style.backgroundClip="content-box",i.cloneNode(!0).style.backgroundClip="",o.clearCloneStyle="content-box"===i.style.backgroundClip,h.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",h.appendChild(i),r.extend(o,{pixelPosition:function(){return b(),c},boxSizingReliable:function(){return b(),e},pixelMarginRight:function(){return b(),f},reliableMarginLeft:function(){return b(),g}}))}();function Oa(a,b,c){var d,e,f,g,h=a.style;return c=c||Na(a),c&&(g=c.getPropertyValue(b)||c[b],""!==g||r.contains(a.ownerDocument,a)||(g=r.style(a,b)),!o.pixelMarginRight()&&Ma.test(g)&&La.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function Pa(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Qa=/^(none|table(?!-c[ea]).+)/,Ra=/^--/,Sa={position:"absolute",visibility:"hidden",display:"block"},Ta={letterSpacing:"0",fontWeight:"400"},Ua=["Webkit","Moz","ms"],Va=d.createElement("div").style;function Wa(a){if(a in Va)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ua.length;while(c--)if(a=Ua[c]+b,a in Va)return a}function Xa(a){var b=r.cssProps[a];return b||(b=r.cssProps[a]=Wa(a)||a),b}function Ya(a,b,c){var d=ba.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Za(a,b,c,d,e){var f,g=0;for(f=c===(d?"border":"content")?4:"width"===b?1:0;f<4;f+=2)"margin"===c&&(g+=r.css(a,c+ca[f],!0,e)),d?("content"===c&&(g-=r.css(a,"padding"+ca[f],!0,e)),"margin"!==c&&(g-=r.css(a,"border"+ca[f]+"Width",!0,e))):(g+=r.css(a,"padding"+ca[f],!0,e),"padding"!==c&&(g+=r.css(a,"border"+ca[f]+"Width",!0,e)));return g}function $a(a,b,c){var d,e=Na(a),f=Oa(a,b,e),g="border-box"===r.css(a,"boxSizing",!1,e);return Ma.test(f)?f:(d=g&&(o.boxSizingReliable()||f===a.style[b]),"auto"===f&&(f=a["offset"+b[0].toUpperCase()+b.slice(1)]),f=parseFloat(f)||0,f+Za(a,b,c||(g?"border":"content"),d,e)+"px")}r.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Oa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=r.camelCase(b),i=Ra.test(b),j=a.style;return i||(b=Xa(h)),g=r.cssHooks[b]||r.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:j[b]:(f=typeof c,"string"===f&&(e=ba.exec(c))&&e[1]&&(c=fa(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(r.cssNumber[h]?"":"px")),o.clearCloneStyle||""!==c||0!==b.indexOf("background")||(j[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i?j.setProperty(b,c):j[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=r.camelCase(b),i=Ra.test(b);return i||(b=Xa(h)),g=r.cssHooks[b]||r.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Oa(a,b,d)),"normal"===e&&b in Ta&&(e=Ta[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),r.each(["height","width"],function(a,b){r.cssHooks[b]={get:function(a,c,d){if(c)return!Qa.test(r.css(a,"display"))||a.getClientRects().length&&a.getBoundingClientRect().width?$a(a,b,d):ea(a,Sa,function(){return $a(a,b,d)})},set:function(a,c,d){var e,f=d&&Na(a),g=d&&Za(a,b,d,"border-box"===r.css(a,"boxSizing",!1,f),f);return g&&(e=ba.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=r.css(a,b)),Ya(a,c,g)}}}),r.cssHooks.marginLeft=Pa(o.reliableMarginLeft,function(a,b){if(b)return(parseFloat(Oa(a,"marginLeft"))||a.getBoundingClientRect().left-ea(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px"}),r.each({margin:"",padding:"",border:"Width"},function(a,b){r.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];d<4;d++)e[a+ca[d]+b]=f[d]||f[d-2]||f[0];return e}},La.test(a)||(r.cssHooks[a+b].set=Ya)}),r.fn.extend({css:function(a,b){return T(this,function(a,b,c){var d,e,f={},g=0;if(Array.isArray(b)){for(d=Na(a),e=b.length;g<e;g++)f[b[g]]=r.css(a,b[g],!1,d);return f}return void 0!==c?r.style(a,b,c):r.css(a,b)},a,b,arguments.length>1)}});function _a(a,b,c,d,e){return new _a.prototype.init(a,b,c,d,e)}r.Tween=_a,_a.prototype={constructor:_a,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||r.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(r.cssNumber[c]?"":"px")},cur:function(){var a=_a.propHooks[this.prop];return a&&a.get?a.get(this):_a.propHooks._default.get(this)},run:function(a){var b,c=_a.propHooks[this.prop];return this.options.duration?this.pos=b=r.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):_a.propHooks._default.set(this),this}},_a.prototype.init.prototype=_a.prototype,_a.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=r.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){r.fx.step[a.prop]?r.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[r.cssProps[a.prop]]&&!r.cssHooks[a.prop]?a.elem[a.prop]=a.now:r.style(a.elem,a.prop,a.now+a.unit)}}},_a.propHooks.scrollTop=_a.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},r.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},r.fx=_a.prototype.init,r.fx.step={};var ab,bb,cb=/^(?:toggle|show|hide)$/,db=/queueHooks$/;function eb(){bb&&(d.hidden===!1&&a.requestAnimationFrame?a.requestAnimationFrame(eb):a.setTimeout(eb,r.fx.interval),r.fx.tick())}function fb(){return a.setTimeout(function(){ab=void 0}),ab=r.now()}function gb(a,b){var c,d=0,e={height:a};for(b=b?1:0;d<4;d+=2-b)c=ca[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function hb(a,b,c){for(var d,e=(kb.tweeners[b]||[]).concat(kb.tweeners["*"]),f=0,g=e.length;f<g;f++)if(d=e[f].call(c,b,a))return d}function ib(a,b,c){var d,e,f,g,h,i,j,k,l="width"in b||"height"in b,m=this,n={},o=a.style,p=a.nodeType&&da(a),q=W.get(a,"fxshow");c.queue||(g=r._queueHooks(a,"fx"),null==g.unqueued&&(g.unqueued=0,h=g.empty.fire,g.empty.fire=function(){g.unqueued||h()}),g.unqueued++,m.always(function(){m.always(function(){g.unqueued--,r.queue(a,"fx").length||g.empty.fire()})}));for(d in b)if(e=b[d],cb.test(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}n[d]=q&&q[d]||r.style(a,d)}if(i=!r.isEmptyObject(b),i||!r.isEmptyObject(n)){l&&1===a.nodeType&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=q&&q.display,null==j&&(j=W.get(a,"display")),k=r.css(a,"display"),"none"===k&&(j?k=j:(ia([a],!0),j=a.style.display||j,k=r.css(a,"display"),ia([a]))),("inline"===k||"inline-block"===k&&null!=j)&&"none"===r.css(a,"float")&&(i||(m.done(function(){o.display=j}),null==j&&(k=o.display,j="none"===k?"":k)),o.display="inline-block")),c.overflow&&(o.overflow="hidden",m.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]})),i=!1;for(d in n)i||(q?"hidden"in q&&(p=q.hidden):q=W.access(a,"fxshow",{display:j}),f&&(q.hidden=!p),p&&ia([a],!0),m.done(function(){p||ia([a]),W.remove(a,"fxshow");for(d in n)r.style(a,d,n[d])})),i=hb(p?q[d]:0,d,m),d in q||(q[d]=i.start,p&&(i.end=i.start,i.start=0))}}function jb(a,b){var c,d,e,f,g;for(c in a)if(d=r.camelCase(c),e=b[d],f=a[c],Array.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=r.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function kb(a,b,c){var d,e,f=0,g=kb.prefilters.length,h=r.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=ab||fb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;g<i;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),f<1&&i?c:(i||h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:r.extend({},b),opts:r.extend(!0,{specialEasing:{},easing:r.easing._default},c),originalProperties:b,originalOptions:c,startTime:ab||fb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=r.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;c<d;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for(jb(k,j.opts.specialEasing);f<g;f++)if(d=kb.prefilters[f].call(j,a,k,j.opts))return r.isFunction(d.stop)&&(r._queueHooks(j.elem,j.opts.queue).stop=r.proxy(d.stop,d)),d;return r.map(k,hb,j),r.isFunction(j.opts.start)&&j.opts.start.call(a,j),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always),r.fx.timer(r.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j}r.Animation=r.extend(kb,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return fa(c.elem,a,ba.exec(b),c),c}]},tweener:function(a,b){r.isFunction(a)?(b=a,a=["*"]):a=a.match(L);for(var c,d=0,e=a.length;d<e;d++)c=a[d],kb.tweeners[c]=kb.tweeners[c]||[],kb.tweeners[c].unshift(b)},prefilters:[ib],prefilter:function(a,b){b?kb.prefilters.unshift(a):kb.prefilters.push(a)}}),r.speed=function(a,b,c){var d=a&&"object"==typeof a?r.extend({},a):{complete:c||!c&&b||r.isFunction(a)&&a,duration:a,easing:c&&b||b&&!r.isFunction(b)&&b};return r.fx.off?d.duration=0:"number"!=typeof d.duration&&(d.duration in r.fx.speeds?d.duration=r.fx.speeds[d.duration]:d.duration=r.fx.speeds._default),null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){r.isFunction(d.old)&&d.old.call(this),d.queue&&r.dequeue(this,d.queue)},d},r.fn.extend({fadeTo:function(a,b,c,d){return this.filter(da).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=r.isEmptyObject(a),f=r.speed(b,c,d),g=function(){var b=kb(this,r.extend({},a),f);(e||W.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=r.timers,g=W.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&db.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||r.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=W.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=r.timers,g=d?d.length:0;for(c.finish=!0,r.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;b<g;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),r.each(["toggle","show","hide"],function(a,b){var c=r.fn[b];r.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(gb(b,!0),a,d,e)}}),r.each({slideDown:gb("show"),slideUp:gb("hide"),slideToggle:gb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){r.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),r.timers=[],r.fx.tick=function(){var a,b=0,c=r.timers;for(ab=r.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||r.fx.stop(),ab=void 0},r.fx.timer=function(a){r.timers.push(a),r.fx.start()},r.fx.interval=13,r.fx.start=function(){bb||(bb=!0,eb())},r.fx.stop=function(){bb=null},r.fx.speeds={slow:600,fast:200,_default:400},r.fn.delay=function(b,c){return b=r.fx?r.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",o.checkOn=""!==a.value,o.optSelected=c.selected,a=d.createElement("input"),a.value="t",a.type="radio",o.radioValue="t"===a.value}();var lb,mb=r.expr.attrHandle;r.fn.extend({attr:function(a,b){return T(this,r.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){r.removeAttr(this,a)})}}),r.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?r.prop(a,b,c):(1===f&&r.isXMLDoc(a)||(e=r.attrHooks[b.toLowerCase()]||(r.expr.match.bool.test(b)?lb:void 0)),void 0!==c?null===c?void r.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=r.find.attr(a,b),
null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!o.radioValue&&"radio"===b&&B(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d=0,e=b&&b.match(L);if(e&&1===a.nodeType)while(c=e[d++])a.removeAttribute(c)}}),lb={set:function(a,b,c){return b===!1?r.removeAttr(a,c):a.setAttribute(c,c),c}},r.each(r.expr.match.bool.source.match(/\w+/g),function(a,b){var c=mb[b]||r.find.attr;mb[b]=function(a,b,d){var e,f,g=b.toLowerCase();return d||(f=mb[g],mb[g]=e,e=null!=c(a,b,d)?g:null,mb[g]=f),e}});var nb=/^(?:input|select|textarea|button)$/i,ob=/^(?:a|area)$/i;r.fn.extend({prop:function(a,b){return T(this,r.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[r.propFix[a]||a]})}}),r.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&r.isXMLDoc(a)||(b=r.propFix[b]||b,e=r.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=r.find.attr(a,"tabindex");return b?parseInt(b,10):nb.test(a.nodeName)||ob.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),o.optSelected||(r.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),r.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){r.propFix[this.toLowerCase()]=this});function pb(a){var b=a.match(L)||[];return b.join(" ")}function qb(a){return a.getAttribute&&a.getAttribute("class")||""}r.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(r.isFunction(a))return this.each(function(b){r(this).addClass(a.call(this,b,qb(this)))});if("string"==typeof a&&a){b=a.match(L)||[];while(c=this[i++])if(e=qb(c),d=1===c.nodeType&&" "+pb(e)+" "){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=pb(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(r.isFunction(a))return this.each(function(b){r(this).removeClass(a.call(this,b,qb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(L)||[];while(c=this[i++])if(e=qb(c),d=1===c.nodeType&&" "+pb(e)+" "){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=pb(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):r.isFunction(a)?this.each(function(c){r(this).toggleClass(a.call(this,c,qb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=r(this),f=a.match(L)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=qb(this),b&&W.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":W.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+pb(qb(c))+" ").indexOf(b)>-1)return!0;return!1}});var rb=/\r/g;r.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=r.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,r(this).val()):a,null==e?e="":"number"==typeof e?e+="":Array.isArray(e)&&(e=r.map(e,function(a){return null==a?"":a+""})),b=r.valHooks[this.type]||r.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=r.valHooks[e.type]||r.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(rb,""):null==c?"":c)}}}),r.extend({valHooks:{option:{get:function(a){var b=r.find.attr(a,"value");return null!=b?b:pb(r.text(a))}},select:{get:function(a){var b,c,d,e=a.options,f=a.selectedIndex,g="select-one"===a.type,h=g?null:[],i=g?f+1:e.length;for(d=f<0?i:g?f:0;d<i;d++)if(c=e[d],(c.selected||d===f)&&!c.disabled&&(!c.parentNode.disabled||!B(c.parentNode,"optgroup"))){if(b=r(c).val(),g)return b;h.push(b)}return h},set:function(a,b){var c,d,e=a.options,f=r.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=r.inArray(r.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),r.each(["radio","checkbox"],function(){r.valHooks[this]={set:function(a,b){if(Array.isArray(b))return a.checked=r.inArray(r(a).val(),b)>-1}},o.checkOn||(r.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var sb=/^(?:focusinfocus|focusoutblur)$/;r.extend(r.event,{trigger:function(b,c,e,f){var g,h,i,j,k,m,n,o=[e||d],p=l.call(b,"type")?b.type:b,q=l.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!sb.test(p+r.event.triggered)&&(p.indexOf(".")>-1&&(q=p.split("."),p=q.shift(),q.sort()),k=p.indexOf(":")<0&&"on"+p,b=b[r.expando]?b:new r.Event(p,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=q.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+q.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:r.makeArray(c,[b]),n=r.event.special[p]||{},f||!n.trigger||n.trigger.apply(e,c)!==!1)){if(!f&&!n.noBubble&&!r.isWindow(e)){for(j=n.delegateType||p,sb.test(j+p)||(h=h.parentNode);h;h=h.parentNode)o.push(h),i=h;i===(e.ownerDocument||d)&&o.push(i.defaultView||i.parentWindow||a)}g=0;while((h=o[g++])&&!b.isPropagationStopped())b.type=g>1?j:n.bindType||p,m=(W.get(h,"events")||{})[b.type]&&W.get(h,"handle"),m&&m.apply(h,c),m=k&&h[k],m&&m.apply&&U(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=p,f||b.isDefaultPrevented()||n._default&&n._default.apply(o.pop(),c)!==!1||!U(e)||k&&r.isFunction(e[p])&&!r.isWindow(e)&&(i=e[k],i&&(e[k]=null),r.event.triggered=p,e[p](),r.event.triggered=void 0,i&&(e[k]=i)),b.result}},simulate:function(a,b,c){var d=r.extend(new r.Event,c,{type:a,isSimulated:!0});r.event.trigger(d,null,b)}}),r.fn.extend({trigger:function(a,b){return this.each(function(){r.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];if(c)return r.event.trigger(a,b,c,!0)}}),r.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(a,b){r.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),r.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),o.focusin="onfocusin"in a,o.focusin||r.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){r.event.simulate(b,a.target,r.event.fix(a))};r.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=W.access(d,b);e||d.addEventListener(a,c,!0),W.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=W.access(d,b)-1;e?W.access(d,b,e):(d.removeEventListener(a,c,!0),W.remove(d,b))}}});var tb=a.location,ub=r.now(),vb=/\?/;r.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||r.error("Invalid XML: "+b),c};var wb=/\[\]$/,xb=/\r?\n/g,yb=/^(?:submit|button|image|reset|file)$/i,zb=/^(?:input|select|textarea|keygen)/i;function Ab(a,b,c,d){var e;if(Array.isArray(b))r.each(b,function(b,e){c||wb.test(a)?d(a,e):Ab(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==r.type(b))d(a,b);else for(e in b)Ab(a+"["+e+"]",b[e],c,d)}r.param=function(a,b){var c,d=[],e=function(a,b){var c=r.isFunction(b)?b():b;d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(null==c?"":c)};if(Array.isArray(a)||a.jquery&&!r.isPlainObject(a))r.each(a,function(){e(this.name,this.value)});else for(c in a)Ab(c,a[c],b,e);return d.join("&")},r.fn.extend({serialize:function(){return r.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=r.prop(this,"elements");return a?r.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!r(this).is(":disabled")&&zb.test(this.nodeName)&&!yb.test(a)&&(this.checked||!ja.test(a))}).map(function(a,b){var c=r(this).val();return null==c?null:Array.isArray(c)?r.map(c,function(a){return{name:b.name,value:a.replace(xb,"\r\n")}}):{name:b.name,value:c.replace(xb,"\r\n")}}).get()}});var Bb=/%20/g,Cb=/#.*$/,Db=/([?&])_=[^&]*/,Eb=/^(.*?):[ \t]*([^\r\n]*)$/gm,Fb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Gb=/^(?:GET|HEAD)$/,Hb=/^\/\//,Ib={},Jb={},Kb="*/".concat("*"),Lb=d.createElement("a");Lb.href=tb.href;function Mb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(L)||[];if(r.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Nb(a,b,c,d){var e={},f=a===Jb;function g(h){var i;return e[h]=!0,r.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Ob(a,b){var c,d,e=r.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&r.extend(!0,a,d),a}function Pb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}if(f)return f!==i[0]&&i.unshift(f),c[f]}function Qb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}r.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:tb.href,type:"GET",isLocal:Fb.test(tb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Kb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":r.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Ob(Ob(a,r.ajaxSettings),b):Ob(r.ajaxSettings,a)},ajaxPrefilter:Mb(Ib),ajaxTransport:Mb(Jb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m,n,o=r.ajaxSetup({},c),p=o.context||o,q=o.context&&(p.nodeType||p.jquery)?r(p):r.event,s=r.Deferred(),t=r.Callbacks("once memory"),u=o.statusCode||{},v={},w={},x="canceled",y={readyState:0,getResponseHeader:function(a){var b;if(k){if(!h){h={};while(b=Eb.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return k?g:null},setRequestHeader:function(a,b){return null==k&&(a=w[a.toLowerCase()]=w[a.toLowerCase()]||a,v[a]=b),this},overrideMimeType:function(a){return null==k&&(o.mimeType=a),this},statusCode:function(a){var b;if(a)if(k)y.always(a[y.status]);else for(b in a)u[b]=[u[b],a[b]];return this},abort:function(a){var b=a||x;return e&&e.abort(b),A(0,b),this}};if(s.promise(y),o.url=((b||o.url||tb.href)+"").replace(Hb,tb.protocol+"//"),o.type=c.method||c.type||o.method||o.type,o.dataTypes=(o.dataType||"*").toLowerCase().match(L)||[""],null==o.crossDomain){j=d.createElement("a");try{j.href=o.url,j.href=j.href,o.crossDomain=Lb.protocol+"//"+Lb.host!=j.protocol+"//"+j.host}catch(z){o.crossDomain=!0}}if(o.data&&o.processData&&"string"!=typeof o.data&&(o.data=r.param(o.data,o.traditional)),Nb(Ib,o,c,y),k)return y;l=r.event&&o.global,l&&0===r.active++&&r.event.trigger("ajaxStart"),o.type=o.type.toUpperCase(),o.hasContent=!Gb.test(o.type),f=o.url.replace(Cb,""),o.hasContent?o.data&&o.processData&&0===(o.contentType||"").indexOf("application/x-www-form-urlencoded")&&(o.data=o.data.replace(Bb,"+")):(n=o.url.slice(f.length),o.data&&(f+=(vb.test(f)?"&":"?")+o.data,delete o.data),o.cache===!1&&(f=f.replace(Db,"$1"),n=(vb.test(f)?"&":"?")+"_="+ub++ +n),o.url=f+n),o.ifModified&&(r.lastModified[f]&&y.setRequestHeader("If-Modified-Since",r.lastModified[f]),r.etag[f]&&y.setRequestHeader("If-None-Match",r.etag[f])),(o.data&&o.hasContent&&o.contentType!==!1||c.contentType)&&y.setRequestHeader("Content-Type",o.contentType),y.setRequestHeader("Accept",o.dataTypes[0]&&o.accepts[o.dataTypes[0]]?o.accepts[o.dataTypes[0]]+("*"!==o.dataTypes[0]?", "+Kb+"; q=0.01":""):o.accepts["*"]);for(m in o.headers)y.setRequestHeader(m,o.headers[m]);if(o.beforeSend&&(o.beforeSend.call(p,y,o)===!1||k))return y.abort();if(x="abort",t.add(o.complete),y.done(o.success),y.fail(o.error),e=Nb(Jb,o,c,y)){if(y.readyState=1,l&&q.trigger("ajaxSend",[y,o]),k)return y;o.async&&o.timeout>0&&(i=a.setTimeout(function(){y.abort("timeout")},o.timeout));try{k=!1,e.send(v,A)}catch(z){if(k)throw z;A(-1,z)}}else A(-1,"No Transport");function A(b,c,d,h){var j,m,n,v,w,x=c;k||(k=!0,i&&a.clearTimeout(i),e=void 0,g=h||"",y.readyState=b>0?4:0,j=b>=200&&b<300||304===b,d&&(v=Pb(o,y,d)),v=Qb(o,v,y,j),j?(o.ifModified&&(w=y.getResponseHeader("Last-Modified"),w&&(r.lastModified[f]=w),w=y.getResponseHeader("etag"),w&&(r.etag[f]=w)),204===b||"HEAD"===o.type?x="nocontent":304===b?x="notmodified":(x=v.state,m=v.data,n=v.error,j=!n)):(n=x,!b&&x||(x="error",b<0&&(b=0))),y.status=b,y.statusText=(c||x)+"",j?s.resolveWith(p,[m,x,y]):s.rejectWith(p,[y,x,n]),y.statusCode(u),u=void 0,l&&q.trigger(j?"ajaxSuccess":"ajaxError",[y,o,j?m:n]),t.fireWith(p,[y,x]),l&&(q.trigger("ajaxComplete",[y,o]),--r.active||r.event.trigger("ajaxStop")))}return y},getJSON:function(a,b,c){return r.get(a,b,c,"json")},getScript:function(a,b){return r.get(a,void 0,b,"script")}}),r.each(["get","post"],function(a,b){r[b]=function(a,c,d,e){return r.isFunction(c)&&(e=e||d,d=c,c=void 0),r.ajax(r.extend({url:a,type:b,dataType:e,data:c,success:d},r.isPlainObject(a)&&a))}}),r._evalUrl=function(a){return r.ajax({url:a,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,"throws":!0})},r.fn.extend({wrapAll:function(a){var b;return this[0]&&(r.isFunction(a)&&(a=a.call(this[0])),b=r(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this},wrapInner:function(a){return r.isFunction(a)?this.each(function(b){r(this).wrapInner(a.call(this,b))}):this.each(function(){var b=r(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=r.isFunction(a);return this.each(function(c){r(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(a){return this.parent(a).not("body").each(function(){r(this).replaceWith(this.childNodes)}),this}}),r.expr.pseudos.hidden=function(a){return!r.expr.pseudos.visible(a)},r.expr.pseudos.visible=function(a){return!!(a.offsetWidth||a.offsetHeight||a.getClientRects().length)},r.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Rb={0:200,1223:204},Sb=r.ajaxSettings.xhr();o.cors=!!Sb&&"withCredentials"in Sb,o.ajax=Sb=!!Sb,r.ajaxTransport(function(b){var c,d;if(o.cors||Sb&&!b.crossDomain)return{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Rb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}}),r.ajaxPrefilter(function(a){a.crossDomain&&(a.contents.script=!1)}),r.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return r.globalEval(a),a}}}),r.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),r.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=r("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Tb=[],Ub=/(=)\?(?=&|$)|\?\?/;r.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Tb.pop()||r.expando+"_"+ub++;return this[a]=!0,a}}),r.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Ub.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Ub.test(b.data)&&"data");if(h||"jsonp"===b.dataTypes[0])return e=b.jsonpCallback=r.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Ub,"$1"+e):b.jsonp!==!1&&(b.url+=(vb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||r.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?r(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Tb.push(e)),g&&r.isFunction(f)&&f(g[0]),g=f=void 0}),"script"}),o.createHTMLDocument=function(){var a=d.implementation.createHTMLDocument("").body;return a.innerHTML="<form></form><form></form>",2===a.childNodes.length}(),r.parseHTML=function(a,b,c){if("string"!=typeof a)return[];"boolean"==typeof b&&(c=b,b=!1);var e,f,g;return b||(o.createHTMLDocument?(b=d.implementation.createHTMLDocument(""),e=b.createElement("base"),e.href=d.location.href,b.head.appendChild(e)):b=d),f=C.exec(a),g=!c&&[],f?[b.createElement(f[1])]:(f=qa([a],b,g),g&&g.length&&r(g).remove(),r.merge([],f.childNodes))},r.fn.load=function(a,b,c){var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=pb(a.slice(h)),a=a.slice(0,h)),r.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&r.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?r("<div>").append(r.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},r.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){r.fn[b]=function(a){return this.on(b,a)}}),r.expr.pseudos.animated=function(a){return r.grep(r.timers,function(b){return a===b.elem}).length},r.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=r.css(a,"position"),l=r(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=r.css(a,"top"),i=r.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),r.isFunction(b)&&(b=b.call(a,c,r.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},r.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){r.offset.setOffset(this,a,b)});var b,c,d,e,f=this[0];if(f)return f.getClientRects().length?(d=f.getBoundingClientRect(),b=f.ownerDocument,c=b.documentElement,e=b.defaultView,{top:d.top+e.pageYOffset-c.clientTop,left:d.left+e.pageXOffset-c.clientLeft}):{top:0,left:0}},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===r.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),B(a[0],"html")||(d=a.offset()),d={top:d.top+r.css(a[0],"borderTopWidth",!0),left:d.left+r.css(a[0],"borderLeftWidth",!0)}),{top:b.top-d.top-r.css(c,"marginTop",!0),left:b.left-d.left-r.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===r.css(a,"position"))a=a.offsetParent;return a||ra})}}),r.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;r.fn[a]=function(d){return T(this,function(a,d,e){var f;return r.isWindow(a)?f=a:9===a.nodeType&&(f=a.defaultView),void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),r.each(["top","left"],function(a,b){r.cssHooks[b]=Pa(o.pixelPosition,function(a,c){if(c)return c=Oa(a,b),Ma.test(c)?r(a).position()[b]+"px":c})}),r.each({Height:"height",Width:"width"},function(a,b){r.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){r.fn[d]=function(e,f){var g=arguments.length&&(c||"boolean"!=typeof e),h=c||(e===!0||f===!0?"margin":"border");return T(this,function(b,c,e){var f;return r.isWindow(b)?0===d.indexOf("outer")?b["inner"+a]:b.document.documentElement["client"+a]:9===b.nodeType?(f=b.documentElement,Math.max(b.body["scroll"+a],f["scroll"+a],b.body["offset"+a],f["offset"+a],f["client"+a])):void 0===e?r.css(b,c,h):r.style(b,c,e,h)},b,g?e:void 0,g)}})}),r.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}}),r.holdReady=function(a){a?r.readyWait++:r.ready(!0)},r.isArray=Array.isArray,r.parseJSON=JSON.parse,r.nodeName=B,"function"==typeof define&&define.amd&&define("jquery",[],function(){return r});var Vb=a.jQuery,Wb=a.$;return r.noConflict=function(b){return a.$===r&&(a.$=Wb),b&&a.jQuery===r&&(a.jQuery=Vb),r},b||(a.jQuery=a.$=r),r});

/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>3)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){if(a(b.target).is(this))return b.handleObj.handler.apply(this,arguments)}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.7",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a("#"===f?[]:f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.7",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c).prop(c,!0)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c).prop(c,!1))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target).closest(".btn");b.call(d,"toggle"),a(c.target).is('input[type="radio"], input[type="checkbox"]')||(c.preventDefault(),d.is("input,button")?d.trigger("focus"):d.find("input:visible,button:visible").first().trigger("focus"))}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));if(!(a>this.$items.length-1||a<0))return this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){if(!this.sliding)return this.slide("next")},c.prototype.prev=function(){if(!this.sliding)return this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.7",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger(a.Event("hidden.bs.dropdown",f)))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.7",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger(a.Event("shown.bs.dropdown",h))}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){document===a.target||this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);if(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),!c.isInStateTrue())return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element&&e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);if(this.$element.trigger(g),!g.isDefaultPrevented())return f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=window.SVGElement&&c instanceof window.SVGElement,g=d?{top:0,left:0}:f?null:b.offset(),h={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},i=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,h,i,g)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null,a.$element=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.7",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.7",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){
this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.7",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return e<c&&"top";if("bottom"==this.affixed)return null!=c?!(e+this.unpin<=f.top)&&"bottom":!(e+g<=a-d)&&"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&e<=c?"top":null!=d&&i+j>=a-d&&"bottom"},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
/*!
// ███   █    ████▄    ▄▄▄▄▀ ▄▄▄▄▀ ▄███▄   █▄▄▄▄
// █  █  █    █   █ ▀▀▀ █ ▀▀▀ █    █▀   ▀  █  ▄▀
// █ ▀ ▄ █    █   █     █     █    ██▄▄    █▀▀▌
// █  ▄▀ ███▄ ▀████    █     █     █▄   ▄▀ █  █
// ███       ▀        ▀     ▀      ▀███▀     █
//                                          ▀
// The MIT License
//
// Copyright © 1986 - ∞, Blotter / Bradley Griffith / http://bradley.computer
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
*/
!function(){var a="object"==typeof self&&self.self===self&&self||"object"==typeof global&&global.global===global&&global||this,b=a._,c=Array.prototype,d=Object.prototype,e="undefined"!=typeof Symbol?Symbol.prototype:null,f=c.push,g=c.slice,h=d.toString,i=d.hasOwnProperty,j=Array.isArray,k=Object.keys,l=Object.create,m=function(){},n=function(a){return a instanceof n?a:this instanceof n?void(this._wrapped=a):new n(a)};"undefined"==typeof exports||exports.nodeType?a._=n:("undefined"!=typeof module&&!module.nodeType&&module.exports&&(exports=module.exports=n),exports._=n),n.VERSION="1.8.3";var o,p=function(a,b,c){if(void 0===b)return a;switch(null==c?3:c){case 1:return function(c){return a.call(b,c)};case 3:return function(c,d,e){return a.call(b,c,d,e)};case 4:return function(c,d,e,f){return a.call(b,c,d,e,f)}}return function(){return a.apply(b,arguments)}},q=function(a,b,c){return n.iteratee!==o?n.iteratee(a,b):null==a?n.identity:n.isFunction(a)?p(a,b,c):n.isObject(a)?n.matcher(a):n.property(a)};n.iteratee=o=function(a,b){return q(a,b,1/0)};var r=function(a,b){return b=null==b?a.length-1:+b,function(){for(var c=Math.max(arguments.length-b,0),d=Array(c),e=0;e<c;e++)d[e]=arguments[e+b];switch(b){case 0:return a.call(this,d);case 1:return a.call(this,arguments[0],d);case 2:return a.call(this,arguments[0],arguments[1],d)}var f=Array(b+1);for(e=0;e<b;e++)f[e]=arguments[e];return f[b]=d,a.apply(this,f)}},s=function(a){if(!n.isObject(a))return{};if(l)return l(a);m.prototype=a;var b=new m;return m.prototype=null,b},t=function(a){return function(b){return null==b?void 0:b[a]}},u=Math.pow(2,53)-1,v=t("length"),w=function(a){var b=v(a);return"number"==typeof b&&b>=0&&b<=u};n.each=n.forEach=function(a,b,c){b=p(b,c);var d,e;if(w(a))for(d=0,e=a.length;d<e;d++)b(a[d],d,a);else{var f=n.keys(a);for(d=0,e=f.length;d<e;d++)b(a[f[d]],f[d],a)}return a},n.map=n.collect=function(a,b,c){b=q(b,c);for(var d=!w(a)&&n.keys(a),e=(d||a).length,f=Array(e),g=0;g<e;g++){var h=d?d[g]:g;f[g]=b(a[h],h,a)}return f};var x=function(a){var b=function(b,c,d,e){var f=!w(b)&&n.keys(b),g=(f||b).length,h=a>0?0:g-1;for(e||(d=b[f?f[h]:h],h+=a);h>=0&&h<g;h+=a){var i=f?f[h]:h;d=c(d,b[i],i,b)}return d};return function(a,c,d,e){var f=arguments.length>=3;return b(a,p(c,e,4),d,f)}};n.reduce=n.foldl=n.inject=x(1),n.reduceRight=n.foldr=x(-1),n.find=n.detect=function(a,b,c){var d=w(a)?n.findIndex:n.findKey,e=d(a,b,c);if(void 0!==e&&-1!==e)return a[e]},n.filter=n.select=function(a,b,c){var d=[];return b=q(b,c),n.each(a,function(a,c,e){b(a,c,e)&&d.push(a)}),d},n.reject=function(a,b,c){return n.filter(a,n.negate(q(b)),c)},n.every=n.all=function(a,b,c){b=q(b,c);for(var d=!w(a)&&n.keys(a),e=(d||a).length,f=0;f<e;f++){var g=d?d[f]:f;if(!b(a[g],g,a))return!1}return!0},n.some=n.any=function(a,b,c){b=q(b,c);for(var d=!w(a)&&n.keys(a),e=(d||a).length,f=0;f<e;f++){var g=d?d[f]:f;if(b(a[g],g,a))return!0}return!1},n.contains=n.includes=n.include=function(a,b,c,d){return w(a)||(a=n.values(a)),("number"!=typeof c||d)&&(c=0),n.indexOf(a,b,c)>=0},n.invoke=r(function(a,b,c){var d=n.isFunction(b);return n.map(a,function(a){var e=d?b:a[b];return null==e?e:e.apply(a,c)})}),n.pluck=function(a,b){return n.map(a,n.property(b))},n.where=function(a,b){return n.filter(a,n.matcher(b))},n.findWhere=function(a,b){return n.find(a,n.matcher(b))},n.max=function(a,b,c){var d,e,f=-1/0,g=-1/0;if(null==b||"number"==typeof b&&"object"!=typeof a[0]&&null!=a){a=w(a)?a:n.values(a);for(var h=0,i=a.length;h<i;h++)null!=(d=a[h])&&d>f&&(f=d)}else b=q(b,c),n.each(a,function(a,c,d){((e=b(a,c,d))>g||e===-1/0&&f===-1/0)&&(f=a,g=e)});return f},n.min=function(a,b,c){var d,e,f=1/0,g=1/0;if(null==b||"number"==typeof b&&"object"!=typeof a[0]&&null!=a){a=w(a)?a:n.values(a);for(var h=0,i=a.length;h<i;h++)null!=(d=a[h])&&d<f&&(f=d)}else b=q(b,c),n.each(a,function(a,c,d){((e=b(a,c,d))<g||e===1/0&&f===1/0)&&(f=a,g=e)});return f},n.shuffle=function(a){return n.sample(a,1/0)},n.sample=function(a,b,c){if(null==b||c)return w(a)||(a=n.values(a)),a[n.random(a.length-1)];var d=w(a)?n.clone(a):n.values(a),e=v(d);b=Math.max(Math.min(b,e),0);for(var f=e-1,g=0;g<b;g++){var h=n.random(g,f),i=d[g];d[g]=d[h],d[h]=i}return d.slice(0,b)},n.sortBy=function(a,b,c){var d=0;return b=q(b,c),n.pluck(n.map(a,function(a,c,e){return{value:a,index:d++,criteria:b(a,c,e)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;if(c!==d){if(c>d||void 0===c)return 1;if(c<d||void 0===d)return-1}return a.index-b.index}),"value")};var y=function(a,b){return function(c,d,e){var f=b?[[],[]]:{};return d=q(d,e),n.each(c,function(b,e){var g=d(b,e,c);a(f,b,g)}),f}};n.groupBy=y(function(a,b,c){n.has(a,c)?a[c].push(b):a[c]=[b]}),n.indexBy=y(function(a,b,c){a[c]=b}),n.countBy=y(function(a,b,c){n.has(a,c)?a[c]++:a[c]=1});var z=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;n.toArray=function(a){return a?n.isArray(a)?g.call(a):n.isString(a)?a.match(z):w(a)?n.map(a,n.identity):n.values(a):[]},n.size=function(a){return null==a?0:w(a)?a.length:n.keys(a).length},n.partition=y(function(a,b,c){a[c?0:1].push(b)},!0),n.first=n.head=n.take=function(a,b,c){if(null!=a)return null==b||c?a[0]:n.initial(a,a.length-b)},n.initial=function(a,b,c){return g.call(a,0,Math.max(0,a.length-(null==b||c?1:b)))},n.last=function(a,b,c){if(null!=a)return null==b||c?a[a.length-1]:n.rest(a,Math.max(0,a.length-b))},n.rest=n.tail=n.drop=function(a,b,c){return g.call(a,null==b||c?1:b)},n.compact=function(a){return n.filter(a,Boolean)};var A=function(a,b,c,d){d=d||[];for(var e=d.length,f=0,g=v(a);f<g;f++){var h=a[f];if(w(h)&&(n.isArray(h)||n.isArguments(h)))if(b)for(var i=0,j=h.length;i<j;)d[e++]=h[i++];else A(h,b,c,d),e=d.length;else c||(d[e++]=h)}return d};n.flatten=function(a,b){return A(a,b,!1)},n.without=r(function(a,b){return n.difference(a,b)}),n.uniq=n.unique=function(a,b,c,d){n.isBoolean(b)||(d=c,c=b,b=!1),null!=c&&(c=q(c,d));for(var e=[],f=[],g=0,h=v(a);g<h;g++){var i=a[g],j=c?c(i,g,a):i;b?(g&&f===j||e.push(i),f=j):c?n.contains(f,j)||(f.push(j),e.push(i)):n.contains(e,i)||e.push(i)}return e},n.union=r(function(a){return n.uniq(A(a,!0,!0))}),n.intersection=function(a){for(var b=[],c=arguments.length,d=0,e=v(a);d<e;d++){var f=a[d];if(!n.contains(b,f)){var g;for(g=1;g<c&&n.contains(arguments[g],f);g++);g===c&&b.push(f)}}return b},n.difference=r(function(a,b){return b=A(b,!0,!0),n.filter(a,function(a){return!n.contains(b,a)})}),n.unzip=function(a){for(var b=a&&n.max(a,v).length||0,c=Array(b),d=0;d<b;d++)c[d]=n.pluck(a,d);return c},n.zip=r(n.unzip),n.object=function(a,b){for(var c={},d=0,e=v(a);d<e;d++)b?c[a[d]]=b[d]:c[a[d][0]]=a[d][1];return c};var B=function(a){return function(b,c,d){c=q(c,d);for(var e=v(b),f=a>0?0:e-1;f>=0&&f<e;f+=a)if(c(b[f],f,b))return f;return-1}};n.findIndex=B(1),n.findLastIndex=B(-1),n.sortedIndex=function(a,b,c,d){c=q(c,d,1);for(var e=c(b),f=0,g=v(a);f<g;){var h=Math.floor((f+g)/2);c(a[h])<e?f=h+1:g=h}return f};var C=function(a,b,c){return function(d,e,f){var h=0,i=v(d);if("number"==typeof f)a>0?h=f>=0?f:Math.max(f+i,h):i=f>=0?Math.min(f+1,i):f+i+1;else if(c&&f&&i)return f=c(d,e),d[f]===e?f:-1;if(e!==e)return f=b(g.call(d,h,i),n.isNaN),f>=0?f+h:-1;for(f=a>0?h:i-1;f>=0&&f<i;f+=a)if(d[f]===e)return f;return-1}};n.indexOf=C(1,n.findIndex,n.sortedIndex),n.lastIndexOf=C(-1,n.findLastIndex),n.range=function(a,b,c){null==b&&(b=a||0,a=0),c||(c=b<a?-1:1);for(var d=Math.max(Math.ceil((b-a)/c),0),e=Array(d),f=0;f<d;f++,a+=c)e[f]=a;return e},n.chunk=function(a,b){if(null==b||b<1)return[];for(var c=[],d=0,e=a.length;d<e;)c.push(g.call(a,d,d+=b));return c};var D=function(a,b,c,d,e){if(!(d instanceof b))return a.apply(c,e);var f=s(a.prototype),g=a.apply(f,e);return n.isObject(g)?g:f};n.bind=r(function(a,b,c){if(!n.isFunction(a))throw new TypeError("Bind must be called on a function");var d=r(function(e){return D(a,d,b,this,c.concat(e))});return d}),n.partial=r(function(a,b){var c=n.partial.placeholder,d=function(){for(var e=0,f=b.length,g=Array(f),h=0;h<f;h++)g[h]=b[h]===c?arguments[e++]:b[h];for(;e<arguments.length;)g.push(arguments[e++]);return D(a,d,this,this,g)};return d}),n.partial.placeholder=n,n.bindAll=r(function(a,b){b=A(b,!1,!1);var c=b.length;if(c<1)throw new Error("bindAll must be passed function names");for(;c--;){var d=b[c];a[d]=n.bind(a[d],a)}}),n.memoize=function(a,b){var c=function(d){var e=c.cache,f=""+(b?b.apply(this,arguments):d);return n.has(e,f)||(e[f]=a.apply(this,arguments)),e[f]};return c.cache={},c},n.delay=r(function(a,b,c){return setTimeout(function(){return a.apply(null,c)},b)}),n.defer=n.partial(n.delay,n,1),n.throttle=function(a,b,c){var d,e,f,g,h=0;c||(c={});var i=function(){h=!1===c.leading?0:n.now(),d=null,g=a.apply(e,f),d||(e=f=null)},j=function(){var j=n.now();h||!1!==c.leading||(h=j);var k=b-(j-h);return e=this,f=arguments,k<=0||k>b?(d&&(clearTimeout(d),d=null),h=j,g=a.apply(e,f),d||(e=f=null)):d||!1===c.trailing||(d=setTimeout(i,k)),g};return j.cancel=function(){clearTimeout(d),h=0,d=e=f=null},j},n.debounce=function(a,b,c){var d,e,f=function(b,c){d=null,c&&(e=a.apply(b,c))},g=r(function(g){if(d&&clearTimeout(d),c){var h=!d;d=setTimeout(f,b),h&&(e=a.apply(this,g))}else d=n.delay(f,b,this,g);return e});return g.cancel=function(){clearTimeout(d),d=null},g},n.wrap=function(a,b){return n.partial(b,a)},n.negate=function(a){return function(){return!a.apply(this,arguments)}},n.compose=function(){var a=arguments,b=a.length-1;return function(){for(var c=b,d=a[b].apply(this,arguments);c--;)d=a[c].call(this,d);return d}},n.after=function(a,b){return function(){if(--a<1)return b.apply(this,arguments)}},n.before=function(a,b){var c;return function(){return--a>0&&(c=b.apply(this,arguments)),a<=1&&(b=null),c}},n.once=n.partial(n.before,2),n.restArgs=r;var E=!{toString:null}.propertyIsEnumerable("toString"),F=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],G=function(a,b){var c=F.length,e=a.constructor,f=n.isFunction(e)&&e.prototype||d,g="constructor";for(n.has(a,g)&&!n.contains(b,g)&&b.push(g);c--;)(g=F[c])in a&&a[g]!==f[g]&&!n.contains(b,g)&&b.push(g)};n.keys=function(a){if(!n.isObject(a))return[];if(k)return k(a);var b=[];for(var c in a)n.has(a,c)&&b.push(c);return E&&G(a,b),b},n.allKeys=function(a){if(!n.isObject(a))return[];var b=[];for(var c in a)b.push(c);return E&&G(a,b),b},n.values=function(a){for(var b=n.keys(a),c=b.length,d=Array(c),e=0;e<c;e++)d[e]=a[b[e]];return d},n.mapObject=function(a,b,c){b=q(b,c);for(var d=n.keys(a),e=d.length,f={},g=0;g<e;g++){var h=d[g];f[h]=b(a[h],h,a)}return f},n.pairs=function(a){for(var b=n.keys(a),c=b.length,d=Array(c),e=0;e<c;e++)d[e]=[b[e],a[b[e]]];return d},n.invert=function(a){for(var b={},c=n.keys(a),d=0,e=c.length;d<e;d++)b[a[c[d]]]=c[d];return b},n.functions=n.methods=function(a){var b=[];for(var c in a)n.isFunction(a[c])&&b.push(c);return b.sort()};var H=function(a,b){return function(c){var d=arguments.length;if(b&&(c=Object(c)),d<2||null==c)return c;for(var e=1;e<d;e++)for(var f=arguments[e],g=a(f),h=g.length,i=0;i<h;i++){var j=g[i];b&&void 0!==c[j]||(c[j]=f[j])}return c}};n.extend=H(n.allKeys),n.extendOwn=n.assign=H(n.keys),n.findKey=function(a,b,c){b=q(b,c);for(var d,e=n.keys(a),f=0,g=e.length;f<g;f++)if(d=e[f],b(a[d],d,a))return d};var I=function(a,b,c){return b in c};n.pick=r(function(a,b){var c={},d=b[0];if(null==a)return c;n.isFunction(d)?(b.length>1&&(d=p(d,b[1])),b=n.allKeys(a)):(d=I,b=A(b,!1,!1),a=Object(a));for(var e=0,f=b.length;e<f;e++){var g=b[e],h=a[g];d(h,g,a)&&(c[g]=h)}return c}),n.omit=r(function(a,b){var c,d=b[0];return n.isFunction(d)?(d=n.negate(d),b.length>1&&(c=b[1])):(b=n.map(A(b,!1,!1),String),d=function(a,c){return!n.contains(b,c)}),n.pick(a,d,c)}),n.defaults=H(n.allKeys,!0),n.create=function(a,b){var c=s(a);return b&&n.extendOwn(c,b),c},n.clone=function(a){return n.isObject(a)?n.isArray(a)?a.slice():n.extend({},a):a},n.tap=function(a,b){return b(a),a},n.isMatch=function(a,b){var c=n.keys(b),d=c.length;if(null==a)return!d;for(var e=Object(a),f=0;f<d;f++){var g=c[f];if(b[g]!==e[g]||!(g in e))return!1}return!0};var J,K;J=function(a,b,c,d){if(a===b)return 0!==a||1/a==1/b;if(null==a||null==b)return a===b;if(a!==a)return b!==b;var e=typeof a;return("function"===e||"object"===e||"object"==typeof b)&&K(a,b,c,d)},K=function(a,b,c,d){a instanceof n&&(a=a._wrapped),b instanceof n&&(b=b._wrapped);var f=h.call(a);if(f!==h.call(b))return!1;switch(f){case"[object RegExp]":case"[object String]":return""+a==""+b;case"[object Number]":return+a!=+a?+b!=+b:0==+a?1/+a==1/b:+a==+b;case"[object Date]":case"[object Boolean]":return+a==+b;case"[object Symbol]":return e.valueOf.call(a)===e.valueOf.call(b)}var g="[object Array]"===f;if(!g){if("object"!=typeof a||"object"!=typeof b)return!1;var i=a.constructor,j=b.constructor;if(i!==j&&!(n.isFunction(i)&&i instanceof i&&n.isFunction(j)&&j instanceof j)&&"constructor"in a&&"constructor"in b)return!1}c=c||[],d=d||[];for(var k=c.length;k--;)if(c[k]===a)return d[k]===b;if(c.push(a),d.push(b),g){if((k=a.length)!==b.length)return!1;for(;k--;)if(!J(a[k],b[k],c,d))return!1}else{var l,m=n.keys(a);if(k=m.length,n.keys(b).length!==k)return!1;for(;k--;)if(l=m[k],!n.has(b,l)||!J(a[l],b[l],c,d))return!1}return c.pop(),d.pop(),!0},n.isEqual=function(a,b){return J(a,b)},n.isEmpty=function(a){return null==a||(w(a)&&(n.isArray(a)||n.isString(a)||n.isArguments(a))?0===a.length:0===n.keys(a).length)},n.isElement=function(a){return!(!a||1!==a.nodeType)},n.isArray=j||function(a){return"[object Array]"===h.call(a)},n.isObject=function(a){var b=typeof a;return"function"===b||"object"===b&&!!a},n.each(["Arguments","Function","String","Number","Date","RegExp","Error","Symbol","Map","WeakMap","Set","WeakSet"],function(a){n["is"+a]=function(b){return h.call(b)==="[object "+a+"]"}}),n.isArguments(arguments)||(n.isArguments=function(a){return n.has(a,"callee")});var L=a.document&&a.document.childNodes;"function"!=typeof/./&&"object"!=typeof Int8Array&&"function"!=typeof L&&(n.isFunction=function(a){return"function"==typeof a||!1}),n.isFinite=function(a){return!n.isSymbol(a)&&isFinite(a)&&!isNaN(parseFloat(a))},n.isNaN=function(a){return isNaN(a)&&n.isNumber(a)},n.isBoolean=function(a){return!0===a||!1===a||"[object Boolean]"===h.call(a)},n.isNull=function(a){return null===a},n.isUndefined=function(a){return void 0===a},n.has=function(a,b){return null!=a&&i.call(a,b)},n.noConflict=function(){return a._=b,this},n.identity=function(a){return a},n.constant=function(a){return function(){return a}},n.noop=function(){},n.property=t,n.propertyOf=function(a){return null==a?function(){}:function(b){return a[b]}},n.matcher=n.matches=function(a){return a=n.extendOwn({},a),function(b){return n.isMatch(b,a)}},n.times=function(a,b,c){var d=Array(Math.max(0,a));b=p(b,c,1);for(var e=0;e<a;e++)d[e]=b(e);return d},n.random=function(a,b){return null==b&&(b=a,a=0),a+Math.floor(Math.random()*(b-a+1))},n.now=Date.now||function(){return(new Date).getTime()};var M={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},N=n.invert(M),O=function(a){var b=function(b){return a[b]},c="(?:"+n.keys(a).join("|")+")",d=RegExp(c),e=RegExp(c,"g");return function(a){return a=null==a?"":""+a,d.test(a)?a.replace(e,b):a}};n.escape=O(M),n.unescape=O(N),n.result=function(a,b,c){var d=null==a?void 0:a[b];return void 0===d&&(d=c),n.isFunction(d)?d.call(a):d};var P=0;n.uniqueId=function(a){var b=++P+"";return a?a+b:b},n.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var Q=/(.)^/,R={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},S=/\\|'|\r|\n|\u2028|\u2029/g,T=function(a){return"\\"+R[a]};n.template=function(a,b,c){!b&&c&&(b=c),b=n.defaults({},b,n.templateSettings);var d=RegExp([(b.escape||Q).source,(b.interpolate||Q).source,(b.evaluate||Q).source].join("|")+"|$","g"),e=0,f="__p+='";a.replace(d,function(b,c,d,g,h){return f+=a.slice(e,h).replace(S,T),e=h+b.length,c?f+="'+\n((__t=("+c+"))==null?'':_.escape(__t))+\n'":d?f+="'+\n((__t=("+d+"))==null?'':__t)+\n'":g&&(f+="';\n"+g+"\n__p+='"),b}),f+="';\n",b.variable||(f="with(obj||{}){\n"+f+"}\n"),f="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+f+"return __p;\n";var g;try{g=new Function(b.variable||"obj","_",f)}catch(a){throw a.source=f,a}var h=function(a){return g.call(this,a,n)},i=b.variable||"obj";return h.source="function("+i+"){\n"+f+"}",h},n.chain=function(a){var b=n(a);return b._chain=!0,b};var U=function(a,b){return a._chain?n(b).chain():b};n.mixin=function(a){return n.each(n.functions(a),function(b){var c=n[b]=a[b];n.prototype[b]=function(){var a=[this._wrapped];return f.apply(a,arguments),U(this,c.apply(n,a))}}),n},n.mixin(n),n.each(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var b=c[a];n.prototype[a]=function(){var c=this._wrapped;return b.apply(c,arguments),"shift"!==a&&"splice"!==a||0!==c.length||delete c[0],U(this,c)}}),n.each(["concat","join","slice"],function(a){var b=c[a];n.prototype[a]=function(){return U(this,b.apply(this._wrapped,arguments))}}),n.prototype.value=function(){return this._wrapped},n.prototype.valueOf=n.prototype.toJSON=n.prototype.value,n.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return n})}(),function(a,b){"object"==typeof exports&&"undefined"!=typeof module?b(exports):"function"==typeof define&&define.amd?define(["exports"],b):b(a.THREE={})}(this,function(a){"use strict";function b(){}function c(a,b){this.x=a||0,this.y=b||0}function d(){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],arguments.length>0&&console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")}function e(a,b,c,d){this._x=a||0,this._y=b||0,this._z=c||0,this._w=void 0!==d?d:1}function f(a,b,c){this.x=a||0,this.y=b||0,this.z=c||0}function g(){this.elements=[1,0,0,0,1,0,0,0,1],arguments.length>0&&console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")}function h(a,b,d,e,f,i,j,k,l,m){Object.defineProperty(this,"id",{value:zd++}),this.uuid=yd.generateUUID(),this.name="",this.image=void 0!==a?a:h.DEFAULT_IMAGE,this.mipmaps=[],this.mapping=void 0!==b?b:h.DEFAULT_MAPPING,this.wrapS=void 0!==d?d:Ec,this.wrapT=void 0!==e?e:Ec,this.magFilter=void 0!==f?f:Jc,this.minFilter=void 0!==i?i:Lc,this.anisotropy=void 0!==l?l:1,this.format=void 0!==j?j:$c,this.type=void 0!==k?k:Mc,this.offset=new c(0,0),this.repeat=new c(1,1),this.center=new c(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new g,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=void 0!==m?m:pd,this.version=0,this.onUpdate=null}function i(a,b,c,d){this.x=a||0,this.y=b||0,this.z=c||0,this.w=void 0!==d?d:1}function j(a,b,c){this.uuid=yd.generateUUID(),this.width=a,this.height=b,this.scissor=new i(0,0,a,b),this.scissorTest=!1,this.viewport=new i(0,0,a,b),c=c||{},void 0===c.minFilter&&(c.minFilter=Jc),this.texture=new h(void 0,void 0,c.wrapS,c.wrapT,c.magFilter,c.minFilter,c.format,c.type,c.anisotropy,c.encoding),this.depthBuffer=void 0===c.depthBuffer||c.depthBuffer,this.stencilBuffer=void 0===c.stencilBuffer||c.stencilBuffer,this.depthTexture=void 0!==c.depthTexture?c.depthTexture:null}function k(a,b,c,d,e,f,g,i,j,k,l,m){h.call(this,null,f,g,i,j,k,d,e,l,m),this.image={data:a,width:b,height:c},this.magFilter=void 0!==j?j:Gc,this.minFilter=void 0!==k?k:Gc,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}function l(a,b,c,d,e,f,g,i,j,k){a=void 0!==a?a:[],b=void 0!==b?b:wc,h.call(this,a,b,c,d,e,f,g,i,j,k),this.flipY=!1}function m(){this.seq=[],this.map={}}function n(a,b,c){var d=a[0];if(d<=0||d>0)return a;var e=b*c,f=Cd[e];if(void 0===f&&(f=new Float32Array(e),Cd[e]=f),0!==b){d.toArray(f,0);for(var g=1,h=0;g!==b;++g)h+=c,a[g].toArray(f,h)}return f}function o(a,b){var c=Dd[b];void 0===c&&(c=new Int32Array(b),Dd[b]=c);for(var d=0;d!==b;++d)c[d]=a.allocTextureUnit();return c}function p(a,b){a.uniform1f(this.addr,b)}function q(a,b){a.uniform1i(this.addr,b)}function r(a,b){void 0===b.x?a.uniform2fv(this.addr,b):a.uniform2f(this.addr,b.x,b.y)}function s(a,b){void 0!==b.x?a.uniform3f(this.addr,b.x,b.y,b.z):void 0!==b.r?a.uniform3f(this.addr,b.r,b.g,b.b):a.uniform3fv(this.addr,b)}function t(a,b){void 0===b.x?a.uniform4fv(this.addr,b):a.uniform4f(this.addr,b.x,b.y,b.z,b.w)}function u(a,b){a.uniformMatrix2fv(this.addr,!1,b.elements||b)}function v(a,b){void 0===b.elements?a.uniformMatrix3fv(this.addr,!1,b):(Fd.set(b.elements),a.uniformMatrix3fv(this.addr,!1,Fd))}function w(a,b){void 0===b.elements?a.uniformMatrix4fv(this.addr,!1,b):(Ed.set(b.elements),a.uniformMatrix4fv(this.addr,!1,Ed))}function x(a,b,c){var d=c.allocTextureUnit();a.uniform1i(this.addr,d),c.setTexture2D(b||Ad,d)}function y(a,b,c){var d=c.allocTextureUnit();a.uniform1i(this.addr,d),c.setTextureCube(b||Bd,d)}function z(a,b){a.uniform2iv(this.addr,b)}function A(a,b){a.uniform3iv(this.addr,b)}function B(a,b){a.uniform4iv(this.addr,b)}function C(a){switch(a){case 5126:return p;case 35664:return r;case 35665:return s;case 35666:return t;case 35674:return u;case 35675:return v;case 35676:return w;case 35678:case 36198:return x;case 35680:return y;case 5124:case 35670:return q;case 35667:case 35671:return z;case 35668:case 35672:return A;case 35669:case 35673:return B}}function D(a,b){a.uniform1fv(this.addr,b)}function E(a,b){a.uniform1iv(this.addr,b)}function F(a,b){a.uniform2fv(this.addr,n(b,this.size,2))}function G(a,b){a.uniform3fv(this.addr,n(b,this.size,3))}function H(a,b){a.uniform4fv(this.addr,n(b,this.size,4))}function I(a,b){a.uniformMatrix2fv(this.addr,!1,n(b,this.size,4))}function J(a,b){a.uniformMatrix3fv(this.addr,!1,n(b,this.size,9))}function K(a,b){a.uniformMatrix4fv(this.addr,!1,n(b,this.size,16))}function L(a,b,c){var d=b.length,e=o(c,d);a.uniform1iv(this.addr,e);for(var f=0;f!==d;++f)c.setTexture2D(b[f]||Ad,e[f])}function M(a,b,c){var d=b.length,e=o(c,d);a.uniform1iv(this.addr,e);for(var f=0;f!==d;++f)c.setTextureCube(b[f]||Bd,e[f])}function N(a){switch(a){case 5126:return D;case 35664:return F;case 35665:return G;case 35666:return H;case 35674:return I;case 35675:return J;case 35676:return K;case 35678:return L;case 35680:return M;case 5124:case 35670:return E;case 35667:case 35671:return z;case 35668:case 35672:return A;case 35669:case 35673:return B}}function O(a,b,c){this.id=a,this.addr=c,this.setValue=C(b.type)}function P(a,b,c){this.id=a,this.addr=c,this.size=b.size,this.setValue=N(b.type)}function Q(a){this.id=a,m.call(this)}function R(a,b){a.seq.push(b),a.map[b.id]=b}function S(a,b,c){var d=a.name,e=d.length;for(Gd.lastIndex=0;;){var f=Gd.exec(d),g=Gd.lastIndex,h=f[1],i="]"===f[2],j=f[3];if(i&&(h|=0),void 0===j||"["===j&&g+2===e){R(c,void 0===j?new O(h,a,b):new P(h,a,b));break}var k=c.map,l=k[h];void 0===l&&(l=new Q(h),R(c,l)),c=l}}function T(a,b,c){m.call(this),this.renderer=c;for(var d=a.getProgramParameter(b,a.ACTIVE_UNIFORMS),e=0;e<d;++e){var f=a.getActiveUniform(b,e),g=f.name;S(f,a.getUniformLocation(b,g),this)}}function U(a,b,c){return void 0===b&&void 0===c?this.set(a):this.setRGB(a,b,c)}function V(a,b){this.min=void 0!==a?a:new c(1/0,1/0),this.max=void 0!==b?b:new c(-1/0,-1/0)}function W(a,b,d,e,g){function h(){var a=new Float32Array([-1,-1,0,0,1,-1,1,0,1,1,1,1,-1,1,0,1]),c=new Uint16Array([0,1,2,0,2,3]);j=b.createBuffer(),k=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,j),b.bufferData(b.ARRAY_BUFFER,a,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,k),b.bufferData(b.ELEMENT_ARRAY_BUFFER,c,b.STATIC_DRAW),p=b.createTexture(),q=b.createTexture(),d.bindTexture(b.TEXTURE_2D,p),b.texImage2D(b.TEXTURE_2D,0,b.RGB,16,16,0,b.RGB,b.UNSIGNED_BYTE,null),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST),d.bindTexture(b.TEXTURE_2D,q),b.texImage2D(b.TEXTURE_2D,0,b.RGBA,16,16,0,b.RGBA,b.UNSIGNED_BYTE,null),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,b.CLAMP_TO_EDGE),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,b.CLAMP_TO_EDGE),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,b.NEAREST),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,b.NEAREST),l={vertexShader:["uniform lowp int renderType;","uniform vec3 screenPosition;","uniform vec2 scale;","uniform float rotation;","uniform sampler2D occlusionMap;","attribute vec2 position;","attribute vec2 uv;","varying vec2 vUV;","varying float vVisibility;","void main() {","\tvUV = uv;","\tvec2 pos = position;","\tif ( renderType == 2 ) {","\t\tvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );","\t\tvisibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );","\t\tvVisibility =        visibility.r / 9.0;","\t\tvVisibility *= 1.0 - visibility.g / 9.0;","\t\tvVisibility *=       visibility.b / 9.0;","\t\tvVisibility *= 1.0 - visibility.a / 9.0;","\t\tpos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;","\t\tpos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;","\t}","\tgl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );","}"].join("\n"),fragmentShader:["uniform lowp int renderType;","uniform sampler2D map;","uniform float opacity;","uniform vec3 color;","varying vec2 vUV;","varying float vVisibility;","void main() {","\tif ( renderType == 0 ) {","\t\tgl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );","\t} else if ( renderType == 1 ) {","\t\tgl_FragColor = texture2D( map, vUV );","\t} else {","\t\tvec4 texture = texture2D( map, vUV );","\t\ttexture.a *= opacity * vVisibility;","\t\tgl_FragColor = texture;","\t\tgl_FragColor.rgb *= color;","\t}","}"].join("\n")},m=i(l),n={vertex:b.getAttribLocation(m,"position"),uv:b.getAttribLocation(m,"uv")},o={renderType:b.getUniformLocation(m,"renderType"),map:b.getUniformLocation(m,"map"),occlusionMap:b.getUniformLocation(m,"occlusionMap"),opacity:b.getUniformLocation(m,"opacity"),color:b.getUniformLocation(m,"color"),scale:b.getUniformLocation(m,"scale"),rotation:b.getUniformLocation(m,"rotation"),screenPosition:b.getUniformLocation(m,"screenPosition")}}function i(a){var c=b.createProgram(),d=b.createShader(b.FRAGMENT_SHADER),e=b.createShader(b.VERTEX_SHADER),f="precision "+g.precision+" float;\n";return b.shaderSource(d,f+a.fragmentShader),b.shaderSource(e,f+a.vertexShader),b.compileShader(d),b.compileShader(e),b.attachShader(c,d),b.attachShader(c,e),b.linkProgram(c),c}var j,k,l,m,n,o,p,q;this.render=function(a,g,i,l){if(0!==a.length){var r=new f,s=l.w/l.z,t=.5*l.z,u=.5*l.w,v=16/l.w,w=new c(v*s,v),x=new f(1,1,0),y=new c(1,1),z=new V;z.min.set(l.x,l.y),z.max.set(l.x+(l.z-16),l.y+(l.w-16)),void 0===m&&h(),d.useProgram(m),d.initAttributes(),d.enableAttribute(n.vertex),d.enableAttribute(n.uv),d.disableUnusedAttributes(),b.uniform1i(o.occlusionMap,0),b.uniform1i(o.map,1),b.bindBuffer(b.ARRAY_BUFFER,j),b.vertexAttribPointer(n.vertex,2,b.FLOAT,!1,16,0),b.vertexAttribPointer(n.uv,2,b.FLOAT,!1,16,8),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,k),d.disable(b.CULL_FACE),d.buffers.depth.setMask(!1);for(var A=0,B=a.length;A<B;A++){v=16/l.w,w.set(v*s,v);var C=a[A];if(r.set(C.matrixWorld.elements[12],C.matrixWorld.elements[13],C.matrixWorld.elements[14]),r.applyMatrix4(i.matrixWorldInverse),r.applyMatrix4(i.projectionMatrix),x.copy(r),y.x=l.x+x.x*t+t-8,y.y=l.y+x.y*u+u-8,!0===z.containsPoint(y)){d.activeTexture(b.TEXTURE0),d.bindTexture(b.TEXTURE_2D,null),d.activeTexture(b.TEXTURE1),d.bindTexture(b.TEXTURE_2D,p),b.copyTexImage2D(b.TEXTURE_2D,0,b.RGB,y.x,y.y,16,16,0),b.uniform1i(o.renderType,0),b.uniform2f(o.scale,w.x,w.y),b.uniform3f(o.screenPosition,x.x,x.y,x.z),d.disable(b.BLEND),d.enable(b.DEPTH_TEST),b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0),d.activeTexture(b.TEXTURE0),d.bindTexture(b.TEXTURE_2D,q),b.copyTexImage2D(b.TEXTURE_2D,0,b.RGBA,y.x,y.y,16,16,0),b.uniform1i(o.renderType,1),d.disable(b.DEPTH_TEST),d.activeTexture(b.TEXTURE1),d.bindTexture(b.TEXTURE_2D,p),b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0),C.positionScreen.copy(x),C.customUpdateCallback?C.customUpdateCallback(C):C.updateLensFlares(),b.uniform1i(o.renderType,2),d.enable(b.BLEND);for(var D=0,E=C.lensFlares.length;D<E;D++){var F=C.lensFlares[D];F.opacity>.001&&F.scale>.001&&(x.x=F.x,x.y=F.y,x.z=F.z,v=F.size*F.scale/l.w,w.x=v*s,w.y=v,b.uniform3f(o.screenPosition,x.x,x.y,x.z),b.uniform2f(o.scale,w.x,w.y),b.uniform1f(o.rotation,F.rotation),b.uniform1f(o.opacity,F.opacity),b.uniform3f(o.color,F.color.r,F.color.g,F.color.b),d.setBlending(F.blending,F.blendEquation,F.blendSrc,F.blendDst),e.setTexture2D(F.texture,1),b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0))}}}d.enable(b.CULL_FACE),d.enable(b.DEPTH_TEST),d.buffers.depth.setMask(!0),d.reset()}}}function X(a,b,c,d,e,f,g,i,j){h.call(this,a,b,c,d,e,f,g,i,j),this.needsUpdate=!0}function Y(a,b,c,d,g){function h(){var a=new Float32Array([-.5,-.5,0,0,.5,-.5,1,0,.5,.5,1,1,-.5,.5,0,1]),c=new Uint16Array([0,1,2,0,2,3]);k=b.createBuffer(),l=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,k),b.bufferData(b.ARRAY_BUFFER,a,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,l),b.bufferData(b.ELEMENT_ARRAY_BUFFER,c,b.STATIC_DRAW),m=i(),n={position:b.getAttribLocation(m,"position"),uv:b.getAttribLocation(m,"uv")},o={uvOffset:b.getUniformLocation(m,"uvOffset"),uvScale:b.getUniformLocation(m,"uvScale"),rotation:b.getUniformLocation(m,"rotation"),scale:b.getUniformLocation(m,"scale"),color:b.getUniformLocation(m,"color"),map:b.getUniformLocation(m,"map"),opacity:b.getUniformLocation(m,"opacity"),modelViewMatrix:b.getUniformLocation(m,"modelViewMatrix"),projectionMatrix:b.getUniformLocation(m,"projectionMatrix"),fogType:b.getUniformLocation(m,"fogType"),fogDensity:b.getUniformLocation(m,"fogDensity"),fogNear:b.getUniformLocation(m,"fogNear"),fogFar:b.getUniformLocation(m,"fogFar"),fogColor:b.getUniformLocation(m,"fogColor"),fogDepth:b.getUniformLocation(m,"fogDepth"),alphaTest:b.getUniformLocation(m,"alphaTest")};var d=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");d.width=8,d.height=8;var e=d.getContext("2d");e.fillStyle="white",e.fillRect(0,0,8,8),p=new X(d)}function i(){var a=b.createProgram(),c=b.createShader(b.VERTEX_SHADER),d=b.createShader(b.FRAGMENT_SHADER);return b.shaderSource(c,["precision "+g.precision+" float;","#define SHADER_NAME SpriteMaterial","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform float rotation;","uniform vec2 scale;","uniform vec2 uvOffset;","uniform vec2 uvScale;","attribute vec2 position;","attribute vec2 uv;","varying vec2 vUV;","varying float fogDepth;","void main() {","\tvUV = uvOffset + uv * uvScale;","\tvec2 alignedPosition = position * scale;","\tvec2 rotatedPosition;","\trotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;","\trotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;","\tvec4 mvPosition;","\tmvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );","\tmvPosition.xy += rotatedPosition;","\tgl_Position = projectionMatrix * mvPosition;","\tfogDepth = - mvPosition.z;","}"].join("\n")),b.shaderSource(d,["precision "+g.precision+" float;","#define SHADER_NAME SpriteMaterial","uniform vec3 color;","uniform sampler2D map;","uniform float opacity;","uniform int fogType;","uniform vec3 fogColor;","uniform float fogDensity;","uniform float fogNear;","uniform float fogFar;","uniform float alphaTest;","varying vec2 vUV;","varying float fogDepth;","void main() {","\tvec4 texture = texture2D( map, vUV );","\tgl_FragColor = vec4( color * texture.xyz, texture.a * opacity );","\tif ( gl_FragColor.a < alphaTest ) discard;","\tif ( fogType > 0 ) {","\t\tfloat fogFactor = 0.0;","\t\tif ( fogType == 1 ) {","\t\t\tfogFactor = smoothstep( fogNear, fogFar, fogDepth );","\t\t} else {","\t\t\tconst float LOG2 = 1.442695;","\t\t\tfogFactor = exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 );","\t\t\tfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );","\t\t}","\t\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );","\t}","}"].join("\n")),b.compileShader(c),b.compileShader(d),b.attachShader(a,c),b.attachShader(a,d),b.linkProgram(a),a}function j(a,b){return a.renderOrder!==b.renderOrder?a.renderOrder-b.renderOrder:a.z!==b.z?b.z-a.z:b.id-a.id}var k,l,m,n,o,p,q=new f,r=new e,s=new f;this.render=function(e,f,g){if(0!==e.length){void 0===m&&h(),c.useProgram(m),c.initAttributes(),c.enableAttribute(n.position),c.enableAttribute(n.uv),c.disableUnusedAttributes(),c.disable(b.CULL_FACE),c.enable(b.BLEND),b.bindBuffer(b.ARRAY_BUFFER,k),b.vertexAttribPointer(n.position,2,b.FLOAT,!1,16,0),b.vertexAttribPointer(n.uv,2,b.FLOAT,!1,16,8),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,l),b.uniformMatrix4fv(o.projectionMatrix,!1,g.projectionMatrix.elements),c.activeTexture(b.TEXTURE0),b.uniform1i(o.map,0);var i=0,t=0,u=f.fog;u?(b.uniform3f(o.fogColor,u.color.r,u.color.g,u.color.b),u.isFog?(b.uniform1f(o.fogNear,u.near),b.uniform1f(o.fogFar,u.far),b.uniform1i(o.fogType,1),i=1,t=1):u.isFogExp2&&(b.uniform1f(o.fogDensity,u.density),b.uniform1i(o.fogType,2),i=2,t=2)):(b.uniform1i(o.fogType,0),i=0,t=0);for(var v=0,w=e.length;v<w;v++){var x=e[v];x.modelViewMatrix.multiplyMatrices(g.matrixWorldInverse,x.matrixWorld),x.z=-x.modelViewMatrix.elements[14]}e.sort(j);for(var y=[],v=0,w=e.length;v<w;v++){var x=e[v],z=x.material;if(!1!==z.visible){x.onBeforeRender(a,f,g,void 0,z,void 0),b.uniform1f(o.alphaTest,z.alphaTest),b.uniformMatrix4fv(o.modelViewMatrix,!1,x.modelViewMatrix.elements),x.matrixWorld.decompose(q,r,s),y[0]=s.x,y[1]=s.y;var A=0;f.fog&&z.fog&&(A=t),i!==A&&(b.uniform1i(o.fogType,A),i=A),null!==z.map?(b.uniform2f(o.uvOffset,z.map.offset.x,z.map.offset.y),b.uniform2f(o.uvScale,z.map.repeat.x,z.map.repeat.y)):(b.uniform2f(o.uvOffset,0,0),b.uniform2f(o.uvScale,1,1)),b.uniform1f(o.opacity,z.opacity),b.uniform3f(o.color,z.color.r,z.color.g,z.color.b),b.uniform1f(o.rotation,z.rotation),b.uniform2fv(o.scale,y),c.setBlending(z.blending,z.blendEquation,z.blendSrc,z.blendDst,z.blendEquationAlpha,z.blendSrcAlpha,z.blendDstAlpha,z.premultipliedAlpha),c.buffers.depth.setTest(z.depthTest),c.buffers.depth.setMask(z.depthWrite),c.buffers.color.setMask(z.colorWrite),d.setTexture2D(z.map||p,0),b.drawElements(b.TRIANGLES,6,b.UNSIGNED_SHORT,0),x.onAfterRender(a,f,g,void 0,z,void 0)}}c.enable(b.CULL_FACE),c.reset()}}}function Z(){Object.defineProperty(this,"id",{value:Of++}),this.uuid=yd.generateUUID(),this.name="",this.type="Material",this.fog=!0,this.lights=!0,this.blending=Mb,this.side=Gb,this.flatShading=!1,this.vertexColors=Kb,this.opacity=1,this.transparent=!1,this.blendSrc=$b,this.blendDst=_b,this.blendEquation=Rb,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=ic,this.depthTest=!0,this.depthWrite=!0,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaTest=0,this.premultipliedAlpha=!1,this.overdraw=0,this.visible=!0,this.userData={},this.needsUpdate=!0}function $(a){Z.call(this),this.type="MeshDepthMaterial",this.depthPacking=wd,this.skinning=!1,this.morphTargets=!1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.setValues(a)}function _(a){Z.call(this),this.type="MeshDistanceMaterial",this.referencePosition=new f,this.nearDistance=1,this.farDistance=1e3,this.skinning=!1,this.morphTargets=!1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.fog=!1,this.lights=!1,this.setValues(a)}function aa(a,b){this.min=void 0!==a?a:new f(1/0,1/0,1/0),this.max=void 0!==b?b:new f(-1/0,-1/0,-1/0)}function ba(a,b){this.center=void 0!==a?a:new f,this.radius=void 0!==b?b:0}function ca(a,b){this.normal=void 0!==a?a:new f(1,0,0),this.constant=void 0!==b?b:0}function da(a,b,c,d,e,f){this.planes=[void 0!==a?a:new ca,void 0!==b?b:new ca,void 0!==c?c:new ca,void 0!==d?d:new ca,void 0!==e?e:new ca,void 0!==f?f:new ca]}function ea(a,b,e){function g(b,c,d,e,f,g){var h=b.geometry,i=null,j=t,k=b.customDepthMaterial;if(d&&(j=u,k=b.customDistanceMaterial),k)i=k;else{var l=!1;c.morphTargets&&(h&&h.isBufferGeometry?l=h.morphAttributes&&h.morphAttributes.position&&h.morphAttributes.position.length>0:h&&h.isGeometry&&(l=h.morphTargets&&h.morphTargets.length>0)),b.isSkinnedMesh&&!1===c.skinning&&console.warn("THREE.WebGLShadowMap: THREE.SkinnedMesh with material.skinning set to false:",b);var m=b.isSkinnedMesh&&c.skinning,n=0;l&&(n|=q),m&&(n|=r),i=j[n]}if(a.localClippingEnabled&&!0===c.clipShadows&&0!==c.clippingPlanes.length){var o=i.uuid,p=c.uuid,s=v[o];void 0===s&&(s={},v[o]=s);var w=s[p];void 0===w&&(w=i.clone(),s[p]=w),i=w}i.visible=c.visible,i.wireframe=c.wireframe;var x=c.side;return E.renderSingleSided&&x==Ib&&(x=Gb),E.renderReverseSided&&(x===Gb?x=Hb:x===Hb&&(x=Gb)),i.side=x,i.clipShadows=c.clipShadows,i.clippingPlanes=c.clippingPlanes,i.clipIntersection=c.clipIntersection,i.wireframeLinewidth=c.wireframeLinewidth,i.linewidth=c.linewidth,d&&i.isMeshDistanceMaterial&&(i.referencePosition.copy(e),i.nearDistance=f,i.farDistance=g),i}function h(c,d,e,f){if(!1!==c.visible){if(c.layers.test(d.layers)&&(c.isMesh||c.isLine||c.isPoints)&&c.castShadow&&(!c.frustumCulled||k.intersectsObject(c))){c.modelViewMatrix.multiplyMatrices(e.matrixWorldInverse,c.matrixWorld);var i=b.update(c),j=c.material;if(Array.isArray(j))for(var l=i.groups,m=0,n=l.length;m<n;m++){var o=l[m],q=j[o.materialIndex];if(q&&q.visible){var r=g(c,q,f,p,e.near,e.far);a.renderBufferDirect(e,null,i,r,c,o)}}else if(j.visible){var r=g(c,j,f,p,e.near,e.far);a.renderBufferDirect(e,null,i,r,c,null)}}for(var s=c.children,t=0,u=s.length;t<u;t++)h(s[t],d,e,f)}}for(var k=new da,l=new d,m=new c,n=new c(e,e),o=new f,p=new f,q=1,r=2,s=1+(q|r),t=new Array(s),u=new Array(s),v={},w=[new f(1,0,0),new f(-1,0,0),new f(0,0,1),new f(0,0,-1),new f(0,1,0),new f(0,-1,0)],x=[new f(0,1,0),new f(0,1,0),new f(0,1,0),new f(0,1,0),new f(0,0,1),new f(0,0,-1)],y=[new i,new i,new i,new i,new i,new i],z=0;z!==s;++z){var A=0!=(z&q),B=0!=(z&r),C=new $({depthPacking:xd,morphTargets:A,skinning:B});t[z]=C;var D=new _({morphTargets:A,skinning:B});u[z]=D}var E=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Eb,this.renderReverseSided=!0,this.renderSingleSided=!0,this.render=function(b,c,d){if(!1!==E.enabled&&(!1!==E.autoUpdate||!1!==E.needsUpdate)&&0!==b.length){var e=a.context,f=a.state;f.disable(e.BLEND),f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);for(var g,i=0,q=b.length;i<q;i++){var r=b[i],s=r.shadow,t=r&&r.isPointLight;if(void 0!==s){var u=s.camera;if(m.copy(s.mapSize),m.min(n),t){var v=m.x,z=m.y;y[0].set(2*v,z,v,z),y[1].set(0,z,v,z),y[2].set(3*v,z,v,z),y[3].set(v,z,v,z),y[4].set(3*v,0,v,z),y[5].set(v,0,v,z),m.x*=4,m.y*=2}if(null===s.map){var A={minFilter:Gc,magFilter:Gc,format:$c};s.map=new j(m.x,m.y,A),s.map.texture.name=r.name+".shadowMap",u.updateProjectionMatrix()}s.isSpotLightShadow&&s.update(r);var B=s.map,C=s.matrix;p.setFromMatrixPosition(r.matrixWorld),u.position.copy(p),t?(g=6,C.makeTranslation(-p.x,-p.y,-p.z)):(g=1,o.setFromMatrixPosition(r.target.matrixWorld),u.lookAt(o),u.updateMatrixWorld(),C.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),C.multiply(u.projectionMatrix),C.multiply(u.matrixWorldInverse)),a.setRenderTarget(B),a.clear();for(var D=0;D<g;D++){if(t){o.copy(u.position),o.add(w[D]),u.up.copy(x[D]),u.lookAt(o),u.updateMatrixWorld();var F=y[D];f.viewport(F)}l.multiplyMatrices(u.projectionMatrix,u.matrixWorldInverse),k.setFromMatrix(l),h(c,d,u,t)}}else console.warn("THREE.WebGLShadowMap:",r,"has no shadow.")}E.needsUpdate=!1}}}function fa(a){function b(b,c){var d=b.array,e=b.dynamic?a.DYNAMIC_DRAW:a.STATIC_DRAW,f=a.createBuffer();a.bindBuffer(c,f),a.bufferData(c,d,e),b.onUploadCallback();var g=a.FLOAT;return d instanceof Float32Array?g=a.FLOAT:d instanceof Float64Array?console.warn("THREE.WebGLAttributes: Unsupported data buffer format: Float64Array."):d instanceof Uint16Array?g=a.UNSIGNED_SHORT:d instanceof Int16Array?g=a.SHORT:d instanceof Uint32Array?g=a.UNSIGNED_INT:d instanceof Int32Array?g=a.INT:d instanceof Int8Array?g=a.BYTE:d instanceof Uint8Array&&(g=a.UNSIGNED_BYTE),{buffer:f,type:g,bytesPerElement:d.BYTES_PER_ELEMENT,version:b.version}}function c(b,c,d){var e=c.array,f=c.updateRange;a.bindBuffer(d,b),!1===c.dynamic?a.bufferData(d,e,a.STATIC_DRAW):-1===f.count?a.bufferSubData(d,0,e):0===f.count?console.error("THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually."):(a.bufferSubData(d,f.offset*e.BYTES_PER_ELEMENT,e.subarray(f.offset,f.offset+f.count)),f.count=-1)}function d(a){return a.isInterleavedBufferAttribute&&(a=a.data),g[a.uuid]}function e(b){b.isInterleavedBufferAttribute&&(b=b.data);var c=g[b.uuid];c&&(a.deleteBuffer(c.buffer),delete g[b.uuid])}function f(a,d){a.isInterleavedBufferAttribute&&(a=a.data);var e=g[a.uuid];void 0===e?g[a.uuid]=b(a,d):e.version<a.version&&(c(e.buffer,a,d),e.version=a.version)}var g={};return{get:d,remove:e,update:f}}function ga(a,b,c,d){this._x=a||0,this._y=b||0,this._z=c||0,this._order=d||ga.DefaultOrder}function ha(){this.mask=1}function ia(){function a(){i.setFromEuler(h,!1)}function b(){h.setFromQuaternion(i,void 0,!1)}Object.defineProperty(this,"id",{value:Pf++}),this.uuid=yd.generateUUID(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ia.DefaultUp.clone();var c=new f,h=new ga,i=new e,j=new f(1,1,1);h.onChange(a),i.onChange(b),Object.defineProperties(this,{position:{enumerable:!0,value:c},rotation:{enumerable:!0,value:h},quaternion:{enumerable:!0,value:i},scale:{enumerable:!0,value:j},modelViewMatrix:{value:new d},normalMatrix:{value:new g}}),this.matrix=new d,this.matrixWorld=new d,this.matrixAutoUpdate=ia.DefaultMatrixAutoUpdate,this.matrixWorldNeedsUpdate=!1,this.layers=new ha,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.userData={}}function ja(){ia.call(this),this.type="Camera",this.matrixWorldInverse=new d,this.projectionMatrix=new d}function ka(a,b,c,d,e,f){ja.call(this),this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=a,this.right=b,this.top=c,this.bottom=d,this.near=void 0!==e?e:.1,this.far=void 0!==f?f:2e3,this.updateProjectionMatrix()}function la(a,b,c,d,e,g){this.a=a,this.b=b,this.c=c,this.normal=d&&d.isVector3?d:new f,this.vertexNormals=Array.isArray(d)?d:[],this.color=e&&e.isColor?e:new U,this.vertexColors=Array.isArray(e)?e:[],this.materialIndex=void 0!==g?g:0}function ma(){Object.defineProperty(this,"id",{value:Qf+=2}),this.uuid=yd.generateUUID(),this.name="",this.type="Geometry",this.vertices=[],this.colors=[],this.faces=[],this.faceVertexUvs=[[]],this.morphTargets=[],this.morphNormals=[],this.skinWeights=[],this.skinIndices=[],this.lineDistances=[],this.boundingBox=null,this.boundingSphere=null,this.elementsNeedUpdate=!1,this.verticesNeedUpdate=!1,this.uvsNeedUpdate=!1,this.normalsNeedUpdate=!1,this.colorsNeedUpdate=!1,this.lineDistancesNeedUpdate=!1,this.groupsNeedUpdate=!1}function na(a,b,c){if(Array.isArray(a))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.uuid=yd.generateUUID(),this.name="",this.array=a,this.itemSize=b,this.count=void 0!==a?a.length/b:0,this.normalized=!0===c,this.dynamic=!1,this.updateRange={offset:0,count:-1},this.onUploadCallback=function(){},this.version=0}function oa(a,b,c){na.call(this,new Int8Array(a),b,c)}function pa(a,b,c){na.call(this,new Uint8Array(a),b,c)}function qa(a,b,c){na.call(this,new Uint8ClampedArray(a),b,c)}function ra(a,b,c){na.call(this,new Int16Array(a),b,c)}function sa(a,b,c){na.call(this,new Uint16Array(a),b,c)}function ta(a,b,c){na.call(this,new Int32Array(a),b,c)}function ua(a,b,c){na.call(this,new Uint32Array(a),b,c)}function va(a,b,c){na.call(this,new Float32Array(a),b,c)}function wa(a,b,c){na.call(this,new Float64Array(a),b,c)}function xa(){this.indices=[],this.vertices=[],this.normals=[],this.colors=[],this.uvs=[],this.uvs2=[],this.groups=[],this.morphTargets={},this.skinWeights=[],this.skinIndices=[],this.boundingBox=null,this.boundingSphere=null,this.verticesNeedUpdate=!1,this.normalsNeedUpdate=!1,this.colorsNeedUpdate=!1,this.uvsNeedUpdate=!1,this.groupsNeedUpdate=!1}function ya(a){if(0===a.length)return-1/0;for(var b=a[0],c=1,d=a.length;c<d;++c)a[c]>b&&(b=a[c]);return b}function za(){Object.defineProperty(this,"id",{value:Rf+=2}),this.uuid=yd.generateUUID(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0}}function Aa(a,b,c,d,e,f){ma.call(this),this.type="BoxGeometry",this.parameters={width:a,height:b,depth:c,widthSegments:d,heightSegments:e,depthSegments:f},this.fromBufferGeometry(new Ba(a,b,c,d,e,f)),this.mergeVertices()}function Ba(a,b,c,d,e,g){function h(a,b,c,d,e,g,h,p,q,r,s){var t,u,v=g/q,w=h/r,x=g/2,y=h/2,z=p/2,A=q+1,B=r+1,C=0,D=0,E=new f;for(u=0;u<B;u++){var F=u*w-y;for(t=0;t<A;t++){var G=t*v-x;E[a]=G*d,E[b]=F*e,E[c]=z,k.push(E.x,E.y,E.z),E[a]=0,E[b]=0,E[c]=p>0?1:-1,l.push(E.x,E.y,E.z),m.push(t/q),m.push(1-u/r),C+=1}}for(u=0;u<r;u++)for(t=0;t<q;t++){var H=n+t+A*u,I=n+t+A*(u+1),J=n+(t+1)+A*(u+1),K=n+(t+1)+A*u;j.push(H,I,K),j.push(I,J,K),D+=6}i.addGroup(o,D,s),o+=D,n+=C}za.call(this),this.type="BoxBufferGeometry",this.parameters={width:a,height:b,depth:c,widthSegments:d,heightSegments:e,depthSegments:g};var i=this;a=a||1,b=b||1,c=c||1,d=Math.floor(d)||1,e=Math.floor(e)||1,g=Math.floor(g)||1;var j=[],k=[],l=[],m=[],n=0,o=0;h("z","y","x",-1,-1,c,b,a,g,e,0),h("z","y","x",1,-1,c,b,-a,g,e,1),h("x","z","y",1,1,a,c,b,d,g,2),h("x","z","y",1,-1,a,c,-b,d,g,3),h("x","y","z",1,-1,a,b,c,d,e,4),h("x","y","z",-1,-1,a,b,-c,d,e,5),this.setIndex(j),this.addAttribute("position",new va(k,3)),this.addAttribute("normal",new va(l,3)),this.addAttribute("uv",new va(m,2))}function Ca(a,b,c,d){ma.call(this),this.type="PlaneGeometry",this.parameters={width:a,height:b,widthSegments:c,heightSegments:d},this.fromBufferGeometry(new Da(a,b,c,d)),this.mergeVertices()}function Da(a,b,c,d){za.call(this),this.type="PlaneBufferGeometry",this.parameters={width:a,height:b,widthSegments:c,heightSegments:d},a=a||1,b=b||1;var e,f,g=a/2,h=b/2,i=Math.floor(c)||1,j=Math.floor(d)||1,k=i+1,l=j+1,m=a/i,n=b/j,o=[],p=[],q=[],r=[];for(f=0;f<l;f++){var s=f*n-h;for(e=0;e<k;e++){var t=e*m-g;p.push(t,-s,0),q.push(0,0,1),r.push(e/i),r.push(1-f/j)}}for(f=0;f<j;f++)for(e=0;e<i;e++){var u=e+k*f,v=e+k*(f+1),w=e+1+k*(f+1),x=e+1+k*f;o.push(u,v,x),o.push(v,w,x)}this.setIndex(o),this.addAttribute("position",new va(p,3)),this.addAttribute("normal",new va(q,3)),this.addAttribute("uv",new va(r,2))}function Ea(a){Z.call(this),this.type="MeshBasicMaterial",this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=nc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.skinning=!1,this.morphTargets=!1,this.lights=!1,this.setValues(a)}function Fa(a){Z.call(this),this.type="ShaderMaterial",this.defines={},this.uniforms={},this.vertexShader="void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",this.fragmentShader="void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}",this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.skinning=!1,this.morphTargets=!1,this.morphNormals=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,void 0!==a&&(void 0!==a.attributes&&console.error("THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."),this.setValues(a))}function Ga(a,b){this.origin=void 0!==a?a:new f,this.direction=void 0!==b?b:new f}function Ha(a,b){this.start=void 0!==a?a:new f,this.end=void 0!==b?b:new f}function Ia(a,b,c){this.a=void 0!==a?a:new f,this.b=void 0!==b?b:new f,this.c=void 0!==c?c:new f}function Ja(a,b){ia.call(this),this.type="Mesh",this.geometry=void 0!==a?a:new za,this.material=void 0!==b?b:new Ea({color:16777215*Math.random()}),this.drawMode=md,this.updateMorphTargets()}function Ka(a,b,c,d){function e(b,d,e,l){var m=d.background;null===m?f(j,k):m&&m.isColor&&(f(m,1),l=!0),(a.autoClear||l)&&a.clear(a.autoClearColor,a.autoClearDepth,a.autoClearStencil),m&&m.isCubeTexture?(void 0===i&&(i=new Ja(new Ba(1,1,1),new Fa({uniforms:Nf.cube.uniforms,vertexShader:Nf.cube.vertexShader,fragmentShader:Nf.cube.fragmentShader,side:Hb,depthTest:!0,depthWrite:!1,fog:!1})),i.geometry.removeAttribute("normal"),i.geometry.removeAttribute("uv"),i.onBeforeRender=function(a,b,c){this.matrixWorld.copyPosition(c.matrixWorld)},c.update(i.geometry)),i.material.uniforms.tCube.value=m,b.push(i,i.geometry,i.material,0,null)):m&&m.isTexture&&(void 0===g&&(g=new ka(-1,1,1,-1,0,1),h=new Ja(new Da(2,2),new Ea({depthTest:!1,depthWrite:!1,fog:!1})),c.update(h.geometry)),h.material.map=m,a.renderBufferDirect(g,null,h.geometry,h.material,h,null))}function f(a,c){b.buffers.color.setClear(a.r,a.g,a.b,c,d)}var g,h,i,j=new U(0),k=0;return{getClearColor:function(){return j},setClearColor:function(a,b){j.set(a),k=void 0!==b?b:1,f(j,k)},getClearAlpha:function(){return k},setClearAlpha:function(a){k=a,f(j,k)},render:e}}function La(a,b){return a.renderOrder!==b.renderOrder?a.renderOrder-b.renderOrder:a.program&&b.program&&a.program!==b.program?a.program.id-b.program.id:a.material.id!==b.material.id?a.material.id-b.material.id:a.z!==b.z?a.z-b.z:a.id-b.id}function Ma(a,b){return a.renderOrder!==b.renderOrder?a.renderOrder-b.renderOrder:a.z!==b.z?b.z-a.z:a.id-b.id}function Na(){function a(){e=0,f.length=0,g.length=0}function b(a,b,c,h,i){var j=d[e];void 0===j?(j={id:a.id,object:a,geometry:b,material:c,program:c.program,renderOrder:a.renderOrder,z:h,group:i},d[e]=j):(j.id=a.id,j.object=a,j.geometry=b,j.material=c,j.program=c.program,j.renderOrder=a.renderOrder,j.z=h,j.group=i),(!0===c.transparent?g:f).push(j),e++}function c(){f.length>1&&f.sort(La),g.length>1&&g.sort(Ma)}var d=[],e=0,f=[],g=[];return{opaque:f,transparent:g,init:a,push:b,sort:c}}function Oa(){function a(a,b){var d=a.id+","+b.id,e=c[d];return void 0===e&&(e=new Na,c[d]=e),e}function b(){c={}}var c={};return{get:a,dispose:b}}function Pa(a,b){return Math.abs(b[1])-Math.abs(a[1])}function Qa(a){function b(b,e,f,g){var h=b.morphTargetInfluences,i=h.length,j=c[e.id];if(void 0===j){j=[];for(var k=0;k<i;k++)j[k]=[k,0];c[e.id]=j}for(var l=f.morphTargets&&e.morphAttributes.position,m=f.morphNormals&&e.morphAttributes.normal,k=0;k<i;k++){var n=j[k];0!==n[1]&&(l&&e.removeAttribute("morphTarget"+k),m&&e.removeAttribute("morphNormal"+k))}for(var k=0;k<i;k++){var n=j[k];n[0]=k,n[1]=h[k]}j.sort(Pa);for(var k=0;k<8;k++){var n=j[k];if(n){var o=n[0],p=n[1];if(p){l&&e.addAttribute("morphTarget"+k,l[o]),m&&e.addAttribute("morphNormal"+k,m[o]),d[k]=p;continue}}d[k]=0}g.getUniforms().setValue(a,"morphTargetInfluences",d)}var c={},d=new Float32Array(8);return{update:b}}function Ra(a,b,c){function d(a){h=a}function e(a){i=a.type,j=a.bytesPerElement}function f(b,d){a.drawElements(h,d,i,b*j),c.calls++,c.vertices+=d,h===a.TRIANGLES?c.faces+=d/3:h===a.POINTS&&(c.points+=d)}function g(d,e,f){var g=b.get("ANGLE_instanced_arrays");if(null===g)return void console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");g.drawElementsInstancedANGLE(h,f,i,e*j,d.maxInstancedCount),c.calls++,c.vertices+=f*d.maxInstancedCount,h===a.TRIANGLES?c.faces+=d.maxInstancedCount*f/3:h===a.POINTS&&(c.points+=d.maxInstancedCount*f)}var h,i,j;this.setMode=d,this.setIndex=e,this.render=f,this.renderInstances=g}function Sa(a,b,c){function d(a){g=a}function e(b,d){a.drawArrays(g,b,d),c.calls++,c.vertices+=d,g===a.TRIANGLES?c.faces+=d/3:g===a.POINTS&&(c.points+=d)}function f(d,e,f){var h=b.get("ANGLE_instanced_arrays");if(null===h)return void console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");var i=d.attributes.position;i.isInterleavedBufferAttribute?(f=i.data.count,h.drawArraysInstancedANGLE(g,0,f,d.maxInstancedCount)):h.drawArraysInstancedANGLE(g,e,f,d.maxInstancedCount),c.calls++,c.vertices+=f*d.maxInstancedCount,g===a.TRIANGLES?c.faces+=d.maxInstancedCount*f/3:g===a.POINTS&&(c.points+=d.maxInstancedCount*f)}var g;this.setMode=d,this.render=e,this.renderInstances=f}function Ta(a,b,c){function d(a){var e=a.target,f=h[e.id];null!==f.index&&b.remove(f.index);for(var g in f.attributes)b.remove(f.attributes[g]);e.removeEventListener("dispose",d),delete h[e.id];var j=i[e.id];j&&(b.remove(j),delete i[e.id]),j=i[f.id],j&&(b.remove(j),delete i[f.id]),c.geometries--}function e(a,b){var e=h[b.id];return e||(b.addEventListener("dispose",d),b.isBufferGeometry?e=b:b.isGeometry&&(void 0===b._bufferGeometry&&(b._bufferGeometry=(new za).setFromObject(a)),e=b._bufferGeometry),h[b.id]=e,c.geometries++,e)}function f(c){var d=c.index,e=c.attributes;null!==d&&b.update(d,a.ELEMENT_ARRAY_BUFFER);for(var f in e)b.update(e[f],a.ARRAY_BUFFER);var g=c.morphAttributes;for(var f in g)for(var h=g[f],i=0,j=h.length;i<j;i++)b.update(h[i],a.ARRAY_BUFFER)}function g(c){var d=i[c.id];if(d)return d;var e=[],f=c.index,g=c.attributes;if(null!==f)for(var h=f.array,j=0,k=h.length;j<k;j+=3){var l=h[j+0],m=h[j+1],n=h[j+2];e.push(l,m,m,n,n,l)}else for(var h=g.position.array,j=0,k=h.length/3-1;j<k;j+=3){var l=j+0,m=j+1,n=j+2;e.push(l,m,m,n,n,l)}return d=new(ya(e)>65535?ua:sa)(e,1),b.update(d,a.ELEMENT_ARRAY_BUFFER),i[c.id]=d,d}var h={},i={};return{get:e,update:f,getWireframeAttribute:g}}function Ua(){var a={};return{get:function(b){if(void 0!==a[b.id])return a[b.id];var d;switch(b.type){case"DirectionalLight":d={direction:new f,color:new U,shadow:!1,shadowBias:0,shadowRadius:1,shadowMapSize:new c};break;case"SpotLight":d={position:new f,direction:new f,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0,shadow:!1,shadowBias:0,shadowRadius:1,shadowMapSize:new c};break;case"PointLight":d={position:new f,color:new U,distance:0,decay:0,shadow:!1,shadowBias:0,shadowRadius:1,shadowMapSize:new c,shadowCameraNear:1,shadowCameraFar:1e3};break;case"HemisphereLight":d={direction:new f,skyColor:new U,groundColor:new U};break;case"RectAreaLight":d={color:new U,position:new f,halfWidth:new f,halfHeight:new f}}return a[b.id]=d,d}}}function Va(){function a(a,d,f){for(var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=f.matrixWorldInverse,r=0,s=a.length;r<s;r++){var t=a[r],u=t.color,v=t.intensity,w=t.distance,x=t.shadow&&t.shadow.map?t.shadow.map.texture:null;if(t.isAmbientLight)i+=u.r*v,j+=u.g*v,k+=u.b*v;else if(t.isDirectionalLight){var y=b.get(t);if(y.color.copy(t.color).multiplyScalar(t.intensity),y.direction.setFromMatrixPosition(t.matrixWorld),e.setFromMatrixPosition(t.target.matrixWorld),y.direction.sub(e),y.direction.transformDirection(q),y.shadow=t.castShadow,t.castShadow){var z=t.shadow;y.shadowBias=z.bias,y.shadowRadius=z.radius,y.shadowMapSize=z.mapSize}c.directionalShadowMap[l]=x,c.directionalShadowMatrix[l]=t.shadow.matrix,c.directional[l]=y,l++}else if(t.isSpotLight){var y=b.get(t);if(y.position.setFromMatrixPosition(t.matrixWorld),y.position.applyMatrix4(q),y.color.copy(u).multiplyScalar(v),y.distance=w,y.direction.setFromMatrixPosition(t.matrixWorld),e.setFromMatrixPosition(t.target.matrixWorld),y.direction.sub(e),y.direction.transformDirection(q),y.coneCos=Math.cos(t.angle),y.penumbraCos=Math.cos(t.angle*(1-t.penumbra)),y.decay=0===t.distance?0:t.decay,y.shadow=t.castShadow,t.castShadow){var z=t.shadow;y.shadowBias=z.bias,y.shadowRadius=z.radius,y.shadowMapSize=z.mapSize}c.spotShadowMap[n]=x,c.spotShadowMatrix[n]=t.shadow.matrix,c.spot[n]=y,n++}else if(t.isRectAreaLight){var y=b.get(t);y.color.copy(u).multiplyScalar(v/(t.width*t.height)),y.position.setFromMatrixPosition(t.matrixWorld),y.position.applyMatrix4(q),h.identity(),g.copy(t.matrixWorld),g.premultiply(q),h.extractRotation(g),y.halfWidth.set(.5*t.width,0,0),y.halfHeight.set(0,.5*t.height,0),y.halfWidth.applyMatrix4(h),y.halfHeight.applyMatrix4(h),c.rectArea[o]=y,o++}else if(t.isPointLight){var y=b.get(t);if(y.position.setFromMatrixPosition(t.matrixWorld),y.position.applyMatrix4(q),y.color.copy(t.color).multiplyScalar(t.intensity),y.distance=t.distance,y.decay=0===t.distance?0:t.decay,y.shadow=t.castShadow,t.castShadow){var z=t.shadow;y.shadowBias=z.bias,y.shadowRadius=z.radius,y.shadowMapSize=z.mapSize,y.shadowCameraNear=z.camera.near,y.shadowCameraFar=z.camera.far}c.pointShadowMap[m]=x,c.pointShadowMatrix[m]=t.shadow.matrix,c.point[m]=y,m++}else if(t.isHemisphereLight){var y=b.get(t);y.direction.setFromMatrixPosition(t.matrixWorld),y.direction.transformDirection(q),y.direction.normalize(),y.skyColor.copy(t.color).multiplyScalar(v),y.groundColor.copy(t.groundColor).multiplyScalar(v),c.hemi[p]=y,p++}}c.ambient[0]=i,c.ambient[1]=j,c.ambient[2]=k,c.directional.length=l,c.spot.length=n,c.rectArea.length=o,c.point.length=m,c.hemi.length=p,c.hash=l+","+m+","+n+","+o+","+p+","+d.length}var b=new Ua,c={hash:"",ambient:[0,0,0],directional:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotShadowMap:[],spotShadowMatrix:[],rectArea:[],point:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[]},e=new f,g=new d,h=new d;return{setup:a,state:c}}function Wa(a,b){function c(c){var d=b.frame,f=c.geometry,g=a.get(c,f);return e[g.id]!==d&&(f.isGeometry&&g.updateFromObject(c),a.update(g),e[g.id]=d),g}function d(){e={}}var e={};return{update:c,clear:d}}function Xa(a){for(var b=a.split("\n"),c=0;c<b.length;c++)b[c]=c+1+": "+b[c];return b.join("\n")}function Ya(a,b,c){var d=a.createShader(b);return a.shaderSource(d,c),a.compileShader(d),!1===a.getShaderParameter(d,a.COMPILE_STATUS)&&console.error("THREE.WebGLShader: Shader couldn't compile."),""!==a.getShaderInfoLog(d)&&console.warn("THREE.WebGLShader: gl.getShaderInfoLog()",b===a.VERTEX_SHADER?"vertex":"fragment",a.getShaderInfoLog(d),Xa(c)),d}function Za(a){switch(a){case pd:return["Linear","( value )"];case qd:return["sRGB","( value )"];case sd:return["RGBE","( value )"];case td:return["RGBM","( value, 7.0 )"];case ud:return["RGBM","( value, 16.0 )"];case vd:return["RGBD","( value, 256.0 )"];case rd:return["Gamma","( value, float( GAMMA_FACTOR ) )"];default:throw new Error("unsupported encoding: "+a)}}function $a(a,b){var c=Za(b);return"vec4 "+a+"( vec4 value ) { return "+c[0]+"ToLinear"+c[1]+"; }"}function _a(a,b){var c=Za(b);return"vec4 "+a+"( vec4 value ) { return LinearTo"+c[0]+c[1]+"; }"}function ab(a,b){var c;switch(b){case rc:c="Linear";break;case sc:c="Reinhard";break;case tc:c="Uncharted2";break;case uc:c="OptimizedCineon";break;default:throw new Error("unsupported toneMapping: "+b)}return"vec3 "+a+"( vec3 color ) { return "+c+"ToneMapping( color ); }"}function bb(a,b,c){return a=a||{},[a.derivatives||b.envMapCubeUV||b.bumpMap||b.normalMap||b.flatShading?"#extension GL_OES_standard_derivatives : enable":"",(a.fragDepth||b.logarithmicDepthBuffer)&&c.get("EXT_frag_depth")?"#extension GL_EXT_frag_depth : enable":"",a.drawBuffers&&c.get("WEBGL_draw_buffers")?"#extension GL_EXT_draw_buffers : require":"",(a.shaderTextureLOD||b.envMap)&&c.get("EXT_shader_texture_lod")?"#extension GL_EXT_shader_texture_lod : enable":""].filter(eb).join("\n")}function cb(a){var b=[];for(var c in a){var d=a[c];!1!==d&&b.push("#define "+c+" "+d)}return b.join("\n")}function db(a,b){for(var c={},d=a.getProgramParameter(b,a.ACTIVE_ATTRIBUTES),e=0;e<d;e++){var f=a.getActiveAttrib(b,e),g=f.name;c[g]=a.getAttribLocation(b,g)}return c}function eb(a){return""!==a}function fb(a,b){return a.replace(/NUM_DIR_LIGHTS/g,b.numDirLights).replace(/NUM_SPOT_LIGHTS/g,b.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g,b.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,b.numPointLights).replace(/NUM_HEMI_LIGHTS/g,b.numHemiLights)}function gb(a){function b(a,b){var c=Mf[b];if(void 0===c)throw new Error("Can not resolve #include <"+b+">");return gb(c)}var c=/^[ \t]*#include +<([\w\d.]+)>/gm;return a.replace(c,b)}function hb(a){function b(a,b,c,d){for(var e="",f=parseInt(b);f<parseInt(c);f++)e+=d.replace(/\[ i \]/g,"[ "+f+" ]");return e}var c=/for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;return a.replace(c,b)}function ib(a,b,c,d,e,f){var g=a.context,h=d.defines,i=e.vertexShader,j=e.fragmentShader,k="SHADOWMAP_TYPE_BASIC";f.shadowMapType===Eb?k="SHADOWMAP_TYPE_PCF":f.shadowMapType===Fb&&(k="SHADOWMAP_TYPE_PCF_SOFT");var l="ENVMAP_TYPE_CUBE",m="ENVMAP_MODE_REFLECTION",n="ENVMAP_BLENDING_MULTIPLY";if(f.envMap){switch(d.envMap.mapping){case wc:case xc:l="ENVMAP_TYPE_CUBE";break;case Bc:case Cc:l="ENVMAP_TYPE_CUBE_UV";break;case yc:case zc:l="ENVMAP_TYPE_EQUIREC";break;case Ac:l="ENVMAP_TYPE_SPHERE"}switch(d.envMap.mapping){case xc:case zc:m="ENVMAP_MODE_REFRACTION"}switch(d.combine){case nc:n="ENVMAP_BLENDING_MULTIPLY";break;case oc:n="ENVMAP_BLENDING_MIX";break;case pc:n="ENVMAP_BLENDING_ADD"}}var o,p,q=a.gammaFactor>0?a.gammaFactor:1,r=bb(d.extensions,f,b),s=cb(h),t=g.createProgram();d.isRawShaderMaterial?(o=[s].filter(eb).join("\n"),o.length>0&&(o+="\n"),p=[r,s].filter(eb).join("\n"),p.length>0&&(p+="\n")):(o=["precision "+f.precision+" float;","precision "+f.precision+" int;","#define SHADER_NAME "+e.name,s,f.supportsVertexTextures?"#define VERTEX_TEXTURES":"","#define GAMMA_FACTOR "+q,"#define MAX_BONES "+f.maxBones,f.useFog&&f.fog?"#define USE_FOG":"",f.useFog&&f.fogExp?"#define FOG_EXP2":"",f.map?"#define USE_MAP":"",f.envMap?"#define USE_ENVMAP":"",f.envMap?"#define "+m:"",f.lightMap?"#define USE_LIGHTMAP":"",f.aoMap?"#define USE_AOMAP":"",f.emissiveMap?"#define USE_EMISSIVEMAP":"",f.bumpMap?"#define USE_BUMPMAP":"",f.normalMap?"#define USE_NORMALMAP":"",f.displacementMap&&f.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",f.specularMap?"#define USE_SPECULARMAP":"",f.roughnessMap?"#define USE_ROUGHNESSMAP":"",f.metalnessMap?"#define USE_METALNESSMAP":"",f.alphaMap?"#define USE_ALPHAMAP":"",f.vertexColors?"#define USE_COLOR":"",f.flatShading?"#define FLAT_SHADED":"",f.skinning?"#define USE_SKINNING":"",f.useVertexTexture?"#define BONE_TEXTURE":"",f.morphTargets?"#define USE_MORPHTARGETS":"",f.morphNormals&&!1===f.flatShading?"#define USE_MORPHNORMALS":"",f.doubleSided?"#define DOUBLE_SIDED":"",f.flipSided?"#define FLIP_SIDED":"","#define NUM_CLIPPING_PLANES "+f.numClippingPlanes,f.shadowMapEnabled?"#define USE_SHADOWMAP":"",f.shadowMapEnabled?"#define "+k:"",f.sizeAttenuation?"#define USE_SIZEATTENUATION":"",f.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",f.logarithmicDepthBuffer&&b.get("EXT_frag_depth")?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_COLOR","\tattribute vec3 color;","#endif","#ifdef USE_MORPHTARGETS","\tattribute vec3 morphTarget0;","\tattribute vec3 morphTarget1;","\tattribute vec3 morphTarget2;","\tattribute vec3 morphTarget3;","\t#ifdef USE_MORPHNORMALS","\t\tattribute vec3 morphNormal0;","\t\tattribute vec3 morphNormal1;","\t\tattribute vec3 morphNormal2;","\t\tattribute vec3 morphNormal3;","\t#else","\t\tattribute vec3 morphTarget4;","\t\tattribute vec3 morphTarget5;","\t\tattribute vec3 morphTarget6;","\t\tattribute vec3 morphTarget7;","\t#endif","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif","\n"].filter(eb).join("\n"),p=[r,"precision "+f.precision+" float;","precision "+f.precision+" int;","#define SHADER_NAME "+e.name,s,f.alphaTest?"#define ALPHATEST "+f.alphaTest:"","#define GAMMA_FACTOR "+q,f.useFog&&f.fog?"#define USE_FOG":"",f.useFog&&f.fogExp?"#define FOG_EXP2":"",f.map?"#define USE_MAP":"",f.envMap?"#define USE_ENVMAP":"",f.envMap?"#define "+l:"",f.envMap?"#define "+m:"",f.envMap?"#define "+n:"",f.lightMap?"#define USE_LIGHTMAP":"",f.aoMap?"#define USE_AOMAP":"",f.emissiveMap?"#define USE_EMISSIVEMAP":"",f.bumpMap?"#define USE_BUMPMAP":"",f.normalMap?"#define USE_NORMALMAP":"",f.specularMap?"#define USE_SPECULARMAP":"",f.roughnessMap?"#define USE_ROUGHNESSMAP":"",f.metalnessMap?"#define USE_METALNESSMAP":"",f.alphaMap?"#define USE_ALPHAMAP":"",f.vertexColors?"#define USE_COLOR":"",f.gradientMap?"#define USE_GRADIENTMAP":"",f.flatShading?"#define FLAT_SHADED":"",f.doubleSided?"#define DOUBLE_SIDED":"",f.flipSided?"#define FLIP_SIDED":"","#define NUM_CLIPPING_PLANES "+f.numClippingPlanes,"#define UNION_CLIPPING_PLANES "+(f.numClippingPlanes-f.numClipIntersection),f.shadowMapEnabled?"#define USE_SHADOWMAP":"",f.shadowMapEnabled?"#define "+k:"",f.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",f.physicallyCorrectLights?"#define PHYSICALLY_CORRECT_LIGHTS":"",f.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",f.logarithmicDepthBuffer&&b.get("EXT_frag_depth")?"#define USE_LOGDEPTHBUF_EXT":"",f.envMap&&b.get("EXT_shader_texture_lod")?"#define TEXTURE_LOD_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;",f.toneMapping!==qc?"#define TONE_MAPPING":"",f.toneMapping!==qc?Mf.tonemapping_pars_fragment:"",f.toneMapping!==qc?ab("toneMapping",f.toneMapping):"",f.dithering?"#define DITHERING":"",f.outputEncoding||f.mapEncoding||f.envMapEncoding||f.emissiveMapEncoding?Mf.encodings_pars_fragment:"",f.mapEncoding?$a("mapTexelToLinear",f.mapEncoding):"",f.envMapEncoding?$a("envMapTexelToLinear",f.envMapEncoding):"",f.emissiveMapEncoding?$a("emissiveMapTexelToLinear",f.emissiveMapEncoding):"",f.outputEncoding?_a("linearToOutputTexel",f.outputEncoding):"",f.depthPacking?"#define DEPTH_PACKING "+d.depthPacking:"","\n"].filter(eb).join("\n")),i=gb(i),i=fb(i,f),j=gb(j),j=fb(j,f),d.isShaderMaterial||(i=hb(i),j=hb(j));var u=o+i,v=p+j,w=Ya(g,g.VERTEX_SHADER,u),x=Ya(g,g.FRAGMENT_SHADER,v);g.attachShader(t,w),g.attachShader(t,x),void 0!==d.index0AttributeName?g.bindAttribLocation(t,0,d.index0AttributeName):!0===f.morphTargets&&g.bindAttribLocation(t,0,"position"),g.linkProgram(t);var y=g.getProgramInfoLog(t),z=g.getShaderInfoLog(w),A=g.getShaderInfoLog(x),B=!0,C=!0;!1===g.getProgramParameter(t,g.LINK_STATUS)?(B=!1,console.error("THREE.WebGLProgram: shader error: ",g.getError(),"gl.VALIDATE_STATUS",g.getProgramParameter(t,g.VALIDATE_STATUS),"gl.getProgramInfoLog",y,z,A)):""!==y?console.warn("THREE.WebGLProgram: gl.getProgramInfoLog()",y):""!==z&&""!==A||(C=!1),C&&(this.diagnostics={runnable:B,material:d,programLog:y,vertexShader:{log:z,prefix:o},fragmentShader:{log:A,prefix:p}}),g.deleteShader(w),g.deleteShader(x);var D;this.getUniforms=function(){return void 0===D&&(D=new T(g,t,a)),D};var E;return this.getAttributes=function(){return void 0===E&&(E=db(g,t)),E},this.destroy=function(){g.deleteProgram(t),this.program=void 0},Object.defineProperties(this,{uniforms:{get:function(){return console.warn("THREE.WebGLProgram: .uniforms is now .getUniforms()."),this.getUniforms()}},attributes:{get:function(){return console.warn("THREE.WebGLProgram: .attributes is now .getAttributes()."),this.getAttributes()}}}),this.id=Sf++,this.code=c,this.usedTimes=1,this.program=t,this.vertexShader=w,this.fragmentShader=x,this}function jb(a,b,c){function d(a){var b=a.skeleton,d=b.bones;if(c.floatVertexTextures)return 1024;var e=c.maxVertexUniforms,f=Math.floor((e-20)/4),g=Math.min(f,d.length);return g<d.length?(console.warn("THREE.WebGLRenderer: Skeleton has "+d.length+" bones. This GPU supports "+g+"."),0):g}function e(a,b){var c;return a?a.isTexture?c=a.encoding:a.isWebGLRenderTarget&&(console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead."),c=a.texture.encoding):c=pd,c===pd&&b&&(c=rd),c}var f=[],g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"phong",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow"},h=["precision","supportsVertexTextures","map","mapEncoding","envMap","envMapMode","envMapEncoding","lightMap","aoMap","emissiveMap","emissiveMapEncoding","bumpMap","normalMap","displacementMap","specularMap","roughnessMap","metalnessMap","gradientMap","alphaMap","combine","vertexColors","fog","useFog","fogExp","flatShading","sizeAttenuation","logarithmicDepthBuffer","skinning","maxBones","useVertexTexture","morphTargets","morphNormals","maxMorphTargets","maxMorphNormals","premultipliedAlpha","numDirLights","numPointLights","numSpotLights","numHemiLights","numRectAreaLights","shadowMapEnabled","shadowMapType","toneMapping","physicallyCorrectLights","alphaTest","doubleSided","flipSided","numClippingPlanes","numClipIntersection","depthPacking","dithering"];this.getParameters=function(b,f,h,i,j,k,l){var m=g[b.type],n=l.isSkinnedMesh?d(l):0,o=c.precision;null!==b.precision&&(o=c.getMaxPrecision(b.precision))!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",o,"instead.");var p=a.getRenderTarget();return{shaderID:m,precision:o,supportsVertexTextures:c.vertexTextures,outputEncoding:e(p?p.texture:null,a.gammaOutput),map:!!b.map,mapEncoding:e(b.map,a.gammaInput),envMap:!!b.envMap,envMapMode:b.envMap&&b.envMap.mapping,envMapEncoding:e(b.envMap,a.gammaInput),envMapCubeUV:!!b.envMap&&(b.envMap.mapping===Bc||b.envMap.mapping===Cc),lightMap:!!b.lightMap,aoMap:!!b.aoMap,emissiveMap:!!b.emissiveMap,emissiveMapEncoding:e(b.emissiveMap,a.gammaInput),bumpMap:!!b.bumpMap,normalMap:!!b.normalMap,displacementMap:!!b.displacementMap,roughnessMap:!!b.roughnessMap,metalnessMap:!!b.metalnessMap,specularMap:!!b.specularMap,alphaMap:!!b.alphaMap,gradientMap:!!b.gradientMap,combine:b.combine,vertexColors:b.vertexColors,fog:!!i,useFog:b.fog,fogExp:i&&i.isFogExp2,flatShading:b.flatShading,sizeAttenuation:b.sizeAttenuation,logarithmicDepthBuffer:c.logarithmicDepthBuffer,skinning:b.skinning&&n>0,maxBones:n,useVertexTexture:c.floatVertexTextures,morphTargets:b.morphTargets,morphNormals:b.morphNormals,maxMorphTargets:a.maxMorphTargets,maxMorphNormals:a.maxMorphNormals,numDirLights:f.directional.length,numPointLights:f.point.length,numSpotLights:f.spot.length,numRectAreaLights:f.rectArea.length,numHemiLights:f.hemi.length,numClippingPlanes:j,numClipIntersection:k,dithering:b.dithering,shadowMapEnabled:a.shadowMap.enabled&&l.receiveShadow&&h.length>0,shadowMapType:a.shadowMap.type,toneMapping:a.toneMapping,physicallyCorrectLights:a.physicallyCorrectLights,premultipliedAlpha:b.premultipliedAlpha,alphaTest:b.alphaTest,doubleSided:b.side===Ib,flipSided:b.side===Hb,depthPacking:void 0!==b.depthPacking&&b.depthPacking}},this.getProgramCode=function(b,c){var d=[];if(c.shaderID?d.push(c.shaderID):(d.push(b.fragmentShader),d.push(b.vertexShader)),void 0!==b.defines)for(var e in b.defines)d.push(e),d.push(b.defines[e]);for(var f=0;f<h.length;f++)d.push(c[h[f]]);return d.push(b.onBeforeCompile.toString()),d.push(a.gammaOutput),d.join()},this.acquireProgram=function(c,d,e,g){for(var h,i=0,j=f.length;i<j;i++){var k=f[i];if(k.code===g){h=k,++h.usedTimes;break}}return void 0===h&&(h=new ib(a,b,g,c,d,e),f.push(h)),h},this.releaseProgram=function(a){if(0==--a.usedTimes){var b=f.indexOf(a);f[b]=f[f.length-1],f.pop(),a.destroy()}},this.programs=f}function kb(a,b,c,d,e,f,g){function h(a,b){if(a.width>b||a.height>b){var c=b/Math.max(a.width,a.height),d=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");d.width=Math.floor(a.width*c),d.height=Math.floor(a.height*c);return d.getContext("2d").drawImage(a,0,0,a.width,a.height,0,0,d.width,d.height),console.warn("THREE.WebGLRenderer: image is too big ("+a.width+"x"+a.height+"). Resized to "+d.width+"x"+d.height,a),d}return a}function i(a){return yd.isPowerOfTwo(a.width)&&yd.isPowerOfTwo(a.height)}function j(a){if(a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof ImageBitmap){var b=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");b.width=yd.floorPowerOfTwo(a.width),b.height=yd.floorPowerOfTwo(a.height);return b.getContext("2d").drawImage(a,0,0,b.width,b.height),console.warn("THREE.WebGLRenderer: image is not power of two ("+a.width+"x"+a.height+"). Resized to "+b.width+"x"+b.height,a),b}return a}function k(a){return a.wrapS!==Ec||a.wrapT!==Ec||a.minFilter!==Gc&&a.minFilter!==Jc}function l(a,b){return a.generateMipmaps&&b&&a.minFilter!==Gc&&a.minFilter!==Jc}function m(b){return b===Gc||b===Hc||b===Ic?a.NEAREST:a.LINEAR}function n(a){var b=a.target;b.removeEventListener("dispose",n),p(b),b.isVideoTexture&&delete E[b.id],g.textures--}function o(a){var b=a.target;b.removeEventListener("dispose",o),q(b),g.textures--}function p(b){var c=d.get(b);if(b.image&&c.__image__webglTextureCube)a.deleteTexture(c.__image__webglTextureCube);else{if(void 0===c.__webglInit)return;a.deleteTexture(c.__webglTexture)}d.remove(b)}function q(b){var c=d.get(b),e=d.get(b.texture);if(b){if(void 0!==e.__webglTexture&&a.deleteTexture(e.__webglTexture),b.depthTexture&&b.depthTexture.dispose(),b.isWebGLRenderTargetCube)for(var f=0;f<6;f++)a.deleteFramebuffer(c.__webglFramebuffer[f]),c.__webglDepthbuffer&&a.deleteRenderbuffer(c.__webglDepthbuffer[f]);else a.deleteFramebuffer(c.__webglFramebuffer),c.__webglDepthbuffer&&a.deleteRenderbuffer(c.__webglDepthbuffer);d.remove(b.texture),d.remove(b)}}function r(b,e){var f=d.get(b);if(b.version>0&&f.__version!==b.version){var g=b.image;if(void 0===g)console.warn("THREE.WebGLRenderer: Texture marked for update but image is undefined",b);else{if(!1!==g.complete)return void v(f,b,e);console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete",b)}}c.activeTexture(a.TEXTURE0+e),c.bindTexture(a.TEXTURE_2D,f.__webglTexture)}function s(b,j){var k=d.get(b);if(6===b.image.length)if(b.version>0&&k.__version!==b.version){k.__image__webglTextureCube||(b.addEventListener("dispose",n),k.__image__webglTextureCube=a.createTexture(),g.textures++),c.activeTexture(a.TEXTURE0+j),c.bindTexture(a.TEXTURE_CUBE_MAP,k.__image__webglTextureCube),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,b.flipY);for(var m=b&&b.isCompressedTexture,o=b.image[0]&&b.image[0].isDataTexture,p=[],q=0;q<6;q++)p[q]=m||o?o?b.image[q].image:b.image[q]:h(b.image[q],e.maxCubemapSize);var r=p[0],s=i(r),t=f.convert(b.format),v=f.convert(b.type);u(a.TEXTURE_CUBE_MAP,b,s);for(var q=0;q<6;q++)if(m)for(var w,x=p[q].mipmaps,y=0,z=x.length;y<z;y++)w=x[y],b.format!==$c&&b.format!==Zc?c.getCompressedTextureFormats().indexOf(t)>-1?c.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+q,y,t,w.width,w.height,0,w.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):c.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+q,y,t,w.width,w.height,0,t,v,w.data);else o?c.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,t,p[q].width,p[q].height,0,t,v,p[q].data):c.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+q,0,t,t,v,p[q]);l(b,s)&&a.generateMipmap(a.TEXTURE_CUBE_MAP),k.__version=b.version,b.onUpdate&&b.onUpdate(b)}else c.activeTexture(a.TEXTURE0+j),c.bindTexture(a.TEXTURE_CUBE_MAP,k.__image__webglTextureCube)}function t(b,e){c.activeTexture(a.TEXTURE0+e),c.bindTexture(a.TEXTURE_CUBE_MAP,d.get(b).__webglTexture)}function u(c,g,h){var i;if(h?(a.texParameteri(c,a.TEXTURE_WRAP_S,f.convert(g.wrapS)),a.texParameteri(c,a.TEXTURE_WRAP_T,f.convert(g.wrapT)),a.texParameteri(c,a.TEXTURE_MAG_FILTER,f.convert(g.magFilter)),a.texParameteri(c,a.TEXTURE_MIN_FILTER,f.convert(g.minFilter))):(a.texParameteri(c,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(c,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),g.wrapS===Ec&&g.wrapT===Ec||console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.",g),a.texParameteri(c,a.TEXTURE_MAG_FILTER,m(g.magFilter)),a.texParameteri(c,a.TEXTURE_MIN_FILTER,m(g.minFilter)),g.minFilter!==Gc&&g.minFilter!==Jc&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.",g)),i=b.get("EXT_texture_filter_anisotropic")){if(g.type===Sc&&null===b.get("OES_texture_float_linear"))return;if(g.type===Tc&&null===b.get("OES_texture_half_float_linear"))return;(g.anisotropy>1||d.get(g).__currentAnisotropy)&&(a.texParameterf(c,i.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,e.getMaxAnisotropy())),d.get(g).__currentAnisotropy=g.anisotropy)}}function v(b,d,m){void 0===b.__webglInit&&(b.__webglInit=!0,d.addEventListener("dispose",n),b.__webglTexture=a.createTexture(),d.isVideoTexture&&(E[d.id]=d),g.textures++),c.activeTexture(a.TEXTURE0+m),c.bindTexture(a.TEXTURE_2D,b.__webglTexture),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,d.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,d.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,d.unpackAlignment);var o=h(d.image,e.maxTextureSize);k(d)&&!1===i(o)&&(o=j(o));var p=i(o),q=f.convert(d.format),r=f.convert(d.type);u(a.TEXTURE_2D,d,p);var s,t=d.mipmaps;if(d.isDepthTexture){var v=a.DEPTH_COMPONENT;if(d.type===Sc){if(!D)throw new Error("Float Depth Texture only supported in WebGL2.0");v=a.DEPTH_COMPONENT32F}else D&&(v=a.DEPTH_COMPONENT16);d.format===bd&&v===a.DEPTH_COMPONENT&&d.type!==Pc&&d.type!==Rc&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),d.type=Pc,r=f.convert(d.type)),d.format===cd&&(v=a.DEPTH_STENCIL,d.type!==Xc&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),d.type=Xc,r=f.convert(d.type))),c.texImage2D(a.TEXTURE_2D,0,v,o.width,o.height,0,q,r,null)}else if(d.isDataTexture)if(t.length>0&&p){for(var w=0,x=t.length;w<x;w++)s=t[w],c.texImage2D(a.TEXTURE_2D,w,q,s.width,s.height,0,q,r,s.data);d.generateMipmaps=!1}else c.texImage2D(a.TEXTURE_2D,0,q,o.width,o.height,0,q,r,o.data);else if(d.isCompressedTexture)for(var w=0,x=t.length;w<x;w++)s=t[w],d.format!==$c&&d.format!==Zc?c.getCompressedTextureFormats().indexOf(q)>-1?c.compressedTexImage2D(a.TEXTURE_2D,w,q,s.width,s.height,0,s.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):c.texImage2D(a.TEXTURE_2D,w,q,s.width,s.height,0,q,r,s.data);else if(t.length>0&&p){for(var w=0,x=t.length;w<x;w++)s=t[w],c.texImage2D(a.TEXTURE_2D,w,q,q,r,s);d.generateMipmaps=!1}else c.texImage2D(a.TEXTURE_2D,0,q,q,r,o);l(d,p)&&a.generateMipmap(a.TEXTURE_2D),b.__version=d.version,d.onUpdate&&d.onUpdate(d)}function w(b,e,g,h){var i=f.convert(e.texture.format),j=f.convert(e.texture.type);c.texImage2D(h,0,i,e.width,e.height,0,i,j,null),a.bindFramebuffer(a.FRAMEBUFFER,b),a.framebufferTexture2D(a.FRAMEBUFFER,g,h,d.get(e.texture).__webglTexture,0),a.bindFramebuffer(a.FRAMEBUFFER,null)}function x(b,c){a.bindRenderbuffer(a.RENDERBUFFER,b),c.depthBuffer&&!c.stencilBuffer?(a.renderbufferStorage(a.RENDERBUFFER,a.DEPTH_COMPONENT16,c.width,c.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.RENDERBUFFER,b)):c.depthBuffer&&c.stencilBuffer?(a.renderbufferStorage(a.RENDERBUFFER,a.DEPTH_STENCIL,c.width,c.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.RENDERBUFFER,b)):a.renderbufferStorage(a.RENDERBUFFER,a.RGBA4,c.width,c.height),a.bindRenderbuffer(a.RENDERBUFFER,null)}function y(b,c){if(c&&c.isWebGLRenderTargetCube)throw new Error("Depth Texture with cube render targets is not supported");if(a.bindFramebuffer(a.FRAMEBUFFER,b),!c.depthTexture||!c.depthTexture.isDepthTexture)throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");d.get(c.depthTexture).__webglTexture&&c.depthTexture.image.width===c.width&&c.depthTexture.image.height===c.height||(c.depthTexture.image.width=c.width,c.depthTexture.image.height=c.height,c.depthTexture.needsUpdate=!0),r(c.depthTexture,0);var e=d.get(c.depthTexture).__webglTexture;if(c.depthTexture.format===bd)a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,e,0);else{if(c.depthTexture.format!==cd)throw new Error("Unknown depthTexture format");a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,e,0)}}function z(b){var c=d.get(b),e=!0===b.isWebGLRenderTargetCube;if(b.depthTexture){if(e)throw new Error("target.depthTexture not supported in Cube render targets");y(c.__webglFramebuffer,b)}else if(e){c.__webglDepthbuffer=[];for(var f=0;f<6;f++)a.bindFramebuffer(a.FRAMEBUFFER,c.__webglFramebuffer[f]),c.__webglDepthbuffer[f]=a.createRenderbuffer(),x(c.__webglDepthbuffer[f],b)}else a.bindFramebuffer(a.FRAMEBUFFER,c.__webglFramebuffer),c.__webglDepthbuffer=a.createRenderbuffer(),x(c.__webglDepthbuffer,b);a.bindFramebuffer(a.FRAMEBUFFER,null)}function A(b){var e=d.get(b),f=d.get(b.texture);b.addEventListener("dispose",o),f.__webglTexture=a.createTexture(),g.textures++;var h=!0===b.isWebGLRenderTargetCube,j=i(b);if(h){e.__webglFramebuffer=[];for(var k=0;k<6;k++)e.__webglFramebuffer[k]=a.createFramebuffer()}else e.__webglFramebuffer=a.createFramebuffer();if(h){c.bindTexture(a.TEXTURE_CUBE_MAP,f.__webglTexture),u(a.TEXTURE_CUBE_MAP,b.texture,j);for(var k=0;k<6;k++)w(e.__webglFramebuffer[k],b,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+k);l(b.texture,j)&&a.generateMipmap(a.TEXTURE_CUBE_MAP),c.bindTexture(a.TEXTURE_CUBE_MAP,null)}else c.bindTexture(a.TEXTURE_2D,f.__webglTexture),u(a.TEXTURE_2D,b.texture,j),w(e.__webglFramebuffer,b,a.COLOR_ATTACHMENT0,a.TEXTURE_2D),l(b.texture,j)&&a.generateMipmap(a.TEXTURE_2D),c.bindTexture(a.TEXTURE_2D,null);b.depthBuffer&&z(b)}function B(b){var e=b.texture;if(l(e,i(b))){var f=b.isWebGLRenderTargetCube?a.TEXTURE_CUBE_MAP:a.TEXTURE_2D,g=d.get(e).__webglTexture;c.bindTexture(f,g),a.generateMipmap(f),c.bindTexture(f,null)}}function C(){for(var a in E)E[a].update()}var D="undefined"!=typeof WebGL2RenderingContext&&a instanceof window.WebGL2RenderingContext,E={};this.setTexture2D=r,this.setTextureCube=s,this.setTextureCubeDynamic=t,this.setupRenderTarget=A,this.updateRenderTargetMipmap=B,this.updateVideoTextures=C}function lb(){function a(a){var b=a.uuid,c=d[b];return void 0===c&&(c={},d[b]=c),c}function b(a){delete d[a.uuid]}function c(){d={}}var d={};return{get:a,remove:b,clear:c}}function mb(a,b,c){function d(){var b=!1,c=new i,d=null,e=new i(0,0,0,0);return{setMask:function(c){d===c||b||(a.colorMask(c,c,c,c),d=c)},setLocked:function(a){b=a},setClear:function(b,d,f,g,h){!0===h&&(b*=g,d*=g,f*=g),c.set(b,d,f,g),!1===e.equals(c)&&(a.clearColor(b,d,f,g),e.copy(c))},reset:function(){b=!1,d=null,e.set(-1,0,0,0)}}}function e(){var b=!1,c=null,d=null,e=null;return{setTest:function(b){b?m(a.DEPTH_TEST):n(a.DEPTH_TEST)},setMask:function(d){c===d||b||(a.depthMask(d),c=d)},setFunc:function(b){if(d!==b){if(b)switch(b){case fc:a.depthFunc(a.NEVER);break;case gc:a.depthFunc(a.ALWAYS);break;case hc:a.depthFunc(a.LESS);break;case ic:a.depthFunc(a.LEQUAL);break;case jc:a.depthFunc(a.EQUAL);break;case kc:a.depthFunc(a.GEQUAL);break;case lc:a.depthFunc(a.GREATER);break;case mc:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}else a.depthFunc(a.LEQUAL);d=b}},setLocked:function(a){b=a},setClear:function(b){e!==b&&(a.clearDepth(b),e=b)},reset:function(){b=!1,c=null,d=null,e=null}}}function f(){var b=!1,c=null,d=null,e=null,f=null,g=null,h=null,i=null,j=null;return{setTest:function(b){b?m(a.STENCIL_TEST):n(a.STENCIL_TEST)},setMask:function(d){c===d||b||(a.stencilMask(d),c=d)},setFunc:function(b,c,g){d===b&&e===c&&f===g||(a.stencilFunc(b,c,g),d=b,e=c,f=g)},setOp:function(b,c,d){g===b&&h===c&&i===d||(a.stencilOp(b,c,d),g=b,h=c,i=d)},setLocked:function(a){b=a},setClear:function(b){j!==b&&(a.clearStencil(b),j=b)},reset:function(){b=!1,c=null,d=null,e=null,f=null,g=null,h=null,i=null,j=null}}}function g(b,c,d){var e=new Uint8Array(4),f=a.createTexture();a.bindTexture(b,f),a.texParameteri(b,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(b,a.TEXTURE_MAG_FILTER,a.NEAREST);for(var g=0;g<d;g++)a.texImage2D(c+g,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,e);return f}function h(){for(var a=0,b=I.length;a<b;a++)I[a]=0}function j(c){if(I[c]=1,0===J[c]&&(a.enableVertexAttribArray(c),J[c]=1),0!==K[c]){b.get("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(c,0),K[c]=0}}function k(c,d){if(I[c]=1,0===J[c]&&(a.enableVertexAttribArray(c),J[c]=1),K[c]!==d){b.get("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(c,d),K[c]=d}}function l(){for(var b=0,c=J.length;b!==c;++b)J[b]!==I[b]&&(a.disableVertexAttribArray(b),J[b]=0)}function m(b){!0!==L[b]&&(a.enable(b),L[b]=!0)}function n(b){!1!==L[b]&&(a.disable(b),L[b]=!1)}function o(){if(null===M&&(M=[],b.get("WEBGL_compressed_texture_pvrtc")||b.get("WEBGL_compressed_texture_s3tc")||b.get("WEBGL_compressed_texture_etc1")))for(var c=a.getParameter(a.COMPRESSED_TEXTURE_FORMATS),d=0;d<c.length;d++)M.push(c[d]);return M}function p(b){return N!==b&&(a.useProgram(b),N=b,!0)}function q(b,d,e,f,g,h,i,j){if(b!==Lb?m(a.BLEND):n(a.BLEND),b!==Qb){if(b!==O||j!==V)switch(b){case Nb:j?(a.blendEquationSeparate(a.FUNC_ADD,a.FUNC_ADD),a.blendFuncSeparate(a.ONE,a.ONE,a.ONE,a.ONE)):(a.blendEquation(a.FUNC_ADD),a.blendFunc(a.SRC_ALPHA,a.ONE));break;case Ob:j?(a.blendEquationSeparate(a.FUNC_ADD,a.FUNC_ADD),a.blendFuncSeparate(a.ZERO,a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ONE_MINUS_SRC_ALPHA)):(a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ZERO,a.ONE_MINUS_SRC_COLOR));break;case Pb:j?(a.blendEquationSeparate(a.FUNC_ADD,a.FUNC_ADD),a.blendFuncSeparate(a.ZERO,a.SRC_COLOR,a.ZERO,a.SRC_ALPHA)):(a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ZERO,a.SRC_COLOR));break;default:j?(a.blendEquationSeparate(a.FUNC_ADD,a.FUNC_ADD),a.blendFuncSeparate(a.ONE,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA)):(a.blendEquationSeparate(a.FUNC_ADD,a.FUNC_ADD),a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA))}P=null,Q=null,R=null,S=null,T=null,U=null}else g=g||d,h=h||e,i=i||f,d===P&&g===S||(a.blendEquationSeparate(c.convert(d),c.convert(g)),P=d,S=g),e===Q&&f===R&&h===T&&i===U||(a.blendFuncSeparate(c.convert(e),c.convert(f),c.convert(h),c.convert(i)),Q=e,R=f,T=h,U=i);O=b,V=j}function r(b,c){b.side===Ib?n(a.CULL_FACE):m(a.CULL_FACE);var d=b.side===Hb;c&&(d=!d),s(d),!0===b.transparent?q(b.blending,b.blendEquation,b.blendSrc,b.blendDst,b.blendEquationAlpha,b.blendSrcAlpha,b.blendDstAlpha,b.premultipliedAlpha):q(Lb),F.setFunc(b.depthFunc),F.setTest(b.depthTest),F.setMask(b.depthWrite),E.setMask(b.colorWrite),v(b.polygonOffset,b.polygonOffsetFactor,b.polygonOffsetUnits)}function s(b){W!==b&&(b?a.frontFace(a.CW):a.frontFace(a.CCW),W=b)}function t(b){b!==Ab?(m(a.CULL_FACE),b!==X&&(b===Bb?a.cullFace(a.BACK):b===Cb?a.cullFace(a.FRONT):a.cullFace(a.FRONT_AND_BACK))):n(a.CULL_FACE),X=b}function u(b){b!==Y&&(ba&&a.lineWidth(b),Y=b)}function v(b,c,d){b?(m(a.POLYGON_OFFSET_FILL),Z===c&&$===d||(a.polygonOffset(c,d),Z=c,$=d)):n(a.POLYGON_OFFSET_FILL)}function w(b){b?m(a.SCISSOR_TEST):n(a.SCISSOR_TEST)}function x(b){void 0===b&&(b=a.TEXTURE0+_-1),ca!==b&&(a.activeTexture(b),ca=b)}function y(b,c){null===ca&&x();var d=da[ca];void 0===d&&(d={type:void 0,texture:void 0},da[ca]=d),d.type===b&&d.texture===c||(a.bindTexture(b,c||ga[b]),d.type=b,d.texture=c)}function z(){try{a.compressedTexImage2D.apply(a,arguments)}catch(a){console.error("THREE.WebGLState:",a)}}function A(){try{a.texImage2D.apply(a,arguments)}catch(a){console.error("THREE.WebGLState:",a)}}function B(b){!1===ea.equals(b)&&(a.scissor(b.x,b.y,b.z,b.w),ea.copy(b))}function C(b){!1===fa.equals(b)&&(a.viewport(b.x,b.y,b.z,b.w),fa.copy(b))}function D(){for(var b=0;b<J.length;b++)1===J[b]&&(a.disableVertexAttribArray(b),J[b]=0);L={},M=null,ca=null,da={},N=null,O=null,W=null,X=null,E.reset(),F.reset(),G.reset()}var E=new d,F=new e,G=new f,H=a.getParameter(a.MAX_VERTEX_ATTRIBS),I=new Uint8Array(H),J=new Uint8Array(H),K=new Uint8Array(H),L={},M=null,N=null,O=null,P=null,Q=null,R=null,S=null,T=null,U=null,V=!1,W=null,X=null,Y=null,Z=null,$=null,_=a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS),aa=parseFloat(/^WebGL\ ([0-9])/.exec(a.getParameter(a.VERSION))[1]),ba=parseFloat(aa)>=1,ca=null,da={},ea=new i,fa=new i,ga={};return ga[a.TEXTURE_2D]=g(a.TEXTURE_2D,a.TEXTURE_2D,1),ga[a.TEXTURE_CUBE_MAP]=g(a.TEXTURE_CUBE_MAP,a.TEXTURE_CUBE_MAP_POSITIVE_X,6),E.setClear(0,0,0,1),F.setClear(1),G.setClear(0),m(a.DEPTH_TEST),F.setFunc(ic),s(!1),t(Bb),m(a.CULL_FACE),m(a.BLEND),q(Mb),{buffers:{color:E,depth:F,stencil:G},initAttributes:h,enableAttribute:j,enableAttributeAndDivisor:k,disableUnusedAttributes:l,enable:m,disable:n,getCompressedTextureFormats:o,useProgram:p,setBlending:q,setMaterial:r,setFlipSided:s,setCullFace:t,setLineWidth:u,setPolygonOffset:v,setScissorTest:w,activeTexture:x,bindTexture:y,compressedTexImage2D:z,texImage2D:A,scissor:B,viewport:C,reset:D}}function nb(a,b,c){function d(){if(void 0!==f)return f;var c=b.get("EXT_texture_filter_anisotropic");return f=null!==c?a.getParameter(c.MAX_TEXTURE_MAX_ANISOTROPY_EXT):0}function e(b){if("highp"===b){if(a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return"mediump"===b&&a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}var f,g=void 0!==c.precision?c.precision:"highp",h=e(g);h!==g&&(console.warn("THREE.WebGLRenderer:",g,"not supported, using",h,"instead."),g=h);var i=!0===c.logarithmicDepthBuffer,j=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),k=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS),l=a.getParameter(a.MAX_TEXTURE_SIZE),m=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE),n=a.getParameter(a.MAX_VERTEX_ATTRIBS),o=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),p=a.getParameter(a.MAX_VARYING_VECTORS),q=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),r=k>0,s=!!b.get("OES_texture_float");return{getMaxAnisotropy:d,getMaxPrecision:e,precision:g,logarithmicDepthBuffer:i,maxTextures:j,maxVertexTextures:k,maxTextureSize:l,maxCubemapSize:m,maxAttributes:n,maxVertexUniforms:o,maxVaryings:p,maxFragmentUniforms:q,vertexTextures:r,floatFragmentTextures:s,floatVertexTextures:r&&s}}function ob(a,b,c,d){ja.call(this),this.type="PerspectiveCamera",this.fov=void 0!==a?a:50,this.zoom=1,this.near=void 0!==c?c:.1,this.far=void 0!==d?d:2e3,this.focus=10,this.aspect=void 0!==b?b:1,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}function pb(a){ob.call(this),this.cameras=a||[]}function qb(a){function b(){if(null!==e&&e.isPresenting){var b=e.getEyeParameters("left"),d=b.renderWidth,f=b.renderHeight;n=a.getPixelRatio(),m=a.getSize(),a.setDrawingBufferSize(2*d,f,1)}else c.enabled&&a.setDrawingBufferSize(m.width,m.height,n)}var c=this,e=null,f=null,g=null;"undefined"!=typeof window&&"VRFrameData"in window&&(f=new window.VRFrameData);var h=new d,j=new ob;j.bounds=new i(0,0,.5,1),j.layers.enable(1);var k=new ob;k.bounds=new i(.5,0,.5,1),k.layers.enable(2);var l=new pb([j,k]);l.layers.enable(1),l.layers.enable(2);var m,n;"undefined"!=typeof window&&window.addEventListener("vrdisplaypresentchange",b,!1),this.enabled=!1,this.getDevice=function(){return e},this.setDevice=function(a){void 0!==a&&(e=a)},this.setPoseTarget=function(a){void 0!==a&&(g=a)},this.getCamera=function(a){if(null===e)return a;e.depthNear=a.near,e.depthFar=a.far,e.getFrameData(f);var b=f.pose,c=null!==g?g:a;if(null!==b.position?c.position.fromArray(b.position):c.position.set(0,0,0),null!==b.orientation&&c.quaternion.fromArray(b.orientation),c.updateMatrixWorld(),!1===e.isPresenting)return a;j.near=a.near,k.near=a.near,j.far=a.far,k.far=a.far,l.matrixWorld.copy(a.matrixWorld),l.matrixWorldInverse.copy(a.matrixWorldInverse),j.matrixWorldInverse.fromArray(f.leftViewMatrix),k.matrixWorldInverse.fromArray(f.rightViewMatrix);var d=c.parent;null!==d&&(h.getInverse(d.matrixWorld),j.matrixWorldInverse.multiply(h),k.matrixWorldInverse.multiply(h)),j.matrixWorld.getInverse(j.matrixWorldInverse),k.matrixWorld.getInverse(k.matrixWorldInverse),j.projectionMatrix.fromArray(f.leftProjectionMatrix),k.projectionMatrix.fromArray(f.rightProjectionMatrix),l.projectionMatrix.copy(j.projectionMatrix);var i=e.getLayers();if(i.length){var m=i[0];null!==m.leftBounds&&4===m.leftBounds.length&&j.bounds.fromArray(m.leftBounds),null!==m.rightBounds&&4===m.rightBounds.length&&k.bounds.fromArray(m.rightBounds)}return l},this.submitFrame=function(){e&&e.isPresenting&&e.submitFrame()},this.dispose=function(){"undefined"!=typeof window&&window.removeEventListener("vrdisplaypresentchange",b)}}function rb(a){var b={};return{get:function(c){if(void 0!==b[c])return b[c];var d;switch(c){case"WEBGL_depth_texture":d=a.getExtension("WEBGL_depth_texture")||a.getExtension("MOZ_WEBGL_depth_texture")||a.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":d=a.getExtension("EXT_texture_filter_anisotropic")||a.getExtension("MOZ_EXT_texture_filter_anisotropic")||a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":d=a.getExtension("WEBGL_compressed_texture_s3tc")||a.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":d=a.getExtension("WEBGL_compressed_texture_pvrtc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;case"WEBGL_compressed_texture_etc1":d=a.getExtension("WEBGL_compressed_texture_etc1");break;default:d=a.getExtension(c)}return null===d&&console.warn("THREE.WebGLRenderer: "+c+" extension not supported."),b[c]=d,d}}}function sb(){function a(){k.value!==d&&(k.value=d,k.needsUpdate=e>0),c.numPlanes=e,c.numIntersection=0}function b(a,b,d,e){var f=null!==a?a.length:0,g=null;if(0!==f){if(g=k.value,!0!==e||null===g){var h=d+4*f,l=b.matrixWorldInverse;j.getNormalMatrix(l),(null===g||g.length<h)&&(g=new Float32Array(h));for(var m=0,n=d;m!==f;++m,n+=4)i.copy(a[m]).applyMatrix4(l,j),i.normal.toArray(g,n),g[n+3]=i.constant}k.value=g,k.needsUpdate=!0}return c.numPlanes=f,g}var c=this,d=null,e=0,f=!1,h=!1,i=new ca,j=new g,k={value:null,needsUpdate:!1};this.uniform=k,this.numPlanes=0,this.numIntersection=0,this.init=function(a,c,g){var h=0!==a.length||c||0!==e||f;return f=c,d=b(a,g,0),e=a.length,h},this.beginShadows=function(){h=!0,b(null)},this.endShadows=function(){h=!1,a()},this.setState=function(c,g,i,j,l,m){if(!f||null===c||0===c.length||h&&!i)h?b(null):a();else{var n=h?0:e,o=4*n,p=l.clippingState||null;k.value=p,p=b(c,j,o,m);for(var q=0;q!==o;++q)p[q]=d[q];l.clippingState=p,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=n}}}function tb(a,b){function c(c){var d;if(c===Dc)return a.REPEAT;if(c===Ec)return a.CLAMP_TO_EDGE;if(c===Fc)return a.MIRRORED_REPEAT;if(c===Gc)return a.NEAREST;if(c===Hc)return a.NEAREST_MIPMAP_NEAREST;if(c===Ic)return a.NEAREST_MIPMAP_LINEAR;if(c===Jc)return a.LINEAR;if(c===Kc)return a.LINEAR_MIPMAP_NEAREST;if(c===Lc)return a.LINEAR_MIPMAP_LINEAR;if(c===Mc)return a.UNSIGNED_BYTE;if(c===Uc)return a.UNSIGNED_SHORT_4_4_4_4;if(c===Vc)return a.UNSIGNED_SHORT_5_5_5_1;if(c===Wc)return a.UNSIGNED_SHORT_5_6_5;if(c===Nc)return a.BYTE;if(c===Oc)return a.SHORT;if(c===Pc)return a.UNSIGNED_SHORT;if(c===Qc)return a.INT;if(c===Rc)return a.UNSIGNED_INT;if(c===Sc)return a.FLOAT;if(c===Tc&&null!==(d=b.get("OES_texture_half_float")))return d.HALF_FLOAT_OES;if(c===Yc)return a.ALPHA;if(c===Zc)return a.RGB;if(c===$c)return a.RGBA;if(c===_c)return a.LUMINANCE;if(c===ad)return a.LUMINANCE_ALPHA;if(c===bd)return a.DEPTH_COMPONENT;if(c===cd)return a.DEPTH_STENCIL;if(c===Rb)return a.FUNC_ADD;if(c===Sb)return a.FUNC_SUBTRACT;if(c===Tb)return a.FUNC_REVERSE_SUBTRACT;if(c===Wb)return a.ZERO;if(c===Xb)return a.ONE;if(c===Yb)return a.SRC_COLOR;if(c===Zb)return a.ONE_MINUS_SRC_COLOR;if(c===$b)return a.SRC_ALPHA;if(c===_b)return a.ONE_MINUS_SRC_ALPHA;if(c===ac)return a.DST_ALPHA;if(c===bc)return a.ONE_MINUS_DST_ALPHA;if(c===cc)return a.DST_COLOR;if(c===dc)return a.ONE_MINUS_DST_COLOR;if(c===ec)return a.SRC_ALPHA_SATURATE;if((c===dd||c===ed||c===fd||c===gd)&&null!==(d=b.get("WEBGL_compressed_texture_s3tc"))){if(c===dd)return d.COMPRESSED_RGB_S3TC_DXT1_EXT;if(c===ed)return d.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(c===fd)return d.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(c===gd)return d.COMPRESSED_RGBA_S3TC_DXT5_EXT}if((c===hd||c===id||c===jd||c===kd)&&null!==(d=b.get("WEBGL_compressed_texture_pvrtc"))){if(c===hd)return d.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(c===id)return d.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(c===jd)return d.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(c===kd)return d.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(c===ld&&null!==(d=b.get("WEBGL_compressed_texture_etc1")))return d.COMPRESSED_RGB_ETC1_WEBGL;if((c===Ub||c===Vb)&&null!==(d=b.get("EXT_blend_minmax"))){if(c===Ub)return d.MIN_EXT;if(c===Vb)return d.MAX_EXT}return c===Xc&&null!==(d=b.get("WEBGL_depth_texture"))?d.UNSIGNED_INT_24_8_WEBGL:0}return{convert:c}}function ub(a){function b(){return null===ba?qa:1}function c(){Ea=new rb(Ca),Ea.get("WEBGL_depth_texture"),Ea.get("OES_texture_float"),Ea.get("OES_texture_float_linear"),Ea.get("OES_texture_half_float"),Ea.get("OES_texture_half_float_linear"),Ea.get("OES_standard_derivatives"),Ea.get("OES_element_index_uint"),Ea.get("ANGLE_instanced_arrays"),bb=new tb(Ca,Ea),Fa=new nb(Ca,Ea,a),Ga=new mb(Ca,Ea,bb),Ga.scissor(la.copy(sa).multiplyScalar(qa)),Ga.viewport(ka.copy(ra).multiplyScalar(qa)),Ha=new lb,Ia=new kb(Ca,Ea,Ga,Ha,Fa,bb,Aa),Ja=new fa(Ca),La=new Ta(Ca,Ja,Aa),Ma=new Wa(La,Ba),Ya=new Qa(Ca),Pa=new jb(_,Ea,Fa),Na=new Va,Ua=new Oa,Xa=new Ka(_,Ga,La,Q),Za=new Sa(Ca,Ea,Ba),$a=new Ra(Ca,Ea,Ba),_a=new W(_,Ca,Ga,Ia,Fa),ab=new Y(_,Ca,Ga,Ia,Fa),_.info.programs=Pa.programs,_.context=Ca,_.capabilities=Fa,_.extensions=Ea,_.properties=Ha,_.renderLists=Ua,_.state=Ga}function e(a){a.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),aa=!0}function g(){console.log("THREE.WebGLRenderer: Context Restored."),aa=!1,c()}function h(a){var b=a.target;b.removeEventListener("dispose",h),j(b)}function j(a){l(a),Ha.remove(a)}function l(a){var b=Ha.get(a).program;a.program=void 0,void 0!==b&&Pa.releaseProgram(b)}function m(a,b,c){a.render(function(a){_.renderBufferImmediate(a,b,c)})}function n(a,b,c,d){if(c&&c.isInstancedBufferGeometry&&null===Ea.get("ANGLE_instanced_arrays"))return void console.error("THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");void 0===d&&(d=0),Ga.initAttributes();var e=c.attributes,f=b.getAttributes(),g=a.defaultAttributeValues;for(var h in f){var i=f[h];if(i>=0){var j=e[h];if(void 0!==j){var k=j.normalized,l=j.itemSize,m=Ja.get(j);if(void 0===m)continue;var n=m.buffer,o=m.type,p=m.bytesPerElement;if(j.isInterleavedBufferAttribute){var q=j.data,r=q.stride,s=j.offset;q&&q.isInstancedInterleavedBuffer?(Ga.enableAttributeAndDivisor(i,q.meshPerAttribute),void 0===c.maxInstancedCount&&(c.maxInstancedCount=q.meshPerAttribute*q.count)):Ga.enableAttribute(i),Ca.bindBuffer(Ca.ARRAY_BUFFER,n),Ca.vertexAttribPointer(i,l,o,k,r*p,(d*r+s)*p)}else j.isInstancedBufferAttribute?(Ga.enableAttributeAndDivisor(i,j.meshPerAttribute),void 0===c.maxInstancedCount&&(c.maxInstancedCount=j.meshPerAttribute*j.count)):Ga.enableAttribute(i),Ca.bindBuffer(Ca.ARRAY_BUFFER,n),Ca.vertexAttribPointer(i,l,o,k,0,d*l*p)}else if(void 0!==g){var t=g[h];if(void 0!==t)switch(t.length){case 2:Ca.vertexAttrib2fv(i,t);break;case 3:Ca.vertexAttrib3fv(i,t);break;case 4:Ca.vertexAttrib4fv(i,t);break;default:Ca.vertexAttrib1fv(i,t)}}}}Ga.disableUnusedAttributes()}function o(){if(!eb){var a=cb.getDevice();a&&a.isPresenting?a.requestAnimationFrame(p):window.requestAnimationFrame(p),eb=!0}}function p(a){null!==fb&&fb(a);var b=cb.getDevice();b&&b.isPresenting?b.requestAnimationFrame(p):window.requestAnimationFrame(p)}function q(a,b,c){if(!1!==a.visible){if(a.layers.test(b.layers))if(a.isLight)U.push(a),a.castShadow&&V.push(a);else if(a.isSprite)a.frustumCulled&&!ua.intersectsSprite(a)||Z.push(a);else if(a.isLensFlare)$.push(a);else if(a.isImmediateRenderObject)c&&za.setFromMatrixPosition(a.matrixWorld).applyMatrix4(ya),X.push(a,null,a.material,za.z,null);else if((a.isMesh||a.isLine||a.isPoints)&&(a.isSkinnedMesh&&a.skeleton.update(),!a.frustumCulled||ua.intersectsObject(a))){c&&za.setFromMatrixPosition(a.matrixWorld).applyMatrix4(ya);var d=Ma.update(a),e=a.material;if(Array.isArray(e))for(var f=d.groups,g=0,h=f.length;g<h;g++){var i=f[g],j=e[i.materialIndex];j&&j.visible&&X.push(a,d,j,za.z,i)}else e.visible&&X.push(a,d,e,za.z,null)}for(var k=a.children,g=0,h=k.length;g<h;g++)q(k[g],b,c)}}function r(a,b,c,d){for(var e=0,f=a.length;e<f;e++){var g=a[e],h=g.object,i=g.geometry,j=void 0===d?g.material:d,k=g.group;if(c.isArrayCamera){ja=c;for(var l=c.cameras,m=0,n=l.length;m<n;m++){var o=l[m];if(h.layers.test(o.layers)){var p=o.bounds,q=p.x*oa,r=p.y*pa,t=p.z*oa,u=p.w*pa;Ga.viewport(ka.set(q,r,t,u).multiplyScalar(qa)),s(h,b,o,i,j,k)}}}else ja=null,s(h,b,c,i,j,k)}}function s(a,b,c,d,e,f){if(a.onBeforeRender(_,b,c,d,e,f),a.modelViewMatrix.multiplyMatrices(c.matrixWorldInverse,a.matrixWorld),a.normalMatrix.getNormalMatrix(a.modelViewMatrix),a.isImmediateRenderObject){var g=a.isMesh&&a.matrixWorld.determinant()<0;Ga.setMaterial(e,g);var h=u(c,b.fog,e,a);ha="",m(a,h,e)}else _.renderBufferDirect(c,b.fog,d,e,a,f);a.onAfterRender(_,b,c,d,e,f)}function t(a,b,c){var d=Ha.get(a),e=Pa.getParameters(a,Na.state,V,b,va.numPlanes,va.numIntersection,c),f=Pa.getProgramCode(a,e),g=d.program,i=!0;if(void 0===g)a.addEventListener("dispose",h);else if(g.code!==f)l(a);else{if(void 0!==e.shaderID)return;i=!1}if(i){if(e.shaderID){var j=Nf[e.shaderID];d.shader={name:a.type,uniforms:Jd.clone(j.uniforms),vertexShader:j.vertexShader,fragmentShader:j.fragmentShader}}else d.shader={name:a.type,uniforms:a.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader};a.onBeforeCompile(d.shader),g=Pa.acquireProgram(a,d.shader,e,f),d.program=g,a.program=g}var k=g.getAttributes();if(a.morphTargets){a.numSupportedMorphTargets=0;for(var m=0;m<_.maxMorphTargets;m++)k["morphTarget"+m]>=0&&a.numSupportedMorphTargets++}if(a.morphNormals){a.numSupportedMorphNormals=0;for(var m=0;m<_.maxMorphNormals;m++)k["morphNormal"+m]>=0&&a.numSupportedMorphNormals++}var n=d.shader.uniforms;(a.isShaderMaterial||a.isRawShaderMaterial)&&!0!==a.clipping||(d.numClippingPlanes=va.numPlanes,d.numIntersection=va.numIntersection,n.clippingPlanes=va.uniform),d.fog=b,d.lightsHash=Na.state.hash,a.lights&&(n.ambientLightColor.value=Na.state.ambient,n.directionalLights.value=Na.state.directional,n.spotLights.value=Na.state.spot,n.rectAreaLights.value=Na.state.rectArea,n.pointLights.value=Na.state.point,n.hemisphereLights.value=Na.state.hemi,n.directionalShadowMap.value=Na.state.directionalShadowMap,n.directionalShadowMatrix.value=Na.state.directionalShadowMatrix,n.spotShadowMap.value=Na.state.spotShadowMap,n.spotShadowMatrix.value=Na.state.spotShadowMatrix,n.pointShadowMap.value=Na.state.pointShadowMap,n.pointShadowMatrix.value=Na.state.pointShadowMatrix);var o=d.program.getUniforms(),p=T.seqWithValue(o.seq,n);d.uniformsList=p}function u(a,b,c,d){na=0;var e=Ha.get(c);if(wa&&(xa||a!==ia)){var f=a===ia&&c.id===ga;va.setState(c.clippingPlanes,c.clipIntersection,c.clipShadows,a,e,f)}!1===c.needsUpdate&&(void 0===e.program?c.needsUpdate=!0:c.fog&&e.fog!==b?c.needsUpdate=!0:c.lights&&e.lightsHash!==Na.state.hash?c.needsUpdate=!0:void 0===e.numClippingPlanes||e.numClippingPlanes===va.numPlanes&&e.numIntersection===va.numIntersection||(c.needsUpdate=!0)),c.needsUpdate&&(t(c,b,d),c.needsUpdate=!1);var g=!1,h=!1,i=!1,j=e.program,l=j.getUniforms(),m=e.shader.uniforms;if(Ga.useProgram(j.program)&&(g=!0,h=!0,i=!0),c.id!==ga&&(ga=c.id,h=!0),g||a!==ia){if(l.setValue(Ca,"projectionMatrix",a.projectionMatrix),Fa.logarithmicDepthBuffer&&l.setValue(Ca,"logDepthBufFC",2/(Math.log(a.far+1)/Math.LN2)),ia!==(ja||a)&&(ia=ja||a,h=!0,i=!0),c.isShaderMaterial||c.isMeshPhongMaterial||c.isMeshStandardMaterial||c.envMap){var n=l.map.cameraPosition;void 0!==n&&n.setValue(Ca,za.setFromMatrixPosition(a.matrixWorld))}(c.isMeshPhongMaterial||c.isMeshLambertMaterial||c.isMeshBasicMaterial||c.isMeshStandardMaterial||c.isShaderMaterial||c.skinning)&&l.setValue(Ca,"viewMatrix",a.matrixWorldInverse)}if(c.skinning){l.setOptional(Ca,d,"bindMatrix"),l.setOptional(Ca,d,"bindMatrixInverse");var o=d.skeleton;if(o){var p=o.bones;if(Fa.floatVertexTextures){if(void 0===o.boneTexture){var q=Math.sqrt(4*p.length);q=yd.ceilPowerOfTwo(q),q=Math.max(q,4);var r=new Float32Array(q*q*4);r.set(o.boneMatrices);var s=new k(r,q,q,$c,Sc);o.boneMatrices=r,o.boneTexture=s,o.boneTextureSize=q}l.setValue(Ca,"boneTexture",o.boneTexture),l.setValue(Ca,"boneTextureSize",o.boneTextureSize)}else l.setOptional(Ca,o,"boneMatrices")}}return h&&(l.setValue(Ca,"toneMappingExposure",_.toneMappingExposure),l.setValue(Ca,"toneMappingWhitePoint",_.toneMappingWhitePoint),c.lights&&I(m,i),b&&c.fog&&z(m,b),c.isMeshBasicMaterial?v(m,c):c.isMeshLambertMaterial?(v(m,c),A(m,c)):c.isMeshPhongMaterial?(v(m,c),c.isMeshToonMaterial?C(m,c):B(m,c)):c.isMeshStandardMaterial?(v(m,c),c.isMeshPhysicalMaterial?E(m,c):D(m,c)):c.isMeshDepthMaterial?(v(m,c),F(m,c)):c.isMeshDistanceMaterial?(v(m,c),G(m,c)):c.isMeshNormalMaterial?(v(m,c),H(m,c)):c.isLineBasicMaterial?(w(m,c),c.isLineDashedMaterial&&x(m,c)):c.isPointsMaterial?y(m,c):c.isShadowMaterial&&(m.color.value=c.color,m.opacity.value=c.opacity),void 0!==m.ltcMat&&(m.ltcMat.value=Id.LTC_MAT_TEXTURE),void 0!==m.ltcMag&&(m.ltcMag.value=Id.LTC_MAG_TEXTURE),T.upload(Ca,e.uniformsList,m,_)),l.setValue(Ca,"modelViewMatrix",d.modelViewMatrix),l.setValue(Ca,"normalMatrix",d.normalMatrix),l.setValue(Ca,"modelMatrix",d.matrixWorld),j}function v(a,b){a.opacity.value=b.opacity,b.color&&(a.diffuse.value=b.color),b.emissive&&a.emissive.value.copy(b.emissive).multiplyScalar(b.emissiveIntensity),b.map&&(a.map.value=b.map),b.alphaMap&&(a.alphaMap.value=b.alphaMap),b.specularMap&&(a.specularMap.value=b.specularMap),b.envMap&&(a.envMap.value=b.envMap,a.flipEnvMap.value=b.envMap&&b.envMap.isCubeTexture?-1:1,a.reflectivity.value=b.reflectivity,a.refractionRatio.value=b.refractionRatio),b.lightMap&&(a.lightMap.value=b.lightMap,a.lightMapIntensity.value=b.lightMapIntensity),b.aoMap&&(a.aoMap.value=b.aoMap,a.aoMapIntensity.value=b.aoMapIntensity);var c;if(b.map?c=b.map:b.specularMap?c=b.specularMap:b.displacementMap?c=b.displacementMap:b.normalMap?c=b.normalMap:b.bumpMap?c=b.bumpMap:b.roughnessMap?c=b.roughnessMap:b.metalnessMap?c=b.metalnessMap:b.alphaMap?c=b.alphaMap:b.emissiveMap&&(c=b.emissiveMap),void 0!==c){if(c.isWebGLRenderTarget&&(c=c.texture),!0===c.matrixAutoUpdate){var d=c.offset,e=c.repeat,f=c.rotation,g=c.center;c.matrix.setUvTransform(d.x,d.y,e.x,e.y,f,g.x,g.y)}a.uvTransform.value.copy(c.matrix)}}function w(a,b){a.diffuse.value=b.color,a.opacity.value=b.opacity}function x(a,b){a.dashSize.value=b.dashSize,a.totalSize.value=b.dashSize+b.gapSize,a.scale.value=b.scale}function y(a,b){if(a.diffuse.value=b.color,a.opacity.value=b.opacity,a.size.value=b.size*qa,a.scale.value=.5*pa,a.map.value=b.map,null!==b.map){if(!0===b.map.matrixAutoUpdate){var c=b.map.offset,d=b.map.repeat,e=b.map.rotation,f=b.map.center;b.map.matrix.setUvTransform(c.x,c.y,d.x,d.y,e,f.x,f.y)}a.uvTransform.value.copy(b.map.matrix)}}function z(a,b){a.fogColor.value=b.color,b.isFog?(a.fogNear.value=b.near,a.fogFar.value=b.far):b.isFogExp2&&(a.fogDensity.value=b.density)}function A(a,b){b.emissiveMap&&(a.emissiveMap.value=b.emissiveMap)}function B(a,b){a.specular.value=b.specular,a.shininess.value=Math.max(b.shininess,1e-4),b.emissiveMap&&(a.emissiveMap.value=b.emissiveMap),b.bumpMap&&(a.bumpMap.value=b.bumpMap,a.bumpScale.value=b.bumpScale),b.normalMap&&(a.normalMap.value=b.normalMap,a.normalScale.value.copy(b.normalScale)),b.displacementMap&&(a.displacementMap.value=b.displacementMap,a.displacementScale.value=b.displacementScale,a.displacementBias.value=b.displacementBias)}function C(a,b){B(a,b),b.gradientMap&&(a.gradientMap.value=b.gradientMap)}function D(a,b){a.roughness.value=b.roughness,a.metalness.value=b.metalness,b.roughnessMap&&(a.roughnessMap.value=b.roughnessMap),b.metalnessMap&&(a.metalnessMap.value=b.metalnessMap),b.emissiveMap&&(a.emissiveMap.value=b.emissiveMap),b.bumpMap&&(a.bumpMap.value=b.bumpMap,a.bumpScale.value=b.bumpScale),b.normalMap&&(a.normalMap.value=b.normalMap,a.normalScale.value.copy(b.normalScale)),b.displacementMap&&(a.displacementMap.value=b.displacementMap,a.displacementScale.value=b.displacementScale,a.displacementBias.value=b.displacementBias),b.envMap&&(a.envMapIntensity.value=b.envMapIntensity)}function E(a,b){a.clearCoat.value=b.clearCoat,a.clearCoatRoughness.value=b.clearCoatRoughness,D(a,b)}function F(a,b){b.displacementMap&&(a.displacementMap.value=b.displacementMap,a.displacementScale.value=b.displacementScale,a.displacementBias.value=b.displacementBias)}function G(a,b){b.displacementMap&&(a.displacementMap.value=b.displacementMap,a.displacementScale.value=b.displacementScale,a.displacementBias.value=b.displacementBias),a.referencePosition.value.copy(b.referencePosition),a.nearDistance.value=b.nearDistance,a.farDistance.value=b.farDistance}function H(a,b){b.bumpMap&&(a.bumpMap.value=b.bumpMap,a.bumpScale.value=b.bumpScale),b.normalMap&&(a.normalMap.value=b.normalMap,a.normalScale.value.copy(b.normalScale)),b.displacementMap&&(a.displacementMap.value=b.displacementMap,a.displacementScale.value=b.displacementScale,a.displacementBias.value=b.displacementBias)}function I(a,b){a.ambientLightColor.needsUpdate=b,a.directionalLights.needsUpdate=b,a.pointLights.needsUpdate=b,a.spotLights.needsUpdate=b,a.rectAreaLights.needsUpdate=b,a.hemisphereLights.needsUpdate=b}function J(){var a=na;return a>=Fa.maxTextures&&console.warn("THREE.WebGLRenderer: Trying to use "+a+" texture units while this GPU supports only "+Fa.maxTextures),na+=1,a}console.log("THREE.WebGLRenderer",zb),a=a||{};var K=void 0!==a.canvas?a.canvas:document.createElementNS("http://www.w3.org/1999/xhtml","canvas"),L=void 0!==a.context?a.context:null,M=void 0!==a.alpha&&a.alpha,N=void 0===a.depth||a.depth,O=void 0===a.stencil||a.stencil,P=void 0!==a.antialias&&a.antialias,Q=void 0===a.premultipliedAlpha||a.premultipliedAlpha,R=void 0!==a.preserveDrawingBuffer&&a.preserveDrawingBuffer,S=void 0!==a.powerPreference?a.powerPreference:"default",U=[],V=[],X=null,Z=[],$=[];this.domElement=K,this.context=null,this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.gammaFactor=2,this.gammaInput=!1,this.gammaOutput=!1,this.physicallyCorrectLights=!1,this.toneMapping=rc,this.toneMappingExposure=1,this.toneMappingWhitePoint=1,this.maxMorphTargets=8,this.maxMorphNormals=4;var _=this,aa=!1,ba=null,ca=null,ga=-1,ha="",ia=null,ja=null,ka=new i,la=new i,ma=null,na=0,oa=K.width,pa=K.height,qa=1,ra=new i(0,0,oa,pa),sa=new i(0,0,oa,pa),ta=!1,ua=new da,va=new sb,wa=!1,xa=!1,ya=new d,za=new f,Aa={geometries:0,textures:0},Ba={frame:0,calls:0,vertices:0,faces:0,points:0};this.info={render:Ba,memory:Aa,programs:null};var Ca;try{var Da={alpha:M,depth:N,stencil:O,antialias:P,premultipliedAlpha:Q,preserveDrawingBuffer:R,powerPreference:S};if(K.addEventListener("webglcontextlost",e,!1),K.addEventListener("webglcontextrestored",g,!1),null===(Ca=L||K.getContext("webgl",Da)||K.getContext("experimental-webgl",Da)))throw null!==K.getContext("webgl")?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.");void 0===Ca.getShaderPrecisionFormat&&(Ca.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(a){console.error("THREE.WebGLRenderer: "+a.message)}var Ea,Fa,Ga,Ha,Ia,Ja,La,Ma,Na,Pa,Ua,Xa,Ya,Za,$a,_a,ab,bb;c();var cb=new qb(_);this.vr=cb;var db=new ea(_,Ma,Fa.maxTextureSize);this.shadowMap=db,this.getContext=function(){return Ca},this.getContextAttributes=function(){return Ca.getContextAttributes()},this.forceContextLoss=function(){var a=Ea.get("WEBGL_lose_context");a&&a.loseContext()},this.forceContextRestore=function(){var a=Ea.get("WEBGL_lose_context");a&&a.restoreContext()},this.getPixelRatio=function(){return qa},this.setPixelRatio=function(a){void 0!==a&&(qa=a,this.setSize(oa,pa,!1))},this.getSize=function(){return{width:oa,height:pa}},this.setSize=function(a,b,c){var d=cb.getDevice();if(d&&d.isPresenting)return void console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");oa=a,pa=b,K.width=a*qa,K.height=b*qa,!1!==c&&(K.style.width=a+"px",K.style.height=b+"px"),this.setViewport(0,0,a,b)},this.getDrawingBufferSize=function(){return{width:oa*qa,height:pa*qa}},this.setDrawingBufferSize=function(a,b,c){oa=a,pa=b,qa=c,K.width=a*c,K.height=b*c,this.setViewport(0,0,a,b)},this.setViewport=function(a,b,c,d){ra.set(a,pa-b-d,c,d),Ga.viewport(ka.copy(ra).multiplyScalar(qa))},this.setScissor=function(a,b,c,d){sa.set(a,pa-b-d,c,d),Ga.scissor(la.copy(sa).multiplyScalar(qa))},this.setScissorTest=function(a){Ga.setScissorTest(ta=a)},this.getClearColor=function(){return Xa.getClearColor()},this.setClearColor=function(){Xa.setClearColor.apply(Xa,arguments)},this.getClearAlpha=function(){return Xa.getClearAlpha()},this.setClearAlpha=function(){Xa.setClearAlpha.apply(Xa,arguments)},this.clear=function(a,b,c){var d=0;(void 0===a||a)&&(d|=Ca.COLOR_BUFFER_BIT),(void 0===b||b)&&(d|=Ca.DEPTH_BUFFER_BIT),(void 0===c||c)&&(d|=Ca.STENCIL_BUFFER_BIT),Ca.clear(d)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.clearTarget=function(a,b,c,d){this.setRenderTarget(a),this.clear(b,c,d)},this.dispose=function(){K.removeEventListener("webglcontextlost",e,!1),K.removeEventListener("webglcontextrestored",g,!1),Ua.dispose(),cb.dispose()},this.renderBufferImmediate=function(a,b,c){Ga.initAttributes();var d=Ha.get(a);a.hasPositions&&!d.position&&(d.position=Ca.createBuffer()),a.hasNormals&&!d.normal&&(d.normal=Ca.createBuffer()),a.hasUvs&&!d.uv&&(d.uv=Ca.createBuffer()),a.hasColors&&!d.color&&(d.color=Ca.createBuffer());var e=b.getAttributes();if(a.hasPositions&&(Ca.bindBuffer(Ca.ARRAY_BUFFER,d.position),Ca.bufferData(Ca.ARRAY_BUFFER,a.positionArray,Ca.DYNAMIC_DRAW),Ga.enableAttribute(e.position),Ca.vertexAttribPointer(e.position,3,Ca.FLOAT,!1,0,0)),a.hasNormals){if(Ca.bindBuffer(Ca.ARRAY_BUFFER,d.normal),!c.isMeshPhongMaterial&&!c.isMeshStandardMaterial&&!c.isMeshNormalMaterial&&!0===c.flatShading)for(var f=0,g=3*a.count;f<g;f+=9){var h=a.normalArray,i=(h[f+0]+h[f+3]+h[f+6])/3,j=(h[f+1]+h[f+4]+h[f+7])/3,k=(h[f+2]+h[f+5]+h[f+8])/3;h[f+0]=i,h[f+1]=j,h[f+2]=k,h[f+3]=i,h[f+4]=j,h[f+5]=k,h[f+6]=i,h[f+7]=j,h[f+8]=k}Ca.bufferData(Ca.ARRAY_BUFFER,a.normalArray,Ca.DYNAMIC_DRAW),Ga.enableAttribute(e.normal),Ca.vertexAttribPointer(e.normal,3,Ca.FLOAT,!1,0,0)}a.hasUvs&&c.map&&(Ca.bindBuffer(Ca.ARRAY_BUFFER,d.uv),Ca.bufferData(Ca.ARRAY_BUFFER,a.uvArray,Ca.DYNAMIC_DRAW),Ga.enableAttribute(e.uv),Ca.vertexAttribPointer(e.uv,2,Ca.FLOAT,!1,0,0)),a.hasColors&&c.vertexColors!==Kb&&(Ca.bindBuffer(Ca.ARRAY_BUFFER,d.color),Ca.bufferData(Ca.ARRAY_BUFFER,a.colorArray,Ca.DYNAMIC_DRAW),Ga.enableAttribute(e.color),Ca.vertexAttribPointer(e.color,3,Ca.FLOAT,!1,0,0)),Ga.disableUnusedAttributes(),Ca.drawArrays(Ca.TRIANGLES,0,a.count),a.count=0},this.renderBufferDirect=function(a,c,d,e,f,g){var h=f.isMesh&&f.matrixWorld.determinant()<0;Ga.setMaterial(e,h);var i=u(a,c,e,f),j=d.id+"_"+i.id+"_"+(!0===e.wireframe),k=!1;j!==ha&&(ha=j,k=!0),f.morphTargetInfluences&&(Ya.update(f,d,e,i),k=!0);var l=d.index,m=d.attributes.position,o=1;!0===e.wireframe&&(l=La.getWireframeAttribute(d),o=2);var p,q=Za;null!==l&&(p=Ja.get(l),q=$a,q.setIndex(p)),k&&(n(e,i,d),null!==l&&Ca.bindBuffer(Ca.ELEMENT_ARRAY_BUFFER,p.buffer));var r=0;null!==l?r=l.count:void 0!==m&&(r=m.count);var s=d.drawRange.start*o,t=d.drawRange.count*o,v=null!==g?g.start*o:0,w=null!==g?g.count*o:1/0,x=Math.max(s,v),y=Math.min(r,s+t,v+w)-1,z=Math.max(0,y-x+1);if(0!==z){if(f.isMesh)if(!0===e.wireframe)Ga.setLineWidth(e.wireframeLinewidth*b()),q.setMode(Ca.LINES);else switch(f.drawMode){case md:q.setMode(Ca.TRIANGLES);break;case nd:q.setMode(Ca.TRIANGLE_STRIP);break;case od:q.setMode(Ca.TRIANGLE_FAN)}else if(f.isLine){var A=e.linewidth;void 0===A&&(A=1),Ga.setLineWidth(A*b()),f.isLineSegments?q.setMode(Ca.LINES):f.isLineLoop?q.setMode(Ca.LINE_LOOP):q.setMode(Ca.LINE_STRIP)}else f.isPoints&&q.setMode(Ca.POINTS);d&&d.isInstancedBufferGeometry?d.maxInstancedCount>0&&q.renderInstances(d,x,z):q.render(x,z)}},this.compile=function(a,b){U.length=0,V.length=0,a.traverse(function(a){a.isLight&&(U.push(a),a.castShadow&&V.push(a))}),Na.setup(U,V,b),a.traverse(function(b){if(b.material)if(Array.isArray(b.material))for(var c=0;c<b.material.length;c++)t(b.material[c],a.fog,b);else t(b.material,a.fog,b)})};var eb=!1,fb=null;this.animate=function(a){fb=a,o()},this.render=function(a,b,c,d){if(!b||!b.isCamera)return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(!aa){ha="",ga=-1,ia=null,!0===a.autoUpdate&&a.updateMatrixWorld(),null===b.parent&&b.updateMatrixWorld(),cb.enabled&&(b=cb.getCamera(b)),ya.multiplyMatrices(b.projectionMatrix,b.matrixWorldInverse),ua.setFromMatrix(ya),U.length=0,V.length=0,Z.length=0,$.length=0,xa=this.localClippingEnabled,wa=va.init(this.clippingPlanes,xa,b),X=Ua.get(a,b),X.init(),q(a,b,_.sortObjects),!0===_.sortObjects&&X.sort(),Ia.updateVideoTextures(),wa&&va.beginShadows(),db.render(V,a,b),Na.setup(U,V,b),wa&&va.endShadows(),Ba.frame++,Ba.calls=0,Ba.vertices=0,Ba.faces=0,Ba.points=0,void 0===c&&(c=null),this.setRenderTarget(c),Xa.render(X,a,b,d);var e=X.opaque,f=X.transparent;if(a.overrideMaterial){var g=a.overrideMaterial;e.length&&r(e,a,b,g),f.length&&r(f,a,b,g)}else e.length&&r(e,a,b),f.length&&r(f,a,b);ab.render(Z,a,b),_a.render($,a,b,ka),c&&Ia.updateRenderTargetMipmap(c),Ga.buffers.depth.setTest(!0),Ga.buffers.depth.setMask(!0),Ga.buffers.color.setMask(!0),Ga.setPolygonOffset(!1),cb.enabled&&cb.submitFrame()}},this.setFaceCulling=function(a,b){Ga.setCullFace(a),Ga.setFlipSided(b===Db)},this.allocTextureUnit=J,this.setTexture2D=function(){var a=!1;return function(b,c){b&&b.isWebGLRenderTarget&&(a||(console.warn("THREE.WebGLRenderer.setTexture2D: don't use render targets as textures. Use their .texture property instead."),a=!0),b=b.texture),Ia.setTexture2D(b,c)}}(),this.setTexture=function(){var a=!1;return function(b,c){a||(console.warn("THREE.WebGLRenderer: .setTexture is deprecated, use setTexture2D instead."),a=!0),Ia.setTexture2D(b,c)}}(),this.setTextureCube=function(){var a=!1;return function(b,c){b&&b.isWebGLRenderTargetCube&&(a||(console.warn("THREE.WebGLRenderer.setTextureCube: don't use cube render targets as textures. Use their .texture property instead."),a=!0),b=b.texture),b&&b.isCubeTexture||Array.isArray(b.image)&&6===b.image.length?Ia.setTextureCube(b,c):Ia.setTextureCubeDynamic(b,c)}}(),this.getRenderTarget=function(){return ba},this.setRenderTarget=function(a){ba=a,a&&void 0===Ha.get(a).__webglFramebuffer&&Ia.setupRenderTarget(a);var b=null,c=!1;if(a){var d=Ha.get(a).__webglFramebuffer;a.isWebGLRenderTargetCube?(b=d[a.activeCubeFace],c=!0):b=d,ka.copy(a.viewport),la.copy(a.scissor),ma=a.scissorTest}else ka.copy(ra).multiplyScalar(qa),la.copy(sa).multiplyScalar(qa),ma=ta;if(ca!==b&&(Ca.bindFramebuffer(Ca.FRAMEBUFFER,b),ca=b),Ga.viewport(ka),Ga.scissor(la),Ga.setScissorTest(ma),c){var e=Ha.get(a.texture);Ca.framebufferTexture2D(Ca.FRAMEBUFFER,Ca.COLOR_ATTACHMENT0,Ca.TEXTURE_CUBE_MAP_POSITIVE_X+a.activeCubeFace,e.__webglTexture,a.activeMipMapLevel)}},this.readRenderTargetPixels=function(a,b,c,d,e,f){if(!a||!a.isWebGLRenderTarget)return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");var g=Ha.get(a).__webglFramebuffer;if(g){var h=!1;g!==ca&&(Ca.bindFramebuffer(Ca.FRAMEBUFFER,g),h=!0);try{var i=a.texture,j=i.format,k=i.type;if(j!==$c&&bb.convert(j)!==Ca.getParameter(Ca.IMPLEMENTATION_COLOR_READ_FORMAT))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");if(!(k===Mc||bb.convert(k)===Ca.getParameter(Ca.IMPLEMENTATION_COLOR_READ_TYPE)||k===Sc&&(Ea.get("OES_texture_float")||Ea.get("WEBGL_color_buffer_float"))||k===Tc&&Ea.get("EXT_color_buffer_half_float")))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");Ca.checkFramebufferStatus(Ca.FRAMEBUFFER)===Ca.FRAMEBUFFER_COMPLETE?b>=0&&b<=a.width-d&&c>=0&&c<=a.height-e&&Ca.readPixels(b,c,d,e,bb.convert(j),bb.convert(k),f):console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.")}finally{h&&Ca.bindFramebuffer(Ca.FRAMEBUFFER,ca)}}}}function vb(){ia.call(this),this.type="Scene",this.background=null,this.fog=null,this.overrideMaterial=null,this.autoUpdate=!0}function wb(a,b,c){var d=this,e=!1,f=0,g=0,h=void 0;this.onStart=void 0,this.onLoad=a,this.onProgress=b,this.onError=c,this.itemStart=function(a){g++,!1===e&&void 0!==d.onStart&&d.onStart(a,f,g),e=!0},this.itemEnd=function(a){f++,void 0!==d.onProgress&&d.onProgress(a,f,g),f===g&&(e=!1,void 0!==d.onLoad&&d.onLoad())},this.itemError=function(a){void 0!==d.onError&&d.onError(a)},this.resolveURL=function(a){return h?h(a):a},this.setURLModifier=function(a){return h=a,this}}function xb(a){this.manager=void 0!==a?a:Uf}function yb(a){this.manager=void 0!==a?a:Uf}void 0===Number.EPSILON&&(Number.EPSILON=Math.pow(2,-52)),void 0===Number.isInteger&&(Number.isInteger=function(a){return"number"==typeof a&&isFinite(a)&&Math.floor(a)===a}),void 0===Math.sign&&(Math.sign=function(a){return a<0?-1:a>0?1:+a}),"name"in Function.prototype==!1&&Object.defineProperty(Function.prototype,"name",{get:function(){return this.toString().match(/^\s*function\s*([^\(\s]*)/)[1]}}),void 0===Object.assign&&function(){Object.assign=function(a){if(void 0===a||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var d=arguments[c];if(void 0!==d&&null!==d)for(var e in d)Object.prototype.hasOwnProperty.call(d,e)&&(b[e]=d[e])}return b}}(),Object.assign(b.prototype,{addEventListener:function(a,b){void 0===this._listeners&&(this._listeners={});var c=this._listeners;void 0===c[a]&&(c[a]=[]),-1===c[a].indexOf(b)&&c[a].push(b)},hasEventListener:function(a,b){if(void 0===this._listeners)return!1;var c=this._listeners;return void 0!==c[a]&&-1!==c[a].indexOf(b)},removeEventListener:function(a,b){if(void 0!==this._listeners){var c=this._listeners,d=c[a];if(void 0!==d){var e=d.indexOf(b);-1!==e&&d.splice(e,1)}}},dispatchEvent:function(a){if(void 0!==this._listeners){var b=this._listeners,c=b[a.type];if(void 0!==c){a.target=this;for(var d=c.slice(0),e=0,f=d.length;e<f;e++)d[e].call(this,a)}}}});var zb="89",Ab=0,Bb=1,Cb=2,Db=0,Eb=1,Fb=2,Gb=0,Hb=1,Ib=2,Jb=1,Kb=0,Lb=0,Mb=1,Nb=2,Ob=3,Pb=4,Qb=5,Rb=100,Sb=101,Tb=102,Ub=103,Vb=104,Wb=200,Xb=201,Yb=202,Zb=203,$b=204,_b=205,ac=206,bc=207,cc=208,dc=209,ec=210,fc=0,gc=1,hc=2,ic=3,jc=4,kc=5,lc=6,mc=7,nc=0,oc=1,pc=2,qc=0,rc=1,sc=2,tc=3,uc=4,vc=300,wc=301,xc=302,yc=303,zc=304,Ac=305,Bc=306,Cc=307,Dc=1e3,Ec=1001,Fc=1002,Gc=1003,Hc=1004,Ic=1005,Jc=1006,Kc=1007,Lc=1008,Mc=1009,Nc=1010,Oc=1011,Pc=1012,Qc=1013,Rc=1014,Sc=1015,Tc=1016,Uc=1017,Vc=1018,Wc=1019,Xc=1020,Yc=1021,Zc=1022,$c=1023,_c=1024,ad=1025,bd=1026,cd=1027,dd=2001,ed=2002,fd=2003,gd=2004,hd=2100,id=2101,jd=2102,kd=2103,ld=2151,md=0,nd=1,od=2,pd=3e3,qd=3001,rd=3007,sd=3002,td=3004,ud=3005,vd=3006,wd=3200,xd=3201,yd={DEG2RAD:Math.PI/180,RAD2DEG:180/Math.PI,generateUUID:function(){for(var a=[],b=0;b<256;b++)a[b]=(b<16?"0":"")+b.toString(16).toUpperCase();return function(){var b=4294967295*Math.random()|0,c=4294967295*Math.random()|0,d=4294967295*Math.random()|0,e=4294967295*Math.random()|0;return a[255&b]+a[b>>8&255]+a[b>>16&255]+a[b>>24&255]+"-"+a[255&c]+a[c>>8&255]+"-"+a[c>>16&15|64]+a[c>>24&255]+"-"+a[63&d|128]+a[d>>8&255]+"-"+a[d>>16&255]+a[d>>24&255]+a[255&e]+a[e>>8&255]+a[e>>16&255]+a[e>>24&255]}}(),clamp:function(a,b,c){return Math.max(b,Math.min(c,a))},euclideanModulo:function(a,b){return(a%b+b)%b},mapLinear:function(a,b,c,d,e){return d+(a-b)*(e-d)/(c-b)},lerp:function(a,b,c){return(1-c)*a+c*b},smoothstep:function(a,b,c){return a<=b?0:a>=c?1:(a=(a-b)/(c-b))*a*(3-2*a)},smootherstep:function(a,b,c){return a<=b?0:a>=c?1:(a=(a-b)/(c-b))*a*a*(a*(6*a-15)+10)},randInt:function(a,b){return a+Math.floor(Math.random()*(b-a+1))},randFloat:function(a,b){return a+Math.random()*(b-a)},randFloatSpread:function(a){return a*(.5-Math.random())},degToRad:function(a){return a*yd.DEG2RAD},radToDeg:function(a){return a*yd.RAD2DEG},isPowerOfTwo:function(a){return 0==(a&a-1)&&0!==a},ceilPowerOfTwo:function(a){return Math.pow(2,Math.ceil(Math.log(a)/Math.LN2))},floorPowerOfTwo:function(a){return Math.pow(2,Math.floor(Math.log(a)/Math.LN2))}};Object.defineProperties(c.prototype,{width:{get:function(){return this.x},set:function(a){this.x=a}},height:{get:function(){return this.y},set:function(a){this.y=a}}}),Object.assign(c.prototype,{isVector2:!0,set:function(a,b){return this.x=a,this.y=b,this},setScalar:function(a){return this.x=a,this.y=a,this},setX:function(a){return this.x=a,this},setY:function(a){return this.y=a,this},setComponent:function(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;default:throw new Error("index is out of range: "+a)}return this},getComponent:function(a){switch(a){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+a)}},clone:function(){return new this.constructor(this.x,this.y)},copy:function(a){return this.x=a.x,this.y=a.y,this},add:function(a,b){return void 0!==b?(console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b)):(this.x+=a.x,this.y+=a.y,this)},addScalar:function(a){return this.x+=a,this.y+=a,this},addVectors:function(a,b){return this.x=a.x+b.x,this.y=a.y+b.y,this},addScaledVector:function(a,b){return this.x+=a.x*b,this.y+=a.y*b,this},sub:function(a,b){return void 0!==b?(console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b)):(this.x-=a.x,this.y-=a.y,this)},subScalar:function(a){return this.x-=a,this.y-=a,this},subVectors:function(a,b){return this.x=a.x-b.x,this.y=a.y-b.y,this},multiply:function(a){return this.x*=a.x,this.y*=a.y,this},multiplyScalar:function(a){return this.x*=a,this.y*=a,this},divide:function(a){return this.x/=a.x,this.y/=a.y,this},divideScalar:function(a){return this.multiplyScalar(1/a)},applyMatrix3:function(a){var b=this.x,c=this.y,d=a.elements;return this.x=d[0]*b+d[3]*c+d[6],this.y=d[1]*b+d[4]*c+d[7],this},min:function(a){return this.x=Math.min(this.x,a.x),this.y=Math.min(this.y,a.y),this},max:function(a){return this.x=Math.max(this.x,a.x),this.y=Math.max(this.y,a.y),this},clamp:function(a,b){return this.x=Math.max(a.x,Math.min(b.x,this.x)),this.y=Math.max(a.y,Math.min(b.y,this.y)),this},clampScalar:function(){var a=new c,b=new c;return function(c,d){return a.set(c,c),b.set(d,d),this.clamp(a,b)}}(),clampLength:function(a,b){var c=this.length();return this.divideScalar(c||1).multiplyScalar(Math.max(a,Math.min(b,c)))},floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},roundToZero:function(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this},negate:function(){return this.x=-this.x,this.y=-this.y,this},dot:function(a){return this.x*a.x+this.y*a.y},lengthSq:function(){return this.x*this.x+this.y*this.y},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},manhattanLength:function(){return Math.abs(this.x)+Math.abs(this.y)},normalize:function(){return this.divideScalar(this.length()||1)},angle:function(){var a=Math.atan2(this.y,this.x);return a<0&&(a+=2*Math.PI),a},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){var b=this.x-a.x,c=this.y-a.y;return b*b+c*c},manhattanDistanceTo:function(a){return Math.abs(this.x-a.x)+Math.abs(this.y-a.y)},setLength:function(a){return this.normalize().multiplyScalar(a)},lerp:function(a,b){return this.x+=(a.x-this.x)*b,this.y+=(a.y-this.y)*b,this},lerpVectors:function(a,b,c){return this.subVectors(b,a).multiplyScalar(c).add(a)},equals:function(a){return a.x===this.x&&a.y===this.y},fromArray:function(a,b){return void 0===b&&(b=0),this.x=a[b],this.y=a[b+1],this},toArray:function(a,b){return void 0===a&&(a=[]),void 0===b&&(b=0),a[b]=this.x,a[b+1]=this.y,a},fromBufferAttribute:function(a,b,c){return void 0!==c&&console.warn("THREE.Vector2: offset has been removed from .fromBufferAttribute()."),this.x=a.getX(b),this.y=a.getY(b),this},rotateAround:function(a,b){var c=Math.cos(b),d=Math.sin(b),e=this.x-a.x,f=this.y-a.y;return this.x=e*c-f*d+a.x,this.y=e*d+f*c+a.y,this}}),Object.assign(d.prototype,{isMatrix4:!0,set:function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){var q=this.elements;return q[0]=a,q[4]=b,q[8]=c,q[12]=d,q[1]=e,q[5]=f,q[9]=g,q[13]=h,q[2]=i,q[6]=j,q[10]=k,q[14]=l,q[3]=m,q[7]=n,q[11]=o,q[15]=p,this},identity:function(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this},clone:function(){return(new d).fromArray(this.elements)},copy:function(a){var b=this.elements,c=a.elements;return b[0]=c[0],b[1]=c[1],b[2]=c[2],b[3]=c[3],b[4]=c[4],b[5]=c[5],b[6]=c[6],b[7]=c[7],b[8]=c[8],b[9]=c[9],b[10]=c[10],b[11]=c[11],b[12]=c[12],b[13]=c[13],b[14]=c[14],b[15]=c[15],this},copyPosition:function(a){var b=this.elements,c=a.elements;return b[12]=c[12],b[13]=c[13],b[14]=c[14],this},extractBasis:function(a,b,c){return a.setFromMatrixColumn(this,0),b.setFromMatrixColumn(this,1),c.setFromMatrixColumn(this,2),this},makeBasis:function(a,b,c){return this.set(a.x,b.x,c.x,0,a.y,b.y,c.y,0,a.z,b.z,c.z,0,0,0,0,1),this},extractRotation:function(){var a=new f;return function(b){var c=this.elements,d=b.elements,e=1/a.setFromMatrixColumn(b,0).length(),f=1/a.setFromMatrixColumn(b,1).length(),g=1/a.setFromMatrixColumn(b,2).length();return c[0]=d[0]*e,c[1]=d[1]*e,c[2]=d[2]*e,c[4]=d[4]*f,c[5]=d[5]*f,c[6]=d[6]*f,c[8]=d[8]*g,c[9]=d[9]*g,c[10]=d[10]*g,this}}(),makeRotationFromEuler:function(a){a&&a.isEuler||console.error("THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");var b=this.elements,c=a.x,d=a.y,e=a.z,f=Math.cos(c),g=Math.sin(c),h=Math.cos(d),i=Math.sin(d),j=Math.cos(e),k=Math.sin(e);if("XYZ"===a.order){var l=f*j,m=f*k,n=g*j,o=g*k;b[0]=h*j,b[4]=-h*k,b[8]=i,b[1]=m+n*i,b[5]=l-o*i,b[9]=-g*h,b[2]=o-l*i,b[6]=n+m*i,b[10]=f*h}else if("YXZ"===a.order){var p=h*j,q=h*k,r=i*j,s=i*k;b[0]=p+s*g,b[4]=r*g-q,b[8]=f*i,b[1]=f*k,b[5]=f*j,b[9]=-g,b[2]=q*g-r,b[6]=s+p*g,b[10]=f*h}else if("ZXY"===a.order){var p=h*j,q=h*k,r=i*j,s=i*k;b[0]=p-s*g,b[4]=-f*k,b[8]=r+q*g,b[1]=q+r*g,b[5]=f*j,b[9]=s-p*g,b[2]=-f*i,b[6]=g,b[10]=f*h}else if("ZYX"===a.order){var l=f*j,m=f*k,n=g*j,o=g*k;b[0]=h*j,b[4]=n*i-m,b[8]=l*i+o,b[1]=h*k,b[5]=o*i+l,b[9]=m*i-n,b[2]=-i,b[6]=g*h,b[10]=f*h}else if("YZX"===a.order){var t=f*h,u=f*i,v=g*h,w=g*i;b[0]=h*j,b[4]=w-t*k,b[8]=v*k+u,b[1]=k,b[5]=f*j,b[9]=-g*j,b[2]=-i*j,b[6]=u*k+v,b[10]=t-w*k}else if("XZY"===a.order){var t=f*h,u=f*i,v=g*h,w=g*i;b[0]=h*j,b[4]=-k,b[8]=i*j,b[1]=t*k+w,b[5]=f*j,b[9]=u*k-v,b[2]=v*k-u,b[6]=g*j,b[10]=w*k+t}return b[3]=0,b[7]=0,b[11]=0,b[12]=0,b[13]=0,b[14]=0,b[15]=1,this},makeRotationFromQuaternion:function(a){var b=this.elements,c=a._x,d=a._y,e=a._z,f=a._w,g=c+c,h=d+d,i=e+e,j=c*g,k=c*h,l=c*i,m=d*h,n=d*i,o=e*i,p=f*g,q=f*h,r=f*i;return b[0]=1-(m+o),b[4]=k-r,b[8]=l+q,b[1]=k+r,b[5]=1-(j+o),b[9]=n-p,b[2]=l-q,b[6]=n+p,b[10]=1-(j+m),b[3]=0,b[7]=0,b[11]=0,b[12]=0,b[13]=0,b[14]=0,b[15]=1,this},lookAt:function(){var a=new f,b=new f,c=new f;return function(d,e,f){var g=this.elements;return c.subVectors(d,e),0===c.lengthSq()&&(c.z=1),c.normalize(),a.crossVectors(f,c),0===a.lengthSq()&&(1===Math.abs(f.z)?c.x+=1e-4:c.z+=1e-4,c.normalize(),a.crossVectors(f,c)),a.normalize(),b.crossVectors(c,a),g[0]=a.x,g[4]=b.x,g[8]=c.x,g[1]=a.y,g[5]=b.y,g[9]=c.y,g[2]=a.z,g[6]=b.z,g[10]=c.z,this}}(),multiply:function(a,b){return void 0!==b?(console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."),this.multiplyMatrices(a,b)):this.multiplyMatrices(this,a)},premultiply:function(a){return this.multiplyMatrices(a,this)},multiplyMatrices:function(a,b){var c=a.elements,d=b.elements,e=this.elements,f=c[0],g=c[4],h=c[8],i=c[12],j=c[1],k=c[5],l=c[9],m=c[13],n=c[2],o=c[6],p=c[10],q=c[14],r=c[3],s=c[7],t=c[11],u=c[15],v=d[0],w=d[4],x=d[8],y=d[12],z=d[1],A=d[5],B=d[9],C=d[13],D=d[2],E=d[6],F=d[10],G=d[14],H=d[3],I=d[7],J=d[11],K=d[15];return e[0]=f*v+g*z+h*D+i*H,e[4]=f*w+g*A+h*E+i*I,e[8]=f*x+g*B+h*F+i*J,e[12]=f*y+g*C+h*G+i*K,e[1]=j*v+k*z+l*D+m*H,e[5]=j*w+k*A+l*E+m*I,e[9]=j*x+k*B+l*F+m*J,e[13]=j*y+k*C+l*G+m*K,e[2]=n*v+o*z+p*D+q*H,e[6]=n*w+o*A+p*E+q*I,e[10]=n*x+o*B+p*F+q*J,e[14]=n*y+o*C+p*G+q*K,e[3]=r*v+s*z+t*D+u*H,e[7]=r*w+s*A+t*E+u*I,e[11]=r*x+s*B+t*F+u*J,e[15]=r*y+s*C+t*G+u*K,this},multiplyScalar:function(a){var b=this.elements;return b[0]*=a,b[4]*=a,b[8]*=a,b[12]*=a,b[1]*=a,b[5]*=a,b[9]*=a,b[13]*=a,b[2]*=a,b[6]*=a,b[10]*=a,b[14]*=a,b[3]*=a,b[7]*=a,b[11]*=a,b[15]*=a,this},applyToBufferAttribute:function(){var a=new f;return function(b){for(var c=0,d=b.count;c<d;c++)a.x=b.getX(c),a.y=b.getY(c),a.z=b.getZ(c),a.applyMatrix4(this),b.setXYZ(c,a.x,a.y,a.z);return b}}(),determinant:function(){var a=this.elements,b=a[0],c=a[4],d=a[8],e=a[12],f=a[1],g=a[5],h=a[9],i=a[13],j=a[2],k=a[6],l=a[10],m=a[14];return a[3]*(+e*h*k-d*i*k-e*g*l+c*i*l+d*g*m-c*h*m)+a[7]*(+b*h*m-b*i*l+e*f*l-d*f*m+d*i*j-e*h*j)+a[11]*(+b*i*k-b*g*m-e*f*k+c*f*m+e*g*j-c*i*j)+a[15]*(-d*g*j-b*h*k+b*g*l+d*f*k-c*f*l+c*h*j)},transpose:function(){var a,b=this.elements;return a=b[1],b[1]=b[4],b[4]=a,a=b[2],b[2]=b[8],b[8]=a,a=b[6],b[6]=b[9],b[9]=a,a=b[3],b[3]=b[12],b[12]=a,a=b[7],b[7]=b[13],b[13]=a,a=b[11],b[11]=b[14],b[14]=a,this},setPosition:function(a){var b=this.elements;return b[12]=a.x,b[13]=a.y,b[14]=a.z,this},getInverse:function(a,b){var c=this.elements,d=a.elements,e=d[0],f=d[1],g=d[2],h=d[3],i=d[4],j=d[5],k=d[6],l=d[7],m=d[8],n=d[9],o=d[10],p=d[11],q=d[12],r=d[13],s=d[14],t=d[15],u=n*s*l-r*o*l+r*k*p-j*s*p-n*k*t+j*o*t,v=q*o*l-m*s*l-q*k*p+i*s*p+m*k*t-i*o*t,w=m*r*l-q*n*l+q*j*p-i*r*p-m*j*t+i*n*t,x=q*n*k-m*r*k-q*j*o+i*r*o+m*j*s-i*n*s,y=e*u+f*v+g*w+h*x;if(0===y){var z="THREE.Matrix4: .getInverse() can't invert matrix, determinant is 0";if(!0===b)throw new Error(z);return console.warn(z),this.identity()}var A=1/y;return c[0]=u*A,c[1]=(r*o*h-n*s*h-r*g*p+f*s*p+n*g*t-f*o*t)*A,c[2]=(j*s*h-r*k*h+r*g*l-f*s*l-j*g*t+f*k*t)*A,c[3]=(n*k*h-j*o*h-n*g*l+f*o*l+j*g*p-f*k*p)*A,c[4]=v*A,c[5]=(m*s*h-q*o*h+q*g*p-e*s*p-m*g*t+e*o*t)*A,c[6]=(q*k*h-i*s*h-q*g*l+e*s*l+i*g*t-e*k*t)*A,c[7]=(i*o*h-m*k*h+m*g*l-e*o*l-i*g*p+e*k*p)*A,c[8]=w*A,c[9]=(q*n*h-m*r*h-q*f*p+e*r*p+m*f*t-e*n*t)*A,c[10]=(i*r*h-q*j*h+q*f*l-e*r*l-i*f*t+e*j*t)*A,c[11]=(m*j*h-i*n*h-m*f*l+e*n*l+i*f*p-e*j*p)*A,c[12]=x*A,c[13]=(m*r*g-q*n*g+q*f*o-e*r*o-m*f*s+e*n*s)*A,c[14]=(q*j*g-i*r*g-q*f*k+e*r*k+i*f*s-e*j*s)*A,c[15]=(i*n*g-m*j*g+m*f*k-e*n*k-i*f*o+e*j*o)*A,this},scale:function(a){var b=this.elements,c=a.x,d=a.y,e=a.z;return b[0]*=c,b[4]*=d,b[8]*=e,b[1]*=c,b[5]*=d,b[9]*=e,b[2]*=c,b[6]*=d,b[10]*=e,b[3]*=c,b[7]*=d,b[11]*=e,this},getMaxScaleOnAxis:function(){var a=this.elements,b=a[0]*a[0]+a[1]*a[1]+a[2]*a[2],c=a[4]*a[4]+a[5]*a[5]+a[6]*a[6],d=a[8]*a[8]+a[9]*a[9]+a[10]*a[10];return Math.sqrt(Math.max(b,c,d))},makeTranslation:function(a,b,c){return this.set(1,0,0,a,0,1,0,b,0,0,1,c,0,0,0,1),this},makeRotationX:function(a){var b=Math.cos(a),c=Math.sin(a);return this.set(1,0,0,0,0,b,-c,0,0,c,b,0,0,0,0,1),this},makeRotationY:function(a){var b=Math.cos(a),c=Math.sin(a);return this.set(b,0,c,0,0,1,0,0,-c,0,b,0,0,0,0,1),this},makeRotationZ:function(a){var b=Math.cos(a),c=Math.sin(a);return this.set(b,-c,0,0,c,b,0,0,0,0,1,0,0,0,0,1),this},makeRotationAxis:function(a,b){var c=Math.cos(b),d=Math.sin(b),e=1-c,f=a.x,g=a.y,h=a.z,i=e*f,j=e*g;return this.set(i*f+c,i*g-d*h,i*h+d*g,0,i*g+d*h,j*g+c,j*h-d*f,0,i*h-d*g,j*h+d*f,e*h*h+c,0,0,0,0,1),this},makeScale:function(a,b,c){return this.set(a,0,0,0,0,b,0,0,0,0,c,0,0,0,0,1),this},makeShear:function(a,b,c){return this.set(1,b,c,0,a,1,c,0,a,b,1,0,0,0,0,1),this},compose:function(a,b,c){return this.makeRotationFromQuaternion(b),this.scale(c),this.setPosition(a),this},decompose:function(){var a=new f,b=new d;return function(c,d,e){var f=this.elements,g=a.set(f[0],f[1],f[2]).length(),h=a.set(f[4],f[5],f[6]).length(),i=a.set(f[8],f[9],f[10]).length();this.determinant()<0&&(g=-g),c.x=f[12],c.y=f[13],c.z=f[14],b.copy(this);var j=1/g,k=1/h,l=1/i;return b.elements[0]*=j,b.elements[1]*=j,b.elements[2]*=j,b.elements[4]*=k,b.elements[5]*=k,b.elements[6]*=k,b.elements[8]*=l,b.elements[9]*=l,b.elements[10]*=l,d.setFromRotationMatrix(b),e.x=g,e.y=h,e.z=i,this}}(),makePerspective:function(a,b,c,d,e,f){void 0===f&&console.warn("THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.");var g=this.elements,h=2*e/(b-a),i=2*e/(c-d),j=(b+a)/(b-a),k=(c+d)/(c-d),l=-(f+e)/(f-e),m=-2*f*e/(f-e);return g[0]=h,g[4]=0,g[8]=j,g[12]=0,g[1]=0,g[5]=i,g[9]=k,g[13]=0,g[2]=0,g[6]=0,g[10]=l,g[14]=m,g[3]=0,g[7]=0,g[11]=-1,g[15]=0,this},makeOrthographic:function(a,b,c,d,e,f){var g=this.elements,h=1/(b-a),i=1/(c-d),j=1/(f-e),k=(b+a)*h,l=(c+d)*i,m=(f+e)*j;return g[0]=2*h,g[4]=0,g[8]=0,g[12]=-k,g[1]=0,g[5]=2*i,g[9]=0,g[13]=-l,g[2]=0,g[6]=0,g[10]=-2*j,g[14]=-m,g[3]=0,g[7]=0,g[11]=0,g[15]=1,this},equals:function(a){for(var b=this.elements,c=a.elements,d=0;d<16;d++)if(b[d]!==c[d])return!1;return!0},fromArray:function(a,b){void 0===b&&(b=0);for(var c=0;c<16;c++)this.elements[c]=a[c+b];return this},toArray:function(a,b){void 0===a&&(a=[]),void 0===b&&(b=0);var c=this.elements;return a[b]=c[0],a[b+1]=c[1],a[b+2]=c[2],a[b+3]=c[3],a[b+4]=c[4],a[b+5]=c[5],a[b+6]=c[6],a[b+7]=c[7],a[b+8]=c[8],a[b+9]=c[9],a[b+10]=c[10],a[b+11]=c[11],a[b+12]=c[12],a[b+13]=c[13],a[b+14]=c[14],a[b+15]=c[15],a}}),Object.assign(e,{slerp:function(a,b,c,d){return c.copy(a).slerp(b,d)},slerpFlat:function(a,b,c,d,e,f,g){var h=c[d+0],i=c[d+1],j=c[d+2],k=c[d+3],l=e[f+0],m=e[f+1],n=e[f+2],o=e[f+3];if(k!==o||h!==l||i!==m||j!==n){var p=1-g,q=h*l+i*m+j*n+k*o,r=q>=0?1:-1,s=1-q*q;if(s>Number.EPSILON){var t=Math.sqrt(s),u=Math.atan2(t,q*r);p=Math.sin(p*u)/t,g=Math.sin(g*u)/t}var v=g*r;if(h=h*p+l*v,i=i*p+m*v,j=j*p+n*v,k=k*p+o*v,p===1-g){var w=1/Math.sqrt(h*h+i*i+j*j+k*k);h*=w,i*=w,j*=w,k*=w}}a[b]=h,a[b+1]=i,a[b+2]=j,a[b+3]=k}}),Object.defineProperties(e.prototype,{x:{get:function(){return this._x},set:function(a){this._x=a,this.onChangeCallback()}},y:{get:function(){return this._y},set:function(a){this._y=a,this.onChangeCallback()}},z:{get:function(){return this._z},set:function(a){this._z=a,this.onChangeCallback()}},w:{get:function(){return this._w},set:function(a){this._w=a,this.onChangeCallback()}}}),Object.assign(e.prototype,{set:function(a,b,c,d){return this._x=a,this._y=b,this._z=c,this._w=d,this.onChangeCallback(),this},clone:function(){return new this.constructor(this._x,this._y,this._z,this._w)},copy:function(a){return this._x=a.x,this._y=a.y,this._z=a.z,this._w=a.w,this.onChangeCallback(),this},setFromEuler:function(a,b){if(!a||!a.isEuler)throw new Error("THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.");var c=a._x,d=a._y,e=a._z,f=a.order,g=Math.cos,h=Math.sin,i=g(c/2),j=g(d/2),k=g(e/2),l=h(c/2),m=h(d/2),n=h(e/2);return"XYZ"===f?(this._x=l*j*k+i*m*n,this._y=i*m*k-l*j*n,this._z=i*j*n+l*m*k,this._w=i*j*k-l*m*n):"YXZ"===f?(this._x=l*j*k+i*m*n,this._y=i*m*k-l*j*n,this._z=i*j*n-l*m*k,this._w=i*j*k+l*m*n):"ZXY"===f?(this._x=l*j*k-i*m*n,this._y=i*m*k+l*j*n,this._z=i*j*n+l*m*k,this._w=i*j*k-l*m*n):"ZYX"===f?(this._x=l*j*k-i*m*n,this._y=i*m*k+l*j*n,this._z=i*j*n-l*m*k,this._w=i*j*k+l*m*n):"YZX"===f?(this._x=l*j*k+i*m*n,this._y=i*m*k+l*j*n,this._z=i*j*n-l*m*k,this._w=i*j*k-l*m*n):"XZY"===f&&(this._x=l*j*k-i*m*n,this._y=i*m*k-l*j*n,this._z=i*j*n+l*m*k,this._w=i*j*k+l*m*n),!1!==b&&this.onChangeCallback(),this},setFromAxisAngle:function(a,b){var c=b/2,d=Math.sin(c);return this._x=a.x*d,this._y=a.y*d,this._z=a.z*d,this._w=Math.cos(c),this.onChangeCallback(),this},setFromRotationMatrix:function(a){var b,c=a.elements,d=c[0],e=c[4],f=c[8],g=c[1],h=c[5],i=c[9],j=c[2],k=c[6],l=c[10],m=d+h+l;return m>0?(b=.5/Math.sqrt(m+1),this._w=.25/b,this._x=(k-i)*b,this._y=(f-j)*b,this._z=(g-e)*b):d>h&&d>l?(b=2*Math.sqrt(1+d-h-l),this._w=(k-i)/b,this._x=.25*b,this._y=(e+g)/b,this._z=(f+j)/b):h>l?(b=2*Math.sqrt(1+h-d-l),this._w=(f-j)/b,this._x=(e+g)/b,this._y=.25*b,this._z=(i+k)/b):(b=2*Math.sqrt(1+l-d-h),this._w=(g-e)/b,this._x=(f+j)/b,this._y=(i+k)/b,this._z=.25*b),this.onChangeCallback(),this},setFromUnitVectors:function(){var a,b=new f;return function(c,d){return void 0===b&&(b=new f),a=c.dot(d)+1,a<1e-6?(a=0,Math.abs(c.x)>Math.abs(c.z)?b.set(-c.y,c.x,0):b.set(0,-c.z,c.y)):b.crossVectors(c,d),this._x=b.x,this._y=b.y,this._z=b.z,this._w=a,this.normalize()}}(),inverse:function(){return this.conjugate().normalize()},conjugate:function(){return this._x*=-1,this._y*=-1,this._z*=-1,this.onChangeCallback(),this},dot:function(a){return this._x*a._x+this._y*a._y+this._z*a._z+this._w*a._w},lengthSq:function(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w},length:function(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)},normalize:function(){var a=this.length();return 0===a?(this._x=0,this._y=0,this._z=0,this._w=1):(a=1/a,this._x=this._x*a,this._y=this._y*a,this._z=this._z*a,this._w=this._w*a),this.onChangeCallback(),this},multiply:function(a,b){return void 0!==b?(console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."),this.multiplyQuaternions(a,b)):this.multiplyQuaternions(this,a)},premultiply:function(a){return this.multiplyQuaternions(a,this)},multiplyQuaternions:function(a,b){var c=a._x,d=a._y,e=a._z,f=a._w,g=b._x,h=b._y,i=b._z,j=b._w;return this._x=c*j+f*g+d*i-e*h,this._y=d*j+f*h+e*g-c*i,this._z=e*j+f*i+c*h-d*g,this._w=f*j-c*g-d*h-e*i,this.onChangeCallback(),this},slerp:function(a,b){if(0===b)return this;if(1===b)return this.copy(a);var c=this._x,d=this._y,e=this._z,f=this._w,g=f*a._w+c*a._x+d*a._y+e*a._z;if(g<0?(this._w=-a._w,this._x=-a._x,this._y=-a._y,this._z=-a._z,g=-g):this.copy(a),g>=1)return this._w=f,this._x=c,this._y=d,this._z=e,this;var h=Math.sqrt(1-g*g);if(Math.abs(h)<.001)return this._w=.5*(f+this._w),this._x=.5*(c+this._x),this._y=.5*(d+this._y),this._z=.5*(e+this._z),this;var i=Math.atan2(h,g),j=Math.sin((1-b)*i)/h,k=Math.sin(b*i)/h;return this._w=f*j+this._w*k,this._x=c*j+this._x*k,this._y=d*j+this._y*k,this._z=e*j+this._z*k,this.onChangeCallback(),this},equals:function(a){return a._x===this._x&&a._y===this._y&&a._z===this._z&&a._w===this._w},fromArray:function(a,b){return void 0===b&&(b=0),this._x=a[b],this._y=a[b+1],this._z=a[b+2],this._w=a[b+3],this.onChangeCallback(),this},toArray:function(a,b){return void 0===a&&(a=[]),void 0===b&&(b=0),a[b]=this._x,a[b+1]=this._y,a[b+2]=this._z,a[b+3]=this._w,a},onChange:function(a){return this.onChangeCallback=a,this},onChangeCallback:function(){}}),Object.assign(f.prototype,{isVector3:!0,set:function(a,b,c){return this.x=a,this.y=b,this.z=c,this},setScalar:function(a){return this.x=a,this.y=a,this.z=a,this},setX:function(a){return this.x=a,this},setY:function(a){return this.y=a,this},setZ:function(a){return this.z=a,this},setComponent:function(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;case 2:this.z=b;break;default:throw new Error("index is out of range: "+a)}return this},getComponent:function(a){switch(a){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+a)}},clone:function(){return new this.constructor(this.x,this.y,this.z)},copy:function(a){return this.x=a.x,this.y=a.y,this.z=a.z,this},add:function(a,b){return void 0!==b?(console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b)):(this.x+=a.x,this.y+=a.y,this.z+=a.z,this)},addScalar:function(a){return this.x+=a,this.y+=a,this.z+=a,this},addVectors:function(a,b){return this.x=a.x+b.x,this.y=a.y+b.y,this.z=a.z+b.z,this},addScaledVector:function(a,b){return this.x+=a.x*b,this.y+=a.y*b,this.z+=a.z*b,this},sub:function(a,b){return void 0!==b?(console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b)):(this.x-=a.x,this.y-=a.y,this.z-=a.z,this)},subScalar:function(a){return this.x-=a,this.y-=a,this.z-=a,this},subVectors:function(a,b){return this.x=a.x-b.x,this.y=a.y-b.y,this.z=a.z-b.z,this},multiply:function(a,b){return void 0!==b?(console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."),this.multiplyVectors(a,b)):(this.x*=a.x,this.y*=a.y,this.z*=a.z,this)},multiplyScalar:function(a){return this.x*=a,this.y*=a,this.z*=a,this},multiplyVectors:function(a,b){return this.x=a.x*b.x,this.y=a.y*b.y,this.z=a.z*b.z,this},applyEuler:function(){var a=new e;return function(b){return b&&b.isEuler||console.error("THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order."),this.applyQuaternion(a.setFromEuler(b))}}(),applyAxisAngle:function(){var a=new e;return function(b,c){return this.applyQuaternion(a.setFromAxisAngle(b,c))}}(),applyMatrix3:function(a){var b=this.x,c=this.y,d=this.z,e=a.elements;return this.x=e[0]*b+e[3]*c+e[6]*d,this.y=e[1]*b+e[4]*c+e[7]*d,this.z=e[2]*b+e[5]*c+e[8]*d,this},applyMatrix4:function(a){var b=this.x,c=this.y,d=this.z,e=a.elements,f=1/(e[3]*b+e[7]*c+e[11]*d+e[15]);return this.x=(e[0]*b+e[4]*c+e[8]*d+e[12])*f,this.y=(e[1]*b+e[5]*c+e[9]*d+e[13])*f,this.z=(e[2]*b+e[6]*c+e[10]*d+e[14])*f,this},applyQuaternion:function(a){var b=this.x,c=this.y,d=this.z,e=a.x,f=a.y,g=a.z,h=a.w,i=h*b+f*d-g*c,j=h*c+g*b-e*d,k=h*d+e*c-f*b,l=-e*b-f*c-g*d;return this.x=i*h+l*-e+j*-g-k*-f,this.y=j*h+l*-f+k*-e-i*-g,this.z=k*h+l*-g+i*-f-j*-e,this},project:function(){var a=new d;return function(b){return a.multiplyMatrices(b.projectionMatrix,a.getInverse(b.matrixWorld)),this.applyMatrix4(a)}}(),unproject:function(){var a=new d;return function(b){return a.multiplyMatrices(b.matrixWorld,a.getInverse(b.projectionMatrix)),this.applyMatrix4(a)}}(),transformDirection:function(a){var b=this.x,c=this.y,d=this.z,e=a.elements;return this.x=e[0]*b+e[4]*c+e[8]*d,this.y=e[1]*b+e[5]*c+e[9]*d,this.z=e[2]*b+e[6]*c+e[10]*d,this.normalize()},divide:function(a){return this.x/=a.x,this.y/=a.y,this.z/=a.z,this},divideScalar:function(a){return this.multiplyScalar(1/a)},min:function(a){return this.x=Math.min(this.x,a.x),this.y=Math.min(this.y,a.y),this.z=Math.min(this.z,a.z),this},max:function(a){return this.x=Math.max(this.x,a.x),this.y=Math.max(this.y,a.y),this.z=Math.max(this.z,a.z),this},clamp:function(a,b){return this.x=Math.max(a.x,Math.min(b.x,this.x)),this.y=Math.max(a.y,Math.min(b.y,this.y)),this.z=Math.max(a.z,Math.min(b.z,this.z)),this},clampScalar:function(){var a=new f,b=new f;return function(c,d){return a.set(c,c,c),b.set(d,d,d),this.clamp(a,b)}}(),clampLength:function(a,b){var c=this.length();return this.divideScalar(c||1).multiplyScalar(Math.max(a,Math.min(b,c)))},floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this},ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this},round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this},roundToZero:function(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this},negate:function(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z},lengthSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)},manhattanLength:function(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)},normalize:function(){return this.divideScalar(this.length()||1)},setLength:function(a){return this.normalize().multiplyScalar(a)},lerp:function(a,b){return this.x+=(a.x-this.x)*b,this.y+=(a.y-this.y)*b,this.z+=(a.z-this.z)*b,this},lerpVectors:function(a,b,c){return this.subVectors(b,a).multiplyScalar(c).add(a)},cross:function(a,b){return void 0!==b?(console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."),this.crossVectors(a,b)):this.crossVectors(this,a)},crossVectors:function(a,b){var c=a.x,d=a.y,e=a.z,f=b.x,g=b.y,h=b.z;return this.x=d*h-e*g,this.y=e*f-c*h,this.z=c*g-d*f,this},projectOnVector:function(a){var b=a.dot(this)/a.lengthSq();return this.copy(a).multiplyScalar(b)},projectOnPlane:function(){var a=new f;return function(b){return a.copy(this).projectOnVector(b),this.sub(a)}}(),reflect:function(){var a=new f;return function(b){return this.sub(a.copy(b).multiplyScalar(2*this.dot(b)))}}(),angleTo:function(a){var b=this.dot(a)/Math.sqrt(this.lengthSq()*a.lengthSq());return Math.acos(yd.clamp(b,-1,1))},distanceTo:function(a){return Math.sqrt(this.distanceToSquared(a))},distanceToSquared:function(a){var b=this.x-a.x,c=this.y-a.y,d=this.z-a.z;return b*b+c*c+d*d},manhattanDistanceTo:function(a){return Math.abs(this.x-a.x)+Math.abs(this.y-a.y)+Math.abs(this.z-a.z)},setFromSpherical:function(a){var b=Math.sin(a.phi)*a.radius;return this.x=b*Math.sin(a.theta),this.y=Math.cos(a.phi)*a.radius,this.z=b*Math.cos(a.theta),this},setFromCylindrical:function(a){return this.x=a.radius*Math.sin(a.theta),this.y=a.y,this.z=a.radius*Math.cos(a.theta),this},setFromMatrixPosition:function(a){var b=a.elements;return this.x=b[12],this.y=b[13],this.z=b[14],this},setFromMatrixScale:function(a){var b=this.setFromMatrixColumn(a,0).length(),c=this.setFromMatrixColumn(a,1).length(),d=this.setFromMatrixColumn(a,2).length();return this.x=b,this.y=c,this.z=d,this},setFromMatrixColumn:function(a,b){return this.fromArray(a.elements,4*b)},equals:function(a){return a.x===this.x&&a.y===this.y&&a.z===this.z},fromArray:function(a,b){return void 0===b&&(b=0),this.x=a[b],this.y=a[b+1],this.z=a[b+2],this},toArray:function(a,b){return void 0===a&&(a=[]),void 0===b&&(b=0),a[b]=this.x,a[b+1]=this.y,a[b+2]=this.z,a},fromBufferAttribute:function(a,b,c){return void 0!==c&&console.warn("THREE.Vector3: offset has been removed from .fromBufferAttribute()."),this.x=a.getX(b),this.y=a.getY(b),this.z=a.getZ(b),this}}),Object.assign(g.prototype,{isMatrix3:!0,set:function(a,b,c,d,e,f,g,h,i){var j=this.elements;return j[0]=a,j[1]=d,j[2]=g,j[3]=b,j[4]=e,j[5]=h,j[6]=c,j[7]=f,j[8]=i,this},identity:function(){return this.set(1,0,0,0,1,0,0,0,1),this},clone:function(){return(new this.constructor).fromArray(this.elements)},copy:function(a){var b=this.elements,c=a.elements;return b[0]=c[0],b[1]=c[1],b[2]=c[2],b[3]=c[3],b[4]=c[4],b[5]=c[5],b[6]=c[6],b[7]=c[7],b[8]=c[8],this},setFromMatrix4:function(a){var b=a.elements;return this.set(b[0],b[4],b[8],b[1],b[5],b[9],b[2],b[6],b[10]),this},applyToBufferAttribute:function(){var a=new f;return function(b){for(var c=0,d=b.count;c<d;c++)a.x=b.getX(c),a.y=b.getY(c),a.z=b.getZ(c),a.applyMatrix3(this),b.setXYZ(c,a.x,a.y,a.z);return b}}(),multiply:function(a){return this.multiplyMatrices(this,a)},premultiply:function(a){return this.multiplyMatrices(a,this)},multiplyMatrices:function(a,b){var c=a.elements,d=b.elements,e=this.elements,f=c[0],g=c[3],h=c[6],i=c[1],j=c[4],k=c[7],l=c[2],m=c[5],n=c[8],o=d[0],p=d[3],q=d[6],r=d[1],s=d[4],t=d[7],u=d[2],v=d[5],w=d[8];return e[0]=f*o+g*r+h*u,e[3]=f*p+g*s+h*v,e[6]=f*q+g*t+h*w,e[1]=i*o+j*r+k*u,e[4]=i*p+j*s+k*v,e[7]=i*q+j*t+k*w,e[2]=l*o+m*r+n*u,e[5]=l*p+m*s+n*v,e[8]=l*q+m*t+n*w,this},multiplyScalar:function(a){var b=this.elements;return b[0]*=a,b[3]*=a,b[6]*=a,b[1]*=a,b[4]*=a,b[7]*=a,b[2]*=a,b[5]*=a,b[8]*=a,this},determinant:function(){var a=this.elements,b=a[0],c=a[1],d=a[2],e=a[3],f=a[4],g=a[5],h=a[6],i=a[7],j=a[8];return b*f*j-b*g*i-c*e*j+c*g*h+d*e*i-d*f*h},getInverse:function(a,b){a&&a.isMatrix4&&console.error("THREE.Matrix3: .getInverse() no longer takes a Matrix4 argument.");var c=a.elements,d=this.elements,e=c[0],f=c[1],g=c[2],h=c[3],i=c[4],j=c[5],k=c[6],l=c[7],m=c[8],n=m*i-j*l,o=j*k-m*h,p=l*h-i*k,q=e*n+f*o+g*p;if(0===q){var r="THREE.Matrix3: .getInverse() can't invert matrix, determinant is 0";if(!0===b)throw new Error(r);return console.warn(r),this.identity()}var s=1/q;return d[0]=n*s,d[1]=(g*l-m*f)*s,d[2]=(j*f-g*i)*s,d[3]=o*s,d[4]=(m*e-g*k)*s,d[5]=(g*h-j*e)*s,d[6]=p*s,d[7]=(f*k-l*e)*s,d[8]=(i*e-f*h)*s,this},transpose:function(){var a,b=this.elements;return a=b[1],b[1]=b[3],b[3]=a,a=b[2],b[2]=b[6],b[6]=a,a=b[5],b[5]=b[7],b[7]=a,this},getNormalMatrix:function(a){return this.setFromMatrix4(a).getInverse(this).transpose()},transposeIntoArray:function(a){var b=this.elements;return a[0]=b[0],a[1]=b[3],a[2]=b[6],a[3]=b[1],a[4]=b[4],a[5]=b[7],a[6]=b[2],a[7]=b[5],a[8]=b[8],this},setUvTransform:function(a,b,c,d,e,f,g){var h=Math.cos(e),i=Math.sin(e);this.set(c*h,c*i,-c*(h*f+i*g)+f+a,-d*i,d*h,-d*(-i*f+h*g)+g+b,0,0,1)},scale:function(a,b){var c=this.elements;return c[0]*=a,c[3]*=a,c[6]*=a,c[1]*=b,c[4]*=b,c[7]*=b,this},rotate:function(a){var b=Math.cos(a),c=Math.sin(a),d=this.elements,e=d[0],f=d[3],g=d[6],h=d[1],i=d[4],j=d[7];return d[0]=b*e+c*h,d[3]=b*f+c*i,d[6]=b*g+c*j,d[1]=-c*e+b*h,d[4]=-c*f+b*i,d[7]=-c*g+b*j,this},translate:function(a,b){var c=this.elements;return c[0]+=a*c[2],c[3]+=a*c[5],c[6]+=a*c[8],c[1]+=b*c[2],c[4]+=b*c[5],c[7]+=b*c[8],this},equals:function(a){for(var b=this.elements,c=a.elements,d=0;d<9;d++)if(b[d]!==c[d])return!1;return!0},fromArray:function(a,b){void 0===b&&(b=0);for(var c=0;c<9;c++)this.elements[c]=a[c+b];return this},toArray:function(a,b){void 0===a&&(a=[]),void 0===b&&(b=0);var c=this.elements;return a[b]=c[0],a[b+1]=c[1],a[b+2]=c[2],a[b+3]=c[3],a[b+4]=c[4],a[b+5]=c[5],a[b+6]=c[6],a[b+7]=c[7],a[b+8]=c[8],a}});var zd=0;h.DEFAULT_IMAGE=void 0,h.DEFAULT_MAPPING=vc,h.prototype=Object.assign(Object.create(b.prototype),{constructor:h,isTexture:!0,clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.name=a.name,this.image=a.image,this.mipmaps=a.mipmaps.slice(0),this.mapping=a.mapping,this.wrapS=a.wrapS,this.wrapT=a.wrapT,this.magFilter=a.magFilter,this.minFilter=a.minFilter,this.anisotropy=a.anisotropy,this.format=a.format,this.type=a.type,this.offset.copy(a.offset),this.repeat.copy(a.repeat),this.center.copy(a.center),this.rotation=a.rotation,this.matrixAutoUpdate=a.matrixAutoUpdate,this.matrix.copy(a.matrix),this.generateMipmaps=a.generateMipmaps,this.premultiplyAlpha=a.premultiplyAlpha,this.flipY=a.flipY,this.unpackAlignment=a.unpackAlignment,this.encoding=a.encoding,this},toJSON:function(a){function b(a){var b;if(a instanceof HTMLCanvasElement)b=a;else{b=document.createElementNS("http://www.w3.org/1999/xhtml","canvas"),b.width=a.width,b.height=a.height;var c=b.getContext("2d");a instanceof ImageData?c.putImageData(a,0,0):c.drawImage(a,0,0,a.width,a.height)}return b.width>2048||b.height>2048?b.toDataURL("image/jpeg",.6):b.toDataURL("image/png")}var c=void 0===a||"string"==typeof a;if(!c&&void 0!==a.textures[this.uuid])return a.textures[this.uuid];var d={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY};if(void 0!==this.image){var e=this.image;void 0===e.uuid&&(e.uuid=yd.generateUUID()),c||void 0!==a.images[e.uuid]||(a.images[e.uuid]={uuid:e.uuid,url:b(e)}),d.image=e.uuid}return c||(a.textures[this.uuid]=d),d},dispose:function(){this.dispatchEvent({type:"dispose"})},transformUv:function(a){if(this.mapping===vc){if(a.applyMatrix3(this.matrix),a.x<0||a.x>1)switch(this.wrapS){case Dc:a.x=a.x-Math.floor(a.x);break;case Ec:a.x=a.x<0?0:1;break;case Fc:1===Math.abs(Math.floor(a.x)%2)?a.x=Math.ceil(a.x)-a.x:a.x=a.x-Math.floor(a.x)}if(a.y<0||a.y>1)switch(this.wrapT){case Dc:a.y=a.y-Math.floor(a.y);break;case Ec:a.y=a.y<0?0:1;break;case Fc:1===Math.abs(Math.floor(a.y)%2)?a.y=Math.ceil(a.y)-a.y:a.y=a.y-Math.floor(a.y)}this.flipY&&(a.y=1-a.y)}}}),Object.defineProperty(h.prototype,"needsUpdate",{set:function(a){!0===a&&this.version++}}),Object.assign(i.prototype,{isVector4:!0,set:function(a,b,c,d){return this.x=a,this.y=b,this.z=c,this.w=d,this},setScalar:function(a){return this.x=a,this.y=a,this.z=a,this.w=a,this},setX:function(a){return this.x=a,this},setY:function(a){return this.y=a,this},setZ:function(a){return this.z=a,this},setW:function(a){return this.w=a,this},setComponent:function(a,b){switch(a){case 0:this.x=b;break;case 1:this.y=b;break;case 2:this.z=b;break;case 3:this.w=b;break;default:throw new Error("index is out of range: "+a)}return this},getComponent:function(a){switch(a){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+a)}},clone:function(){return new this.constructor(this.x,this.y,this.z,this.w)},copy:function(a){return this.x=a.x,this.y=a.y,this.z=a.z,this.w=void 0!==a.w?a.w:1,this},add:function(a,b){return void 0!==b?(console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."),this.addVectors(a,b)):(this.x+=a.x,this.y+=a.y,this.z+=a.z,this.w+=a.w,this)},addScalar:function(a){return this.x+=a,this.y+=a,this.z+=a,this.w+=a,this},addVectors:function(a,b){return this.x=a.x+b.x,this.y=a.y+b.y,this.z=a.z+b.z,this.w=a.w+b.w,this},addScaledVector:function(a,b){return this.x+=a.x*b,this.y+=a.y*b,this.z+=a.z*b,this.w+=a.w*b,this},sub:function(a,b){return void 0!==b?(console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."),this.subVectors(a,b)):(this.x-=a.x,this.y-=a.y,this.z-=a.z,this.w-=a.w,this)},subScalar:function(a){return this.x-=a,this.y-=a,this.z-=a,this.w-=a,this},subVectors:function(a,b){return this.x=a.x-b.x,this.y=a.y-b.y,this.z=a.z-b.z,this.w=a.w-b.w,this},multiplyScalar:function(a){return this.x*=a,this.y*=a,this.z*=a,this.w*=a,this},applyMatrix4:function(a){var b=this.x,c=this.y,d=this.z,e=this.w,f=a.elements;return this.x=f[0]*b+f[4]*c+f[8]*d+f[12]*e,this.y=f[1]*b+f[5]*c+f[9]*d+f[13]*e,this.z=f[2]*b+f[6]*c+f[10]*d+f[14]*e,this.w=f[3]*b+f[7]*c+f[11]*d+f[15]*e,this},divideScalar:function(a){return this.multiplyScalar(1/a)},setAxisAngleFromQuaternion:function(a){this.w=2*Math.acos(a.w);var b=Math.sqrt(1-a.w*a.w);return b<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=a.x/b,this.y=a.y/b,this.z=a.z/b),this},setAxisAngleFromRotationMatrix:function(a){var b,c,d,e,f=.01,g=.1,h=a.elements,i=h[0],j=h[4],k=h[8],l=h[1],m=h[5],n=h[9],o=h[2],p=h[6],q=h[10];if(Math.abs(j-l)<f&&Math.abs(k-o)<f&&Math.abs(n-p)<f){if(Math.abs(j+l)<g&&Math.abs(k+o)<g&&Math.abs(n+p)<g&&Math.abs(i+m+q-3)<g)return this.set(1,0,0,0),this;b=Math.PI;var r=(i+1)/2,s=(m+1)/2,t=(q+1)/2,u=(j+l)/4,v=(k+o)/4,w=(n+p)/4;return r>s&&r>t?r<f?(c=0,d=.707106781,e=.707106781):(c=Math.sqrt(r),d=u/c,e=v/c):s>t?s<f?(c=.707106781,d=0,e=.707106781):(d=Math.sqrt(s),c=u/d,e=w/d):t<f?(c=.707106781,d=.707106781,e=0):(e=Math.sqrt(t),c=v/e,d=w/e),this.set(c,d,e,b),this}var x=Math.sqrt((p-n)*(p-n)+(k-o)*(k-o)+(l-j)*(l-j));return Math.abs(x)<.001&&(x=1),this.x=(p-n)/x,this.y=(k-o)/x,this.z=(l-j)/x,this.w=Math.acos((i+m+q-1)/2),this},min:function(a){return this.x=Math.min(this.x,a.x),this.y=Math.min(this.y,a.y),this.z=Math.min(this.z,a.z),this.w=Math.min(this.w,a.w),this},max:function(a){return this.x=Math.max(this.x,a.x),this.y=Math.max(this.y,a.y),this.z=Math.max(this.z,a.z),this.w=Math.max(this.w,a.w),this},clamp:function(a,b){return this.x=Math.max(a.x,Math.min(b.x,this.x)),this.y=Math.max(a.y,Math.min(b.y,this.y)),this.z=Math.max(a.z,Math.min(b.z,this.z)),this.w=Math.max(a.w,Math.min(b.w,this.w)),this},clampScalar:function(){var a,b;return function(c,d){return void 0===a&&(a=new i,b=new i),a.set(c,c,c,c),b.set(d,d,d,d),this.clamp(a,b)}}(),clampLength:function(a,b){var c=this.length();return this.divideScalar(c||1).multiplyScalar(Math.max(a,Math.min(b,c)))},floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this},ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this},round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this},roundToZero:function(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this},negate:function(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z+this.w*a.w},lengthSq:function(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)},manhattanLength:function(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)},normalize:function(){return this.divideScalar(this.length()||1)},setLength:function(a){return this.normalize().multiplyScalar(a)},lerp:function(a,b){return this.x+=(a.x-this.x)*b,this.y+=(a.y-this.y)*b,this.z+=(a.z-this.z)*b,this.w+=(a.w-this.w)*b,this},lerpVectors:function(a,b,c){return this.subVectors(b,a).multiplyScalar(c).add(a)},equals:function(a){return a.x===this.x&&a.y===this.y&&a.z===this.z&&a.w===this.w},fromArray:function(a,b){return void 0===b&&(b=0),this.x=a[b],this.y=a[b+1],this.z=a[b+2],this.w=a[b+3],this},toArray:function(a,b){return void 0===a&&(a=[]),void 0===b&&(b=0),a[b]=this.x,a[b+1]=this.y,a[b+2]=this.z,a[b+3]=this.w,a},fromBufferAttribute:function(a,b,c){return void 0!==c&&console.warn("THREE.Vector4: offset has been removed from .fromBufferAttribute()."),this.x=a.getX(b),this.y=a.getY(b),this.z=a.getZ(b),this.w=a.getW(b),this}}),j.prototype=Object.assign(Object.create(b.prototype),{constructor:j,isWebGLRenderTarget:!0,setSize:function(a,b){this.width===a&&this.height===b||(this.width=a,this.height=b,this.dispose()),this.viewport.set(0,0,a,b),this.scissor.set(0,0,a,b)},clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.width=a.width,this.height=a.height,this.viewport.copy(a.viewport),this.texture=a.texture.clone(),this.depthBuffer=a.depthBuffer,this.stencilBuffer=a.stencilBuffer,this.depthTexture=a.depthTexture,this},dispose:function(){this.dispatchEvent({type:"dispose"})}}),k.prototype=Object.create(h.prototype),k.prototype.constructor=k,k.prototype.isDataTexture=!0,l.prototype=Object.create(h.prototype),l.prototype.constructor=l,l.prototype.isCubeTexture=!0,Object.defineProperty(l.prototype,"images",{get:function(){return this.image},set:function(a){this.image=a}});var Ad=new h,Bd=new l,Cd=[],Dd=[],Ed=new Float32Array(16),Fd=new Float32Array(9);Q.prototype.setValue=function(a,b){for(var c=this.seq,d=0,e=c.length;d!==e;++d){var f=c[d];f.setValue(a,b[f.id])}};var Gd=/([\w\d_]+)(\])?(\[|\.)?/g;T.prototype.setValue=function(a,b,c){var d=this.map[b];void 0!==d&&d.setValue(a,c,this.renderer)},T.prototype.setOptional=function(a,b,c){var d=b[c];void 0!==d&&this.setValue(a,c,d)},T.upload=function(a,b,c,d){for(var e=0,f=b.length;e!==f;++e){var g=b[e],h=c[g.id];!1!==h.needsUpdate&&g.setValue(a,h.value,d)}},T.seqWithValue=function(a,b){for(var c=[],d=0,e=a.length;d!==e;++d){var f=a[d];f.id in b&&c.push(f)}return c};var Hd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};Object.assign(U.prototype,{isColor:!0,r:1,g:1,b:1,set:function(a){return a&&a.isColor?this.copy(a):"number"==typeof a?this.setHex(a):"string"==typeof a&&this.setStyle(a),this},setScalar:function(a){return this.r=a,this.g=a,this.b=a,this},setHex:function(a){return a=Math.floor(a),this.r=(a>>16&255)/255,this.g=(a>>8&255)/255,this.b=(255&a)/255,this},setRGB:function(a,b,c){return this.r=a,this.g=b,this.b=c,this},setHSL:function(){function a(a,b,c){return c<0&&(c+=1),c>1&&(c-=1),c<1/6?a+6*(b-a)*c:c<.5?b:c<2/3?a+6*(b-a)*(2/3-c):a}return function(b,c,d){if(b=yd.euclideanModulo(b,1),c=yd.clamp(c,0,1),d=yd.clamp(d,0,1),0===c)this.r=this.g=this.b=d;else{var e=d<=.5?d*(1+c):d+c-d*c,f=2*d-e;this.r=a(f,e,b+1/3),this.g=a(f,e,b),this.b=a(f,e,b-1/3)}return this}}(),setStyle:function(a){function b(b){void 0!==b&&parseFloat(b)<1&&console.warn("THREE.Color: Alpha component of "+a+" will be ignored.")}var c;if(c=/^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(a)){var d,e=c[1],f=c[2];switch(e){case"rgb":case"rgba":if(d=/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(f))return this.r=Math.min(255,parseInt(d[1],10))/255,this.g=Math.min(255,parseInt(d[2],10))/255,this.b=Math.min(255,parseInt(d[3],10))/255,b(d[5]),this;if(d=/^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(f))return this.r=Math.min(100,parseInt(d[1],10))/100,this.g=Math.min(100,parseInt(d[2],10))/100,this.b=Math.min(100,parseInt(d[3],10))/100,b(d[5]),this;break;case"hsl":case"hsla":if(d=/^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(f)){var g=parseFloat(d[1])/360,h=parseInt(d[2],10)/100,i=parseInt(d[3],10)/100;return b(d[5]),this.setHSL(g,h,i)}}}else if(c=/^\#([A-Fa-f0-9]+)$/.exec(a)){var j=c[1],k=j.length;if(3===k)return this.r=parseInt(j.charAt(0)+j.charAt(0),16)/255,this.g=parseInt(j.charAt(1)+j.charAt(1),16)/255,this.b=parseInt(j.charAt(2)+j.charAt(2),16)/255,this;if(6===k)return this.r=parseInt(j.charAt(0)+j.charAt(1),16)/255,this.g=parseInt(j.charAt(2)+j.charAt(3),16)/255,this.b=parseInt(j.charAt(4)+j.charAt(5),16)/255,this}if(a&&a.length>0){var j=Hd[a];void 0!==j?this.setHex(j):console.warn("THREE.Color: Unknown color "+a)}return this},clone:function(){return new this.constructor(this.r,this.g,this.b)},copy:function(a){return this.r=a.r,this.g=a.g,this.b=a.b,this},copyGammaToLinear:function(a,b){return void 0===b&&(b=2),this.r=Math.pow(a.r,b),this.g=Math.pow(a.g,b),this.b=Math.pow(a.b,b),this},copyLinearToGamma:function(a,b){void 0===b&&(b=2);var c=b>0?1/b:1;return this.r=Math.pow(a.r,c),this.g=Math.pow(a.g,c),this.b=Math.pow(a.b,c),this},convertGammaToLinear:function(){var a=this.r,b=this.g,c=this.b;return this.r=a*a,this.g=b*b,this.b=c*c,this},convertLinearToGamma:function(){return this.r=Math.sqrt(this.r),this.g=Math.sqrt(this.g),this.b=Math.sqrt(this.b),this},getHex:function(){return 255*this.r<<16^255*this.g<<8^255*this.b<<0},getHexString:function(){return("000000"+this.getHex().toString(16)).slice(-6)},getHSL:function(a){var b,c,d=a||{h:0,s:0,l:0},e=this.r,f=this.g,g=this.b,h=Math.max(e,f,g),i=Math.min(e,f,g),j=(i+h)/2;if(i===h)b=0,c=0;else{var k=h-i;switch(c=j<=.5?k/(h+i):k/(2-h-i),h){case e:b=(f-g)/k+(f<g?6:0);break;case f:b=(g-e)/k+2;break;case g:b=(e-f)/k+4}b/=6}return d.h=b,d.s=c,d.l=j,d},getStyle:function(){return"rgb("+(255*this.r|0)+","+(255*this.g|0)+","+(255*this.b|0)+")"},offsetHSL:function(a,b,c){var d=this.getHSL();return d.h+=a,d.s+=b,d.l+=c,this.setHSL(d.h,d.s,d.l),this},add:function(a){return this.r+=a.r,this.g+=a.g,this.b+=a.b,this},addColors:function(a,b){return this.r=a.r+b.r,this.g=a.g+b.g,this.b=a.b+b.b,this},addScalar:function(a){return this.r+=a,this.g+=a,this.b+=a,this},sub:function(a){return this.r=Math.max(0,this.r-a.r),this.g=Math.max(0,this.g-a.g),this.b=Math.max(0,this.b-a.b),this},multiply:function(a){return this.r*=a.r,this.g*=a.g,this.b*=a.b,this},multiplyScalar:function(a){return this.r*=a,this.g*=a,this.b*=a,this},lerp:function(a,b){return this.r+=(a.r-this.r)*b,this.g+=(a.g-this.g)*b,this.b+=(a.b-this.b)*b,this},equals:function(a){return a.r===this.r&&a.g===this.g&&a.b===this.b},fromArray:function(a,b){return void 0===b&&(b=0),this.r=a[b],this.g=a[b+1],this.b=a[b+2],this},toArray:function(a,b){return void 0===a&&(a=[]),void 0===b&&(b=0),a[b]=this.r,a[b+1]=this.g,a[b+2]=this.b,a},toJSON:function(){return this.getHex()}});var Id={common:{diffuse:{value:new U(15658734)},opacity:{value:1},map:{value:null},uvTransform:{value:new g},alphaMap:{value:null}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new c(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{},shadow:{},shadowBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{},shadow:{},shadowBias:{},shadowRadius:{},shadowMapSize:{}}},spotShadowMap:{value:[]},spotShadowMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{},shadow:{},shadowBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}}},points:{diffuse:{value:new U(15658734)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},uvTransform:{value:new g}}},Jd={merge:function(a){for(var b={},c=0;c<a.length;c++){var d=this.clone(a[c]);for(var e in d)b[e]=d[e]}return b},clone:function(a){var b={};for(var c in a){b[c]={};for(var d in a[c]){var e=a[c][d];e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture)?b[c][d]=e.clone():Array.isArray(e)?b[c][d]=e.slice():b[c][d]=e}}return b}},Kd="#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n#endif\n",Ld="#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif\n",Md="#ifdef ALPHATEST\n\tif ( diffuseColor.a < ALPHATEST ) discard;\n#endif\n",Nd="#ifdef USE_AOMAP\n\tfloat ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\treflectedLight.indirectDiffuse *= ambientOcclusion;\n\t#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );\n\t#endif\n#endif\n",Od="#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n#endif",Pd="\nvec3 transformed = vec3( position );\n",Qd="\nvec3 objectNormal = vec3( normal );\n",Rd="float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n\tif( decayExponent > 0.0 ) {\n#if defined ( PHYSICALLY_CORRECT_LIGHTS )\n\t\tfloat distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\t\tfloat maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t\treturn distanceFalloff * maxDistanceCutoffFactor;\n#else\n\t\treturn pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n#endif\n\t}\n\treturn 1.0;\n}\nvec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {\n\treturn RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {\n\tfloat fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n\treturn ( 1.0 - specularColor ) * fresnel + specularColor;\n}\nfloat G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\tfloat gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\treturn 1.0 / ( gl * gv );\n}\nfloat G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\nvec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n\tfloat alpha = pow2( roughness );\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * ( G * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n\tconst float LUT_SIZE  = 64.0;\n\tconst float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n\tconst float LUT_BIAS  = 0.5 / LUT_SIZE;\n\tfloat theta = acos( dot( N, V ) );\n\tvec2 uv = vec2(\n\t\tsqrt( saturate( roughness ) ),\n\t\tsaturate( theta / ( 0.5 * PI ) ) );\n\tuv = uv * LUT_SCALE + LUT_BIAS;\n\treturn uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n\tfloat l = length( f );\n\treturn max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n\tfloat x = dot( v1, v2 );\n\tfloat y = abs( x );\n\tfloat a = 0.86267 + (0.49788 + 0.01436 * y ) * y;\n\tfloat b = 3.45068 + (4.18814 + y) * y;\n\tfloat v = a / b;\n\tfloat theta_sintheta = (x > 0.0) ? v : 0.5 * inversesqrt( 1.0 - x * x ) - v;\n\treturn cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n\tvec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n\tvec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n\tvec3 lightNormal = cross( v1, v2 );\n\tif( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n\tvec3 T1, T2;\n\tT1 = normalize( V - N * dot( V, N ) );\n\tT2 = - cross( N, T1 );\n\tmat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );\n\tvec3 coords[ 4 ];\n\tcoords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n\tcoords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n\tcoords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n\tcoords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n\tcoords[ 0 ] = normalize( coords[ 0 ] );\n\tcoords[ 1 ] = normalize( coords[ 1 ] );\n\tcoords[ 2 ] = normalize( coords[ 2 ] );\n\tcoords[ 3 ] = normalize( coords[ 3 ] );\n\tvec3 vectorFormFactor = vec3( 0.0 );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n\tvec3 result = vec3( LTC_ClippedSphereFormFactor( vectorFormFactor ) );\n\treturn result;\n}\nvec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\tvec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;\n\treturn specularColor * AB.x + AB.y;\n}\nfloat G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {\n\tvec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n\tfloat dotNH = saturate( dot( geometry.normal, halfDir ) );\n\tfloat dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_BlinnPhong_Implicit( );\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\treturn F * ( G * D );\n}\nfloat GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n\treturn ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );\n}\nfloat BlinnExponentToGGXRoughness( const in float blinnExponent ) {\n\treturn sqrt( 2.0 / ( blinnExponent + 2.0 ) );\n}\n",Sd="#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd() {\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif\n",Td="#if NUM_CLIPPING_PLANES > 0\n\tfor ( int i = 0; i < UNION_CLIPPING_PLANES; ++ i ) {\n\t\tvec4 plane = clippingPlanes[ i ];\n\t\tif ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;\n\t}\n\t\t\n\t#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n\t\tbool clipped = true;\n\t\tfor ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; ++ i ) {\n\t\t\tvec4 plane = clippingPlanes[ i ];\n\t\t\tclipped = ( dot( vViewPosition, plane.xyz ) > plane.w ) && clipped;\n\t\t}\n\t\tif ( clipped ) discard;\n\t\n\t#endif\n#endif\n",Ud="#if NUM_CLIPPING_PLANES > 0\n\t#if ! defined( PHYSICAL ) && ! defined( PHONG )\n\t\tvarying vec3 vViewPosition;\n\t#endif\n\tuniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif\n",Vd="#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n\tvarying vec3 vViewPosition;\n#endif\n",Wd="#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n",Xd="#ifdef USE_COLOR\n\tdiffuseColor.rgb *= vColor;\n#endif",Yd="#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif\n",Zd="#ifdef USE_COLOR\n\tvarying vec3 vColor;\n#endif",$d="#ifdef USE_COLOR\n\tvColor.xyz = color.xyz;\n#endif",_d="#define PI 3.14159265359\n#define PI2 6.28318530718\n#define PI_HALF 1.5707963267949\n#define RECIPROCAL_PI 0.31830988618\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#define whiteCompliment(a) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }\nhighp float rand( const in vec2 uv ) {\n\tconst highp float a = 12.9898, b = 78.233, c = 43758.5453;\n\thighp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n\treturn fract(sin(sn) * c);\n}\nstruct IncidentLight {\n\tvec3 color;\n\tvec3 direction;\n\tbool visible;\n};\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};\nstruct GeometricContext {\n\tvec3 position;\n\tvec3 normal;\n\tvec3 viewDir;\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\tfloat distance = dot( planeNormal, point - pointOnPlane );\n\treturn - distance * planeNormal + point;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n\treturn lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n}\nmat3 transposeMat3( const in mat3 m ) {\n\tmat3 tmp;\n\ttmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );\n\ttmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );\n\ttmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );\n\treturn tmp;\n}\nfloat linearToRelativeLuminance( const in vec3 color ) {\n\tvec3 weights = vec3( 0.2126, 0.7152, 0.0722 );\n\treturn dot( weights, color.rgb );\n}\n",ae="#ifdef ENVMAP_TYPE_CUBE_UV\n#define cubeUV_textureSize (1024.0)\nint getFaceFromDirection(vec3 direction) {\n\tvec3 absDirection = abs(direction);\n\tint face = -1;\n\tif( absDirection.x > absDirection.z ) {\n\t\tif(absDirection.x > absDirection.y )\n\t\t\tface = direction.x > 0.0 ? 0 : 3;\n\t\telse\n\t\t\tface = direction.y > 0.0 ? 1 : 4;\n\t}\n\telse {\n\t\tif(absDirection.z > absDirection.y )\n\t\t\tface = direction.z > 0.0 ? 2 : 5;\n\t\telse\n\t\t\tface = direction.y > 0.0 ? 1 : 4;\n\t}\n\treturn face;\n}\n#define cubeUV_maxLods1  (log2(cubeUV_textureSize*0.25) - 1.0)\n#define cubeUV_rangeClamp (exp2((6.0 - 1.0) * 2.0))\nvec2 MipLevelInfo( vec3 vec, float roughnessLevel, float roughness ) {\n\tfloat scale = exp2(cubeUV_maxLods1 - roughnessLevel);\n\tfloat dxRoughness = dFdx(roughness);\n\tfloat dyRoughness = dFdy(roughness);\n\tvec3 dx = dFdx( vec * scale * dxRoughness );\n\tvec3 dy = dFdy( vec * scale * dyRoughness );\n\tfloat d = max( dot( dx, dx ), dot( dy, dy ) );\n\td = clamp(d, 1.0, cubeUV_rangeClamp);\n\tfloat mipLevel = 0.5 * log2(d);\n\treturn vec2(floor(mipLevel), fract(mipLevel));\n}\n#define cubeUV_maxLods2 (log2(cubeUV_textureSize*0.25) - 2.0)\n#define cubeUV_rcpTextureSize (1.0 / cubeUV_textureSize)\nvec2 getCubeUV(vec3 direction, float roughnessLevel, float mipLevel) {\n\tmipLevel = roughnessLevel > cubeUV_maxLods2 - 3.0 ? 0.0 : mipLevel;\n\tfloat a = 16.0 * cubeUV_rcpTextureSize;\n\tvec2 exp2_packed = exp2( vec2( roughnessLevel, mipLevel ) );\n\tvec2 rcp_exp2_packed = vec2( 1.0 ) / exp2_packed;\n\tfloat powScale = exp2_packed.x * exp2_packed.y;\n\tfloat scale = rcp_exp2_packed.x * rcp_exp2_packed.y * 0.25;\n\tfloat mipOffset = 0.75*(1.0 - rcp_exp2_packed.y) * rcp_exp2_packed.x;\n\tbool bRes = mipLevel == 0.0;\n\tscale =  bRes && (scale < a) ? a : scale;\n\tvec3 r;\n\tvec2 offset;\n\tint face = getFaceFromDirection(direction);\n\tfloat rcpPowScale = 1.0 / powScale;\n\tif( face == 0) {\n\t\tr = vec3(direction.x, -direction.z, direction.y);\n\t\toffset = vec2(0.0+mipOffset,0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 1) {\n\t\tr = vec3(direction.y, direction.x, direction.z);\n\t\toffset = vec2(scale+mipOffset, 0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 2) {\n\t\tr = vec3(direction.z, direction.x, direction.y);\n\t\toffset = vec2(2.0*scale+mipOffset, 0.75 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;\n\t}\n\telse if( face == 3) {\n\t\tr = vec3(direction.x, direction.z, direction.y);\n\t\toffset = vec2(0.0+mipOffset,0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\telse if( face == 4) {\n\t\tr = vec3(direction.y, direction.x, -direction.z);\n\t\toffset = vec2(scale+mipOffset, 0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\telse {\n\t\tr = vec3(direction.z, -direction.x, direction.y);\n\t\toffset = vec2(2.0*scale+mipOffset, 0.5 * rcpPowScale);\n\t\toffset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;\n\t}\n\tr = normalize(r);\n\tfloat texelOffset = 0.5 * cubeUV_rcpTextureSize;\n\tvec2 s = ( r.yz / abs( r.x ) + vec2( 1.0 ) ) * 0.5;\n\tvec2 base = offset + vec2( texelOffset );\n\treturn base + s * ( scale - 2.0 * texelOffset );\n}\n#define cubeUV_maxLods3 (log2(cubeUV_textureSize*0.25) - 3.0)\nvec4 textureCubeUV(vec3 reflectedDirection, float roughness ) {\n\tfloat roughnessVal = roughness* cubeUV_maxLods3;\n\tfloat r1 = floor(roughnessVal);\n\tfloat r2 = r1 + 1.0;\n\tfloat t = fract(roughnessVal);\n\tvec2 mipInfo = MipLevelInfo(reflectedDirection, r1, roughness);\n\tfloat s = mipInfo.y;\n\tfloat level0 = mipInfo.x;\n\tfloat level1 = level0 + 1.0;\n\tlevel1 = level1 > 5.0 ? 5.0 : level1;\n\tlevel0 += min( floor( s + 0.5 ), 5.0 );\n\tvec2 uv_10 = getCubeUV(reflectedDirection, r1, level0);\n\tvec4 color10 = envMapTexelToLinear(texture2D(envMap, uv_10));\n\tvec2 uv_20 = getCubeUV(reflectedDirection, r2, level0);\n\tvec4 color20 = envMapTexelToLinear(texture2D(envMap, uv_20));\n\tvec4 result = mix(color10, color20, t);\n\treturn vec4(result.rgb, 1.0);\n}\n#endif\n",be="vec3 transformedNormal = normalMatrix * objectNormal;\n#ifdef FLIP_SIDED\n\ttransformedNormal = - transformedNormal;\n#endif\n",ce="#ifdef USE_DISPLACEMENTMAP\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n#endif\n",de="#ifdef USE_DISPLACEMENTMAP\n\ttransformed += normalize( objectNormal ) * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );\n#endif\n",ee="#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D( emissiveMap, vUv );\n\temissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif\n",fe="#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n#endif\n",ge="  gl_FragColor = linearToOutputTexel( gl_FragColor );\n",he="\nvec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );\n}\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );\n}\nvec4 sRGBToLinear( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );\n}\nvec4 RGBEToLinear( in vec4 value ) {\n\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\nvec4 LinearToRGBE( in vec4 value ) {\n\tfloat maxComponent = max( max( value.r, value.g ), value.b );\n\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n}\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.xyz * value.w * maxRange, 1.0 );\n}\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat M      = clamp( maxRGB / maxRange, 0.0, 1.0 );\n\tM            = ceil( M * 255.0 ) / 255.0;\n\treturn vec4( value.rgb / ( M * maxRange ), M );\n}\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat D      = max( maxRange / maxRGB, 1.0 );\n\tD            = min( floor( D ) / 255.0, 1.0 );\n\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value )  {\n\tvec3 Xp_Y_XYZp = value.rgb * cLogLuvM;\n\tXp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));\n\tvec4 vResult;\n\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n\tvResult.w = fract(Le);\n\tvResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;\n\treturn vResult;\n}\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n\tfloat Le = value.z * 255.0 + value.w;\n\tvec3 Xp_Y_XYZp;\n\tXp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);\n\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n\tvec3 vRGB = Xp_Y_XYZp.rgb * cLogLuvInverseM;\n\treturn vec4( max(vRGB, 0.0), 1.0 );\n}\n",ie="#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#else\n\t\tvec3 reflectVec = vReflect;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\tvec2 sampleUV;\n\t\treflectVec = normalize( reflectVec );\n\t\tsampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\t\tsampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\treflectVec = normalize( reflectVec );\n\t\tvec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );\n\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t#else\n\t\tvec4 envColor = vec4( 0.0 );\n\t#endif\n\tenvColor = envMapTexelToLinear( envColor );\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\t#endif\n#endif\n",je="#if defined( USE_ENVMAP ) || defined( PHYSICAL )\n\tuniform float reflectivity;\n\tuniform float envMapIntensity;\n#endif\n#ifdef USE_ENVMAP\n\t#if ! defined( PHYSICAL ) && ( defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) )\n\t\tvarying vec3 vWorldPosition;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\tuniform float flipEnvMap;\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( PHYSICAL )\n\t\tuniform float refractionRatio;\n\t#else\n\t\tvarying vec3 vReflect;\n\t#endif\n#endif\n",ke="#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvarying vec3 vWorldPosition;\n\t#else\n\t\tvarying vec3 vReflect;\n\t\tuniform float refractionRatio;\n\t#endif\n#endif\n",le="#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\tvWorldPosition = worldPosition.xyz;\n\t#else\n\t\tvec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\t\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#endif\n#endif\n",me="\n#ifdef USE_FOG\nfogDepth = -mvPosition.z;\n#endif",ne="#ifdef USE_FOG\n  varying float fogDepth;\n#endif\n",oe="#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, fogDepth );\n\t#endif\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif\n",pe="#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float fogDepth;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif\n",qe="#ifdef TOON\n\tuniform sampler2D gradientMap;\n\tvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n\t\tfloat dotNL = dot( normal, lightDirection );\n\t\tvec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n\t\t#ifdef USE_GRADIENTMAP\n\t\t\treturn texture2D( gradientMap, coord ).rgb;\n\t\t#else\n\t\t\treturn ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );\n\t\t#endif\n\t}\n#endif\n",re="#ifdef USE_LIGHTMAP\n\treflectedLight.indirectDiffuse += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n#endif\n",se="#ifdef USE_LIGHTMAP\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n#endif",te="vec3 diffuse = vec3( 1.0 );\nGeometricContext geometry;\ngeometry.position = mvPosition.xyz;\ngeometry.normal = normalize( transformedNormal );\ngeometry.viewDir = normalize( -mvPosition.xyz );\nGeometricContext backGeometry;\nbackGeometry.position = geometry.position;\nbackGeometry.normal = -geometry.normal;\nbackGeometry.viewDir = geometry.viewDir;\nvLightFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\n\tvLightBack = vec3( 0.0 );\n#endif\nIncidentLight directLight;\nfloat dotNL;\nvec3 directLightColor_Diffuse;\n#if NUM_POINT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tgetPointDirectLightIrradiance( pointLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tgetSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_DIR_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tgetDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = PI * directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\tvLightFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );\n\t\t#endif\n\t}\n#endif\n",ue="uniform vec3 ambientLightColor;\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n\tvec3 irradiance = ambientLightColor;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treturn irradiance;\n}\n#if NUM_DIR_LIGHTS > 0\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\tvoid getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tdirectLight.color = directionalLight.color;\n\t\tdirectLight.direction = directionalLight.direction;\n\t\tdirectLight.visible = true;\n\t}\n#endif\n#if NUM_POINT_LIGHTS > 0\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t\tfloat shadowCameraNear;\n\t\tfloat shadowCameraFar;\n\t};\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\tvoid getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n\t\tvec3 lVector = pointLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tdirectLight.color = pointLight.color;\n\t\tdirectLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );\n\t\tdirectLight.visible = ( directLight.color != vec3( 0.0 ) );\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tstruct SpotLight {\n\t\tvec3 position;\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tfloat coneCos;\n\t\tfloat penumbraCos;\n\t\tint shadow;\n\t\tfloat shadowBias;\n\t\tfloat shadowRadius;\n\t\tvec2 shadowMapSize;\n\t};\n\tuniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n\tvoid getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {\n\t\tvec3 lVector = spotLight.position - geometry.position;\n\t\tdirectLight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tfloat angleCos = dot( directLight.direction, spotLight.direction );\n\t\tif ( angleCos > spotLight.coneCos ) {\n\t\t\tfloat spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n\t\t\tdirectLight.color = spotLight.color;\n\t\t\tdirectLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );\n\t\t\tdirectLight.visible = true;\n\t\t} else {\n\t\t\tdirectLight.color = vec3( 0.0 );\n\t\t\tdirectLight.visible = false;\n\t\t}\n\t}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n\tstruct RectAreaLight {\n\t\tvec3 color;\n\t\tvec3 position;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n\t};\n\tuniform sampler2D ltcMat;\tuniform sampler2D ltcMag;\n\tuniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tstruct HemisphereLight {\n\t\tvec3 direction;\n\t\tvec3 skyColor;\n\t\tvec3 groundColor;\n\t};\n\tuniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n\tvec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {\n\t\tfloat dotNL = dot( geometry.normal, hemiLight.direction );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n\t\tvec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tirradiance *= PI;\n\t\t#endif\n\t\treturn irradiance;\n\t}\n#endif\n#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n\tvec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {\n\t\tvec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n\t\t\tvec4 envMapColor = textureCubeUV( queryVec, 1.0 );\n\t\t#else\n\t\t\tvec4 envMapColor = vec4( 0.0 );\n\t\t#endif\n\t\treturn PI * envMapColor.rgb * envMapIntensity;\n\t}\n\tfloat getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {\n\t\tfloat maxMIPLevelScalar = float( maxMIPLevel );\n\t\tfloat desiredMIPLevel = maxMIPLevelScalar + 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );\n\t\treturn clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );\n\t}\n\tvec3 getLightProbeIndirectRadiance( const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );\n\t\t#endif\n\t\treflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n\t\tfloat specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );\n\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n\t\t\tvec4 envMapColor = textureCubeUV(queryReflectVec, BlinnExponentToGGXRoughness(blinnShininessExponent));\n\t\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\t\tvec2 sampleUV;\n\t\t\tsampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\t\t\tsampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\t\tvec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );\n\t\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\t\tvec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n\t\t\t#else\n\t\t\t\tvec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n\t\t\t#endif\n\t\t\tenvMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n\t\t#endif\n\t\treturn envMapColor.rgb * envMapIntensity;\n\t}\n#endif\n",ve="BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;\n",we="varying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\nstruct BlinnPhongMaterial {\n\tvec3\tdiffuseColor;\n\tvec3\tspecularColor;\n\tfloat\tspecularShininess;\n\tfloat\tspecularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\t#ifdef TOON\n\t\tvec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;\n\t#else\n\t\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\t\tvec3 irradiance = dotNL * directLight.color;\n\t#endif\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\treflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n\treflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_BlinnPhong\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_BlinnPhong\n#define Material_LightProbeLOD( material )\t(0)\n",xe="PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );\n#ifdef STANDARD\n\tmaterial.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );\n#else\n\tmaterial.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );\n\tmaterial.clearCoat = saturate( clearCoat );\tmaterial.clearCoatRoughness = clamp( clearCoatRoughness, 0.04, 1.0 );\n#endif\n",ye="struct PhysicalMaterial {\n\tvec3\tdiffuseColor;\n\tfloat\tspecularRoughness;\n\tvec3\tspecularColor;\n\t#ifndef STANDARD\n\t\tfloat clearCoat;\n\t\tfloat clearCoatRoughness;\n\t#endif\n};\n#define MAXIMUM_SPECULAR_COEFFICIENT 0.16\n#define DEFAULT_SPECULAR_COEFFICIENT 0.04\nfloat clearCoatDHRApprox( const in float roughness, const in float dotNL ) {\n\treturn DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n\tvoid RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t\tvec3 normal = geometry.normal;\n\t\tvec3 viewDir = geometry.viewDir;\n\t\tvec3 position = geometry.position;\n\t\tvec3 lightPos = rectAreaLight.position;\n\t\tvec3 halfWidth = rectAreaLight.halfWidth;\n\t\tvec3 halfHeight = rectAreaLight.halfHeight;\n\t\tvec3 lightColor = rectAreaLight.color;\n\t\tfloat roughness = material.specularRoughness;\n\t\tvec3 rectCoords[ 4 ];\n\t\trectCoords[ 0 ] = lightPos - halfWidth - halfHeight;\t\trectCoords[ 1 ] = lightPos + halfWidth - halfHeight;\n\t\trectCoords[ 2 ] = lightPos + halfWidth + halfHeight;\n\t\trectCoords[ 3 ] = lightPos - halfWidth + halfHeight;\n\t\tvec2 uv = LTC_Uv( normal, viewDir, roughness );\n\t\tfloat norm = texture2D( ltcMag, uv ).a;\n\t\tvec4 t = texture2D( ltcMat, uv );\n\t\tmat3 mInv = mat3(\n\t\t\tvec3(   1,   0, t.y ),\n\t\t\tvec3(   0, t.z,   0 ),\n\t\t\tvec3( t.w,   0, t.x )\n\t\t);\n\t\treflectedLight.directSpecular += lightColor * material.specularColor * norm * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n\t\treflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1 ), rectCoords );\n\t}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tirradiance *= PI;\n\t#endif\n\t#ifndef STANDARD\n\t\tfloat clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n\t#else\n\t\tfloat clearCoatDHR = 0.0;\n\t#endif\n\treflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );\n\treflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n\t#ifndef STANDARD\n\t\treflectedLight.directSpecular += irradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n\t#endif\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 clearCoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t#ifndef STANDARD\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\tfloat dotNL = dotNV;\n\t\tfloat clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n\t#else\n\t\tfloat clearCoatDHR = 0.0;\n\t#endif\n\treflectedLight.indirectSpecular += ( 1.0 - clearCoatDHR ) * radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );\n\t#ifndef STANDARD\n\t\treflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n\t#endif\n}\n#define RE_Direct\t\t\t\tRE_Direct_Physical\n#define RE_Direct_RectArea\t\tRE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular\t\tRE_IndirectSpecular_Physical\n#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )\n#define Material_ClearCoat_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.clearCoatRoughness )\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n\treturn saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}\n",ze="\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = normalize( vViewPosition );\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\tPointLight pointLight;\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tgetPointDirectLightIrradiance( pointLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\tSpotLight spotLight;\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tgetSpotDirectLightIrradiance( spotLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( spotLight.shadow, directLight.visible ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\tDirectionalLight directionalLight;\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tgetDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n\t\t#ifdef USE_SHADOWMAP\n\t\tdirectLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\tRectAreaLight rectAreaLight;\n\tfor ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\t\trectAreaLight = rectAreaLights[ i ];\n\t\tRE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\t}\n#endif\n#if defined( RE_IndirectDiffuse )\n\tvec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\t#ifdef USE_LIGHTMAP\n\t\tvec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tlightMapIrradiance *= PI;\n\t\t#endif\n\t\tirradiance += lightMapIrradiance;\n\t#endif\n\t#if ( NUM_HEMI_LIGHTS > 0 )\n\t\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\t\tirradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n\t\t}\n\t#endif\n\t#if defined( USE_ENVMAP ) && defined( PHYSICAL ) && defined( ENVMAP_TYPE_CUBE_UV )\n\t\tirradiance += getLightProbeIndirectIrradiance( geometry, 8 );\n\t#endif\n\tRE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\tvec3 radiance = getLightProbeIndirectRadiance( geometry, Material_BlinnShininessExponent( material ), 8 );\n\t#ifndef STANDARD\n\t\tvec3 clearCoatRadiance = getLightProbeIndirectRadiance( geometry, Material_ClearCoat_BlinnShininessExponent( material ), 8 );\n\t#else\n\t\tvec3 clearCoatRadiance = vec3( 0.0 );\n\t#endif\n\tRE_IndirectSpecular( radiance, clearCoatRadiance, geometry, material, reflectedLight );\n#endif\n",Ae="#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tgl_FragDepthEXT = log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif",Be="#ifdef USE_LOGDEPTHBUF\n\tuniform float logDepthBufFC;\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t#endif\n#endif\n",Ce="#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t#endif\n\tuniform float logDepthBufFC;\n#endif",De="#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\t#else\n\t\tgl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;\n\t\tgl_Position.z *= gl_Position.w;\n\t#endif\n#endif\n",Ee="#ifdef USE_MAP\n\tvec4 texelColor = texture2D( map, vUv );\n\ttexelColor = mapTexelToLinear( texelColor );\n\tdiffuseColor *= texelColor;\n#endif\n",Fe="#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif\n",Ge="#ifdef USE_MAP\n\tvec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n\tvec4 mapTexel = texture2D( map, uv );\n\tdiffuseColor *= mapTexelToLinear( mapTexel );\n#endif\n",He="#ifdef USE_MAP\n\tuniform mat3 uvTransform;\n\tuniform sampler2D map;\n#endif\n",Ie="float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n\tvec4 texelMetalness = texture2D( metalnessMap, vUv );\n\tmetalnessFactor *= texelMetalness.b;\n#endif\n",Je="#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif",Ke="#ifdef USE_MORPHNORMALS\n\tobjectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n\tobjectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n\tobjectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n\tobjectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n#endif\n",Le="#ifdef USE_MORPHTARGETS\n\t#ifndef USE_MORPHNORMALS\n\tuniform float morphTargetInfluences[ 8 ];\n\t#else\n\tuniform float morphTargetInfluences[ 4 ];\n\t#endif\n#endif",Me="#ifdef USE_MORPHTARGETS\n\ttransformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n\ttransformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n\ttransformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n\ttransformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\t#ifndef USE_MORPHNORMALS\n\ttransformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n\ttransformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n\ttransformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n\ttransformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\t#endif\n#endif\n",Ne="#ifdef FLAT_SHADED\n\tvec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n#else\n\tvec3 normal = normalize( vNormal );\n\t#ifdef DOUBLE_SIDED\n\t\tnormal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t#endif\n#endif\n#ifdef USE_NORMALMAP\n\tnormal = perturbNormal2Arb( -vViewPosition, normal );\n#elif defined( USE_BUMPMAP )\n\tnormal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n#endif\n",Oe="#ifdef USE_NORMALMAP\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\t\tvec3 S = normalize( q0 * st1.t - q1 * st0.t );\n\t\tvec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n\t\tvec3 N = normalize( surf_norm );\n\t\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t\tmapN.xy = normalScale * mapN.xy;\n\t\tmat3 tsn = mat3( S, T, N );\n\t\treturn normalize( tsn * mapN );\n\t}\n#endif\n",Pe="vec3 packNormalToRGB( const in vec3 normal ) {\n\treturn normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n\treturn 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n\tvec4 r = vec4( fract( v * PackFactors ), v );\n\tr.yzw -= r.xyz * ShiftRight8;\treturn r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n\treturn dot( v, UnpackFactors );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {\n\treturn linearClipZ * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn (( near + viewZ ) * far ) / (( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {\n\treturn ( near * far ) / ( ( far - near ) * invClipZ - far );\n}\n",Qe="#ifdef PREMULTIPLIED_ALPHA\n\tgl_FragColor.rgb *= gl_FragColor.a;\n#endif\n",Re="vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\ngl_Position = projectionMatrix * mvPosition;\n",Se="#if defined( DITHERING )\n  gl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif\n",Te="#if defined( DITHERING )\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif\n",Ue="float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n\tvec4 texelRoughness = texture2D( roughnessMap, vUv );\n\troughnessFactor *= texelRoughness.g;\n#endif\n",Ve="#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif",We="#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\t\tuniform sampler2D spotShadowMap[ NUM_SPOT_LIGHTS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\t\tuniform sampler2D pointShadowMap[ NUM_POINT_LIGHTS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n\t#endif\n\tfloat texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n\t\treturn step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n\t}\n\tfloat texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) {\n\t\tconst vec2 offset = vec2( 0.0, 1.0 );\n\t\tvec2 texelSize = vec2( 1.0 ) / size;\n\t\tvec2 centroidUV = floor( uv * size + 0.5 ) / size;\n\t\tfloat lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );\n\t\tfloat lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );\n\t\tfloat rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );\n\t\tfloat rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );\n\t\tvec2 f = fract( uv * size + 0.5 );\n\t\tfloat a = mix( lb, lt, f.y );\n\t\tfloat b = mix( rb, rt, f.y );\n\t\tfloat c = mix( a, b, f.x );\n\t\treturn c;\n\t}\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tfloat shadow = 1.0;\n\t\tshadowCoord.xyz /= shadowCoord.w;\n\t\tshadowCoord.z += shadowBias;\n\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\tbool inFrustum = all( inFrustumVec );\n\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\t\tbool frustumTest = all( frustumTestVec );\n\t\tif ( frustumTest ) {\n\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tshadow = (\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\tshadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#endif\n\t\t}\n\t\treturn shadow;\n\t}\n\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\t\tvec3 absV = abs( v );\n\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\tabsV *= scaleToCube;\n\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\t\tvec2 planar = v.xy;\n\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\tfloat almostOne = 1.0 - almostATexel;\n\t\tif ( absV.z >= almostOne ) {\n\t\t\tif ( v.z > 0.0 )\n\t\t\t\tplanar.x = 4.0 - v.x;\n\t\t} else if ( absV.x >= almostOne ) {\n\t\t\tfloat signX = sign( v.x );\n\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\t\t} else if ( absV.y >= almostOne ) {\n\t\t\tfloat signY = sign( v.y );\n\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\tplanar.y = v.z * signY - 2.0;\n\t\t}\n\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\t}\n\tfloat getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n\t\tvec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n\t\tvec3 lightToPosition = shadowCoord.xyz;\n\t\tfloat dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );\t\tdp += shadowBias;\n\t\tvec3 bd3D = normalize( lightToPosition );\n\t\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n\t\t\treturn (\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\treturn texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n\t\t#endif\n\t}\n#endif\n",Xe="#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\t\tuniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\t\tuniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHTS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\t\tuniform mat4 pointShadowMatrix[ NUM_POINT_LIGHTS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n\t#endif\n#endif\n",Ye="#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tvSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tvPointShadowCoord[ i ] = pointShadowMatrix[ i ] * worldPosition;\n\t}\n\t#endif\n#endif\n",Ze="float getShadowMask() {\n\tfloat shadow = 1.0;\n\t#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHTS > 0\n\tDirectionalLight directionalLight;\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tshadow *= bool( directionalLight.shadow ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#if NUM_SPOT_LIGHTS > 0\n\tSpotLight spotLight;\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tshadow *= bool( spotLight.shadow ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t}\n\t#endif\n\t#if NUM_POINT_LIGHTS > 0\n\tPointLight pointLight;\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tshadow *= bool( pointLight.shadow ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n\t}\n\t#endif\n\t#endif\n\treturn shadow;\n}\n",$e="#ifdef USE_SKINNING\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",_e="#ifdef USE_SKINNING\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\t#ifdef BONE_TEXTURE\n\t\tuniform sampler2D boneTexture;\n\t\tuniform int boneTextureSize;\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureSize ) );\n\t\t\tfloat y = floor( j / float( boneTextureSize ) );\n\t\t\tfloat dx = 1.0 / float( boneTextureSize );\n\t\t\tfloat dy = 1.0 / float( boneTextureSize );\n\t\t\ty = dy * ( y + 0.5 );\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\t\t\treturn bone;\n\t\t}\n\t#else\n\t\tuniform mat4 boneMatrices[ MAX_BONES ];\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tmat4 bone = boneMatrices[ int(i) ];\n\t\t\treturn bone;\n\t\t}\n\t#endif\n#endif\n",af="#ifdef USE_SKINNING\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\ttransformed = ( bindMatrixInverse * skinned ).xyz;\n#endif\n",bf="#ifdef USE_SKINNING\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n#endif\n",cf="float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif",df="#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif",ef="#if defined( TONE_MAPPING )\n  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif\n",ff="#ifndef saturate\n\t#define saturate(a) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nuniform float toneMappingWhitePoint;\nvec3 LinearToneMapping( vec3 color ) {\n\treturn toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( color / ( vec3( 1.0 ) + color ) );\n}\n#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )\nvec3 Uncharted2ToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\tcolor = max( vec3( 0.0 ), color - 0.004 );\n\treturn pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\n",gf="#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvarying vec2 vUv;\n#endif",hf="#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvarying vec2 vUv;\n\tuniform mat3 uvTransform;\n#endif\n",jf="#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n#endif",kf="#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvarying vec2 vUv2;\n#endif",lf="#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tattribute vec2 uv2;\n\tvarying vec2 vUv2;\n#endif",mf="#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvUv2 = uv2;\n#endif",nf="#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )\n\tvec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n#endif\n",of="uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldPosition;\nvoid main() {\n\tgl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );\n\tgl_FragColor.a *= opacity;\n}\n",pf="varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\tgl_Position.z = gl_Position.w;\n}\n",qf="#if DEPTH_PACKING == 3200\n\tuniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#if DEPTH_PACKING == 3200\n\t\tdiffuseColor.a = opacity;\n\t#endif\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <logdepthbuf_fragment>\n\t#if DEPTH_PACKING == 3200\n\t\tgl_FragColor = vec4( vec3( gl_FragCoord.z ), opacity );\n\t#elif DEPTH_PACKING == 3201\n\t\tgl_FragColor = packDepthToRGBA( gl_FragCoord.z );\n\t#endif\n}\n",rf="#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n}\n",sf="#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\tfloat dist = length( vWorldPosition - referencePosition );\n\tdist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n\tdist = saturate( dist );\n\tgl_FragColor = packDepthToRGBA( dist );\n}\n",tf="#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\tvWorldPosition = worldPosition.xyz;\n}\n",uf="uniform sampler2D tEquirect;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvec3 direction = normalize( vWorldPosition );\n\tvec2 sampleUV;\n\tsampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\tsampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\n\tgl_FragColor = texture2D( tEquirect, sampleUV );\n}\n",vf="varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n\tvWorldPosition = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}\n",wf="uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {\n\t\tdiscard;\n\t}\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <color_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n",xf="uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\tvLineDistance = scale * lineDistance;\n\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\tgl_Position = projectionMatrix * mvPosition;\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}\n",yf="uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t#ifdef USE_LIGHTMAP\n\t\treflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n\t#else\n\t\treflectedLight.indirectDiffuse += vec3( 1.0 );\n\t#endif\n\t#include <aomap_fragment>\n\treflectedLight.indirectDiffuse *= diffuseColor.rgb;\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n",zf="#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_ENVMAP\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <envmap_vertex>\n\t#include <fog_vertex>\n}\n",Af="uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <emissivemap_fragment>\n\treflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\t#include <lightmap_fragment>\n\treflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\t#ifdef DOUBLE_SIDED\n\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\t#else\n\t\treflectedLight.directDiffuse = vLightFront;\n\t#endif\n\treflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n",Bf="#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <bsdfs>\n#include <lights_pars>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <lights_lambert_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",Cf="#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\t#include <lights_phong_fragment>\n\t#include <lights_template>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n",Df="#define PHONG\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",Ef="#define PHYSICAL\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifndef STANDARD\n\tuniform float clearCoat;\n\tuniform float clearCoatRoughness;\n#endif\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <lights_pars>\n#include <lights_physical_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_template>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}\n",Ff="#define PHYSICAL\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",Gf="#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <packing>\n#include <uv_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\nvoid main() {\n\t#include <logdepthbuf_fragment>\n\t#include <normal_fragment>\n\tgl_FragColor = vec4( packNormalToRGB( normal ), opacity );\n}\n",Hf="#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n}\n",If="uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_particle_fragment>\n\t#include <color_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}\n",Jf="uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#ifdef USE_SIZEATTENUATION\n\t\tgl_PointSize = size * ( scale / - mvPosition.z );\n\t#else\n\t\tgl_PointSize = size;\n\t#endif\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",Kf="uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n\tgl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n\t#include <fog_fragment>\n}\n",Lf="#include <fog_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}\n",Mf={alphamap_fragment:Kd,alphamap_pars_fragment:Ld,alphatest_fragment:Md,aomap_fragment:Nd,aomap_pars_fragment:Od,begin_vertex:Pd,beginnormal_vertex:Qd,bsdfs:Rd,bumpmap_pars_fragment:Sd,clipping_planes_fragment:Td,clipping_planes_pars_fragment:Ud,clipping_planes_pars_vertex:Vd,clipping_planes_vertex:Wd,color_fragment:Xd,color_pars_fragment:Yd,color_pars_vertex:Zd,color_vertex:$d,common:_d,cube_uv_reflection_fragment:ae,defaultnormal_vertex:be,displacementmap_pars_vertex:ce,displacementmap_vertex:de,emissivemap_fragment:ee,emissivemap_pars_fragment:fe,encodings_fragment:ge,encodings_pars_fragment:he,envmap_fragment:ie,envmap_pars_fragment:je,envmap_pars_vertex:ke,envmap_vertex:le,fog_vertex:me,fog_pars_vertex:ne,fog_fragment:oe,fog_pars_fragment:pe,gradientmap_pars_fragment:qe,lightmap_fragment:re,lightmap_pars_fragment:se,lights_lambert_vertex:te,lights_pars:ue,lights_phong_fragment:ve,lights_phong_pars_fragment:we,lights_physical_fragment:xe,lights_physical_pars_fragment:ye,lights_template:ze,logdepthbuf_fragment:Ae,logdepthbuf_pars_fragment:Be,logdepthbuf_pars_vertex:Ce,logdepthbuf_vertex:De,map_fragment:Ee,map_pars_fragment:Fe,map_particle_fragment:Ge,map_particle_pars_fragment:He,metalnessmap_fragment:Ie,metalnessmap_pars_fragment:Je,morphnormal_vertex:Ke,morphtarget_pars_vertex:Le,morphtarget_vertex:Me,normal_fragment:Ne,normalmap_pars_fragment:Oe,packing:Pe,premultiplied_alpha_fragment:Qe,project_vertex:Re,dithering_fragment:Se,dithering_pars_fragment:Te,roughnessmap_fragment:Ue,roughnessmap_pars_fragment:Ve,shadowmap_pars_fragment:We,shadowmap_pars_vertex:Xe,shadowmap_vertex:Ye,shadowmask_pars_fragment:Ze,skinbase_vertex:$e,skinning_pars_vertex:_e,skinning_vertex:af,skinnormal_vertex:bf,specularmap_fragment:cf,specularmap_pars_fragment:df,tonemapping_fragment:ef,tonemapping_pars_fragment:ff,uv_pars_fragment:gf,uv_pars_vertex:hf,uv_vertex:jf,uv2_pars_fragment:kf,uv2_pars_vertex:lf,uv2_vertex:mf,worldpos_vertex:nf,cube_frag:of,cube_vert:pf,depth_frag:qf,depth_vert:rf,distanceRGBA_frag:sf,distanceRGBA_vert:tf,equirect_frag:uf,equirect_vert:vf,linedashed_frag:wf,linedashed_vert:xf,meshbasic_frag:yf,meshbasic_vert:zf,meshlambert_frag:Af,meshlambert_vert:Bf,meshphong_frag:Cf,meshphong_vert:Df,meshphysical_frag:Ef,meshphysical_vert:Ff,normal_frag:Gf,normal_vert:Hf,points_frag:If,points_vert:Jf,shadow_frag:Kf,shadow_vert:Lf},Nf={basic:{uniforms:Jd.merge([Id.common,Id.specularmap,Id.envmap,Id.aomap,Id.lightmap,Id.fog]),vertexShader:Mf.meshbasic_vert,fragmentShader:Mf.meshbasic_frag},lambert:{uniforms:Jd.merge([Id.common,Id.specularmap,Id.envmap,Id.aomap,Id.lightmap,Id.emissivemap,Id.fog,Id.lights,{emissive:{value:new U(0)}}]),vertexShader:Mf.meshlambert_vert,fragmentShader:Mf.meshlambert_frag},phong:{uniforms:Jd.merge([Id.common,Id.specularmap,Id.envmap,Id.aomap,Id.lightmap,Id.emissivemap,Id.bumpmap,Id.normalmap,Id.displacementmap,Id.gradientmap,Id.fog,Id.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30}}]),vertexShader:Mf.meshphong_vert,fragmentShader:Mf.meshphong_frag},standard:{uniforms:Jd.merge([Id.common,Id.envmap,Id.aomap,Id.lightmap,Id.emissivemap,Id.bumpmap,Id.normalmap,Id.displacementmap,Id.roughnessmap,Id.metalnessmap,Id.fog,Id.lights,{emissive:{value:new U(0)},roughness:{value:.5},metalness:{value:.5},envMapIntensity:{value:1}}]),vertexShader:Mf.meshphysical_vert,fragmentShader:Mf.meshphysical_frag},points:{uniforms:Jd.merge([Id.points,Id.fog]),vertexShader:Mf.points_vert,fragmentShader:Mf.points_frag},dashed:{uniforms:Jd.merge([Id.common,Id.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Mf.linedashed_vert,fragmentShader:Mf.linedashed_frag},depth:{uniforms:Jd.merge([Id.common,Id.displacementmap]),vertexShader:Mf.depth_vert,fragmentShader:Mf.depth_frag},normal:{uniforms:Jd.merge([Id.common,Id.bumpmap,Id.normalmap,Id.displacementmap,{opacity:{value:1}}]),vertexShader:Mf.normal_vert,fragmentShader:Mf.normal_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Mf.cube_vert,fragmentShader:Mf.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Mf.equirect_vert,fragmentShader:Mf.equirect_frag},distanceRGBA:{uniforms:Jd.merge([Id.common,Id.displacementmap,{referencePosition:{value:new f},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Mf.distanceRGBA_vert,fragmentShader:Mf.distanceRGBA_frag},shadow:{uniforms:Jd.merge([Id.lights,Id.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:Mf.shadow_vert,fragmentShader:Mf.shadow_frag}};Nf.physical={uniforms:Jd.merge([Nf.standard.uniforms,{clearCoat:{value:0},clearCoatRoughness:{value:0}}]),vertexShader:Mf.meshphysical_vert,fragmentShader:Mf.meshphysical_frag},Object.assign(V.prototype,{set:function(a,b){return this.min.copy(a),this.max.copy(b),this},setFromPoints:function(a){this.makeEmpty();for(var b=0,c=a.length;b<c;b++)this.expandByPoint(a[b]);return this},setFromCenterAndSize:function(){var a=new c;return function(b,c){var d=a.copy(c).multiplyScalar(.5);return this.min.copy(b).sub(d),this.max.copy(b).add(d),this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.min.copy(a.min),this.max.copy(a.max),this},makeEmpty:function(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this},isEmpty:function(){return this.max.x<this.min.x||this.max.y<this.min.y},getCenter:function(a){var b=a||new c;return this.isEmpty()?b.set(0,0):b.addVectors(this.min,this.max).multiplyScalar(.5)},getSize:function(a){var b=a||new c;return this.isEmpty()?b.set(0,0):b.subVectors(this.max,this.min)},expandByPoint:function(a){return this.min.min(a),this.max.max(a),this},expandByVector:function(a){return this.min.sub(a),this.max.add(a),this},expandByScalar:function(a){return this.min.addScalar(-a),this.max.addScalar(a),this},containsPoint:function(a){return!(a.x<this.min.x||a.x>this.max.x||a.y<this.min.y||a.y>this.max.y)},containsBox:function(a){return this.min.x<=a.min.x&&a.max.x<=this.max.x&&this.min.y<=a.min.y&&a.max.y<=this.max.y},getParameter:function(a,b){return(b||new c).set((a.x-this.min.x)/(this.max.x-this.min.x),(a.y-this.min.y)/(this.max.y-this.min.y))},intersectsBox:function(a){return!(a.max.x<this.min.x||a.min.x>this.max.x||a.max.y<this.min.y||a.min.y>this.max.y)},clampPoint:function(a,b){return(b||new c).copy(a).clamp(this.min,this.max)},distanceToPoint:function(){var a=new c;return function(b){return a.copy(b).clamp(this.min,this.max).sub(b).length()}}(),intersect:function(a){return this.min.max(a.min),this.max.min(a.max),this},union:function(a){return this.min.min(a.min),this.max.max(a.max),this},translate:function(a){return this.min.add(a),this.max.add(a),this},equals:function(a){return a.min.equals(this.min)&&a.max.equals(this.max)}}),X.prototype=Object.create(h.prototype),X.prototype.constructor=X;var Of=0;Z.prototype=Object.assign(Object.create(b.prototype),{constructor:Z,isMaterial:!0,onBeforeCompile:function(){},setValues:function(a){if(void 0!==a)for(var b in a){var c=a[b];if(void 0!==c)if("shading"!==b){var d=this[b];void 0!==d?d&&d.isColor?d.set(c):d&&d.isVector3&&c&&c.isVector3?d.copy(c):this[b]="overdraw"===b?Number(c):c:console.warn("THREE."+this.type+": '"+b+"' is not a property of this material.")}else console.warn("THREE."+this.type+": .shading has been removed. Use the boolean .flatShading instead."),this.flatShading=c===Jb;else console.warn("THREE.Material: '"+b+"' parameter is undefined.")}},toJSON:function(a){function b(a){var b=[];for(var c in a){var d=a[c];delete d.metadata,b.push(d)}return b}var c=void 0===a||"string"==typeof a;c&&(a={textures:{},images:{}});var d={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};if(d.uuid=this.uuid,d.type=this.type,""!==this.name&&(d.name=this.name),this.color&&this.color.isColor&&(d.color=this.color.getHex()),void 0!==this.roughness&&(d.roughness=this.roughness),void 0!==this.metalness&&(d.metalness=this.metalness),this.emissive&&this.emissive.isColor&&(d.emissive=this.emissive.getHex()),1!==this.emissiveIntensity&&(d.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(d.specular=this.specular.getHex()),void 0!==this.shininess&&(d.shininess=this.shininess),void 0!==this.clearCoat&&(d.clearCoat=this.clearCoat),void 0!==this.clearCoatRoughness&&(d.clearCoatRoughness=this.clearCoatRoughness),this.map&&this.map.isTexture&&(d.map=this.map.toJSON(a).uuid),this.alphaMap&&this.alphaMap.isTexture&&(d.alphaMap=this.alphaMap.toJSON(a).uuid),this.lightMap&&this.lightMap.isTexture&&(d.lightMap=this.lightMap.toJSON(a).uuid),this.bumpMap&&this.bumpMap.isTexture&&(d.bumpMap=this.bumpMap.toJSON(a).uuid,d.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(d.normalMap=this.normalMap.toJSON(a).uuid,d.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(d.displacementMap=this.displacementMap.toJSON(a).uuid,d.displacementScale=this.displacementScale,d.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(d.roughnessMap=this.roughnessMap.toJSON(a).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(d.metalnessMap=this.metalnessMap.toJSON(a).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(d.emissiveMap=this.emissiveMap.toJSON(a).uuid),this.specularMap&&this.specularMap.isTexture&&(d.specularMap=this.specularMap.toJSON(a).uuid),this.envMap&&this.envMap.isTexture&&(d.envMap=this.envMap.toJSON(a).uuid,d.reflectivity=this.reflectivity),this.gradientMap&&this.gradientMap.isTexture&&(d.gradientMap=this.gradientMap.toJSON(a).uuid),void 0!==this.size&&(d.size=this.size),void 0!==this.sizeAttenuation&&(d.sizeAttenuation=this.sizeAttenuation),this.blending!==Mb&&(d.blending=this.blending),!0===this.flatShading&&(d.flatShading=this.flatShading),this.side!==Gb&&(d.side=this.side),this.vertexColors!==Kb&&(d.vertexColors=this.vertexColors),this.opacity<1&&(d.opacity=this.opacity),!0===this.transparent&&(d.transparent=this.transparent),d.depthFunc=this.depthFunc,d.depthTest=this.depthTest,d.depthWrite=this.depthWrite,0!==this.rotation&&(d.rotation=this.rotation),1!==this.linewidth&&(d.linewidth=this.linewidth),void 0!==this.dashSize&&(d.dashSize=this.dashSize),void 0!==this.gapSize&&(d.gapSize=this.gapSize),void 0!==this.scale&&(d.scale=this.scale),!0===this.dithering&&(d.dithering=!0),this.alphaTest>0&&(d.alphaTest=this.alphaTest),!0===this.premultipliedAlpha&&(d.premultipliedAlpha=this.premultipliedAlpha),!0===this.wireframe&&(d.wireframe=this.wireframe),this.wireframeLinewidth>1&&(d.wireframeLinewidth=this.wireframeLinewidth),"round"!==this.wireframeLinecap&&(d.wireframeLinecap=this.wireframeLinecap),"round"!==this.wireframeLinejoin&&(d.wireframeLinejoin=this.wireframeLinejoin),!0===this.morphTargets&&(d.morphTargets=!0),!0===this.skinning&&(d.skinning=!0),!1===this.visible&&(d.visible=!1),"{}"!==JSON.stringify(this.userData)&&(d.userData=this.userData),c){var e=b(a.textures),f=b(a.images);e.length>0&&(d.textures=e),f.length>0&&(d.images=f)}return d},clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.name=a.name,this.fog=a.fog,this.lights=a.lights,this.blending=a.blending,this.side=a.side,this.flatShading=a.flatShading,this.vertexColors=a.vertexColors,this.opacity=a.opacity,this.transparent=a.transparent,this.blendSrc=a.blendSrc,this.blendDst=a.blendDst,this.blendEquation=a.blendEquation,this.blendSrcAlpha=a.blendSrcAlpha,this.blendDstAlpha=a.blendDstAlpha,this.blendEquationAlpha=a.blendEquationAlpha,this.depthFunc=a.depthFunc,this.depthTest=a.depthTest,this.depthWrite=a.depthWrite,this.colorWrite=a.colorWrite,this.precision=a.precision,this.polygonOffset=a.polygonOffset,this.polygonOffsetFactor=a.polygonOffsetFactor,this.polygonOffsetUnits=a.polygonOffsetUnits,this.dithering=a.dithering,this.alphaTest=a.alphaTest,this.premultipliedAlpha=a.premultipliedAlpha,this.overdraw=a.overdraw,this.visible=a.visible,this.userData=JSON.parse(JSON.stringify(a.userData)),this.clipShadows=a.clipShadows,this.clipIntersection=a.clipIntersection;var b=a.clippingPlanes,c=null;if(null!==b){var d=b.length;c=new Array(d);for(var e=0;e!==d;++e)c[e]=b[e].clone()}return this.clippingPlanes=c,this},dispose:function(){this.dispatchEvent({type:"dispose"})}}),$.prototype=Object.create(Z.prototype),$.prototype.constructor=$,$.prototype.isMeshDepthMaterial=!0,$.prototype.copy=function(a){return Z.prototype.copy.call(this,a),this.depthPacking=a.depthPacking,this.skinning=a.skinning,this.morphTargets=a.morphTargets,this.map=a.map,this.alphaMap=a.alphaMap,this.displacementMap=a.displacementMap,this.displacementScale=a.displacementScale,this.displacementBias=a.displacementBias,this.wireframe=a.wireframe,this.wireframeLinewidth=a.wireframeLinewidth,this},_.prototype=Object.create(Z.prototype),_.prototype.constructor=_,_.prototype.isMeshDistanceMaterial=!0,_.prototype.copy=function(a){return Z.prototype.copy.call(this,a),this.referencePosition.copy(a.referencePosition),this.nearDistance=a.nearDistance,this.farDistance=a.farDistance,this.skinning=a.skinning,this.morphTargets=a.morphTargets,this.map=a.map,this.alphaMap=a.alphaMap,this.displacementMap=a.displacementMap,this.displacementScale=a.displacementScale,this.displacementBias=a.displacementBias,this},Object.assign(aa.prototype,{isBox3:!0,set:function(a,b){return this.min.copy(a),this.max.copy(b),this},setFromArray:function(a){for(var b=1/0,c=1/0,d=1/0,e=-1/0,f=-1/0,g=-1/0,h=0,i=a.length;h<i;h+=3){var j=a[h],k=a[h+1],l=a[h+2];j<b&&(b=j),k<c&&(c=k),l<d&&(d=l),j>e&&(e=j),k>f&&(f=k),l>g&&(g=l)}return this.min.set(b,c,d),this.max.set(e,f,g),this},setFromBufferAttribute:function(a){for(var b=1/0,c=1/0,d=1/0,e=-1/0,f=-1/0,g=-1/0,h=0,i=a.count;h<i;h++){var j=a.getX(h),k=a.getY(h),l=a.getZ(h);j<b&&(b=j),k<c&&(c=k),l<d&&(d=l),j>e&&(e=j),k>f&&(f=k),l>g&&(g=l)}return this.min.set(b,c,d),this.max.set(e,f,g),this},setFromPoints:function(a){this.makeEmpty();for(var b=0,c=a.length;b<c;b++)this.expandByPoint(a[b]);return this},setFromCenterAndSize:function(){var a=new f;return function(b,c){var d=a.copy(c).multiplyScalar(.5);return this.min.copy(b).sub(d),this.max.copy(b).add(d),this}}(),setFromObject:function(a){return this.makeEmpty(),this.expandByObject(a)},clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.min.copy(a.min),this.max.copy(a.max),this},makeEmpty:function(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this},isEmpty:function(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z},getCenter:function(a){var b=a||new f;return this.isEmpty()?b.set(0,0,0):b.addVectors(this.min,this.max).multiplyScalar(.5)},getSize:function(a){var b=a||new f;return this.isEmpty()?b.set(0,0,0):b.subVectors(this.max,this.min)},expandByPoint:function(a){return this.min.min(a),this.max.max(a),this},expandByVector:function(a){return this.min.sub(a),this.max.add(a),this},expandByScalar:function(a){return this.min.addScalar(-a),this.max.addScalar(a),this},expandByObject:function(){function a(a){var f=a.geometry;if(void 0!==f)if(f.isGeometry){var g=f.vertices;for(c=0,d=g.length;c<d;c++)e.copy(g[c]),e.applyMatrix4(a.matrixWorld),b.expandByPoint(e)}else if(f.isBufferGeometry){var h=f.attributes.position;if(void 0!==h)for(c=0,d=h.count;c<d;c++)e.fromBufferAttribute(h,c).applyMatrix4(a.matrixWorld),b.expandByPoint(e)}}var b,c,d,e=new f;return function(c){return b=this,c.updateMatrixWorld(!0),c.traverse(a),this}}(),containsPoint:function(a){return!(a.x<this.min.x||a.x>this.max.x||a.y<this.min.y||a.y>this.max.y||a.z<this.min.z||a.z>this.max.z)},containsBox:function(a){return this.min.x<=a.min.x&&a.max.x<=this.max.x&&this.min.y<=a.min.y&&a.max.y<=this.max.y&&this.min.z<=a.min.z&&a.max.z<=this.max.z},getParameter:function(a,b){return(b||new f).set((a.x-this.min.x)/(this.max.x-this.min.x),(a.y-this.min.y)/(this.max.y-this.min.y),(a.z-this.min.z)/(this.max.z-this.min.z))},intersectsBox:function(a){return!(a.max.x<this.min.x||a.min.x>this.max.x||a.max.y<this.min.y||a.min.y>this.max.y||a.max.z<this.min.z||a.min.z>this.max.z)},intersectsSphere:function(){var a=new f;return function(b){return this.clampPoint(b.center,a),a.distanceToSquared(b.center)<=b.radius*b.radius}}(),intersectsPlane:function(a){var b,c;return a.normal.x>0?(b=a.normal.x*this.min.x,c=a.normal.x*this.max.x):(b=a.normal.x*this.max.x,c=a.normal.x*this.min.x),a.normal.y>0?(b+=a.normal.y*this.min.y,c+=a.normal.y*this.max.y):(b+=a.normal.y*this.max.y,c+=a.normal.y*this.min.y),a.normal.z>0?(b+=a.normal.z*this.min.z,c+=a.normal.z*this.max.z):(b+=a.normal.z*this.max.z,c+=a.normal.z*this.min.z),b<=a.constant&&c>=a.constant},clampPoint:function(a,b){return(b||new f).copy(a).clamp(this.min,this.max)},distanceToPoint:function(){var a=new f;return function(b){return a.copy(b).clamp(this.min,this.max).sub(b).length()}}(),getBoundingSphere:function(){var a=new f;return function(b){var c=b||new ba;return this.getCenter(c.center),c.radius=.5*this.getSize(a).length(),c}}(),intersect:function(a){return this.min.max(a.min),this.max.min(a.max),this.isEmpty()&&this.makeEmpty(),this},union:function(a){return this.min.min(a.min),this.max.max(a.max),this},applyMatrix4:function(){var a=[new f,new f,new f,new f,new f,new f,new f,new f];return function(b){return this.isEmpty()?this:(a[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(b),a[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(b),a[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(b),a[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(b),a[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(b),a[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(b),a[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(b),a[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(b),this.setFromPoints(a),this)}}(),translate:function(a){return this.min.add(a),this.max.add(a),this},equals:function(a){return a.min.equals(this.min)&&a.max.equals(this.max)}}),Object.assign(ba.prototype,{set:function(a,b){return this.center.copy(a),this.radius=b,this},setFromPoints:function(){var a=new aa;return function(b,c){var d=this.center;void 0!==c?d.copy(c):a.setFromPoints(b).getCenter(d);for(var e=0,f=0,g=b.length;f<g;f++)e=Math.max(e,d.distanceToSquared(b[f]));return this.radius=Math.sqrt(e),this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.center.copy(a.center),this.radius=a.radius,this},empty:function(){return this.radius<=0},containsPoint:function(a){return a.distanceToSquared(this.center)<=this.radius*this.radius},distanceToPoint:function(a){return a.distanceTo(this.center)-this.radius},intersectsSphere:function(a){var b=this.radius+a.radius;return a.center.distanceToSquared(this.center)<=b*b},intersectsBox:function(a){return a.intersectsSphere(this)},intersectsPlane:function(a){return Math.abs(a.distanceToPoint(this.center))<=this.radius},clampPoint:function(a,b){var c=this.center.distanceToSquared(a),d=b||new f;return d.copy(a),c>this.radius*this.radius&&(d.sub(this.center).normalize(),d.multiplyScalar(this.radius).add(this.center)),d},getBoundingBox:function(a){var b=a||new aa;return b.set(this.center,this.center),b.expandByScalar(this.radius),b},applyMatrix4:function(a){return this.center.applyMatrix4(a),this.radius=this.radius*a.getMaxScaleOnAxis(),this},translate:function(a){return this.center.add(a),this},equals:function(a){return a.center.equals(this.center)&&a.radius===this.radius}}),Object.assign(ca.prototype,{set:function(a,b){return this.normal.copy(a),this.constant=b,this},setComponents:function(a,b,c,d){return this.normal.set(a,b,c),this.constant=d,this},setFromNormalAndCoplanarPoint:function(a,b){return this.normal.copy(a),this.constant=-b.dot(this.normal),this},setFromCoplanarPoints:function(){var a=new f,b=new f;return function(c,d,e){var f=a.subVectors(e,d).cross(b.subVectors(c,d)).normalize();return this.setFromNormalAndCoplanarPoint(f,c),this}}(),clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.normal.copy(a.normal),this.constant=a.constant,this},normalize:function(){var a=1/this.normal.length();return this.normal.multiplyScalar(a),this.constant*=a,this},negate:function(){return this.constant*=-1,this.normal.negate(),this},distanceToPoint:function(a){return this.normal.dot(a)+this.constant},distanceToSphere:function(a){return this.distanceToPoint(a.center)-a.radius},projectPoint:function(a,b){return(b||new f).copy(this.normal).multiplyScalar(-this.distanceToPoint(a)).add(a)},intersectLine:function(){var a=new f;return function(b,c){var d=c||new f,e=b.delta(a),g=this.normal.dot(e);if(0!==g){var h=-(b.start.dot(this.normal)+this.constant)/g;if(!(h<0||h>1))return d.copy(e).multiplyScalar(h).add(b.start)}else if(0===this.distanceToPoint(b.start))return d.copy(b.start)}}(),intersectsLine:function(a){var b=this.distanceToPoint(a.start),c=this.distanceToPoint(a.end);return b<0&&c>0||c<0&&b>0},intersectsBox:function(a){return a.intersectsPlane(this)},intersectsSphere:function(a){return a.intersectsPlane(this)},coplanarPoint:function(a){return(a||new f).copy(this.normal).multiplyScalar(-this.constant)},applyMatrix4:function(){var a=new f,b=new g;return function(c,d){var e=d||b.getNormalMatrix(c),f=this.coplanarPoint(a).applyMatrix4(c),g=this.normal.applyMatrix3(e).normalize();return this.constant=-f.dot(g),this}}(),translate:function(a){return this.constant-=a.dot(this.normal),this},equals:function(a){return a.normal.equals(this.normal)&&a.constant===this.constant}}),Object.assign(da.prototype,{set:function(a,b,c,d,e,f){var g=this.planes;return g[0].copy(a),g[1].copy(b),g[2].copy(c),g[3].copy(d),g[4].copy(e),g[5].copy(f),this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){for(var b=this.planes,c=0;c<6;c++)b[c].copy(a.planes[c]);return this},setFromMatrix:function(a){var b=this.planes,c=a.elements,d=c[0],e=c[1],f=c[2],g=c[3],h=c[4],i=c[5],j=c[6],k=c[7],l=c[8],m=c[9],n=c[10],o=c[11],p=c[12],q=c[13],r=c[14],s=c[15];return b[0].setComponents(g-d,k-h,o-l,s-p).normalize(),b[1].setComponents(g+d,k+h,o+l,s+p).normalize(),b[2].setComponents(g+e,k+i,o+m,s+q).normalize(),b[3].setComponents(g-e,k-i,o-m,s-q).normalize(),b[4].setComponents(g-f,k-j,o-n,s-r).normalize(),b[5].setComponents(g+f,k+j,o+n,s+r).normalize(),this},intersectsObject:function(){var a=new ba;return function(b){var c=b.geometry;return null===c.boundingSphere&&c.computeBoundingSphere(),a.copy(c.boundingSphere).applyMatrix4(b.matrixWorld),this.intersectsSphere(a)}}(),intersectsSprite:function(){var a=new ba;return function(b){return a.center.set(0,0,0),a.radius=.7071067811865476,a.applyMatrix4(b.matrixWorld),this.intersectsSphere(a)}}(),intersectsSphere:function(a){for(var b=this.planes,c=a.center,d=-a.radius,e=0;e<6;e++){if(b[e].distanceToPoint(c)<d)return!1}return!0},intersectsBox:function(){var a=new f,b=new f;return function(c){for(var d=this.planes,e=0;e<6;e++){var f=d[e];a.x=f.normal.x>0?c.min.x:c.max.x,b.x=f.normal.x>0?c.max.x:c.min.x,a.y=f.normal.y>0?c.min.y:c.max.y,b.y=f.normal.y>0?c.max.y:c.min.y,a.z=f.normal.z>0?c.min.z:c.max.z,b.z=f.normal.z>0?c.max.z:c.min.z;var g=f.distanceToPoint(a),h=f.distanceToPoint(b);if(g<0&&h<0)return!1}return!0}}(),containsPoint:function(a){for(var b=this.planes,c=0;c<6;c++)if(b[c].distanceToPoint(a)<0)return!1;return!0}}),ga.RotationOrders=["XYZ","YZX","ZXY","XZY","YXZ","ZYX"],ga.DefaultOrder="XYZ",Object.defineProperties(ga.prototype,{x:{get:function(){return this._x},set:function(a){this._x=a,this.onChangeCallback()}},y:{get:function(){return this._y},set:function(a){this._y=a,this.onChangeCallback()}},z:{get:function(){return this._z},set:function(a){this._z=a,this.onChangeCallback()}},order:{get:function(){return this._order},set:function(a){this._order=a,this.onChangeCallback()}}}),Object.assign(ga.prototype,{isEuler:!0,set:function(a,b,c,d){return this._x=a,this._y=b,this._z=c,this._order=d||this._order,this.onChangeCallback(),this},clone:function(){return new this.constructor(this._x,this._y,this._z,this._order)},copy:function(a){return this._x=a._x,this._y=a._y,this._z=a._z,this._order=a._order,this.onChangeCallback(),this},setFromRotationMatrix:function(a,b,c){var d=yd.clamp,e=a.elements,f=e[0],g=e[4],h=e[8],i=e[1],j=e[5],k=e[9],l=e[2],m=e[6],n=e[10];return b=b||this._order,"XYZ"===b?(this._y=Math.asin(d(h,-1,1)),Math.abs(h)<.99999?(this._x=Math.atan2(-k,n),this._z=Math.atan2(-g,f)):(this._x=Math.atan2(m,j),this._z=0)):"YXZ"===b?(this._x=Math.asin(-d(k,-1,1)),Math.abs(k)<.99999?(this._y=Math.atan2(h,n),this._z=Math.atan2(i,j)):(this._y=Math.atan2(-l,f),this._z=0)):"ZXY"===b?(this._x=Math.asin(d(m,-1,1)),Math.abs(m)<.99999?(this._y=Math.atan2(-l,n),this._z=Math.atan2(-g,j)):(this._y=0,this._z=Math.atan2(i,f))):"ZYX"===b?(this._y=Math.asin(-d(l,-1,1)),Math.abs(l)<.99999?(this._x=Math.atan2(m,n),this._z=Math.atan2(i,f)):(this._x=0,this._z=Math.atan2(-g,j))):"YZX"===b?(this._z=Math.asin(d(i,-1,1)),Math.abs(i)<.99999?(this._x=Math.atan2(-k,j),this._y=Math.atan2(-l,f)):(this._x=0,this._y=Math.atan2(h,n))):"XZY"===b?(this._z=Math.asin(-d(g,-1,1)),Math.abs(g)<.99999?(this._x=Math.atan2(m,j),this._y=Math.atan2(h,f)):(this._x=Math.atan2(-k,n),this._y=0)):console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: "+b),this._order=b,!1!==c&&this.onChangeCallback(),this},setFromQuaternion:function(){var a=new d;return function(b,c,d){return a.makeRotationFromQuaternion(b),this.setFromRotationMatrix(a,c,d)}}(),setFromVector3:function(a,b){return this.set(a.x,a.y,a.z,b||this._order)},reorder:function(){var a=new e;return function(b){return a.setFromEuler(this),this.setFromQuaternion(a,b)}}(),equals:function(a){return a._x===this._x&&a._y===this._y&&a._z===this._z&&a._order===this._order},fromArray:function(a){return this._x=a[0],this._y=a[1],this._z=a[2],void 0!==a[3]&&(this._order=a[3]),this.onChangeCallback(),this},toArray:function(a,b){return void 0===a&&(a=[]),void 0===b&&(b=0),a[b]=this._x,a[b+1]=this._y,a[b+2]=this._z,a[b+3]=this._order,a},toVector3:function(a){return a?a.set(this._x,this._y,this._z):new f(this._x,this._y,this._z)},onChange:function(a){return this.onChangeCallback=a,this},onChangeCallback:function(){}}),Object.assign(ha.prototype,{set:function(a){this.mask=1<<a|0},enable:function(a){this.mask|=1<<a|0},toggle:function(a){this.mask^=1<<a|0},disable:function(a){this.mask&=~(1<<a|0)},test:function(a){return 0!=(this.mask&a.mask)}});var Pf=0;ia.DefaultUp=new f(0,1,0),ia.DefaultMatrixAutoUpdate=!0,ia.prototype=Object.assign(Object.create(b.prototype),{constructor:ia,isObject3D:!0,onBeforeRender:function(){},onAfterRender:function(){},applyMatrix:function(a){this.matrix.multiplyMatrices(a,this.matrix),this.matrix.decompose(this.position,this.quaternion,this.scale)},applyQuaternion:function(a){return this.quaternion.premultiply(a),this},setRotationFromAxisAngle:function(a,b){this.quaternion.setFromAxisAngle(a,b)},setRotationFromEuler:function(a){this.quaternion.setFromEuler(a,!0)},setRotationFromMatrix:function(a){this.quaternion.setFromRotationMatrix(a)},setRotationFromQuaternion:function(a){this.quaternion.copy(a)},rotateOnAxis:function(){var a=new e;return function(b,c){return a.setFromAxisAngle(b,c),this.quaternion.multiply(a),this}}(),rotateOnWorldAxis:function(){var a=new e;return function(b,c){return a.setFromAxisAngle(b,c),this.quaternion.premultiply(a),this}}(),rotateX:function(){var a=new f(1,0,0);return function(b){return this.rotateOnAxis(a,b)}}(),rotateY:function(){var a=new f(0,1,0);return function(b){return this.rotateOnAxis(a,b)}}(),rotateZ:function(){var a=new f(0,0,1);return function(b){return this.rotateOnAxis(a,b)}}(),translateOnAxis:function(){var a=new f;return function(b,c){return a.copy(b).applyQuaternion(this.quaternion),this.position.add(a.multiplyScalar(c)),this}}(),translateX:function(){var a=new f(1,0,0);return function(b){return this.translateOnAxis(a,b)}}(),translateY:function(){var a=new f(0,1,0);return function(b){return this.translateOnAxis(a,b)}}(),translateZ:function(){var a=new f(0,0,1);return function(b){return this.translateOnAxis(a,b)}}(),localToWorld:function(a){return a.applyMatrix4(this.matrixWorld)},worldToLocal:function(){var a=new d;return function(b){return b.applyMatrix4(a.getInverse(this.matrixWorld))}}(),lookAt:function(){var a=new d,b=new f;return function(c,d,e){c.isVector3?b.copy(c):b.set(c,d,e),this.isCamera?a.lookAt(this.position,b,this.up):a.lookAt(b,this.position,this.up),this.quaternion.setFromRotationMatrix(a)}}(),add:function(a){if(arguments.length>1){for(var b=0;b<arguments.length;b++)this.add(arguments[b]);return this}return a===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",a),this):(a&&a.isObject3D?(null!==a.parent&&a.parent.remove(a),a.parent=this,a.dispatchEvent({type:"added"}),this.children.push(a)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",a),this)},remove:function(a){if(arguments.length>1){for(var b=0;b<arguments.length;b++)this.remove(arguments[b]);return this}var c=this.children.indexOf(a);return-1!==c&&(a.parent=null,a.dispatchEvent({type:"removed"}),this.children.splice(c,1)),this},getObjectById:function(a){return this.getObjectByProperty("id",a)},getObjectByName:function(a){return this.getObjectByProperty("name",a)},getObjectByProperty:function(a,b){if(this[a]===b)return this;for(var c=0,d=this.children.length;c<d;c++){var e=this.children[c],f=e.getObjectByProperty(a,b);if(void 0!==f)return f}},getWorldPosition:function(a){var b=a||new f;return this.updateMatrixWorld(!0),b.setFromMatrixPosition(this.matrixWorld)},getWorldQuaternion:function(){var a=new f,b=new f;return function(c){var d=c||new e;return this.updateMatrixWorld(!0),this.matrixWorld.decompose(a,d,b),d}}(),getWorldRotation:function(){var a=new e;return function(b){var c=b||new ga;return this.getWorldQuaternion(a),c.setFromQuaternion(a,this.rotation.order,!1)}}(),getWorldScale:function(){var a=new f,b=new e;return function(c){var d=c||new f;return this.updateMatrixWorld(!0),this.matrixWorld.decompose(a,b,d),d}}(),getWorldDirection:function(){var a=new e;return function(b){var c=b||new f;return this.getWorldQuaternion(a),c.set(0,0,1).applyQuaternion(a)}}(),raycast:function(){},traverse:function(a){a(this);for(var b=this.children,c=0,d=b.length;c<d;c++)b[c].traverse(a)},traverseVisible:function(a){if(!1!==this.visible){a(this);for(var b=this.children,c=0,d=b.length;c<d;c++)b[c].traverseVisible(a)}},traverseAncestors:function(a){var b=this.parent;null!==b&&(a(b),b.traverseAncestors(a))},updateMatrix:function(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0},updateMatrixWorld:function(a){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||a)&&(null===this.parent?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,a=!0);for(var b=this.children,c=0,d=b.length;c<d;c++)b[c].updateMatrixWorld(a)},toJSON:function(a){function b(b,c){return void 0===b[c.uuid]&&(b[c.uuid]=c.toJSON(a)),c.uuid}function c(a){var b=[];for(var c in a){var d=a[c];delete d.metadata,b.push(d)}return b}var d=void 0===a||"string"==typeof a,e={};d&&(a={geometries:{},materials:{},textures:{},images:{},shapes:{}},e.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});var f={};if(f.uuid=this.uuid,f.type=this.type,""!==this.name&&(f.name=this.name),!0===this.castShadow&&(f.castShadow=!0),!0===this.receiveShadow&&(f.receiveShadow=!0),!1===this.visible&&(f.visible=!1),"{}"!==JSON.stringify(this.userData)&&(f.userData=this.userData),f.matrix=this.matrix.toArray(),void 0!==this.geometry){f.geometry=b(a.geometries,this.geometry);var g=this.geometry.parameters;if(void 0!==g&&void 0!==g.shapes){var h=g.shapes;if(Array.isArray(h))for(var i=0,j=h.length;i<j;i++){var k=h[i];b(a.shapes,k)}else b(a.shapes,h)}}if(void 0!==this.material)if(Array.isArray(this.material)){for(var l=[],i=0,j=this.material.length;i<j;i++)l.push(b(a.materials,this.material[i]));f.material=l}else f.material=b(a.materials,this.material);if(this.children.length>0){f.children=[];for(var i=0;i<this.children.length;i++)f.children.push(this.children[i].toJSON(a).object)}if(d){var m=c(a.geometries),n=c(a.materials),o=c(a.textures),p=c(a.images),h=c(a.shapes);m.length>0&&(e.geometries=m),n.length>0&&(e.materials=n),o.length>0&&(e.textures=o),p.length>0&&(e.images=p),h.length>0&&(e.shapes=h)}return e.object=f,e},clone:function(a){return(new this.constructor).copy(this,a)},copy:function(a,b){if(void 0===b&&(b=!0),this.name=a.name,this.up.copy(a.up),this.position.copy(a.position),this.quaternion.copy(a.quaternion),this.scale.copy(a.scale),this.matrix.copy(a.matrix),this.matrixWorld.copy(a.matrixWorld),this.matrixAutoUpdate=a.matrixAutoUpdate,this.matrixWorldNeedsUpdate=a.matrixWorldNeedsUpdate,this.layers.mask=a.layers.mask,this.visible=a.visible,this.castShadow=a.castShadow,this.receiveShadow=a.receiveShadow,this.frustumCulled=a.frustumCulled,this.renderOrder=a.renderOrder,this.userData=JSON.parse(JSON.stringify(a.userData)),!0===b)for(var c=0;c<a.children.length;c++){var d=a.children[c];this.add(d.clone())}return this}}),ja.prototype=Object.assign(Object.create(ia.prototype),{constructor:ja,isCamera:!0,copy:function(a,b){return ia.prototype.copy.call(this,a,b),this.matrixWorldInverse.copy(a.matrixWorldInverse),this.projectionMatrix.copy(a.projectionMatrix),this},getWorldDirection:function(){var a=new e;return function(b){var c=b||new f;return this.getWorldQuaternion(a),c.set(0,0,-1).applyQuaternion(a)}}(),updateMatrixWorld:function(a){ia.prototype.updateMatrixWorld.call(this,a),this.matrixWorldInverse.getInverse(this.matrixWorld)},clone:function(){return(new this.constructor).copy(this)}}),ka.prototype=Object.assign(Object.create(ja.prototype),{constructor:ka,isOrthographicCamera:!0,copy:function(a,b){return ja.prototype.copy.call(this,a,b),this.left=a.left,this.right=a.right,this.top=a.top,this.bottom=a.bottom,this.near=a.near,this.far=a.far,this.zoom=a.zoom,this.view=null===a.view?null:Object.assign({},a.view),this},setViewOffset:function(a,b,c,d,e,f){null===this.view&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=a,this.view.fullHeight=b,this.view.offsetX=c,this.view.offsetY=d,this.view.width=e,this.view.height=f,this.updateProjectionMatrix()},clearViewOffset:function(){null!==this.view&&(this.view.enabled=!1),this.updateProjectionMatrix()},updateProjectionMatrix:function(){var a=(this.right-this.left)/(2*this.zoom),b=(this.top-this.bottom)/(2*this.zoom),c=(this.right+this.left)/2,d=(this.top+this.bottom)/2,e=c-a,f=c+a,g=d+b,h=d-b;if(null!==this.view&&this.view.enabled){var i=this.zoom/(this.view.width/this.view.fullWidth),j=this.zoom/(this.view.height/this.view.fullHeight),k=(this.right-this.left)/this.view.width,l=(this.top-this.bottom)/this.view.height;e+=k*(this.view.offsetX/i),f=e+k*(this.view.width/i),g-=l*(this.view.offsetY/j),h=g-l*(this.view.height/j)}this.projectionMatrix.makeOrthographic(e,f,g,h,this.near,this.far)},toJSON:function(a){var b=ia.prototype.toJSON.call(this,a);return b.object.zoom=this.zoom,b.object.left=this.left,b.object.right=this.right,b.object.top=this.top,b.object.bottom=this.bottom,b.object.near=this.near,b.object.far=this.far,null!==this.view&&(b.object.view=Object.assign({},this.view)),b}}),Object.assign(la.prototype,{clone:function(){return(new this.constructor).copy(this)},copy:function(a){this.a=a.a,this.b=a.b,this.c=a.c,this.normal.copy(a.normal),this.color.copy(a.color),this.materialIndex=a.materialIndex;for(var b=0,c=a.vertexNormals.length;b<c;b++)this.vertexNormals[b]=a.vertexNormals[b].clone();for(var b=0,c=a.vertexColors.length;b<c;b++)this.vertexColors[b]=a.vertexColors[b].clone();return this}});var Qf=0;ma.prototype=Object.assign(Object.create(b.prototype),{constructor:ma,isGeometry:!0,applyMatrix:function(a){for(var b=(new g).getNormalMatrix(a),c=0,d=this.vertices.length;c<d;c++){this.vertices[c].applyMatrix4(a)}for(var c=0,d=this.faces.length;c<d;c++){var e=this.faces[c];e.normal.applyMatrix3(b).normalize();for(var f=0,h=e.vertexNormals.length;f<h;f++)e.vertexNormals[f].applyMatrix3(b).normalize()}return null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this.verticesNeedUpdate=!0,this.normalsNeedUpdate=!0,this},rotateX:function(){var a=new d;return function(b){return a.makeRotationX(b),this.applyMatrix(a),this}}(),rotateY:function(){var a=new d;return function(b){return a.makeRotationY(b),this.applyMatrix(a),this}}(),rotateZ:function(){var a=new d;return function(b){return a.makeRotationZ(b),this.applyMatrix(a),this}}(),translate:function(){var a=new d;return function(b,c,d){return a.makeTranslation(b,c,d),this.applyMatrix(a),this}}(),scale:function(){var a=new d;return function(b,c,d){return a.makeScale(b,c,d),this.applyMatrix(a),this}}(),lookAt:function(){var a=new ia;return function(b){a.lookAt(b),a.updateMatrix(),this.applyMatrix(a.matrix)}}(),fromBufferGeometry:function(a){function b(a,b,c,e){var f=void 0!==i?[m[a].clone(),m[b].clone(),m[c].clone()]:[],g=void 0!==j?[d.colors[a].clone(),d.colors[b].clone(),d.colors[c].clone()]:[],h=new la(a,b,c,f,g,e);d.faces.push(h),void 0!==k&&d.faceVertexUvs[0].push([n[a].clone(),n[b].clone(),n[c].clone()]),void 0!==l&&d.faceVertexUvs[1].push([o[a].clone(),o[b].clone(),o[c].clone()])}var d=this,e=null!==a.index?a.index.array:void 0,g=a.attributes,h=g.position.array,i=void 0!==g.normal?g.normal.array:void 0,j=void 0!==g.color?g.color.array:void 0,k=void 0!==g.uv?g.uv.array:void 0,l=void 0!==g.uv2?g.uv2.array:void 0;void 0!==l&&(this.faceVertexUvs[1]=[]);for(var m=[],n=[],o=[],p=0,q=0;p<h.length;p+=3,q+=2)d.vertices.push(new f(h[p],h[p+1],h[p+2])),void 0!==i&&m.push(new f(i[p],i[p+1],i[p+2])),void 0!==j&&d.colors.push(new U(j[p],j[p+1],j[p+2])),void 0!==k&&n.push(new c(k[q],k[q+1])),void 0!==l&&o.push(new c(l[q],l[q+1]));var r=a.groups;if(r.length>0)for(var p=0;p<r.length;p++)for(var s=r[p],t=s.start,u=s.count,q=t,v=t+u;q<v;q+=3)void 0!==e?b(e[q],e[q+1],e[q+2],s.materialIndex):b(q,q+1,q+2,s.materialIndex);else if(void 0!==e)for(var p=0;p<e.length;p+=3)b(e[p],e[p+1],e[p+2]);else for(var p=0;p<h.length/3;p+=3)b(p,p+1,p+2);return this.computeFaceNormals(),null!==a.boundingBox&&(this.boundingBox=a.boundingBox.clone()),null!==a.boundingSphere&&(this.boundingSphere=a.boundingSphere.clone()),this},center:function(){this.computeBoundingBox();var a=this.boundingBox.getCenter().negate();return this.translate(a.x,a.y,a.z),a},normalize:function(){this.computeBoundingSphere();var a=this.boundingSphere.center,b=this.boundingSphere.radius,c=0===b?1:1/b,e=new d;return e.set(c,0,0,-c*a.x,0,c,0,-c*a.y,0,0,c,-c*a.z,0,0,0,1),this.applyMatrix(e),this},computeFaceNormals:function(){for(var a=new f,b=new f,c=0,d=this.faces.length;c<d;c++){var e=this.faces[c],g=this.vertices[e.a],h=this.vertices[e.b],i=this.vertices[e.c];a.subVectors(i,h),b.subVectors(g,h),a.cross(b),a.normalize(),e.normal.copy(a)}},computeVertexNormals:function(a){void 0===a&&(a=!0);var b,c,d,e,g,h;for(h=new Array(this.vertices.length),b=0,c=this.vertices.length;b<c;b++)h[b]=new f;if(a){var i,j,k,l=new f,m=new f;for(d=0,e=this.faces.length;d<e;d++)g=this.faces[d],i=this.vertices[g.a],j=this.vertices[g.b],k=this.vertices[g.c],l.subVectors(k,j),m.subVectors(i,j),l.cross(m),h[g.a].add(l),h[g.b].add(l),h[g.c].add(l)}else for(this.computeFaceNormals(),d=0,e=this.faces.length;d<e;d++)g=this.faces[d],h[g.a].add(g.normal),h[g.b].add(g.normal),h[g.c].add(g.normal);for(b=0,c=this.vertices.length;b<c;b++)h[b].normalize();for(d=0,e=this.faces.length;d<e;d++){g=this.faces[d];var n=g.vertexNormals;3===n.length?(n[0].copy(h[g.a]),n[1].copy(h[g.b]),n[2].copy(h[g.c])):(n[0]=h[g.a].clone(),n[1]=h[g.b].clone(),n[2]=h[g.c].clone())}this.faces.length>0&&(this.normalsNeedUpdate=!0)},computeFlatVertexNormals:function(){var a,b,c;for(this.computeFaceNormals(),a=0,b=this.faces.length;a<b;a++){c=this.faces[a];var d=c.vertexNormals;3===d.length?(d[0].copy(c.normal),d[1].copy(c.normal),d[2].copy(c.normal)):(d[0]=c.normal.clone(),d[1]=c.normal.clone(),d[2]=c.normal.clone())}this.faces.length>0&&(this.normalsNeedUpdate=!0)},computeMorphNormals:function(){var a,b,c,d,e;for(c=0,d=this.faces.length;c<d;c++)for(e=this.faces[c],e.__originalFaceNormal?e.__originalFaceNormal.copy(e.normal):e.__originalFaceNormal=e.normal.clone(),e.__originalVertexNormals||(e.__originalVertexNormals=[]),a=0,b=e.vertexNormals.length;a<b;a++)e.__originalVertexNormals[a]?e.__originalVertexNormals[a].copy(e.vertexNormals[a]):e.__originalVertexNormals[a]=e.vertexNormals[a].clone();var g=new ma;for(g.faces=this.faces,a=0,b=this.morphTargets.length;a<b;a++){if(!this.morphNormals[a]){this.morphNormals[a]={},this.morphNormals[a].faceNormals=[],this.morphNormals[a].vertexNormals=[];var h,i,j=this.morphNormals[a].faceNormals,k=this.morphNormals[a].vertexNormals;for(c=0,d=this.faces.length;c<d;c++)h=new f,i={a:new f,b:new f,c:new f},j.push(h),k.push(i)}var l=this.morphNormals[a];g.vertices=this.morphTargets[a].vertices,g.computeFaceNormals(),g.computeVertexNormals();var h,i;for(c=0,d=this.faces.length;c<d;c++)e=this.faces[c],h=l.faceNormals[c],i=l.vertexNormals[c],h.copy(e.normal),i.a.copy(e.vertexNormals[0]),i.b.copy(e.vertexNormals[1]),i.c.copy(e.vertexNormals[2])}for(c=0,d=this.faces.length;c<d;c++)e=this.faces[c],e.normal=e.__originalFaceNormal,e.vertexNormals=e.__originalVertexNormals},computeLineDistances:function(){for(var a=0,b=this.vertices,c=0,d=b.length;c<d;c++)c>0&&(a+=b[c].distanceTo(b[c-1])),this.lineDistances[c]=a},computeBoundingBox:function(){null===this.boundingBox&&(this.boundingBox=new aa),this.boundingBox.setFromPoints(this.vertices)},computeBoundingSphere:function(){null===this.boundingSphere&&(this.boundingSphere=new ba),this.boundingSphere.setFromPoints(this.vertices)},merge:function(a,b,c){if(!a||!a.isGeometry)return void console.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.",a);var d,e=this.vertices.length,f=this.vertices,h=a.vertices,i=this.faces,j=a.faces,k=this.faceVertexUvs[0],l=a.faceVertexUvs[0],m=this.colors,n=a.colors;void 0===c&&(c=0),void 0!==b&&(d=(new g).getNormalMatrix(b));for(var o=0,p=h.length;o<p;o++){var q=h[o],r=q.clone();void 0!==b&&r.applyMatrix4(b),f.push(r)}for(var o=0,p=n.length;o<p;o++)m.push(n[o].clone());for(o=0,p=j.length;o<p;o++){var s,t,u,v=j[o],w=v.vertexNormals,x=v.vertexColors;s=new la(v.a+e,v.b+e,v.c+e),s.normal.copy(v.normal),void 0!==d&&s.normal.applyMatrix3(d).normalize();for(var y=0,z=w.length;y<z;y++)t=w[y].clone(),void 0!==d&&t.applyMatrix3(d).normalize(),s.vertexNormals.push(t);s.color.copy(v.color);for(var y=0,z=x.length;y<z;y++)u=x[y],s.vertexColors.push(u.clone());s.materialIndex=v.materialIndex+c,i.push(s)}for(o=0,p=l.length;o<p;o++){var A=l[o],B=[];if(void 0!==A){for(var y=0,z=A.length;y<z;y++)B.push(A[y].clone());k.push(B)}}},mergeMesh:function(a){if(!a||!a.isMesh)return void console.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.",a);a.matrixAutoUpdate&&a.updateMatrix(),this.merge(a.geometry,a.matrix)},mergeVertices:function(){var a,b,c,d,e,f,g,h,i={},j=[],k=[],l=4,m=Math.pow(10,l);for(c=0,d=this.vertices.length;c<d;c++)a=this.vertices[c],b=Math.round(a.x*m)+"_"+Math.round(a.y*m)+"_"+Math.round(a.z*m),void 0===i[b]?(i[b]=c,j.push(this.vertices[c]),k[c]=j.length-1):k[c]=k[i[b]];var n=[];for(c=0,d=this.faces.length;c<d;c++){e=this.faces[c],e.a=k[e.a],e.b=k[e.b],e.c=k[e.c],f=[e.a,e.b,e.c];for(var o=0;o<3;o++)if(f[o]===f[(o+1)%3]){n.push(c);break}}for(c=n.length-1;c>=0;c--){var p=n[c];for(this.faces.splice(p,1),g=0,h=this.faceVertexUvs.length;g<h;g++)this.faceVertexUvs[g].splice(p,1)}var q=this.vertices.length-j.length;return this.vertices=j,q},setFromPoints:function(a){this.vertices=[];for(var b=0,c=a.length;b<c;b++){var d=a[b];this.vertices.push(new f(d.x,d.y,d.z||0))}return this},sortFacesByMaterialIndex:function(){function a(a,b){return a.materialIndex-b.materialIndex}for(var b=this.faces,c=b.length,d=0;d<c;d++)b[d]._id=d;b.sort(a);var e,f,g=this.faceVertexUvs[0],h=this.faceVertexUvs[1];g&&g.length===c&&(e=[]),h&&h.length===c&&(f=[]);for(var d=0;d<c;d++){var i=b[d]._id;e&&e.push(g[i]),f&&f.push(h[i])}e&&(this.faceVertexUvs[0]=e),f&&(this.faceVertexUvs[1]=f)},toJSON:function(){function a(a,b,c){return c?a|1<<b:a&~(1<<b)}function b(a){var b=a.x.toString()+a.y.toString()+a.z.toString();return void 0!==m[b]?m[b]:(m[b]=l.length/3,l.push(a.x,a.y,a.z),m[b])}function c(a){var b=a.r.toString()+a.g.toString()+a.b.toString();return void 0!==o[b]?o[b]:(o[b]=n.length,n.push(a.getHex()),o[b])}function d(a){var b=a.x.toString()+a.y.toString();return void 0!==q[b]?q[b]:(q[b]=p.length/2,p.push(a.x,a.y),q[b])}var e={metadata:{version:4.5,type:"Geometry",generator:"Geometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,""!==this.name&&(e.name=this.name),void 0!==this.parameters){var f=this.parameters;for(var g in f)void 0!==f[g]&&(e[g]=f[g]);return e}for(var h=[],i=0;i<this.vertices.length;i++){var j=this.vertices[i];h.push(j.x,j.y,j.z)}for(var k=[],l=[],m={},n=[],o={},p=[],q={},i=0;i<this.faces.length;i++){var r=this.faces[i],s=void 0!==this.faceVertexUvs[0][i],t=r.normal.length()>0,u=r.vertexNormals.length>0,v=1!==r.color.r||1!==r.color.g||1!==r.color.b,w=r.vertexColors.length>0,x=0;if(x=a(x,0,0),x=a(x,1,!0),x=a(x,2,!1),x=a(x,3,s),x=a(x,4,t),x=a(x,5,u),x=a(x,6,v),x=a(x,7,w),k.push(x),k.push(r.a,r.b,r.c),k.push(r.materialIndex),s){var y=this.faceVertexUvs[0][i];k.push(d(y[0]),d(y[1]),d(y[2]))}if(t&&k.push(b(r.normal)),u){var z=r.vertexNormals;k.push(b(z[0]),b(z[1]),b(z[2]))}if(v&&k.push(c(r.color)),w){var A=r.vertexColors;k.push(c(A[0]),c(A[1]),c(A[2]))}}return e.data={},e.data.vertices=h,e.data.normals=l,n.length>0&&(e.data.colors=n),p.length>0&&(e.data.uvs=[p]),e.data.faces=k,e},clone:function(){return(new ma).copy(this)},copy:function(a){var b,c,d,e,f,g;this.vertices=[],this.colors=[],this.faces=[],this.faceVertexUvs=[[]],this.morphTargets=[],this.morphNormals=[],this.skinWeights=[],this.skinIndices=[],this.lineDistances=[],this.boundingBox=null,this.boundingSphere=null,this.name=a.name;var h=a.vertices;for(b=0,c=h.length;b<c;b++)this.vertices.push(h[b].clone());var i=a.colors;for(b=0,c=i.length;b<c;b++)this.colors.push(i[b].clone());var j=a.faces;for(b=0,c=j.length;b<c;b++)this.faces.push(j[b].clone());for(b=0,c=a.faceVertexUvs.length;b<c;b++){var k=a.faceVertexUvs[b];for(void 0===this.faceVertexUvs[b]&&(this.faceVertexUvs[b]=[]),d=0,e=k.length;d<e;d++){var l=k[d],m=[];for(f=0,g=l.length;f<g;f++){var n=l[f];m.push(n.clone())}this.faceVertexUvs[b].push(m)}}var o=a.morphTargets;for(b=0,c=o.length;b<c;b++){var p={};if(p.name=o[b].name,void 0!==o[b].vertices)for(p.vertices=[],d=0,e=o[b].vertices.length;d<e;d++)p.vertices.push(o[b].vertices[d].clone());if(void 0!==o[b].normals)for(p.normals=[],d=0,e=o[b].normals.length;d<e;d++)p.normals.push(o[b].normals[d].clone());this.morphTargets.push(p)}var q=a.morphNormals;for(b=0,c=q.length;b<c;b++){var r={};if(void 0!==q[b].vertexNormals)for(r.vertexNormals=[],d=0,e=q[b].vertexNormals.length;d<e;d++){var s=q[b].vertexNormals[d],t={};t.a=s.a.clone(),t.b=s.b.clone(),t.c=s.c.clone(),r.vertexNormals.push(t)}if(void 0!==q[b].faceNormals)for(r.faceNormals=[],d=0,e=q[b].faceNormals.length;d<e;d++)r.faceNormals.push(q[b].faceNormals[d].clone());this.morphNormals.push(r)}var u=a.skinWeights;for(b=0,c=u.length;b<c;b++)this.skinWeights.push(u[b].clone());var v=a.skinIndices;for(b=0,c=v.length;b<c;b++)this.skinIndices.push(v[b].clone());var w=a.lineDistances;for(b=0,c=w.length;b<c;b++)this.lineDistances.push(w[b]);var x=a.boundingBox;null!==x&&(this.boundingBox=x.clone());var y=a.boundingSphere;return null!==y&&(this.boundingSphere=y.clone()),this.elementsNeedUpdate=a.elementsNeedUpdate,this.verticesNeedUpdate=a.verticesNeedUpdate,this.uvsNeedUpdate=a.uvsNeedUpdate,this.normalsNeedUpdate=a.normalsNeedUpdate,this.colorsNeedUpdate=a.colorsNeedUpdate,this.lineDistancesNeedUpdate=a.lineDistancesNeedUpdate,this.groupsNeedUpdate=a.groupsNeedUpdate,this},dispose:function(){this.dispatchEvent({type:"dispose"})}}),Object.defineProperty(na.prototype,"needsUpdate",{set:function(a){!0===a&&this.version++}}),Object.assign(na.prototype,{isBufferAttribute:!0,setArray:function(a){if(Array.isArray(a))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.count=void 0!==a?a.length/this.itemSize:0,this.array=a},setDynamic:function(a){return this.dynamic=a,this},copy:function(a){return this.array=new a.array.constructor(a.array),this.itemSize=a.itemSize,this.count=a.count,this.normalized=a.normalized,this.dynamic=a.dynamic,this},copyAt:function(a,b,c){a*=this.itemSize,c*=b.itemSize;for(var d=0,e=this.itemSize;d<e;d++)this.array[a+d]=b.array[c+d];return this},copyArray:function(a){return this.array.set(a),this},copyColorsArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var f=a[d];void 0===f&&(console.warn("THREE.BufferAttribute.copyColorsArray(): color is undefined",d),f=new U),b[c++]=f.r,b[c++]=f.g,b[c++]=f.b}return this},copyIndicesArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var f=a[d];b[c++]=f.a,b[c++]=f.b,b[c++]=f.c}return this},copyVector2sArray:function(a){for(var b=this.array,d=0,e=0,f=a.length;e<f;e++){var g=a[e];void 0===g&&(console.warn("THREE.BufferAttribute.copyVector2sArray(): vector is undefined",e),g=new c),b[d++]=g.x,b[d++]=g.y}return this},copyVector3sArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var g=a[d];void 0===g&&(console.warn("THREE.BufferAttribute.copyVector3sArray(): vector is undefined",d),g=new f),b[c++]=g.x,b[c++]=g.y,b[c++]=g.z}return this},copyVector4sArray:function(a){for(var b=this.array,c=0,d=0,e=a.length;d<e;d++){var f=a[d];void 0===f&&(console.warn("THREE.BufferAttribute.copyVector4sArray(): vector is undefined",d),f=new i),b[c++]=f.x,b[c++]=f.y,b[c++]=f.z,b[c++]=f.w}return this},set:function(a,b){return void 0===b&&(b=0),this.array.set(a,b),this},getX:function(a){return this.array[a*this.itemSize]},setX:function(a,b){return this.array[a*this.itemSize]=b,this},getY:function(a){return this.array[a*this.itemSize+1]},setY:function(a,b){return this.array[a*this.itemSize+1]=b,this},getZ:function(a){return this.array[a*this.itemSize+2]},setZ:function(a,b){return this.array[a*this.itemSize+2]=b,this},getW:function(a){return this.array[a*this.itemSize+3]},setW:function(a,b){return this.array[a*this.itemSize+3]=b,this},setXY:function(a,b,c){return a*=this.itemSize,this.array[a+0]=b,this.array[a+1]=c,this},setXYZ:function(a,b,c,d){return a*=this.itemSize,this.array[a+0]=b,this.array[a+1]=c,this.array[a+2]=d,this},setXYZW:function(a,b,c,d,e){return a*=this.itemSize,this.array[a+0]=b,this.array[a+1]=c,this.array[a+2]=d,this.array[a+3]=e,this},onUpload:function(a){return this.onUploadCallback=a,this},clone:function(){return new this.constructor(this.array,this.itemSize).copy(this)}}),oa.prototype=Object.create(na.prototype),oa.prototype.constructor=oa,pa.prototype=Object.create(na.prototype),pa.prototype.constructor=pa,qa.prototype=Object.create(na.prototype),qa.prototype.constructor=qa,ra.prototype=Object.create(na.prototype),ra.prototype.constructor=ra,sa.prototype=Object.create(na.prototype),sa.prototype.constructor=sa,ta.prototype=Object.create(na.prototype),ta.prototype.constructor=ta,ua.prototype=Object.create(na.prototype),ua.prototype.constructor=ua,va.prototype=Object.create(na.prototype),va.prototype.constructor=va,wa.prototype=Object.create(na.prototype),wa.prototype.constructor=wa,Object.assign(xa.prototype,{computeGroups:function(a){for(var b,c=[],d=void 0,e=a.faces,f=0;f<e.length;f++){var g=e[f];g.materialIndex!==d&&(d=g.materialIndex,void 0!==b&&(b.count=3*f-b.start,c.push(b)),b={start:3*f,materialIndex:d})}void 0!==b&&(b.count=3*f-b.start,c.push(b)),this.groups=c},fromGeometry:function(a){var b,d=a.faces,e=a.vertices,f=a.faceVertexUvs,g=f[0]&&f[0].length>0,h=f[1]&&f[1].length>0,i=a.morphTargets,j=i.length;if(j>0){b=[];for(var k=0;k<j;k++)b[k]=[];this.morphTargets.position=b}var l,m=a.morphNormals,n=m.length;if(n>0){l=[];for(var k=0;k<n;k++)l[k]=[];this.morphTargets.normal=l}for(var o=a.skinIndices,p=a.skinWeights,q=o.length===e.length,r=p.length===e.length,k=0;k<d.length;k++){var s=d[k];this.vertices.push(e[s.a],e[s.b],e[s.c]);var t=s.vertexNormals;if(3===t.length)this.normals.push(t[0],t[1],t[2]);else{var u=s.normal;this.normals.push(u,u,u)}var v=s.vertexColors;if(3===v.length)this.colors.push(v[0],v[1],v[2]);else{var w=s.color;this.colors.push(w,w,w)}if(!0===g){var x=f[0][k];void 0!==x?this.uvs.push(x[0],x[1],x[2]):(console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ",k),this.uvs.push(new c,new c,new c))}if(!0===h){var x=f[1][k];void 0!==x?this.uvs2.push(x[0],x[1],x[2]):(console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ",k),this.uvs2.push(new c,new c,new c))}for(var y=0;y<j;y++){var z=i[y].vertices;b[y].push(z[s.a],z[s.b],z[s.c])}for(var y=0;y<n;y++){var A=m[y].vertexNormals[k];l[y].push(A.a,A.b,A.c)}q&&this.skinIndices.push(o[s.a],o[s.b],o[s.c]),r&&this.skinWeights.push(p[s.a],p[s.b],p[s.c])}return this.computeGroups(a),this.verticesNeedUpdate=a.verticesNeedUpdate,this.normalsNeedUpdate=a.normalsNeedUpdate,this.colorsNeedUpdate=a.colorsNeedUpdate,this.uvsNeedUpdate=a.uvsNeedUpdate,this.groupsNeedUpdate=a.groupsNeedUpdate,this}});var Rf=1;za.prototype=Object.assign(Object.create(b.prototype),{constructor:za,isBufferGeometry:!0,getIndex:function(){return this.index},setIndex:function(a){Array.isArray(a)?this.index=new(ya(a)>65535?ua:sa)(a,1):this.index=a},addAttribute:function(a,b){return b&&b.isBufferAttribute||b&&b.isInterleavedBufferAttribute?"index"===a?(console.warn("THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."),void this.setIndex(b)):(this.attributes[a]=b,this):(console.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."),void this.addAttribute(a,new na(arguments[1],arguments[2])))},getAttribute:function(a){return this.attributes[a]},removeAttribute:function(a){return delete this.attributes[a],this},addGroup:function(a,b,c){this.groups.push({start:a,count:b,materialIndex:void 0!==c?c:0})},clearGroups:function(){this.groups=[]},setDrawRange:function(a,b){this.drawRange.start=a,this.drawRange.count=b},applyMatrix:function(a){var b=this.attributes.position;void 0!==b&&(a.applyToBufferAttribute(b),b.needsUpdate=!0);var c=this.attributes.normal;if(void 0!==c){(new g).getNormalMatrix(a).applyToBufferAttribute(c),c.needsUpdate=!0}return null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this},rotateX:function(){var a=new d;return function(b){return a.makeRotationX(b),this.applyMatrix(a),this}}(),rotateY:function(){var a=new d;return function(b){return a.makeRotationY(b),this.applyMatrix(a),this}}(),rotateZ:function(){var a=new d;return function(b){return a.makeRotationZ(b),this.applyMatrix(a),this}}(),translate:function(){var a=new d;return function(b,c,d){return a.makeTranslation(b,c,d),this.applyMatrix(a),this}}(),scale:function(){var a=new d;return function(b,c,d){return a.makeScale(b,c,d),this.applyMatrix(a),this}}(),lookAt:function(){var a=new ia;return function(b){a.lookAt(b),a.updateMatrix(),this.applyMatrix(a.matrix)}}(),center:function(){this.computeBoundingBox();var a=this.boundingBox.getCenter().negate();return this.translate(a.x,a.y,a.z),a},setFromObject:function(a){var b=a.geometry;if(a.isPoints||a.isLine){var c=new va(3*b.vertices.length,3),d=new va(3*b.colors.length,3);if(this.addAttribute("position",c.copyVector3sArray(b.vertices)),this.addAttribute("color",d.copyColorsArray(b.colors)),b.lineDistances&&b.lineDistances.length===b.vertices.length){var e=new va(b.lineDistances.length,1);this.addAttribute("lineDistance",e.copyArray(b.lineDistances))}null!==b.boundingSphere&&(this.boundingSphere=b.boundingSphere.clone()),null!==b.boundingBox&&(this.boundingBox=b.boundingBox.clone())}else a.isMesh&&b&&b.isGeometry&&this.fromGeometry(b);return this},setFromPoints:function(a){for(var b=[],c=0,d=a.length;c<d;c++){var e=a[c];b.push(e.x,e.y,e.z||0)}return this.addAttribute("position",new va(b,3)),this},updateFromObject:function(a){var b=a.geometry;if(a.isMesh){var c=b.__directGeometry;if(!0===b.elementsNeedUpdate&&(c=void 0,b.elementsNeedUpdate=!1),void 0===c)return this.fromGeometry(b);c.verticesNeedUpdate=b.verticesNeedUpdate,c.normalsNeedUpdate=b.normalsNeedUpdate,c.colorsNeedUpdate=b.colorsNeedUpdate,c.uvsNeedUpdate=b.uvsNeedUpdate,c.groupsNeedUpdate=b.groupsNeedUpdate,b.verticesNeedUpdate=!1,b.normalsNeedUpdate=!1,b.colorsNeedUpdate=!1,b.uvsNeedUpdate=!1,b.groupsNeedUpdate=!1,b=c}var d;return!0===b.verticesNeedUpdate&&(d=this.attributes.position,void 0!==d&&(d.copyVector3sArray(b.vertices),d.needsUpdate=!0),b.verticesNeedUpdate=!1),!0===b.normalsNeedUpdate&&(d=this.attributes.normal,void 0!==d&&(d.copyVector3sArray(b.normals),d.needsUpdate=!0),b.normalsNeedUpdate=!1),!0===b.colorsNeedUpdate&&(d=this.attributes.color,void 0!==d&&(d.copyColorsArray(b.colors),d.needsUpdate=!0),b.colorsNeedUpdate=!1),b.uvsNeedUpdate&&(d=this.attributes.uv,void 0!==d&&(d.copyVector2sArray(b.uvs),d.needsUpdate=!0),b.uvsNeedUpdate=!1),b.lineDistancesNeedUpdate&&(d=this.attributes.lineDistance,void 0!==d&&(d.copyArray(b.lineDistances),d.needsUpdate=!0),b.lineDistancesNeedUpdate=!1),b.groupsNeedUpdate&&(b.computeGroups(a.geometry),this.groups=b.groups,b.groupsNeedUpdate=!1),this},fromGeometry:function(a){return a.__directGeometry=(new xa).fromGeometry(a),this.fromDirectGeometry(a.__directGeometry)},fromDirectGeometry:function(a){var b=new Float32Array(3*a.vertices.length);if(this.addAttribute("position",new na(b,3).copyVector3sArray(a.vertices)),a.normals.length>0){var c=new Float32Array(3*a.normals.length);this.addAttribute("normal",new na(c,3).copyVector3sArray(a.normals))}if(a.colors.length>0){var d=new Float32Array(3*a.colors.length);this.addAttribute("color",new na(d,3).copyColorsArray(a.colors))}if(a.uvs.length>0){var e=new Float32Array(2*a.uvs.length);this.addAttribute("uv",new na(e,2).copyVector2sArray(a.uvs))}if(a.uvs2.length>0){var f=new Float32Array(2*a.uvs2.length);this.addAttribute("uv2",new na(f,2).copyVector2sArray(a.uvs2))}if(a.indices.length>0){var g=ya(a.indices)>65535?Uint32Array:Uint16Array,h=new g(3*a.indices.length);this.setIndex(new na(h,1).copyIndicesArray(a.indices))}this.groups=a.groups;for(var i in a.morphTargets){for(var j=[],k=a.morphTargets[i],l=0,m=k.length;l<m;l++){var n=k[l],o=new va(3*n.length,3);j.push(o.copyVector3sArray(n))}this.morphAttributes[i]=j}if(a.skinIndices.length>0){var p=new va(4*a.skinIndices.length,4);this.addAttribute("skinIndex",p.copyVector4sArray(a.skinIndices))}if(a.skinWeights.length>0){var q=new va(4*a.skinWeights.length,4);this.addAttribute("skinWeight",q.copyVector4sArray(a.skinWeights))}return null!==a.boundingSphere&&(this.boundingSphere=a.boundingSphere.clone()),null!==a.boundingBox&&(this.boundingBox=a.boundingBox.clone()),this},computeBoundingBox:function(){null===this.boundingBox&&(this.boundingBox=new aa);var a=this.attributes.position;void 0!==a?this.boundingBox.setFromBufferAttribute(a):this.boundingBox.makeEmpty(),(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)},computeBoundingSphere:function(){var a=new aa,b=new f;return function(){null===this.boundingSphere&&(this.boundingSphere=new ba);var c=this.attributes.position;if(c){var d=this.boundingSphere.center;a.setFromBufferAttribute(c),a.getCenter(d);for(var e=0,f=0,g=c.count;f<g;f++)b.x=c.getX(f),b.y=c.getY(f),b.z=c.getZ(f),e=Math.max(e,d.distanceToSquared(b));this.boundingSphere.radius=Math.sqrt(e),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}}(),computeFaceNormals:function(){},computeVertexNormals:function(){var a=this.index,b=this.attributes,c=this.groups;if(b.position){var d=b.position.array;if(void 0===b.normal)this.addAttribute("normal",new na(new Float32Array(d.length),3));else for(var e=b.normal.array,g=0,h=e.length;g<h;g++)e[g]=0;var i,j,k,l=b.normal.array,m=new f,n=new f,o=new f,p=new f,q=new f;if(a){var r=a.array;0===c.length&&this.addGroup(0,r.length);for(var s=0,t=c.length;s<t;++s)for(var u=c[s],v=u.start,w=u.count,g=v,h=v+w;g<h;g+=3)i=3*r[g+0],j=3*r[g+1],k=3*r[g+2],m.fromArray(d,i),n.fromArray(d,j),o.fromArray(d,k),p.subVectors(o,n),q.subVectors(m,n),p.cross(q),l[i]+=p.x,l[i+1]+=p.y,l[i+2]+=p.z,l[j]+=p.x,l[j+1]+=p.y,l[j+2]+=p.z,l[k]+=p.x,l[k+1]+=p.y,l[k+2]+=p.z}else for(var g=0,h=d.length;g<h;g+=9)m.fromArray(d,g),n.fromArray(d,g+3),o.fromArray(d,g+6),p.subVectors(o,n),q.subVectors(m,n),p.cross(q),l[g]=p.x,l[g+1]=p.y,l[g+2]=p.z,l[g+3]=p.x,l[g+4]=p.y,l[g+5]=p.z,l[g+6]=p.x,l[g+7]=p.y,l[g+8]=p.z;this.normalizeNormals(),b.normal.needsUpdate=!0}},merge:function(a,b){if(!a||!a.isBufferGeometry)return void console.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.",a);void 0===b&&(b=0);var c=this.attributes;for(var d in c)if(void 0!==a.attributes[d])for(var e=c[d],f=e.array,g=a.attributes[d],h=g.array,i=g.itemSize,j=0,k=i*b;j<h.length;j++,k++)f[k]=h[j];return this},normalizeNormals:function(){var a=new f;return function(){for(var b=this.attributes.normal,c=0,d=b.count;c<d;c++)a.x=b.getX(c),a.y=b.getY(c),a.z=b.getZ(c),a.normalize(),b.setXYZ(c,a.x,a.y,a.z)}}(),toNonIndexed:function(){if(null===this.index)return console.warn("THREE.BufferGeometry.toNonIndexed(): Geometry is already non-indexed."),this;var a=new za,b=this.index.array,c=this.attributes;for(var d in c){for(var e=c[d],f=e.array,g=e.itemSize,h=new f.constructor(b.length*g),i=0,j=0,k=0,l=b.length;k<l;k++){i=b[k]*g;for(var m=0;m<g;m++)h[j++]=f[i++]}a.addAttribute(d,new na(h,g))}return a},toJSON:function(){var a={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(a.uuid=this.uuid,a.type=this.type,""!==this.name&&(a.name=this.name),void 0!==this.parameters){var b=this.parameters;for(var c in b)void 0!==b[c]&&(a[c]=b[c]);return a}a.data={attributes:{}};var d=this.index;if(null!==d){var e=Array.prototype.slice.call(d.array);a.data.index={type:d.array.constructor.name,array:e}}var f=this.attributes;for(var c in f){var g=f[c],e=Array.prototype.slice.call(g.array);a.data.attributes[c]={itemSize:g.itemSize,type:g.array.constructor.name,array:e,normalized:g.normalized}}var h=this.groups;h.length>0&&(a.data.groups=JSON.parse(JSON.stringify(h)));var i=this.boundingSphere;return null!==i&&(a.data.boundingSphere={center:i.center.toArray(),radius:i.radius}),a},clone:function(){return(new za).copy(this)},copy:function(a){var b,c,d;this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.name=a.name;var e=a.index;null!==e&&this.setIndex(e.clone());var f=a.attributes;for(b in f){var g=f[b];this.addAttribute(b,g.clone())}var h=a.morphAttributes;for(b in h){var i=[],j=h[b];for(c=0,d=j.length;c<d;c++)i.push(j[c].clone());this.morphAttributes[b]=i}var k=a.groups;for(c=0,d=k.length;c<d;c++){var l=k[c];this.addGroup(l.start,l.count,l.materialIndex)}var m=a.boundingBox;null!==m&&(this.boundingBox=m.clone());var n=a.boundingSphere;return null!==n&&(this.boundingSphere=n.clone()),this.drawRange.start=a.drawRange.start,this.drawRange.count=a.drawRange.count,this},dispose:function(){this.dispatchEvent({type:"dispose"})}}),Aa.prototype=Object.create(ma.prototype),Aa.prototype.constructor=Aa,Ba.prototype=Object.create(za.prototype),Ba.prototype.constructor=Ba,Ca.prototype=Object.create(ma.prototype),Ca.prototype.constructor=Ca,Da.prototype=Object.create(za.prototype),Da.prototype.constructor=Da,Ea.prototype=Object.create(Z.prototype),Ea.prototype.constructor=Ea,Ea.prototype.isMeshBasicMaterial=!0,Ea.prototype.copy=function(a){return Z.prototype.copy.call(this,a),this.color.copy(a.color),this.map=a.map,this.lightMap=a.lightMap,this.lightMapIntensity=a.lightMapIntensity,this.aoMap=a.aoMap,this.aoMapIntensity=a.aoMapIntensity,this.specularMap=a.specularMap,this.alphaMap=a.alphaMap,this.envMap=a.envMap,this.combine=a.combine,this.reflectivity=a.reflectivity,this.refractionRatio=a.refractionRatio,this.wireframe=a.wireframe,this.wireframeLinewidth=a.wireframeLinewidth,this.wireframeLinecap=a.wireframeLinecap,this.wireframeLinejoin=a.wireframeLinejoin,this.skinning=a.skinning,this.morphTargets=a.morphTargets,this},Fa.prototype=Object.create(Z.prototype),Fa.prototype.constructor=Fa,Fa.prototype.isShaderMaterial=!0,Fa.prototype.copy=function(a){return Z.prototype.copy.call(this,a),this.fragmentShader=a.fragmentShader,this.vertexShader=a.vertexShader,this.uniforms=Jd.clone(a.uniforms),this.defines=a.defines,this.wireframe=a.wireframe,this.wireframeLinewidth=a.wireframeLinewidth,this.lights=a.lights,this.clipping=a.clipping,this.skinning=a.skinning,this.morphTargets=a.morphTargets,this.morphNormals=a.morphNormals,this.extensions=a.extensions,this},Fa.prototype.toJSON=function(a){var b=Z.prototype.toJSON.call(this,a);return b.uniforms=this.uniforms,b.vertexShader=this.vertexShader,b.fragmentShader=this.fragmentShader,b},Object.assign(Ga.prototype,{set:function(a,b){return this.origin.copy(a),this.direction.copy(b),this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.origin.copy(a.origin),this.direction.copy(a.direction),this},at:function(a,b){return(b||new f).copy(this.direction).multiplyScalar(a).add(this.origin)},lookAt:function(a){return this.direction.copy(a).sub(this.origin).normalize(),this},recast:function(){var a=new f;return function(b){return this.origin.copy(this.at(b,a)),this}}(),closestPointToPoint:function(a,b){var c=b||new f;c.subVectors(a,this.origin);var d=c.dot(this.direction);return d<0?c.copy(this.origin):c.copy(this.direction).multiplyScalar(d).add(this.origin)},distanceToPoint:function(a){return Math.sqrt(this.distanceSqToPoint(a))},distanceSqToPoint:function(){var a=new f;return function(b){var c=a.subVectors(b,this.origin).dot(this.direction);return c<0?this.origin.distanceToSquared(b):(a.copy(this.direction).multiplyScalar(c).add(this.origin),a.distanceToSquared(b))}}(),distanceSqToSegment:function(){var a=new f,b=new f,c=new f;return function(d,e,f,g){a.copy(d).add(e).multiplyScalar(.5),b.copy(e).sub(d).normalize(),c.copy(this.origin).sub(a);var h,i,j,k,l=.5*d.distanceTo(e),m=-this.direction.dot(b),n=c.dot(this.direction),o=-c.dot(b),p=c.lengthSq(),q=Math.abs(1-m*m);if(q>0)if(h=m*o-n,i=m*n-o,k=l*q,h>=0)if(i>=-k)if(i<=k){var r=1/q;h*=r,i*=r,j=h*(h+m*i+2*n)+i*(m*h+i+2*o)+p}else i=l,h=Math.max(0,-(m*i+n)),j=-h*h+i*(i+2*o)+p;else i=-l,h=Math.max(0,-(m*i+n)),j=-h*h+i*(i+2*o)+p;else i<=-k?(h=Math.max(0,-(-m*l+n)),i=h>0?-l:Math.min(Math.max(-l,-o),l),j=-h*h+i*(i+2*o)+p):i<=k?(h=0,i=Math.min(Math.max(-l,-o),l),j=i*(i+2*o)+p):(h=Math.max(0,-(m*l+n)),i=h>0?l:Math.min(Math.max(-l,-o),l),j=-h*h+i*(i+2*o)+p);else i=m>0?-l:l,h=Math.max(0,-(m*i+n)),j=-h*h+i*(i+2*o)+p;return f&&f.copy(this.direction).multiplyScalar(h).add(this.origin),g&&g.copy(b).multiplyScalar(i).add(a),j}}(),intersectSphere:function(){var a=new f;return function(b,c){a.subVectors(b.center,this.origin);var d=a.dot(this.direction),e=a.dot(a)-d*d,f=b.radius*b.radius;if(e>f)return null;var g=Math.sqrt(f-e),h=d-g,i=d+g;return h<0&&i<0?null:h<0?this.at(i,c):this.at(h,c)}}(),intersectsSphere:function(a){return this.distanceToPoint(a.center)<=a.radius},distanceToPlane:function(a){var b=a.normal.dot(this.direction);if(0===b)return 0===a.distanceToPoint(this.origin)?0:null;var c=-(this.origin.dot(a.normal)+a.constant)/b;return c>=0?c:null},intersectPlane:function(a,b){var c=this.distanceToPlane(a);return null===c?null:this.at(c,b)},intersectsPlane:function(a){var b=a.distanceToPoint(this.origin);return 0===b||a.normal.dot(this.direction)*b<0},intersectBox:function(a,b){var c,d,e,f,g,h,i=1/this.direction.x,j=1/this.direction.y,k=1/this.direction.z,l=this.origin;return i>=0?(c=(a.min.x-l.x)*i,d=(a.max.x-l.x)*i):(c=(a.max.x-l.x)*i,d=(a.min.x-l.x)*i),j>=0?(e=(a.min.y-l.y)*j,f=(a.max.y-l.y)*j):(e=(a.max.y-l.y)*j,f=(a.min.y-l.y)*j),c>f||e>d?null:((e>c||c!==c)&&(c=e),(f<d||d!==d)&&(d=f),k>=0?(g=(a.min.z-l.z)*k,h=(a.max.z-l.z)*k):(g=(a.max.z-l.z)*k,h=(a.min.z-l.z)*k),c>h||g>d?null:((g>c||c!==c)&&(c=g),(h<d||d!==d)&&(d=h),d<0?null:this.at(c>=0?c:d,b)))},intersectsBox:function(){var a=new f;return function(b){return null!==this.intersectBox(b,a)}}(),intersectTriangle:function(){var a=new f,b=new f,c=new f,d=new f;return function(e,f,g,h,i){b.subVectors(f,e),c.subVectors(g,e),d.crossVectors(b,c);var j,k=this.direction.dot(d);if(k>0){if(h)return null;j=1}else{if(!(k<0))return null;j=-1,k=-k}a.subVectors(this.origin,e);var l=j*this.direction.dot(c.crossVectors(a,c));if(l<0)return null;var m=j*this.direction.dot(b.cross(a));if(m<0)return null;if(l+m>k)return null;var n=-j*a.dot(d);return n<0?null:this.at(n/k,i)}}(),applyMatrix4:function(a){return this.origin.applyMatrix4(a),this.direction.transformDirection(a),this},equals:function(a){return a.origin.equals(this.origin)&&a.direction.equals(this.direction)}}),Object.assign(Ha.prototype,{set:function(a,b){return this.start.copy(a),this.end.copy(b),this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.start.copy(a.start),this.end.copy(a.end),this},getCenter:function(a){return(a||new f).addVectors(this.start,this.end).multiplyScalar(.5)},delta:function(a){return(a||new f).subVectors(this.end,this.start)},distanceSq:function(){return this.start.distanceToSquared(this.end)},distance:function(){return this.start.distanceTo(this.end)},at:function(a,b){var c=b||new f;return this.delta(c).multiplyScalar(a).add(this.start)},closestPointToPointParameter:function(){var a=new f,b=new f;return function(c,d){a.subVectors(c,this.start),b.subVectors(this.end,this.start);var e=b.dot(b),f=b.dot(a),g=f/e;return d&&(g=yd.clamp(g,0,1)),g}}(),closestPointToPoint:function(a,b,c){var d=this.closestPointToPointParameter(a,b),e=c||new f;return this.delta(e).multiplyScalar(d).add(this.start)},applyMatrix4:function(a){return this.start.applyMatrix4(a),this.end.applyMatrix4(a),this},equals:function(a){return a.start.equals(this.start)&&a.end.equals(this.end)}}),Object.assign(Ia,{normal:function(){var a=new f;return function(b,c,d,e){var g=e||new f;g.subVectors(d,c),a.subVectors(b,c),g.cross(a);var h=g.lengthSq();return h>0?g.multiplyScalar(1/Math.sqrt(h)):g.set(0,0,0)}}(),barycoordFromPoint:function(){var a=new f,b=new f,c=new f;return function(d,e,g,h,i){a.subVectors(h,e),b.subVectors(g,e),c.subVectors(d,e);var j=a.dot(a),k=a.dot(b),l=a.dot(c),m=b.dot(b),n=b.dot(c),o=j*m-k*k,p=i||new f;if(0===o)return p.set(-2,-1,-1);var q=1/o,r=(m*l-k*n)*q,s=(j*n-k*l)*q;return p.set(1-r-s,s,r)}}(),containsPoint:function(){var a=new f;return function(b,c,d,e){var f=Ia.barycoordFromPoint(b,c,d,e,a);return f.x>=0&&f.y>=0&&f.x+f.y<=1}}()}),Object.assign(Ia.prototype,{set:function(a,b,c){return this.a.copy(a),this.b.copy(b),this.c.copy(c),this},setFromPointsAndIndices:function(a,b,c,d){return this.a.copy(a[b]),this.b.copy(a[c]),this.c.copy(a[d]),this},clone:function(){return(new this.constructor).copy(this)},copy:function(a){return this.a.copy(a.a),this.b.copy(a.b),this.c.copy(a.c),this},area:function(){var a=new f,b=new f;return function(){return a.subVectors(this.c,this.b),b.subVectors(this.a,this.b),.5*a.cross(b).length()}}(),midpoint:function(a){return(a||new f).addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)},normal:function(a){return Ia.normal(this.a,this.b,this.c,a)},plane:function(a){return(a||new ca).setFromCoplanarPoints(this.a,this.b,this.c)},barycoordFromPoint:function(a,b){return Ia.barycoordFromPoint(a,this.a,this.b,this.c,b)},containsPoint:function(a){return Ia.containsPoint(a,this.a,this.b,this.c)},closestPointToPoint:function(){var a=new ca,b=[new Ha,new Ha,new Ha],c=new f,d=new f;return function(e,g){var h=g||new f,i=1/0;if(a.setFromCoplanarPoints(this.a,this.b,this.c),a.projectPoint(e,c),!0===this.containsPoint(c))h.copy(c);else{b[0].set(this.a,this.b),b[1].set(this.b,this.c),b[2].set(this.c,this.a);for(var j=0;j<b.length;j++){b[j].closestPointToPoint(c,!0,d);var k=c.distanceToSquared(d);k<i&&(i=k,h.copy(d))}}return h}}(),equals:function(a){return a.a.equals(this.a)&&a.b.equals(this.b)&&a.c.equals(this.c)}}),Ja.prototype=Object.assign(Object.create(ia.prototype),{constructor:Ja,isMesh:!0,setDrawMode:function(a){this.drawMode=a},copy:function(a){return ia.prototype.copy.call(this,a),this.drawMode=a.drawMode,void 0!==a.morphTargetInfluences&&(this.morphTargetInfluences=a.morphTargetInfluences.slice()),void 0!==a.morphTargetDictionary&&(this.morphTargetDictionary=Object.assign({},a.morphTargetDictionary)),this},updateMorphTargets:function(){var a,b,c,d=this.geometry;if(d.isBufferGeometry){var e=d.morphAttributes,f=Object.keys(e);if(f.length>0){var g=e[f[0]];if(void 0!==g)for(this.morphTargetInfluences=[],this.morphTargetDictionary={},a=0,b=g.length;a<b;a++)c=g[a].name||String(a),this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=a}}else{var h=d.morphTargets;if(void 0!==h&&h.length>0)for(this.morphTargetInfluences=[],this.morphTargetDictionary={},a=0,b=h.length;a<b;a++)c=h[a].name||String(a),this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=a}},raycast:function(){function a(a,b,c,d,e,f,g){return Ia.barycoordFromPoint(a,b,c,d,s),e.multiplyScalar(s.x),f.multiplyScalar(s.y),g.multiplyScalar(s.z),e.add(f).add(g),e.clone()}function b(a,b,c,d,e,f,g,h){if(null===(b.side===Hb?d.intersectTriangle(g,f,e,!0,h):d.intersectTriangle(e,f,g,b.side!==Ib,h)))return null;u.copy(h),u.applyMatrix4(a.matrixWorld);var i=c.ray.origin.distanceTo(u);return i<c.near||i>c.far?null:{distance:i,point:u.clone(),object:a}}function e(c,d,e,f,g,h,i,m){j.fromBufferAttribute(f,h),k.fromBufferAttribute(f,i),l.fromBufferAttribute(f,m);var n=b(c,c.material,d,e,j,k,l,t);return n&&(g&&(p.fromBufferAttribute(g,h),q.fromBufferAttribute(g,i),r.fromBufferAttribute(g,m),n.uv=a(t,j,k,l,p,q,r)),n.face=new la(h,i,m,Ia.normal(j,k,l)),n.faceIndex=h),n}var g=new d,h=new Ga,i=new ba,j=new f,k=new f,l=new f,m=new f,n=new f,o=new f,p=new c,q=new c,r=new c,s=new f,t=new f,u=new f;return function(c,d){var f=this.geometry,s=this.material,u=this.matrixWorld;if(void 0!==s&&(null===f.boundingSphere&&f.computeBoundingSphere(),i.copy(f.boundingSphere),i.applyMatrix4(u),!1!==c.ray.intersectsSphere(i)&&(g.getInverse(u),h.copy(c.ray).applyMatrix4(g),null===f.boundingBox||!1!==h.intersectsBox(f.boundingBox)))){var v;if(f.isBufferGeometry){var w,x,y,z,A,B=f.index,C=f.attributes.position,D=f.attributes.uv;if(null!==B)for(z=0,A=B.count;z<A;z+=3)w=B.getX(z),x=B.getX(z+1),y=B.getX(z+2),(v=e(this,c,h,C,D,w,x,y))&&(v.faceIndex=Math.floor(z/3),d.push(v));else if(void 0!==C)for(z=0,A=C.count;z<A;z+=3)w=z,x=z+1,y=z+2,(v=e(this,c,h,C,D,w,x,y))&&(v.index=w,d.push(v))}else if(f.isGeometry){var E,F,G,H,I=Array.isArray(s),J=f.vertices,K=f.faces,L=f.faceVertexUvs[0];L.length>0&&(H=L);for(var M=0,N=K.length;M<N;M++){var O=K[M],P=I?s[O.materialIndex]:s;if(void 0!==P){if(E=J[O.a],F=J[O.b],G=J[O.c],!0===P.morphTargets){var Q=f.morphTargets,R=this.morphTargetInfluences;j.set(0,0,0),k.set(0,0,0),l.set(0,0,0);for(var S=0,T=Q.length;S<T;S++){var U=R[S];if(0!==U){var V=Q[S].vertices;j.addScaledVector(m.subVectors(V[O.a],E),U),k.addScaledVector(n.subVectors(V[O.b],F),U),l.addScaledVector(o.subVectors(V[O.c],G),U)}}j.add(E),k.add(F),l.add(G),E=j,F=k,G=l}if(v=b(this,P,c,h,E,F,G,t)){if(H&&H[M]){var W=H[M];p.copy(W[0]),q.copy(W[1]),r.copy(W[2]),v.uv=a(t,E,F,G,p,q,r)}v.face=O,v.faceIndex=M,d.push(v)}}}}}}}(),clone:function(){return new this.constructor(this.geometry,this.material).copy(this)}});var Sf=0;ob.prototype=Object.assign(Object.create(ja.prototype),{constructor:ob,isPerspectiveCamera:!0,copy:function(a,b){return ja.prototype.copy.call(this,a,b),this.fov=a.fov,this.zoom=a.zoom,this.near=a.near,this.far=a.far,this.focus=a.focus,this.aspect=a.aspect,this.view=null===a.view?null:Object.assign({},a.view),this.filmGauge=a.filmGauge,this.filmOffset=a.filmOffset,this},setFocalLength:function(a){var b=.5*this.getFilmHeight()/a;this.fov=2*yd.RAD2DEG*Math.atan(b),this.updateProjectionMatrix()},getFocalLength:function(){var a=Math.tan(.5*yd.DEG2RAD*this.fov);return.5*this.getFilmHeight()/a},getEffectiveFOV:function(){return 2*yd.RAD2DEG*Math.atan(Math.tan(.5*yd.DEG2RAD*this.fov)/this.zoom)},getFilmWidth:function(){return this.filmGauge*Math.min(this.aspect,1)},getFilmHeight:function(){return this.filmGauge/Math.max(this.aspect,1)},setViewOffset:function(a,b,c,d,e,f){this.aspect=a/b,null===this.view&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=a,this.view.fullHeight=b,this.view.offsetX=c,this.view.offsetY=d,this.view.width=e,this.view.height=f,this.updateProjectionMatrix()},clearViewOffset:function(){null!==this.view&&(this.view.enabled=!1),this.updateProjectionMatrix()},updateProjectionMatrix:function(){var a=this.near,b=a*Math.tan(.5*yd.DEG2RAD*this.fov)/this.zoom,c=2*b,d=this.aspect*c,e=-.5*d,f=this.view;if(null!==this.view&&this.view.enabled){var g=f.fullWidth,h=f.fullHeight;e+=f.offsetX*d/g,b-=f.offsetY*c/h,d*=f.width/g,c*=f.height/h}var i=this.filmOffset;0!==i&&(e+=a*i/this.getFilmWidth()),this.projectionMatrix.makePerspective(e,e+d,b,b-c,a,this.far)},toJSON:function(a){var b=ia.prototype.toJSON.call(this,a);return b.object.fov=this.fov,b.object.zoom=this.zoom,b.object.near=this.near,b.object.far=this.far,b.object.focus=this.focus,b.object.aspect=this.aspect,null!==this.view&&(b.object.view=Object.assign({},this.view)),b.object.filmGauge=this.filmGauge,b.object.filmOffset=this.filmOffset,b}}),pb.prototype=Object.assign(Object.create(ob.prototype),{constructor:pb,isArrayCamera:!0}),vb.prototype=Object.assign(Object.create(ia.prototype),{constructor:vb,copy:function(a,b){return ia.prototype.copy.call(this,a,b),null!==a.background&&(this.background=a.background.clone()),null!==a.fog&&(this.fog=a.fog.clone()),null!==a.overrideMaterial&&(this.overrideMaterial=a.overrideMaterial.clone()),this.autoUpdate=a.autoUpdate,this.matrixAutoUpdate=a.matrixAutoUpdate,this},toJSON:function(a){var b=ia.prototype.toJSON.call(this,a);return null!==this.background&&(b.object.background=this.background.toJSON(a)),null!==this.fog&&(b.object.fog=this.fog.toJSON()),b}});var Tf={enabled:!1,files:{},add:function(a,b){!1!==this.enabled&&(this.files[a]=b)},get:function(a){if(!1!==this.enabled)return this.files[a]},remove:function(a){delete this.files[a]},clear:function(){this.files={}}},Uf=new wb;Object.assign(xb.prototype,{crossOrigin:"Anonymous",load:function(a,b,c,d){void 0===a&&(a=""),void 0!==this.path&&(a=this.path+a),a=this.manager.resolveURL(a);var e=this,f=Tf.get(a);if(void 0!==f)return e.manager.itemStart(a),setTimeout(function(){b&&b(f),e.manager.itemEnd(a)},0),f;var g=document.createElementNS("http://www.w3.org/1999/xhtml","img");return g.addEventListener("load",function(){Tf.add(a,this),b&&b(this),e.manager.itemEnd(a)},!1),g.addEventListener("error",function(b){d&&d(b),e.manager.itemEnd(a),e.manager.itemError(a)},!1),"data:"!==a.substr(0,5)&&void 0!==this.crossOrigin&&(g.crossOrigin=this.crossOrigin),e.manager.itemStart(a),g.src=a,g},setCrossOrigin:function(a){return this.crossOrigin=a,this},setPath:function(a){return this.path=a,this}}),Object.assign(yb.prototype,{crossOrigin:"Anonymous",load:function(a,b,c,d){var e=new h,f=new xb(this.manager);return f.setCrossOrigin(this.crossOrigin),f.setPath(this.path),f.load(a,function(c){e.image=c;var d=a.search(/\.(jpg|jpeg)$/)>0||0===a.search(/^data\:image\/jpeg/);e.format=d?Zc:$c,e.needsUpdate=!0,void 0!==b&&b(e)},c,d),e},setCrossOrigin:function(a){return this.crossOrigin=a,this},setPath:function(a){return this.path=a,this}}),a.WebGLRenderTarget=j,a.WebGLRenderer=ub,a.Scene=vb,a.Mesh=Ja,a.DataTexture=k,a.PlaneGeometry=Ca,a.ShaderMaterial=Fa,a.MeshBasicMaterial=Ea,a.Material=Z,a.TextureLoader=yb,a.OrthographicCamera=ka,a.ClampToEdgeWrapping=Ec,a.FloatType=Sc,a.LinearFilter=Jc,a.NearestFilter=Gc,a.NearestMipMapNearestFilter=Hc,a.RepeatWrapping=Dc,a.RGBAFormat=$c,a.UnsignedByteType=Mc,Object.defineProperty(a,"__esModule",{value:!0})}),require=function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c||a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){(function(b){b.THREE=a("three"),THREE={ClampToEdgeWrapping:THREE.ClampToEdgeWrapping,DataTexture:THREE.DataTexture,FloatType:THREE.FloatType,LinearFilter:THREE.LinearFilter,Material:THREE.Material,Mesh:THREE.Mesh,MeshBasicMaterial:THREE.MeshBasicMaterial,NearestFilter:THREE.NearestFilter,NearestMipMapNearestFilter:THREE.NearestMipMapNearestFilter,OrthographicCamera:THREE.OrthographicCamera,PlaneGeometry:THREE.PlaneGeometry,RepeatWrapping:THREE.RepeatWrapping,RGBAFormat:THREE.RGBAFormat,Scene:THREE.Scene,ShaderMaterial:THREE.ShaderMaterial,TextureLoader:THREE.TextureLoader,UnsignedByteType:THREE.UnsignedByteType,WebGLRenderer:THREE.WebGLRenderer,WebGLRenderTarget:THREE.WebGLRenderTarget}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{three:"three"}],three:[function(a,b,c){b.exports=window.THREE},{}]},{},[1]);var Detector={canvas:!!window.CanvasRenderingContext2D,webgl:function(){try{var a=document.createElement("canvas");return!(!window.WebGLRenderingContext||!a.getContext("webgl")&&!a.getContext("experimental-webgl"))}catch(a){return!1}}(),workers:!!window.Worker,fileapi:window.File&&window.FileReader&&window.FileList&&window.Blob,getWebGLErrorMessage:function(){var a=document.createElement("div");return a.id="webgl-error-message",a.style.fontFamily="monospace",a.style.fontSize="13px",a.style.fontWeight="normal",a.style.textAlign="center",a.style.background="#fff",a.style.color="#000",a.style.padding="1.5em",a.style.width="400px",a.style.margin="5em auto 0",this.webgl||(a.innerHTML=window.WebGLRenderingContext?['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />','Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n"):['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>','Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n")),a},addGetWebGLMessage:function(a){var b,c,d;a=a||{},b=void 0!==a.parent?a.parent:document.body,c=void 0!==a.id?a.id:"oldie",d=Detector.getWebGLErrorMessage(),d.id=c,b.appendChild(d)}};"object"==typeof module&&(module.exports=Detector),function(a,b){"use strict";function c(){if(a.postMessage&&!a.importScripts){var b=!0,c=a.onmessage;return a.onmessage=function(){b=!1},a.postMessage("","*"),a.onmessage=c,b}}function d(){return a.navigator&&/Trident/.test(a.navigator.userAgent)}if(!d()&&(a.msSetImmediate||a.setImmediate))return void(a.setImmediate||(a.setImmediate=a.msSetImmediate,a.clearImmediate=a.msClearImmediate));var e=a.document,f=Array.prototype.slice,g=Object.prototype.toString,h={};h.polifill={},h.nextId=1,h.tasks={},h.lock=!1,h.run=function(b){if(h.lock)a.setTimeout(h.wrap(h.run,b),0);else{var c=h.tasks[b];if(c){h.lock=!0;try{c()}finally{h.clear(b),h.lock=!1}}}},h.wrap=function(a){var c=f.call(arguments,1);return function(){a.apply(b,c)}},h.create=function(a){return h.tasks[h.nextId]=h.wrap.apply(b,a),h.nextId++},h.clear=function(a){delete h.tasks[a]},h.polifill.messageChannel=function(){var b=new a.MessageChannel;return b.port1.onmessage=function(a){h.run(Number(a.data))},function(){var a=h.create(arguments);return b.port2.postMessage(a),a}},h.polifill.nextTick=function(){return function(){var b=h.create(arguments);return a.process.nextTick(h.wrap(h.run,b)),b}},h.polifill.postMessage=function(){var b="setImmediate$"+Math.random()+"$",c=function(c){c.source===a&&"string"==typeof c.data&&0===c.data.indexOf(b)&&h.run(Number(c.data.slice(b.length)))};return a.addEventListener?a.addEventListener("message",c,!1):a.attachEvent("onmessage",c),function(){var c=h.create(arguments);return a.postMessage(b+c,"*"),c}},h.polifill.readyStateChange=function(){var a=e.documentElement;return function(){var b=h.create(arguments),c=e.createElement("script");return c.onreadystatechange=function(){h.run(b),c.onreadystatechange=null,a.removeChild(c),c=null},a.appendChild(c),b}},h.polifill.setTimeout=function(){return function(){var b=h.create(arguments);return a.setTimeout(h.wrap(h.run,b),0),b}};var i;i=d()?"setTimeout":"[object process]"===g.call(a.process)?"nextTick":c()?"postMessage":a.MessageChannel?"messageChannel":e&&"onreadystatechange"in e.createElement("script")?"readyStateChange":"setTimeout";var j=Object.getPrototypeOf&&Object.getPrototypeOf(a);j=j&&j.setTimeout?j:a,j.setImmediate=h.polifill[i](),j.setImmediate.usePolifill=i,j.msSetImmediate=j.setImmediate,j.clearImmediate=h.clear,j.msClearImmediate=h.clear}(function(){return this||(0,eval)("this")}()),function(){"use strict";function a(){}function b(a,b){for(var c=a.length;c--;)if(a[c].listener===b)return c;return-1}function c(a){return function(){return this[a].apply(this,arguments)}}var d=a.prototype,e=this,f=e.EventEmitter;d.getListeners=function(a){var b,c,d=this._getEvents();if(a instanceof RegExp){b={};for(c in d)d.hasOwnProperty(c)&&a.test(c)&&(b[c]=d[c])}else b=d[a]||(d[a]=[]);return b},d.flattenListeners=function(a){var b,c=[];for(b=0;b<a.length;b+=1)c.push(a[b].listener);return c},d.getListenersAsObject=function(a){var b,c=this.getListeners(a);return c instanceof Array&&(b={},b[a]=c),b||c},d.addListener=function(a,c){var d,e=this.getListenersAsObject(a),f="object"==typeof c;for(d in e)e.hasOwnProperty(d)&&-1===b(e[d],c)&&e[d].push(f?c:{listener:c,once:!1});return this},d.on=c("addListener"),d.addOnceListener=function(a,b){return this.addListener(a,{listener:b,once:!0})},d.once=c("addOnceListener"),d.defineEvent=function(a){return this.getListeners(a),this},d.defineEvents=function(a){for(var b=0;b<a.length;b+=1)this.defineEvent(a[b]);return this},d.removeListener=function(a,c){var d,e,f=this.getListenersAsObject(a);for(e in f)f.hasOwnProperty(e)&&-1!==(d=b(f[e],c))&&f[e].splice(d,1);return this},d.off=c("removeListener"),d.addListeners=function(a,b){return this.manipulateListeners(!1,a,b)},d.removeListeners=function(a,b){return this.manipulateListeners(!0,a,b)},d.manipulateListeners=function(a,b,c){var d,e,f=a?this.removeListener:this.addListener,g=a?this.removeListeners:this.addListeners;if("object"!=typeof b||b instanceof RegExp)for(d=c.length;d--;)f.call(this,b,c[d]);else for(d in b)b.hasOwnProperty(d)&&(e=b[d])&&("function"==typeof e?f.call(this,d,e):g.call(this,d,e));return this},d.removeEvent=function(a){var b,c=typeof a,d=this._getEvents();if("string"===c)delete d[a];else if(a instanceof RegExp)for(b in d)d.hasOwnProperty(b)&&a.test(b)&&delete d[b];else delete this._events;return this},d.removeAllListeners=c("removeEvent"),d.emitEvent=function(a,b){var c,d,e,f,g=this.getListenersAsObject(a);for(f in g)if(g.hasOwnProperty(f))for(c=g[f].slice(0),e=c.length;e--;)d=c[e],!0===d.once&&this.removeListener(a,d.listener),d.listener.apply(this,b||[])===this._getOnceReturnValue()&&this.removeListener(a,d.listener);return this},d.trigger=c("emitEvent"),d.emit=function(a){var b=Array.prototype.slice.call(arguments,1);return this.emitEvent(a,b)},d.setOnceReturnValue=function(a){return this._onceReturnValue=a,this},d._getOnceReturnValue=function(){return!this.hasOwnProperty("_onceReturnValue")||this._onceReturnValue},d._getEvents=function(){return this._events||(this._events={})},a.noConflict=function(){return e.EventEmitter=f,a},"function"==typeof define&&define.amd?define(function(){return a}):"object"==typeof module&&module.exports?module.exports=a:e.EventEmitter=a}.call(this),GrowingPacker=function(){},GrowingPacker.prototype={fit:function(a){var b,c,d,e=a.length,f=e>0?a[0].w:0,g=e>0?a[0].h:0;for(this.root={x:0,y:0,w:f,h:g},b=0;b<e;b++)d=a[b],(c=this.findNode(this.root,d.w,d.h))?d.fit=this.splitNode(c,d.w,d.h):d.fit=this.growNode(d.w,d.h)},findNode:function(a,b,c){return a.used?this.findNode(a.right,b,c)||this.findNode(a.down,b,c):b<=a.w&&c<=a.h?a:null},splitNode:function(a,b,c){return a.used=!0,a.down={x:a.x,y:a.y+c,w:a.w,h:a.h-c},a.right={x:a.x+b,y:a.y,w:a.w-b,h:c},a},growNode:function(a,b){var c=a<=this.root.w,d=b<=this.root.h,e=d&&this.root.h>=this.root.w+a,f=c&&this.root.w>=this.root.h+b;return e?this.growRight(a,b):f?this.growDown(a,b):d?this.growRight(a,b):c?this.growDown(a,b):null},growRight:function(a,b){this.root={used:!0,x:0,y:0,w:this.root.w+a,h:this.root.h,down:this.root,right:{x:this.root.w,y:0,w:a,h:this.root.h}};var c=this.findNode(this.root,a,b);return c?this.splitNode(c,a,b):null},growDown:function(a,b){this.root={used:!0,x:0,y:0,w:this.root.w,h:this.root.h+b,down:{x:0,y:this.root.h,w:this.root.w,h:b},right:this.root};var c=this.findNode(this.root,a,b);return c?this.splitNode(c,a,b):null}},function(){function a(a,d){var e=(new Date).getTime(),f=Math.max(0,16-(e-c)),g=b.setTimeout(function(){a(e+f)},f);return c=e+f,g}for(var b=this,c=0,d=["ms","moz","webkit","o"],e=0;e<d.length&&!b.requestAnimationFrame;++e)b.requestAnimationFrame=b[d[e]+"RequestAnimationFrame"],b.cancelAnimationFrame=b[d[e]+"CancelAnimationFrame"]||b[d[e]+"CancelRequestAnimationFrame"];b.requestAnimationFrame||(b.requestAnimationFrame=a),b.cancelAnimationFrame||(b.cancelAnimationFrame=function(a){clearTimeout(a)}),"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=b.requestAnimationFrame),exports.requestAnimationFrame=b.requestAnimationFrame):b.requestAnimationFrame=b.requestAnimationFrame,"function"==typeof define&&define.amd&&define("requestAnimationFrame",[],function(){return b.requestAnimationFrame})}(),function(a,b,c,d,e){var f=this,g=f.Blotter=a=function(a,b){d.webgl||g.Messaging.throwError("Blotter",!1,"device does not support webgl"),this._texts=[],this._textEventBindings={},this._scopes={},this._scopeEventBindings={},this._renderer=new g.Renderer,this._startTime=0,this._lastDrawTime=0,this.init.apply(this,arguments)};g.prototype=function(){function a(){var a=Date.now();this._material.uniforms.uTimeDelta.value=(a-(this._lastDrawTime||a))/1e3,this._material.uniforms.uGlobalTime.value=(a-this._startTime)/1e3,this._lastDrawTime=a}function c(){a.call(this),b.each(this._scopes,b.bind(function(a){a.playing&&a.render(),this.trigger("render")},this))}function d(a){if(this.mappingMaterial){var b=this._material.uniforms[a].value;this.mappingMaterial.uniformInterface[a].value=b}}function e(a,b){if(this.mappingMaterial){var c=this._scopes[a],d=c.material.uniforms[b].value;this.mappingMaterial.textUniformInterface[a][b].value=d}}function f(){var a,c,d;a=b.bind(function(){return b.bind(function(a){g.MappingBuilder.build(this._texts,b.bind(function(b){this._mapping=b,this._mapping.ratio=this.ratio,a()},this))},this)},this),c=b.bind(function(){return b.bind(function(a){g.MappingMaterialBuilder.build(this._mapping,this._material,b.bind(function(b){this.mappingMaterial=b,a()},this))},this)},this),d=[a(),c()],b(d).reduceRight(b.wrap,b.bind(function(){this._renderer.stop(),b.each(this._scopes,b.bind(function(a,b){a.mappingMaterial=this.mappingMaterial,a.needsUpdate=!0},this)),this._renderer.material=this.mappingMaterial.shaderMaterial,this._renderer.width=this._mapping.width,this._renderer.height=this._mapping.height,this.autostart&&this.start(),this.trigger(this.lastUpdated?"update":"ready"),this.lastUpdated=Date.now()},this))()}return{constructor:g,get needsUpdate(){},set needsUpdate(a){!0===a&&f.call(this)},get material(){return this._material},set material(a){this.setMaterial(a)},get texts(){return this._texts},set texts(a){this.removeTexts(this._texts),this.addTexts(a)},get imageData(){return this._renderer.imageData},init:function(a,d){d=d||{},b.defaults(this,d,{ratio:g.CanvasUtils.pixelRatio,autobuild:!0,autostart:!0,autoplay:!0}),this.setMaterial(a),this.addTexts(d.texts),this._renderer.on("render",b.bind(c,this)),this.autobuild&&(this.needsUpdate=!0),this.autostart&&this.start()},start:function(){this.autostart=!0,this._startTime=Date.now(),this._renderer.start()},stop:function(){this.autostart=!1,this._renderer.stop()},teardown:function(){this._renderer.teardown()},setMaterial:function(a){g.Messaging.ensureInstanceOf(a,g.Material,"Blotter.Material","Blotter","setMaterial"),this._material=a,this._materialEventBinding&&this._materialEventBinding.unsetEventCallbacks(),this._materialEventBinding=new g.ModelEventBinding(a,{update:b.bind(function(){f.call(this)},this),updateUniform:b.bind(function(a){d.call(this,a)},this)}),a.on("update",this._materialEventBinding.eventCallbacks.update),a.on("update:uniform",this._materialEventBinding.eventCallbacks.updateUniform)},addText:function(a){this.addTexts(a)},addTexts:function(a){var c=g.TextUtils.filterTexts(a),d=b.difference(c,this._texts);b.each(d,b.bind(function(a){this._texts.push(a),this._textEventBindings[a.id]=new g.ModelEventBinding(a,{update:b.bind(function(){f.call(this)},this)}),a.on("update",this._textEventBindings[a.id].eventCallbacks.update),this._scopes[a.id]=new g.RenderScope(a,this),this._scopeEventBindings[a.id]=new g.ModelEventBinding(this._scopes[a.id],{updateUniform:b.bind(function(b){e.call(this,a.id,b)},this)}),this._scopes[a.id].on("update:uniform",this._scopeEventBindings[a.id].eventCallbacks.updateUniform)},this))},removeText:function(a){this.removeTexts(a)},removeTexts:function(a){var c=g.TextUtils.filterTexts(a),d=b.intersection(this._texts,c);b.each(d,b.bind(function(a){this._texts=b.without(this._texts,a),this._textEventBindings[a.id].unsetEventCallbacks(),this._scopeEventBindings[a.id].unsetEventCallbacks(),delete this._textEventBindings[a.id],delete this._scopeEventBindings[a.id],delete this._scopes[a.id]},this))},forText:function(a){return g.Messaging.ensureInstanceOf(a,g.Text,"Blotter.Text","Blotter","forText"),this._scopes[a.id]?this._scopes[a.id]:void g.Messaging.logError("Blotter","forText","Blotter.Text object not found in blotter")},boundsForText:function(a){return g.Messaging.ensureInstanceOf(a,g.Text,"Blotter.Text","Blotter","boundsForText"),this._scopes[a.id]?this._mapping?this.mappingMaterial.boundsForText(a):void 0:void g.Messaging.logError("Blotter","boundsForText","Blotter.Text object not found in blotter")}}}(),b.extend(g.prototype,e.prototype),g.Version="v0.1.0",g.webglRenderer=g.webglRenderer||new c.WebGLRenderer({antialias:!0,alpha:!0,premultipliedAlpha:!1}),g.Assets=g.Assets||{},g.Assets.Shaders=g.Assets.Shaders||{}}(this.Blotter,this._,this.THREE,this.Detector,this.EventEmitter),function(a){a.Math={generateUUID:function(){for(var a=[],b=0;b<256;b++)a[b]=(b<16?"0":"")+b.toString(16).toUpperCase();return function(){var b=4294967295*Math.random()|0,c=4294967295*Math.random()|0,d=4294967295*Math.random()|0,e=4294967295*Math.random()|0;return a[255&b]+a[b>>8&255]+a[b>>16&255]+a[b>>24&255]+"-"+a[255&c]+a[c>>8&255]+"-"+a[c>>16&15|64]+a[c>>24&255]+"-"+a[63&d|128]+a[d>>8&255]+"-"+a[d>>16&255]+a[d>>24&255]+a[255&e]+a[e>>8&255]+a[e>>16&255]+a[e>>24&255]}}()}}(this.Blotter),function(a){a.Messaging=function(){function a(a,b,c){return a+(b?"#"+b:"")+": "+c}return{ensureInstanceOf:function(a,b,c,d,e){if(!(a instanceof b))return void this.logError(d,e,"argument must be instanceof "+c)},logError:function(b,c,d){var e=a(b,c,d);console.error(e)},logWarning:function(b,c,d){var e=a(b,c,d);console.warn(e)},throwError:function(b,c,d){throw a(b,c,d)}}}()}(this.Blotter),function(a,b){a._extendWithGettersSetters=function(a){return b.each(Array.prototype.slice.call(arguments,1),function(b){if(b)for(var c in b)a[c]&&Object.getOwnPropertyDescriptor(a,c)&&Object.getOwnPropertyDescriptor(a,c).set?Object.getOwnPropertyDescriptor(a,c).set(b[c]):a[c]=b[c]}),a}}(this.Blotter,this._),function(a){a.VendorPrefixes=["ms","moz","webkit","o"]}(this.Blotter),function(a,b){a.ModelEventBinding=function(a,b){this.model=a,this.eventCallbacks=b||{}},a.ModelEventBinding.prototype={constructor:a.ModelEventBinding,unsetEventCallbacks:function(){b.each(this.eventCallbacks,b.bind(function(a,b){this.model.off(b,a)},this))}}}(this.Blotter,this._),function(a){a.CanvasUtils={canvas:function(a,b,c){c=c||{};var d=document.createElement("canvas");return d.className=c.class,d.innerHTML=c.html,d.width=a,d.height=b,d},hiDpiCanvas:function(a,b,c,d){c=c||this.pixelRatio,d=d||{};var e=document.createElement("canvas");return e.className=d.class,e.innerHTML=d.html,this.updateCanvasSize(e,a,b,c),e},updateCanvasSize:function(a,b,c,d){d=d||1,a.width=b*d,a.height=c*d,a.style.width=b+"px",a.style.height=c+"px",a.getContext("2d").setTransform(d,0,0,d,0,0)},pixelRatio:function(){for(var b=document.createElement("canvas").getContext("2d"),c=window.devicePixelRatio||1,d=b.backingStorePixelRatio,e=0;e<a.VendorPrefixes.length&&!d;++e)d=b[a.VendorPrefixes[e]+"BackingStorePixelRatio"];return d=d||1,c/d}(),mousePosition:function(a,b){var c=a.getBoundingClientRect();return{x:b.clientX-c.left,y:b.clientY-c.top}},normalizedMousePosition:function(a,b){var c=a.getBoundingClientRect(),d=this.mousePosition(a,b);return{x:d.x/c.width,y:d.y/c.height}}}}(this.Blotter),function(a,b){a.PropertyDefaults={family:"sans-serif",size:12,leading:1.5,fill:"#000",style:"normal",weight:400,padding:0,paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0},a.TextUtils={Properties:b.keys(a.PropertyDefaults),ensurePropertyValues:function(c){return c=b.defaults(c||{},a.PropertyDefaults)},filterTexts:function(c){return c=c instanceof a.Text?[c]:b.toArray(c),b.filter(c,b.bind(function(b){var c=b instanceof a.Text;return c||a.Messaging.logWarning("Blotter.TextUtils","filterTexts","object must be instance of Blotter.Text"),c},this))},stringifiedPadding:function(a){var b=a||this.ensurePropertyValues();return(a.paddingTop||b.padding)+"px "+(b.paddingRight||b.padding)+"px "+(b.paddingBottom||b.padding)+"px "+(b.paddingLeft||b.padding)+"px"},sizeForText:function(a,b){var c,d=document.createElement("span");return b=this.ensurePropertyValues(b),d.innerHTML=a,d.style.display="inline-block",d.style.fontFamily=b.family,d.style.fontSize=b.size+"px",d.style.fontWeight=b.weight,d.style.fontStyle=b.style,d.style.lineHeight=b.leading,d.style.maxWidth="none",d.style.padding=this.stringifiedPadding(b),d.style.position="absolute",d.style.width="auto",d.style.visibility="hidden",document.body.appendChild(d),c={w:d.offsetWidth,h:d.offsetHeight},document.body.removeChild(d),c}}}(this.Blotter,this._),function(a,b){a.UniformUtils={UniformTypes:["1f","2f","3f","4f"],defaultUniforms:{uResolution:{type:"2f",value:[0,0]},uGlobalTime:{type:"1f",value:0},uTimeDelta:{type:"1f",value:0},uBlendColor:{type:"4f",value:[1,1,1,1]},uPixelRatio:{type:"1f",value:a.CanvasUtils.pixelRatio}},validValueForUniformType:function(a,c){var d=!1,e=function(a){return!isNaN(a)};switch(a){case"1f":d=!isNaN(c)&&[c].every(e);break;case"2f":d=b.isArray(c)&&2==c.length&&c.every(e);break;case"3f":d=b.isArray(c)&&3==c.length&&c.every(e);break;case"4f":d=b.isArray(c)&&4==c.length&&c.every(e)}return d},glslDataTypeForUniformType:function(a){var b;switch(a){case"1f":b="float";break;case"2f":b="vec2";break;case"3f":b="vec3";break;case"4f":b="vec4"}return b},fullSwizzleStringForUniformType:function(a){var b;switch(a){case"1f":b="x";break;case"2f":b="xy";break;case"3f":b="xyz";break;case"4f":b="xyzw"}return b},extractValidUniforms:function(c){return c=c||{},b.reduce(c,function(c,d,e){return-1==a.UniformUtils.UniformTypes.indexOf(d.type)?(a.Messaging.logError("Blotter.UniformUtils","extractValidUniforms","uniforms must be one of type: "+a.UniformUtils.UniformTypes.join(", ")),c):a.UniformUtils.validValueForUniformType(d.type,d.value)?(c[e]=b.pick(d,"type","value"),c):(a.Messaging.logError("Blotter.UniformUtils","extractValidUniforms","uniform value for "+e+" is incorrect for type: "+d.type),c)},{})},ensureHasRequiredDefaultUniforms:function(b,c,d){if(!a.UniformUtils.hasRequiredDefaultUniforms(b))return void this.logError(c,d,"uniforms object is missing required default uniforms defined in Blotter.UniformUtils.defaultUniforms")},hasRequiredDefaultUniforms:function(c){return!b.difference(b.allKeys(a.UniformUtils.defaultUniforms),b.allKeys(c)).length}}}(this.Blotter,this._),function(a,b,c,d){a.Text=function(b,c){this.id=a.Math.generateUUID(),this.value=b,this.properties=c},a.Text.prototype={constructor:a.Text,get needsUpdate(){},set needsUpdate(a){!0===a&&this.trigger("update")},get properties(){return this._properties},set properties(b){this._properties=a.TextUtils.ensurePropertyValues(b)}},a._extendWithGettersSetters(a.Text.prototype,d.prototype)}(this.Blotter,this._,this.THREE,this.EventEmitter),function(a,b){a.Assets.Shaders.Blending=["//","// Author : Bradley Griffith","// License : Distributed under the MIT License.","//","","// Returns the resulting blend color by blending a top color over a base color","highp vec4 normalBlend(highp vec4 topColor, highp vec4 baseColor) {","  highp vec4 blend = vec4(0.0);","  // HACK","  // Cant divide by 0 (see the 'else' alpha) and after a lot of attempts","  // this simply seems like the only solution Im going to be able to come up with to get alpha back.","  if (baseColor.a == 1.0) {","    baseColor.a = 0.9999999;","  };","  if (topColor.a >= 1.0) {","    blend.a = topColor.a;","    blend.r = topColor.r;","    blend.g = topColor.g;","    blend.b = topColor.b;","  } else if (topColor.a == 0.0) {","    blend.a = baseColor.a;","    blend.r = baseColor.r;","    blend.g = baseColor.g;","    blend.b = baseColor.b;","  } else {","    blend.a = 1.0 - (1.0 - topColor.a) * (1.0 - baseColor.a); // alpha","    blend.r = (topColor.r * topColor.a / blend.a) + (baseColor.r * baseColor.a * (1.0 - topColor.a) / blend.a);","    blend.g = (topColor.g * topColor.a / blend.a) + (baseColor.g * baseColor.a * (1.0 - topColor.a) / blend.a);","    blend.b = (topColor.b * topColor.a / blend.a) + (baseColor.b * baseColor.a * (1.0 - topColor.a) / blend.a);","  }","  return blend;","}","// Returns a vec4 representing the original top color that would have been needed to blend","//  against a passed in base color in order to result in the passed in blend color.","highp vec4 normalUnblend(highp vec4 blendColor, highp vec4 baseColor) {","  highp vec4 unblend = vec4(0.0);","  // HACKY","  // Cant divide by 0 (see alpha) and after a lot of attempts","  // this simply seems like the only solution Im going to be able to come up with to get alpha back.","  if (baseColor.a == 1.0) {","    baseColor.a = 0.9999999;","  }","  unblend.a = 1.0 - ((1.0 - blendColor.a) / (1.0 - baseColor.a));","  // Round to two decimal places","  unblend.a = (sign(100.0 * unblend.a) * floor(abs(100.0 * unblend.a) + 0.5)) / 100.0;","  if (unblend.a >= 1.0) {","    unblend.r = blendColor.r;","    unblend.g = blendColor.g;","    unblend.b = blendColor.b;","  } else if (unblend.a == 0.0) {","    unblend.r = baseColor.r;","    unblend.g = baseColor.g;","    unblend.b = baseColor.b;","  } else {","    unblend.r = (blendColor.r - (baseColor.r * baseColor.a * (1.0 - unblend.a) / blendColor.a)) / (unblend.a / blendColor.a);","    unblend.g = (blendColor.g - (baseColor.g * baseColor.a * (1.0 - unblend.a) / blendColor.a)) / (unblend.a / blendColor.a);","    unblend.b = (blendColor.b - (baseColor.b * baseColor.a * (1.0 - unblend.a) / blendColor.a)) / (unblend.a / blendColor.a);","  }","  return unblend;","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Inf=["//","// Author : Bradley Griffith","// License : Distributed under the MIT License.","//","bool isinf(float val) {","    return (val != 0.0 && val * 2.0 == val) ? true : false;","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.LineMath=[a.Assets.Shaders.Inf,"","//","// Author : Bradley Griffith","// License : Distributed under the MIT License.","//","","// Returns the slope of a line given the degrees of the angle on which that line is rotated;","float slopeForDegrees(float deg) {","    // Ensure degrees stay withing 0.0 - 360.0","    deg = mod(deg, 360.0);","    float radians = deg * (PI / 180.0);","    return tan(radians);","}","// Given x, a slope, and another point, find y for x.","float yForXOnSlope(float x, float slope, vec2 p2) {","    return -1.0 * ((slope * (p2.x - x)) - p2.y);","}","// Given y, a slope, and another point, find x for y.","float xForYOnSlope(float y, float slope, vec2 p2) {","    return ((y - p2.y) + (slope * p2.x)) / slope;","}","// Returns slope adjusted for screen ratio.","float normalizedSlope(float slope, vec2 resolution) {","    vec2 p = vec2(1.0) / resolution;","    return ((slope * 100.0) / p.x) / (100.0 / p.x);","}","// Returns offsets (+/-) for any coordinate at distance given slope.","//   Note: This function does not normalize distance.","//   Note: This function does not adjust slope for screen ratio.","vec2 offsetsForCoordAtDistanceOnSlope(float d, float slope) {","    return vec2(","        (d * cos(atan(slope))),","        (d * sin(atan(slope)))","    );","}","// Returns a boolean designating whether or not an infinite line intersects with an infinite line, and sets an `out` variable for the intersection point if it is found.","//   Note: This function does not adjust slope for screen ratio.","bool lineLineIntersection (out vec2 intersect, in vec2 p1, in float m1, in vec2 p2, in float m2) {","    // See: http://gamedev.stackexchange.com/questions/44720/line-intersection-from-parametric-equation","    //      http://stackoverflow.com/questions/41687083/formula-to-determine-if-an-infinite-line-and-a-line-segment-intersect/41687904#41687904","    bool isIntersecting = false;","    float dx = 1.0;","    float dy = m1;","    float dxx = 1.0;","    float dyy = m2;","    float denominator = ((dxx * dy) - (dyy * dx));","    if (denominator == 0.0) {","        // Lines are parallel","        return isIntersecting;","    }","    if (isinf(dy)) {","        float y = yForXOnSlope(p1.x, m2, p2);","        isIntersecting = true;","        intersect = vec2(p1.x, y);","        return isIntersecting;","    }","    if (isinf(dyy)) {","        float y = yForXOnSlope(p2.x, m1, p1);","        isIntersecting = true;","        intersect = vec2(p2.x, y);","        return isIntersecting;","    }","    float u = ((dx * (p2.y - p1.y)) + (dy * (p1.x - p2.x))) / denominator;","    isIntersecting = true;","    intersect = p2 + (u * vec2(dxx, dyy));","    return isIntersecting;","}","// Returns a boolean designating whether or not an infinite line intersects with a line segment, and sets an `out` variable for the intersection point if it is found.","//   Note: This function does not adjust slope for screen ratio.","bool lineLineSegmentIntersection (out vec2 intersect, in vec2 point, in float m, in vec2 pA, in vec2 pB) {","    // See: http://gamedev.stackexchange.com/questions/44720/line-intersection-from-parametric-equation","    //      http://stackoverflow.com/questions/41687083/formula-to-determine-if-an-infinite-line-and-a-line-segment-intersect/41687904#41687904","    bool isIntersecting = false;","    float dx = 1.0;","    float dy = m;","    float dxx = pB.x - pA.x;","    float dyy = pB.y - pA.y;","    float denominator = ((dxx * dy) - (dyy * dx));","    if (denominator == 0.0 || (isinf(dyy / dxx) && isinf(dy))) {","        // Lines are parallel","        return isIntersecting;","    }","    if (isinf(dy)) {","        float m2 = dyy / dxx;","        float y = yForXOnSlope(point.x, m2, pB);","        isIntersecting = true;","        intersect = vec2(point.x, y);","        return isIntersecting;","    }","    float u = ((dx * (pA.y - point.y)) + (dy * (point.x - pA.x))) / denominator;","    if (u >= 0.0 && u <= 1.0) {","        // Intersection occured on line segment","        isIntersecting = true;","        intersect = pA + (u * vec2(dxx, dyy));","    }","    return isIntersecting;","}","// Dev Note: Terrible code. Needs refactor. Just trying to find ","//   which two edges of the rect the intersections occur at.","void intersectsOnRectForLine(out vec2 iA, out vec2 iB, in vec2 rMinXY, in vec2 rMaxXY, in vec2 point, in float slope) {","    bool firstIntersectFound = false;","    vec2 intersectLeft = vec2(0.0);","    vec2 intersectTop = vec2(0.0);","    vec2 intersectRight = vec2(0.0);","    vec2 intersectBottom = vec2(0.0);","    bool intersectsLeft = lineLineSegmentIntersection(intersectLeft, point, slope, rMinXY, vec2(rMinXY.x, rMaxXY.y));","    bool intersectsTop = lineLineSegmentIntersection(intersectTop, point, slope, vec2(rMinXY.x, rMaxXY.y), rMaxXY);","    bool intersectsRight = lineLineSegmentIntersection(intersectRight, point, slope, rMaxXY, vec2(rMaxXY.x, rMinXY.y));","    bool intersectsBottom = lineLineSegmentIntersection(intersectBottom, point, slope, rMinXY, vec2(rMaxXY.x, rMinXY.y));","    if (intersectsLeft) {","        if (firstIntersectFound) {","            iB = intersectLeft;","        }","        else {","            iA = intersectLeft;","            firstIntersectFound = true;","        }","    }","    if (intersectsTop) {","        if (firstIntersectFound) {","            iB = intersectTop;","        }","        else {","            iA = intersectTop;","            firstIntersectFound = true;","        }","    }","    if (intersectsRight) {","        if (firstIntersectFound) {","            iB = intersectRight;","        }","        else {","            iA = intersectRight;","            firstIntersectFound = true;","        }","    }","    if (intersectsBottom) {","        if (firstIntersectFound) {","            iB = intersectBottom;","        }","        else {","            iA = intersectBottom;","        }","    }","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.BlinnPhongSpecular=["//","// Author : Reza Ali","// License : Distributed under the MIT License.","//","","float blinnPhongSpecular( vec3 lightDirection, vec3 viewDirection, vec3 surfaceNormal, float shininess ) {","","  //Calculate Blinn-Phong power","  vec3 H = normalize(viewDirection + lightDirection);","  return pow(max(0.0, dot(surfaceNormal, H)), shininess);","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Easing=["//","// Author : Reza Ali","// License : Distributed under the MIT License.","//","","float linear( float t, float b, float c, float d )","{","    return t * ( c / d ) + b;","}","","float linear( float t )","{","    return t;","}","","float inQuad( float t, float b, float c, float d )","{","    return c * ( t /= d ) * t + b;","}","","float inQuad( float t )","{","    return t * t;","}","","float outQuad( float t, float b, float c, float d )","{","    return -c * ( t /= d ) * ( t - 2.0 ) + b;","}","","float outQuad( float t )","{","    return - ( t -= 1.0 ) * t + 1.0;","}","","float inOutQuad( float t, float b, float c, float d )","{","    if( ( t /= d / 2.0 ) < 1.0 ) {","      return c / 2.0 * t * t + b;","    }","    return - c / 2.0 * ( ( --t ) * ( t - 2.0 ) - 1.0 ) + b;","}","","float inOutQuad( float t )","{","    if( ( t /= 0.5 ) < 1.0 ) return 0.5 * t * t;","    return -0.5 * ( ( --t ) * ( t-2 ) - 1 );","}","","float inCubic( float t, float b, float c, float d )","{","    return c * ( t /= d ) * t * t + b;","}","","float inCubic( float t )","{","    return t * t * t;","}","","float outCubic( float t, float b, float c, float d )","{","    return c * ( ( t = t/d - 1.0 ) * t * t + 1.0 ) + b;","}","","float outCubic( float t )","{","    return ( ( --t ) * t * t + 1.0 );","}","","float inOutCubic( float t, float b, float c, float d )","{","    if( ( t /= d / 2.0 ) < 1.0 ) return  c / 2.0 * t * t * t + b;","    return c / 2.0 * ( ( t -= 2.0 ) * t * t + 2.0 ) + b;","}","","float inOutCubic( float t )","{","    if( ( t /= 0.5 ) < 1.0 ) return 0.5 * t * t * t;","    return 0.5 * ( ( t -= 2.0 ) * t * t + 2.0 );","}","","float inQuart( float t, float b, float c, float d )","{","    return c * ( t /= d ) * t * t * t + b;","}","","float inQuart( float t )","{","    return t * t * t * t;","}","","float outQuart( float t, float b, float c, float d )","{","    return -c * ( ( t = t/d - 1.0 ) * t * t * t - 1.0 ) + b;","}","","float outQuart( float t )","{","    return - ( ( --t ) * t * t * t - 1.0 );","}","","float inOutQuart( float t, float b, float c, float d )","{","    if ( ( t /= d / 2.0 ) < 1.0 ) return c / 2.0 * t * t * t * t + b;","    return -c / 2.0 * ( ( t -= 2.0 ) * t * t * t - 2.0 ) + b;","}","","float inOutQuart( float t )","{","    if ( (t /= 0.5 ) < 1.0 ) return 0.5 * t * t * t * t;","    return -0.5 * ( ( t -= 2.0 ) * t * t * t - 2.0 );","}","","float inQuint( float t, float b, float c, float d )","{","    return c * ( t /= d ) * t * t * t * t + b;","}","","float inQuint( float t )","{","    return t * t * t * t * t;","}","","float outQuint( float t, float b, float c, float d )","{","    return c * ( ( t = t/d - 1.0) * t * t * t * t + 1.0 ) + b;","}","","float outQuint( float t )","{","    return ( ( --t ) * t * t * t * t + 1.0 );","}","","float inOutQuint( float t, float b, float c, float d )","{","    if( ( t /= d /2.0 ) < 1.0 ) return  c / 2.0 * t * t * t * t * t + b;","    return c / 2.0 * ( ( t -= 2.0 ) * t * t * t * t + 2.0) + b;","}","","float inOutQuint( float t )","{","    if ( ( t /= 0.5 ) < 1.0 ) return 0.5 * t * t * t * t * t;","    return 0.5 * ( ( t -= 2 ) * t * t * t * t + 2.0 );","}","","float inSine( float t, float b, float c, float d )","{","    return -c * cos( t / d * ( 1.5707963268 ) ) + c + b;","}","","float inSine( float t )","{","    return -1.0 * cos( t * ( 1.5707963268 ) ) + 1.0;","}","","float outSine( float t, float b, float c, float d )","{","    return c * sin( t / d * ( 1.5707963268 ) ) + b;","}","","float outSine( float t )","{","    return sin( t * ( 1.5707963268 ) );","}","","float inOutSine( float t, float b, float c, float d )","{","    return - c / 2.0 * ( cos( 3.1415926536 * t / d ) - 1.0 ) + b;","}","","float inOutSine( float t )","{","    return -0.5 * ( cos( 3.1415926536 * t ) - 1.0 );","}","","float inExpo( float t, float b, float c, float d )","{","    return ( t == 0.0 ) ? b : c * pow( 2.0, 10.0 * ( t / d - 1.0 ) ) + b;","}","","float inExpo( float t )","{","    return ( t == 0 ) ? 0.0 : pow( 2.0, 10.0 * ( t - 1.0 ) );","}","","float outExpo( float t, float b, float c, float d )","{","    return ( t == d ) ? b + c : c * ( - pow( 2.0, -10.0 * t / d ) + 1.0 ) + b;","}","","float outExpo( float t )","{","    return ( t == 1.0 ) ? 1.0 : ( - pow( 2.0, -10.0 * t ) + 1.0 );","}","","float inOutExpo( float t, float b, float c, float d )","{","    if( t == 0 ) return b;","    if( t == d ) return b + c;","    if(( t /= d / 2.0 ) < 1.0 ) return c / 2.0 * pow( 2.0, 10.0 * ( t - 1.0 ) ) + b;","    return c / 2.0 * ( - pow( 2.0, -10.0 * --t ) + 2.0 ) + b;","}","","float inOutExpo( float t )","{","    if( t == 0.0 ) return 0.0;","    if( t == 1.0 ) return 1.0;","    if( ( t /= 0.5 ) < 1.0 ) return 0.5 * pow( 2.0, 10.0 * ( t - 1.0 ) );","    return 0.5 * ( - pow( 2.0, -10.0 * --t ) + 2.0 );","}","","float inCirc( float t, float b, float c, float d )","{","    return -c * ( sqrt( 1.0 - (t/=d)*t) - 1) + b;","}","","float inCirc( float t )","{","    return - ( sqrt( 1.0 - t*t) - 1);","}","","float outCirc( float t, float b, float c, float d )","{","    return c * sqrt( 1.0 - (t=t/d-1)*t) + b;","}","","float outCirc( float t )","{","    return sqrt( 1.0 - (--t)*t);","}","","float inOutCirc( float t, float b, float c, float d )","{","    if ( ( t /= d / 2.0 ) < 1 ) return - c / 2.0 * ( sqrt( 1.0 - t * t ) - 1.0 ) + b;","    return c / 2.0 * ( sqrt( 1.0 - ( t -= 2.0 ) * t ) + 1.0 ) + b;","}","","float inOutCirc( float t )","{","    if( ( t /= 0.5 ) < 1.0 ) return -0.5 * ( sqrt( 1.0 - t * t ) - 1.0 );","    return 0.5 * ( sqrt( 1.0 - ( t -= 2.0 ) * t ) + 1.0 );","}","","float inElastic( float t, float b, float c, float d )","{","    float s = 1.70158; float p = 0.0; float a = c;","    if( t == 0 ) return b;  if( ( t /= d ) == 1 ) return b + c;","    p = d * 0.3;","    if( a < abs( c ) ) { a = c; float s = p / 4.0; }","    else s = 0.1591549431 * p / ( 6.2831853072 ) * asin( c / a );","    return -( a * pow( 2.0, 10.0 * ( t -= 1.0 ) ) * sin( ( t * d - s ) * ( 6.2831853072 ) / p ) )  + b;","}","","float inElastic( float t )","{","    float s = 1.70158; float p = 0.0; float a = 1.0;","    if( t == 0.0 ) return 0.0;","    if( t == 1.0 ) return 1.0;","    p = 0.3;","    s = p / ( 6.2831853072 ) * asin( 1.0 / a );","    return -( a * pow( 2.0, 10.0 * ( t -= 1.0 ) ) * sin( ( t - s ) * ( 6.2831853072 ) / p ) );","}","","float outElastic( float t, float b, float c, float d )","{","    float s = 1.70158; float p = 0.0; float a = c;","    if( t == 0.0 ) return b;","    if( (t /= d ) == 1.0 ) return b + c;","    p = d * 0.3;","    if( a < abs( c ) ) { a = c; s = p / 4.0; }","    else { s = p / ( 6.2831853072 ) * asin( c / a ); }","    return a * pow( 2.0, -10.0 * t ) * sin( ( t * d - s ) * ( 6.2831853072 ) / p ) + c + b;","}","","float outElastic( float t )","{","    float s = 1.70158; float p = 0.0 ; float a = 1.0;","    if( t == 0.0 ) return 0.0;  if( t == 1.0 ) return 1.0;","    p = 0.3;","    s = p / ( 6.2831853072 ) * asin( 1.0 / a );","    return a * pow( 2.0, -10.0 * t ) * sin( ( t - s ) * ( 6.2831853072 ) / p ) + 1.0;","}","","float inOutElastic( float t, float b, float c, float d )","{","    float s = 1.70158; float p = 0.0; float a = c;","    if( t == 0.0 ) return b;","    if( ( t /= d / 2.0 ) == 2.0 ) return b + c;","    p = d * ( 0.3 * 1.5 );","    if( a < abs( c ) ) { a = c; s = p / 4.0; }","    else { s = p / ( 6.2831853072 ) * asin( c / a ); }","    if( t < 1.0 ) return -0.5 * ( a * pow( 2.0, 10.0 * ( t -= 1.0 ) ) * sin( ( t * d - s ) * ( 6.2831853072 ) / p ) ) + b;","    return a * pow( 2.0, -10.0 * ( t -= 1.0 ) ) * sin( ( t * d - s ) * ( 6.2831853072 ) / p ) * 0.5 + c + b;","}","","float inOutElastic( float t )","{","    float s = 1.70158; float p = 0; float a = 1.0;","    if( t == 0 ) return 0.0;","    if( ( t /= 0.5 ) == 2.0 ) return 1.0;","    p = ( 0.3 * 1.5 );","    s = p / ( 6.2831853072 ) * asin( 1.0 / a );","    if( t < 1.0 ) return -0.5 * ( a * pow( 2.0, 10.0 * ( t -= 1.0 ) ) * sin( ( t - s ) * ( 6.2831853072 ) / p ) );","    return a * pow( 2.0, -10.0 * ( t -= 1.0 ) ) * sin( ( t - s ) * ( 6.2831853072 ) / p ) * 0.5 + 1.0;","}","","float inBack( float t, float b, float c, float d )","{","    float s = 1.70158;","    return c * ( t /= d ) * t * ( ( s + 1.0 ) * t - s ) + b;","}","","float inBack( float t )","{","    float s = 1.70158;","    return t * t * ( ( s + 1.0 ) * t - s);","}","","float outBack( float t,  float b,  float c,  float d )","{","    float s = 1.70158;","    return c * ( ( t = t / d - 1.0 ) * t * ( ( s + 1.0 ) * t + s ) + 1.0 ) + b;","}","","float outBack( float t )","{","    float s = 1.70158;","    return ( ( --t ) * t * ( ( s + 1.0 ) * t + s ) + 1.0);","}","","float inOutBack( float t, float b, float c, float d )","{","    float s = 1.70158;","    if( ( t /= d / 2.0 ) < 1.0 ) return c / 2.0 * ( t * t * ( ( ( s *= 1.525 ) + 1.0 ) * t - s ) ) + b;","    return c / 2.0 * ( ( t -= 2.0 ) * t * ( ( ( s *= ( 1.525 ) ) + 1.0 ) * t + s ) + 2.0 ) + b;","}","","float inOutBack( float t )","{","    float s = 1.70158;","    if( ( t /= 0.5 ) < 1.0 ) return 0.5 * ( t * t * ( ( ( s *= 1.525 ) + 1.0 ) * t - s ) );","    return 0.5 * ( ( t -= 2 ) * t * ( ( ( s *= ( 1.525 ) ) + 1.0 ) * t + s ) + 2.0 );","}","","float outBounce( float t, float b, float c, float d )","{","    if( ( t /= d ) < ( 1.0 / 2.75 ) ) {","        return c * ( 7.5625 * t * t ) + b;","    } else if ( t < ( 2.0 / 2.75 ) ) {","        return c * ( 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + 0.75 ) + b;","    } else if ( t < ( 2.5 / 2.75 ) ) {","        return c * ( 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + 0.9375 ) + b;","    } else {","        return c * ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + 0.984375 ) + b;","    }","}","","float outBounce( float t )","{","    if( t < ( 1.0 / 2.75 ) ) {","        return ( 7.5625 * t * t );","    } else if ( t < ( 2.0 / 2.75 ) ) {","        return ( 7.5625 * ( t-= ( 1.5 / 2.75 ) ) * t + .75 );","    } else if ( t < ( 2.5 / 2.75 ) ) {","        return ( 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + 0.9375 );","    } else {","        return ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + 0.984375 );","    }","}","","float inBounce( float t, float b, float c, float d )","{","    return c - outBounce( d - t, 0.0, c, d ) + b;","}","","float inBounce( float t )","{","    return 1.0 - outBounce( 1.0 - t);","}","","float inOutBounce( float t, float b, float c, float d )","{","    if ( t < d /2.0 ) return inBounce ( t * 2.0, 0.0, c, d ) * 0.5 + b;","    return outBounce ( t * 2.0 - d, 0, c, d ) * 0.5 + c * 0.5 + b;","}","","float inOutBounce( float t )","{","    if ( t < 0.5 ) return inBounce( t * 2.0 ) * 0.5;","    return outBounce( t * 2.0 - 1.0 ) * 0.5 + 0.5;","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Gamma=["//","// Author : Reza Ali","// License : Distributed under the MIT License.","//","","const vec3 cGammaCorrection = vec3( 0.4545454545 );","","vec3 gamma( in vec3 color )","{","  return pow( color, cGammaCorrection );","}","","vec4 gamma( in vec4 color )","{","  return vec4( gamma( color.rgb ), color.a );","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Map=["//","// Author : Reza Ali","// License : Distributed under the MIT License.","//","","float map( float value, float inMin, float inMax, float outMin, float outMax )","{","    return ( (value - inMin) / ( inMax - inMin ) * ( outMax - outMin ) ) + outMin;","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Noise=["//","// Author : Patricio Gonzalez Vivo and Jen Lowe","// License : Distributed under the MIT License.","// Source : https://github.com/patriciogonzalezvivo/thebookofshaders","//","float random (in float _x) {","    return fract(sin(_x)*1e4);","}","","float random (in vec2 co) {","    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);","}","","float noise (in float _x) {","    float i = floor(_x);","    float f = fract(_x);","    float u = f * f * (3.0 - 2.0 * f);","    return mix(random(i), random(i + 1.0), u);","}","","float noise (in vec2 _st) {","    vec2 i = floor(_st);","    vec2 f = fract(_st);","    // Four corners in 2D of a tile","    float a = random(i);","    float b = random(i + vec2(1.0, 0.0));","    float c = random(i + vec2(0.0, 1.0));","    float d = random(i + vec2(1.0, 1.0));","    vec2 u = f * f * (3.0 - 2.0 * f);","    return mix(a, b, u.x) + ","            (c - a)* u.y * (1.0 - u.x) + ","            (d - b) * u.x * u.y;","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Noise2D=["//","// Description : Array and textureless GLSL 2D simplex noise function.","//      Author : Ian McEwan, Ashima Arts.","//  Maintainer : ijm","//     Lastmod : 20110822 (ijm)","//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.","//               Distributed under the MIT License. See LICENSE file.","//               https://github.com/ashima/webgl-noise","//","","vec2 n2mod289(vec2 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0;","}","","vec3 n2mod289(vec3 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0;","}","","vec4 n2mod289(vec4 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0;","}","","vec3 permute(vec3 x) {","  return n2mod289(((x*34.0)+1.0)*x);","}","","float snoise(vec2 v)","  {","  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0","                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)","                     -0.577350269189626,  // -1.0 + 2.0 * C.x","                      0.024390243902439); // 1.0 / 41.0","// First corner","  vec2 i  = floor(v + dot(v, C.yy) );","  vec2 x0 = v -   i + dot(i, C.xx);","","// Other corners","  vec2 i1;","  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0","  //i1.y = 1.0 - i1.x;","  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);","  // x0 = x0 - 0.0 + 0.0 * C.xx ;","  // x1 = x0 - i1 + 1.0 * C.xx ;","  // x2 = x0 - 1.0 + 2.0 * C.xx ;","  vec4 x12 = x0.xyxy + C.xxzz;","  x12.xy -= i1;","","// Permutations","  i = n2mod289(i); // Avoid truncation effects in permutation","  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))","   + i.x + vec3(0.0, i1.x, 1.0 ));","","  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);","  m = m*m ;","  m = m*m ;","","// Gradients: 41 points uniformly over a line, mapped onto a diamond.","// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)","","  vec3 x = 2.0 * fract(p * C.www) - 1.0;","  vec3 h = abs(x) - 0.5;","  vec3 ox = floor(x + 0.5);","  vec3 a0 = x - ox;","","// Normalise gradients implicitly by scaling m","// Approximation of: m *= inversesqrt( a0*a0 + h*h );","  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );","","// Compute final noise value at P","  vec3 g;","  g.x  = a0.x  * x0.x  + h.x  * x0.y;","  g.yz = a0.yz * x12.xz + h.yz * x12.yw;","  return 130.0 * dot(m, g);","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Noise3D=["//","// Description : Array and textureless GLSL 2D/3D/4D simplex","//               noise functions.","//      Author : Ian McEwan, Ashima Arts.","//  Maintainer : ijm","//     Lastmod : 20110822 (ijm)","//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.","//               Distributed under the MIT License. See LICENSE file.","//               https://github.com/ashima/webgl-noise","//","","vec2 n3mod289(vec2 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0;","}","","vec3 n3mod289(vec3 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0;","}","","vec4 n3mod289(vec4 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0;","}","","vec4 permute(vec4 x) {","     return n3mod289(((x*34.0)+1.0)*x);","}","","vec4 taylorInvSqrt(vec4 r)","{","  return 1.79284291400159 - 0.85373472095314 * r;","}","","float snoise(vec3 v)","  {","  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;","  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);","","// First corner","  vec3 i  = floor(v + dot(v, C.yyy) );","  vec3 x0 =   v - i + dot(i, C.xxx) ;","","// Other corners","  vec3 g = step(x0.yzx, x0.xyz);","  vec3 l = 1.0 - g;","  vec3 i1 = min( g.xyz, l.zxy );","  vec3 i2 = max( g.xyz, l.zxy );","","  //   x0 = x0 - 0.0 + 0.0 * C.xxx;","  //   x1 = x0 - i1  + 1.0 * C.xxx;","  //   x2 = x0 - i2  + 2.0 * C.xxx;","  //   x3 = x0 - 1.0 + 3.0 * C.xxx;","  vec3 x1 = x0 - i1 + C.xxx;","  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y","  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y","","// Permutations","  i = n3mod289(i);","  vec4 p = permute( permute( permute(","             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))","           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))","           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));","","// Gradients: 7x7 points over a square, mapped onto an octahedron.","// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)","  float n_ = 0.142857142857; // 1.0/7.0","  vec3  ns = n_ * D.wyz - D.xzx;","","  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)","","  vec4 x_ = floor(j * ns.z);","  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)","","  vec4 x = x_ *ns.x + ns.yyyy;","  vec4 y = y_ *ns.x + ns.yyyy;","  vec4 h = 1.0 - abs(x) - abs(y);","","  vec4 b0 = vec4( x.xy, y.xy );","  vec4 b1 = vec4( x.zw, y.zw );","","  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;","  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;","  vec4 s0 = floor(b0)*2.0 + 1.0;","  vec4 s1 = floor(b1)*2.0 + 1.0;","  vec4 sh = -step(h, vec4(0.0));","","  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;","  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;","","  vec3 p0 = vec3(a0.xy,h.x);","  vec3 p1 = vec3(a0.zw,h.y);","  vec3 p2 = vec3(a1.xy,h.z);","  vec3 p3 = vec3(a1.zw,h.w);","","//Normalise gradients","  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));","  p0 *= norm.x;","  p1 *= norm.y;","  p2 *= norm.z;","  p3 *= norm.w;","","// Mix final noise value","  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);","  m = m * m;","  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),","                                dot(p2,x2), dot(p3,x3) ) );","  }"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Noise4D=["//","// Description : Array and textureless GLSL 2D/3D/4D simplex","//               noise functions.","//      Author : Ian McEwan, Ashima Arts.","//  Maintainer : ijm","//     Lastmod : 20110822 (ijm)","//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.","//               Distributed under the MIT License. See LICENSE file.","//               https://github.com/ashima/webgl-noise","//","","vec4 mod289(vec4 x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0; }","","float mod289(float x) {","  return x - floor(x * (1.0 / 289.0)) * 289.0; }","","vec4 permute(vec4 x) {","     return mod289(((x*34.0)+1.0)*x);","}","","float permute(float x) {","     return mod289(((x*34.0)+1.0)*x);","}","","vec4 taylorInvSqrt(vec4 r)","{","  return 1.79284291400159 - 0.85373472095314 * r;","}","","float taylorInvSqrt(float r)","{","  return 1.79284291400159 - 0.85373472095314 * r;","}","","vec4 grad4(float j, vec4 ip)","  {","  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);","  vec4 p,s;","","  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;","  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);","  s = vec4(lessThan(p, vec4(0.0)));","  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;","","  return p;","  }","","// (sqrt(5) - 1)/4 = F4, used once below","#define F4 0.309016994374947451","","float snoise(vec4 v)","  {","  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4","                        0.276393202250021,  // 2 * G4","                        0.414589803375032,  // 3 * G4","                       -0.447213595499958); // -1 + 4 * G4","","// First corner","  vec4 i  = floor(v + dot(v, vec4(F4)) );","  vec4 x0 = v -   i + dot(i, C.xxxx);","","// Other corners","","// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)","  vec4 i0;","  vec3 isX = step( x0.yzw, x0.xxx );","  vec3 isYZ = step( x0.zww, x0.yyz );","//  i0.x = dot( isX, vec3( 1.0 ) );","  i0.x = isX.x + isX.y + isX.z;","  i0.yzw = 1.0 - isX;","//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );","  i0.y += isYZ.x + isYZ.y;","  i0.zw += 1.0 - isYZ.xy;","  i0.z += isYZ.z;","  i0.w += 1.0 - isYZ.z;","","  // i0 now contains the unique values 0,1,2,3 in each channel","  vec4 i3 = clamp( i0, 0.0, 1.0 );","  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );","  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );","","  //  x0 = x0 - 0.0 + 0.0 * C.xxxx","  //  x1 = x0 - i1  + 1.0 * C.xxxx","  //  x2 = x0 - i2  + 2.0 * C.xxxx","  //  x3 = x0 - i3  + 3.0 * C.xxxx","  //  x4 = x0 - 1.0 + 4.0 * C.xxxx","  vec4 x1 = x0 - i1 + C.xxxx;","  vec4 x2 = x0 - i2 + C.yyyy;","  vec4 x3 = x0 - i3 + C.zzzz;","  vec4 x4 = x0 + C.wwww;","","// Permutations","  i = mod289(i);","  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);","  vec4 j1 = permute( permute( permute( permute (","             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))","           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))","           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))","           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));","","// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope","// 7*7*6 = 294, which is close to the ring size 17*17 = 289.","  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;","","  vec4 p0 = grad4(j0,   ip);","  vec4 p1 = grad4(j1.x, ip);","  vec4 p2 = grad4(j1.y, ip);","  vec4 p3 = grad4(j1.z, ip);","  vec4 p4 = grad4(j1.w, ip);","","// Normalise gradients","  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));","  p0 *= norm.x;","  p1 *= norm.y;","  p2 *= norm.z;","  p3 *= norm.w;","  p4 *= taylorInvSqrt(dot(p4,p4));","","// Mix contributions from the five corners","  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);","  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);","  m0 = m0 * m0;","  m1 = m1 * m1;","  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))","               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;","","  }"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.PI=["//","// Author : Reza Ali","// License : Distributed under the MIT License.","//","","#define TWO_PI 6.2831853072","#define PI 3.14159265359","#define HALF_PI 1.57079632679"].join("\n")}(this.Blotter,this._),function(a,b){a.Assets.Shaders.Random=["//","// Author : Patricio Gonzalez Vivo and Jen Lowe","// License : Distributed under the MIT License.","// Source : https://github.com/patriciogonzalezvivo/thebookofshaders","//","","float random (in float _x) {","    return fract(sin(_x)*1e4);","}","","float random (in vec2 co) {","    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);","}"].join("\n")}(this.Blotter,this._),function(a,b){a.Mapping=function(a,b,c,d){this.texts=a,this._textBounds=b,this._width=c,this._height=d,this._ratio=1},a.Mapping.prototype=function(){function c(b,c){return c=c||a.TextUtils.ensurePropertyValues().leading,isNaN(c)?-1!==c.toString().indexOf("px")?c=parseInt(c):-1!==c.toString().indexOf("%")&&(c=parseInt(c)/100*b):c*=b,c}return{constructor:a.Mapping,get ratio(){return this._ratio},set ratio(a){this._ratio=a||1},get width(){return this._width*this._ratio},get height(){return this._height*this._ratio},boundsForText:function(b){a.Messaging.ensureInstanceOf(b,a.Text,"Blotter.Text","Blotter.Mapping","boundsForText");var c=this._textBounds[b.id];return c&&(c={w:c.w*this._ratio,h:c.h*this._ratio,x:c.x*this._ratio,y:c.y*this._ratio}),c},toCanvas:function(d){var e=a.CanvasUtils.hiDpiCanvas(this._width,this._height,this._ratio),f=e.getContext("2d",{alpha:!1}),g=new Image;f.textBaseline="middle";for(var h=0;h<this.texts.length;h++){var i=this.texts[h],j=this._textBounds[i.id],k=c.call(this,i.properties.size,i.properties.leading)/2;f.font=i.properties.style+" "+i.properties.weight+" "+i.properties.size+"px "+i.properties.family,f.save(),f.translate(j.x+i.properties.paddingLeft,this._height-(j.y+j.h)+i.properties.paddingTop),f.fillStyle=i.properties.fill,f.fillText(i.value,0,Math.round(k)),f.restore()}g.onload=b.bind(function(){f.save(),f.scale(1,-1),f.clearRect(0,-1*this._height,this._width,this._height),f.drawImage(g,0,-1*this._height,this._width,this._height),f.restore(),d(e)},this),g.src=e.toDataURL("image/png")}}}()}(this.Blotter,this._),function(a,b,c){a.MappingMaterial=function(a,b,c,d){this.mapping=a,this.material=b,this.shaderMaterial=c,this._userUniformDataTextureObjects=d,this.init.apply(this,arguments)},a.MappingMaterial.prototype=function(){function d(a,b,c,d){var e=d.type;"1f"==e?(c[4*b]=a,c[4*b+1]=0,c[4*b+2]=0,c[4*b+3]=0):"2f"==e?(c[4*b]=a[0],c[4*b+1]=a[1],c[4*b+2]=0,c[4*b+3]=0):"3f"==e?(c[4*b]=a[0],c[4*b+1]=a[1],c[4*b+2]=a[2],c[4*b+3]=0):"4f"==e?(c[4*b]=a[0],c[4*b+1]=a[1],c[4*b+2]=a[2],c[4*b+3]=a[3]):(c[4*b]=0,c[4*b+1]=0,c[4*b+2]=0,c[4*b+3]=0)}function e(d){var e={_type:d.userUniform.type,_value:d.userUniform.value,get value(){return this._value},set value(b){if(!a.UniformUtils.validValueForUniformType(this._type,b))return void a.Messaging.logError("Blotter.MappingMaterial",!1,"uniform value not valid for uniform type: "+this._type);this._value=b,this.trigger("update")}};return b.extend(e,c.prototype),e}function f(a,c){return b.reduce(a.texts,function(a,f,g){return a[f.id]=b.reduce(c.userUniforms,function(a,b,f){var h=b.position+g;return a[f]=e(b),a[f].on("update",function(){d(a[f].value,h,c.data,b.userUniform),c.texture.needsUpdate=!0}),a[f].value=b.userUniform.value,a},{}),a},{})}function g(a,c,d){return b.reduce(c.userUniforms,function(f,g,h){return f[h]=e(g),f[h].on("update",function(){b.each(a.texts,function(a){d[a.id][h].value=f[h].value}),c.texture.needsUpdate=!0}),f},{})}return{constructor:a.MappingMaterial,get uniforms(){return this.material.uniforms},get mainImage(){return this.material.mainImage},get width(){return this.mapping.width},get height(){return this.mapping.height},get ratio(){return this.mapping.ratio},init:function(a,b,c,d){this.textUniformInterface=f(this.mapping,this._userUniformDataTextureObjects),this.uniformInterface=g(this.mapping,this._userUniformDataTextureObjects,this.textUniformInterface)},boundsForText:function(b){return a.Messaging.ensureInstanceOf(b,a.Text,"Blotter.Text","Blotter.MappingMaterial","boundsForText"),this.mapping.boundsForText(b)}}}()}(this.Blotter,this._,this.EventEmitter),function(a,b,c){a.Material=function(){this.init.apply(this,arguments)},a.Material.prototype=function(){function d(){return["void mainImage( out vec4 mainImage, in vec2 fragCoord ) {","mainImage = textTexture(fragCoord / uResolution);","}"].join("\n")}function e(d){var e={_type:d.type,_value:d.value,get type(){return this._type},set type(a){this._type=a},get value(){return this._value},set value(b){if(!a.UniformUtils.validValueForUniformType(this._type,b))return void a.Messaging.logError("Blotter.Material",!1,"uniform value not valid for uniform type: "+this._type);this._value=b,this.trigger("update")}};return b.extend(e,c.prototype),e}function f(a){return b.reduce(a,b.bind(function(a,c,d){return a[d]=e(c),a[d].on("update",b.bind(function(){this.trigger("update:uniform",[d])},this)),a},this),{})}return{constructor:a.Material,get needsUpdate(){},set needsUpdate(a){!0===a&&this.trigger("update")},get mainImage(){return this._mainImage},set mainImage(a){this._mainImage=a||d()},get uniforms(){return this._uniforms},set uniforms(c){this._uniforms=f.call(this,a.UniformUtils.extractValidUniforms(b.extend(c,a.UniformUtils.defaultUniforms)))},init:function(){this.mainImage=d(),this.uniforms={}}}}(),a._extendWithGettersSetters(a.Material.prototype,c.prototype)}(this.Blotter,this._,this.EventEmitter),function(a,b){a.ShaderMaterial=function(b,c){a.Material.apply(this,arguments)},a.ShaderMaterial.prototype=Object.create(a.Material.prototype),a._extendWithGettersSetters(a.ShaderMaterial.prototype,function(){return{constructor:a.ShaderMaterial,init:function(a,c){b.defaults(this,c),this.mainImage=a}}}())}(this.Blotter,this._),function(a,b,c){a.RenderScope=function(b,c){this.text=b,this.blotter=c,this.material={mainImage:this.blotter.material.mainImage},this._mappingMaterial=c.mappingMaterial,this.playing=this.blotter.autoplay,this.timeDelta=0,this.lastDrawTime=!1,this.frameCount=0,this.domElement=a.CanvasUtils.hiDpiCanvas(0,0,this.blotter.ratio,{class:"b-canvas",html:b.value}),this.context=this.domElement.getContext("2d")},a.RenderScope.prototype=function(){function d(){function b(b){c.domElement.addEventListener(b,function(d){var e=a.CanvasUtils.normalizedMousePosition(c.domElement,d);c.emit(b,e)},!1)}for(var c=this,d=["mousedown","mouseup","mousemove","mouseenter","mouseleave"],e=0;e<d.length;e++){b(d[e])}}function e(a,b){var c=a.boundsForText(b);if(c)return{w:c.w,h:c.h,x:-1*Math.floor(c.x),y:-1*Math.floor(a.height-(c.y+c.h))}}function f(a,c){b.each(a,function(a,b){var d=c[b];if(d){var e=d.type==a.type,f=d.value==a.value;e&&!f&&(d.value=a.value)}})}function g(d){var e={_type:d.type,_value:d.value,get type(){return this._type},set type(b){a.Messaging.logError("Blotter.RenderScope",!1,"uniform types may not be updated through a text scope")},get value(){return this._value},set value(b){if(!a.UniformUtils.validValueForUniformType(this._type,b))return void a.Messaging.logError("Blotter.RenderScope",!1,"uniform value not valid for uniform type: "+this._type);this._value=b,this.trigger("update")}};return b.extend(e,c.prototype),e}function h(a){return b.reduce(a,b.bind(function(a,c,d){return a[d]=g(c),a[d].on("update",b.bind(function(){this.trigger("update:uniform",[d])},this)),a},this),{})}function i(){var b=this._mappingMaterial,c=b&&e(b,this.text),d=this.material.uniforms;b&&c&&(a.CanvasUtils.updateCanvasSize(this.domElement,c.w/this.blotter.ratio,c.h/this.blotter.ratio,this.blotter.ratio),this.domElement.innerHTML=this.text.value,this.bounds=c,this.material.uniforms=h.call(this,b.uniforms),this.material.mainImage=b.mainImage,d&&f(d,this.material.uniforms),this.trigger(this.lastUpdated?"update":"ready"),this.lastUpdated=Date.now())}return{constructor:a.RenderScope,get needsUpdate(){},set needsUpdate(a){!0===a&&i.call(this)},get mappingMaterial(){},set mappingMaterial(a){this._mappingMaterial=a},play:function(){this.playing=!0},pause:function(){this.playing=!1},render:function(){if(this.bounds){var a=Date.now();this.frameCount+=1,this.timeDelta=(a-(this.lastDrawTime||a))/1e3,this.lastDrawTime=a,this.context.clearRect(0,0,this.domElement.width,this.domElement.height),this.context.putImageData(this.blotter.imageData,this.bounds.x,this.bounds.y),this.trigger("render",[this.frameCount])}},appendTo:function(a){return"function"==typeof a.append?a.append(this.domElement):a.appendChild(this.domElement),d.call(this),this}}}(),a._extendWithGettersSetters(a.RenderScope.prototype,c.prototype)}(this.Blotter,this._,this.EventEmitter),function(a,b,c,d){var e=this;a.Renderer=function(){this._currentAnimationLoop=!1,this._scene=new c.Scene,this._plane=new c.PlaneGeometry(1,1),this._material=new c.MeshBasicMaterial,this._mesh=new c.Mesh(this._plane,this._material),this._scene.add(this._mesh),this._camera=new c.OrthographicCamera(.5,.5,.5,.5,0,100),this.init.apply(this,arguments)},a.Renderer.prototype=function(){function d(a,b){var d=new c.WebGLRenderTarget(a,b,{minFilter:c.LinearFilter,magFilter:c.LinearFilter,format:c.RGBAFormat,type:c.UnsignedByteType});return d.texture.generateMipmaps=!1,d.width=a,d.height=b,d}function f(){a.webglRenderer.render(this._scene,this._camera,this._renderTarget),a.webglRenderer.readRenderTargetPixels(this._renderTarget,0,0,this._renderTarget.width,this._renderTarget.height,this._imageDataArray),this.trigger("render"),this._currentAnimationLoop=e.requestAnimationFrame(b.bind(f,this))}return{constructor:a.Renderer,get material(){},set material(a){a instanceof c.Material&&(this._material=a,this._mesh.material=a)},get width(){return this._width},set width(a){this.setSize(a,this._height)},get height(){return this._height},set height(a){this.setSize(this._width,a)},init:function(){this.setSize(1,1)},start:function(){this._currentAnimationLoop||f.call(this)},stop:function(){this._currentAnimationLoop&&(e.cancelAnimationFrame(this._currentAnimationLoop),this._currentAnimationLoop=void 0)},setSize:function(a,b){this._width=a||1,this._height=b||1,this._mesh.scale.set(this._width,this._height,1),this._camera.left=this._width/-2,this._camera.right=this._width/2,this._camera.top=this._height/2,this._camera.bottom=this._height/-2,this._camera.updateProjectionMatrix(),this._renderTarget=d(this._width,this._height),this._viewBuffer=new ArrayBuffer(Math.trunc(this._width)*Math.trunc(this._height)*4),this._imageDataArray=new Uint8Array(this._viewBuffer),this._clampedImageDataArray=new Uint8ClampedArray(this._viewBuffer),this.imageData=new ImageData(this._clampedImageDataArray,this._width,this._height)},teardown:function(){this.stop()}}}(),a._extendWithGettersSetters(a.Renderer.prototype,d.prototype)}(this.Blotter,this._,this.THREE,this.EventEmitter),function(a,b,c,d){a.BoundsDataTextureBuilder=function(){function a(a){for(var b=a.texts,c=new Float32Array(4*b.length),d=0;d<b.length;d++){var e=b[d],f=a.boundsForText(e);c[4*d]=f.x,c[4*d+1]=a.height-(f.y+f.h),c[4*d+2]=f.w,c[4*d+3]=f.h}return c}return{build:function(b,e){d(function(){var d=a(b),f=new c.DataTexture(d,b.texts.length,1,c.RGBAFormat,c.FloatType);f.needsUpdate=!0,e(f)})}}}()}(this.Blotter,this._,this.THREE,this.setImmediate),function(a,b,c,d){a.IndicesDataTextureBuilder=function(){function a(a,b,c,d){for(var e=a.ratio,f=new Float32Array(c*b*4),g=b%1,h=1/a.texts.length/2,i=1;i<f.length/4;i++){for(var j=Math.ceil(i/(b-g)),k=i-(b-g)*(j-1),l=0,m=0,n=0,o=0;o<a.texts.length;o++){var p=a.texts[o],q=a.boundsForText(p),r=q.w/e*d,s=q.h/e*d,t=q.x/e*d,u=q.y/e*d;if(j>=u&&j<=u+s&&k>=t&&k<=t+r){l=o/a.texts.length+h,n=1;break}}var v=i-1;f[4*v+0]=l,f[4*v+1]=m,f[4*v+2]=m,f[4*v+3]=n}return f}return{build:function(b,e){var f=.5;d(function(){var d=b.width/b.ratio*f,g=b.height/b.ratio*f,h=a(b,d,g,f),i=new c.DataTexture(h,d,g,c.RGBAFormat,c.FloatType);i.flipY=!0,i.needsUpdate=!0,e(i)})}}}()}(this.Blotter,this._,this.THREE,this.setImmediate),function(a,b,c){a.TextTextureBuilder=function(){return{build:function(a,d){var e,f=new c.TextureLoader;a.toCanvas(b.bind(function(a){e=a.toDataURL(),f.load(e,b.bind(function(a){a.minFilter=c.LinearFilter,a.magFilter=c.LinearFilter,a.generateMipmaps=!0,a.needsUpdate=!0,d(a)},this))},this))}}}()}(this.Blotter,this._,this.THREE),function(a,b,c,d,e){a.MappingBuilder=function(){function c(a,b){var c=a.w*a.h;return b.w*b.h-c}function f(c){return b.reduce(c,function(b,c){var d=a.TextUtils.sizeForText(c.value,c.properties);return b[c.id]=d,b},[])}return{build:function(b,g){e(function(){var e=a.TextUtils.filterTexts(b),h=f(e),i=new d,j=[],k={};for(var l in h)if(h.hasOwnProperty(l)){var m=h[l];m.referenceId=l,j.push(m)}i.fit(j.sort(c));for(var n=0;n<j.length;n++){var o=j[n];k[o.referenceId]={w:o.w,h:o.h,x:o.fit.x,y:i.root.h-(o.fit.y+o.h)}}g(new a.Mapping(e,k,i.root.w,i.root.h))})}}}()}(this.Blotter,this._,this.THREE,this.GrowingPacker,this.setImmediate),function(a,b,c){a.MappingMaterialBuilder=function(){function d(){return["varying vec2 _vTexCoord;","void main() {","  _vTexCoord = uv;","  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);","}"].join("\n")}function e(c,d,e){var f,g={publicUniformDeclarations:"",publicUniformDefinitions:""},h=(1/c.data.length/2).toFixed(20),i=c.texture.image.width.toFixed(1);return b.reduce(c.userUniforms,function(b,c,e){var f=a.UniformUtils.fullSwizzleStringForUniformType(c.userUniform.type),g=a.UniformUtils.glslDataTypeForUniformType(c.userUniform.type),j="(("+c.position.toFixed(1)+" + ((textIndex - ((1.0 / "+d.toFixed(1)+") / 2.0)) * "+d.toFixed(1)+")) / "+i+") + "+h;return b.publicUniformDeclarations+=g+" "+e+";\n",b.publicUniformDefinitions+="   "+e+" = texture2D(_userUniformsTexture, vec2("+j+", 0.5))."+f+";\n",b},g),f=[a.Assets.Shaders.Blending,a.Assets.Shaders.TextTexture,"uniform sampler2D _uSampler;","uniform vec2 _uCanvasResolution;","uniform sampler2D _uTextIndicesTexture;","uniform sampler2D _uTextBoundsTexture;","varying vec2 _vTexCoord;","vec4 _textBounds;","uniform sampler2D _userUniformsTexture;",g.publicUniformDeclarations,"// Helper function used by user programs to retrieve texel color information within the bounds of","// any given text. This is to be used instead of `texture2D` in the fragment sources for all Blotter materials.","vec4 textTexture(vec2 coord) {","   vec2 adjustedFragCoord = _textBounds.xy + vec2((_textBounds.z * coord.x), (_textBounds.w * coord.y));","   vec2 uv = adjustedFragCoord.xy / _uCanvasResolution;","   //  If adjustedFragCoord falls outside the bounds of the current texel's text, return `vec4(0.0)`.","   if (adjustedFragCoord.x < _textBounds.x ||","       adjustedFragCoord.x > _textBounds.x + _textBounds.z ||","       adjustedFragCoord.y < _textBounds.y ||","       adjustedFragCoord.y > _textBounds.y + _textBounds.w) {","     return vec4(0.0);","   }","   return texture2D(_uSampler, uv);","}","void mainImage(out vec4 mainImage, in vec2 fragCoord);",e,"void main(void) {","   vec4 textIndexData = texture2D(_uTextIndicesTexture, _vTexCoord);","   float textIndex = textIndexData.r;","   float textAlpha = textIndexData.a;","   _textBounds = texture2D(_uTextBoundsTexture, vec2(textIndex, 0.5));",g.publicUniformDefinitions,"   uResolution = _textBounds.zw;","   vec2 fragCoord = gl_FragCoord.xy - _textBounds.xy;","   vec4 outColor;","   mainImage(outColor, fragCoord);","   outColor.a = outColor.a * textAlpha;","   gl_FragColor = outColor;","}"],f.join("\n")}function f(b,c){a.TextTextureBuilder.build(b,function(a){c(a)})}function g(c,d){var e,f,g,h=[];e=function(){return function(b){a.IndicesDataTextureBuilder.build(c,function(a){h.push({uniformName:"_uTextIndicesTexture",texture:a}),b()})}},f=function(){return function(b){a.BoundsDataTextureBuilder.build(c,function(a){h.push({uniformName:"_uTextBoundsTexture",texture:a}),b()})}},g=[e(),f()],b(g).reduceRight(b.wrap,function(){d(h)})()}function h(d,e,f){a.UniformUtils.ensureHasRequiredDefaultUniforms(d,"Blotter.MappingMaterialBuilder","_buildUserUniformDataTextureObjects"),d=a.UniformUtils.extractValidUniforms(d);var g=Object.keys(d).length*e,h=new Float32Array(4*g),i=new c.DataTexture(h,g,1,c.RGBAFormat,c.FloatType),j={data:h,texture:i,userUniforms:{}};b.reduce(d,function(a,b,c){var f=Object.keys(d).indexOf(c)*e;return a.userUniforms[c]={userUniform:b,position:f},a},j),f(j)}function i(a){return b.reduce(a,function(a,b){return a[b.uniformName]={type:"t",value:b.texture},a},{})}function j(a){return{_userUniformsTexture:{type:"t",value:a.texture}}}function k(a,c,d,e,f){var g={_uSampler:{type:"t",value:d},_uCanvasResolution:{type:"2f",value:[a,c]}};return b.extend(g,i(e)),b.extend(g,j(f)),g}function l(a,b,d){var e=new c.ShaderMaterial({vertexShader:a,fragmentShader:b,uniforms:d});return e.depthTest=!1,e.depthWrite=!1,e.premultipliedAlpha=!1,e}return{build:function(c,i,j){var m,n,o,p,q;m=function(){return function(a){f(c,function(b){o=b,a()})}},n=function(){return function(a){g(c,function(b){p=b,a()})}},buildUserUniformDataTextureObjects=function(){return function(a){h(i.uniforms,c.texts.length,function(b){userUniformDataTextureObjects=b,a()})}},q=[m(),n(),buildUserUniformDataTextureObjects()],b(q).reduceRight(b.wrap,function(){var f=k(c.width,c.height,o,p,userUniformDataTextureObjects),g=(b.omit(f,"_uCanvasResolution","_uSampler","_uTextBoundsTexture","_uTextIndicesTexture"),l(d(),e(userUniformDataTextureObjects,c.texts.length,i.mainImage),f));j(new a.MappingMaterial(c,i,g,userUniformDataTextureObjects))})()}}}()}(this.Blotter,this._,this.THREE);
(function(Blotter) {

  Blotter.ChannelSplitMaterial = function() {
    Blotter.Material.apply(this, arguments);
  };

  Blotter.ChannelSplitMaterial.prototype = Object.create(Blotter.Material.prototype);

  Blotter._extendWithGettersSetters(Blotter.ChannelSplitMaterial.prototype, (function () {

    function _mainImageSrc () {
      var mainImageSrc = [
        Blotter.Assets.Shaders.PI,
        Blotter.Assets.Shaders.LineMath,
        Blotter.Assets.Shaders.Random,


        "const int MAX_STEPS = 200;",


        "// Fix a floating point number to two decimal places",
        "float toFixedTwo(float f) {",
        "    return float(int(f * 100.0)) / 100.0;",
        "}",


        "vec2 motionBlurOffsets(vec2 fragCoord, float deg, float spread) {",

        "    // Setup",
        "    // -------------------------------",

        "    vec2 centerUv = vec2(0.5);",
        "    vec2 centerCoord = uResolution.xy * centerUv;",

        "    deg = toFixedTwo(deg);",
        "    float slope = normalizedSlope(slopeForDegrees(deg), uResolution.xy);",


        "    // Find offsets",
        "    // -------------------------------",

        "    vec2 k = offsetsForCoordAtDistanceOnSlope(spread, slope);",
        "    if (deg <= 90.0 || deg >= 270.0) {",
        "        k *= -1.0;",
        "    }",


        "    return k;",
        "}",


        "float noiseWithWidthAtUv(float width, vec2 uv) {",
        "    float noiseModifier = 1.0;",
        "    if (uAnimateNoise > 0.0) {",
        "        noiseModifier = sin(uGlobalTime);",
        "    }",

        "    vec2 noiseRowCol = floor((uv * uResolution.xy) / width);",
        "    vec2 noiseFragCoord = ((noiseRowCol * width) + (width / 2.0));",
        "    vec2 noiseUv = noiseFragCoord / uResolution.xy;",

        "    return random(noiseUv * noiseModifier) * 0.125;",
        "}",


        "vec4 motionBlur(vec2 uv, vec2 blurOffset, float maxOffset) {",
        "    float noiseWidth = 3.0;",
        "    float randNoise = noiseWithWidthAtUv(noiseWidth, uv);",

        "    vec4 result = textTexture(uv);",

        "    float maxStepsReached = 0.0;",

        "    // Note: Step by 2 to optimize performance. We conceal lossiness here via applied noise.",
        "    //   If you do want maximum fidelity, change `i += 2` to `i += 1` below.",
        "    for (int i = 1; i <= MAX_STEPS; i += 2) {",
        "        if (abs(float(i)) > maxOffset) { break; }",
        "        maxStepsReached += 1.0;",

        "        // Divide blurOffset by 2.0 so that motion blur starts half way behind itself",
        "        //   preventing blur from shoving samples in any direction",
        "        vec2 offset = (blurOffset / 2.0) - (blurOffset * (float(i) / maxOffset));",
        "        vec4 stepSample = textTexture(uv + (offset / uResolution.xy));",,

        "        result += stepSample;",
        "    }",

        "    if (maxOffset >= 1.0) {",
        "        result /= maxStepsReached;",
        "        //result.a = pow(result.a, 2.0); // Apply logarithmic smoothing to alpha",
        "        result.a -= (randNoise * (1.0 - result.a)); // Apply noise to smoothed alpha",
        "    }",


        "    return result;",
        "}",


        "void mainImage( out vec4 mainImage, in vec2 fragCoord ) {",

        "    // Setup",
        "    // -------------------------------",

        "    vec2 uv = fragCoord.xy / uResolution.xy;",

        "    float offset = min(float(MAX_STEPS), uResolution.y * uOffset);",

        "    float slope = normalizedSlope(slopeForDegrees(uRotation), uResolution);",

        "    // We want the blur to be the full offset amount in each direction",
        "    //   and to adjust with our logarithmic adjustment made later, so multiply by 4",
        "    float adjustedOffset = offset;// * 4.0;",

        "    vec2 blurOffset = motionBlurOffsets(fragCoord, uRotation, adjustedOffset);",


        "    // Set Starting Points",
        "    // -------------------------------",

        "    vec2 rUv = uv;",
        "    vec2 gUv = uv;",
        "    vec2 bUv = uv;",

        "    vec2 k = offsetsForCoordAtDistanceOnSlope(offset, slope) / uResolution;",

        "    if (uRotation <= 90.0 || uRotation >= 270.0) {",
        "        rUv += k;",
        "        bUv -= k;",
        "    }",
        "    else {",
        "        rUv -= k;",
        "        bUv += k;",
        "    }",


        "    // Blur and Split Channels",
        "    // -------------------------------",

        "    vec4 resultR = vec4(0.0);",
        "    vec4 resultG = vec4(0.0);",
        "    vec4 resultB = vec4(0.0);",

        "    if (uApplyBlur > 0.0) {",
        "        resultR = motionBlur(rUv, blurOffset, adjustedOffset);",
        "        resultG = motionBlur(gUv, blurOffset, adjustedOffset);",
        "        resultB = motionBlur(bUv, blurOffset, adjustedOffset);",
        "    } else {",
        "        resultR = textTexture(rUv);",
        "        resultG = textTexture(gUv);",
        "        resultB = textTexture(bUv);",
        "    }",

        "    float a = resultR.a + resultG.a + resultB.a;",

        "    resultR = normalBlend(resultR, uBlendColor);",
        "    resultG = normalBlend(resultG, uBlendColor);",
        "    resultB = normalBlend(resultB, uBlendColor);",



        "    mainImage = vec4(resultR.r, resultG.g, resultB.b, a);",
        "}"
      ].join("\n");

      return mainImageSrc;
    }

    return {

      constructor : Blotter.ChannelSplitMaterial,

      init : function () {
        this.mainImage = _mainImageSrc();
        this.uniforms = {
          uOffset : { type : "1f", value : 0.05 },
          uRotation : { type : "1f", value : 45.0 },
          uApplyBlur : { type : "1f", value : 1.0 },
          uAnimateNoise : { type : "1f", value : 1.0 }
        };
      }
    };

  })());

})(
  this.Blotter
);

(function(Blotter) {

  Blotter.SlidingDoorMaterial = function() {
    Blotter.Material.apply(this, arguments);
  };

  Blotter.SlidingDoorMaterial.prototype = Object.create(Blotter.Material.prototype);

  Blotter._extendWithGettersSetters(Blotter.SlidingDoorMaterial.prototype, (function () {

    function _mainImageSrc () {
      var mainImageSrc = [
        Blotter.Assets.Shaders.PI,

        "float easingForPositionWithDeadzoneWidth(float position, float deadzoneWidth) {",
        "    // Offset position buy 0.25 so that sin wave begins on a downslope at 0.0",
        "    position += 0.25;",

        "    // Distance of adjusted position from 0.75, min of 0.0 and max of 0.5",
        "    float firstDist = distance(position, 0.75);",

        "    // Divide deadzoneWidth by two, as we will be working it out in either direction from the center position.",
        "    float halfDeadzoneWidth = deadzoneWidth / 2.0;",

        "    // Clamp distance of position from center (0.75) to something between 0.5 and the halfDeadzoneWidth from center.",
        "    float removedDistance = max(firstDist, halfDeadzoneWidth);",

        "    // Find the percentage of removedDistance within the range of halfDeadzoneWidth..0.5",
        "    float distanceOfRange = (removedDistance - halfDeadzoneWidth) / (0.5 - halfDeadzoneWidth);",

        "    // Convert distanceOfRange to a number between 0.0 and 0.5. This means that for any pixel +/- halfDeadzoneWidth from center, the value will be 0.5.",
        "    float offsetDist = (0.5 * (1.0 - (distanceOfRange)));",

        "    if (position < 0.75) {",
        "        position = 0.25 + offsetDist;",
        "    } else {",
        "        position = 1.25 - offsetDist;",
        "    }",


        "    return sin((position) * PI * 2.0) / 2.0;",
        "}",


        "void mainImage( out vec4 mainImage, in vec2 fragCoord )",
        "{",
        "    // Setup ========================================================================",

        "    vec2 uv = fragCoord.xy / uResolution.xy;",

        "    float time = uGlobalTime * uSpeed;",

        "    float directionalAdjustment = uFlipAnimationDirection > 0.0 ? -1.0 : 1.0;",


        "    if (uSpeed > 0.0) {",

        "       // Define Axis-Based Striping ===================================================",

        "       float divisions = uDivisions;",
        "       float effectPosition = fragCoord.y;",
        "       float effectDimension = uResolution.y;",
        "       if (uAnimateHorizontal > 0.0) {",
        "          effectPosition = fragCoord.x;",
        "          effectDimension = uResolution.x;",
        "          divisions = floor((divisions * (uResolution.x / uResolution.y)) + 0.5);",
        "       }",
        "       float stripe = floor(effectPosition / (effectDimension / divisions));",


        "       // Animate =====================================================================",

        "       float timeAdjustedForStripe = time - ((uDivisionWidth / divisions) * stripe) * directionalAdjustment;",
        "       float offsetAtTime = mod(timeAdjustedForStripe, 1.0);",

        "       // Divide sin output by 2 and add to 0.5 so that sin wave move between 0.0 and 1.0 rather than -1.0 and 1.0.",
        "       float easing = 0.5 + easingForPositionWithDeadzoneWidth(offsetAtTime, uDivisionWidth);",

        "       // Mulptiply offsetAtTime by 2.0 and subtract from 1.0 so that position changes over a range of -1.0 to 1.0 rather than 0.0 to 1.0.",
        "       if (uAnimateHorizontal > 0.0) {",
        "          uv.x -= ((1.0 - (offsetAtTime * 2.0)) * easing) * directionalAdjustment;",
        "       } else {",
        "          uv.y -= ((1.0 - (offsetAtTime * 2.0)) * easing) * directionalAdjustment;",
        "       }",
        "    }",

        "    mainImage = textTexture(uv);",

        "}"
      ].join("\n");

      return mainImageSrc;
    }

    return {

      constructor : Blotter.SlidingDoorMaterial,

      init : function () {
        this.mainImage = _mainImageSrc();
        this.uniforms = {
          uDivisions : { type : "1f", value : 5.0 },
          uDivisionWidth : { type : "1f", value : 0.25 },
          uAnimateHorizontal : { type : "1f", value : 0.0 },
          uFlipAnimationDirection : { type : "1f", value : 0.0 },
          uSpeed : { type : "1f", value : 0.2 }
        };
      }
    };

  })());

})(
  this.Blotter
);
window.addEventListener('load',function(){
    var nodes = document.querySelectorAll('.opening');
    
    for(var i =0; i<nodes.length; i++){
        var words = nodes[i].innerText.split("");
        
        var html = "";

        for(var i2=0; i2<words.length; i2++){
            html += "<span>"+words[i2]+"</span>"
        }
        nodes[i].innerHTML = html;
    }
})