var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;


var compLs=[], comp;

for(var k in AdobeAn.compositions){
    compLs.push({
        id:k,
        comp:AdobeAn.compositions[k]
    })
}

if(compLs[0]){
    comp = compLs[0].comp;
}

if (!comp) {
    throw "未找到组件"
}

var images = comp.getImages();
var ss = comp.getSpriteSheet();
var lib = comp.getLibrary();


var $doc = $(document);
var lastCanvasSizeWhenResize ;
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


$(function(){
    var txlist = ["加载中···","加载中··","加载中·","加载中"];

    $loading = $("<div class='loading'><span></span></div>");
    $loadingspan = $loading.find("span").html(txlist[0]);
    $("body").append($loading);

    var txIndex = 0;
    setInterval(function(){
        $loadingspan.html(txlist[txIndex%txlist.length])
        txIndex++;
    },1000)
});





function handleComplete(evt) {
    $(".loading").addClass("lhide");
    setTimeout(function(){$(".loading").remove();},1000)
    //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
    var queue = evt.target;
    var ssMetadata = lib.ssMetadata;
    for(i=0; i<ssMetadata.length; i++) {
        ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
    }
    exportRoot = new lib.greatYear();
    stage = new createjs.Stage(canvas);
    stage.addChild(exportRoot);
    createjs.Touch.enable(stage);

    //Registers the "tick" event listener.
    fnStartAnimation = function() {
        // createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener("tick", function(){
            stage.update();
        });
    }


    window.canvasFollower = $("#canvasFollower");


    //Code to support hidpi screens and responsive scaling.
    function makeResponsive(isResp, respDim, isScale, scaleType) {
        var lastW, lastH, lastS=1;
        var times=30;
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        function resizeCanvas() {
            //舞台尺寸
            var w = lib.properties.width;
            var h = lib.properties.height;

            //浏览器尺寸
            var iw = window.innerWidth;
            var ih =window.innerHeight;

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
                } else if(!isScale) {
                    if(iw<w || ih<h)
                        sRatio = Math.min(xRatio, yRatio);
                } else if(scaleType==1) {
                    sRatio = Math.min(xRatio, yRatio);
                } else if(scaleType==2) {
                    sRatio = Math.max(xRatio, yRatio);
                }
            }

            var offsetX,offsetY,cvh,cvw;

            //高瘦
            if(false || iw/ih<w/h){
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


            var size = {
                width:cvw,
                height:cvh,
                top:offsetY,
                left:offsetX,
                lengthRatio:cvw/w,
                stageScale:stScale
            }

            lastCanvasSizeWhenResize = size;
            canvasFollower.css(size);
            $doc.trigger("resize",size);
        }
    }
    //makeResponsive(1,'both',1,2);
    // makeResponsive(1,'both',1,1);
    // makeResponsive(0,'both',0,1);

    makeResponsive(0,'both',0,1);
    fnStartAnimation();

    //enableTouchSlide();
}


var startUpPromiseResolve;
var startUpPromise = new Promise(function(resolve){
    startUpPromiseResolve = resolve;
})


