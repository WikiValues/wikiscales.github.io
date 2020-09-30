"use strict";

var urlToCopy = document.getElementById("urlToCopy");
if (urlToCopy) {
  urlToCopy.innerHTML = location.href;
}

function shareLink() {
  var urlToCopy = document.getElementById("urlToCopy");
  var urlToCopyContainer = document.getElementById("urlToCopyContainer");

  try {
    if (document.body.createTextRange) {
      // for Internet Explorer
      var range = document.body.createTextRange();
      range.moveToElementText(urlToCopy);
      range.select();
      document.execCommand("Copy");
    } else if (window.getSelection) {
      // other browsers
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(urlToCopy);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("Copy");
    }
    var button = document.getElementById("buttonLink");
    if (button) {
      button.className = "button buttonLinkGood";
      setTimeout(function() {
        var buttonTimeout = document.getElementById("buttonLink");
        if (buttonTimeout) button.className = "button buttonLink";
      }, 2000);
    }
  } catch (err) {}
}

function getQueryVariable(variable) {
  var query = window.atob(window.location.search.substring(1));
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      if (pair[1] == "NaN") {
        return 0;
      } else {
        return pair[1] / 100;
      }
    }
  }
  return 0;
}

function setAxisValue(name, value) {
  var axis = document.getElementById(name);
  if (!axis) return;

  var text = document.getElementById(name + "Text");
  if (!text) return;

  axis.style.width = (100 * value).toFixed(1) + "%";

  text.innerHTML = (100 * value).toFixed(0) + "%";
  if (text.offsetWidth > axis.offsetWidth - 5) text.style.display = "none";
  else text.style.display = "";
}

function setBonus(name, value, limit) {
  var axis = document.getElementById(name);
  if (!axis) return;

  if (value > limit) {
    axis.style.display = "flex";
    axis.style.opacity = value * value;
  } else {
    axis.style.display = "none";
  }
}

var axes = ["c", "b", "p", "m", "s", "j", "t"];

var bonus = {
  инклюз: 0.5,
  удали: 0.5,
  когда: 0.5,
  немедли: 0.5,
  об: 0.5,
  раз: 0.5,
  мета: 0.5,
  экзо: 0.5,
  моно: 0.5,
  поли: 0.5,
  реф: 0.5,
  реакц: 0.5,
  рево: 0.5,
  экспан: 0.5
};

var characteristics = [];
var axesValues = {
  c: 0,
  b: 0,
  p: 0,
  m: 0,
  s: 0,
  j: 0,
  t: 0
};

var left = 0;
var right = 0;

for (var i = 0; i < axes.length; i++) {
  var negativeValue = getQueryVariable(axes[i] + "0");
  var positiveValue = getQueryVariable(axes[i] + "1");
  setAxisValue(axes[i] + "AxisNeg", negativeValue);
  setAxisValue(axes[i] + "AxisPos", positiveValue);
  setAxisValue(axes[i] + "AxisMid", 1 - negativeValue - positiveValue);

  left += negativeValue;
  right += positiveValue;

  if (negativeValue > positiveValue) {
    characteristics.push({ name: axes[i] + "0", value: negativeValue });
  } else {
    characteristics.push({ name: axes[i] + "1", value: positiveValue });
  }

  axesValues[axes[i]] = positiveValue - negativeValue;
}

var bonusEnabled = 0;

for (var b in bonus) {
  var value = getQueryVariable(b);

  setBonus(b + "Bonus", value, bonus[b]);

  if (value > bonus[b]) {
    bonusEnabled = 1;
    characteristics.push({ name: b, value: value });
  }
}

characteristics.sort(function(a, b) {
  return a.value < b.value;
});

var charSlogan = {
  b0: "Реабилитация",
  b1: "Порядок",
  c0: "Демократия",
  j0: "Свобода",
  j1: "Этикет",
  p0: "Традиции",
  p1: "Прогресс",
  s0: "Коллектив",
  s1: "Индивид",
  t0: "Автономия",
  t1: "Викисоюз"
};

