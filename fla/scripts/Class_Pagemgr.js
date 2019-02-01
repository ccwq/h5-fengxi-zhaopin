var EaseOptions = {
    elastic:Elastic.easeOut.config(1, 0.3),
    default:Power3.easeOut,
    power:Power4.easeOut,
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


        /**
         * 为每个fl页初始化盖印
         * @private
         */
        _initCanvasShadow:function(){
            var m = this;
            var cs = m.sett.canvasShadow;
            var $scroll = $("<div class='scroll'></div>").appendTo(cs);
            m.$scroll = $scroll;
            m.each(function(page,i){
                $scroll.append($("<div></div>",{index:i,class:"pageShadow ps"+i}));
                var childrenLs = page.children.filter(function(el){
                    return el.opt;
                })

                if (childrenLs) {
                    page.inTimeLine = new TimelineLite();
                    page.twLs = [];
                    childrenLs.forEach(function(el){
                        var para = el.opt.params;
                        if (!para) {
                            return;
                        }

                        if(EaseOptions[para.ease]){
                            para.ease = EaseOptions[para.ease];
                        }else{
                            para.ease = EaseOptions.default;
                        }

                        var method = el.opt.method || "from";
                        var dura =  el.opt.dura || 1;
                        var timeOffset = el.opt.timeOffset;

                        if(timeOffset===undefined) {
                            // page.inTimeLine.add(TweenMax[method](el,dura,para))
                            page.twLs.push([TweenMax[method](el,dura,para)])
                            // page.twLs.push([TweenMax["fromTo"](el,dura,para, {y:250, onUpdate(){
                            //     console.log(el.y)
                            //     }})])
                        }else {
                            // page.inTimeLine.add([TweenMax[method](el, dura, para), timeOffset])
                            page.twLs.push( [TweenMax[method](el,dura,para), timeOffset])
                        }
                    })
                    // page.inTimeLine.stop();
                }
            })

            m.pageShadowList = [];
            var tx = $(m.sett.textContent).find(">*")
            $(".pageShadow",$scroll).each(function(i,el){
                var $el = $(el);
                var _$el = $el;

                var page = m.list[i];

                tx.eq(i).appendTo($el);
                m.pageShadowList.push($el);

                var res = _.sortBy($el.find("[gs-para], .gs-text-effect, .imgGridCont").toArray(),function(el){
                    return el.getAttribute("gs-sort-index")*1;
                })

                var tl = $el.timeline = new TimelineLite();
                if (page.inTimeLine) {
                    //tl.add(page.inTimeLine)
                    // tl.pageInTimeLine = page.inTimeLine;
                }

                if (page.twLs) {
                    page.twLs.forEach(function(el,i){
                        tl.add("index"+i, "+=0");
                        tl.add.apply(tl, el)
                    })
                }

                res.forEach(function(el,i){
                    var $el = $(el);

                    if($el.is(".gs-text-effect")) {
                        $el.find("b").each(function () {
                            tl.add(TweenMax.from(this, 0.6, {y: "+=16", alpha: 0}), "-=0.55")
                        });
                    }else if($el.is(".imgGridCont")){
                        $el.find(">span").each(function () {
                            tl.add(TweenMax.from(this, 1.6, {scale:0.6, y:"+=10", alpha: 0, ease:EaseOptions.elastic}), "-=1.25")
                        });
                    }else{
                        var method = el.getAttribute("gs-method") || "from";
                        var para = el.getAttribute("gs-para");
                        para = para.replace(/([^{}:,\s]+)?\:/g,function(all,cap1){return "\""+cap1+"\":"});
                        try{
                            para = JSON.parse(para);
                        }catch (e) {
                            console.error("json解析失败");
                            console.log(para);
                        }
                        if(EaseOptions[para.ease]){
                            para.ease = EaseOptions[para.ease];
                        }else{
                            para.ease = EaseOptions.default;
                        }
                        var dura = el.getAttribute("gs-dura") || 1;
                        var timeOffset = el.getAttribute("gs-time-offset") || "+=0";


                        if (para.addClass || para.rmClass) {
                            tl.add(function () {
                                var target;
                                if (!para.target) {
                                    target = $el;
                                } else {
                                    target = $(para.target, _$el)
                                }
                                if (para.addClass) {
                                    target.addClass(para.addClass);
                                }

                                if (para.rmClass) {
                                    target.removeClass(para.rmClass);
                                }
                            }, timeOffset)
                        }else if(para.call){

                            var target;
                            if (!para.target) {
                                target = $el;
                            } else {
                                target = $(para.target, _$el)
                            }
                            var args = para.arguments || [];

                            args.unshift($el);
                            args.unshift(target);

                            tl.add(
                                $.proxy(function(name, args){
                                    window[name].apply(null, args);
                                }, null, para.call, args)
                            )
                        }else{
                            var tar;
                            if (para.tweenChilds) {
                                tar = $(">*, .tween-child", el).toArray();
                            }else{
                                tar = [el];
                            }
                            tar.forEach(function(el){
                                tl.add(TweenMax[method](el,dura,para),timeOffset);
                            })
                        }
                    }
                });
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
                    pg.gotoAndStop(0);
                    m.resetPageShadowTimeline(i);
                }else{
                    if(m._lastIndex != m._index) {
                        pg.gotoAndPlay(0);

                        //单帧的，直接调用动画
                        if (pg.totalFrames < 2) {
                            setTimeout(function(){
                                m.codeAnimate(i);
                            });
                        }
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
