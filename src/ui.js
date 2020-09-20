import './scss/ui.scss'

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

const shiftKeyValue = 15;
const ctrlKeyValue = 30;

let shiftKeyPress = false;
let ctrlKeyPress = false;

document.addEventListener('keydown', function (e) {
  shiftKeyPress = e.shiftKey;
  ctrlKeyPress = e.ctrlKey;
});


// start range
startAngleRange.addEventListener('change', function (e) { shiftKeyPress = ctrlKeyPress = false; });
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
});

// end range
endAngleRange.addEventListener('change', function (e) { shiftKeyPress = ctrlKeyPress = false; });
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
      selectedTextItem.setAttribute('data-value', currentItem.getAttribute('data-value'));
      selectedTextItem.setAttribute('data-index', currentItem.getAttribute('data-index'));

      selectNode.classList.add('active');
      selectNode.classList.remove('hover');
    } else if (e.target.classList && e.target.classList.contains('mdc-select__selected-text')) {
      e.target.closest('.mdc-select').classList.toggle('hover');
    } else if (e.target.closest('.mdc-select__selected-text')) {
      e.target.closest('.mdc-select').classList.toggle('hover');
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