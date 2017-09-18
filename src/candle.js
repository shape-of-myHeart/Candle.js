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
            minSpan: 8
        },

        layerType: 'candle', // candle , line
        layerStyle: {
            candle: {
                incrementItemColor: 'rgb(252,4,4)',
                decrementItemColor: 'rgb(0,168,0)',
            },
            line: {
                itemColor: '#000000'
            },
            stick: {
                itemColor: '#000000'
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
                tooltipBackgroundColor: 'rgba(0,0,0,0.5)',
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

    // 레이어 타입에 따른 메소드 정의
    const renderForTypes = {
        candle: ({
                     ctx,
                     itemWidth,
                     transform,
                     decrementItemColor,
                     incrementItemColor
                 }, {
                     open,
                     close,
                     high,
                     low
                 }) => {
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

            ctx.fillRect(2, f(y), f(itemWidth - 4), f(h));
            ctx.strokeRect(2, f(y), f(itemWidth - 4), f(h));
        },
        line: ({
                   ctx,
                   itemWidth,
                   transform,
                   itemColor
               }, data) => {
            let y = transform(data);

            ctx.fillStyle = itemColor;
            ctx.strokeStyle = itemColor;
            ctx.lineTo(f(itemWidth * 0.5), y);
        },
        stick: ({
                    ctx,
                    itemWidth,
                    transform,
                    itemColor,
                    tHeight,
                    min
                }, data) => {
            let y = transform(data);

            let g = 1;
            if (f(itemWidth) <= 3) {
                ctx.strokeStyle = itemColor;
                ctx.beginPath();
                ctx.moveTo(f(itemWidth * 0.5), f(y));
                ctx.lineTo(f(itemWidth * 0.5), f(transform(min)));
                ctx.closePath();
                ctx.stroke();
            }
            else {
                ctx.fillStyle = itemColor;
                ctx.fillRect(f(g), f(y), f(itemWidth - g * 2), f(transform(min) - y));
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

    const $setMethodByKey = (key, name, func) => {
        if (!$methodByKey[key]) $methodByKey[key] = [];
        $methodByKey[key][name] = func;
        name !== '$On' && $methodByKey[key].$On && $methodByKey[key].$On(name);
    };
    const $getMethodByKey = (key, name) => $methodByKey[key][name];

    class Chart {
        constructor(domId) {
            let wrapper = document.getElementById(domId);
            if (wrapper === null) return;

            let $key;
            while ($keys.indexOf($key = Math.random() + Math.random() + Math.random()) !== -1) {
            }

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

            // X,Y 축 캔버스 Context 정의
            // 라벨이 업데이트 될 때.
            // - setViewport 로 뷰포트가 업데이트 되었을 경우.
            // - addLayer 로 layer의 속성이 변경 되었을 경우.
            // - setTimeline 로 x축 값이 변경 되었을 경우.
            const yLabelCtx = makeCanvas().context;
            const xLabelCtx = makeCanvas().context;

            const floatCtx = makeCanvas(1).context;
            const tooltipCtx = makeCanvas(2).context;

            // 레이어 메소드
            const addLayer = (name, {
                type,
                data,
                style
            }) => { /* 라이브러리에 관련된 객체셋팅. */
                if (layers[name] !== undefined) {
                    return;
                }
                let layer = makeCanvas();

                layer.type = type || init.layerType;
                layer.data = data || [];
                layer.style = overwrite(style, initLayerStyle[layer.type]);

                layers[name] = layer;

                renderAll();
            };
            const setLayer = (name, {
                type,
                data,
                style
            }) => {
                let layer = layers[name];

                // type 변경시 type에 영향이 가는 레이어속성들을 새로설정.
                const baseStyle =
                    (type !== undefined && type !== layer.type) ?
                        initLayerStyle[type] :
                        layer.style;

                layer.type = type || layer.type;
                layer.data = data || layer.data;
                layer.style = overwrite(style, baseStyle);

                renderAll();
                reloadTooltip();
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

                if (max - min < globalStyle.minSpan) {
                    min = max - globalStyle.minSpan;
                }
                viewport[0] = min;
                viewport[1] = max;

                renderAll();
            };

            // 뷰포트 메소드
            const setViewport = (s, e) => {
                if (s < 0 || e < 0 || (viewport[0] === s && viewport[1] === e)) return;

                if (isRoot() === true) {
                    $methodByKey[$key]
                        .dispatchSetViewport(s, e);
                } else {
                    $methodByKey[this.$rootConnect]
                        .dispatchSetViewport(s, e);
                    return;
                }

                _setViewport(s, e);
            };
            const getViewport = () => ([viewport[0], viewport[1]]);

            // 타임라인 메소드
            const setTimeline = pTimeline => {
                timeline = [];

                for (let i = 0, l = pTimeline.length; i < l; i++) {
                    timeline.push(new Date(pTimeline[i]));
                }
                $timeline = timeline;

                renderAll();

                if (isRoot() === true) {
                    $methodByKey[$key]
                        .dispatchSetTimeline();
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
                        type
                    } = layer;
                    let getMin = getMinForTypes[type];
                    let getMax = getMaxForTypes[type];

                    let min = Infinity,
                        max = -Infinity;

                    for (let i = viewport[0], l = viewport[1]; i < l; i++) {
                        if (data[i] === null || data[i] === undefined) continue;

                        let _min = getMin(data[i]);
                        let _max = getMax(data[i]);

                        if (min > _min) min = _min;
                        if (max < _max) max = _max;
                    }

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
                // console.log(base, increase);

                for (let i = 0; i <= split + 10; i++) {
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

            // 출력 메소드
            const render = layer => {
                let {
                    data,
                    type,
                    context,
                    canvas,
                    style
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

                // Translate
                context.translate(grid.left, 0);

                context.beginPath();

                let transform = transforms[type](tHeight);

                for (let i = viewport[0], l = viewport[1], s = f((viewport[1] - viewport[0]) / 5); i < l; i++) {
                    if (data[i] !== null && data[i] !== undefined) {
                        let itemColor = typeof style.itemColor === 'function' ? style.itemColor(i) : style.itemColor;

                        renderItem({
                            ctx: context,
                            itemWidth,
                            transform,
                            incrementItemColor: style.incrementItemColor,
                            decrementItemColor: style.decrementItemColor,
                            itemColor,
                            tHeight,
                            min
                        }, data[i]);
                    }
                    context.translate(itemWidth, 0);
                }
                context.stroke();
                context.closePath();

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
            };

            // 이벤트 리스너 등록
            // 줌 Zoom
            wrapper.addEventListener('mousewheel',
                e => {
                    e.preventDefault();

                    // speed : 10
                    let zoomSpeed = 10;

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
                if (mousedown === true && prevMouseX !== null && Math.abs(delta) >= 10) {
                    e.preventDefault();
                    // speed : 5
                    let moveSpeed = 5;

                    let direction = delta < 0 ? -1 : 1,
                        velocity = direction * moveSpeed,
                        nextViewport = [viewport[0] + velocity, viewport[1] + velocity];

                    if (nextViewport[0] < 0 || nextViewport[1] > $timeline.length) return;

                    setViewport(nextViewport[0], nextViewport[1]);
                    prevMouseX = e.clientX;
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

            let previousFocusedIndex;
            const _focusIndex = ({
                                     x,
                                     y
                                 }, xFocus = true, yFocus = false, clear = true) => {
                let {
                    tWidth,
                    tHeight,
                } = getTransformSize();

                let realPrice = map(y, grid.top + tHeight - padding.bottom, grid.top + padding.top, min, max);

                let itemWidth = (tWidth) / (viewport[1] - viewport[0]);
                let screenIndex = Math.floor((x - grid.left) / itemWidth);
                let index = viewport[0] + screenIndex;

                if (previousFocusedIndex === index) {
                    return;
                }
                if (index < 0 || index >= viewport[1]) {
                    floatCtx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
                    return;
                }

                floatCtx.save();

                if (clear === true) {
                    floatCtx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
                }

                floatCtx.translate(grid.left, 0);
                floatCtx.font = `12px ${globalStyle.fontFamily}`;

                if (xFocus === true) {

                    floatCtx.textAlign = globalStyle.xLabelAlign;
                    floatCtx.textBaseline = 'middle';

                    floatCtx.strokeStyle = floatCtx.fillStyle = globalStyle.focusXAxisColor;
                    if (globalStyle.focusXAxisExtend === true) {
                        floatCtx.fillRect(screenIndex * itemWidth, grid.top, itemWidth, tHeight);
                    } else {
                        let lx = screenIndex * itemWidth + itemWidth / 2;
                        floatCtx.beginPath();
                        floatCtx.moveTo(lx, 0);
                        floatCtx.lineTo(lx, grid.top + tHeight);
                        floatCtx.closePath();
                        floatCtx.stroke();
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

                        floatCtx.fillStyle = globalStyle.focusXBackgroundColor;
                        floatCtx.fillRect(tx, ty, textWidth + paddingLR * 2, gy);

                        floatCtx.fillStyle = globalStyle.focusXLabelColor;
                        floatCtx.fillText(text, tx + paddingLR, ty + (gy / 2));

                    }
                }
                /* y focus */
                if (yFocus === true && grid.top + tHeight >= y && grid.top <= y) {

                    floatCtx.textBaseline = 'middle';

                    floatCtx.strokeStyle = globalStyle.focusYAxisColor;
                    floatCtx.fillStyle = globalStyle.focusYBackgroundColor;

                    floatCtx.beginPath();
                    floatCtx.moveTo(0, y);
                    floatCtx.lineTo(tWidth, y);
                    floatCtx.closePath();
                    floatCtx.stroke();

                    let x, w, h = 20, tx;

                    if (globalStyle.yLabelAlign === 'left') {
                        x = -grid.left;
                        w = grid.left;
                        tx = -10;
                        floatCtx.textAlign = 'right';
                    } else {
                        x = tWidth;
                        w = grid.right;
                        tx = tWidth + 10;
                        floatCtx.textAlign = 'left';
                    }
                    floatCtx.fillRect(x, y - h / 2, w, h);

                    floatCtx.fillStyle = globalStyle.focusYLabelColor;
                    floatCtx.fillText(yLabelFormatter(realPrice), tx, y);

                }

                floatCtx.restore();

                let datas =
                    layerMap(
                        (layer, name) => layer.data[index] === 'object' ? overwrite(null, layer.data[index]) : layer.data[index],
                        name => name
                    );
                let time = new Date($timeline[index]);

                this.onSelect(time, datas);
                showTooltip(index);
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
                filters: [],
                mainCandle: ''
            };

            const setTooltip = (options = {}) => {
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
                            titles,
                            mainCandle
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
                            if (filters.indexOf(name) !== -1) {
                                return;
                            }
                            let layer = layers[name];
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

                        // 타이틀 세팅
                        // const titleFont = "bold 18px 'Apple SD Gothic Neo',arial,sans-serif";
                        // tooltipCtx.save();
                        // tooltipCtx.font = titleFont;

                        // let title = applyDateFormatter(timeline[index], 'yyyy-MM-dd hh:mm:ss'),
                        //     titleWidth = tooltipCtx.measureText(title).width;

                        // rWidth = Math.max(rWidth, titleWidth + 10);
                        // tooltipCtx.restore();
                        /////////////////////////

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

                        // // 타이틀 그리기
                        // tooltipCtx.save();

                        // tooltipCtx.font = titleFont;
                        // tooltipCtx.fillStyle = globalStyle.tooltipTitleColor;

                        // tooltipCtx.fillText(title, 0, 0);

                        // tooltipCtx.restore();
                        // /////////////////////////

                        // tooltipCtx.translate(0, 23);

                        if (mainCandle) {
                            let {
                                data,
                                style
                            } = layers[mainCandle];

                            if (data[index]) {
                                let {
                                    open,
                                    close
                                } = data[index];

                                tooltipCtx.fillStyle = open < close ?
                                    style.incrementItemColor : style.decrementItemColor;

                                tooltipCtx.fillRect(0, 0, globalStyle.tooltipCandleThick, rHeight);
                                tooltipCtx.translate(globalStyle.tooltipCandleThick, 0);
                            }
                        }

                        if (!mainCandle && globalStyle.tooltipXAlign === 'right') {
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
                $setMethodByKey(b.$key, 'getTimeline', $getMethodByKey($key, 'getTimeline'));

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

            // private 함수 참조 가능.
            $setMethodByKey($key, 'getTimeline', () => timeline);

            $setMethodByKey($key, '_setViewport', _setViewport);
            $setMethodByKey($key, 'dispatchSetViewport', (s, e) => {
                if (this.$connect.length > 0) {

                    _setViewport(s, e);

                    $connect.map(key => {
                        $methodByKey[key]._setViewport(s, e);
                    });

                }
            });

            $setMethodByKey($key, '_focusIndex', _focusIndex);
            $setMethodByKey($key, 'dispatchFocusIndex', pos => {
                if (this.$connect.length > 0) {

                    _focusIndex(pos);

                    $connect.map(key => {
                        $methodByKey[key]._focusIndex(pos);
                    });

                }
            });

            $setMethodByKey($key, '_unfocusIndex', _unfocusIndex);
            $setMethodByKey($key, 'dispatchUnfocusIndex', () => {
                if (this.$connect.length > 0) {

                    _unfocusIndex();

                    $connect.map(key => {
                        $methodByKey[key]._unfocusIndex();
                    });

                }
            });

            $setMethodByKey($key, '_setTimeline', () => {
                renderAll();
            });

            $setMethodByKey($key, 'dispatchSetTimeline', () => {
                if (this.$connect.length > 0) {
                    $connect.map(key => {
                        $setMethodByKey(key, 'getTimeline', () => timeline);
                        $methodByKey[key]._setTimeline();
                    });
                }
            });

            $setMethodByKey($key, 'connect', () => connect);
            $setMethodByKey($key, 'disconnect', () => {
                $setMethodByKey($key, 'getTimeline', () => timeline);
                this.$rootConnect = null;
                renderAll();
            });

            // 이후 모든 setMethodByKey($key,...) 실행 후 $On 으로 등록한 함수를 실행한다.
            $setMethodByKey($key, '$On', name => {
                // getTimeline 함수가 변경되면, 실제제적인 차트 메소드들에 쓰이는 $timeline 변수를 교체한다.
                if (name === 'getTimeline') {
                    $timeline = $getMethodByKey($key, 'getTimeline')();
                }
            });

            /* return(define) public logics */
            this.$key = $key;
            this.$connect = $connect;
            this.$rootConnect = null;

            const isRoot = () => this.$rootConnect === null;

            this.addLayer = (...argv) => {
                addLayer.apply(this, argv);
                return this;
            }
            this.setLayer = (...argv) => {
                setLayer.apply(this, argv);
                return this;
            }
            this.setViewport = (...argv) => {
                setViewport.apply(this, argv);
                return this;
            }
            this.getViewport = (...argv) => {
                getViewport.apply(this, argv);
                return this;
            }
            this.setTimeline = (...argv) => {
                setTimeline.apply(this, argv);
                return this;
            }
            this.setPadding = (...argv) => {
                setPadding.apply(this, argv);
                return this;
            }
            this.setStyle = (...argv) => {
                setStyle.apply(this, argv);
                return this;
            }
            this.setTheme = (...argv) => {
                setTheme.apply(this, argv);
                return this;
            }
            this.resize = (...argv) => {
                resize.apply(this, argv);
                return this;
            }
            this.setDateFormatter = (...argv) => {
                setDateFormatter.apply(this, argv);
                return this;
            }
            this.setTooltip = (...argv) => {
                setTooltip.apply(this, argv);
                return this;
            }
            this.connect = (...argv) => {
                connect.apply(this, argv);
                return this;
            }
            this.disconnect = (...argv) => {
                disconnect.apply(this, argv);
                return this;
            }
            this.setYLabelFormatter = (...argv) => {
                setYLabelFormatter.apply(this, argv);
                return this;
            }


            this.render = () => {
                renderAll();
                return this;
            };

            this.onSelect = () => {
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
    Chart.toPrice = (a, b) => {
        if (isNaN(a)) {
            return 'N/A';
        }
        if (b !== true) {
            a = Math.floor(a);
        }
        const s = a.toString().split('.');
        const f = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (s[1] === undefined) {
            return f;
        } else {
            return f + '.' + s[1];
        }
    };

    return Chart;
})
();
