function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

function interpolateColor(startRgb, endRgb, factor) {
  return {
    r: Math.round(startRgb.r + factor * (endRgb.r - startRgb.r)),
    g: Math.round(startRgb.g + factor * (endRgb.g - startRgb.g)),
    b: Math.round(startRgb.b + factor * (endRgb.b - startRgb.b)),
  };
}

// Function to generate the gradient
function generateGradient(startHex, endHex, steps, middleHex = null) {
  const startRgb = hexToRgb(startHex);
  const endRgb = hexToRgb(endHex);
  const gradient = [];

  if (middleHex) {
    const middleRgb = hexToRgb(middleHex);
    const halfSteps = Math.floor(steps / 2);

    for (let i = 0; i < halfSteps; i++) {
      const factor = i / (halfSteps - 1);
      const color = interpolateColor(startRgb, middleRgb, factor);
      gradient.push(shortenHex(rgbToHex(color[0], color[1], color[2])));
    }

    for (let i = 0; i < steps - halfSteps; i++) {
      const factor = i / (steps - halfSteps - 1);
      const color = interpolateColor(middleRgb, endRgb, factor);
      gradient.push(shortenHex(rgbToHex(color[0], color[1], color[2])));
    }
  } else {
    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1);
      const color = interpolateColor(startRgb, endRgb, factor);
      gradient.push(shortenHex(rgbToHex(color[0], color[1], color[2])));
    }
  }

  return gradient;
}

function shortenHex(hex) {
  // convert 6-digit hex color to 3-digit
  /*
  R = round(0xRR/0xFF*0xF)
  G = round(0xGG/0xFF*0xF)
  B = round(0xBB/0xFF*0xF)
   */
  const r = Math.round((parseInt(hex.slice(1, 3), 16) / 255) * 15).toString(16);
  const g = Math.round((parseInt(hex.slice(3, 5), 16) / 255) * 15).toString(16);
  const b = Math.round((parseInt(hex.slice(5, 7), 16) / 255) * 15).toString(16);
  return `#${r}${g}${b}`.toUpperCase();
}

const username = document.getElementById("username");
const startInput = document.getElementById("startColor");
const middleInput = document.getElementById("middleColor");
const endInput = document.getElementById("endColor");
const result = document.querySelector(".result");
const tmResult = document.querySelector("#tmResult");
const copy = document.querySelector("#copy");
const middleColorCheckbox = document.querySelector("#middleColorCheckbox");
function generateUsername() {
  const startColor = startInput.value;
  const middleColor = middleColorCheckbox.checked ? middleInput.value : null;
  const endColor = endInput.value;
  const name = username.value;
  console.log(
    `startColor: ${startColor}, middleColor: ${middleColor}, endColor: ${endColor}, name: ${name}`
  );
  const minNameLength = middleColorCheckbox.checked ? 4 : 2;
  if (!startColor || !endColor || !name || name.length < minNameLength) return;
  const gradient = generateGradient(
    startColor,
    endColor,
    name.length,
    middleColor
  );
  console.log(gradient);
  result.innerHTML = "";
  tmResult.value = "";
  for (let i = 0; i < name.length; i++) {
    result.innerHTML += `<span style="color: ${gradient[i]}; font-weight: bolder">${name[i]}</span>`;
    // the raw result, looks like this : $FF0[letter]$F0F[letter]
    tmResult.value += `$${gradient[i].slice(1)}${name[i]}`;
  }
}
username.addEventListener("input", generateUsername);
startInput.addEventListener("input", generateUsername);
middleInput.addEventListener("input", () => {
  middleColorCheckbox.checked = true;
  generateUsername();
});
endInput.addEventListener("input", generateUsername);
middleColorCheckbox.addEventListener("change", generateUsername);

copy.addEventListener("click", function () {
  navigator.clipboard.writeText(tmResult.value);
});
