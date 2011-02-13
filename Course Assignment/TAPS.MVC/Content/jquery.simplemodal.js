/*
 * SimpleModal 1.2.2 - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * Copyright (c) 2008 Eric Martin
 * Dual licensed under the MIT and GPL licenses
 * Revision: $Id: jquery.simplemodal.js 181 2008-12-16 16:51:44Z emartin24 $
 */
(function($) 
{
    var ie6 = $.browser.msie && parseInt($.browser.version) == 6 && !window['XMLHttpRequest'], ieQuirks = $.browser.msie && !$.boxModel, w = []; 
    $.modal = function(data, options) 
    {
        return $.modal.impl.init(data, options);
    }; 
    $.modal.close = function() 
    {
        $.modal.impl.close();
    };
    $.fn.modal = function(options) 
    {
        return $.modal.impl.init(this, options);
    };
    $.modal.defaults = 
    {
        opacity: 60, overlayId: 'simplemodal-overlay',
        overlayCss: {}, containerId: 'simplemodal-container',
        containerCss: {}, dataCss: {},
        zIndex: 1000,
        close: true,
        closeHTML: '<a class="modalCloseImg" title="Close"></a>',
        closeClass: 'simplemodal-close',
        position: null, persist: false,
        onOpen: null, onShow: null, onClose: null
    };
    $.modal.impl =
    {
        opts: null, dialog: {}, init:
        function(data, options) 
        {
            if (this.dialog.data) 
            {
                return false;
            }
            this.opts = $.extend({}, $.modal.defaults, options);
            this.zIndex = this.opts.zIndex;
            this.occb = false;
            if (typeof data == 'object') 
            {
                data = data instanceof jQuery ? data : $(data);
                if (data.parent().parent().size() > 0) 
                {
                    this.dialog.parentNode = data.parent();
                    if (!this.opts.persist) 
                    {
                        this.dialog.orig = data.clone(true);
                    }
                }
            }
            else
                if (typeof data == 'string' || typeof data == 'number') 
                {
                    data = $('<div/>').html(data);
                }
                else 
                {
                    alert('SimpleModal Error: Unsupported data type: ' + typeof data);
                    return false;
                }
                this.dialog.data = data.addClass('simplemodal-data').css(this.opts.dataCss); data = null;
                this.create();
                this.open();
                if ($.isFunction(this.opts.onShow)) 
                {
                    this.opts.onShow.apply(this, [this.dialog]);
                }
                return this;
            }, create: function() 
            {
                w = this.getDimensions();
                if (ie6) 
                {
                    this.dialog.iframe = $('<iframe src="javascript:false;"/>').
            css($.extend(this.opts.iframeCss,
            {
                display: 'none', opacity: 0, position: 'fixed',
                height: w[0], width: w[1], zIndex: this.opts.zIndex,
                top: 0, left: 0
            })).appendTo('body');
        }
        this.dialog.overlay = $('<div/>').attr('id', this.opts.overlayId).
            addClass('simplemodal-overlay').
            css($.extend(this.opts.overlayCss,
            {
                display: 'none', opacity: this.opts.opacity / 100,
                height: w[0], width: w[1], position: 'fixed',
                left: 0, top: 0, zIndex: this.opts.zIndex + 1
            })).appendTo('body');
            this.dialog.container = $('<div/>').attr('id', this.opts.containerId).
            addClass('simplemodal-container').css($.extend(this.opts.containerCss,
            {
                display: 'none', position: 'fixed',
                zIndex: this.opts.zIndex + 2
            })).append(this.opts.close ?
            $(this.opts.closeHTML).addClass(this.opts.closeClass) : '').
            appendTo('body'); this.setPosition(); if (ie6 || ieQuirks) {
                this.fixIE(); 
            }
            this.dialog.container.append(this.dialog.data.hide());
        },
        bindEvents: function() {
        var self = this; $('.' + this.opts.closeClass).
        bind('click.simplemodal',
        function(e) 
        {
            e.preventDefault();
            self.close();
        });
        $(window).bind('resize.simplemodal',
        function() 
        {
            w = self.getDimensions();
            self.setPosition();
            if (ie6 || ieQuirks) 
            {
                self.fixIE();
            }
            else 
            {
                self.dialog.iframe && self.dialog.iframe.css(
        {
            height: w[0], width: w[1]
        }); self.dialog.overlay.
        css({ height: w[0],
        width: w[1]
    });
} 
});
},
unbindEvents: function() {
$('.' + this.opts.closeClass).
        unbind('click.simplemodal');
$(window).unbind('resize.simplemodal');
},
fixIE: function() {
var p = this.opts.position;
$.each([this.dialog.iframe || null, this.dialog.overlay, this.dialog.container],
        function(i, el) {
if (el) {
    var bch = 'document.body.clientHeight',
        bcw = 'document.body.clientWidth',
        bsh = 'document.body.scrollHeight',
        bsl = 'document.body.scrollLeft',
        bst = 'document.body.scrollTop',
        bsw = 'document.body.scrollWidth',
        ch = 'document.documentElement.clientHeight',
        cw = 'document.documentElement.clientWidth',
        sl = 'document.documentElement.scrollLeft',
        st = 'document.documentElement.scrollTop',
        s = el[0].style; s.position = 'absolute';
    if (i < 2) {
        s.removeExpression('height');
        s.removeExpression('width');
        s.setExpression('height', '' + bsh + ' > ' + bch + ' ? ' + bsh + ' : ' + bch + ' + "px"');
        s.setExpression('width', '' + bsw + ' > ' + bcw + ' ? ' + bsw + ' : ' + bcw + ' + "px"');
    }
    else {
        var te, le;
        if (p && p.constructor == Array) {
            if (p[0]) {
                var top = typeof p[0] == 'number' ? p[0].toString() : p[0].replace(/px/, '');
                te = top.indexOf('%') == -1 ? top + ' + (t = ' + st + ' ? ' + st + ' : ' + bst + ') + "px"' :
        parseInt(top.replace(/%/,''))+' * (('+ch+' || '+bch+') / 100) + (t = '+st+' ? '+st+' : '+bst+') + "px"';}if(p[1]){var left=typeof p[1]=='number'?p[1].toString():p[1].replace(/px/,'');le=left.indexOf('%')==-1?left+' + (t = '+sl+' ? '+sl+' : '+bsl+') + "px"':parseInt(left.replace(/%/,''))+' * (('+cw+' || '+bcw+') / 100) + (t = '+sl+' ? '+sl+' : '+bsl+') + "px"';}}else{te='('+ch+' || '+bch+') / 2 - (this.offsetHeight / 2) + (t = '+st+' ? '+st+' : '+bst+') + "px"';le='('+cw+' || '+bcw+') / 2 - (this.offsetWidth / 2) + (t = '+sl+' ? '+sl+' : '+bsl+') + "px"';}s.removeExpression('top');s.removeExpression('left');s.setExpression('top',te);s.setExpression('left',le);}}});},getDimensions:function(){var el=$(window);var h=$.browser.opera&&$.browser.version>'9.5'&&$.fn.jquery<='1.2.6'?document.documentElement['clientHeight']:el.height();return[h,el.width()];},setPosition:function(){var top,left,hCenter=(w[0]/2)-((this.dialog.container.height()||this.dialog.data.height())/2),vCenter=(w[1]/2)-((this.dialog.container.width()||this.dialog.data.width())/2);if(this.opts.position&&this.opts.position.constructor==Array){top=this.opts.position[0]||hCenter;left=this.opts.position[1]||vCenter;}else{top=hCenter;left=vCenter;}this.dialog.container.css({left:left,top:top});},open:function(){this.dialog.iframe&&this.dialog.iframe.show();if($.isFunction(this.opts.onOpen)){this.opts.onOpen.apply(this,[this.dialog]);}else{this.dialog.overlay.show();this.dialog.container.show();this.dialog.data.show();}this.bindEvents();},close:function(){if(!this.dialog.data){return false;}if($.isFunction(this.opts.onClose)&&!this.occb){this.occb=true;this.opts.onClose.apply(this,[this.dialog]);}else{if(this.dialog.parentNode){if(this.opts.persist){this.dialog.data.hide().appendTo(this.dialog.parentNode);}else{this.dialog.data.remove();this.dialog.orig.appendTo(this.dialog.parentNode);}}else{this.dialog.data.remove();}this.dialog.container.remove();this.dialog.overlay.remove();this.dialog.iframe&&this.dialog.iframe.remove();this.dialog={};}this.unbindEvents();}};})(jQuery);