/* standard_numeric_loop.js */
{% 
Dim i 
Dim inputName
Dim ar = CurrentQuestion.ParentLoop.AvailableResponses
Dim numberOfStars = CurrentADC.PropValue("numberOfStars").ToNumber()

For i = 1 To ar.Count 
	inputName = CurrentQuestion.Iteration(i).InputName()
%}
{element : $('#{%= inputName%}')}{%= On(i < ar.Count, ",", "") %}
{% Next %}