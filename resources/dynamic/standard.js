DomReady.ready(function() {

    var starRating = new StarRatingList({
        instanceId : '{%= CurrentADC.InstanceId%}',
        currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
      	use : '{%= CurrentADC.PropValue("use") %}',
    		maxWidth : '{%= CurrentADC.PropValue("maxWidth") %}',
    		controlWidth : '{%= CurrentADC.PropValue("controlWidth") %}',
    		maxImageWidth : '{%= CurrentADC.PropValue("maxImageWidth") %}',
    		maxImageHeight : '{%= CurrentADC.PropValue("maxImageHeight") %}',
    		forceImageSize : '{%= CurrentADC.PropValue("forceImageSize") %}',
    		autoForward : {%= (CurrentADC.PropValue("autoForward") = "1") %},
    		scrollToTop : {%= (CurrentADC.PropValue("scrollToTop") = "1") %},
    		isSingle : {%= (CurrentQuestion.Type = "single") %},
    		animate : {%= (CurrentADC.PropValue("animateResponses") = "1") %},
    		topButtons : '{%= CurrentADC.PropValue("topButtons") %}',
    		bottomButtons : '{%= CurrentADC.PropValue("bottomButtons") %}',
    		showCounter : {%= (CurrentADC.PropValue("showCounter") = "1") %},
    		countDirection : '{%= CurrentADC.PropValue("countDirection") %}',
    		controlAlign : '{%= CurrentADC.PropValue("controlAlign") %}',
    		useAltColour: {%= (CurrentADC.PropValue("useAltColour") = "1") %},
    		showTooltips: {%= (CurrentADC.PropValue("showTooltips") = "1") %},
    		dkSingle: {%= (CurrentADC.PropValue("dkSingle") = "1") %},
      	currentQuestion: '{%:= CurrentQuestion.Shortcut %}',
        autoForwardLastIteration: {%= (CurrentADC.PropValue("autoForwardLastIteration") = "1") %},
    		iterations: [
    			{% IF CurrentQuestion.Type = "single" Then %}
    				{%:= CurrentADC.GetContent("dynamic/standard_single.js").ToText()%}
    			{% ElseIf CurrentQuestion.Type = "numeric" Then %}
    				{%:= CurrentADC.GetContent("dynamic/standard_numeric.js").ToText()%}
    			{% EndIF %}
    		]
	});
});
