const applyDateFormatter = (d, f) => {
    return f.replace(/(yyyy|yy|MM|dd|hh|mm|ss)/gi, function ($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return zf(d.getFullYear() % 1000, 2);
            case "MM": return zf(d.getMonth() + 1, 2);
            case "dd": return zf(d.getDate(), 2);
            case "HH": return zf(d.getHours(), 2);
            case "hh": return zf((h = d.getHours() % 12) ? h : 12, 2);
            case "mm": return zf(d.getMinutes(), 2);
            case "ss": return zf(d.getSeconds(), 2);
            default: return $1;
        }
    });
};
const zf = (e, l) => {
    if (typeof e === "number") e = e.toString();
    if (typeof e === "string") {
        var s = '', i = 0;
        while (i++ < l - e.length) { s += "0"; }
        return s + e;
    }
};
class Chart {
    constructor(domId) {
        let wrapper = document.getElementById(domId);
        if (wrapper === null) {
            console.error(`Stock.js :: dom id(${domId})와 일치하는 객체를 찾지 못하였습니다.`);
            return;
        }

        /* wrapper style settings */
        wrapper.style.position = 'relative';

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

            return { canvas, context };
        };

        /* initialize */
        const init =
            {
                // type 에 의존하는 속성값들
                // - formatter
                // - renderItem (renderForTypes 변수 참조.)
                // - 항상최솟값을 같는 key 값을 반환하는 함수. (getMinForTypes 참조)
                // - 항상최대값을 같는 key 값을 반환하는 함수. (getMaxForTypes 참조)
                // - style의 일부 속성들
                type: 'candle',
                grid: {
                    top: 0,
                    right: 100,
                    bottom: 30,
                    left: 100
                },
                style: {
                    gap: 0.2,
                    // yLabelAlign
                    // : right
                    // : left
                    yLabelAlign: "left",
                    yLabelWidth: 100,

                    // xLabelAlign
                    // : top
                    // : bottom
                    xLabelAlign: "bottom",
                    xLabelHeight: 30
                },
                formatters: {
                    // candle : return key names : 'open', 'high', 'close', 'low'
                    candle: item => ({ open: item.open, close: item.close, high: item.high, low: item.low })
                },
                dateFormatter: "MM-dd HH:mm"
            };

        /* Variable 정의 */
        let layers = {};
        let viewport = []; /* 0 : start / 1 : end */
        let timeline = [];
        let { grid, style, dateFormatter } = init;

        // X,Y 축 캔버스 Context 정의
        // 라벨이 업데이트 될 때.
        // - setViewport 로 뷰포트가 업데이트 되었을 경우.
        // - addLayer 로 layer의 속성이 변경 되었을 경우.
        // - setTimeline 로 x축 값이 변경 되었을 경우.
        const xLabelCtx = makeCanvas().context;
        const yLabelCtx = makeCanvas().context;

        /* 레이어 타입에 따른 메소드 정의 */
        const renderForTypes = {
            candle: ({ ctx, x, itemWidth, height, min, max }, { open, close, high, low }) => {
                let { top, bottom, left, right } = grid;

                let y = top - map(Math.max(open, close), min, max, top, height),
                    h = top - map(Math.min(open, close), min, max, top, height) - y,
                    t = top - map(high, min, max, top, height),
                    b = top - map(low, min, max, top, height);

                ctx.beginPath();
                ctx.moveTo(f(x + itemWidth * 0.5), f(t));
                ctx.lineTo(f(x + itemWidth * 0.5), f(y));
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(f(x + itemWidth * 0.5), f(y + h));
                ctx.lineTo(f(x + itemWidth * 0.5), f(b));
                ctx.closePath();
                ctx.stroke();

                ctx.fillStyle = close > open ? 'green' : 'red';
                ctx.fillRect(f(x + itemWidth * 0.1), f(y), f(itemWidth * 0.8), f(h));
                ctx.strokeRect(f(x + itemWidth * 0.1), f(y), f(itemWidth * 0.8), f(h));
            }
        };
        const getMinForTypes = {
            candle: item => item.low,
        };
        const getMaxForTypes = {
            candle: item => item.high,
        };

        // 유틸 메소드
        const overwrite = (target, base) => {
            let bKeys = Object.keys(base);
            for (let i = 0, l = bKeys.length; i < l; i++) {
                let key = bKeys[i];
                if (target[key] === undefined) target[key] = base[key];
            }
            return target;
        };
        const map = (n, a, b, c, d) => ((n - a) / (b - a)) * (d - c) + c;
        const f = Math.floor;

        // 레이어 메소드

