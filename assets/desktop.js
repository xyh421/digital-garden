const themes = [
  ["graphite", "石墨银雾", "石墨柔光", "#191c22"],
  ["ice", "冰蓝流光", "折射玻璃", "#e9eff7"],
  ["ivory", "奶油香槟", "暖色日光", "#f3e9d9"],
  ["sage", "森林晨雾", "雾面绿釉", "#1c302a"],
  ["lavender", "紫晶星云", "切面水晶", "#2d2346"],
  ["midnight", "午夜星空", "深空微光", "#11172a"],
  ["aurora", "极光幻境", "虹彩玻璃", "#10272e"]
];

const root = document.documentElement;
const dialog = document.querySelector("#themes");
const trigger = document.querySelector("#theme-trigger");
const options = document.querySelector("#theme-options");
const themeName = document.querySelector("#theme-name");
const themeColor = document.querySelector('meta[name="theme-color"]');
const storageKey = "laoxu-palette";

function selectTheme(theme) {
  const [id, name, , color] = theme;
  root.dataset.palette = id;
  themeName.textContent = name;
  themeColor.content = color;
  for (const option of options.children) {
    option.setAttribute("aria-pressed", String(option.dataset.choice === id));
  }
}

for (const theme of themes) {
  const [id, name, material] = theme;
  const button = document.createElement("button");
  const swatch = document.createElement("span");
  const title = document.createElement("strong");
  const detail = document.createElement("small");
  button.type = "button";
  button.dataset.choice = id;
  swatch.className = "theme-swatch";
  swatch.setAttribute("aria-hidden", "true");
  title.textContent = name;
  detail.textContent = material;
  button.append(swatch, title, detail);
  button.addEventListener("click", () => {
    selectTheme(theme);
    try {
      localStorage.setItem(storageKey, id);
    } catch {}
  });
  options.append(button);
}

let savedTheme;
try {
  savedTheme = localStorage.getItem(storageKey);
} catch {}
const initialTheme = themes.find(([id]) => id === savedTheme)
  ?? themes.find(([id]) => id === root.dataset.palette);
selectTheme(initialTheme);

trigger.addEventListener("click", () => {
  dialog.showModal();
  options.querySelector('[aria-pressed="true"]').focus();
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => trigger.focus());

const clock = document.querySelector("#clock");
const clockFormat = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});

function updateClock() {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = clockFormat.format(now);
}

updateClock();
setInterval(updateClock, 1000 * 15);
