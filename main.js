// Function to convert hex to RGB
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// Function to convert RGB to hex
function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

// Function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return result;
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
const gradientPreview = document.querySelector("#gradient");
let gradientExpanded = false;
const expandGradientButton = document.querySelector("#expandGradient");
const minLetters = document.querySelector("#minLetters");
function generateUsername() {
  const startColor = startInput.value;
  const middleColor = middleColorCheckbox.checked ? middleInput.value : null;
  const endColor = endInput.value;
  const name = username.value;
  console.log(
    `startColor: ${startColor}, middleColor: ${middleColor}, endColor: ${endColor}, name: ${name}`
  );
  const minNameLength = middleColorCheckbox.checked ? 4 : 2;
  if (startColor && endColor) {
    gradientPreview.style.background = `linear-gradient(to right, ${startColor}, ${
      middleColor || endColor
    }${middleColor ? `, ${endColor}` : ""}`;
  }
  if (middleColorCheckbox.checked) {
    minLetters.textContent = "min. 4 letters";
  } else {
    minLetters.textContent = "min. 2 letters";
  }
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
document.body.onload = generateUsername;
copy.addEventListener("click", function () {
  navigator.clipboard.writeText(tmResult.value);
});
expandGradientButton.addEventListener("click", () => {
  gradientExpanded = !gradientExpanded;
  if (gradientExpanded) {
    gradientPreview.style.height = "8rem";
    expandGradientButton.style.bottom = "8.2rem";
    expandGradientButton.innerHTML =
      'Collapse <i class="fa-solid fa-chevron-down"></i>';
  } else {
    gradientPreview.style.height = "0.5rem";
    expandGradientButton.style.bottom = "0.4rem";
    expandGradientButton.innerHTML =
      'Expand <i class="fa-solid fa-chevron-up"></i>';
  }
});
