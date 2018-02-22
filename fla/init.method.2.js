var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;
function init() {
    canvas = document.getElementById("canvas");
    anim_container = document.getElementById("animation_container");
    dom_overlay_container = document.getElementById("dom_overlay_container");
    images = images||{};
    ss = ss||{};
    var loader = new createjs.LoadQueue(false);
    loader.addEventListener("fileload", handleFileLoad);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt) {
    if (evt.item.type == "image") { images[evt.item.id] = evt.result; }
}
function handleComplete(evt) {
    //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
    var queue = evt.target;
    var ssMetadata = lib.ssMetadata;
    for(i=0; i<ssMetadata.length; i++) {
        ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
    }
    exportRoot = new lib.greatYear();
    stage = new createjs.Stage(canvas);
    stage.addChild(exportRoot);
    //Registers the "tick" event listener.
    fnStartAnimation = function() {
        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);
    }


    //Code to support hidpi screens and responsive scaling.
    function makeResponsive(isResp, respDim, isScale, scaleType) {
        var lastW, lastH, lastS=1;
        var times=30;
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        function resizeCanvas() {
            //舞台尺寸
            var
                w = lib.properties.width,
                h = lib.properties.height
            ;

            //浏览器尺寸
            var
                iw = window.innerWidth,
                ih=window.innerHeight
            ;

            //比率
            var
                //设备像素比率
                pRatio = window.devicePixelRatio || 1,

                //浏览器尺寸与舞台尺寸比比例
                xRatio=iw/w,
                yRatio=ih/h,
                sRatio=1,
                aRatio=xRatio,
                whRatio=w/h
            ;

            if(isResp) {
                if((respDim=='width' && lastW==iw ) || (respDim=='height'&&lastH==ih)) {
                    sRatio = lastS;
                }
                else if(!isScale) {
                    if(iw<w || ih<h)
                        sRatio = Math.min(xRatio, yRatio);
                }
                else if(scaleType==1) {
                    sRatio = Math.min(xRatio, yRatio);
                }
                else if(scaleType==2) {
                    sRatio = Math.max(xRatio, yRatio);
                }
            }

            var offsetX,offsetY,cvh,cvw;

            //高瘦
            if(iw/ih<w/h){
                aRatio=xRatio;



                cvw = iw;
                cvh = iw / whRatio;

                offsetY = (ih - cvh)/2;
                offsetX = 0;

                //矮胖
            }else{
                aRatio=yRatio;


                cvh = ih;
                cvw = ih * whRatio;

                offsetY = 0;
                offsetX = (iw - cvw)/2;
            }


            dom_overlay_container.style.width = anim_container.style.width =  iw+'px';
            anim_container.style.height = dom_overlay_container.style.height = ih+'px';

            canvas.width = cvw;
            canvas.height = cvh;
            canvas.style.width      =       cvw + "px";
            canvas.style.height     =       cvh + "px";
            canvas.style.top      =       offsetY + "px";
            canvas.style.left     =       offsetX + "px";


            var stScale = cvh/h;

            stage.scaleX = stScale;
            stage.scaleY = stScale;

            lastW = iw;
            lastH = ih;
            lastS = sRatio;
        }
    }
    //makeResponsive(1,'both',1,2);
    // makeResponsive(1,'both',1,1);
    // makeResponsive(0,'both',0,1);

    makeResponsive(0,'both',0,1);
    fnStartAnimation();
}