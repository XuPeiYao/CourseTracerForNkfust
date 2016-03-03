var mousePosition = {x:null,y:null};
function parseCourseInfo(element){
	var tds = element.querySelectorAll("td").toArray()
		.map(function(item){
			return item.innerText.replace(/[ 　\n]/g,"");
		})
		.filter(function(item){
			return item != "授課大綱"
		});
	console.log(tds.indexOf("授課大綱"));
	console.log(tds.map(function(x){return {text : x,len : x.length}}));
	var result = {};
	for(var i = 0 ;  i < tds.length ; i+=2){
		var key =  tds[i];
		var value = tds[i+1];
		result[key] = value;
	}
	
	result["上課教室"] = result["上課教室"].match(/[A-Z]\d+/);
	
	console.log(result);
	return result;
}

function createMiniWindow(){
	var result = document.createElement("div");
	result.setAttribute("id","miniWindow");
	result.style.left = 0;
	result.style.top = 0;
	result.style.visibility = "collapse";
	result.style.width = 300;
	document.body.appendChild(result);
	
	
	document.addEventListener("mousemove", function(event){
		mousePosition.x = event.clientX;
		mousePosition.y = event.clientY;
		result.style.left = mousePosition.x + 10;
		result.style.top = mousePosition.y + 10;
	});
	
	return {
		element : result,
		get visable(){
			return this.element.style.visibility == "collapse";
		},
		set visable(value){
			this.element.style.visibility = value?"visible":"collapse";
		},
		updateContent : function(data){
			var text = '<h3 style="margin-top:0px;margin-bottom:0px">' + data["課程名稱"] + "</h3>";
			text += "<label><b>開課系所:</b></label> " + data["開課系所"] + "<br/>";
			text += "<label><b>選修限制:</b></label> " + data["限修學制"] + data["限修學院"] + data["限修系所(年級)"] + data["限修班級"] + "<br/>";
			text += "<label><b>教室:</b></label> " + (data["上課教室"] || "無教室") + "<br/>";
			text += "<label><b>備註:</b></label> " + (data["課程備註"] || "") + "<br/>";
			result.innerHTML = text;
		}
	};
}

var addedCourseCol = false;
function addCourseTracerCol(){
	var miniWindow = createMiniWindow();
	document.querySelector("th")._insertBefore(parseNode('th','<th>名額<br><font class="table_eng">Quota</font></th>'));
	document.querySelectorAll("tr").toArray().forEach(function(item,index){
		if(item.getAttribute("bgcolor"))return;
		//#region 課程資訊小視窗
		var infoTD = item.querySelectorAll("td")[5];
		infoTD.onmouseover = function(){
			miniWindow.visable = true;
			miniWindow.updateContent(parseCourseInfo(list[index - 1].getCourseInfo()));
		};
		infoTD.onmouseout = function(){
			miniWindow.visable = false;
		}
		//#endregion		
		
		//#region 追蹤按鈕
		var td = document.createElement("td");
		td.setAttribute("align","center");
		
		var tracerButton = document.createElement("button");
		tracerButton.innerText = "追蹤";
		tracerButton.onclick = function(){
			console.log("追蹤對象:" + list[index-1].name);
			startCourseTracerOne(list[index-1],reloadTime);
			return false;
		};
		td.appendChild(tracerButton);
		item.querySelector("td")._insertBefore(td);
		//#endregion
	});
	addedCourseCol = true;
}


function startCourseTracerOne(item,reloadTime){
	setInterval(function timer(){
		var quota = item.getQuota();
		
		item.tableRow.querySelector("td").innerText = quota;
		
		return timer;
	}(),reloadTime);
}

function getCourseList(){
	var offset = 0;
	if( addedCourseCol ) offset = 1;
	return document.querySelectorAll("tr")
		.filter(function(item){return !item.getAttribute("bgcolor");})
		.map(function(item){
			return {
				id : item.querySelectorAll("input")[0+offset].value,
				name : item.querySelector("a").innerText.split('\n')[0],
				credit : parseInt(item.querySelectorAll("td")[3+offset].innerText),
				schedule : item.querySelectorAll("td")[6+offset].innerText,
				infoUrl : item.querySelector("a").href,
				tableRow : item,
				getQuota : function(){
					var info = this.getCourseInfo(true);
					return parseInt(info.querySelectorAll("td[align='center']").last().innerText);
				},
				getCourseInfo : function(update){
					if(this.__courseInfo__ && !update)return this.__courseInfo__;
					var request = new XMLHttpRequest();
					request.open("GET",this.infoUrl,false);
					request.send();
					
					this.__courseInfo__ = parseHTML(request.responseText);
					return this.__courseInfo__;
				},
				__input__ : item.querySelector("input"),
				get selected(){
					return this.__input__.checked;
				},
				set selected(value){
					this.__input__.checked = value;
				}
			};
		});
}

addCourseTracerCol();
var list = getCourseList();
var reloadTime = Math.max(list.length / 40 * 10000,10000);
//startCourseTracer(list,reloadTime);