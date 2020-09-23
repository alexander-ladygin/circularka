import './scss/ui.scss'

const uiSizeExtra = 60;

// user settings
parent.postMessage({ pluginMessage: {
  type: 'loadSettings'
} }, '*');

window.onmessage = async (event) => {
  if (event.data.pluginMessage.type === 'applyToHTMLSettings') {
    applyToHTMLSettings(event.data.pluginMessage.settings);
  }
};

function saveSettings() {
  parent.postMessage({ pluginMessage: {
    type: 'saveSettings',
    settings: {
      angleStart: +document.getElementById('startAngle').value,
      angleEnd: +document.getElementById('endAngle').value,
      resetItemRotate: document.getElementById('resetRotateItems').checked,
      radius: +document.getElementById('radius').value,
      copiesEnabled: document.getElementById('copiesEnabled').checked,
      copies: document.getElementById('copies').value,
      direction: document.getElementById('direction').getAttribute('data-value'),
      randomOffset: {
        enabled: document.getElementById('randomOffsetEnabled').checked,
        min: +document.getElementById('randomOffsetMin').value,
        max: +document.getElementById('randomOffsetMax').value,
      },
      rotateItemsChecked: document.getElementById('rotateEachItems').checked,
      rotateItemsRandomChecked: document.getElementById('rotateEachItemsRandom').checked,
      rotateItems: document.getElementById('rotateEachItems').checked ? (document.getElementById('rotateEachItemsRandom').checked ? 'random' : +document.getElementById('rotateItemsValueRange').value) : false,
      counterClockwise: document.getElementById('counterClockwise').checked,
      changeAutomatic: document.getElementById('changeAutomatic').checked
    }
  } }, '*');
}

function applyToHTMLSettings (data) {
  let extraHeight = 0;

  document.getElementById('startAngle').value = data.angleStart;
  document.getElementById('endAngle').value = data.angleEnd;
  document.getElementById('startAngleInput').value = data.angleStart;
  document.getElementById('endAngleInput').value = data.angleEnd;

  document.getElementById('resetRotateItems').checked = data.resetItemRotate;
  document.getElementById('radius').value = data.radius;
  document.getElementById('copies').value = data.copies;
  document.getElementById('copiesEnabled').checked = data.copiesEnabled;
  document.querySelector('.copies').classList.toggle('none', !data.copiesEnabled);
  if (data.copiesEnabled) {
    extraHeight += 45;
  }

  let dNode = document.getElementById('direction'),
    dItem = dNode.querySelector('.mdc-select__menu [data-value="' + data.direction + '"]');
  dNode.setAttribute('data-value', data.direction);
  dNode.setAttribute('data-index', dItem.getAttribute('data-index'));
  dNode.querySelector('.mdc-select__selected-text').innerHTML = dItem.innerText;

  document.getElementById('randomOffsetEnabled').checked = data.randomOffset.enabled;
  document.querySelector('.randomOffsetGroup').classList.toggle('none', !data.randomOffset.enabled);

  let random = document.getElementById('rotateEachItemsRandom');
  if (data.randomOffset.enabled) random.parentNode.removeAttribute('disabled');
    else random.parentNode.setAttribute('disabled', '');

  if (data.randomOffset.enabled) {
    extraHeight += 60;
  }
  document.getElementById('randomOffsetMin').value = data.randomOffset.min;
  document.getElementById('randomOffsetMax').value = data.randomOffset.max;

  document.getElementById('rotateEachItems').checked = data.rotateItemsChecked;
  document.querySelector('.rotateItemsValueGroup').classList.toggle('none', !data.rotateItemsChecked);
  if (data.rotateItemsChecked) {
    extraHeight += 60;
  }
  document.getElementById('rotateEachItemsRandom').checked = (data.rotateItemsRandomChecked);
  let rotateValueNode = document.querySelector('.rotateItemsValueGroup');
  if (data.rotateItemsRandomChecked) rotateValueNode.setAttribute('disabled', '');
    else rotateValueNode.removeAttribute('disabled');

  document.getElementById('rotateItemsValueRange').value = (typeof data.rotateItems === 'number' ? data.rotateItems : 180);
  document.getElementById('rotateItemsValueInput').value = document.getElementById('rotateItemsValueRange').value;

  document.getElementById('counterClockwise').checked = data.counterClockwise;
  document.getElementById('changeAutomatic').checked = data.changeAutomatic;
  if (data.changeAutomatic) {
    document.getElementById('apply').setAttribute('disabled', '');
  }

  if (extraHeight > 0) {
    parent.postMessage({ pluginMessage: {
      type: 'resize',
      extraWidth: 0,
      extraHeight: extraHeight
    } }, '*');
  }
}

