var canvas;
var stage;
var imgdata;
var board;
var dummycanvas;
var c;
var arr;
var line = new Shape();

var coords = new Array(0);
var bmp;
var svm = new SVM();
var ts = new TrainingSignal(2);
var pointLabel;
var flag_ls=false;

var blurFilter = new BoxBlurFilter(1,1,2) 
	var margins = blurFilter.getBounds();
	var scale = 5;
	var pt_col = [Graphics.getRGB(17,106,125,0.8),Graphics.getRGB(193,82,61,0.8)];

	function init() {
		canvas = document.getElementById('myCanvas');
		width = canvas.width;
		height = canvas.height;

		stage = new Stage(canvas);

		dummycanvas = document.createElement("canvas");
		dummycanvas.setAttribute("width",width/scale);
		dummycanvas.setAttribute("height",height/scale);
		c = dummycanvas.getContext("2d");
		imgdata = c.createImageData(dummycanvas.width,dummycanvas.height);
		renewBitmap();

		arr = arr2(dummycanvas.width,dummycanvas.height);

		board = createBoard();
		board.onClick = onClick_Board;

		stage.addChild(drawBackGround());
		stage.addChildAt(bmp,1);
		stage.addChild(board);
		stage.addChild(line);
		stage.update();

		tick = null;
		Ticker.setFPS(60);
		Ticker.addListener(window);

		kernelType_Changed();
		pointLabel_Changed();
	}

function drawBackGround() {
	var s = new Shape();
	var g = s.graphics;

	g.beginFill("#CCCCCC");
	g.drawRoundRect(0,0,canvas.width,canvas.height,0);
	g.endFill();

	return s;
}

function createBoard() {
	var s = new Shape();
	var g = s.graphics;

	g.setStrokeStyle(2, 'round', 'round');
	g.beginStroke("#000");
	g.beginStroke(Graphics.getRGB(0,0,0,0.8));
	g.beginFill(Graphics.getRGB(0,0,0,0.01));
	g.drawRoundRect(0,0,canvas.width,canvas.height,0);
	g.endFill();

	return s;
}

function createPoint(x,y,label) {
	var s = new Shape();
	var g = s.graphics;

	s.x = x;
	s.y = y;
	s.label = pointLabel;

	g.setStrokeStyle(2, 'round', 'round');
	g.beginStroke(Graphics.getRGB(0,0,0,0.8));
	g.beginFill(pt_col[label>0?1:0]);
	g.drawCircle(0,0,3);
	g.endFill();

	return s;
}

function highlightSupportVector(){
	for(var i=0;i<svm.alpha.length;i++){
		var s = coords[i];
		if(svm.alpha[i] == 0 ) s.alpha = 0.2;
		else s.alpha = 1.0;
	}
}

function drawSeparatingHyperPlane()
{
	var g = line.graphics; 
	var w = 1.0/Math.sqrt(svm.w[0]*svm.w[0]+svm.w[1]*svm.w[1]);
	var size = Math.sqrt(svm.w[0]*svm.w[0]+svm.w[1]*svm.w[1])/svm.w[1];
	var swx = svm.h/svm.w[1];
	var ewx = (svm.h-svm.w[0])/svm.w[1];
	var margin = w*size;

	g.clear();
	drawLine(g,pt_col[0],0.0,(swx - margin),1.0,(ewx - margin));
	drawLine(g,pt_col[1],0.0,(swx + margin),1.0,(ewx + margin));
	drawLine(g,"#000",0.0,swx,1.0,ewx);
}

function drawLine(g,col,sx,sy,ex,ey)
{
	g.beginStroke(col).setStrokeStyle(2,"round","round");
	g.moveTo(sx*width,sy*height).lineTo(ex*width,ey*height);
	g.endStroke();
}


function drawPotential()
{
	var max = Number.MIN_VALUE;
	var min = Number.MAX_VALUE;

	for(var y=0,hh=imgdata.height;y<hh;y++)
	{
		for(var x=0,ww=imgdata.width;x<ww;x++)
		{
			var val = svm.eval([x*1.0/ww,y*1.0/hh]);
			arr[x][y] = val; 
			if(val > max) max = val;
			if(val < min) min = val;
		}
	}

	for(var y=0,hh=imgdata.height;y<hh;y++)
	{
		for(var x=0,ww=imgdata.width;x<ww;x++)
		{
			var val = arr[x][y];
			var tp ;
			if(val < 0){
				tp = 255 * val / min;
				setPixel(imgdata, x, y, 17, 106, 125, tp | 0); 
			}
			else{
				tp = 255 * val / max;
				setPixel(imgdata, x, y, 193, 82, 61, tp | 0);
			}
		}
	}
	stage.removeChild(bmp);
	renewBitmap();
	stage.addChildAt(bmp,1);
}

