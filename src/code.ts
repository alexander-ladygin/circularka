import { createCompilerHost } from "../node_modules/typescript/lib/typescript";

const settingsDefault = {
  angleStart: 0,
  angleEnd: 360,
  resetItemRotate: false,
  radius: 400,
  copiesEnabled: false,
  copies: 1,
  direction: 'top',
  randomOffset: {
    enabled: false,
    min: 200,
    max: 400,
  },
  randomOrder: false,
  rotateItemsChecked: false,
  rotateItemsRandomChecked: false,
  rotateItems: false,
  counterClockwise: false
};

let UIWidth = 230;
let UIHeight = 365;

figma.showUI(__html__);
figma.ui.resize(UIWidth, UIHeight);

const wVal = 1.22465;
const hVal = 0.7070;

function mathRadians (d) {
  return d * (Math.PI / 180);
}

function getPositionOfSelection (nodes) {
  let x = [], y = [], w = [], h = [],
    sizew = [], sizeh = [];

  nodes = nodes || figma.currentPage.selection;

  for (const node of nodes) {
    x.push(node.x);
    y.push(node.y);
    w.push(node.x + node.width);
    h.push(node.y + node.height);
    sizew.push(node.width);
    sizeh.push(node.height);
  }

  let width = Math.min.apply(null, x) - Math.max.apply(null, w),
    height = Math.min.apply(null, y) - Math.max.apply(null, h);

  width = width < 0 ? width * -1 : width;
  height = height < 0 ? height * -1 : height;

  return {
    xc: Math.min.apply(null, x) + width / 2,
    yc: Math.min.apply(null, y) + height / 2,
    x: Math.min.apply(null, x),
    y: Math.min.apply(null, y),
    r: Math.max.apply(null, w),
    b: Math.max.apply(null, h),
    w: width,
    h: height,
    max: {
      w: Math.max.apply(null, sizew),
      h: Math.max.apply(null, sizeh),
    }
  };
}

function getCenter (node) {
  return {
    x: node.x + node.width / 2,
    y: node.y - node.height / 2
  };
}

function rotateByCenter (node, angle) {
  let ox = node.x,
    oy = node.y,
    idx = node.parent.children.indexOf(node);

  let x = node.width / 2,
    y = node.height / 2,
    radAngle = mathRadians(angle);

  let tx = x - x * Math.cos(radAngle) + y * Math.sin(radAngle),
    ty = y - x * Math.sin(radAngle) - y * Math.cos(radAngle);

  let rt = [
    [
      Math.cos(radAngle),
      -Math.sin(radAngle),
      tx
    ],
    [
      Math.sin(radAngle),
      Math.cos(radAngle),
      ty
    ]
  ];

  node.relativeTransform = rt;

  let group = figma.group([node], node.parent);
  group.x = ox - (group.width - node.width) / 2;
  group.y = oy - (group.height - node.height) / 2;
  group.parent.insertChild(idx, node);
}

