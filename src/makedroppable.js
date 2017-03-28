function triggerCallback(e, callback) {
    if (!callback || typeof callback !== 'function') {
        return
    }
    var files
    if (e.dataTransfer) {
        files = e.dataTransfer.files
    } else if (e.target) {
        files = e.target.files
    }
    callback.call(null, files)
}

module.exports = function makeDroppable(accept, multiple, ele, callback) {
    var input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', accept)
    input.setAttribute('multiple', multiple)
    input.style.display = 'none'
    input.addEventListener('change', function (e) {
        triggerCallback(e, callback)
    })
    ele.appendChild(input)

    ele.addEventListener('dragover', function (e) {
        e.preventDefault()
        e.stopPropagation()
        ele.classList.add('dragover')
    })

    ele.addEventListener('dragleave', function (e) {
        e.preventDefault()
        e.stopPropagation()
        ele.classList.remove('dragover')
    })

    ele.addEventListener('drop', function (e) {
        e.preventDefault()
        e.stopPropagation()
        ele.classList.remove('dragover')
        triggerCallback(e, callback)
    })

    ele.addEventListener('click', function () {
        input.value = null
        input.click()
    })
}