function inputMouseWheel (e) {
  e.preventDefault();

  let node = e.target;
  let round = e.shiftKey || e.ctrlKey || e.altKey;
  let step = e.shiftKey ? 10 : (e.ctrlKey ? (e.altKey ? 100 : 5) : 1);
  let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
  let nodeValue = +node.value;
  let newValue = nodeValue + step * delta;

  if (newValue >= 0) {
    if (round && delta < 0) {
      if (newValue % step === 0) {
        node.value = newValue;
      } else {
        node.value = Math.ceil(nodeValue / 10) * 10 - step;
      }
    } else if (round && delta > 0) {
      if (newValue % step === 0) {
        node.value = newValue;
      } else {
        node.value = Math.floor(nodeValue / 10) * 10 + step;
      }
    } else {
      node.value = newValue;
    }
  } else {
    node.value = 0;
  }

}

const startAngleRange = document.getElementById('startAngle');
const startAngleInput = document.getElementById('startAngleInput');

const endAngleRange = document.getElementById('endAngle');
const endAngleInput = document.getElementById('endAngleInput');

const rotateItemsValueRange = document.getElementById('rotateItemsValueRange');
const rotateItemsValueInput = document.getElementById('rotateItemsValueInput');

const shiftKeyValue = 15;
const ctrlKeyValue = 30;

let shiftKeyPress = false;
let ctrlKeyPress = false;

document.addEventListener('keydown', function (e) {
  shiftKeyPress = e.shiftKey;
  ctrlKeyPress = e.ctrlKey;
});


// start range
startAngleRange.addEventListener('change', function (e) {
  shiftKeyPress = ctrlKeyPress = false;
  run();
});
startAngleRange.addEventListener('input', function (e) {
  if (shiftKeyPress) this.value = Math.round(this.value / shiftKeyValue) * shiftKeyValue;
    else if (ctrlKeyPress) this.value = Math.round(this.value / ctrlKeyValue) * ctrlKeyValue;

  startAngleInput.value = Math.round(this.value);

  if (Math.round(this.value) > Math.round(endAngleRange.value)) {
    endAngleRange.value = endAngleInput.value = (Math.round(this.value) - 1 < 360 ? Math.round(this.value) : Math.round(this.value) + 1);
  }
});
startAngleInput.addEventListener('change', function (e) {
  this.value = startAngleRange.value = (Math.round(this.value) < 0 ? 0 : (Math.round(this.value) > 360 ? 360 : Math.round(this.value)));

  if (Math.round(this.value) > Math.round(endAngleRange.value)) {
    endAngleRange.value = endAngleInput.value = (Math.round(this.value) - 1 < 360 ? Math.round(this.value) : Math.round(this.value) + 1);
  }

  shiftKeyPress = ctrlKeyPress = false;
  run();
});

