(function () {
    
     // Polyfill: Add a getElementsByClassName function IE < 9
    function polyfillGetElementsByClassName() {
        if (!document.getElementsByClassName) {
            document.getElementsByClassName = function(search) {
                var d = document, elements, pattern, i, results = [];
                if (d.querySelectorAll) { // IE8
                    return d.querySelectorAll("." + search);
                }
                if (d.evaluate) { // IE6, IE7
                    pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
                    elements = d.evaluate(pattern, d, null, 0, null);
                    while ((i = elements.iterateNext())) {
                        results.push(i);
                    }
                } else {
                    elements = d.getElementsByTagName("*");
                    pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
                    for (var j = 0, l = elements.length; j < l; j++) {
                        if ( pattern.test(elements[j].className) ) {
                            results.push(elements[j]);
                        }
                    }
                }
                return results;
            };
        }
	}
    
    function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
	}

	function addClass(el, className) {
        if (el.classList) el.classList.add(className);
        else if (!hasClass(el, className)) el.className += ' ' + className;
	}

	function removeClass(el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
	}
    
    function tbBorder(el) {
		var margin = el.offsetHeight - el.clientHeight;
		return margin;
	}
		
	function lrBorder(el) {
		var margin = el.offsetWidth - el.clientWidth;
		return margin;
	}
		
	function outerHeight(el) {
		var height = el.offsetHeight;
		var style = el.currentStyle || getComputedStyle(el);

		height += parseInt(style.marginTop) + parseInt(style.marginBottom);
		return height;
	}
		
	function outerWidth(el) {
		var width = el.offsetWidth;
		var style = el.currentStyle || getComputedStyle(el);

        width += parseInt(style.marginLeft) + parseInt(style.marginRight);
		return width;
	}
    
    function addEvent(el, type, handler) {
		if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
    }
    
    function removeEvent(el, type, handler) {
		if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
    }
    
    // IE8 and below fix
    if (!Array.prototype.indexOf) {
			
    	Array.prototype.indexOf = function(elt /*, from*/) {
    		var len = this.length >>> 0;
		
			var from = Number(arguments[1]) || 0;
			from = (from < 0)
				 ? Math.ceil(from)
				 : Math.floor(from);
			if (from < 0)
			  from += len;
		
			for (; from < len; from++) {
			  if (from in this && this[from] === elt)
				return from;
			}
			return -1;
    	};
    }
	
	function StarRatingList(options) {
        
        // Verify if the options are correct
		// Require key:iterations (array)
		if (!options || !options.iterations || !options.iterations.length) {
			throw new Error('adcStatementList expect an option argument with an array of iterations');
		}
        
		this.instanceId = options.instanceId || 1;
        var container = document.getElementById("adc_" + this.instanceId),
            images = [].slice.call(container.getElementsByTagName("img")),
        	total_images = container.getElementsByTagName("img").length;
        
        function loadImages( images, callback ) {
            var count = 0;

            function check( n ) {
                if( n == total_images ) {
                    callback();
                }
            }

            for( i = 0; i < total_images; ++i ) {
                var src = images[i].src;
                var img = document.createElement( "img" );
                img.src = src;

                img.addEventListener( "load", function() {
                    if( this.complete ) {
                        count++;
                        check( count );
                    }
                });
            }

        }

        window.addEventListener( "load", function() {
            if ( total_images > 0 ) {
                loadImages( images, function() {
                    init(options);
                });
            } else {
                init(options);
            }
        });
        
    }
    
    function init(options) {
        
		this.instanceId = options.instanceId || 1;
		this.options = options;
        (options.use = options.use || "star");
		(options.width = options.width || 400);
		(options.height = options.height || "auto");
		(options.animate = Boolean(options.animate));
		(options.autoForward = Boolean(options.autoForward));
        (options.currentQuestion = options.currentQuestion || '');
        (options.autoForwardLastIteration = Boolean(options.autoForwardLastIteration) || false);
		(options.scrollToTop = Boolean(options.scrollToTop) || false);
		(options.showCounter = Boolean(options.showCounter) || false);
        
        polyfillGetElementsByClassName();
        
        var container = document.getElementById("adc_" + this.instanceId),
            currentIteration = 0,
            iterations = options.iterations,
			isInLoop = Boolean(options.isInLoop),
            useStar = options.use,
			showTooltips = Boolean(options.showTooltips),
			rowVerticalAlignment = options.rowVerticalAlignment,
			isSingle = Boolean(options.isSingle),
			valuesArray = [],
            instanceId = options.instanceId,
			dkSingle = Boolean(options.dkSingle),
            images = container.getElementsByTagName("img"),
			inputs = [].slice.call(document.getElementsByTagName("input")),
            captions =  [].slice.call(container.getElementsByClassName('caption')),
            controlContainers = [].slice.call(container.getElementsByClassName('controlContainer')),
            allStars = [].slice.call(container.querySelectorAll('.' + useStar)),
            allDKs = [].slice.call(container.querySelectorAll('.dk')),
            submitBtns = [],
            nextBtn,
            total_images = container.getElementsByTagName("img").length,
			images_loaded = 0,
        	animate = Boolean(options.animate),
        	useAltColour = Boolean(options.useAltColour),
			autoForward = options.autoForward,
			scrollToTop = options.scrollToTop,
			showCounter = options.showCounter,
            initialWidth = container.clientWidth,
            autoForwardLastIteration = options.autoForwardLastIteration;
		
        if (!options || !options.iterations || !options.iterations.length) {
			throw new Error('adcStatementList expect an option argument with an array of iterations');
		}
        
        nextBtn = document.querySelector('input[name="Next"]');
		
        container.style.maxWidth = options.maxWidth;
        container.style.width = options.controlWidth;
        container.parentNode.style.width = '100%';
        container.parentNode.style.overflow = 'hidden';
		
        if ( options.controlAlign === "center" ) {
            container.parentNode.style.textAlign = 'center';
            container.style.margin = '0px auto';
		} else if ( options.controlAlign === "right" ) {
            container.style.margin = '0 0 0 auto';
		}
        
		// Check for missing images and resize
        for ( i=0; i<images.length; i++) {
            var size = {
                width: images[i].width,
                height: images[i].height
            };

            if (options.forceImageSize === "height" ) {
                if ( size.height > parseInt(options.maxImageHeight,10) ) {
                    var ratio = ( parseInt(options.maxImageHeight,10) / size.height);
                    size.height *= ratio;
                    size.width  *= ratio;
                }
            } else if (options.forceImageSize === "width" ) {
                if ( size.width > parseInt(options.maxImageWidth,10) ) {
                    var ratio = ( parseInt(options.maxImageWidth,10) / size.width);
                    size.width  *= ratio;
                    size.height *= ratio;
                }
            } else if (options.forceImageSize === "both" ) {
                if ( parseInt(options.maxImageHeight,10) > 0 && size.height > parseInt(options.maxImageHeight,10) ) {
                    var ratio = ( parseInt(options.maxImageHeight,10) / size.height);
                    size.height *= ratio;
                    size.width  *= ratio;
                }

                if ( parseInt(options.maxImageWidth,10) > 0 && size.width > parseInt(options.maxImageWidth,10) ) {
                    var ratio = ( parseInt(options.maxImageWidth,10) / size.width);
                    size.width  *= ratio;
                    size.height *= ratio;
                }

            } 
            images[i].width = size.width;
            images[i].height = size.height;
        }

		// Check for DK	
		var DKID = iterations[0].element.id.replace(/[^0-9]/g, ''),
			hasDK = ( document.querySelectorAll('input[name="M' + DKID + ' -1"]').length > 0 ) ? true : false;
		if ( hasDK ) {
            document.querySelector('input[name="M' + DKID + ' -1"]').style.display = "none";
            document.querySelector('img[id$="M' + DKID + '_-1"]').style.display = "none";
            document.querySelector('span#cpt' + DKID + '_-1').style.display = "none";
            // image ends with M1_-1   $
            // caption cpt1_-1
            // input same as before
        }

		var allValuesArray = iterations[0].allValues.split(",");
		for ( var i=0; i<allValuesArray.length; i++ ) {
			valuesArray.push( parseInt( allValuesArray[i] ) );	
		}
		
		// Hide or show next buttons
        var el,
            nextStatements = [].slice.call(container.getElementsByClassName( 'nextStatement' )),
            prevStatements = [].slice.call(container.getElementsByClassName( 'previousStatement' )),
            statementTexts = [].slice.call(container.getElementsByClassName( 'statement_text' ));
        
		if ( options.topButtons === 'hide both' && !(options.bottomButtons === 'hide both') ) {
            el = nextStatements[0];
			el.parentNode.removeChild( el );
            el = prevStatements[0];
			el.parentNode.removeChild( el );
        }
        else if ( options.topButtons === 'show next' && !(options.bottomButtons === 'hide both') ) 
        {
            el = prevStatements[0];
			el.parentNode.removeChild( el );
        }
        else if ( options.topButtons === 'show back' )
        {
            el = nextStatements[0];
			el.parentNode.removeChild( el );
        }
        nextStatements = [].slice.call(container.getElementsByClassName( 'nextStatement' ));
        prevStatements = [].slice.call(container.getElementsByClassName( 'previousStatement' ));
        
        if ( options.bottomButtons === 'hide both' ) {
            el = nextStatements[nextStatements.length - 1];
			el.parentNode.removeChild( el );
            el = prevStatements[prevStatements.length - 1];
			el.parentNode.removeChild( el );
        }
		else if ( options.bottomButtons === 'show next' ) {
            el = prevStatements[prevStatements.length - 1];
			el.parentNode.removeChild( el );
        }
		else if ( options.bottomButtons === 'show back' ) {
            el = nextStatements[nextStatements.length - 1];
			el.parentNode.removeChild( el );
        }
        nextStatements = [].slice.call(container.getElementsByClassName( 'nextStatement' ));
        prevStatements = [].slice.call(container.getElementsByClassName( 'previousStatement' ));
		
		if ( autoForward ) {
            var navigation = container.querySelectorAll('.nextStatement, .previousStatement');
            for ( i=0; i<navigation.length; i++ ) {
                navigation[i].parentNode.removeChild( navigation[i] );
            }
        }
		/*  ------- THIS FAR ---------- */
		container.querySelector('.starContainer').width = outerWidth(container.querySelector('.' + useStar)) * document.querySelectorAll('#adc_' + instanceId + ' .starContainer .' + useStar).length;

        // Select a statement for single
		// @this = target node
		function selectStarsSingle(target) {
			
			// hide error
			if ( document.querySelector('.error') ){
                document.querySelector('.error').style.display = "none";
            	document.querySelector('#error-summary').style.display = "none";
            }
            
			// disable clicking during animation
            if ( autoForward ) {
             	for ( i=0; i<allStars.length; i++ ) {
                    removeEvent(allStars[i], 'click');
                }
            }
            
            var starContainer = target.parentNode,
                input = iterations[currentIteration].element,
				value = target.getAttribute('data-value'),
				starValue = value,
				DKID = input.id.replace(/[^0-9]/g, ''),
                selectedElements = [].slice.call(starContainer.getElementsByClassName('selected'));
            
            for ( i=0; i<selectedElements.length; i++) {
                removeClass(selectedElements[i], 'selected');
            }
            
            if ( hasDK || dkSingle ) {
                removeClass( target.parentNode.parentNode.querySelector('.dk'), 'selected');
                if ( document.querySelector('input[name="M' + DKID + ' -1"]') )
					document.querySelector('input[name="M' + DKID + ' -1"]').checked = false;
			}
            
            if ( isSingle ) starValue = valuesArray.indexOf(parseInt(value)) + 1;

			var starsToSelect = [].slice.call(starContainer.querySelectorAll('.' + useStar)).slice(0,starValue);
            for ( i=0; i<starsToSelect.length; i++) {
                addClass(starsToSelect[i], 'selected');
            }                                 
			input.value = value;
            if (window.askia 
                && window.arrLiveRoutingShortcut 
                && window.arrLiveRoutingShortcut.length > 0
                && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                askia.triggerAnswer();
            }

            if ( iterations[currentIteration].element.value != '' && nextStatements.length > 0 ) nextStatements[0].style.display = "";
            
            if ( nextStatements.length > 0 ) {
                if ( nextStatements[0].style.display != "none" && autoForward ) {
                    setTimeout(function() {nextIteration();}, 100);
                }
            } else {
                setTimeout(function() {nextIteration();}, 100);
            }
		}
		

		// Returns the width of the statement
		// according if the iteration is the first or the last
		function getStatementWidth() {

            var width = container.clientWidth,
                previousStatementTopOWidth = container.querySelector('.previousStatement.top') ? outerWidth(container.querySelector('.previousStatement.top')) : 0,
                previousStatementTopLRBorder = container.querySelector('.previousStatement.top') ? lrBorder(container.querySelector('.previousStatement.top')) : 0,
                nextStatementTopOWidth = container.querySelector('.nextStatement.top') ? outerWidth(container.querySelector('.nextStatement.top')) : 0,
                nextStatementTopLRBorder = container.querySelector('.nextStatement.top') ? lrBorder(container.querySelector('.nextStatement.top')) : 0,
                btnWidth = previousStatementTopOWidth >nextStatementTopOWidth ?
                	( previousStatementTopOWidth + previousStatementTopLRBorder ) :
            		( nextStatementTopOWidth + nextStatementTopLRBorder );
            if ( currentIteration > 0 && iterations.length > 0 && options.topButtons != 'hide both' ) {
            	width -= btnWidth;
            }
			if (currentIteration < (iterations.length - 1) || options.topButtons != 'hide both') {
				width -= btnWidth;
			}
            return width;
		}

		// Update the navigation
		// Hide or display the button 
		// if the iteration is the first or last
		function updateNavigation() {
			if (currentIteration > 0 && iterations.length > 0) {
				if (options.topButtons !== 'hide both' || options.bottomButtons !== 'hide both') {
                    for ( i=0; i<prevStatements.length; i++ ) {
                        prevStatements[i].style.display = "";
                    }
                }
			} else {
				for ( i=0; i<prevStatements.length; i++ ) {
                    prevStatements[i].style.display = "none";
                }
			}
			if (currentIteration < (iterations.length - 1)) {
				if (options.topButtons !== 'hide both' || options.bottomButtons !== 'hide both') {
                    for ( i=0; i<nextStatements.length; i++ ) {
                        nextStatements[i].style.visibility = "visible";
                        nextStatements[i].style.display = "";
                    }
                }
			} else {
                for ( i=0; i<nextStatements.length; i++ ) {
                    nextStatements[i].style.display = "none";
                }
			}
		}
		
		function selectStarsNumeric(target) {
			// hide error
			if ( document.querySelector('.error') ){
                document.querySelector('.error').style.display = "none";
            	document.querySelector('#error-summary').style.display = "none";
            }
			
			// disable clicking during animation
			if ( autoForward ) {
             	for ( i=0; i<allStars.length; i++ ) {
                    removeEvent(allStars[i], 'click');
                }
            }
		
			var starContainer = target.parentNode,
            	input = iterations[currentIteration].element,
				value = target.getAttribute('data-value'),
				starValue = value,
				DKID = input.id.replace(/[^0-9]/g, '');
            
            var selectedElements = [].slice.call(starContainer.getElementsByClassName('selected'));
            for ( i=0; i<selectedElements.length; i++) {
                removeClass(selectedElements[i], 'selected');
            }
            if ( hasDK || dkSingle || allDKs.length > 0 ) {
                removeClass( target.parentNode.parentNode.querySelector('.dk'), 'selected');
                if ( document.querySelector('input[name="M' + DKID + ' -1"]') )
					document.querySelector('input[name="M' + DKID + ' -1"]').checked = false;
			}
			
			var starsToSelect = [].slice.call(starContainer.querySelectorAll('.' + useStar)).slice(0,starValue);
            for ( i=0; i<starsToSelect.length; i++) {
                addClass(starsToSelect[i], 'selected');
            }                                 
			input.value = value;
            if (window.askia 
                && window.arrLiveRoutingShortcut 
                && window.arrLiveRoutingShortcut.length > 0
                && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                askia.triggerAnswer();
            }
            
            if ( iterations[currentIteration].element.value != '' && nextStatements.length > 0 ) nextStatements[0].style.display = "";
            
            if ( nextStatements.length > 0 ) {
                if ( nextStatements[0].style.display != "none" && autoForward ) {
                    setTimeout(function() {nextIteration();}, 100);
                }
            } else {
                setTimeout(function() {nextIteration();}, 100);
            }
		}

		// Go to the previous loop iteration
		function previousIteration() {
			
            for ( i=0; i<allStars.length; i++ ) {
                removeEvent(allStars[i], 'click');
            }
            // TURN OFF DK TOO??
			
			if (currentIteration <= 0) {
				return;
			}
			currentIteration--;

			var width = getStatementWidth(),
				css = {
					opacity: 0,
					left: '-=' + width,
					width: width
				};
			updateNavigation();
			container.querySelector('.statement').style.width =  width + "px";
            
			var leftPos = container.querySelector('.statement').style.left;
			container.querySelector('.statement').style.left = -outerWidth(container) + "px";
                    
			setTimeout( function() {
				container.querySelector('.statement').style.left = leftPos + "px";
				container.querySelector('.statement').style.width = css.width + "px";
				container.querySelector('.statement').style.opacity = 0;
				container.querySelector('.statement').style.width = css.width + "px";
				onAnimationComplete();
			}, 500);
			
		}

		// Go to the next loop iteration
		function nextIteration() {
			
			for ( i=0; i<allStars.length; i++ ) {
                removeEvent(allStars[i], 'click');
            }
			// TURN OFF DK TOO??
			
			currentIteration++;
			var width = getStatementWidth(),
				css = {
					opacity: 0,
					left: '-=' + width,
					width: width
				};
				
			if (currentIteration > (iterations.length - 1)) {
				if ( autoForward ) {
                    
                    container.querySelector('.statement').style.opacity = css.opacity;
                    
					var leftPos = container.querySelector('.statement').style.left;
                    container.querySelector('.statement').style.left = -outerWidth(container) + "px";
                     container.querySelector('.statement').style.width = css.width + "px";
                    setTimeout (function() {
                        container.querySelector('.statement').style.left = 0 + "px";
                        nextBtn.click();
                    }, 500);
                    
                    if ( autoForwardLastIteration ) {
                        nextBtn.click();
                    }
				} else {
					currentIteration--;	
					for ( i=0; i<nextStatements.length; i++ ) {
                        if ( nextStatements[i].style.display !== "none" ) {
                        	nextStatements[i].style.display = "none";
                        }
                    }
				}
				return;
			} else {
				if ( scrollToTop ) {
					scrollTo(document.body, 0, 600);
				}
			}
            removeClass(container.querySelector('.statement'), 'animate');
			updateNavigation();
            
			container.querySelector('.statement').style.width =  width + "px";

            container.querySelector('.statement').style.opacity = css.opacity;
            container.querySelector('.statement').style.width = css.width + "px";
            onAnimationComplete();
            addClass(container.querySelector('.statement'), 'animate');
            var leftPos = container.querySelector('.statement').style.left;
            container.querySelector('.statement').style.left = -outerWidth(container) + "px";
                    
            setTimeout ( function() {
            	container.querySelector('.statement').style.left = 0 + "px";
            	//onAnimationComplete();
            }, 500);
		}

		// After the previous/next animation
		function onAnimationComplete() {
			displayIteration();
			
			var width = getStatementWidth(),
					css = {
						opacity: 1,
						left: '+=' + width,
						width: width
					};
			
            container.querySelector('.statement').style.opacity = css.opacity;
            container.querySelector('.statement').style.width = css.width + "px";
            var leftPos = container.querySelector('.statement').style.left;
                    container.querySelector('.statement').style.left = 0 + "px";
		}
		
		// Display the right loop caption and the right responses
		function displayIteration() {
            for ( i=0; i<allStars.length; i++ ) {
                allStars[i].onclick = function(e){
                    (isSingle) ? selectStarsSingle(this) : selectStarsNumeric(this);
                };
            }
			
			if ( showCounter ) {
				if ( options.countDirection === 'count down' ) container.querySelector('.counterNumber').textContent = (iterations.length - currentIteration - 1);
				else container.querySelector('.counterNumber').textContent = (currentIteration + 1);
			}
			
			// Display the info of the current loop iteration
			for ( i=0; i<statementTexts.length; i++ ) {
                statementTexts[i].style.display = "none";
                statementTexts[i].style.filter = "";
            }
			container.querySelector('.statement_text[data-id="' + (currentIteration + 1) + '"]').style.display = "";
			
			// add alt here
			if ( useAltColour ) {
				if ( (currentIteration % 2) === 0 )
                {
                    removeClass(container.querySelector('.statement'), 'altStatement');
                    addClass(container.querySelector('.statement'), 'evenStatement');
                }
				else
                {
                    removeClass(container.querySelector('.statement'), 'evenStatement');
                    addClass(container.querySelector('.statement'), 'altStatement');
                }
			} else {
				addClass(container.querySelector('.statement'), 'evenStatement');
			}
			
            for ( i=0; i<allStars.length; i++ ) {
                removeClass(allStars[i],'selected');
                removeClass(allStars[i],'hover');
            }
            for ( i=0; i<allDKs.length; i++ ) {
                removeClass(allDKs[i],'selected');
                removeClass(allDKs[i],'hover');
            }
			
			if (currentIteration < 0 || currentIteration >= iterations.length){
				
			} else {
				if (iterations[currentIteration] != null){
					var currentContainer = container.querySelector('.' + iterations[currentIteration].element.id),
                        starValue = isSingle  ? valuesArray.indexOf(parseInt(iterations[currentIteration].element.value)) + 1 : iterations[currentIteration].element.value;
					if ( dkSingle && isSingle && valuesArray.indexOf(iterations[currentIteration].element.value) === allStars.length ) {
						addClass(container.querySelector('.dk'),'selected');
					} else {
						if ( starValue == '-1' ) addClass(container.querySelector('.dk'),'selected');
						else {
                            var stars = [].slice.call(container.querySelectorAll('.' + useStar)).slice(0,starValue);
                            for ( j=0; j<stars.length; j++ ) {
                                addClass(stars[j],'selected');
                            }
                        }
					}
					if ( iterations[currentIteration].element.value == '' && nextStatements.length ) {
                     	for ( i=0; i<nextStatements.length; i++ ) {
                         	nextStatements[i].style.display = "none";
                        }
                    }
				}
			}
		}
		
		function hoverStars(target) {
			var starContainer = target.parentNode,
				starValue = valuesArray.indexOf(parseInt(target.getAttribute('data-value'))) + 1,
            	stars =[].slice.call( starContainer.querySelectorAll('.' + useStar)).slice(0,starValue);
            for ( i=0; i<stars.length; i++ ) {
                addClass(stars[i],'hover');
            }
            
            if ( showTooltips ) {
    			tippy('#' + target.id);
            }
		}
		
		function unHoverStars(target) {
			var starContainer = target.parentNode,
                 stars = starContainer.querySelectorAll('.' + useStar);
            for ( i=0; i<stars.length; i++ ) {
                removeClass(stars[i],'hover');
            }
		}
		
		function selectDK(target) {

            var starContainer = target.parentNode,
				input = iterations[currentIteration].element,
				value = parseInt(target.getAttribute('data-value')),
				DKID = input.id.replace(/[^0-9]/g, ''),
                stars = starContainer.querySelectorAll('.' + useStar + '.selected'),
                nextStatements = [].slice.call(container.getElementsByClassName( 'nextStatement' ));
			
			// unselect all stars
            for ( i=0; i<stars.length; i++ ) {
                removeClass(stars[i],'selected');
            }
            if ( hasClass(target, 'selected') ) {
				removeClass(target, 'selected');
				input.value = '';
                if ( document.querySelector('input[name="M' + DKID + ' -1"]') )
                	document.querySelector('input[name="M' + DKID + ' -1"]').checked = false;
			} else {
                addClass(target, 'selected');
                input.value = value;
                if ( document.querySelector('input[name="M' + DKID + ' -1"]') )
                    document.querySelector('input[name="M' + DKID + ' -1"]').checked = true;
			}
          
             if (window.askia 
                && window.arrLiveRoutingShortcut 
                && window.arrLiveRoutingShortcut.length > 0
                && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                askia.triggerAnswer();
            }

			if ( iterations[currentIteration].element.value != '' && nextStatements.length > 0 ) nextStatements[0].style.display = "";
            
            if ( nextStatements.length > 0 ) {
                if ( nextStatements[0].style.display != "none" && autoForward ) {
                    setTimeout(function() {nextIteration();}, 100);
                }
            } else {
                setTimeout(function() {nextIteration();}, 100);
            }
            
		}
        
        for ( i=0; i<nextStatements.length; i++ ) {
           	nextStatements[i].onclick = function(e) {
                nextIteration();
            };
        }
        for ( i=0; i<prevStatements.length; i++ ) {
            prevStatements[i].onclick = function(e) {
                previousIteration();
            };
        }

		// Refresh the current status on load 
		
		displayIteration();
		
		if ( !autoForward ) {	
			if ( currentIteration === 0 ) {
                for ( i=0; i<prevStatements.length; i++ ) {
                    prevStatements[i].style.display = "none";
                }
            }
            for ( i=0; i<nextStatements.length; i++ ) {
                nextStatements[i].style.display = "";
                nextStatements[i].style.marginLeft = "10px";
                nextStatements[i].style.float = "right";
            }

            var nextStatementWidth = ( container.querySelector('.nextStatement.top') ? outerWidth(container.querySelector('.nextStatement.top')) : 0);
            container.querySelector('.statement').style.width = 
				container.clientWidth - ( nextStatementWidth + lrBorder(document.querySelector('.statement'))) + "px";
			container.querySelector('.statement').style.float = "left";
            
            for ( i = 0; i < nextStatements.length; i++ ) {
				nextStatements[i].style.height = container.querySelector('.statement').clientHeight + "px";
			}
            for ( i = 0; i < prevStatements.length; i++ ) {
				prevStatements[i].style.display = "block";
                prevStatements[i].style.marginRight = "10px";
                prevStatements[i].style.float = "left";
                prevStatements[i].style.height = container.querySelector('.statement').clientHeight + "px";
                prevStatements[i].style.display = "none";
			}
			
			if ( iterations[currentIteration].element.value == '' && isSingle) {
             	for ( i = 0; i < nextStatements.length; i++ ) {
                    nextStatements[i].style.display = "none";
                }   
            }
			else if ( !isSingle ) {
				if ( iterations[currentIteration].element.value == '' ) {
                    for ( i = 0; i < nextStatements.length; i++ ) {
                        nextStatements[i].style.display = "none";
                    }   
                }
			}
		}
		
		for ( var i=0; i<iterations.length; i++ ) {
			if ( (isSingle && iterations[i].element.value == '') || (!isSingle && iterations[currentIteration].element.value == '')) {
				if ( i!=0 ) {
					currentIteration--;
					nextIteration();
				}
				break;
			} else {
				if ( i == iterations.length - 1 ) {
					currentIteration--;
					nextIteration();
                    break;
				} else {
					currentIteration++;
				}
			}
		}
        var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
        if (typeof supportsTouch === "undefined") {
            for ( var j=0; j<allStars.length; j++ ) {
                allStars[j].onmouseover = function(e) {
                    hoverStars(this);
                    if (this.querySelector('span')) {
                        var topAdj = outerHeight(this.querySelector('span')) + 5,
                            leftAdj = (outerWidth(this.querySelector('span')) - outerWidth(this))/2;
                        this.querySelector('.classic').style.top = -topAdj+'px';
                        this.querySelector('.classic').style.left = -leftAdj+'px';
                    }
                };
                allStars[j].onmouseout = function(e) {
                    unHoverStars(this);
                };
            }
        }
		if ( container.querySelectorAll( '.dk' ).length > 0 ) {
            for ( i=0; i<container.querySelectorAll( '.dk' ).length; i++ )
			container.querySelectorAll( '.dk' )[i].onclick = function(e) {
				selectDK(this);
			};
		}
        
        // animate
        if ( animate ){
			for ( i=0; i<allStars.length; i++ ) {
                allStars[i].style.left = "2000px";
                addClass(allStars[i], 'animate');
            }
        }
        
        function revealEl(el, delay) {
            setTimeout(function(){
                el.style.left = "0px";
            }, delay);
            setTimeout(function(){
                removeClass(el,'animate');
            }, 500);
        }
        
      	// reveal control      
        container.style.visibility = "visible";
        if ( animate ){
			for ( i=0; i<allStars.length; i++ ) {
                revealEl( allStars[i], 100+ (i*50) );
            }
         }

	};
    
	window.StarRatingList = StarRatingList;
}());