function findFlagColors() {
  var colors = [];

  for (var i = 0; i < flagColors.length; i++) {
    var accepted = 1;

    var mainValue = 0;
    var mainValueFound = 0;

    for (var j = 0; j < flagColors[i].cond.length; j++) {
      var charFound = 0;
      for (var k = 0; k < characteristics.length; k++) {
        if (characteristics[k].name == flagColors[i].cond[j].name) {
          charFound = 1;
          if (
            characteristics[k].value < flagColors[i].cond[j].vmin ||
            characteristics[k].value > flagColors[i].cond[j].vmax
          )
            accepted = 0;
          else if (!mainValueFound) {
            mainValueFound = 1;
            mainValue = characteristics[k].value;
          }

          break;
        }
      }

      if (!charFound) accepted = 0;

      if (!accepted) break;
    }

    if (accepted) {
      colors.push({
        bgColor: flagColors[i].bgColor,
        fgColor: flagColors[i].fgColor,
        value: mainValue
      });
    }
  }

  colors.sort(function(a, b) {
    return b.value - a.value;
  });

  return colors;
}

function findFlagShape(numColors) {
  var flagFound = -1;
  var flagValue = [0, 0, 0];
  var flagColor = 0;

  for (var i = 0; i < flagShapes.length; i++) {
    if (flagShapes[i].numColors > numColors) continue;

    var condValue = [0, 0];
    var accepted = 1;
    if (flagShapes[i].cond.length > 0) {
      for (var j = 0; j < flagShapes[i].cond.length; j++) {
        var value = axesValues[flagShapes[i].cond[j].name];
        if (
          value < flagShapes[i].cond[j].vmin ||
          value > flagShapes[i].cond[j].vmax
        ) {
          accepted = 0;
        }
        if (j < 3) condValue[j] = Math.abs(value);

        if (!accepted) break;
      }
    } else {
      var condValue = [0, 0];
    }

    if (accepted && flagColor <= flagShapes[i].numColors) {
      if (flagShapes[i].numColors > flagColor) {
        flagColor = flagShapes[i].numColors;
        flagValue[0] = condValue[0];
        flagValue[1] = condValue[1];
        flagValue[2] = condValue[2];
        flagFound = i;
      } else if (condValue[0] > flagValue[0]) {
        flagColor = flagShapes[i].numColors;
        flagValue[0] = condValue[0];
        flagValue[1] = condValue[1];
        flagValue[2] = condValue[2];
        flagFound = i;
      } else if (condValue[0] == flagValue[0]) {
        if (condValue[1] > flagValue[1]) {
          flagColor = flagShapes[i].numColors;
          flagValue[0] = condValue[0];
          flagValue[1] = condValue[1];
          flagValue[2] = condValue[2];
          flagFound = i;
        } else if (condValue[1] == flagValue[1]) {
          if (condValue[2] > flagValue[2]) {
            flagColor = flagShapes[i].numColors;
            flagValue[0] = condValue[0];
            flagValue[1] = condValue[1];
            flagValue[2] = condValue[2];
            flagFound = i;
          }
        }
      }
    }
  }

  return flagFound;
}

function getCharacteristic(name, vmin, vmax) {
  for (var k = 0; k < characteristics.length; k++) {
    if (characteristics[k].name != name) continue;

    if (characteristics[k].value >= vmin && characteristics[k].value <= vmax)
      return characteristics[k].value;
    else return -1.0;
  }

  return -1.0;
}

var generatedSlogan = "";
var sloganDiv = document.getElementById("slogan");
if (sloganDiv) {
  var selectedSlogan = [];

  for (var i = 0; i < characteristics.length; i++) {
    if (
      characteristics[i].value > 0 &&
      charSlogan.hasOwnProperty(characteristics[i].name)
    ) {
      selectedSlogan.push({
        text: charSlogan[characteristics[i].name],
        value: characteristics[i].value
      });
    }
  }

  selectedSlogan.sort(function(a, b) {
    return a.value < b.value;
  });

  var counter = 0;
  for (var i = 0; i < selectedSlogan.length; i++) {
    if (generatedSlogan != "") generatedSlogan += " · ";
    generatedSlogan += selectedSlogan[i].text;
    counter++;

    if (counter >= 3) break;
  }

  sloganDiv.innerHTML = generatedSlogan;
}

