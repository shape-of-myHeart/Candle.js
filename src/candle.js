const Chart = (() => {
    const df = v => v;
    const init = {
        // type 에 의존하는 속성값들
        // - renderItem (renderForTypes 변수 참조.)
        // - 항상최솟값을 같는 key 값을 반환하는 함수. (getMinForTypes 참조)
        // - 항상최대값을 같는 key 값을 반환하는 함수. (getMaxForTypes 참조)
        // - style의 일부 속성들

        globalStyle: {
            backgroundColor: 'rgb(245, 250, 254)',

            fontFamily: `맑은고딕`,
            labelColor: '#5d5d5d',

            // yLabelAlign
            // : right
            // : left
            yLabelShow: true,
            yLabelAlign: "right",
            yLabelWidth: 100,

            yAxisShow: true,
            yAxisColor: '#999',

            // xLabelAlign
            // : top
            // : bottom
            xLabelShow: true,
            xLabelAlign: "bottom",
            xLabelHeight: 30,

            xAxisShow: true,
            xAxisColor: '#999',

            xSplitAxisColor: 'rgb(210, 215, 219)',
            xSplitAxisDotted: false,

            ySplitAxisColor: 'rgb(210, 215, 219)',
            ySplitAxisDotted: [1, 2],

            tooltipTextColor: '#333',
            tooltipBackgroundColor: 'transparent',
            tooltipXAlign: 'left',
            tooltipYAlign: 'top',
            tooltipMinWidth: 100,
            tooltipFontSize: 14,
            tooltipXMargin: 5,
            tooltipYMargin: 5,
            tooltipXPadding: 20,
            tooltipYPadding: 5,
            tooltipCandleThick: 5,
            tooltipLetterSpace: 10,

            focusXAxisColor: 'rgba(105, 100, 104, 0.1)',
            focusXBackgroundColor: '#555',
            focusXLabelColor: '#fff',
            focusXAxisExtend: true,

            focusYAxisColor: '#888',
            focusYBackgroundColor: '#555',
            focusYLabelColor: '#fff',
            minSpan: 8,
            lastIndexYLabelColor: '#333'
        },

        layerType: 'candle', // candle , line
        layerStyle: {
            candle: {
                incrementItemColor: 'rgb(252,4,4)',
                decrementItemColor: 'rgb(0,168,0)',
                decrementItemFill: true,
                incrementItemFill: true,
                renderMinMaxInViewport: false,
                renderLastIndex: true,
            },
            line: {
                itemColor: '#000000',
                horizon: null,
                renderMinMaxInViewport: false,
                renderLastIndex: true,
            },
            stick: {
                itemColor: '#000000',
                itemFill: true,
                linear: false,
                baseLine: null,
                renderMinMaxInViewport: false,
                renderLastIndex: true,
            }
        },

        // 라벨속성에 따라 값이 맞춰진다.
        grid: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },

        padding: {
            top: 30,
            right: 0,
            bottom: 30,
            left: 0
        },

        dateFormatter: "MM-dd HH:mm"
    };
    // theme 은 globalStyle layerStyle 을 지정 가능
    const themes = {
        white: {
            globalStyle: {},
            layerStyle: {
                candle: {},
                line: {}
            }
        },
        dark: {
            globalStyle: {
                backgroundColor: '#151515',
                labelColor: '#aaa',
                xSplitAxisColor: '#333',
                ySplitAxisColor: '#333',
                tooltipTextColor: '#fff',
                focusXAxisColor: 'rgba(0, 175, 255, 0.2)',
                focusXBackgroundColor: 'rgb(10,98,138)',
                focusYBackgroundColor: '#333',
                tooltipBackgroundColor: 'rgba(0,0,0,0.25)',
                lastIndexYLabelColor: '#fff'
            },
            layerStyle: {
                candle: {
                    incrementItemColor: '#14b143',
                    decrementItemColor: '#ef232a',
                },
                line: {
                    itemColor: '#999'
                },
                stick: {
                    itemColor: '#999'
                }
            }
        }
    };

    const tooltipForTypes = {
        candle: ({
                     title,
                     data,
                     formatter = df
                 }) => data === null || data === undefined ? null : [`${title.open || 'Open'} ${formatter(data.open)}`, `${title.close || 'Close'} ${formatter(data.close)}`, `${title.low || 'Low'} ${formatter(data.low)}`, `${title.high || 'High'} ${formatter(data.high)}`],
        line: ({
                   title,
                   data,
                   formatter = df,
               }) => data === null || data === undefined ? null : `${title} ${formatter(data)}`,
        stick: ({
                    title,
                    data,
                    formatter = df,
                }) => data === null || data === undefined ? null : `${title} ${formatter(data)}`,
    };
    const getMinForTypes = {
        candle: item => item.low,
        line: item => item,
        stick: item => item
    };
    const getMaxForTypes = {
        candle: item => item.high,
        line: item => item,
        stick: item => item
    };
    const getItemColorForTypes = (layer, index) => {
        if (layer.type === 'candle') {
            return layer.data[index].close > layer.data[index].open ?
                layer.style.incrementItemColor :
                layer.style.decrementItemColor;
        }
        else if (layer.type === 'line') {
            return layer.style.itemColor;
        }

        else if (layer.type === 'stick') {
            return typeof layer.style.itemColor === 'function' ?
                layer.style.itemColor(index) : layer.style.itemColor;
        }
    };

    // 유틸 메소드
    const map = (n, a, b, c, d) => ((n - a) / (b - a)) * (d - c) + c;
    const f = Math.floor;
    const overwrite = (target, base) => {
        if (typeof target !== 'object' || target === null) target = {};

        for (let key in base) {
            if (target[key] === undefined) target[key] = base[key];
        }

        return target;
    };
    const applyDateFormatter = (d, f) => {
        let h;
        return f.replace(/(yyyy|yy|MM|dd|hh|mm|ss)/gi, function (ch) {
            switch (ch) {
                case "yyyy":
                    return d.getFullYear();
                case "yy":
                    return zf(d.getFullYear() % 1000, 2);
                case "MM":
                    return zf(d.getMonth() + 1, 2);
                case "dd":
                    return zf(d.getDate(), 2);
                case "HH":
                    return zf(d.getHours(), 2);
                case "hh":
                    return zf((h = d.getHours() % 12) ? h : 12, 2);
                case "mm":
                    return zf(d.getMinutes(), 2);
                case "ss":
                    return zf(d.getSeconds(), 2);
                default:
                    return ch;
            }
        });
    };
    const zf = (e, l) => {
        if (typeof e === "number") e = e.toString();
        if (typeof e === "string") {
            let s = '',
                i = 0;
            while (i++ < l - e.length) {
                s += "0";
            }
            return s + e;
        }
    };

    const $keys = [];

    // private
    const $methodByKey = {};
    const $getMethodByKey = (key, name) => $methodByKey[key][name];

    class Chart {
        constructor(domId) {
            let wrapper = document.getElementById(domId);
            if (wrapper === null) return;

            let $key;

            while ($keys.indexOf($key = Math.random() + Math.random() + Math.random()) !== -1) {
            }
            let $method = $methodByKey[$key] = {};

            let theme;
            const initLayerStyle = {};

            /* wrapper style settings */
            wrapper.style.position = 'relative';

            let canvasStack = [];
            // 캔버스 생성, wrapper 에 append 후 object로 dom 객체와 context 반환.
            const makeCanvas = (zIndex = 0) => {
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');

                canvas.style.position = 'absolute';
                canvas.style.top = 0;
                canvas.style.left = 0;

                canvas.style.zIndex = zIndex;

                canvas.width = wrapper.clientWidth;
                canvas.height = wrapper.clientHeight;
                wrapper.appendChild(canvas);

                context.translate(0.5, 0.5);
                canvasStack.push(canvas);

                return {
                    canvas,
                    context
                };
            };

            /* Variable 정의 */
            let layers = {};
            let viewport = [];
            /* 0 : start / 1 : end */
            let timeline = [];
            let $timeline = [];

            let grid = overwrite(null, init.grid),
                padding = overwrite(null, init.padding),
                globalStyle = overwrite(null, init.globalStyle),
                dateFormatter = init.dateFormatter;

            let min;
            let max;
            let mainLayer;

            // X,Y 축 캔버스 Context 정의
            // 라벨이 업데이트 될 때.
            // - setViewport 로 뷰포트가 업데이트 되었을 경우.
            // - addLayer 로 layer의 속성이 변경 되었을 경우.
            // - setTimeline 로 x축 값이 변경 되었을 경우.
            const yLabelCtx = makeCanvas().context;
            const xLabelCtx = makeCanvas().context;

            const supportCtx = makeCanvas().context;
            const floatCtx = makeCanvas(1).context;
            const tooltipCtx = makeCanvas(2).context;

            // 레이어 메소드
            const addLayer = (name, {
                type,
                data,
                show,
                style
            }) => { /* 라이브러리에 관련된 객체셋팅. */
                if (typeof name !== 'string' || layers[name] !== undefined) return;

                let layer = makeCanvas();
                layer.show = show !== undefined ? show : true;

                layer.type = type || init.layerType;
                layer.data = data || [];
                layer.style = overwrite(style, initLayerStyle[layer.type]);

                layers[name] = layer;

                renderAll();
            };
            const setLayer = (name, {
                type,
                show,
                data,
                style
            }) => {
                let layer = layers[name];
                layer.show = show !== undefined ? show : layer.show;

                // type 변경시 type에 영향이 가는 레이어속성들을 새로설정.
                const baseStyle =
                    (type !== undefined && type !== layer.type) ?
                        initLayerStyle[type] :
                        layer.style;

                layer.type = type || layer.type;
                layer.data = data || layer.data;
                layer.style = overwrite(style, baseStyle);

                renderAll();
            };
            const layerMap = (func, formatter) => {
                let rObj = [];

                for (let name in layers) {
                    let r = func(layers[name], name);

                    if (formatter) rObj[formatter(name)] = r;
                    else rObj.push(r);
                }

                return rObj;
            };

            const _setViewport = (s, e) => {
                if (s < 0 || e < 0 || (viewport[0] === s && viewport[1] === e)) return;

                let max = Math.max(s, e), min = Math.min(s, e);

                viewport[0] = min;
                viewport[1] = max;

                renderAll();
            };

            // 뷰포트 메소드
            const setViewport = (s, e) => {
                if (s < 0 || e < 0 || (viewport[0] === s && viewport[1] === e)) return;

                let max = Math.max(s, e), min = Math.min(s, e);

                if (isRoot() === true) {
                    if (max - min < globalStyle.minSpan) {
                        min = max - globalStyle.minSpan
                    }
                    $methodByKey[$key]
                        .dispatchSetViewport(min, max);
                } else {
                    let minSpan = $methodByKey[this.$rootConnect].minSpan();
                    if (max - min < minSpan) {
                        min = max - minSpan;
                    }

                    $methodByKey[this.$rootConnect]
                        .dispatchSetViewport(min, max);
                    return;
                }

                _setViewport(min, max);
            };
            const getViewport = () => ([viewport[0], viewport[1]]);

            // 타임라인 메소드
            const setTimeline = pTimeline => {
                for (let i = 0, l = pTimeline.length; i < l; i++) {
                    if (typeof pTimeline[i] !== 'string') continue;
                    pTimeline[i] = new Date(pTimeline[i]);
                }
                $timeline = timeline = pTimeline;

                $method.setTimeline();

                if (isRoot() === true) {
                    $method.dispatchSetTimeline();
                }
            };

            const setDateFormatter = f => {
                dateFormatter = f;
                renderXLabel();
            };

            // 패딩 메소드
            const setPadding = pPadding => {
                padding = overwrite(pPadding, padding);

                for (let name in layers) {
                    let layer = layers[name];
                    render(layer);
                }
            };

            // 스타일 메소드
            const setStyle = pStyle => {
                globalStyle = overwrite(pStyle, globalStyle);
                setGrid();
                updateWrapperStyle();
                renderAll();
            };
            let yLabelFormatter = f;
            const setYLabelFormatter = f => yLabelFormatter = f;

            const setGrid = () => {
                let xs = globalStyle.xLabelShow === false ? 0 : 1,
                    ys = globalStyle.yLabelShow === false ? 0 : 1;

                grid.top = globalStyle.xLabelAlign === 'top' ? globalStyle.xLabelHeight * xs : 0;
                grid.bottom = globalStyle.xLabelAlign === 'bottom' ? globalStyle.xLabelHeight * xs : 0;

                grid.left = globalStyle.yLabelAlign === 'left' ? globalStyle.yLabelWidth * ys : 0;
                grid.right = globalStyle.yLabelAlign === 'right' ? globalStyle.yLabelWidth * ys : 0;
            };

            const getTransformSize = () => ({
                tWidth: wrapper.clientWidth - grid.right - grid.left,
                tHeight: wrapper.clientHeight - grid.bottom - grid.top,
            });

            const updateMinMax = () => {
                let arr = layerMap(layer => {
                    let {
                        data,
                        type,
                        show,
                        style
                    } = layer;

                    if (show === false) return {min: Infinity, max: -Infinity};

                    let getMin = getMinForTypes[type];
                    let getMax = getMaxForTypes[type];

                    let min = Infinity,
                        max = -Infinity;

                    if (type === 'line' && style.horizon === true) {
                        return {
                            min: data[0],
                            max: data[0]
                        };
                    } else {
                        for (let i = viewport[0], l = viewport[1]; i < l; i++) {
                            if (data[i] === null || data[i] === undefined) continue;

                            let _min = getMin(data[i]);
                            let _max = getMax(data[i]);

                            if (min > _min) min = _min;
                            if (max < _max) max = _max;
                        }
                    }

                    layer.minInViewport = min;
                    layer.maxInViewport = max;

                    return {
                        min,
                        max
                    };
                });

                let _min = Infinity,
                    _max = -Infinity;

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].min < _min) _min = arr[i].min;
                    if (arr[i].max > _max) _max = arr[i].max;
                }

                min = _min;
                max = _max;
            };

            const renderXLabel = () => {
                let {
                    xLabelHeight,
                    xLabelAlign,
                    xLabelShow,
                    xAxisShow
                } = globalStyle;

                if ($timeline.length === 0) return;

                let width = wrapper.clientWidth,
                    height = wrapper.clientHeight;

                // Transform Size
                let {
                    tWidth,
                    tHeight
                } = getTransformSize();

                let itemWidth = (tWidth) / (viewport[1] - viewport[0]);

                xLabelCtx.save();
                xLabelCtx.clearRect(-10, -10, width + 10, height + 10);

                xLabelCtx.translate(grid.left, 0);

                // Xlabel Settings
                xLabelCtx.textBaseline = "middle";
                xLabelCtx.textAlign = globalStyle.yLabelAlign === 'left' ? 'right' : 'left';
                xLabelCtx.font = `12px ${globalStyle.fontFamily}`;

                let xLineY = tHeight;
                let xLineLabelY = xLabelAlign === 'top' ? (xLabelHeight / 2) : height - (xLabelHeight / 2);
                let xAxisY = xLabelAlign === 'bottom' ? xLineY : grid.top;

                if (xLabelShow !== false) {
                    xLabelCtx.strokeStyle = globalStyle.xAxisColor;
                    xLabelCtx.beginPath();
                    xLabelCtx.moveTo(0, xAxisY);
                    xLabelCtx.lineTo(tWidth, xAxisY);
                    xLabelCtx.closePath();
                    xLabelCtx.stroke();
                }

                xLabelCtx.fillStyle = globalStyle.labelColor;

                for (let i = viewport[0], l = viewport[1], s = f((viewport[1] - viewport[0]) / 5); i < l; i++) {
                    if (viewport[0] - l === -1 || (l - i) % s === 0) {
                        let xLineLabelX = f(itemWidth * 0.5);

                        if (xAxisShow !== false) {
                            if (Array.isArray(globalStyle.xSplitAxisDotted)) {
                                xLabelCtx.setLineDash(globalStyle.xSplitAxisDotted);
                            }
                            xLabelCtx.strokeStyle = globalStyle.xSplitAxisColor;
                            xLabelCtx.beginPath();
                            xLabelCtx.moveTo(xLineLabelX, grid.top);
                            xLabelCtx.lineTo(xLineLabelX, xLineY + grid.top);
                            xLabelCtx.closePath();
                            xLabelCtx.stroke();
                        }

                        if (xLabelShow !== false) {
                            xLabelCtx.strokeStyle = globalStyle.xAxisColor;
                            xLabelCtx.beginPath();
                            xLabelCtx.moveTo(xLineLabelX, xAxisY + (xLabelAlign === 'bottom' ? 5 : -5));
                            xLabelCtx.lineTo(xLineLabelX, xAxisY);
                            xLabelCtx.closePath();
                            xLabelCtx.stroke();

                            xLabelCtx.fillText(
                                applyDateFormatter($timeline[i], dateFormatter),
                                f(xLineLabelX),
                                f(xLineLabelY)
                            );
                        }
                    }
                    xLabelCtx.translate(itemWidth, 0);
                }

                xLabelCtx.restore();
            };

            const renderYLabel = () => {
                let {
                    yLabelWidth,
                    yLabelAlign,
                    yLabelShow,
                    yAxisShow
                } = globalStyle;


                let width = wrapper.clientWidth,
                    height = wrapper.clientHeight;

                // Transform Size
                let {
                    tWidth,
                    tHeight
                } = getTransformSize();

                yLabelCtx.save();
                yLabelCtx.clearRect(-10, -10, width + 10, height + 10);

                yLabelCtx.translate(0, -1);

                // Ylabel Settings
                yLabelCtx.textBaseline = "middle";
                yLabelCtx.textAlign = yLabelAlign === 'left' ? 'right' : 'left';
                yLabelCtx.font = `12px ${globalStyle.fontFamily}`;

                let yLineX = f(yLabelAlign === 'left' ? yLabelWidth : width - yLabelWidth);

                yLabelCtx.strokeStyle = globalStyle.yAxisColor;
                yLabelCtx.fillStyle = globalStyle.labelColor;

                if (yLabelShow !== false) {
                    yLabelCtx.beginPath();
                    yLabelCtx.moveTo(yLineX, grid.top);
                    yLabelCtx.lineTo(yLineX, grid.top + tHeight);
                    yLabelCtx.closePath();
                    yLabelCtx.stroke();
                }

                let split = 2;
                let increase = (max - min) / split;

                let _increase = 1;
                while (increase > 10 * _increase) {
                    _increase *= 10;
                }
                increase -= increase % _increase;
                increase = f(increase);

                let base = f(min - min % increase);

                for (let i = -10; i <= split + 10; i++) {
                    let d = base + increase * i;
                    let y = map(d, max, min, grid.top + padding.top, grid.top + tHeight - padding.bottom);
                    // let y = -map(d, min, max, 0, tHeight);

                    if (y > grid.top + tHeight) continue;
                    else if (y < grid.top) break;

                    if (yLabelShow !== false) {
                        yLabelCtx.fillText(yLabelFormatter(d), yLineX + (yLabelAlign === 'right' ? 10 : -10), y);

                        yLabelCtx.strokeStyle = globalStyle.labelColor;
                        yLabelCtx.beginPath();
                        yLabelCtx.moveTo(yLineX, y);
                        yLabelCtx.lineTo(yLineX + (yLabelAlign === 'right' ? 5 : -5), y);
                        yLabelCtx.closePath();
                        yLabelCtx.stroke();
                    }
                    if (yAxisShow !== false) {
                        yLabelCtx.save();
                        if (Array.isArray(globalStyle.ySplitAxisDotted)) {
                            yLabelCtx.setLineDash(globalStyle.ySplitAxisDotted);
                        }
                        yLabelCtx.strokeStyle = globalStyle.ySplitAxisColor;
                        yLabelCtx.beginPath();
                        yLabelCtx.moveTo(grid.left, y);
                        yLabelCtx.lineTo(tWidth + grid.left - 1, y);
                        yLabelCtx.closePath();
                        yLabelCtx.stroke();
                        yLabelCtx.restore();
                    }
                }

                yLabelCtx.restore();
            };

            let transforms = {
                candle: tHeight => v => map(v, max, min, grid.top + padding.top, grid.top + tHeight - padding.bottom),
                line: tHeight => v => map(v, max, min, grid.top + padding.top, grid.top + tHeight - padding.bottom),
                stick: tHeight => v => map(v, max, min, grid.top + padding.top, grid.top + tHeight - padding.bottom)
            };

            const renderMinMax =
                (ctx, type, itemWidth, transform, isMin, isMax, tWidth, index, data) => {
                    let max = getMaxForTypes[type](data),
                        min = getMinForTypes[type](data);

                    let t = transform(max),
                        b = transform(min);

                    ctx.strokeStyle = ctx.fillStyle = globalStyle.labelColor;
                    ctx.textBaseline = 'middle';
                    ctx.font = `13px ${globalStyle.fontFamily}`;

                    let x = f(itemWidth * 0.5);

                    let _max = yLabelFormatter(max);
                    let _min = yLabelFormatter(min);

                    let dir = -1;
                    let xw = (index - viewport[0]) * itemWidth + dir * Math.max(ctx.measureText(_max).width, ctx.measureText(_min).width) + itemWidth * 0.5 + dir * 10;

                    if (xw > tWidth || xw < 0) dir *= -1;
                    ctx.textAlign = dir === 1 ? 'left' : 'right';

                    if (isMax) {
                        ctx.beginPath();
                        ctx.moveTo(x, t - 5);
                        ctx.lineTo(x, t - 10);
                        ctx.moveTo(x, t - 10);
                        ctx.lineTo(x + dir * 5, t - 10);
                        ctx.stroke();
                        ctx.closePath();

                        ctx.fillText(_max, x + dir * 10, t - 10);
                    }
                    if (isMin) {
                        ctx.beginPath();
                        ctx.moveTo(x, b + 5);
                        ctx.lineTo(x, b + 10);
                        ctx.moveTo(x, b + 10);
                        ctx.lineTo(x + dir * 5, b + 10);
                        ctx.stroke();
                        ctx.closePath();

                        ctx.fillText(_min, x + dir * 10, b + 10);
                    }
                }
            ;
            // 레이어 타입에 따른 메소드 정의
            const renderForTypes = {
                candle: (ctx,
                         {
                             incrementItemColor,
                             decrementItemColor,
                             incrementItemFill,
                             decrementItemFill
                         },
                         itemWidth,
                         {
                             open,
                             close,
                             high,
                             low
                         },
                         transform) => {
                    let y = transform(Math.max(open, close)),
                        h = transform(Math.min(open, close)) - y,
                        t = transform(high),
                        b = transform(low);

                    ctx.strokeStyle = close > open ? incrementItemColor : decrementItemColor;
                    ctx.fillStyle = close > open ? incrementItemColor : decrementItemColor;

                    if (itemWidth <= 6  /* style.minBodyWidth */) {
                        ctx.beginPath();
                        ctx.moveTo(f(itemWidth * 0.5), f(t));
                        ctx.lineTo(f(itemWidth * 0.5), f(b));
                        ctx.closePath();
                        ctx.stroke();

                        let t1 = f(close > open ? y + h : y);

                        ctx.beginPath();
                        ctx.moveTo(f(itemWidth * 0.5), t1);
                        ctx.lineTo(1, t1);
                        ctx.closePath();
                        ctx.stroke();

                        let t2 = f(close > open ? y : y + h);

                        ctx.beginPath();
                        ctx.moveTo(f(itemWidth * 0.5), t2);
                        ctx.lineTo(itemWidth - 1, t2);
                        ctx.closePath();
                        ctx.stroke();

                        return;
                    }

                    ctx.beginPath();
                    ctx.moveTo(f(itemWidth * 0.5), f(t));
                    ctx.lineTo(f(itemWidth * 0.5), f(y));
                    ctx.closePath();
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(f(itemWidth * 0.5), f(y + h));
                    ctx.lineTo(f(itemWidth * 0.5), f(b));
                    ctx.closePath();
                    ctx.stroke();

                    if ((close > open && incrementItemFill !== false) || (close <= open && decrementItemFill !== false)) {
                        ctx.fillRect(2, f(y), f(itemWidth - 4), f(h));
                    }

                    ctx.strokeRect(2, f(y), f(itemWidth - 4), f(h));
                },
                line: (ctx,
                       {
                           itemColor
                       },
                       itemWidth,
                       data,
                       transform) => {
                    let y = transform(data);

                    ctx.fillStyle = itemColor;
                    ctx.strokeStyle = itemColor;
                    ctx.lineTo(f(itemWidth * 0.5), y);
                },
                stick: (ctx,
                        {
                            baseLine,
                            linear
                        },
                        itemWidth,
                        data,
                        transform,
                        itemColor,
                        itemFill) => {
                    let m = min;
                    let y = transform(data);
                    let g = 1;

                    if (typeof baseLine === 'number') {
                        m = baseLine;
                    }

                    ctx.strokeStyle = itemColor;
                    ctx.fillStyle = itemColor;

                    if (f(itemWidth) <= 3 || linear === true) {
                        ctx.beginPath();
                        ctx.moveTo(f(itemWidth * 0.5), f(y));
                        ctx.lineTo(f(itemWidth * 0.5), f(transform(m)));
                        ctx.closePath();
                        ctx.stroke();
                    }
                    else {
                        if (itemFill !== false) {
                            ctx.fillRect(f(g), f(y), f(itemWidth - g * 2), f(transform(m) - y));
                        }
                        ctx.strokeRect(f(g), f(y), f(itemWidth - g * 2), f(transform(m) - y));
                    }

                }
            };
            // 출력 메소드
            const render = layer => {
                let {
                    data,
                    type,
                    context,
                    style,
                    show,
                    minInViewport,
                    maxInViewport
                } = layer;


                let width = wrapper.clientWidth,
                    height = wrapper.clientHeight;

                if ($timeline.length === 0) return;

                if (isNaN(viewport[0]) === true || isNaN(viewport[1]) === true || viewport[0] === undefined || viewport[1] === undefined) {
                    setViewport(0, $timeline.length);
                }

                // 레이어 타입에 따른 메소드를 가져온다.
                let renderItem = renderForTypes[type];

                // Transform Size
                let {
                    tWidth,
                    tHeight,
                } = getTransformSize();

                let itemWidth = (tWidth) / (viewport[1] - viewport[0]);

                context.save();

                // Clear
                context.clearRect(-10, -10, width + 10, height + 10);

                if (show === false) return;

                // Translate
                context.translate(grid.left, 0);
                let transform = transforms[type](tHeight);

                context.beginPath();

                if (layer.type === 'line' && style.horizon === true) {

                    let y = transform(data[0]);
                    context.strokeStyle = style.itemColor;

                    context.moveTo(itemWidth / 2, y);
                    context.lineTo(tWidth - itemWidth / 2, y);
                    context.stroke();
                    context.closePath();
                } else {
                    for (let i = viewport[0], l = viewport[1], s = f((viewport[1] - viewport[0]) / 5); i < l; i++) {
                        if (data[i] !== null && data[i] !== undefined) {

                            let itemColor = typeof style.itemColor === 'function' ? style.itemColor(i) : style.itemColor;
                            let itemFill = typeof style.itemFill === 'function' ? style.itemFill(i) : style.itemFill;

                            renderItem(
                                context,
                                style,
                                itemWidth,
                                data[i],
                                transform,
                                itemColor,
                                itemFill
                            );
                        }
                        context.translate(itemWidth, 0);
                    }
                    context.stroke();
                    context.closePath();

                    if (style.renderMinMaxInViewport === true) {
                        let _max = 0, _min = 0;
                        for (let i = viewport[1] - 1; i >= viewport[0]; i--) {
                            context.translate(-itemWidth, 0);
                            if (_max > 0 && _min > 0) break;

                            if (data[i] !== null && data[i] !== undefined) {

                                let isMax = getMaxForTypes[type](data[i]) === maxInViewport,
                                    isMin = getMinForTypes[type](data[i]) === minInViewport;

                                if (isMax === true && _max++ > 0) continue;
                                if (isMin === true && _min++ > 0) continue;
                                else if (isMin) true;
                                else if (isMax) true;
                                else continue;
                                renderMinMax(
                                    context,
                                    type,
                                    itemWidth,
                                    transform,
                                    isMin,
                                    isMax,
                                    tWidth,
                                    i,
                                    data[i]
                                );
                            }
                        }
                    }

                }
                context.restore();
            };
            const renderAll = () => {
                updateMinMax();

                for (let name in layers) {
                    let layer = layers[name];
                    render(layer);
                }

                renderXLabel();
                renderYLabel();
                reloadTooltip();
                renderLastIndex();
            };

            const renderTooltip = (i) => {
                showTooltip(i);
            };

            const
                renderLastIndex = () => {
                    let layer = layers[mainLayer];
                    if (!mainLayer || layer.style.renderLastIndex === false) return;
                    let lastIndex = viewport[1] - 1, realPrice;

                    if (layer.type === 'candle') realPrice = layer.data[lastIndex].close;
                    else if (layer.type === 'stick') realPrice = layer.data[lastIndex];
                    else if (layer.type === 'line') realPrice = layer.data[lastIndex];

                    if (realPrice === undefined) return;

                    focusIndex({
                        ctx: supportCtx,
                        index: lastIndex,
                        realPrice,
                        focusYLabelColor: globalStyle.lastIndexYLabelColor,
                        focusYAxisColor: 'rgba(0,0,0,0)',
                        focusYBackgroundColor: getItemColorForTypes(layer, lastIndex),
                        onlyRender: true
                    }, false, true, false);
                };

            const unsetMainLayer = () => {
                mainLayer = undefined;
            };

            const setMainLayer = layerName => {
                if (layers[layerName]) {
                    mainLayer = layerName;
                    reloadTooltip();
                    renderLastIndex();
                }
            };

            // 이벤트 리스너 등록
            // 줌 Zoom
            wrapper.addEventListener('mousewheel',
                e => {
                    e.preventDefault();

                    // speed : 10
                    let zoomSpeed = Math.round((viewport[1] - viewport[0]) / 8);
                    // let zoomSpeed = 10;

                    let velocity = (e.deltaY / 100) * -zoomSpeed;
                    let nextViewport = [viewport[0] + velocity, viewport[1]];

                    if (nextViewport[0] < 0) {
                        nextViewport[0] = 0;
                        nextViewport[1] -= velocity;
                    }
                    if (nextViewport[1] > $timeline.length) nextViewport[1] = $timeline.length;
                    if (nextViewport[0] >= nextViewport[1]) nextViewport[0] = nextViewport[1] - 1;

                    setViewport(nextViewport[0], nextViewport[1]);
                    focusIndex({
                        x: e.layerX,
                        y: e.layerY
                    });
                })
            ;
            // 드래그 Drag
            let mousedown = false;
            let prevMouseX = null;

            wrapper.addEventListener('mousedown', e => {
                mousedown = true;
                prevMouseX = e.clientX;
            });
            window.addEventListener('mouseup', () => {
                if (mousedown === true) {
                    mousedown = false;
                    prevMouseX = null;
                }
            });
            window.addEventListener('mousemove', e => {
                let delta = prevMouseX - e.clientX;
                // 이동값이 10px 이상일 경우, 좌 또는 우로 데이터 1개만큼 뷰포트 이동.
                if (mousedown === true) {
                    e.preventDefault();

                    let itemWidth = getItemWidth();

                    if (prevMouseX !== null) {
                        // speed : 10
                        let moveSpeed = Math.abs(Math.floor((prevMouseX - grid.left) / itemWidth) - Math.floor((e.clientX - grid.left) / itemWidth));
                        // let moveSpeed = 10;

                        let direction = delta < 0 ? -1 : 1,
                            velocity = direction * moveSpeed,
                            nextViewport = [viewport[0] + velocity, viewport[1] + velocity];

                        if (nextViewport[0] < 0 || nextViewport[1] > $timeline.length) return;

                        setViewport(nextViewport[0], nextViewport[1]);
                        prevMouseX = e.clientX;
                    }
                }
            });
            // 탐색
            wrapper.addEventListener('mousemove', e => {
                focusIndex({
                    x: e.layerX,
                    y: e.layerY
                });
            });

            wrapper.addEventListener('mouseout', e => {
                unfocusIndex();
            });

            let getItemWidth = () => (getTransformSize().tWidth) / (viewport[1] - viewport[0]);

            let previousFocusedIndex;
            const _focusIndex = ({
                                     ctx = floatCtx,
                                     x,
                                     y,
                                     index,
                                     realPrice,

                                     focusXBackgroundColor = globalStyle.focusXBackgroundColor,
                                     focusXLabelColor = globalStyle.focusXLabelColor,
                                     focusXAxisColor = globalStyle.focusXAxisColor,

                                     focusYAxisColor = globalStyle.focusYAxisColor,
                                     focusYBackgroundColor = globalStyle.focusYBackgroundColor,
                                     focusYLabelColor = globalStyle.focusYLabelColor,

                                     onlyRender = false
                                 }, xFocus = true, yFocus = false, clear = true) => {
                let {
                    tWidth,
                    tHeight,
                } = getTransformSize();

                if (realPrice === undefined) {
                    realPrice = map(y, grid.top + tHeight - padding.bottom, grid.top + padding.top, min, max);
                } else {
                    y = map(realPrice, min, max, grid.top + tHeight - padding.bottom, grid.top + padding.top);
                }

                let itemWidth = (tWidth) / (viewport[1] - viewport[0]);
                let screenIndex;

                if (index === undefined) {
                    screenIndex = Math.floor((x - grid.left) / itemWidth);
                    index = viewport[0] + screenIndex;
                } else {
                    index -= viewport[0];
                }

                if (previousFocusedIndex === index) {
                    return;
                }

                if (index < 0 || index >= viewport[1]) {
                    ctx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
                    return;
                }

                ctx.save();

                if (clear === true) {
                    ctx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
                }

                ctx.translate(grid.left, 0);
                ctx.font = `12px ${globalStyle.fontFamily}`;

                if (xFocus === true) {

                    ctx.textAlign = globalStyle.xLabelAlign;
                    ctx.textBaseline = 'middle';

                    ctx.strokeStyle = floatCtx.fillStyle = focusXAxisColor;
                    if (globalStyle.focusXAxisExtend === true) {
                        ctx.fillRect(screenIndex * itemWidth, grid.top, itemWidth, tHeight);
                    } else {
                        let lx = screenIndex * itemWidth + itemWidth / 2;
                        ctx.beginPath();
                        ctx.moveTo(lx, 0);
                        ctx.lineTo(lx, grid.top + tHeight);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    if (globalStyle.xLabelShow !== false) {
                        /* x focus */
                        let text = applyDateFormatter($timeline[index], dateFormatter);
                        let textWidth = floatCtx.measureText(text).width;
                        let paddingLR = 5;

                        if (textWidth + paddingLR * 2 < itemWidth) {
                            paddingLR = (itemWidth - textWidth) / 2;
                            textWidth = itemWidth - paddingLR * 2;
                        }

                        let tx = screenIndex * itemWidth, ty, gy;

                        if (globalStyle.xLabelAlign === 'top') {
                            ty = 0;
                            gy = grid.top;
                        } else {
                            ty = tHeight;
                            gy = grid.bottom;
                        }

                        if (globalStyle.yLabelAlign === 'right') {

                        } else {
                            tx -= textWidth + paddingLR * 2 - itemWidth;
                        }
                        //
                        // floatCtx.fillStyle = globalStyle.backgroundColor;
                        // floatCtx.fillRect(tx + itemWidth / 2,ty,textWidth, gy - 1);

                        ctx.fillStyle = focusXBackgroundColor;
                        ctx.fillRect(tx, ty, textWidth + paddingLR * 2, gy);

                        ctx.fillStyle = focusXLabelColor;
                        ctx.fillText(text, tx + paddingLR, ty + (gy / 2));

                    }
                }
                /* y focus */
                if (yFocus === true && grid.top + tHeight >= y && grid.top <= y) {

                    ctx.textBaseline = 'middle';

                    ctx.strokeStyle = focusYAxisColor;
                    ctx.fillStyle = focusYBackgroundColor;

                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(tWidth, y);
                    ctx.closePath();
                    ctx.stroke();

                    let x, w, h = 20, tx;

                    if (globalStyle.yLabelAlign === 'left') {
                        x = -grid.left;
                        w = grid.left;
                        tx = -10;
                        ctx.textAlign = 'right';
                    } else {
                        x = tWidth;
                        w = grid.right;
                        tx = tWidth + 10;
                        ctx.textAlign = 'left';
                    }
                    ctx.fillRect(x, y - h / 2, w, h);

                    ctx.fillStyle = focusYLabelColor;
                    ctx.fillText(yLabelFormatter(realPrice), tx, y);

                }

                ctx.restore();

                if (onlyRender !== true) {
                    let datas =
                        layerMap(
                            (layer, name) => layer.data[index] === 'object' ? overwrite(null, layer.data[index]) : layer.data[index],
                            name => name
                        );
                    let time = new Date($timeline[index]);

                    showTooltip(index);
                }
            };
            const focusIndex = pos => {
                if (isRoot() === true) {
                    $methodByKey[$key]
                        .dispatchFocusIndex(pos);
                } else {
                    $methodByKey[this.$rootConnect]
                        .dispatchFocusIndex(pos);
                    _focusIndex(pos, false, true, false);
                    return;
                }

                _focusIndex(pos, true, true);
            };

            const _unfocusIndex = () => {
                floatCtx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
            };
            const unfocusIndex = () => {
                if (isRoot() === true) {
                    $methodByKey[$key]
                        .dispatchUnfocusIndex();
                } else {
                    $methodByKey[this.$rootConnect]
                        .dispatchUnfocusIndex();
                    return;
                }
                _unfocusIndex();
            };

            let tooltipOptions = {
                show: false,
                forammters: {},
                titles: {},
                filters: []
            };

            const setTooltip = (options = {}) => {

                overwrite(options.formatters, tooltipOptions.formatters);
                overwrite(options.titles, tooltipOptions.titles);

                tooltipOptions = overwrite(options, tooltipOptions);
                reloadTooltip();
            };

            let lastTooltipIndex = null;
            const reloadTooltip = () => lastTooltipIndex !== null && showTooltip(lastTooltipIndex);

            const showTooltip =
                (() => {
                    const render = ({
                                        ctx,
                                        texts,
                                        lineHeight,
                                        minWidth = globalStyle.tooltipMinWidth,
                                        notRender = false
                                    }) => {
                        let lineCount = 1;
                        let lineWidth = 0;
                        let space = globalStyle.tooltipLetterSpace;
                        let rendered = false;
                        let maxWidth = minWidth;

                        texts.forEach(
                            text => {
                                let width;

                                if (Array.isArray(text.text) === true) {
                                    width = ctx.measureText(text.text.join('')).width + ((text.text.length - 1) * space);
                                } else {
                                    width = ctx.measureText(text.text).width;
                                }

                                text.width = width;

                                if (width > maxWidth) maxWidth = width;
                            }
                        );

                        for (let i = 0; i < texts.length; i++) {

                            let text = texts[i];

                            if (maxWidth < lineWidth + text.width) {

                                if (notRender !== true) {
                                    ctx.translate(0, lineHeight);
                                }
                                lineWidth = 0;
                                lineCount++;

                            }
                            if (notRender !== true) {

                                ctx.fillStyle = text.color;

                                if (Array.isArray(text.text) === true) {
                                    let l = 0;
                                    for (let j = 0; j < text.text.length; j++) {
                                        ctx.fillText(text.text[j], l + j * space, 0);
                                        l += ctx.measureText(text.text[j]).width;
                                    }
                                } else ctx.fillText(text.text, lineWidth, 0);

                            }
                            lineWidth += text.width + space;
                            rendered = true;
                        }

                        lineCount = rendered === false ? 0 : lineCount;

                        return {
                            lineCount,
                            height: lineCount * lineHeight,
                            width: maxWidth
                        };
                    };

                    return (index) => {
                        let {
                            show,
                            filters,
                            formatters,
                            titles
                        } = tooltipOptions;

                        tooltipCtx.clearRect(-10, -10, wrapper.clientWidth + 20, wrapper.clientHeight + 20);

                        if (show !== true) return;

                        let texts = [],
                            fontSize = globalStyle.tooltipFontSize,
                            lineHeight = fontSize * 1.2;
                        // maxWidth = 300 (px)
                        ;

                        tooltipCtx.font = `${fontSize}px ${globalStyle.fontFamily}`;
                        tooltipCtx.textBaseline = "top";

                        for (let name in layers) {
                            let layer = layers[name];
                            if (filters.indexOf(name) !== -1 || layer.show === false) {
                                continue;
                            }

                            let text = tooltipForTypes[layer.type]
                            ({
                                title: titles[name] || name,
                                formatter: (formatters && formatters[name]),
                                data: layer.data[index],
                            });

                            if (text === null) continue;

                            texts.push({
                                text,
                                color: typeof layer.style.itemColor === 'string' ? layer.style.itemColor : globalStyle.tooltipTextColor
                            });
                        }

                        tooltipCtx.save();

                        let rTooltip =
                            b => render({
                                ctx: tooltipCtx,
                                texts,
                                lineHeight,
                                notRender: b
                            });

                        let pVertical = globalStyle.tooltipYPadding;
                        let pHorizontal = globalStyle.tooltipXPadding;

                        let r = rTooltip(true),
                            rHeight = r.height + pVertical,
                            rWidth = r.width + pHorizontal;

                        let {
                            tWidth,
                            tHeight
                        } = getTransformSize();

                        tooltipCtx.translate(grid.left, grid.top);

                        if (globalStyle.tooltipXAlign === 'left') {
                            tooltipCtx.translate(globalStyle.tooltipXMargin, 0);
                        } else if (globalStyle.tooltipXAlign === 'right') {
                            tooltipCtx.translate(tWidth - rWidth - globalStyle.tooltipCandleThick - globalStyle.tooltipXMargin, 0);
                        }

                        if (globalStyle.tooltipYAlign === 'top') {
                            tooltipCtx.translate(0, globalStyle.tooltipYMargin);
                        } else if (globalStyle.tooltipYAlign === 'bottom') {
                            tooltipCtx.translate(0, tHeight - rHeight - globalStyle.tooltipYMargin);
                        }

                        if (mainLayer) {
                            let {
                                data,
                                style
                            } = layers[mainLayer];

                            if (data[index]) {
                                let {
                                    open,
                                    close
                                } = data[index];

                                tooltipCtx.fillStyle = getItemColorForTypes(layers[mainLayer], index);

                                tooltipCtx.fillRect(0, 0, globalStyle.tooltipCandleThick, rHeight);
                                tooltipCtx.translate(globalStyle.tooltipCandleThick, 0);
                            }
                        }

                        if (!mainLayer && globalStyle.tooltipXAlign === 'right') {
                            tooltipCtx.translate(globalStyle.tooltipCandleThick, 0);
                        }

                        tooltipCtx.fillStyle = globalStyle.tooltipBackgroundColor;
                        tooltipCtx.fillRect(0, 0, rWidth, rHeight);

                        tooltipCtx.translate(pHorizontal / 2, 1.2);

                        rTooltip();

                        tooltipCtx.restore();

                        lastTooltipIndex = index;
                    };
                })();

            const updateInitLayerStyle = () => {
                for (let type in init.layerStyle) {
                    initLayerStyle[type] = overwrite(theme.layerStyle[type], init.layerStyle[type]);
                }
            };
            const updateWrapperStyle = () => {
                // wrapperStyle 은 개념적으로는 globalStyle 이지만 다른 globalStyle 속성들과는 다르게 렌더링 도중에 값이 업데이트 되지않음.
                wrapper.style.backgroundColor = globalStyle.backgroundColor;
            };
            const setTheme = themeName => {
                theme = themes[themeName];

                // 전역 스타일 업데이트.
                globalStyle = overwrite(theme.globalStyle, globalStyle);

                // Wrapper 스타일 업데이트.
                updateWrapperStyle();

                // 레이어 기본 스타일 업데이트.
                updateInitLayerStyle();

                // 레이어 스타일 적용.
                for (let name in layers) {
                    let layer = layers[name];
                    setLayer(name, {
                        style: initLayerStyle[layer.type]
                    });
                }

                // 그리드 업데이트
                setGrid();

                renderXLabel();
                renderYLabel();
            };

            const resize = () => {
                // 모든 canvas 의 크기를 wrapper에 맞춤.
                canvasStack.map(canvas => {
                    canvas.width = wrapper.clientWidth;
                    canvas.height = wrapper.clientHeight;
                });
                renderAll();
            };

            const $connect = [];

            const connect = b => {
                if (b instanceof Chart !== true) return;

                if (this.$rootConnect !== null) {
                    $methodByKey[this.$rootConnect].connect(b);
                    return;
                }

                // 레퍼런스공유로 메모리 낭비를 줄인다.
                $methodByKey[b.$key].getTimeline = () => timeline;
                $methodByKey[b.$key].refreshTimeline();

                // onSetViewport 함수 참조.

                // 연결정보 추가
                // 뷰포트 공유, 포커싱 공유는 connect 를 통해 이루어진다.
                $connect.push(b.$key);
                b.$rootConnect = $key;

                renderAll();
                b.render();
            };

            const disconnect = () => {
                if (isRoot() === true) {
                    $connect.map(key => $methodByKey[key].disconnect());
                    $connect.splice(0, $connect.length);
                }
                else {
                    $methodByKey[$key].disconnect();
                }
                renderAll();
            };

            // 디스패처 설정

            const makeDispatcher = (innerFunction, innerFunctionName) =>
                (...argv) => {
                    if (this.$connect.length > 0) {

                        innerFunction.apply(this, argv);

                        for (let i in $connect) {
                            $methodByKey[$connect[i]][innerFunctionName].apply(this, argv);
                        }

                    }
                };

            $method.getTimeline = () => timeline;
            $method.refreshTimeline = () => $timeline = $methodByKey[$key].getTimeline();

            $method.setViewport = _setViewport;
            $method.dispatchSetViewport = makeDispatcher(_setViewport, 'setViewport');

            $method.focusIndex = _focusIndex;
            $method.dispatchFocusIndex = makeDispatcher(_focusIndex, 'focusIndex');

            $method.unfocusIndex = _unfocusIndex;
            $method.dispatchUnfocusIndex = makeDispatcher(_unfocusIndex, 'unfocusIndex');

            $method.setTimeline = () => {
                if ($timeline.length < viewport[1]) {
                    viewport[1] = $timeline.length;
                }
                renderAll();
            };

            $method.dispatchSetTimeline = () => {
                if (this.$connect.length > 0) {

                    for (let i in $connect) {
                        let key = $connect[i];
                        $methodByKey[key].getTimeline = () => timeline;
                        $methodByKey[key].refreshTimeline();
                    }

                }
            };

            $method.connect = () => connect;
            $method.disconnect = () => {

                $method.getTimeline = () => timeline;
                $method.refreshTimeline();

                this.$rootConnect = null;
                renderAll();
            };

            $method.minSpan = () => globalStyle.minSpan;

            /* return(define) public logics */
            this.$key = $key;
            this.$connect = $connect;
            this.$rootConnect = null;

            const isRoot = () => this.$rootConnect === null;
            const makePublic = (innerFunction) => (...argv) => {
                innerFunction.apply(this, argv);
                return this;
            };
            this.addLayer = makePublic(addLayer);
            this.setLayer = makePublic(setLayer);
            this.setViewport = makePublic(setViewport);
            this.getViewport = makePublic(getViewport);
            this.setTimeline = makePublic(setTimeline);
            this.setPadding = makePublic(setPadding);
            this.setStyle = makePublic(setStyle);
            this.setTheme = makePublic(setTheme);
            this.resize = makePublic(resize);
            this.setDateFormatter = makePublic(setDateFormatter);
            this.setTooltip = makePublic(setTooltip);
            this.connect = makePublic(connect);
            this.disconnect = makePublic(disconnect);
            this.setYLabelFormatter = makePublic(setYLabelFormatter);
            this.setMainLayer = makePublic(setMainLayer);
            this.unsetMainLayer = makePublic(unsetMainLayer);
            this.getViewport = makePublic(getViewport);
            this.render = makePublic(renderAll);
            this.renderTooltip = makePublic(renderTooltip);

            this.showLayers = arr => {
                for (let i = 0; i < arr.length; i++) {
                    let layer = layers[arr[i]];
                    if (layer) {
                        layer.show = true;
                    }
                    renderAll();
                }
                return this;
            };

            this.hideLayers = arr => {
                for (let i = 0; i < arr.length; i++) {
                    let layer = layers[arr[i]];
                    if (layer) {
                        layer.show = false;
                    }
                    renderAll();
                }
                return this;
            };

            setGrid();
            setTheme("white");
        }
    }
    Chart.themes = themes;
    Chart.getTheme = name => themes[name];
    Chart.addTheme = (name, th) => themes[name] = th;
    Chart.calculateMA = (dayCount, data) => {
        let result = [],
            arr = [],
            sum = 0;
        for (let i = 0, len = data.length; i < len; i++) {
            result[i] = null;

            arr.push(data[i]);
            sum += data[i];

            if (arr.length === dayCount) {
                result[i] = sum / dayCount;
                sum -= arr.shift();
            }
        }
        return result;
    };
    Chart.toValue = (n = 0, demicalPlaces = 0, coma = true) => {
        if (isNaN(n) === true) return 'N/A';
        n = cutDemicalPoint(n, demicalPlaces);

        let s = n.toString().split('.');
        let f = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (s[1] === undefined) return f;
        if (s[1].length < demicalPlaces) {
            for (let i = 0; i < demicalPlaces - s[1].length; i++) {
                s[1] += '0';
            }
        }
        return f + '.' + s[1];
    };
    return Chart;
})
();