        const addLayer = (name, { type, data, formatter }) => { /* 라이브러리에 관련된 객체셋팅. */
            if (layers[name] !== undefined) {
                console.error("Stock.js :: 이미 존재하는 레이어이름 입니다.");
                return;
            }
            let layer = makeCanvas();

            layer.type = type || init.layer.type;
            layer.formatter = formatter || init.formatters[layer.type];
            layer.data = data ? applyFormatter(data, layer.formatter) : [];

            layers[name] = layer;
            render(layer);
        };
        const setLayer = (name, { type, data, formatter }) => {
            let layer = layer[name];

            layer.type = type || layer.type;
            layer.formatter = formater || layer.formatter;
            layer.data = data ? applyFormatter(data, layer.formatter) : [];

            render(layer);
        };
        const applyFormatter = (data, formatter) => {
            let r = [];
            for (let i = 0; i < data.length; i++) {
                r.push(formatter(data[i]));
            }
            return r;
        };

        // 뷰포트 메소드
        const setViewport = (s, e) => {
            viewport[0] = Math.min(s, e);
            viewport[1] = Math.max(s, e);
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

        // 그리드 메소드
        const setGrid = pGrid => {
            grid = overwrite(pGrid, grid);
            renderAll();
        }

        // 스타일 메소드
        const setStyle = pStyle => {
            style = overwrite(pStyle, style);
            renderAll();
        }

        /* 레이어 화면출력 */
        const render = layer => {
            let { data, type, formatter, context, canvas } = layer;
            let { width, height } = canvas;

            if (viewport[0] === undefined || viewport[1] === undefined) {
                setViewport(0, timeline.length);
            }

            /* 레이어 타입에 따른 메소드를 가져온다. */
            let renderItem = renderForTypes[type];
            let getMin = getMinForTypes[type];
            let getMax = getMaxForTypes[type];

            let min = Infinity,
                max = -Infinity;
            for (let i = viewport[0], l = viewport[1]; i < l; i++) {

                let _min = getMin(data[i]);
                let _max = getMax(data[i]);

                if (min > _min) min = _min;
                if (max < _max) max = _max;

            }
            let itemWidth = (canvas.width - grid.right - grid.left) / (viewport[1] - viewport[0]);

            // 라벨 스타일
            let { xLabelHeight, xLabelAlign, yLabelWidth, yLabelAlign } = style;

            context.save();
            xLabelCtx.save();

            // Clear
            context.clearRect(-10, -10, width + 10, height + 10);
            xLabelCtx.clearRect(-10, -10, width + 10, height + 10);

            // Translate
            context.translate(grid.left, height - grid.bottom);
            xLabelCtx.translate(grid.left, 0);

            // Xlabel Settings
            xLabelCtx.textBaseline = "middle";
            xLabelCtx.textAlign = "center";
            xLabelCtx.font = "12px 'Apple SD Gothic Neo',arial,sans-serif";

            for (let i = viewport[0], l = viewport[1]; i < l; i++) {
                let x = (i - viewport[0]) * itemWidth;

                renderItem({ ctx: context, height: height - grid.bottom, x, itemWidth, min, max }, data[i]);

                if (i === l - 1 || (viewport[1] - i) % 10 === 0) {

                    xLabelCtx.fillText(
                        applyDateFormatter(timeline[i], dateFormatter),
                        f(x + itemWidth * 0.5),
                        f(xLabelAlign === 'top' ? (xLabelHeight / 2) : height - (xLabelHeight / 2))
                    );

                }
            }

            xLabelCtx.restore();
            context.restore();
        };
        const renderXLabel = () => {
        };
        const renderYLabels = () => {
            let ctx = yLabelCtx;
            let canvas = ctx.canvas;

            let { yLabelWidth, yLabelAlign } = style;
            let x = yLabelAlign === 'left' ? 0 : canvas.width - yLabelWidth;

            ctx.save();
            ctx.fillRect(x, grid.top, yLabelWidth, canvas.height - grid.top - grid.bottom);
            ctx.restore();
        };
        const renderAll = () => {
            renderYLabels();

            Object.keys(layers).map(key => render(layers[key]));
        };

        /* 이벤트 리스너 등록 */
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
            // 이동값이 10px 이상일 경우, 좌 또는 우로 데이터 1개만큼 뷰포트 이동. (speed = 1)
            if (mousedown === true && prevMouseX !== null && Math.abs(delta) >= 10) {
                e.preventDefault();

                let direction = delta < 0 ? -1 : 1
                    , velocity = direction * 1
                    , nextViewport = [viewport[0] + velocity, viewport[1] + velocity];

                if (nextViewport[0] < 0 || nextViewport[1] > timeline.length) return;

                setViewport(nextViewport[0], nextViewport[1]);
                prevMouseX = e.clientX;
            }
        });

        /* return(define) public logics */
        this.addLayer = addLayer;
        this.setLayer = setLayer;
        this.setViewport = setViewport;
        this.getViewport = getViewport;
        this.setTimeline = setTimeline;
        this.render = name => render(layers[name]);
        this.setGrid = setGrid;
    }
}