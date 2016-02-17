/*global logger*/
/*
    PasswordStrengthIndicator
    ========================

    @file      : PasswordStrengthIndicator.js
    @version   : 1.0.0
    @author    : Dragos Vrabie
    @date      : 2/10/2016
    @copyright : AuraQ LTD
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require({
  packages: [
    {
          name: 'jquery-1.11.2',
          location: '../../widgets/PasswordStrengthIndicator/lib',
          main: 'jquery-1.11.2'
    }, {
           name: 'bootstrap',
           location: '../../widgets/PasswordStrengthIndicator/lib',
           main: 'bootstrap'
      }, {
           name: 'pwstrength-bootstrap-1.2.10',
           location: '../../widgets/PasswordStrengthIndicator/lib',
           main: 'pwstrength-bootstrap-1.2.10'
      }]
  }, [
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "jquery-1.11.2",
    "bootstrap",
    "pwstrength-bootstrap-1.2.10",
    "dojo/text!PasswordStrengthIndicator/widget/template/PasswordStrengthIndicator.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery, _bootstrap, _pwstrength, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("PasswordStrengthIndicator.widget.PasswordStrengthIndicator", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM element
        inputNodes: null,
        infoTextNode: null,
        progressBarTextNode: null,
        passwordInputNode: null,

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        passwordString: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _prevPasswordValue: null,
        options: null,



        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            // Uncomment the following line to enable debug messages
            //logger.level(logger.DEBUG);
            logger.debug(this.id + ".constructor");
            this._handles = [];

            //Specify options for password strength indicators
            this.options = {};

            this.options.ui = {
              container: "#pwd-container",
              showVerdictsInsideProgressBar: true,
              showErrors: true,
              viewports: {
                progress: ".pwstrength_viewport_progress",
                errors: ".pwstrength_viewport_errors"
              }
            };

            this.options.rules = {
                activated: {
                  wordNotEmail: false,
                  wordSimilarToUsername: false,
                },
                extra: {
            //Declare extra rules
                  penaliseNoDigit: null,
                  penaliseNoMixedCase: null,
                  penaliseNoSymbol: null
                }
            };

            this.options.ui.errorMessages = {
            //Declare extra error messages
              penaliseNoDigit: "Your password must contain a digit",
              penaliseNoMixedCase: "Your password must contain both lower and upper case letters",
              penaliseNoSymbol: "Your password must contain a symbol"
            }
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            this.options.common = {
                minChar: this.minLength,
            };

            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();

            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {
          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {
          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function(box) {
          logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function() {
            logger.debug(this.id + "._setupEvents");
            this.connect(this.passwordInputNode, "change", function(e) {
                // Function from mendix object to set an attribute.
                this._contextObj.set(this.passwordString, this.passwordInputNode.value);
            });
            this.connect(this.passwordInputNode, "keyup", function(e) {

              var $el = $(e.target).val();

              var prevLength = 0;
              if(this._prevPasswordValue!=null) prevLength = this._prevPasswordValue.length;

              if( prevLength===0 && $el.length>prevLength ) {
                //construct password strength indicator on entering first character
                  const penScore = -100;
                  $(':password').pwstrength(this.options);
                  //add extra rules
                  $(':password').pwstrength("addRule", "penaliseNoDigit", function(options, word, score) {
                      return !word.match(/\d+/) ? score : 0;
                  }, penScore, this.requiresDigit);
                  $(':password').pwstrength("addRule", "penaliseNoMixedCase", function(options, word, score) {
                      return !word.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) ? score : 0;
                  }, penScore, this.requiresMixedCase);
                  $(':password').pwstrength("addRule", "penaliseNoSymbol", function(options, word, score) {
                     return !word.match(/[!,@,#,$,%,\^,&,*,?,_,~]+/) ? score : 0;
                  }, penScore, this.requiresSymbol);

              } else if ($el.length===0 && $el.length<prevLength) {
                //remove indicator when password field is emptied
                $(':password').pwstrength("destroy");
              } else {
                //update indicator
                $(':password').pwstrength("forceUpdate");
              }

              this._prevPasswordValue = $el;

            });
            this.connect(this.infoTextNode, "click", function(e) {
                // Only on mobile stop event bubbling!
                this._stopBubblingEventOnMobile(e);

                // If a microflow has been set execute the microflow on a click.
                if (this.mfToExecute !== "") {
                    mx.data.action({
                        params: {
                            applyto: "selection",
                            actionname: this.mfToExecute,
                            guids: [ this._contextObj.getGuid() ]
                        },
                        store: {
                            caller: this.mxform
                        },
                        callback: function(obj) {
                            //TODO what to do when all is ok!
                        },
                        error: dojoLang.hitch(this, function(error) {
                            logger.error(this.id + ": An error occurred while executing microflow: " + error.description);
                        })
                    }, this);
                }
            });
        },

        // Rerender the interface.
        _updateRendering: function() {
            logger.debug(this.id + "._updateRendering");

            this._clearValidations();
        },

        // Handle validations.
        _handleValidation: function(validations) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();

        },

        // Clear validations.
        _clearValidations: function() {
            logger.debug(this.id + "._clearValidations");
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function(message) {
            logger.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this.domNode, this._alertDiv);
        },

        // Add a validation.
        _addValidation: function(message) {
            logger.debug(this.id + "._addValidation");
            this._showError(message);
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            if (this._handles) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.passwordString,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                var validationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });

                this._handles = [ objectHandle, attrHandle, validationHandle ];
            }
        },
    });
});

require(["PasswordStrengthIndicator/widget/PasswordStrengthIndicator"], function() {
    "use strict";
});