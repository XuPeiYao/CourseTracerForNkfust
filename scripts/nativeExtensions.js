NodeList.prototype.toArray=function(){
	return this.filter(function(x){return true;});
}
NodeList.prototype.filter=function(CFun){
	var result = [];
	for(var i = 0 ; i < this.length ; i++){
		if(CFun(this[i]))result.push(this[i]);
	}
	return result;
};
NodeList.prototype.last=function(){
	return this[this.length -1];
};
NodeList.prototype.first=function(){
	return this[0];
};
Element.prototype._insertBefore=function(newElement){
	this.parentNode.insertBefore(newElement,this);
};
Element.prototype._insertAfter=function(newElement){
	this.nextSibling._insertBefore(newElement);
};
var parseHTML = function(str){
	return parseNode("html",str);
}
var parseNode = function(tag,str){
	var result = document.createElement(tag);
	result.innerHTML = str;
	return result;
}