if (!bonusEnabled) {
  var bonusBox = document.getElementById("bonusBox");
  bonusBox.style.display = "none";
}

var images = {
  c0: "/images/Демократизм.png",
  c1: "/images/Авторитаризм.png",
  j0: "/images/Свобода.png",
  j1: "/images/Цензура.png",
  s0: "/images/Коллективизм.png",
  s1: "/images/Индивидуализм.png",
  b0: "/images/Реабилитизм.png",
  b1: "/images/Репрессивизм.png",
  p0: "/images/Консерватизм.png",
  p1: "/images/Прогресс.png",
  m0: "/images/Изоляционизм.png",
  m1: "/images/Глобализм.png",
  t0: "/images/Автономизм.png",
  t1: "/images/Унионизм.png",
  инклюз: "/images/Инклюзионизм.png",
  удали: "/images/Удализм.png",
  когда: "/images/Когда-ниббудизм.png",
  немедли: "/images/Немедлизм.png",
  об: "/images/Объединизм.png",
  раз: "/images/Разделизм.png",
  мета: "/images/Метапедизм.png",
  экзо: "/images/Экзопедизм.png",
  моно: "/images/Моносохранизм.png",
  поли: "/images/Полисохранизм.png",
  реф: "/images/Реформизм.png",
  реакц: "/images/Реакционизм.png",
  рево: "/images/Революция.png",
  экспан: "/images/Экспансионизм.png",
};

var numImageLoaded = 0;

