/* standard_numeric_loop.js */
{% 
Dim i 
Dim inputName
Dim ar = CurrentQuestion.ParentLoop.Answers
Dim numberOfStars = CurrentADC.PropValue("numberOfStars").ToNumber()

For i = 1 To ar.Count 
	inputName = CurrentQuestion.Iteration(ar[i].Index).InputName()
%}
{element : $('#{%= inputName%}')}{%= On(i < ar.Count, ",", "") %}
{% Next %}