const API_ROOTS = {
  kmb: "https://data.etabus.gov.hk/v1/transport/kmb",
  citybus: "https://rt.data.gov.hk/v2/transport/citybus"
};
const REFRESH_INTERVAL = 30_000;
const routeInput = document.querySelector("#route-input");
const routeForm = document.querySelector("#route-form");
const operatorTabs = document.querySelector(".service-tabs");
const languageSelect = document.querySelector("#language-select");
const directionSelect = document.querySelector("#direction-select");
const stopSelect = document.querySelector("#stop-select");
const feedback = document.querySelector("#feedback");
const resultsHeading = document.querySelector("#results-heading");
const etaList = document.querySelector("#eta-list");
const updatedAt = document.querySelector("#updated-at");

const translations = {
  "zh-HK": {
    appTitle: "香港巴士即時站",
    tagline: "下一班巴士，幾時到？",
    languageLabel: "語言",
    operatorTabsLabel: "巴士公司",
    liveStatus: "即時資訊",
    kmbTab: "九巴 KMB",
    citybusTab: "城巴 Citybus",
    searchHeading: "查詢巴士到站時間",
    routeLabel: "路線號碼",
    routePlaceholder: "例如：960、1A",
    searchButton: "搜尋路線",
    directionLabel: "方向",
    stopLabel: "選擇車站",
    etaHeading: "到站預報",
    dataNote: "到站時間由巴士公司開放數據提供，資料約每 30 秒更新一次。",
    disclaimer: "非巴士公司官方應用程式",
    dataSource: "資料來源：",
    chooseRouteStop: "請選擇路線及車站",
    searchRouteFirst: "請先搜尋路線",
    loadingRoutes: "正在搜尋路線…",
    loadingStops: "正在載入車站…",
    loadingEta: "正在更新到站時間…",
    loadingOperator: "正在切換巴士公司…",
    loadingKmbStops: "正在載入九巴車站資料…",
    loadingCitybusStops: "正在載入城巴車站資料…",
    invalidRoute: "請輸入路線號碼。",
    routeNotFound: (route, operator) => `找不到 ${route} 這條${operator}路線，請檢查路線號碼。`,
    routeNotFoundTitle: "未找到路線",
    routeHeading: (route, description) => `${route} 號｜${description}`,
    kmb: "九巴",
    citybus: "城巴",
    tryOtherRoute: "試試輸入其他路線號碼，例如 1A 或 960。",
    stopDataMissing: "搵唔到此方向的車站資料，請重新搜尋。",
    stopDataUnavailable: "暫時無法顯示車站資料",
    loadStopsFailed: "載入車站資料失敗，請稍後再試。",
    unavailableStops: "無法載入車站資料，請稍後再試。",
    loadFailed: "載入資料失敗，請稍後再試。",
    apiUnavailable: "無法連接巴士資料服務，請稍後再試。",
    etaUnavailable: "暫時未有預計到站時間，請稍後再查。",
    noData: "資料未提供",
    nextBus: "下一班巴士",
    busNumber: (number) => `第 ${number} 班巴士`,
    destination: "目的地：",
    arrivalTime: "到站時間：",
    approaching: "即將",
    arriving: "到站",
    minutes: "分鐘",
    etaMissing: "暫時未有此站的到站預報。",
    updated: (time) => `更新於 ${time}`,
    etaReady: "已取得最新到站預報。",
    connectionTimeout: "連線逾時，請檢查網絡後再試。",
    serviceError: (status) => `資料服務回應錯誤（${status}）`,
    invalidData: "資料格式不正確，請稍後再試。",
    etaFailed: "更新到站時間失敗，請稍後再試。",
    etaUnavailableMessage: "未能取得即時到站時間。",
    directionTo: (destination, origin) => `往 ${destination}（${origin} 出發）`
  },
  en: {
    appTitle: "Hong Kong Bus ETA",
    tagline: "Your next bus, at a glance.",
    languageLabel: "Language",
    operatorTabsLabel: "Bus operators",
    liveStatus: "Live",
    kmbTab: "KMB",
    citybusTab: "Citybus",
    searchHeading: "Check bus arrival times",
    routeLabel: "Route number",
    routePlaceholder: "e.g. 960, 1A",
    searchButton: "Search",
    directionLabel: "Direction",
    stopLabel: "Select a stop",
    etaHeading: "Arrival forecast",
    dataNote: "Arrival times are provided by the operators' open data and refresh about every 30 seconds.",
    disclaimer: "Not an official bus operator app",
    dataSource: "Data source: ",
    chooseRouteStop: "Select a route and stop",
    searchRouteFirst: "Search for a route first",
    loadingRoutes: "Searching routes…",
    loadingStops: "Loading stops…",
    loadingEta: "Updating arrival times…",
    loadingOperator: "Switching bus operator…",
    loadingKmbStops: "Loading KMB stop data…",
    loadingCitybusStops: "Loading Citybus stop data…",
    invalidRoute: "Enter a route number.",
    routeNotFound: (route, operator) => `Route ${route} was not found for ${operator}. Check the route number and try again.`,
    routeNotFoundTitle: "Route not found",
    routeHeading: (route, description) => `Route ${route} · ${description}`,
    kmb: "KMB",
    citybus: "Citybus",
    tryOtherRoute: "Try another route number, such as 1A or 960.",
    stopDataMissing: "No stop data found for this direction. Please search again.",
    stopDataUnavailable: "Stop information is temporarily unavailable.",
    loadStopsFailed: "Could not load stop information. Please try again later.",
    unavailableStops: "Unable to load stop information. Please try again later.",
    loadFailed: "Could not load data. Please try again later.",
    apiUnavailable: "Unable to connect to bus data services. Please try again later.",
    etaUnavailable: "No arrival times are currently available. Please try again later.",
    noData: "Not available",
    nextBus: "Next bus",
    busNumber: (number) => `Bus ${number}`,
    destination: "Destination: ",
    arrivalTime: "Arrival: ",
    approaching: "Due",
    arriving: "",
    minutes: "min",
    etaMissing: "No arrival forecast is currently available for this stop.",
    updated: (time) => `Updated ${time}`,
    etaReady: "Latest arrival forecast loaded.",
    connectionTimeout: "Connection timed out. Check your network and try again.",
    serviceError: (status) => `Data service error (${status})`,
    invalidData: "The data service returned an invalid response. Please try again later.",
    etaFailed: "Could not update arrival times. Please try again later.",
    etaUnavailableMessage: "Live arrival times could not be retrieved.",
    directionTo: (destination, origin) => `To ${destination} (from ${origin})`
  }
};

