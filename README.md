<h2>Candle.js</h2>
<p>
Candle.js 는 캔들차트를 그리기 위한 라이브러리입니다.<br/>
캔들차트가 주고, 보조지표에 필요한 다른 차트타입도 사용할 수 있습니다.
</p>

<p>
지금까지 캔들차트는 다른 차트라이브러리의 부가적인 기능으로 딸려오는 경우가 많았습니다.<br/>
이는 캔들차트를 위해 필요없는 로직들을 불러오고,<br/>
대부분의 라이브러리들이 svg 방식으로 구현되어있다는 점 때문에 너무 많은 자원낭비와 속도저하를 야기했습니다.<br/>
(캔들차트와 같이 데이터량이 많은 차트를 svg로 그릴경우 심각한 속도저하가 일어납니다.)<br/>
</p>

<p><b>반면 candle.js는 앞서 설명한 문제점들을 모두 개선했습니다.</b></p>
  
<p>
candle.js의 개발지향점은 다음과 같습니다.
<ol>
  <li>
    <b>속도와 용량이 가벼워야한다.</b>
    <ul>
      <li>DOM , SVG 출력을 하지 않는다.</li>
      <li>사용자에게 너무 많은 자유도를 주지않는다.</li>
      <li>사용자의 입력값에 대한 타입체크를 피한다.</li>
    </ul>
  </li>
  <li>
    <b>빌드환경이 가벼워야 한다.</b>
  </li>
</ol>
</p>

<h2>Examples</h2>

```js
const chart = new Chart('stock-board');

chart.setTimeline(data.map(item => item.CreateTime));
chart.addLayer(
  'candle',
  {
      type: 'candle',
      data: data.map(
        item => ({
            open: item.OpenPrice,
            close: item.ClosePrice,
            high: item.HighPrice,
            low: item.LowPrice
        })
      )
  }
);

chart.render();
```

<h2>Architecture</h2>
<p><img src="http://i.imgur.com/QqDMIgS.png"/></p>

* timeline
	* 배열형태의 타임라인은 차트의 x 축 즉 시간축을 정의 합니다.
	* 문자열로 된 시간데이터를 입력하면 자동으로 Date 타입으로 변경해줍니다.
* style (globalStyle)
	* 차트 전체의 스타일을 지정합니다.
	* 레이어스타일과는 다른개념입니다.
* themes
	* theme 이란 layerStyle과 globalStyle의 설정을 저장한 개념입니다.
* viewport
	* viewport 는 차트의 보여주는 영역을 타임라인의 인덱스값으로 표현한 개념 입니다.
* events
	*
* grid
	* 차트의 위치를 잡아줍니다.
	* 이 속성을 이용해 x,y 라벨과의 위치를 맞출 수 있습니다.
* padding
    * 차트안에 여백을 줍니다.
* layer
	* type
		* candle
		* line
	* data
   		* 차트내 모든 레이어의 x 축은 timeline 데이터를 따르므로 이 속성은 y축 데이터를 의미합니다.
   	* style (layerStyle)
		* 레이어 자체의 스타일을 의미합니다.
