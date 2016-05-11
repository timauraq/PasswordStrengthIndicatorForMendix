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
    This widget is a wrapper for the "jQuery Password Strength Meter for Twitter Bootstrap" by Alejandro Blanco

    The options are analogous to those in the Mendix security password settings.  Error messages are customisable.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require({
  packages: [
    {
          name: 'jqwrapper',
          location: '../../widgets/PasswordStrengthIndicator/lib',
          main: 'jqwrapper'
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
    "jqwrapper",
    "bootstrap",
    "pwstrength-bootstrap-1.2.10",
    "dojo/text!PasswordStrengthIndicator/widget/template/PasswordStrengthIndicator.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jqwrapper, _bootstrap, _pwstrength, widgetTemplate) {
    "use strict";

    var $ = _jqwrapper;
    $ = _bootstrap.createInstance($);
    $ = _pwstrength.createInstance($);

    // Declare widget's prototype.
    return declare("PasswordStrengthIndicator.widget.PasswordStrengthIndicator", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM element
        //inputNodes: null,
        infoTextNode: null,
        //progressBarTextNode: null,
        //passwordInputNode: null,
        

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        passwordString: "",
        _$inputGroup: null, 
        _$input: null,  
        

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
            console.log(this.id + ".contructor");
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


        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            console.log(this.id + ".postCreate");

            var self = this;
            
             // make sure we only select the control for the current id or we'll overwrite previous instances
            var groupSelector = '#' + this.id + ' .passwordStrength';
            this._$inputGroup = $(groupSelector); 
            
            var inputSelector = '#' + this.id + ' input.mxPasswordStrength';
            this._$input = $(inputSelector);
            
            this.options.common = {
                minChar: this.minLength,
                onLoad: function () {
                    
                }
            };

            this.options.ui.errorMessages = {
            //Declare extra error messages
            wordLength: this.wordLengthMessage,
            wordRepetitions: this.wordRepetitionsMessage,
            wordSequences: this.wordSequencesMessage,
              penaliseNoDigit: this.noDigitMessage,
              penaliseNoMixedCase: this.noMixedCaseMessage,
              penaliseNoSymbol: this.noSymbolMessage
            }
            
            
            // adjust the template based on the display settings.
            if( this.showLabel ) {
                
                    // width needs to be between 1 and 11
                    var comboLabelWidth = this.labelWidth < 1 ? 1 : this.labelWidth;
                    comboLabelWidth = this.labelWidth > 11 ? 11 : this.labelWidth;
                    
                    var comboControlWidth = 12 - comboLabelWidth,                    
                        comboLabelClass = 'col-sm-' + comboLabelWidth,
                        comboControlClass = 'col-sm-' + comboControlWidth;
                    
                    dojoClass.add(this.mxPasswordStrengthLabel, comboLabelClass);
                    dojoClass.add(this.mxPasswordStrengthInputGroupContainer, comboControlClass);

                this.mxPasswordStrengthLabel.innerHTML = this.fieldCaption;
            }
            else {
                dojoClass.remove(this.mxPasswordStrengthMainContainer, "form-group");
                dojoConstruct.destroy(this.mxPasswordStrengthLabel);
            }
            
            /*
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
            */

             
            
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");
            console.log(this.id + ".update");
            
            var self = this;
            
            if (obj === null) {
                if (!dojoClass.contains(this.domNode, 'hidden')) {
                    dojoClass.add(this.domNode, 'hidden');
                }
            } else {
                if (dojoClass.contains(this.domNode, 'hidden')) {
                    dojoClass.remove(this.domNode, 'hidden');
                }
                
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
                
                
                
                this._contextObj = obj;
                this._resetSubscriptions();
                this._updateRendering();
            
                $(':password').pwstrength("forceUpdate");
                
            }

            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {
          logger.debug(this.id + ".enable");
          console.log(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {
          logger.debug(this.id + ".disable");
          console.log(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function(box) {
          logger.debug(this.id + ".resize");
          console.log(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
          logger.debug(this.id + ".uninitialize");
          console.log(this.id + ".uninit");

            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
            $(':password').pwstrength("destroy");
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
            console.log(this.id + ".setupevents");
            this.connect(this.mxPasswordStrength, "keyup", function(e) {
               
                    this._contextObj.set(this.passwordString, this.mxPasswordStrength.value);
                    //$(':password').pwstrength("forceUpdate");
                    //Execute onChange microflow if configured
                    if( this.onChangeMicroflow ) {
                        this._execMf(this._contextObj.getGuid(), this.onChangeMicroflow);
                    }
                
            });
        },

        _execMf: function (guid, mf, cb) {
            if (guid && mf) {
                mx.data.action({
                    params: {
                        applyto: 'selection',
                        actionname: mf,
                        guids: [guid]
                    },
                    callback: function () {
                        if (cb) {
                            cb();
                        }
                    },
                    error: function (e) {
                        console.error('Error running Microflow: ' + e);
                    }
                }, this);
            }

        },


        // Rerender the interface.
        _updateRendering: function() {
            console.log(this.id + "._updateRendering");
            
            this.mxPasswordStrength.disabled = this.readOnly;
            
            if( this._contextObj ){
                var currentString = this._contextObj.get(this.passwordString);               
                this._$input.val(currentString);
            }
            
            this._clearValidations();
        },

        // Handle validations.
        _handleValidation: function(validations) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();
            
            var validation = validations[0],
                message = validation.getReasonByAttribute(this.passwordString);

            if (this.readOnly) {
                validation.removeAttribute(this.passwordString);
            } else if (message) {
                this._addValidation(message);
                validation.removeAttribute(this.passwordString);
            }

        },

        // Clear validations.
        _clearValidations: function() {
            logger.debug(this.id + "._clearValidations");
            if( this._$alertdiv ) {
                this._$inputGroup.parent().removeClass('has-error');
                this._$alertdiv.remove();
            }
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
            this._$alertdiv = $("<div></div>").addClass('alert alert-danger mx-validation-message').html(message);
            this._$inputGroup.parent().addClass('has-error').append( this._$alertdiv ); 
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
              console.log(this.id + ".resetSubs");
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