let activeLanguage = languageSelect.value;
let activeOperator = "kmb";
const routeCache = new Map();
let kmbRouteStops = [];
const citybusRouteStops = new Map();
const stopCache = {
  kmb: new Map(),
  citybus: new Map()
};
let selectedRoute = null;
let searchedRoutes = [];
let refreshTimer = null;
let requestSequence = 0;

function t(key, ...args) {
  const value = translations[activeLanguage][key];
  return typeof value === "function" ? value(...args) : value;
}

function localizedName(item) {
  return activeLanguage === "en" ? (item.name_en || item.name_tc) : item.name_tc;
}

function localizedRouteName(route, key) {
  const suffix = activeLanguage === "en" ? "en" : "tc";
  return route[`${key}_${suffix}`] || route[`${key}_tc`];
}

function applyStaticTranslations() {
  document.documentElement.lang = activeLanguage;
  document.title = t("appTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  languageSelect.setAttribute("aria-label", t("languageLabel"));
  operatorTabs.setAttribute("aria-label", t("operatorTabsLabel"));
}

async function fetchJson(path, operator = activeOperator) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${API_ROOTS[operator]}/${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(t("serviceError", response.status));
    }
    const payload = await response.json();
    if (!payload.data || (typeof payload.data !== "object")) {
      throw new Error(t("invalidData"));
    }
    return payload.data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(t("connectionTimeout"));
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function setFeedback(message, isError = false) {
  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
}

function setEmptyState(message, loading = false) {
  etaList.replaceChildren();
  const state = document.createElement("div");
  state.className = "empty-state";
  if (loading) {
    const spinner = document.createElement("span");
    spinner.className = "loader";
    spinner.setAttribute("aria-hidden", "true");
    state.append(spinner);
  }
  const text = document.createElement("span");
  text.textContent = message;
  state.append(text);
  etaList.append(state);
}

function formatServiceType(serviceType) {
  return String(serviceType);
}

function routeDescription(route) {
  return `${localizedRouteName(route, "orig")} → ${localizedRouteName(route, "dest")}`;
}

function routeOptionLabel(route) {
  return t("directionTo", localizedRouteName(route, "dest"), localizedRouteName(route, "orig"));
}

function getMatchingRoutes(routeNumber) {
  const matching = (routeCache.get(activeOperator) || [])
    .filter((route) => route.route.toUpperCase() === routeNumber.toUpperCase());
  if (activeOperator === "citybus") {
    return matching.flatMap((route) => [
      { ...route, bound: "O", service_type: "1" },
      {
        ...route,
        orig_tc: route.dest_tc,
        dest_tc: route.orig_tc,
        orig_en: route.dest_en,
        dest_en: route.orig_en,
        bound: "I",
        service_type: "1"
      }
    ]);
  }
  return matching.sort((a, b) => Number(a.service_type) - Number(b.service_type) || (a.bound === "O" ? -1 : 1));
}

async function ensureStopData(route, direction) {
  if (activeOperator === "kmb") {
    if (kmbRouteStops.length && stopCache.kmb.size) return;
    setFeedback(t("loadingKmbStops"));
    const [allRouteStops, allStops] = await Promise.all([
      fetchJson("route-stop/", "kmb"),
      fetchJson("stop/", "kmb")
    ]);
    kmbRouteStops = allRouteStops;
    stopCache.kmb = new Map(allStops.map((stop) => [stop.stop, stop]));
    return;
  }

  const cacheKey = `${route.route}|${direction.bound}`;
  if (citybusRouteStops.has(cacheKey)) return;
  setFeedback(t("loadingCitybusStops"));
  const apiDirection = direction.bound === "O" ? "OUTBOUND" : "INBOUND";
  const routeStops = await fetchJson(
    `route-stop/CTB/${encodeURIComponent(route.route)}/${apiDirection}`,
    "citybus"
  );
  const uniqueStopIds = [...new Set(routeStops.map((item) => item.stop))];
  const missingStopIds = uniqueStopIds.filter((stopId) => !stopCache.citybus.has(stopId));
  const stopDetails = await Promise.all(missingStopIds.map((stopId) =>
    fetchJson(`stop/${encodeURIComponent(stopId)}`, "citybus")
  ));
  stopDetails.forEach((payload) => stopCache.citybus.set(payload.stop, payload));
  citybusRouteStops.set(cacheKey, routeStops);
}

function populateDirections(matches) {
  searchedRoutes = matches;
  directionSelect.replaceChildren();
  for (const route of matches) {
    const option = document.createElement("option");
    option.value = `${route.bound}|${formatServiceType(route.service_type)}`;
    option.textContent = routeOptionLabel(route);
    option.dataset.bound = route.bound;
    option.dataset.serviceType = formatServiceType(route.service_type);
    directionSelect.append(option);
  }
  directionSelect.disabled = matches.length === 0;
}

function getChosenDirection() {
  const option = directionSelect.selectedOptions[0];
  if (!option) return null;
  return {
    bound: option.dataset.bound,
    serviceType: option.dataset.serviceType
  };
}

async function populateStops(preferredStopId) {
  const direction = getChosenDirection();
  if (!selectedRoute || !direction) return;
  const route = selectedRoute;
  const operator = activeOperator;
  const currentRequest = ++requestSequence;
  stopSelect.disabled = true;
  setEmptyState(t("loadingStops"), true);

  try {
    await ensureStopData(route, direction);
  } catch (error) {
    if (operator !== activeOperator || currentRequest !== requestSequence) return;
    setFeedback(error.message || t("loadStopsFailed"), true);
    setEmptyState(t("unavailableStops"));
    return;
  }
  if (operator !== activeOperator || currentRequest !== requestSequence) return;

  const routeStops = operator === "kmb"
    ? kmbRouteStops
    : citybusRouteStops.get(`${route.route}|${direction.bound}`) || [];
  const stopCacheForOperator = stopCache[operator];
  const choices = routeStops
    .filter((item) =>
      item.route.toUpperCase() === route.route.toUpperCase()
      && (operator === "citybus" ? item.dir : item.bound) === direction.bound
      && (operator === "citybus" || formatServiceType(item.service_type) === direction.serviceType)
    )
    .sort((a, b) => Number(a.seq) - Number(b.seq));

  const selectedStopId = preferredStopId || stopSelect.selectedOptions[0]?.dataset.stopId;
  stopSelect.replaceChildren();
  for (const item of choices) {
    const stop = stopCacheForOperator.get(item.stop);
    if (!stop) continue;
    const option = document.createElement("option");
    option.value = `${item.stop}|${item.seq}`;
    option.textContent = `${item.seq}. ${localizedName(stop)}`;
    option.dataset.stopId = item.stop;
    option.dataset.seq = item.seq;
    stopSelect.append(option);
  }
  if (selectedStopId) {
    const matchingOption = [...stopSelect.options].find((option) => option.dataset.stopId === selectedStopId);
    if (matchingOption) stopSelect.value = matchingOption.value;
  }
  stopSelect.disabled = stopSelect.options.length === 0;

  if (stopSelect.options.length === 0) {
    setFeedback(t("stopDataMissing"), true);
    setEmptyState(t("stopDataUnavailable"));
    return;
  }
  loadEta();
}

function handleDirectionChange() {
  const direction = getChosenDirection();
  if (direction) {
    selectedRoute = searchedRoutes.find((route) =>
      route.bound === direction.bound
      && formatServiceType(route.service_type) === direction.serviceType
    ) || selectedRoute;
  }
  populateStops();
}

async function searchRoute(event) {
  event?.preventDefault();
  const routeNumber = routeInput.value.trim().toUpperCase();
  if (!routeNumber) {
    setFeedback(t("invalidRoute"), true);
    routeInput.focus();
    return;
  }

  requestSequence += 1;
  const currentRequest = requestSequence;
  window.clearInterval(refreshTimer);
  selectedRoute = null;
  directionSelect.replaceChildren(new Option(t("searchRouteFirst")));
  stopSelect.replaceChildren(new Option(t("searchRouteFirst")));
  directionSelect.disabled = true;
  stopSelect.disabled = true;
  updatedAt.textContent = "";
  resultsHeading.textContent = t("chooseRouteStop");
  setEmptyState(t("loadingRoutes"), true);
  setFeedback(t("loadingRoutes"));

  try {
    if (!routeCache.has(activeOperator)) {
      const routePath = activeOperator === "kmb" ? "route/" : "route/CTB";
      routeCache.set(activeOperator, await fetchJson(routePath));
    }
    if (currentRequest !== requestSequence) return;
    const matches = getMatchingRoutes(routeNumber);
    if (matches.length === 0) {
      const operatorName = activeOperator === "kmb" ? t("kmb") : t("citybus");
      setFeedback(t("routeNotFound", routeNumber, operatorName), true);
      directionSelect.replaceChildren(new Option(t("searchRouteFirst")));
      stopSelect.replaceChildren(new Option(t("searchRouteFirst")));
      updatedAt.textContent = "";
      resultsHeading.textContent = t("routeNotFoundTitle");
      setEmptyState(t("tryOtherRoute"));
      return;
    }

    selectedRoute = matches[0];
    resultsHeading.textContent = t("routeHeading", selectedRoute.route, routeDescription(selectedRoute));
    populateDirections(matches);
    populateStops();
  } catch (error) {
    if (currentRequest !== requestSequence) return;
    directionSelect.replaceChildren(new Option(t("searchRouteFirst")));
    stopSelect.replaceChildren(new Option(t("searchRouteFirst")));
    directionSelect.disabled = true;
    stopSelect.disabled = true;
    updatedAt.textContent = "";
    setFeedback(error.message || t("loadFailed"), true);
    setEmptyState(t("apiUnavailable"));
  }
}

function formatEtaTime(eta) {
  return new Intl.DateTimeFormat(activeLanguage === "en" ? "en-HK" : "zh-HK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(eta));
}

function minutesUntil(eta) {
  return Math.ceil((new Date(eta).getTime() - Date.now()) / 60_000);
}

function renderEta(entries) {
  const now = Date.now();
  const upcoming = entries
    .filter((entry) => entry.eta && new Date(entry.eta).getTime() >= now - 60_000)
    .sort((a, b) => new Date(a.eta) - new Date(b.eta))
    .slice(0, 3);

  etaList.replaceChildren();
  if (upcoming.length === 0) {
    setEmptyState(t("etaUnavailable"));
    return;
  }

  const fragment = document.createDocumentFragment();
  upcoming.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "eta-card";

    const details = document.createElement("div");
    details.className = "eta-details";
    const destination = document.createElement("p");
    destination.className = "eta-destination";
    destination.textContent = index === 0 ? t("nextBus") : t("busNumber", index + 1);
    const meta = document.createElement("p");
    meta.className = "eta-meta";
    const remarkText = activeLanguage === "en" ? (entry.rmk_en || "") : entry.rmk_tc;
    const remark = remarkText ? ` · ${remarkText}` : "";
    const destinationName = activeLanguage === "en"
      ? (entry.dest_en || entry.dest_tc)
      : entry.dest_tc;
    meta.textContent = `${t("destination")}${destinationName || t("noData")}${remark}　${t("arrivalTime")}${formatEtaTime(entry.eta)}`;
    details.append(destination, meta);

    const time = document.createElement("div");
    time.className = "eta-time";
    const minutes = minutesUntil(entry.eta);
    time.append(document.createTextNode(minutes <= 0 ? t("approaching") : String(minutes)));
    const unit = document.createElement("small");
    unit.textContent = minutes <= 0 ? t("arriving") : t("minutes");
    time.append(unit);
    card.append(details, time);
    fragment.append(card);
  });
  etaList.append(fragment);
}

