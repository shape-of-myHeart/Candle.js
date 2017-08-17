const Chart = (() => {
    const themes = {
        gray: {
            backgroundColor: '#f5f5f5',
            textColor: '#5d5d5d',
            axisColor: '#999',
            splitAxisColor: 'rgba(0,0,0,0.05)',
            candle: {
                incrementItemColor: '#14b143',
                decrementItemColor: '#ef232a',
                minBodyWidth: 7
            },
            line: {
                itemColor: '#000000'
            }
        },
        dark: {
            backgroundColor: '#151515',
            textColor: '#aaa',
            axisColor: '#999',
            splitAxisColor: 'rgba(255,255,255,0.1)',
            candle: {
                incrementItemColor: '#14b143',
                decrementItemColor: '#ef232a',
                minBodyWidth: 7
            },
            line: {
                itemColor: '#999'
            }
        }
    };

    // 레이어 타입에 따른 메소드 정의
    const renderForTypes = {
        candle: ({
            ctx,
            itemWidth,
            transform,
            style
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

            ctx.strokeStyle = close > open ? style.incrementItemColor : style.decrementItemColor;
            ctx.fillStyle = close > open ? style.incrementItemColor : style.decrementItemColor;

            if (itemWidth <= style.minBodyWidth) {
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
            style
        }, data) => {
            if (data === null) return;
            let y = transform(data);

            ctx.fillStyle = style.itemColor;
            ctx.strokeStyle = style.itemColor;
            ctx.lineTo(f(itemWidth * 0.5), y);
        },
    };
    const tooltipForTypes = {
        candle: (title, data, formatter) => data === null ? "" : `<div>${title.open || 'Open'}: ${formatter(data.open)}</div><div>${title.close || 'Close'}: ${formatter(data.close)}</div><div>${title.low || 'Low'}: ${formatter(data.low)}</div><div>${title.high || 'High'}: ${formatter(data.high)}</div><br/>`,
        line: (title, data, formatter, color) => data === null ? "" : `<div style='color:${color}'>${title}: ${formatter(data)}</div>`
    };
    const getMinForTypes = {
        candle: item => item.low,
        line: item => item
    };
    const getMaxForTypes = {
        candle: item => item.high,
        line: item => item
    };

    // 유틸 메소드
    const map = (n, a, b, c, d) => ((n - a) / (b - a)) * (d - c) + c;
    const f = Math.floor;
    const overwrite = (target, base) => {
        if (typeof target !== 'object' || target === null) target = {};

        let bKeys = Object.keys(base);

        for (let i = 0, l = bKeys.length; i < l; i++) {
            let key = bKeys[i];
            if (target[key] === undefined) target[key] = base[key];
        }

        return target;
    };
    const applyDateFormatter = (d, f) => {
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
            var s = '',
                i = 0;
            while (i++ < l - e.length) {
                s += "0";
            }
            return s + e;
        }
    };

    class Chart {
        addTheme(name, th) {
            _addTheme(name, th);
        }
        constructor(domId) {
            let wrapper = document.getElementById(domId);

            if (wrapper === null) {
                return;
            }

            let theme;

            /* wrapper style settings */
            wrapper.style.position = 'relative';

            // 툴팁 DOM wrapper 뒤에 추가
            const tooltip = document.createElement('div');
            tooltip.classList.add('candle-lite-tooltip');

            wrapper.appendChild(tooltip);

            let canvasStack = [];
            // 캔버스 생성, wrapper 에 append 후 object로 dom 객체와 context 반환.
            const makeCanvas = () => {
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');

                canvas.style.position = 'absolute';
                canvas.style.top = 0;
                canvas.style.left = 0;

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

            /* initialize */
            const init = {
                // type 에 의존하는 속성값들
                // - renderItem (renderForTypes 변수 참조.)
                // - 항상최솟값을 같는 key 값을 반환하는 함수. (getMinForTypes 참조)
                // - 항상최대값을 같는 key 값을 반환하는 함수. (getMaxForTypes 참조)
                // - style의 일부 속성들
                type: 'candle', // candle , line
                grid: {
                    top: 0,
                    right: 100,
                    bottom: 30,
                    left: 0
                },
                padding: {
                    top: 50,
                    right: 0,
                    bottom: 50,
                    left: 0
                },
                style: {
                    // yLabelAlign
                    // : right
                    // : left
                    yLabelAlign: "right",
                    yLabelWidth: 100,

                    // xLabelAlign
                    // : top
                    // : bottom
                    xLabelAlign: "bottom",
                    xLabelHeight: 30,

                    axisColor: '',
                    splitAxisColor: '',
                    textColor: ''
                },
                dateFormatter: "MM-dd HH:mm"
            };

            /* Variable 정의 */
            let layers = {};
            let viewport = []; /* 0 : start / 1 : end */
            let timeline = [];
            let {
                grid,
                padding,
                style,
                dateFormatter
            } = init;
            let globalStyle = style;
            let min;
            let max;

            // X,Y 축 캔버스 Context 정의
            // 라벨이 업데이트 될 때.
            // - setViewport 로 뷰포트가 업데이트 되었을 경우.
            // - addLayer 로 layer의 속성이 변경 되었을 경우.
            // - setTimeline 로 x축 값이 변경 되었을 경우.
            const yLabelCtx = makeCanvas().context;
            const xLabelCtx = makeCanvas().context;

            // Float 캔버스 Context 정의
            const floatCtx = makeCanvas().context;

            let styleForTypes;

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

                layer.type = type || init.layer.type;
                layer.data = data ? data : [];
                layer.style = overwrite(style, styleForTypes[layer.type]);

                layers[name] = layer;
                updateMinMax();
            };
            const setLayer = (name, {
                type,
                data,
                style
            }) => {
                let layer = layers[name];

                // type 변경시 type에 영향이 가는 레이어속성들을 새로설정.
                let baseStyle = layer.style;

                if (type !== undefined && type !== layer.type) {
                    layer.style = {};
                    baseStyle = styleForTypes[type];
                }

                layer.type = type || layer.type;
                layer.data = data ? data : layer.data;
                layer.style = overwrite(style, baseStyle);
                updateMinMax();

                render(layer);
            };
            const layerMap = (func, formatter) => {
                let lKeys = Object.keys(layers),
                    result = [];

                for (let i = 0; i < lKeys.length; i++) {
                    let key = lKeys[i];
                    result[typeof formatter === 'function' ? formatter(key) : i] = func(layers[key], key);
                }

                return result;
            };

            // 뷰포트 메소드
            const setViewport = (s, e) => {
                viewport[0] = Math.min(s, e);
                viewport[1] = Math.max(s, e);
                updateMinMax();
                renderAll();
            };
            const getViewport = () => ([viewport[0], viewport[1]]);

            // 타임라인 메소드
            const setTimeline = pTimeline => {
                timeline = [];
                for (let i = 0, l = pTimeline.length; i < l; i++) {
                    timeline.push(new Date(pTimeline[i]));
                }
            };
            const setDateFormatter = f => dateFormatter = f;

            // 그리드 메소드
            const setGrid = pGrid => {
                grid = overwrite(pGrid, grid);
                renderAll();
            };

            // 패딩 메소드
            const setPadding = pPadding => {
                padding = overwrite(pGrid, padding);
                renderAll();
            };

            // 스타일 메소드
            const setStyle = pStyle => {
                style = overwrite(pStyle, style);
                renderAll();
            }

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
                        if (data[i] === null) continue;

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

            // 출력 메소드
            const render = layer => {
                let {
                    xLabelHeight,
                    xLabelAlign,
                    yLabelWidth,
                    yLabelAlign
                } = globalStyle;

                let {
                    data,
                    type,
                    context,
                    canvas,
                    style
                } = layer;

                let width = wrapper.clientWidth,
                    height = wrapper.clientHeight;

                if (viewport[0] === undefined || viewport[1] === undefined) {
                    setViewport(0, timeline.length);
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
                xLabelCtx.save();
                yLabelCtx.save();

                // Clear
                context.clearRect(-10, -10, width + 10, height + 10);
                xLabelCtx.clearRect(-10, -10, width + 10, height + 10);
                yLabelCtx.clearRect(-10, -10, width + 10, height + 10);

                // Translate
                context.translate(grid.left, tHeight + grid.top);
                xLabelCtx.translate(grid.left, 0);
                yLabelCtx.translate(0, tHeight + grid.top);

                // Xlabel Settings
                xLabelCtx.textBaseline = "middle";
                xLabelCtx.textAlign = "left";
                xLabelCtx.font = "12px 'Apple SD Gothic Neo',arial,sans-serif";

                let xLineY = f(xLabelAlign === 'top' ? xLabelHeight : height - xLabelHeight);
                let xLineLabelY = xLabelAlign === 'top' ? (xLabelHeight / 2) : height - (xLabelHeight / 2);

                xLabelCtx.strokeStyle = globalStyle.axisColor;
                xLabelCtx.beginPath();
                xLabelCtx.moveTo(0, xLineY);
                xLabelCtx.lineTo(tWidth, xLineY);
                xLabelCtx.closePath();
                xLabelCtx.stroke();

                context.beginPath();

                for (let i = viewport[0], l = viewport[1], s = f((viewport[1] - viewport[0]) / 5); i < l; i++) {
                    renderItem({
                        ctx: context,
                        itemWidth,
                        transform: v => -map(v, min, max, padding.top, tHeight - padding.bottom),
                        style
                    }, data[i]);

                    if (viewport[0] - l === -1 || (l - i) % s === 0) {
                        let xLineLabelX = f(itemWidth * 0.5);

                        xLabelCtx.strokeStyle = globalStyle.axisColor;
                        xLabelCtx.beginPath();
                        xLabelCtx.moveTo(xLineLabelX, xLineY);
                        xLabelCtx.lineTo(xLineLabelX, xLineY + 5);
                        xLabelCtx.closePath();
                        xLabelCtx.stroke();

                        xLabelCtx.strokeStyle = globalStyle.splitAxisColor;
                        xLabelCtx.beginPath();
                        xLabelCtx.moveTo(xLineLabelX, 0);
                        xLabelCtx.lineTo(xLineLabelX, xLineY);
                        xLabelCtx.closePath();
                        xLabelCtx.stroke();

                        xLabelCtx.fillStyle = globalStyle.textColor;
                        xLabelCtx.fillText(
                            applyDateFormatter(timeline[i], dateFormatter),
                            f(xLineLabelX),
                            f(xLineLabelY)
                        );
                    }
                    context.translate(itemWidth, 0);
                    xLabelCtx.translate(itemWidth, 0);
                }
                context.stroke();
                context.closePath();

                // Ylabel Settings
                yLabelCtx.textBaseline = "middle";
                yLabelCtx.textAlign = yLabelAlign === 'left' ? 'right' : 'left';
                yLabelCtx.font = "12px 'Apple SD Gothic Neo',arial,sans-serif";

                let yLineX = f(yLabelAlign === 'left' ? yLabelWidth : width - yLabelWidth);

                yLabelCtx.beginPath();

                yLabelCtx.strokeStyle = globalStyle.axisColor;

                yLabelCtx.moveTo(yLineX, 0);
                yLabelCtx.lineTo(yLineX, -tHeight);
                yLabelCtx.closePath();
                yLabelCtx.stroke();

                let split = 10;
                let temp = (max - min) / split;
                let tempIncrease = 10;
                let tempSplit = 1;

                while (tempSplit + tempIncrease < temp) {
                    tempSplit *= tempIncrease;
                }

                let rd = f(min - (min % tempSplit));

                yLabelCtx.fillStyle = globalStyle.textColor;

                for (let i = 0; i < split; i++) {
                    let d = rd + tempSplit * i;
                    if (d > max) break;
                    else if (d < min) continue;

                    let y = -map(d, min, max, 0, tHeight);

                    yLabelCtx.fillText(d.toString(), yLineX + 5, y);

                    yLabelCtx.strokeStyle = globalStyle.splitAxisColor;
                    yLabelCtx.beginPath();
                    yLabelCtx.moveTo(grid.left, y);
                    yLabelCtx.lineTo(yLineX - 1, y);
                    yLabelCtx.closePath();
                    yLabelCtx.stroke();
                }

                yLabelCtx.restore();
                xLabelCtx.restore();
                context.restore();
            };

            const renderAll = () => layerMap(layer => render(layer));

            // 이벤트 리스너 등록
            // 줌 Zoom
            wrapper.addEventListener('mousewheel', e => {
                let velocity = (e.deltaY / 100) * -5;
                let nextViewport = [viewport[0] + velocity, viewport[1]];

                if (nextViewport[0] < 0) {
                    nextViewport[0] = 0;
                    nextViewport[1] -= velocity;
                }
                if (nextViewport[1] > timeline.length) nextViewport[1] = timeline.length;
                if (nextViewport[0] >= nextViewport[1]) nextViewport[0] = nextViewport[1] - 1;

                setViewport(nextViewport[0], nextViewport[1]);
                focusIndex({
                    x: e.layerX,
                    y: e.layerY
                });
            });
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
                // 이동값이 10px 이상일 경우, 좌 또는 우로 데이터 1개만큼 뷰포트 이동. (speed = 5)
                if (mousedown === true && prevMouseX !== null && Math.abs(delta) >= 10) {
                    e.preventDefault();

                    let direction = delta < 0 ? -1 : 1,
                        velocity = direction * 5,
                        nextViewport = [viewport[0] + velocity, viewport[1] + velocity];

                    if (nextViewport[0] < 0 || nextViewport[1] > timeline.length) return;

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
                floatCtx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
            });

            const focusIndex = ({
                x,
                y
            }) => {
                let {
                    tWidth,
                    tHeight,
                } = getTransformSize();

                let itemWidth = (tWidth) / (viewport[1] - viewport[0]);
                let screenIndex = Math.floor(x / itemWidth);
                let index = viewport[0] + screenIndex;

                if (index < 0 || index >= viewport[1]) {
                    floatCtx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);
                    return;
                }

                floatCtx.save();

                floatCtx.clearRect(-10, -10, wrapper.clientWidth + 10, wrapper.clientHeight + 10);

                floatCtx.fillStyle = "rgba(0, 175, 255, 0.1)";
                floatCtx.strokeStyle = "rgba(0, 175, 255, 0.2)";

                floatCtx.fillRect(screenIndex * itemWidth, grid.top, itemWidth, tHeight);
                floatCtx.strokeRect(screenIndex * itemWidth, grid.top, itemWidth, tHeight);

                floatCtx.restore();

                let datas = layerMap(
                    (layer, name) => layer.data[index] === 'object' ? overwrite(null, layer.data[index]) : layer.data[index],
                    key => key
                );
                let time = new Date(timeline[index]);
                this.onSelect(time, datas, showTooltip(time));
            };
            const showTooltip =
                time => datas => (name, titles, formatters) => {
                    if (titles === undefined) titles = {};

                    let mainLayer = layers[name],
                        keys = Object.keys(datas),
                        html = "";

                    for (let i = 0, l = keys.length; i < l; i++) {
                        let key = keys[i],
                            layer = layers[key];

                        html += tooltipForTypes[layer.type](
                            titles[key] || key, // 타이틀
                            datas[key], // 데이터
                            formatters[key] || (v => v), // 데이터 포매터
                            layer.style.itemColor || "" // 글자색상 (예외. 캔들차트)
                        );
                    }
                    // tooltip.innerHTML = `<div>${applyDateFormatter(time, 'yyyy-MM-dd hh:mm:ss')}</div>`;
                    tooltip.innerHTML = `<div class='candle-lite-tooltip-colorpick' style='background-color:${datas[name].close > datas[name].open ? mainLayer.style.incrementItemColor : mainLayer.style.decrementItemColor}'></div>${html}`;
                };

            const setTheme = themeName => {
                theme = themes[themeName];

                wrapper.style.backgroundColor = theme.backgroundColor;

                styleForTypes = {};
                styleForTypes.candle = overwrite(null, theme.candle);
                styleForTypes.line = overwrite(null, theme.line);

                // 모든 레이어에 기본 스타일 적용.
                layerMap(layer => layer.style = overwrite(styleForTypes[layer.type], layer.style));

                style.axisColor = theme.axisColor;
                style.splitAxisColor = theme.splitAxisColor;
                style.textColor = theme.textColor;

                renderAll();
            };
            setTheme("gray");

            const resize = () => {
                // 모든 canvas 의 크기를 wrapper에 맞춤.
                canvasStack.map(canvas => {
                    canvas.width = wrapper.clientWidth;
                    canvas.height = wrapper.clientHeight;
                });
                renderAll();
            };

            /* return(define) public logics */
            this.addLayer = addLayer;
            this.setLayer = setLayer;
            this.setViewport = setViewport;
            this.getViewport = getViewport;
            this.setTimeline = setTimeline;
            this.setGrid = setGrid;
            this.setPadding = setPadding;
            this.render = () => renderAll();
            this.setTheme = setTheme;
            this.resize = resize;
            this.onSelect = () => {};
            this.setDateFormatter = dateFormatter;
        }
    }

    // define prototype logics
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

    return Chart;
})();