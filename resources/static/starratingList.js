(function ($) {
	"use strict";

	/**
	* Extend the jQuery with the method adcStatementList
	* Should be call on the container of the statement list
	* 
	*     // Single closed question
	*     $('#adc_1').adcStatementList({
	*         iterations : [
	*           { id : 'U1', caption : "Iteration 1" },
	*           { id : 'U3', caption : "Iteration 2" },
	*           { id : 'U5', caption : "Iteration 3" }
	*         ]
	*     });
	*
	*     // Multi-coded question
	*     $('#adc_1').adcStatementList({
	*         isMultiple : true,
	*         iterations : [
	*           { id : 'L1', caption : "Iteration 1" },
	*           { id : 'L3', caption : "Iteration 2" },
	*           { id : 'L5', caption : "Iteration 3" }
	*         ]
	*     });
	*
	* @param {Object} options Statements list parameters
	* @param {Array}  options.iterations Array which contains the definition of iterations
	* @param {String} options.iterations[].id Id or name of the input which contains the value of the current iteration
	* @param {String} options.iterations[].caption Caption of the current iteration
	* @param {Boolean} [options.isMultiple] Indicates if the question is multiple
	* @return {jQuery} Returns the current instance of the root container for the call chains
	*/
	$.fn.adcStarratingList = function adcStarratingList(options) {
		// Verify if the options are correct
		// Require key:iterations (array)
		if (!options || !options.iterations || !options.iterations.length) {
			throw new Error('adcStatementList expect an option argument with an array of iterations');
		}
		
		(options.autoForward = Boolean(options.autoForward) || false);
        (options.use = options.use || "star");
        (options.autoForwardLastIteration = Boolean(options.autoForwardLastIteration) || false);
		(options.scrollToTop = Boolean(options.scrollToTop) || false);
		(options.showCounter = Boolean(options.showCounter) || false);
				
		// Delegate .transition() calls to .animate() if the browser can't do CSS transitions.
		if (!$.support.transition) $.fn.transition = $.fn.animate;
				
		$(this).css({'max-width':options.maxWidth,'width':options.controlWidth});
		$(this).parents('.controlContainer').css({'width':'100%'});
		
		if ( options.controlAlign === "center" ) {
			$(this).parents('.controlContainer').css({'text-align':'center'});
			$(this).css({'margin':'0px auto'});
		} else if ( options.controlAlign === "right" ) {
			$(this).css({'margin':'0 0 0 auto'});
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
		
		// Global variables
		var $container = $(this),
            useStar = options.use,
			currentIteration = 0,
            iterations = options.iterations,
			useAltColour = Boolean(options.useAltColour),
			autoForward = options.autoForward,
			scrollToTop = options.scrollToTop,
			showCounter = options.showCounter,
            initialWidth = $container.find('.statement').width(),
			showTooltips = Boolean(options.showTooltips),
			tooltipStyle = options.tooltipStyle,
			tooltipCurvedCorners = options.tooltipCurvedCorners,
			tooltipShadow = options.tooltipShadow,
			rowVerticalAlignment = options.rowVerticalAlignment,
			isSingle = Boolean(options.isSingle),
			valuesArray = new Array(),
			dkSingle = Boolean(options.dkSingle);
					
		// Check for DK	
		var DKID = iterations[0].element.attr('id').replace(/[^0-9]/g, ''),
			hasDK = ( $('input[name="M' + DKID + ' -1"]').size() > 0 ) ? true : false;
		if ( hasDK ) $('input[name="M' + DKID + ' -1"]').hide().next('span').hide();
		
		if ( isSingle ) {
			var allValuesArray = iterations[0].allValues.split(",");
			for ( var i=0; i<allValuesArray.length; i++ ) {
				valuesArray.push( parseInt( allValuesArray[i] ) );	
			}
		} else {
			for ( var i=1; i<=iterations.length; i++ ) {
				valuesArray.push(i);	
			}





		}
		
		// Hide or show next buttons
		if ( options.topButtons === 'hide both' ) $container.find('.nextStatement:first, .previousStatement:first').remove();
		else if ( options.topButtons === 'show next' )  $container.find('.previousStatement:first').remove();
		else if ( options.topButtons === 'show back' )  $container.find('.nextStatement:first').remove();
		
		if ( options.bottomButtons === 'hide both' )	  $container.find('.nextStatement:last, .previousStatement:last').remove();
		else if ( options.bottomButtons === 'show next' ) $container.find('.previousStatement:last').remove();
		else if ( options.bottomButtons === 'show back' ) $container.find('.nextStatement:last').remove();
		
		if ( autoForward ) $container.find('.nextStatement, .previousStatement').remove();
		
		// Convert RGB to hex
		function trim(arg) {
			return arg.replace(/^\s+|\s+$/g, "");
		}
		function isNumeric(arg) {
			return !isNaN(parseFloat(arg)) && isFinite(arg);
		}
		function isRgb(arg) {
			arg = trim(arg);
			return isNumeric(arg) && arg >= 0 && arg <= 255;
		}
		function rgbToHex(arg) {
			arg = parseInt(arg, 10).toString(16);
			return arg.length === 1 ? '0' + arg : arg; 
		}
		function processRgb(arg) {
			arg = arg.split(',');
	
			if ( (arg.length === 3 || arg.length === 4) && isRgb(arg[0]) && isRgb(arg[1]) && isRgb(arg[2]) ) {
				if (arg.length === 4 && !isNumeric(arg[3])) { return null; }
				return '#' + rgbToHex(arg[0]).toUpperCase() + rgbToHex(arg[1]).toUpperCase() + rgbToHex(arg[2]).toUpperCase();
			}
			else {
				return null;
			}
		}
		
		$('.starContainer').width( $('.' + useStar).outerWidth(true) * $('.starContainer .' + useStar).size() );
		
		// Detect DK
		var DKID = iterations[0].element.attr('id').replace(/[^0-9]/g, '');
		if ( $('input[name="M' + DKID + ' -1"]').size() > 0 || dkSingle ) {
			//$(this).find('dk').hide();
		} else {
			$(this).find('.dk').hide();
		}
		
		// For multi-coded question
		// Add the @valueToAdd in @currentValue (without duplicate)
		// and return the new value
		function addValue(currentValue, valueToAdd) {
			if (currentValue == '') {
				return valueToAdd;
			}

			var arr = String(currentValue).split(','), i, l, wasFound = false;

			for (i = 0, l = arr.length; i < l; i += 1) {
				if (arr[i] == valueToAdd) {
					wasFound = true;
					break;
				}
			}

			if (!wasFound) {
				currentValue += ',' + valueToAdd;
			}
			return currentValue;
		}

		// For multi-coded question
		// Remove the @valueToRemove from the @currentValue
		// and return the new value
		function removeValue(currentValue, valueToRemove) {
			if (currentValue === '') {
				return currentValue;
			}
			var arr = String(currentValue).split(','),
                        i, l,
                        newArray = [];
			for (i = 0, l = arr.length; i < l; i += 1) {
				if (arr[i] != valueToRemove) {
					newArray.push(arr[i]);
				}
			}
			currentValue = newArray.join(',');
			return currentValue;
		}
		
						
		// Select a statement for single
		// @this = target node
		
		function selectStarsSingle() {
			
			// hide error
			$('.error, #error-summary').hide();
			
			// disable clicking during animation
			if ( autoForward ) $container.off('click', '.' + useStar);
		
			var $input = iterations[currentIteration].element,
				$target = $(this),
				value = $target.attr('data-value'),
				starValue = value,
				DKID = $input.attr('id').replace(/[^0-9]/g, '');

			$container.find('.selected').removeClass('selected');
			if ( hasDK || dkSingle ) {
				$container.next('.dk').removeClass('selected');
				$('input[name="M' + DKID + ' -1"]').prop('checked', false);
			}
			if ( isSingle ) starValue = $.inArray(parseInt(value), valuesArray) + 1;
			
			$container.find('.' + useStar).slice(0,starValue).addClass('selected');
			$input.val(value);

			if ( iterations[currentIteration].element.val() != '' ) $container.find('.nextStatement').show();
			
			if ( ($container.find('.nextStatement').css('display') == 'none' || $container.find('.nextStatement').size() === 0) || 
				 (($container.find('.nextStatement').css('display') != 'none' || $container.find('.nextStatement').size() > 0) && autoForward) ) nextIteration();
		}
		

		// Returns the width of the statement
		// according if the iteration is the first or the last
		function getStatementWidth() {
			var width = initialWidth;
			if (currentIteration > 0 && iterations.length > 0) {
				width -= $container.find('.previousStatement.top').outerWidth(true);
			}
			if (currentIteration < (iterations.length - 1) || !autoForward) {
				width -= $container.find('.nextStatement.top').outerWidth(true);
			}
			return width;
		}

		// Update the navigation
		// Hide or display the button 
		// if the iteration is the first or last
		function updateNavigation() {
			if (currentIteration > 0 && iterations.length > 0) {
				if ( !(autoForward) ) $container.find('.previousStatement').show(options.animationSpeed);
			} else {
				$container.find('.previousStatement').css('display','none');
			}
			if (currentIteration < (iterations.length - 1)) {
				if ( !(autoForward) ) $container.find('.nextStatement').show(options.animationSpeed);
			} else {
				$container.find('.nextStatement').css('display','none');
			}
		}
		
		function selectStarsNumeric() {
			// hide error
			$('.error, #error-summary').hide();
			
			// disable clicking during animation
			if ( autoForward ) $container.off('click', '.' + useStar);
		
			var $input = iterations[currentIteration].element,
				$target = $(this),
				value = $target.attr('data-value'),
				starValue = value,
				DKID = $input.attr('id').replace(/[^0-9]/g, '');

			$container.find('.selected').removeClass('selected');
			if ( hasDK || dkSingle ) {
				$container.next('.dk').removeClass('selected');
				$('input[name="M' + DKID + ' -1"]').prop('checked', false);
			}
			
			$container.find('.' + useStar).slice(0,starValue).addClass('selected');
			$input.val(value);

			if ( iterations[currentIteration].element.val() != '' ) $container.find('.nextStatement').show();
			
			if ( ($container.find('.nextStatement').css('display') == 'none' || $container.find('.nextStatement').size() === 0) || 
				 (($container.find('.nextStatement').css('display') != 'none' || $container.find('.nextStatement').size() > 0) && autoForward) ) nextIteration();
		}

		// Go to the previous loop iteration
		function previousIteration() {
			
			$container.off('click', '.' + useStar);
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
			$container.find('.statement').css('width',width).animate(css, options.animationSpeed, onAnimationComplete);
			
		}

		// Go to the next loop iteration
		function nextIteration() {
			
			$container.off('click', '.' + useStar);
			// TURN OFF DK TOO??
			
			currentIteration++;
			var width = getStatementWidth(),
				css = {
					opacity: 0,
					left: '-=' + width,
					width: width
				};
				
			if (currentIteration > (iterations.length - 1)) {
				if ( options.autoForward === true ) {
					$container.find('.statement').animate(css, options.animationSpeed);
                    if ( options.autoForwardLastIteration === true ) {
                        $(':input[name=Next]:last').click();
                    }
				} else {
					currentIteration--;	
					if ( $container.find('.nextStatement').css('display') != 'none' ) $container.find('.nextStatement').css('display','none');
				}
				return;
			} else {
				if ( scrollToTop ) {
					$("html, body").animate({ scrollTop: 0 }, "fast");
				}
			}
			updateNavigation();
			$container.find('.statement').css('width',width).animate(css, options.animationSpeed, onAnimationComplete);
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
			$container.find('.statement').animate(css, options.animationSpeed);
		}
		
		// Display the right loop caption and the right responses
		function displayIteration() {
			$container
				.on('click', '.' + useStar, isSingle ? selectStarsSingle : selectStarsNumeric);
			
			if ( showCounter ) {
				if ( options.countDirection === 'count down' ) $container.find('.counterNumber').html(iterations.length - currentIteration - 1);
				else $container.find('.counterNumber').html(currentIteration + 1);	
			}
			
			// Display the info of the current loop iteration
			$container.find('.statement_text').hide();
			$container.find('.statement_text[data-id="' + (currentIteration + 1) + '"]').show();
			
			// add alt here
			if ( useAltColour ) {
				if ( (currentIteration % 2) == 0 ) $container.find('.statement').removeClass('altStatement').css('filter','');
				else $container.find('.statement').css('filter','').addClass('altStatement');
			}

			$container.find('.' + useStar + ', .dk').removeClass('selected');
			$container.find('.' + useStar + ', .dk').removeClass('hover');
			
			if(currentIteration < 0 || currentIteration >= iterations.length){
				
			} else {
				if(iterations[currentIteration] != null){
					var starValue = isSingle  ? $.inArray(parseInt(iterations[currentIteration].element.val()), valuesArray) + 1 : iterations[currentIteration].element.val();
					if ( dkSingle && isSingle && $.inArray(parseInt(iterations[currentIteration].element.val()), valuesArray) === $container.find('.' + useStar).size() ) {
						$container.find('.dk').addClass('selected');
					} else {
						if ( starValue == '-1' ) $container.find('.dk').addClass('selected');
						else $container.find('.' + useStar).slice(0,starValue).addClass('selected');
					}
					if ( iterations[currentIteration].element.val() == '' ) $container.find('.nextStatement').hide();
				}
			}
		}
		
		function hoverStars(target) {
			var $starContainer = target.parents('.starContainer');
			var starValue = $.inArray(parseInt(target.data('value')), valuesArray) + 1;
			$starContainer.find('.' + useStar).slice(0,starValue).addClass('hover');
		}
		
		function unHoverStars(target) {
			var $starContainer = target.parents('.starContainer');
			$starContainer.find('.' + useStar).removeClass('hover');
		}
		
		function selectDK() {
			
			var $container = $(this).parents('.controlContainer'),
				$input = iterations[currentIteration].element,
				$target = $(this),
				value = $(this).data('value'),
				DKID = $input.attr('id').replace(/[^0-9]/g, '');
				
			// unselect all stars
			$container.find('.' + useStar + '.selected').removeClass('selected');
			if ( $(this).hasClass('selected') ) {
				$(this).removeClass('selected');
				$input.val('');
				$('input[name="M' + DKID + ' -1"]').prop('checked', false);
			} else {
				$(this).addClass('selected');
				$input.val(value);
				$('input[name="M' + DKID + ' -1"]').prop('checked', true);
			}
			
			if ( iterations[currentIteration].element.val() != '' ) $container.find('.nextStatement').show();
			
			if ( ($container.find('.nextStatement').css('display') == 'none' || $container.find('.nextStatement').size() === 0) || 
				 (($container.find('.nextStatement').css('display') != 'none' || $container.find('.nextStatement').size() > 0) && autoForward) ) nextIteration();
			
			// if auto forward and all answered
			/*if ( options.autoForward ) {
				var totalAnswers = 0;
				$container = $(this).parents('.adc-starRating');
				$container.find('input').each(function forEachItem() {
					if ( $(this).val() > 0 ) {
						totalAnswers++;
					}
				});
				if ( totalAnswers === iterations.length ) $(':input[name=Next]:last').click();
			}*/
			
		}
		$container
			.on('click', '.previousStatement', previousIteration)
			.on('click', '.nextStatement', nextIteration);

		// Refresh the current status on load 
		
		displayIteration();
		
		if ( !autoForward ) {	
			if ( currentIteration === 0 ) $container.find('.previousStatement').css('display','none');
			$container.find('.nextStatement').css({'display':'block','margin-left':'10px','float':'right'});
			$container.find('.statement').width($container.find('.statement').width() - $container.find('.nextStatement.top').outerWidth(true)).css('float','left');
			$container.find('.nextStatement').height($container.find('.statement').height());
			
			$container.find('.previousStatement').css({'display':'block','margin-right':'10px','float':'left'});
			$container.find('.previousStatement').height($container.find('.statement').height()).hide();
			if ( iterations[currentIteration].element.val() == '' && isSingle) $container.find('.nextStatement').hide();
			else if ( !isSingle ) {
				if ( iterations[currentIteration].element.val() == '' ) $container.find('.nextStatement').hide();
			}
		}
		
		for ( var i=0; i<iterations.length; i++ ) {
			if ( (isSingle && iterations[i].element.val() == '') || (!isSingle && iterations[currentIteration].element.val() == '')) {
				if ( i!=0 ) {
					currentIteration--;
					nextIteration();
				}
				break;
			} else {
				if ( i == iterations.length - 1 ) {
					currentIteration--;
					nextIteration();
				} else {
					currentIteration++;
				}
			}
		}
		
		$container.on('mouseover mouseout', '.' + useStar,  function(e) {
			
			if (e.type == 'mouseover') {
				hoverStars($(this))
				var topAdj = $(this).find('span').outerHeight() + 5,
					leftAdj = ($(this).find('span').outerWidth() - $(this).outerWidth())/2;
				$(this).find('.classic').css({'top':-topAdj+'px', 'left':-leftAdj+'px'});
			} else {
				unHoverStars($(this))
			}
		});
		$container.on('click', '.dk', selectDK);
		
		if ( options.animate ) {
			var delay = 0,
				easing = (!$.support.transition)?'swing':'snap';
			
			var $starContainer = $('.starContainer');
			$starContainer.find('.' + useStar).each(function forEachItem() {
				$(this).css({ x: 2000, opacity: 0 }).transition({ x: 0, opacity: 1, delay: delay }, options.animationSpeed, easing);
				delay += 30;
			});
		}

		// Returns the container
		return this;
	};

} (jQuery));