Chart.addTheme("blue", {
    globalStyle: {
        backgroundColor: '#0431B4',
        labelColor: '#eee',
        axisColor: '#bbb',
        splitAxisColor: 'rgba(255,255,255,0.1)',
        tooltipTitleColor: '#E4E8F4',
        textColor: '#E4E8F4',
        tooltipBackgroundColor: 'rgba(255,255,255,0.1)',
        focusBackgroundColor: "rgba(255,255,255,0.1)",
        focusBorderColor: 'rgba(255,255,255,0.1)'
    },
    layerStyle: {
        candle: {
            incrementItemColor: '#9299FF',
            decrementItemColor: '#FA5858',
        },
        line: {
            itemColor: '#999'
        }
    }
});