// end range
endAngleRange.addEventListener('change', function (e) {
  shiftKeyPress = ctrlKeyPress = false;
  run();
});
endAngleRange.addEventListener('input', function (e) {
  if (shiftKeyPress) this.value = Math.round(this.value / shiftKeyValue) * shiftKeyValue;
    else if (ctrlKeyPress) this.value = Math.round(this.value / ctrlKeyValue) * ctrlKeyValue;

  endAngleInput.value = Math.round(this.value);

  if (Math.round(this.value) < Math.round(startAngleRange.value)) {
    startAngleRange.value = startAngleInput.value = (Math.round(this.value) - 1 < 0 ? Math.round(this.value) : Math.round(this.value) - 1);
  }
});
endAngleInput.addEventListener('change', function (e) {
  this.value = endAngleRange.value = (Math.round(this.value) < 0 ? 0 : (Math.round(this.value) > 360 ? 360 : Math.round(this.value)));

  if (Math.round(this.value) < Math.round(startAngleRange.value)) {
    startAngleRange.value = startAngleInput.value = (Math.round(this.value) - 1 < 0 ? Math.round(this.value) : Math.round(this.value) - 1);
  }

  shiftKeyPress = ctrlKeyPress = false;
  run();
});

// rotate each items
rotateItemsValueRange.addEventListener('change', function (e) {
  shiftKeyPress = ctrlKeyPress = false;
  run();
});
rotateItemsValueRange.addEventListener('input', function (e) {
  if (shiftKeyPress) this.value = Math.round(this.value / shiftKeyValue) * shiftKeyValue;
    else if (ctrlKeyPress) this.value = Math.round(this.value / ctrlKeyValue) * ctrlKeyValue;

    rotateItemsValueInput.value = Math.round(this.value);
});
rotateItemsValueInput.addEventListener('change', function (e) {
  this.value = rotateItemsValueRange.value = (Math.round(this.value) < 0 ? 0 : (Math.round(this.value) > 360 ? 360 : Math.round(this.value)));

  shiftKeyPress = ctrlKeyPress = false;
  run();
});

// mdc-selec
[].forEach.call(document.querySelectorAll('.mdc-select'), function (select) {
  select.addEventListener('click', function (e) {
    let currentItem = e.target.closest('.mdc-select__menu__item'),
      selectedTextItem = e.target;

    if (currentItem) {
      let selectNode = currentItem.closest('.mdc-select'),
        selectedTextItem = selectNode.querySelector('.mdc-select__selected-text');

      selectedTextItem.innerHTML = currentItem.innerText;
      selectNode.setAttribute('data-value', currentItem.getAttribute('data-value'));
      selectNode.setAttribute('data-index', currentItem.getAttribute('data-index'));

      selectNode.classList.add('active');
      selectNode.classList.remove('hover');

      run();
    } else if (e.target.classList && e.target.classList.contains('mdc-select__selected-text')) {
      e.target.closest('.mdc-select').classList.toggle('hover');
    } else if (e.target.closest('.mdc-select__selected-text')) {
      e.target.closest('.mdc-select').classList.toggle('hover');
    }
  });

  select.addEventListener('mousewheel', function (e) {
    let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)) * -1,
      index = +this.getAttribute('data-index'),
      l = this.querySelectorAll('.mdc-select__menu__item').length,
      newIndex = index + delta;

    if (newIndex >= 0 && newIndex < l) {
      this.setAttribute('data-index', newIndex);
      this.setAttribute('data-value', this.querySelector(`[data-index="${newIndex}"]`).getAttribute('data-value'));
      this.querySelector('.mdc-select__selected-text').innerHTML = this.querySelector(`[data-index="${newIndex}"]`).innerText;

      run();
    }
  });
});

document.addEventListener('click', function (e) {
  if (!e.target.closest('.mdc-select')) {
    [].forEach.call(document.querySelectorAll('.mdc-select'), function (s) {
      s.classList.remove('hover');
    });
  }
});

// checkbox
document.getElementById('resetRotateItems').addEventListener('change', function (e) {
  run();
});
document.getElementById('counterClockwise').addEventListener('change', function (e) {
  run();
});

