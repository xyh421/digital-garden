const themes = [
  ["graphite", "石墨银雾", "拉丝金属", "#121615"],
  ["ice", "冰蓝流光", "折射玻璃", "#10263a"],
  ["ivory", "奶油香槟", "暖色纸张", "#f3e9d7"],
  ["sage", "森林晨雾", "雾面绿釉", "#192b22"],
  ["lavender", "紫晶星云", "切面水晶", "#261c3d"],
  ["midnight", "午夜星空", "深空珐琅", "#0a1024"],
  ["aurora", "极光幻境", "虹彩玻璃", "#081f24"]
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
selectTheme(themes.find(([id]) => id === savedTheme) ?? themes[0]);

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
