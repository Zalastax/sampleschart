var modalEl = document.getElementById('downloadModal');
var openDownloadModalEl = document.getElementById("openDownloadModal");
var closeEl = document.getElementsByClassName("close")[0];
var widthEl = document.getElementById('width')
var heightEl = document.getElementById('height')
var downloadWrapperEl = document.getElementById('downloadWrapper')
var downloadEl = document.getElementById('download')

function downloadChart(link, chart, filename) {
    link.href = chart.toBase64Image()
    link.download = filename
}

downloadEl.onclick = function (e) {
    downloadChart(this, window.chartToDownload, 'chart.png')
}

widthEl.onchange = function () {
    downloadWrapperEl.style.width = this.value;
}

heightEl.onchange = function () {
    downloadWrapperEl.style.height = this.value;
}

openDownloadModalEl.onclick = function (e) {
    e.preventDefault()
    modalEl.style.display = "block"
    document.body.style.overflow = "hidden"
    var chart = window.visibleChart.chart
    widthEl.value = chart.width
    widthEl.onchange.call(widthEl)
    heightEl.value = chart.height
    heightEl.onchange.call(heightEl)
}

function closeModal() {
    document.body.style.overflow = "auto"
    modalEl.style.display = "none"
}

closeEl.onclick = closeModal
window.onclick = function (event) {
    if (event.target == modalEl) {
        closeModal()
    }
}