document.getElementById('rotateEachItems').addEventListener('change', function (e) {
  let random = document.getElementById('rotateEachItemsRandom');
  if (this.checked) random.parentNode.removeAttribute('disabled');
    else random.parentNode.setAttribute('disabled', '');

  document.querySelector('.rotateItemsValueGroup').classList.toggle('none', !this.checked);
  parent.postMessage({ pluginMessage: {
    type: 'resize',
    extraWidth: 0,
    extraHeight: this.checked ? 60 : -60
  } }, '*');

  run();
});
document.getElementById('rotateEachItemsRandom').addEventListener('change', function (e) {
  let rotateValueNode = document.querySelector('.rotateItemsValueGroup');
  if (!this.checked) rotateValueNode.removeAttribute('disabled');
    else rotateValueNode.setAttribute('disabled', '');

  run();
});

document.getElementById('copies').addEventListener('change', function (e) {
  run();
});
document.getElementById('copiesEnabled').addEventListener('change', function (e) {
  document.querySelector('.copies').classList.toggle('none', !this.checked);
  parent.postMessage({ pluginMessage: {
    type: 'resize',
    extraWidth: 0,
    extraHeight: this.checked ? 35 : -35
  } }, '*');

  run();
});

document.getElementById('randomOffsetEnabled').addEventListener('change', function (e) {
  document.querySelector('.randomOffsetGroup').classList.toggle('none', !this.checked);
  parent.postMessage({ pluginMessage: {
    type: 'resize',
    extraWidth: 0,
    extraHeight: this.checked ? 60 : -60
  } }, '*');

  run();
});

// material button ripple effet
function mdcButtonRipple (btn, e) {
  let rippleNode = document.createElement('span'),
    rippleDefaultSize = 30,
    offsetX = btn.offsetLeft,
    offsetY = btn.offsetTop,
    bnds = btn.getBoundingClientRect();

  rippleNode.className = 'mdc-button__ripple';
  rippleNode.style.left = (e.clientX - bnds.x - rippleDefaultSize / 2) + 'px';
  rippleNode.style.top = (e.clientY - bnds.y - rippleDefaultSize / 2) + 'px';

  btn.appendChild(rippleNode);

  setTimeout(() => {
    rippleNode.remove();
  }, 800);
}
document.addEventListener('click', function (e) {
  if (e.target.classList && e.target.classList.contains('mdc-button')) {
    mdcButtonRipple(e.target, e);
  } else if (e.target.closest('.mdc-button')) {
    mdcButtonRipple(e.target.closest('.mdc-button'), e);
  }
});

// start magic
document.getElementById('changeAutomatic').addEventListener('change', function (e) {
  if (this.checked) document.getElementById('apply').setAttribute('disabled', '');
    else document.getElementById('apply').removeAttribute('disabled');
  saveSettings();
});
document.getElementById('apply').addEventListener('click', function (e) {
  run(true);
});

// fn
function run (isApplyButton) {
  saveSettings();
  if (!isApplyButton && !document.getElementById('changeAutomatic').checked) return;

  let data = {
    angleStart: +document.getElementById('startAngle').value,
    angleEnd: +document.getElementById('endAngle').value,
    resetItemRotate: document.getElementById('resetRotateItems').checked,
    radius: +document.getElementById('radius').value,
    copiesEnabled: document.getElementById('copiesEnabled').checked,
    copies: document.getElementById('copies').value,
    direction: document.getElementById('direction').getAttribute('data-value'),
    randomOffset: {
      enabled: document.getElementById('randomOffsetEnabled').checked,
      min: +document.getElementById('randomOffsetMin').value,
      max: +document.getElementById('randomOffsetMax').value,
    },
    rotateItemsChecked: document.getElementById('rotateEachItems').checked,
    rotateItemsRandomChecked: document.getElementById('rotateEachItemsRandom').checked,
    rotateItems: document.getElementById('rotateEachItems').checked ? (document.getElementById('rotateEachItemsRandom').checked ? 'random' : +document.getElementById('rotateItemsValueRange').value) : false,
    counterClockwise: document.getElementById('counterClockwise').checked,
  };

  parent.postMessage({ pluginMessage: {
    type: 'magic',
    data: data
  } }, '*');
}