function setPixel(imageData, x, y, r, g, b, a) {
	index = (x + y * imageData.width) * 4;
	imageData.data[index+0] = r;
	imageData.data[index+1] = g;
	imageData.data[index+2] = b;
	imageData.data[index+3] = a;
}

function onClick_Board(e)
{
	addCoord(e.stageX,e.stageY);
	stage.update();
}

function clearCoords()
{
	flag_ls = false;
	stop_learning();

	ts.clearData();

	for(var i=0;i<coords.length;i++)
	{
		stage.removeChild(coords[i]);
	}
	delete coords;
	coords = new Array(0);

	line.graphics.clear();
	clearBitmap();

	stage.removeChild(bmp);
	renewBitmap();
	stage.addChildAt(bmp,1);
	stage.update();

	disableLearningButton(true);
}

function renewBitmap()
{
	c.putImageData(imgdata,0,0);
	bmp = null;
	bmp = new Bitmap(dummycanvas);
	bmp.scaleX=bmp.scaleY=scale;
	bmp.filters = [blurFilter];
	bmp.cache(0,0,imgdata.width,imgdata.height);
}

function clearBitmap()
{
	for(var y=0,hh=imgdata.height;y<hh;y++)
	{
		for(var x=0,ww=imgdata.width;x<ww;x++)
		{
			setPixel(imgdata, x, y, 0, 0, 0, 0); 
		}
	}
}

function addCoord(x,y)
{
	var point = createPoint(x,y,pointLabel);

	coords.push(point);
	stage.addChild(point); 
	ts.addData([1.0*x/width,1.0*y/height],pointLabel);

	if(tick==null) svm.setTrainingData(ts);
	else svm.addTrainingData(ts);
	disableLearningButton(!ts.isValid());

	if(flag_ls){ 
		start_learning();
	}
}

function learning()
{
	flag_ls = true;
	if(tick==null) start_learning();
	else stop_learning();
}

function svm_leaning()
{
	svm.learning();
	drawPotential();
	drawSeparatingHyperPlane();
	highlightSupportVector();
	stage.update();

	if(svm.end) stop_learning();
}

function stop_learning()
{
	var r = document.getElementById("button_learn");
	r.value = "Learn";
	tick=null;
}

function start_learning()
{
	var r = document.getElementById("button_learn");
	r.value = "Stop";
	tick = svm_leaning;

}

function kernelType_Changed()
{
	var r = document.getElementById("kernel_type");
	svm.setKernel(r.selectedIndex);

	line.visible = r.selectedIndex == 0 ? true:false;
}

function pointLabel_Changed()
{
	var r = document.getElementById("coord_type_a");

	pointLabel = r.checked ? -1 : 1;
}

function paramC_Changed()
{
	var r = document.getElementById("param_C");
	svm.C = Number(r.value);
	svm.setTrainingData(ts);
}

function paramGamma_Changed()
{
	var r = document.getElementById("param_gamma");
	svm.gamma = Number(r.value);
	svm.setTrainingData(ts);
}

function disableLearningButton(b)
{
	var r = document.getElementById("button_learn");
	r.disabled = b;
}


function plotTestData()
{
	var tmp = pointLabel;
	var np = 20;
	clearCoords();
	switch((Math.random()*3)|0)
	{
		case 0: plotTest00(np); break;
		case 1: plotTest01(np); break;
		case 2: plotTest02(np); break;
	}

	stage.update();
	pointLabel = tmp;
	disableLearningButton(false);
}

function plotTest00(n)
{
	for(var i=0;i<n;i++)
	{
		pointLabel = -1;
		addCoord((Math.random()+1.25)*0.4*width,(Math.random()+1.25)*0.4*height);
		pointLabel = 1;
		addCoord((Math.random()+0.25)*0.4*width,(Math.random()+0.25)*0.4*height);
	}
}

function plotTest01(n)
{
	for(var i=0;i<n;i++)
	{
		pointLabel = -1;
		addCoord((Math.random()+0.25)*0.4*width,(Math.random()+1.25)*0.4*height);
		pointLabel = 1;
		addCoord((Math.random()+1.25)*0.4*width,(Math.random()+0.25)*0.4*height);
	}
}

function plotTest02(n)
{
	var r,theta;
	for(var i=0;i<n;i++)
	{
		r = 0.15*Math.random();
		theta = Math.random()*2*Math.PI;
		pointLabel = -1;
		addCoord((r*Math.sin(theta)+0.5)*width,(r*Math.cos(theta)+0.5)*height);
		r = 0.25+0.15*Math.random();
		theta = Math.random()*2*Math.PI;
		pointLabel = 1;
		addCoord((r*Math.sin(theta)+0.5)*width,(r*Math.cos(theta)+0.5)*height);
	}
}


function arr2(dimx,dimy)
{
	var arr = new Array(dimx);
	for(var i=0;i<dimx;i++) arr[i] = new Array(dimy);

	return arr;
}

