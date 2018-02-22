var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;
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
    var txlist = ["祝福加载中···","祝福加载中··","祝福加载中·","祝福加载中"];

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


var Class_Pagemgr = (function(config){
    var Pagemgr;

    var def = {
        index:0,
        pageList:[],
        canvasShadow:"",
        textContent:"",
        initPageHandler:$.noop,
        indexChangeHandler:$.noop,
    }

    Pagemgr = function(config){this.init(config) }
    Pagemgr . prototype = {
        init:function(config){
            var m = this;
            m.sett = _.merge({},def,config);
            m.list = m.sett.pageList;

            m._index = -1;
            m._lastIndex = -1;
            m.pw = m.sett.pwidth;
            m.ph = m.sett.pheight;

            m._initCanvasShadow();

            m.firstPage = m.list[0];
            m.offset = {y:0}
        },

        startUp:function(){
            var m = this;
            $doc.on("resize",function(e,size){
                m.lengthRatio = size.lengthRatio;
                m.to(m._index);
                m.eachShadow(function(pageshadow){
                    //pageshadow.attr("scale",size.stageScale);
                    pageshadow.find("[offset-top]").each(function(i,el){
                        var $el = $(el);
                        $el.css({
                            top:$el.attr("offset-top") * size.stageScale
                        })
                    })

                    var yingzhang = pageshadow.find(".toParent").appendTo(pageshadow);


                    var scale = size.stageScale;
                    yingzhang.css({
                        right:5.0 * scale + "em",
                        bottom:2.8 * scale + "em"
                    })
                })
            })
            m.index(m.sett.index);
        },

        _initCanvasShadow:function(){
            var m = this;
            var cs = m.sett.canvasShadow;
            var $scroll = $("<div class='scroll'></div>").appendTo(cs);
            m.$scroll = $scroll;


            m.each(function(page,i){
                $scroll.append($("<div></div>",{index:i,class:"pageShadow ps"+i}))
            })

            m.pageShadowList = [];
            var tx = $(m.sett.textContent).find(">*")
            $(".pageShadow",$scroll).each(function(i,el){
                var $el = $(el);

                tx.eq(i).appendTo($el);
                m.pageShadowList.push($el);


                var res = _.sortBy($el.find("[gs-para]").toArray(),function(el){
                    return el.getAttribute("gs-sort-index")*1;
                })

                var tl = $el.timeline = new TimelineLite();
                res.forEach(function(el,i){
                    var method = el.getAttribute("gs-method") || "from";
                    var para = el.getAttribute("gs-para");
                    para = para.replace(/([^{}:,\s]+)?\:/g,function(all,cap1){return "\""+cap1+"\":"});
                    para = JSON.parse(para);
                    var dura = el.getAttribute("gs-dura") || 1;
                    var timeOffset = el.getAttribute("gs-time-offset");
                    if(timeOffset===undefined) {
                        tl.add(TweenMax[method](el,dura,para))
                    }else{
                        tl.add(TweenMax[method](el,dura,para),timeOffset)
                    }
                })
                tl.stop();
            });




            m.sett.initPageHandler.call(m,m.pageShadowList,m.sett.textContent);

            $doc.on("resize",function(e,size){
                m.eachShadow(function(el,i){
                    el.css({
                        width:size.width,
                        height:size.height
                    });
                })
            })
        },


        //移动到特定的位置
        moveToValue:function(length){
            var m = this;
            m.list.forEach(function(page,index){
                page.x = 0;
                page.y = index * m.ph + length ;
                m.$scroll.css({
                    top:length * m.lengthRatio
                })
            })
        },

        //移动一些距离
        moveSomeValue:function(lengthOffset){
            var m = this;
            m.offset.y+= lengthOffset;
            pmg.each(function(pg,index){
                pg.y= pg.recY + lengthOffset;
            });
            m.$scroll.css({top:m.$scroll.recY + lengthOffset* m.lengthRatio })
        },


        //记录当前位置//用来在移动一些位置的时候使用
        recodePosition:function(){
            var m = this;
            m.$scroll.recY = parseInt(m.$scroll.css("top"))
            m.each(function(pg,index){
                pg.recY=pg.y;
            })
        },


        each:function(step){
            var m = this;
            m.list.forEach(step)
        },

        eachShadow:function(step){
            var m = this;
            m.pageShadowList.forEach(step);
        },


        index:function(index){
            var m = this;
            if(index==undefined) {
                return m._index;
            }

            if(index<0 || index>m.list.length - 1) {
                return;
            }

            m._lastIndex = m._index;
            m._index = index;

            m.sett.indexChangeHandler.call(m,index);

            TweenLite.killTweensOf(m.offset,true);
            m.offset.y = m.firstPage.y - m.ph/2;

            m.each(function(pg,i){
                if(i!=index) {
                    pg.gotoAndStop(1);
                    m.resetPageShadowTimeline(i);
                }else{
                    if(m._lastIndex != m._index) {
                        pg.gotoAndPlay(1);
                    }
                }
            });

            m.to(index);
        },

        to:function(_index){
            var m = this;
            //m.moveToValue(m.offset.y);
            m.offset.y = m.firstPage.y;
            TweenLite.to(m.offset,0.4,{
                y:-_index*m.ph,
                onUpdate:function(){
                    m.moveToValue(m.offset.y);
                }
            })
        },

        //从新拖动的地方，回弹到当前索引对齐的位置
        backCurrentIndex: function(){
            var m = this;
            m.to(m.index());
        },

        next:function(){
            var m = this;
            if(m.index()>=m.list.length-1){
                m.index(m.list.length-1);
                return;
            }
            m.index(m.index() + 1 );
        },

        prev:function(){
            var m = this;
            if(m.index()<1){
                m.index(0);
                return;
            }
            m.index(m.index() - 1 );
        },


        getPageShadowTimeline:function(index){
            var m = this;
            if(index === undefined) {
                index = m._index;
            }
            return _.get(m,"pageShadowList." + index + ".timeline");
        },

        playPageShadowTimeline:function(index){
            var m = this;
            var tl = m.getPageShadowTimeline(index);
            if(tl) {
                tl.restart();
            }
        },
        resetPageShadowTimeline:function(index){
            var m = this;
            var tl = m.getPageShadowTimeline(index);
            if(tl) {
                tl.restart();
                tl.pause();
            }
        },


        codeAnimate:function(){
            var m = this;
            m.playPageShadowTimeline();
        }

    };

    return Pagemgr;
})()

function enableTouchSlide(){
    var
        w = lib.properties.width,
        h = lib.properties.height,
        lockY,
        dy
    ;

    var main = _.get(stage,"children.0");
    var pages = _.filter(this.children,function(el){return el.name!="startMc"});

    $.get("./content.html",handler);

    function handler(textContent){
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

    setTimeout(function(){
        $(".musicCtr")[0].play();
        wx.config({
            // 配置信息, 即使不正确也能使用 wx.ready
            debug: false,
            appId: '',
            timestamp: 1,
            nonceStr: '',
            signature: '',
            jsApiList: []
        });



        wx.ready(function() {
            $(".musicCtr")[0].play();

        });
    })
}

function codeAnimate(){
    pmg.codeAnimate();
}