function rMinMax (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function arrayRandomOrder (arr) {
  var ci = arr.length, tv, ri;

  while (0 !== ci) {
    ri = Math.floor(Math.random() * ci);
    ci -= 1;
    tv = arr[ci];
    arr[ci] = arr[ri];
    arr[ri] = tv;
  }

  return arr;
}

const FN = {
  toRotate: function (options) {
    options.node.x = (options.pos.xc - options.node.width / 2) - Math.cos(mathRadians(options.angle)) * (options.radius / 2);
    options.node.y = (options.pos.yc - options.node.height / 2) + Math.sin(mathRadians(options.angle)) * (options.radius / 2);

    if (!options.resetItemRotate) {
      let extra = 90;

      switch (options.direction.toLowerCase().slice(0,1)) {
        case 't': extra = 90; break;
        case 'r': extra = 360; break;
        case 'b': extra = 270; break;
        case 'l': extra = 180; break;
      }

      let angle = Math.atan2(
        (options.node.y + options.node.height / 2) - options.pos.yc,
        (options.node.x + options.node.width / 2) - options.pos.xc
      ) * (180 / Math.PI) + extra;

      if (options.rotateItems == 'random') {
        angle = Math.random() * 360;
      } else if (typeof options.rotateItems === 'number') {
        angle = options.rotateItems;
      }

      rotateByCenter(options.node, angle);
    }
  },

  createCopies: function (options) {
    options.pos = getPositionOfSelection([options.node]);
    let idx, parent;

    for (let i = 0; i < options.copies; i++) {
      options.radius = (options.randomOffset.enabled ? rMinMax(options.randomOffset.min, options.randomOffset.max) : options.radius),
      options.angle = options.drnAngle + (options.angleStart + options.rotateValue * i);
      options.i = i;

      FN.toRotate(options);

      if (i < options.copies - 1) {
        parent = options.node.parent;
        idx = parent.children.indexOf(options.node);
        options.node = options.node.clone();
        parent.insertChild(idx, options.node);
        figma.currentPage.selection = figma.currentPage.selection.concat(options.node);
      }
    }
  }
};

async function loadSettings() {
  let userOptions = await figma.clientStorage.getAsync('settings');

  if (userOptions) {
    return JSON.parse(userOptions);
  } else {
    await figma.clientStorage.setAsync('settings', JSON.stringify(settingsDefault));
    return settingsDefault;
  }
}

async function saveSettings (data) {
  await figma.clientStorage.setAsync('settings', JSON.stringify(data));
  return 'saved';
}

figma.ui.onmessage = msg => {
  switch (msg.type) {
    case 'magic': {
      if (!figma.currentPage.selection.length) return;

      let firstInGroup = figma.createRectangle(),
        group = figma.group([firstInGroup], figma.currentPage.selection[0].parent);

      for (const node of figma.currentPage.selection) {
        group.appendChild(node.clone());
      }
      firstInGroup.remove();

      const pos = getPositionOfSelection([group]);
      group.remove();

      let items = msg.data.randomOrder ? arrayRandomOrder([...figma.currentPage.selection]) : figma.currentPage.selection;

      const angleStart = msg.data.angleStart;
      const angleEnd = msg.data.angleEnd;
      const resetItemRotate = msg.data.resetItemRotate;
      const radius = msg.data.radius;
      const copies = msg.data.copies;
      const copiesEnabled = msg.data.copiesEnabled;
      const direction = msg.data.direction;
      const rotateItems = msg.data.rotateItems;
      const counterClockwise = msg.data.counterClockwise ? 1 : -1;
      const randomOffset = {
        enabled: msg.data.randomOffset.enabled,
        min: msg.data.randomOffset.min,
        max: msg.data.randomOffset.max,
      };

      const nodeCount = items.length;
      const rotateValue = (angleEnd - angleStart) / (copiesEnabled && copies > 0 ? copies : nodeCount);
      let drnAngle = 270;
      
      switch (direction.toLowerCase().slice(0,1)) {
        case 't': drnAngle = 270; break;
        case 'r': drnAngle = 180; break;
        case 'b': drnAngle = 90; break;
        case 'l': drnAngle = 360; break;
      }
      
      let counter = 0;
      for (const node of items) {
        FN[copiesEnabled && copies > 0 ? 'createCopies' : 'toRotate']({
          i: counter,
          pos: pos,
          node: node,
          copies: copies,
          radius: (randomOffset.enabled ? rMinMax(randomOffset.min, randomOffset.max) : radius),
          drnAngle: drnAngle,
          angleEnd: angleEnd,
          direction: direction,
          angleStart: angleStart,
          rotateItems: rotateItems,
          rotateValue: rotateValue,
          randomOffset: randomOffset,
          resetItemRotate: resetItemRotate,
          randomOrder: msg.data.randomOrder,
          angle: drnAngle + (angleStart + rotateValue * counter) * counterClockwise,
        });
        counter++;
      }

      break;
    }
    case 'resize': {
      UIWidth += (+msg.extraWidth);
      UIHeight += (+msg.extraHeight);
      figma.ui.resize(UIWidth, UIHeight);

      break;
    }
    case 'loadSettings': {
      let settings = loadSettings()
        .then(settings => {
          figma.ui.postMessage({
            type: 'applyToHTMLSettings',
            settings: settings
          });
        });

      break;
    }
    case 'saveSettings': {
      saveSettings(msg.settings)
        .then((message) => {
          figma.ui.postMessage({
            type: 'settingsSaved',
            message: 'Settings saved! ;)'
          });
        });

      break;
    }
  }
};