//在fla舞台中的组件里面调用
function enableTouchSlide(){
    var
        w = lib.properties.width,
        h = lib.properties.height,
        lockY,
        dy
    ;

    var main = _.get(stage,"children.0");

    //舞台上的第一层组件的个数
    var pages = _.filter(this.children,function(el){return el.name!="startMc"});

    $.get("./content.html", getAjaxContentHandler);

    function getAjaxContentHandler(textContent){
        window.pages = pages;

        var $body = $("body");

        var pmg = new Class_Pagemgr({
            index:0,
            pageList:pages,
            pwidth:w,
            pheight:h,
            canvasShadow:canvasFollower,
            textContent:textContent,
            initPageHandler:function(pglist,tx){
                return;
                var m = this;
                m.eachShadow(function(pg,i){
                    if(i==1) {
                        pg.timeline = new TimelineLite();
                        pg.timeline.add(TweenMax.from($(".logo",pg),0.8,{alpha:0, y:-50}))
                        pg.timeline.add(TweenMax.from($(".text",pg),0.8,{alpha:0, y:-50,}), "-=0.8")
                        pg.timeline.stop();
                    }
                })
            },
            indexChangeHandler:function(i){
                $body.attr("page-index",i);
                $body.attr("is-page-eof",i == this.list.length - 1  )
            }
        })
        pmg.startUp();

        $doc.trigger("resize",lastCanvasSizeWhenResize);


        window.pmg = pmg;

        startUpPromiseResolve(pmg)

        var doc = $doc;
        var pressed = false;
        doc.on("tapstart",function(e){
            if(!$(e.target).is(".sqcode")){
                e.stopPropagation();
                e.preventDefault();
            }
            pressed = true;

            var pt = _.get(e,"originalEvent.touches.0")||e;
            lockY = pt.clientY;
            pmg.recodePosition();
        })

        var lastMovePoint;
        doc.on("tapmove",function(e){
            if(!pressed)    return;

            e.stopPropagation();
            e.preventDefault();

            var pt = _.get(e,"originalEvent.touches.0")||e;
            lastMovePoint = pt;
            dy = pt.clientY - lockY;
            pmg.moveSomeValue(dy);
        })

        doc.on("tapend",function(e){
            if(!pressed)    return;
            pressed = false;

            e.stopPropagation();
            e.preventDefault();

            var pt = _.get(e,"originalEvent.touches.0",lastMovePoint);
            dy = pt.clientY - lockY;
            if(Math.abs(dy)<=88) {
                pmg.backCurrentIndex();
                return;
            }

            if(dy<0) {
                pmg.next();
            }else{
                pmg.prev();
            }
        })
    }


    //声音控制相关代码
    $("body")
        .append("<div class='musicIcon spining'>" +
            "<img src='./images/musicIcon.svg'>" +
            '<audio class="musicCtr" loop src="./images/music.mp3" preload></audio>' +
            "</div>"
        )
        .delegate(".musicIcon","tap",
            function(e){
                e.stopPropagation();
                var $self = $(this);
                $self.toggleClass("spining");
                var mu = $(".musicCtr")[0];
                if($self.is(".spining")) {
                    mu.play();
                }else{
                    mu.pause();
                }
            }
        )
        .append("<div class='iconArrowUp'></div>")
    ;


    //微信配置，使播放音频
    setTimeout(function(){
        $(".musicCtr")[0].play();
        wechatAbout(function(){
            $(".musicCtr")[0].play();
        })
    })
}

function codeAnimate(){
    startUpPromise.then(function(pmg){
        pmg.codeAnimate();
    })
}


function drawChartIframe(iframe, current, url){
    iframe = iframe[0] || iframe;
    if(iframe.contentWindow){
        iframe.contentWindow.draw();
    }
}


function clearChartIframe(iframe){
    iframe = iframe[0] || iframe;
    if(iframe.contentWindow && iframe.contentWindow.clear){
        iframe.contentWindow.clear();
    }
}


function setIframeSrc(iframe, i, src){
    iframe = iframe[0] || iframe;
    iframe.src = src;
}

function initSlider(el, i, src){
    var mySwiper = new Swiper (el, {
        loop: true, // 循环模式选项
        autoplay: {
            delay: 3000,
            stopOnLastSlide: false,
            disableOnInteraction: true,
        }
    })
}




function wechatAbout(readyCallback){

    //分享标题
    var title = "春风行动邀请函";
    //分享描述
    var desc = "2019年2月18日（正月十四）";
    //分享图片完整网址
    var imgUrl='https://www.211zph.com/h5/zhaopin2019-10/assets/page-thumb.png';
    var link = window.location.href;
    $.ajax({
        url:'/mobile/jsapiSignature.do',
        method:'POST',
        data:{
            url: encodeURIComponent( link ),
        },
        dataType:'json',
        success:function( data ){
            wxShareConfig( data );
        }
    });
    function wxShareConfig( option ){
        wx.config({
            debug: false,
            appId: option.appid,
            timestamp: option.timestamp,
            nonceStr: option.noncestr,
            signature: option.signature,
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'addContact',
                'profile'
            ]
        });
        wx.ready(function(){

            readyCallback(wx);

            wx.onMenuShareTimeline({
                title: title, // 分享标题
                link: link, // 分享链接
                imgUrl: imgUrl, // 分享图标
                success: function () {
                    //alert("ok");
                },
                cancel: function () {
                    //alert("cancel");
                }
            });
            wx.onMenuShareAppMessage({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: link, // 分享链接
                imgUrl:imgUrl, // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () {
                    //alert("okapp");
                },
                cancel: function () {
                    //alert("cancelapp");
                }
            });
            wx.onMenuShareQQ({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: link, // 分享链接
                imgUrl: imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
            wx.onMenuShareWeibo({
                title: title, // 分享标题
                desc:desc, // 分享描述
                link: link, // 分享链接
                imgUrl:imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
            wx.onMenuShareQZone({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link:link, // 分享链接
                imgUrl: imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                }
            });
        });
    }

}