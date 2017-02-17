{% 
Dim i 
Dim j
Dim inputName
Dim ar = CurrentQuestion.ParentLoop.AvailableResponses
Dim avR = CurrentQuestion.AvailableResponses
Dim allValues = avR[1].inputValue()
Dim numberOfStars = CurrentADC.PropValue("numberOfStars").ToNumber()

For j = 2 to avR.Count
	allValues = allValues + "," + avR[j].inputValue()
Next

For i = 1 To ar.Count 
	inputName = CurrentQuestion.Iteration(ar[i].Index).InputName() 
	%}
{element : $('#{%= inputName%}'), allValues : "{%= allValues%}"}{%= On(i < ar.Count, ",", "") %}
{% Next %}