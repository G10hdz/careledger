(function () {
  var root = document.getElementById('calc-root')
  var payloadEl = document.getElementById('calc-data')
  if (!root || !payloadEl) return

  var payload = JSON.parse(payloadEl.textContent)
  var C = payload.constants
  var TEMPLATE = payload.template

  var slider = root.querySelector('[data-calc-slider]')
  var hoursLabel = root.querySelector('[data-calc-hours-label]')
  var points = root.querySelector('[data-calc-points]')
  var mxn = root.querySelector('[data-calc-mxn]')
  var usd = root.querySelector('[data-calc-usd]')
  var rest = root.querySelector('[data-calc-rest]')
  var caption = root.querySelector('[data-calc-caption]')
  var live = root.querySelector('[data-calc-live]')
  var buttons = root.querySelectorAll('[data-calc-hours]')

  if (!slider || !points) return

  function fmt(value) {
    var n = String(Math.round(value))
    var out = ''
    var count = 0
    for (var i = n.length - 1; i >= 0; i -= 1) {
      out = n.charAt(i) + out
      count += 1
      if (count % 3 === 0 && i > 0) out = ',' + out
    }
    return out
  }

  function stateFor(hours) {
    var h = Math.round(hours * 2) / 2
    var earned = Math.round(h * C.pph)
    var savings = h * C.clinical
    var restHours = (earned / C.relevoCost) * C.relevoHours
    var hoursValue = Number.isInteger(h) ? String(h) : h.toFixed(1)
    var hoursText = hoursValue + (h === 1 ? ' hora' : ' horas')
    return {
      h: h,
      hl: hoursValue + ' h',
      ht: hoursText,
      p: fmt(earned),
      m: '$' + fmt(earned * C.ppmxn) + ' MXN',
      u: '$' + fmt(savings) + ' USD',
      r: restHours.toFixed(1) + ' h',
      f: Math.round(((h - C.min) / (C.max - C.min)) * 1000) / 10,
      a: hoursText + ' por semana',
    }
  }

  function liveText(state) {
    return TEMPLATE.replace('{hours}', state.ht)
      .replace('{points}', state.p)
      .replace('{mxn}', state.m)
      .replace('{usd}', state.u)
      .replace('{rest}', state.r)
  }

  function render(hours) {
    var state = stateFor(hours)

    slider.value = String(state.h)
    slider.style.setProperty('--fill', state.f + '%')
    slider.setAttribute('aria-valuetext', state.a)

    if (hoursLabel) hoursLabel.textContent = state.hl
    points.textContent = state.p
    if (mxn) mxn.textContent = state.m
    if (usd) usd.textContent = state.u
    if (rest) rest.textContent = state.r
    if (caption) caption.textContent = 'Cuidado certificado: ' + state.ht + '.'
    if (live) live.textContent = liveText(state)

    Array.prototype.forEach.call(buttons, function (button) {
      button.setAttribute(
        'aria-pressed',
        button.getAttribute('data-calc-hours') === String(state.h) ? 'true' : 'false'
      )
    })
  }

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener('click', function () {
      render(parseFloat(button.getAttribute('data-calc-hours')))
    })
  })

  slider.addEventListener('input', function () {
    render(parseFloat(slider.value))
  })

  var pending = root.getAttribute('data-pending-hours')
  if (pending) {
    root.removeAttribute('data-pending-hours')
    render(parseFloat(pending))
  } else if (parseFloat(slider.value) !== C.initial) {
    render(parseFloat(slider.value))
  }

  root.setAttribute('data-calc-ready', 'true')
})()
