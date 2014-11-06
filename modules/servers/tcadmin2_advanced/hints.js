/***********************************************
* Show Hint script- © Dynamic Drive (www.dynamicdrive.com)
* This notice MUST stay intact for legal use
* Visit http://www.dynamicdrive.com/ for this script and 100s more.
***********************************************/
		
var horizontal_offset="9px" //horizontal offset of hint box from anchor link

/////No further editting needed

var vertical_offset="0" //horizontal offset of hint box from anchor link. No need to change.
var ie=document.all
var ns6=document.getElementById&&!document.all

function getposOffset(what, offsettype){
var totaloffset=(offsettype=="left")? what.offsetLeft : what.offsetTop;
var parentEl=what.offsetParent;
while (parentEl!=null){
totaloffset=(offsettype=="left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
parentEl=parentEl.offsetParent;
}
return totaloffset;
}

function iecompattest(){
return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function clearbrowseredge(obj, whichedge){
var edgeoffset=(whichedge=="rightedge")? parseInt(horizontal_offset)*-1 : parseInt(vertical_offset)*-1
if (whichedge=="rightedge"){
var windowedge=ie && !window.opera? iecompattest().scrollLeft+iecompattest().clientWidth-30 : window.pageXOffset+window.innerWidth-40
dropmenuobj.contentmeasure=dropmenuobj.offsetWidth
if (windowedge-dropmenuobj.x < dropmenuobj.contentmeasure)
edgeoffset=dropmenuobj.contentmeasure+obj.offsetWidth+parseInt(horizontal_offset)
}
else{
var windowedge=ie && !window.opera? iecompattest().scrollTop+iecompattest().clientHeight-15 : window.pageYOffset+window.innerHeight-18
dropmenuobj.contentmeasure=dropmenuobj.offsetHeight
if (windowedge-dropmenuobj.y < dropmenuobj.contentmeasure)
edgeoffset=dropmenuobj.contentmeasure-obj.offsetHeight
}
return edgeoffset
}

function showhint(menucontents, obj, e, tipwidth){
 if ((ie||ns6) && document.getElementById("hintbox")){
  dropmenuobj=document.getElementById("hintbox")
  dropmenuobj.innerHTML=menucontents
  dropmenuobj.style.left=dropmenuobj.style.top=-500
  if (tipwidth!=""){
   dropmenuobj.widthobj=dropmenuobj.style
   dropmenuobj.widthobj.width=tipwidth
  }
  dropmenuobj.x=getposOffset(obj, "left")
  dropmenuobj.y=getposOffset(obj, "top")
  dropmenuobj.style.left=dropmenuobj.x-clearbrowseredge(obj, "rightedge")+obj.offsetWidth+"px"
  dropmenuobj.style.top=dropmenuobj.y-clearbrowseredge(obj, "bottomedge")+"px"
  dropmenuobj.style.visibility="visible"
  obj.onmouseout=hidetip
 }
}

function hidetip(e){
if(dropmenuobj)
{
    dropmenuobj.style.visibility="hidden"
    dropmenuobj.style.left="-500px"
}
}

function createhintbox(){
var divblock=document.createElement("div")
divblock.setAttribute("id", "hintbox")
document.body.appendChild(divblock)
}

function AttachEvent(obj,evt,fnc,useCapture){
	if (!useCapture) useCapture=false;
	if (obj.addEventListener){
		obj.addEventListener(evt,fnc,useCapture);
		return true;
	} else if (obj.attachEvent) return obj.attachEvent("on"+evt,fnc);
	else{
		MyAttachEvent(obj,evt,fnc);
		obj['on'+evt]=function(){ MyFireEvent(obj,evt) };
	}
} 

//For browsers like NS4 or IE5Mac which don't support either of the above
function MyAttachEvent(obj,evt,fnc){
	if (!obj.myEvents) obj.myEvents={};
	if (!obj.myEvents[evt]) obj.myEvents[evt]=[];
	var evts = obj.myEvents[evt];
	evts[evts.length]=fnc;
}
function MyFireEvent(obj,evt){
	if (!obj || !obj.myEvents || !obj.myEvents[evt]) return;
	var evts = obj.myEvents[evt];
	for (var i=0,len=evts.length;i<len;i++) evts[i]();
}

AttachEvent(window,'load',createhintbox);