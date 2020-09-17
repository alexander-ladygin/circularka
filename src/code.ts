import { createCompilerHost } from "../node_modules/typescript/lib/typescript";

figma.showUI(__html__);
figma.ui.resize(190, 160);

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

const FN = {
  toRotate: function (options) {
    options.node.x = (options.pos.xc - options.node.width / 2) - Math.cos(mathRadians(options.angle)) * (options.radius);
    options.node.y = (options.pos.yc - options.node.height / 2) + Math.sin(mathRadians(options.angle)) * (options.radius);
  
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

    for (let i = 0; i < options.copies; i++) {
      options.angle = options.drnAngle + (options.angleStart + options.rotateValue * i);

      FN.toRotate(options);

      if (i < options.copies - 1) {
        options.node = options.node.clone();
        figma.currentPage.selection = figma.currentPage.selection.concat(options.node);
      }
    }
  }
};

figma.ui.onmessage = msg => {
  switch (msg.type) {
    case 'isometric-top': {
      if (!figma.currentPage.selection.length) return;

      let firstInGroup = figma.createRectangle(),
        group = figma.group([firstInGroup], figma.currentPage.selection[0].parent);

      for (const node of figma.currentPage.selection) {
        group.appendChild(node.clone());
      }
      firstInGroup.remove();

      const pos = getPositionOfSelection([group]);
      group.remove();

      // let pos = getPositionOfSelection(null);

      const resetItemRotate = false;
      const radius = 200;
      const copies = 0;
      const direction = 'bottom';
      const rotateItems = false;
      const angleStart = 0;
      const angleEnd = 360;
      const nodeCount = figma.currentPage.selection.length;
      const rotateValue = (angleEnd - angleStart) / (copies > 0 ? copies : (nodeCount > 1 ? nodeCount - 1 : nodeCount));
      let drnAngle = 270;
      let counter = 0;

      switch (direction.toLowerCase().slice(0,1)) {
        case 't': drnAngle = 270; break;
        case 'r': drnAngle = 180; break;
        case 'b': drnAngle = 90; break;
        case 'l': drnAngle = 360; break;
      }

      for (const node of figma.currentPage.selection) {
        FN[copies > 0 ? 'createCopies' : 'toRotate']({
          pos: pos,
          node: node,
          copies: copies,
          radius: radius,
          drnAngle: drnAngle,
          angleEnd: angleEnd,
          direction: direction,
          angleStart: angleStart,
          rotateItems: rotateItems,
          rotateValue: rotateValue,
          resetItemRotate: resetItemRotate,
          angle: drnAngle + (angleStart + rotateValue * counter),
        });
        counter++;
      }

      break;
    }
  }
};
