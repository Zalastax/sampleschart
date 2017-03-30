require('file-loader?name=[name].[ext]!./index.html')

var Chart = require('chart.js')
var Papa = require('papaparse')
var groupBy = require('lodash.groupby')
var keys = require('lodash.keys')
var makeDroppable = require('./makedroppable')
require('./modal')

var data = undefined
window.visibleChart = undefined
window.chartToDownload = undefined
var hiddenLegends = []
var downloadDataOriginal = undefined

function readSingleFile(files) {
    var f = files[0]

    if (f) {
        Papa.parse(f, {
            header: true,
            before: function (file, inputElem) {
                console.log("Parsing file...", file)
            },
            error: function (err, file) {
                console.log("ERROR:", err, file)
                alert("Failed to parse file")
            },
            complete: function (results) {
                data = results
                showCustomizers()
                updateChart()
            }
        })
    } else {
        alert("Failed to load file")
    }
}

function funColor() {
    var hue = Math.floor(Math.random() * 361)
    var lightness = Math.floor(40 + Math.random() * 20)
    return 'hsl(' + hue + ',100%,' + lightness + '%)'
}

function onUpdate(e) {
    e.preventDefault()
    updateChart()
}

function contains(arr, searchElement) {
    return arr.indexOf(searchElement) > -1
}

function options(fields, selectedField) {
    return fields.map(function (field) {
        var selected = ''
        if (field === selectedField) {
            selected = ' selected'
        }
        return '<option value="' + field + '"' + selected + '>' + field + '</option>'
    }).join('')
}

function showCustomizers() {
    customizersEl.style.visibility = 'visible'
    var fields = data.meta.fields

    var valueFields = fields.slice()
    var elements = [groupEl, xEl, yEl]
    elements.forEach(function (el) {
        var value = el.value
        var temp = valueFields.filter(function (v) {
            return v != value
        })

        if (valueFields.length > temp.length) {
            valueFields = temp
        } else {
            value = valueFields.shift()
        }

        el.innerHTML = options(fields, value)
    })
}

function chartData() {
    var group = groupEl.value
    var x = xEl.value
    var y = yEl.value

    var filtered = data.data.filter(function (v) {
        return (v[x] != null && v[y] != null && v[group] != null)
    })
    var grouped = groupBy(filtered, group)
    var labels = keys(groupBy(filtered, x)).map(function (v) {return +v}).sort(function(a,b){return a - b})
    var lineLabels = keys(grouped)
    var datasets = lineLabels.map(function (label) {
        var items = grouped[label]
        var data = items.map(function (v) {
            return {
                x: v[x],
                y: v[y],
            }
        })
        return {
            label: label,
            data: data,
            fill: false,
            spanGaps: true,
            borderColor: funColor(),
        }
    })

    return {
        labels: labels,
        datasets: datasets
    }


}

function chartOptions(dataset) {
    var scale = scaleEl.value

    return {
        type: 'line',
        data: dataset,
        options: {
            scales: {
                yAxes: [{
                    type: scale,
                    ticks: {
                        beginAtZero: true,
                    }
                }]
            },
            responsive: true,
            maintainAspectRatio: false
        }
    }
}

function clone(data) {
    return JSON.parse(JSON.stringify(data))
}

function legendOnClick(e, legendItem) {
    var index = legendItem.datasetIndex
    var ci = this.chart
    var meta = ci.getDatasetMeta(index)

    // See controller.isDatasetVisible comment
    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null

    if (meta.hidden) {
        hiddenLegends.push(legendItem.text)
    } else {
        hiddenLegends.filter(function (item) {
            return item !== legendItem.text
        })
    }

    ci.update()
    window.chartToDownload.data.datasets = downloadDataOriginal.filter(function (dataset) {
        return !contains(hiddenLegends, dataset.label)
    })
    window.chartToDownload.update()
}

function updateChart() {
    if (data == null) {
        return
    }

    hiddenLegends = []
    var myData = chartData()
    var downloadData = clone(myData)
    downloadDataOriginal = clone(myData.datasets)
    var visibleChartOptions = chartOptions(myData)
    var downloadChartOptions = chartOptions(downloadData)

    visibleChartOptions.options.legend = {
        onClick: legendOnClick
    }

    window.visibleChart = new Chart('chart', visibleChartOptions)
    window.chartToDownload = new Chart('downloadChart', downloadChartOptions)
}

var groupEl = document.getElementById('group')
var xEl = document.getElementById('x')
var yEl = document.getElementById('y')
var scaleEl = document.getElementById('scale')
var customizersEl = document.getElementById('customizers')

var onchangeEls = [groupEl, xEl, yEl, scaleEl]

onchangeEls.forEach(function (el) {
    el.onchange = onUpdate
})

makeDroppable(
    '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    false,
    document.getElementById('filedrop'),
    readSingleFile
)
