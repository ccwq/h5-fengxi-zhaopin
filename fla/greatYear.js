(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib.主背景 = function() {
	this.initialize(img.主背景);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,414,736);// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.主背景_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 图层 1
	this.instance = new lib.主背景();
	this.instance.parent = this;
	this.instance.setTransform(0,0,1,0.965);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.主背景_1, new cjs.Rectangle(0,0,414,710), null);


(lib.启动器 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.name="startMc";
		enableTouchSlide.call(this.parent);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// 图层 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#0066CC").s().p("AvYLaIAA2zIexAAIAAWzg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.启动器, new cjs.Rectangle(-98.5,-73,197,146), null);


(lib.pg1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// 图层_1
	this.instance = new lib.主背景_1();
	this.instance.parent = this;
	this.instance.setTransform(0,-13,1,1,0,0,0,0,-13);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = getMCSymbolPrototype(lib.pg1, new cjs.Rectangle(0,0,414,710), null);


// stage content:
(lib.greatYear = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// 4
	this.instance = new lib.主背景_1();
	this.instance.parent = this;
	this.instance.setTransform(1818.5,862.3,1,1,0,0,0,0,-13);

	this.instance_1 = new lib.主背景_1();
	this.instance_1.parent = this;
	this.instance_1.setTransform(1226.4,862.3,1,1,0,0,0,0,-13);

	this.instance_2 = new lib.主背景_1();
	this.instance_2.parent = this;
	this.instance_2.setTransform(641.1,862.3,1,1,0,0,0,0,-13);

	this.instance_3 = new lib.主背景_1();
	this.instance_3.parent = this;
	this.instance_3.setTransform(2931.8,-13,1,1,0,0,0,0,-13);

	this.instance_4 = new lib.主背景_1();
	this.instance_4.parent = this;
	this.instance_4.setTransform(2358.7,-13,1,1,0,0,0,0,-13);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	// 3
	this.instance_5 = new lib.主背景_1();
	this.instance_5.parent = this;
	this.instance_5.setTransform(1818.5,-13,1,1,0,0,0,0,-13);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(1));

	// 2
	this.instance_6 = new lib.主背景_1();
	this.instance_6.parent = this;
	this.instance_6.setTransform(1226.4,-13,1,1,0,0,0,0,-13);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(1));

	// 1
	this.instance_7 = new lib.pg1();
	this.instance_7.parent = this;
	this.instance_7.setTransform(641.1,-6.5,1,1,0,0,0,0,-6.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(1));

	// startup
	this.instance_8 = new lib.启动器();
	this.instance_8.parent = this;
	this.instance_8.setTransform(98.5,-115);

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(207,167,3345.8,1773.4);
// library properties:
lib.properties = {
	id: '1CC7DBE24B030841BB8D6B97021A3168',
	width: 414,
	height: 710,
	fps: 60,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/主背景_.png", id:"主背景"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['1CC7DBE24B030841BB8D6B97021A3168'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;