async function loadEta() {
  const option = stopSelect.selectedOptions[0];
  const direction = getChosenDirection();
  if (!selectedRoute || !option || !direction) return;

  const currentRequest = ++requestSequence;
  const stopId = option.dataset.stopId;
  const seq = option.dataset.seq;
  const route = selectedRoute.route;
  const serviceType = direction.serviceType;
  const operator = activeOperator;
  resultsHeading.textContent = `${t("routeHeading", route, routeDescription(selectedRoute))} · ${option.textContent}`;
  setFeedback(t("loadingEta"));

  try {
    const etaPath = operator === "kmb"
      ? `eta/${encodeURIComponent(stopId)}/${encodeURIComponent(route)}/${encodeURIComponent(serviceType)}`
      : `eta/CTB/${encodeURIComponent(stopId)}/${encodeURIComponent(route)}`;
    const etaData = await fetchJson(etaPath, operator);
    if (currentRequest !== requestSequence || operator !== activeOperator) return;
    const matchingEta = etaData.filter((item) =>
      item.route.toUpperCase() === route.toUpperCase()
      && item.dir === direction.bound
      && (operator === "citybus" || formatServiceType(item.service_type) === serviceType)
      && String(item.seq) === String(seq)
    );
    renderEta(matchingEta);
    const locale = activeLanguage === "en" ? "en-HK" : "zh-HK";
    updatedAt.textContent = t("updated", new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
    setFeedback(matchingEta.length ? t("etaReady") : t("etaMissing"));
  } catch (error) {
    if (currentRequest !== requestSequence || operator !== activeOperator) return;
    setFeedback(error.message || t("etaFailed"), true);
    setEmptyState(t("etaUnavailableMessage"));
  }

  window.clearInterval(refreshTimer);
  refreshTimer = window.setInterval(() => {
    if (selectedRoute && stopSelect.value) loadEta();
  }, REFRESH_INTERVAL);
}

routeForm.addEventListener("submit", searchRoute);
directionSelect.addEventListener("change", handleDirectionChange);
stopSelect.addEventListener("change", loadEta);
operatorTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-operator]");
  if (!button || button.dataset.operator === activeOperator) return;

  activeOperator = button.dataset.operator;
  operatorTabs.querySelectorAll("[data-operator]").forEach((tab) => {
    const isActive = tab === button;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  requestSequence += 1;
  window.clearInterval(refreshTimer);
  selectedRoute = null;
  directionSelect.replaceChildren(new Option(t("searchRouteFirst")));
  stopSelect.replaceChildren(new Option(t("searchRouteFirst")));
  directionSelect.disabled = true;
  stopSelect.disabled = true;
  updatedAt.textContent = "";
  setEmptyState(t("loadingOperator"), true);
  searchRoute();
});