function onImageLoaded() {
  numImageLoaded++;

  if (numImageLoaded < images.length) {
    return;
  }

  var flag = document.getElementById("generatedFlag");
  if (flag) {
    var ctx = flag.getContext("2d");

    var spriteX = 256;
    var spriteY = 128;
    var spriteS = 1.0;

    var colors = findFlagColors();
    var symbolData = findFlagSymbol(colors.length);

    var flagId = findFlagShape(colors.length);

    if (colors.length <= 0)
      colors.push({ bgColor: "#ffffff", fgColor: "#000000" });

    if (flagId < 0) {
      ctx.beginPath();
      ctx.rect(0, 0, 512, 256);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else {
      for (var i = 0; i < flagShapes[flagId].shapes.length; i++) {
        var path = flagShapes[flagId].shapes[i];
        var numPoints = path.length / 2;

        ctx.beginPath();
        ctx.moveTo(path[1] * 512, path[2] * 256);

        if (path[1] == "circle") {
          ctx.arc(
            path[2] * 512,
            path[3] * 256,
            path[4] * 256,
            0,
            2 * Math.PI,
            false
          );
        } else if (
          path[1] == "circleSymbol" &&
          symbolData[0].parent_type != "none"
        ) {
          ctx.arc(
            path[2] * 512,
            path[3] * 256,
            path[4] * 256,
            0,
            2 * Math.PI,
            false
          );
        } else {
          for (var j = 1; j < numPoints; j++) {
            ctx.lineTo(path[1 + j * 2 + 0] * 512, path[1 + j * 2 + 1] * 256);
          }
        }
        ctx.fillStyle = colors[path[0]].bgColor;
        ctx.fill();
      }

      spriteX = flagShapes[flagId].symbol[0] * 512;
      spriteY = flagShapes[flagId].symbol[1] * 256;
      spriteS = flagShapes[flagId].symbol[2];
    }

    if (symbolData[0].parent_type != "none") {
      var tmpC = document.createElement("canvas");
      tmpC.width = images["sprites"].width;
      tmpC.height = images["sprites"].height;
      var tmpCtx = tmpC.getContext("2d");
      var coloredSprites = tmpCtx.getImageData(0, 0, tmpC.width, tmpC.height);

      tmpCtx.beginPath();
      tmpCtx.rect(0, 0, tmpC.width, tmpC.height);
      tmpCtx.fillStyle = colors[0].fgColor;
      tmpCtx.fill();

      tmpCtx.globalCompositeOperation = "destination-in";
      tmpCtx.drawImage(images["sprites"], 0, 0);

      ctx.save();
      ctx.translate(spriteX, spriteY);
      ctx.scale(spriteS, spriteS);

      var sx = symbolData[0].transform.x;
      var sy = symbolData[0].transform.y;

      ctx.save();
      ctx.translate(
        symbolData[0].transform.parent_tx,
        -symbolData[0].transform.parent_ty
      );
      ctx.rotate((symbolData[0].transform.parent_r * Math.PI) / 180);
      ctx.scale(
        symbolData[0].transform.parent_sx,
        symbolData[0].transform.parent_sy
      );
      ctx.drawImage(tmpC, sx * 128, sy * 128, 128, 128, -64, -64, 128, 128);
      ctx.restore();

      if (symbolData[1].parent_type != "none") {
        var sx = symbolData[1].transform.x;
        var sy = symbolData[1].transform.y;

        ctx.translate(
          symbolData[0].transform.child_tx,
          -symbolData[0].transform.child_ty
        );
        ctx.rotate((symbolData[0].transform.child_r * Math.PI) / 180);
        ctx.scale(
          symbolData[0].transform.child_sx,
          symbolData[0].transform.child_sy
        );

        ctx.translate(
          symbolData[1].transform.parent_tx,
          -symbolData[1].transform.parent_ty
        );
        ctx.rotate((symbolData[1].transform.parent_r * Math.PI) / 180);
        ctx.scale(
          symbolData[1].transform.parent_sx,
          symbolData[1].transform.parent_sy
        );

        ctx.drawImage(tmpC, sx * 128, sy * 128, 128, 128, -64, -64, 128, 128);
        ctx.restore();
      }

      ctx.restore();
    }
  }
  
  var rPreview = document.getElementById("generatedResults");
  if (rPreview) {
    var ctx = rPreview.getContext("2d");

    ctx.beginPath();
    ctx.rect(0, 0, rPreview.width, rPreview.height);
    ctx.fillStyle = "#ebebeb";
    ctx.fill();

    var yPos = 20;

    if (flag) {
      var flagCtx = flag.getContext("2d");
      var flagSize = 160;

      //Logo
      ctx.beginPath();
      ctx.rect(0, 0, rPreview.width, 42);
      ctx.fillStyle = "#500076";
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 25px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("WikiScales", 10, 30);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("wikiscales.github.io", rPreview.width - 10, 27);

      yPos += 48;

       //Flag
      ctx.drawImage(
        flag,
        0,
        0,
        flag.width,
        flag.height,
        rPreview.width / 2.0 - flagSize,
        yPos,
        flagSize * 2,
        flagSize
      );
      yPos += flagSize + 10;
       
      //Slogan
      ctx.fillStyle = "#000000";
      ctx.font = "25px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(generatedSlogan, rPreview.width / 2.0, yPos + 30);
      yPos += 70;

      // Totals
      ctx.fillStyle = "#777";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(
        `${Math.round(left * 100)}–${Math.round(right * 100)}`,
        rPreview.width - 7,
        rPreview.height - 10
      );

      //Axes
      var axesDrawInfo = [
        {
          key: "c",
          color0: "#a425b6",
          color1: "#34b634",
          name0: "Демократизм",
          name1: "Авторитаризм"
        },
        {
          key: "j",
          color0: "#14bee1",
          color1: "#e6cc27",
          name0: "Свобода слова",
          name1: "Цензура"
        },
        {
          key: "s",
          color0: "#850083",
          color1: "#970000",
          name0: "Коллективизм",
          name1: "Индивидуализм"
        },
        {
          key: "b",
          color0: "#3e6ffd",
          color1: "#ff8500",
          name0: "Реабилитизм",
          name1: "Репрессивизм"
        },
        {
          key: "p",
          color0: "#cc0000",
          color1: "#ffb800",
          name0: "Консерватизм",
          name1: "Прогрессивизм"
        },
        {
          key: "m",
          color0: "#269B32",
          color1: "#6608C0",
          name0: "Изоляционизм",
          name1: "Глобализм"
        },
        {
          key: "t",
          color0: "#eb1a66",
          color1: "#0ee4c8",
          name0: "Автономизм",
          name1: "Унионизм"
        }
      ];

      var axeMargin = 100;
      var axeWidth = rPreview.width - axeMargin * 2;
      ctx.strokeStyle = "#888888";
      for (var i = 0; i < axesDrawInfo.length; i++) {
        var negativeValue = getQueryVariable(axesDrawInfo[i]["key"] + "0");
        var positiveValue = getQueryVariable(axesDrawInfo[i]["key"] + "1");
        var neutralValue = 1 - negativeValue - positiveValue;

        var negSize = axeWidth * negativeValue;
        var posSize = axeWidth * positiveValue;
        var ntrSize = axeWidth * neutralValue;

        ctx.beginPath();
        ctx.rect(0.5 + axeMargin + negSize, 0.5 + yPos, ntrSize, 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(0.5 + axeMargin, 0.5 + yPos, negSize, 30);
        ctx.fillStyle = axesDrawInfo[i]["color0"];
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(
          0.5 + rPreview.width - axeMargin - posSize,
          0.5 + yPos,
          posSize,
          30
        );
        ctx.fillStyle = axesDrawInfo[i]["color1"];
        ctx.fill();
        ctx.stroke();

        if (negSize > 40) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "20px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(
            Math.round(negativeValue * 100) + "%",
            axeMargin + negSize - 5,
            yPos + 23
          );
        }

        if (posSize > 40) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "20px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(
            Math.round(positiveValue * 100) + "%",
            axeMargin + negSize + ntrSize + 5,
            yPos + 23
          );
        }

        if (ntrSize > 40) {
          ctx.fillStyle = "#888888";
          ctx.font = "20px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            Math.round(neutralValue * 100) + "%",
            axeMargin + negSize + ntrSize / 2,
            yPos + 23
          );
        }

        ctx.drawImage(
          images[axesDrawInfo[i]["key"] + "0"],
          axeMargin - 73,
          yPos - 27
        );
        ctx.drawImage(
          images[axesDrawInfo[i]["key"] + "1"],
          rPreview.width - axeMargin + 73 - 86,
          yPos - 27
        );

        ctx.fillStyle = "#000000";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(axesDrawInfo[i]["name0"], axeMargin + 8, yPos - 6);

        ctx.textAlign = "right";
        ctx.fillText(
          axesDrawInfo[i]["name1"],
          rPreview.width - axeMargin - 8,
          yPos - 6
        );

        yPos += 100;
      }

      var xShift = 0;
      var numBonus = 0;
      for (var b in bonus) {
        value = getQueryVariable(b);
        if (value > bonus[b]) {
          numBonus++;
        }
      }

      for (var b in bonus) {
        value = getQueryVariable(b);
        if (value > bonus[b]) {
          ctx.drawImage(
            images[b],
            rPreview.width / 2 - ((numBonus - 1) * 100) / 2 + xShift - 43,
            yPos - 27
          );
          xShift += 100;
        }
      }
    }
  }
}

for (var b in images) {
  var src = images[b];
  images[b] = new Image();
  images[b].src = src;
  images[b].onload = onImageLoaded;
}

function download_image() {
  var canvas = document.getElementById("generatedResults");
  var link = document.createElement("a");
  link.href = canvas.toDataURL();
  link.download = `WikiScales_Results_${+new Date()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