languageSelect.addEventListener("change", () => {
  const previousDirection = getChosenDirection();
  const previousStopId = stopSelect.selectedOptions[0]?.dataset.stopId;
  activeLanguage = languageSelect.value;
  applyStaticTranslations();
  requestSequence += 1;

  if (selectedRoute && searchedRoutes.length) {
    populateDirections(searchedRoutes);
    if (previousDirection) {
      directionSelect.value = `${previousDirection.bound}|${previousDirection.serviceType}`;
      selectedRoute = searchedRoutes.find((route) =>
        route.bound === previousDirection.bound
        && formatServiceType(route.service_type) === previousDirection.serviceType
      ) || selectedRoute;
    }
    populateStops(previousStopId);
    return;
  }

  directionSelect.replaceChildren(new Option(t("searchRouteFirst")));
  stopSelect.replaceChildren(new Option(t("searchRouteFirst")));
  directionSelect.disabled = true;
  stopSelect.disabled = true;
  if (resultsHeading.textContent === translations["zh-HK"].routeNotFoundTitle
      || resultsHeading.textContent === translations.en.routeNotFoundTitle) {
    resultsHeading.textContent = t("routeNotFoundTitle");
    setEmptyState(t("tryOtherRoute"));
  } else {
    resultsHeading.textContent = t("chooseRouteStop");
    setEmptyState(t("loadingRoutes"), true);
  }
  setFeedback(t("searchRouteFirst"));
});

applyStaticTranslations();
searchRoute();
