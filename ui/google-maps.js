/* Google Maps integration. The SDK and its attribution remain Google's original UI. */
(function (root) {
  'use strict';

  const STYLES = {
    day: [
      { elementType: 'geometry', stylers: [{ color: '#edf2ed' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#526b67' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#fafcf8' }] },
      { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#e8eeea' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d0e6d4' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#efdcb4' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b7dce1' }] }
    ],
    twilight: [
      { elementType: 'geometry', stylers: [{ color: '#e5ded8' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#756d79' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#f5eee8' }] },
      { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#e0d6d6' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c7d6c6' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f9f0e6' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#edc698' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#abbeca' }] }
    ],
    night: [
      { elementType: 'geometry', stylers: [{ color: '#182d37' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#9cb5c1' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#15262f' }] },
      { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#203843' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#213f3b' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#aac6bc' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#34505b' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#776c55' }] },
      { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#e3cfad' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c202e' }] }
    ]
  };

  // Static, first-party artwork: no city names or external strings enter SVG markup.
  const LANDMARK_ICONS = {
    tower: '<path d="M4 21V10l6-2v13M10 21V4l8-2v19M2 21h20M13 7h2M13 11h2M13 15h2M7 12v1M7 16v1"/>',
    wheel: '<circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="1.5"/><path d="M12 3v5.5M12 11.5V17M5 10h5.5M13.5 10H19M7 5l4 4M13 11l4 4M7 15l4-4M13 9l4-4M12 10L7.5 22M12 10l4.5 12M6 22h12"/>',
    pier: '<path d="M3 11h18M5 11V6M10 11V6M15 11V6M20 11V6M5 8h15M6 11v6M18 11v6M2 18q2 2 4 0t4 0t4 0t4 0t4 0M2 22q2 2 4 0t4 0t4 0t4 0t4 0"/>',
    island: '<path d="M3 18q9-5 18 0M14 17q2-6 0-10M14 7q-3-5-6-2M14 7q4-5 7-2M14 7q-4-1-7 3M14 7q4-1 6 3M3 21q2 2 4 0t4 0t4 0t4 0"/><circle cx="5" cy="5" r="2"/>',
    waterfront: '<path d="M2 7q2 3 5 0t5 0t5 0t5 0M2 13q2 3 5 0t5 0t5 0t5 0M2 19q2 3 5 0t5 0t5 0t5 0"/>',
    landmark: '<path d="M3 21h18M5 21V10M19 21V10M3 10h18L12 3 3 10ZM9 13v5M15 13v5"/>'
  };
  function landmarkIcon(kind) {
    const paths = Object.prototype.hasOwnProperty.call(LANDMARK_ICONS, kind) ? LANDMARK_ICONS[kind] : LANDMARK_ICONS.landmark;
    return '<svg class="mauLandmarkSvg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths + '</svg>';
  }

  const runtime = {
    map: null, canvas: null, host: null, options: null, cityKey: null,
    phase: 'day', playing: false, mapType: 'roadmap', active: false,
    mountVersion: 0, configuring: false, settled: false, targetView: null,
    overlays: [], savedViews: Object.create(null), status: null,
    tileTimer: null, tileVersion: 0, authFailed: false
  };
  let sdkPromise = null;
  let sdkScript = null;
  let sdkAttempt = 0;
  let rejectSDK = null;
  let OverlayClass = null;
  let authHookInstalled = false;

  function phaseName(value) { return Object.prototype.hasOwnProperty.call(STYLES, value) ? value : 'day'; }
  function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
  function artworkSource(value) { return typeof value === 'string' ? value.trim() : ''; }
  function validCenter(value) {
    return value && finite(value.lat) && finite(value.lng) && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180;
  }
  function mapType(value) { return value === 'hybrid' ? 'hybrid' : 'roadmap'; }
  function notify(state, message) {
    runtime.status = { state: state, message: message };
    if (runtime.active && runtime.options && typeof runtime.options.onStatus === 'function') {
      runtime.options.onStatus(runtime.status);
    }
  }
  function mapError(code, message) { const error = new Error(message); error.code = code; return error; }
  function sdkAvailable() { return !!(root.google && root.google.maps && root.google.maps.Map && root.google.maps.OverlayView); }

  function installAuthHook() {
    if (authHookInstalled) return;
    authHookInstalled = true;
    const previous = root.gm_authFailure;
    root.gm_authFailure = function () {
      runtime.authFailed = true;
      root.clearTimeout(runtime.tileTimer);
      const error = mapError('auth', 'Google 地图授权未通过，请检查地图服务配置后刷新页面。');
      if (rejectSDK) rejectSDK(error);
      notify('error', error.message);
      if (typeof previous === 'function') previous();
    };
  }

  function loadSDK() {
    if (runtime.authFailed) return Promise.reject(mapError('auth', '请修正 Google 地图服务配置后刷新页面。'));
    installAuthHook();
    if (sdkAvailable()) return Promise.resolve(root.google.maps);
    if (sdkPromise) return sdkPromise;
    const config = root.MAU_MAPS_CONFIG || {};
    const key = typeof config.apiKey === 'string' ? config.apiKey.trim() : '';
    if (!key) return Promise.reject(mapError('missing-key', '城市地图尚未连接，配置 Google Maps 后即可自由探索。'));
    const attempt = ++sdkAttempt;
    sdkPromise = new Promise(function (resolve, reject) {
      let completed = false;
      const callbackName = '__mauGoogleMapsReady' + attempt;
      let timeout;
      function finish(error) {
        if (completed) return;
        completed = true;
        root.clearTimeout(timeout);
        rejectSDK = null;
        // A late script callback after a timeout must not attach a stale map or throw.
        root[callbackName] = function () {};
        if (error) {
          if (sdkScript) sdkScript.remove();
          sdkScript = null;
          reject(error);
        } else resolve(root.google.maps);
      }
      rejectSDK = finish;
      root[callbackName] = function () {
        if (attempt !== sdkAttempt) return;
        finish(sdkAvailable() ? null : mapError('sdk', '地图组件尚未加载完成，请稍后重试。'));
      };
      const params = new URLSearchParams({
        key: key, callback: callbackName, v: 'weekly', loading: 'async',
        language: config.language || 'zh-CN', region: config.region || 'CN'
      });
      sdkScript = root.document.createElement('script');
      sdkScript.src = 'https://maps.googleapis.com/maps/api/js?' + params.toString();
      sdkScript.async = true;
      sdkScript.onerror = function () { finish(mapError('network', '暂时无法连接 Google 地图，请检查网络后重试。')); };
      timeout = root.setTimeout(function () { finish(mapError('timeout', 'Google 地图连接超时，请检查网络后重试。')); }, 15000);
      root.document.head.appendChild(sdkScript);
    }).catch(function (error) { sdkPromise = null; throw error; });
    return sdkPromise;
  }

  function ensureCanvas() {
    if (runtime.canvas) return;
    runtime.canvas = root.document.createElement('div');
    runtime.canvas.className = 'mauGoogleMap';
    runtime.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    runtime.canvas.setAttribute('aria-label', '可拖动、缩放的 Google 城市地图');
    const style = root.document.createElement('style');
    style.id = 'mau-google-landmark-style';
    style.textContent = `
      .mauGoogleLandmark{position:absolute;display:flex;flex-direction:column;align-items:center;gap:5px;transform:translate(-50%,-100%);padding:5px;border:0;background:none;cursor:pointer;white-space:nowrap;font-family:inherit;touch-action:manipulation;isolation:isolate}
      .mauGoogleLandmark .mauLandmarkDot{position:relative;display:grid;place-items:center;width:37px;height:37px;border-radius:15px;background:linear-gradient(140deg,#0ccca6,#237dcb);border:2px solid #fff;color:#fff;font-size:20px;line-height:1;box-shadow:0 5px 14px #123c4a35;flex-shrink:0}
      .mauGoogleLandmark .mauLandmarkDot>svg{display:block;width:22px;height:22px;flex-shrink:0;pointer-events:none}
      .mauGoogleLandmark .mauLandmarkName{display:block;max-width:126px;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;padding:5px 9px;border:1px solid #ffffffbf;border-radius:8px;background:#ffffffe8;color:#25434a;box-shadow:0 2px 6px #193d4314;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-size:10px;font-weight:550;line-height:1.2;letter-spacing:.1px}
      .mauGoogleLandmark[data-phase="night"] .mauLandmarkName{background:#203640e8;border-color:#b3d0d138;color:#e9f3f3}
      .mauGoogleLandmark[aria-pressed="true"] .mauLandmarkDot{box-shadow:0 0 0 5px #3cdbc52d,0 5px 14px #123c4a35}
      .mauGoogleLandmark[aria-pressed="true"]{z-index:2000}
      .mauGoogleLandmark[aria-pressed="true"] .mauLandmarkName{border-color:#539f8db3;color:#136551;background:#f6fffbf2;box-shadow:0 2px 8px #133d4821}
      .mauGoogleLandmark[data-phase="night"][aria-pressed="true"] .mauLandmarkName{background:#294941f2;color:#e0fff0;border-color:#90cbb78c}
      .mauGoogleLandmark[data-art="true"]{gap:0;padding:0}
      .mauLandmarkArt{display:block;flex-shrink:0;background-repeat:no-repeat;background-position:center bottom;background-size:contain;filter:drop-shadow(0 2px 3px #193b4418);pointer-events:none;margin-bottom:-1px}
      .mauGoogleLandmark[data-phase="night"] .mauLandmarkArt{filter:drop-shadow(0 2px 3px #071d3229)}
      .mauGoogleLandmark[data-art="true"] .mauLandmarkDot{display:block;width:7px;height:7px;margin-top:3px;border-radius:50%;border:1px solid #ffffffed;background:#379d89;box-shadow:0 1px 3px #14474826}
      .mauGoogleLandmark[data-art="true"][aria-pressed="true"] .mauLandmarkDot{box-shadow:0 0 0 3px #51ad9424}
      .mauGoogleLandmark[data-playing="true"] .mauLandmarkDot:before{content:"";position:absolute;inset:-8px;border:1px solid #42d6c9;border-radius:22px;animation:mauMapMusicRipple 2.4s ease-out infinite;z-index:-1;pointer-events:none}
      .mauGoogleLandmark[data-art="true"][data-playing="true"] .mauLandmarkDot:before{inset:-6px;border-color:#27d5bb;border-radius:50%;animation-duration:2.5s}
      .mauGoogleLandmark:focus-visible{outline:3px solid #00a879;outline-offset:3px;border-radius:12px}
      @keyframes mauMapMusicRipple{from{transform:scale(.8);opacity:.85}to{transform:scale(1.6);opacity:0}}
      @media(prefers-reduced-motion:reduce){.mauGoogleLandmark[data-playing="true"] .mauLandmarkDot:before{animation:none;opacity:.4}}
      @media(prefers-reduced-transparency:reduce){
        .mauGoogleLandmark .mauLandmarkName{background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none}
        .mauGoogleLandmark[data-phase="night"] .mauLandmarkName{background:#203640}
        .mauGoogleLandmark[aria-pressed="true"] .mauLandmarkName{background:#f6fffb}
        .mauGoogleLandmark[data-phase="night"][aria-pressed="true"] .mauLandmarkName{background:#294941}
      }
    `;
    if (!root.document.getElementById(style.id)) root.document.head.appendChild(style);
  }

  function ensureOverlayClass() {
    if (OverlayClass) return;
    const maps = root.google.maps;
    OverlayClass = class extends maps.OverlayView {
      constructor(landmark, cityKey, selected) {
        super();
        this.landmark = landmark;
        this.cityKey = cityKey;
        this.selected = selected;
        this.element = null;
        this.art = null;
        this.artSrc = artworkSource(landmark.artSrc);
        this.artNightSrc = artworkSource(landmark.artNightSrc);
        this.currentArtSrc = null;
      }
      onAdd() {
        const button = root.document.createElement('button');
        button.type = 'button';
        button.className = 'mauGoogleLandmark';
        button.setAttribute('aria-label', '探索' + this.landmark.name);
        button.setAttribute('aria-pressed', this.selected ? 'true' : 'false');
        const dot = root.document.createElement('span');
        dot.className = 'mauLandmarkDot';
        dot.setAttribute('aria-hidden', 'true');
        const label = root.document.createElement('span');
        label.className = 'mauLandmarkName';
        label.textContent = this.landmark.name;
        if (this.artSrc || this.artNightSrc) {
          const art = root.document.createElement('span');
          const width = Math.max(52, Math.min(132, finite(this.landmark.artWidth) ? this.landmark.artWidth : 112));
          art.className = 'mauLandmarkArt';
          art.setAttribute('aria-hidden', 'true');
          art.style.width = width + 'px';
          art.style.height = width + 'px';
          this.art = art;
          button.dataset.art = 'true';
          button.appendChild(art);
          button.appendChild(label);
          button.appendChild(dot);
        } else {
          dot.innerHTML = landmarkIcon(this.landmark.kind);
          button.appendChild(dot);
          button.appendChild(label);
        }
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          if (!runtime.active || runtime.cityKey !== this.cityKey) return;
          selectLandmark(this.landmark.id);
          if (typeof runtime.options.onLandmark === 'function') runtime.options.onLandmark(this.landmark, this.cityKey);
        });
        maps.OverlayView.preventMapHitsAndGesturesFrom(button);
        this.element = button;
        this.update();
        this.getPanes().overlayMouseTarget.appendChild(button);
      }
      draw() {
        if (!this.element) return;
        const position = this.landmark.position || this.landmark;
        const point = this.getProjection().fromLatLngToDivPixel(new maps.LatLng(position.lat, position.lng));
        if (!point) return;
        this.element.style.left = point.x + 'px';
        this.element.style.top = point.y + 'px';
      }
      update() {
        if (!this.element) return;
        this.element.dataset.phase = runtime.phase;
        this.element.dataset.playing = runtime.playing && this.selected ? 'true' : 'false';
        this.element.setAttribute('aria-pressed', this.selected ? 'true' : 'false');
        if (this.art) {
          // Twilight uses the lit building render, matching the offline engine.
          const source = runtime.phase === 'day' ? this.artSrc || this.artNightSrc : this.artNightSrc || this.artSrc;
          if (source !== this.currentArtSrc) {
            this.art.style.backgroundImage = 'url(' + JSON.stringify(source) + ')';
            this.currentArtSrc = source;
          }
        }
      }
      onRemove() { if (this.element) this.element.remove(); this.element = null; this.art = null; this.currentArtSrc = null; }
    };
  }

  function selectLandmark(id) {
    runtime.overlays.forEach(function (overlay) { overlay.selected = overlay.landmark.id === id; overlay.update(); });
  }
  function replaceLandmarks(city) {
    runtime.overlays.forEach(function (overlay) { overlay.setMap(null); });
    runtime.overlays = [];
    ensureOverlayClass();
    (city.landmarks || []).forEach(function (landmark, index) {
      if (!validCenter(landmark.position || landmark)) return;
      const overlay = new OverlayClass(landmark, runtime.cityKey, index === 0);
      runtime.overlays.push(overlay);
      overlay.setMap(runtime.map);
    });
  }

  function readView() {
    if (!runtime.map || !runtime.cityKey) return null;
    const center = runtime.map.getCenter();
    const zoom = runtime.map.getZoom();
    if (!center || !finite(zoom)) return null;
    return { lat: center.lat(), lng: center.lng(), zoom: zoom, mapType: mapType(runtime.map.getMapTypeId()) };
  }
  function targetMatches(view) {
    const target = runtime.targetView;
    return !target || (Math.abs(view.lat - target.lat) < 0.00001 && Math.abs(view.lng - target.lng) < 0.00001 && Math.abs(view.zoom - target.zoom) < 0.01);
  }
  function rememberView() {
    if (!runtime.map || runtime.configuring || !runtime.settled) return;
    const view = readView();
    if (!view || !validCenter(view)) return;
    runtime.savedViews[runtime.cityKey] = view;
    if (runtime.active && runtime.options && typeof runtime.options.onViewChange === 'function') runtime.options.onViewChange(runtime.cityKey, view);
  }
  function waitForTiles() {
    root.clearTimeout(runtime.tileTimer);
    const version = ++runtime.tileVersion;
    runtime.tileTimer = root.setTimeout(function () {
      if (runtime.active && runtime.tileVersion === version && !runtime.authFailed) notify('error', '地图画面加载较慢，请检查网络后重试。');
    }, 18000);
  }
  function bindMapEvents() {
    runtime.map.addListener('idle', function () {
      if (runtime.configuring) return;
      const view = readView();
      if (!view || !targetMatches(view)) return;
      runtime.targetView = null;
      runtime.settled = true;
      rememberView();
    });
    runtime.map.addListener('dragstart', function () { runtime.targetView = null; });
    runtime.map.addListener('zoom_changed', function () {
      // Programmatic city transitions stay guarded; user zoom may legitimately
      // change the target before its first idle event.
      if (!runtime.configuring) runtime.targetView = null;
    });
    runtime.map.addListener('tilesloaded', function () {
      if (runtime.configuring || runtime.authFailed) return;
      const view = readView();
      if (!view || !targetMatches(view)) return;
      root.clearTimeout(runtime.tileTimer);
      runtime.tileVersion++;
      notify('ready', 'Google 地图已连接，可拖动、缩放探索城市。');
    });
  }

  function viewFor(options) {
    const remembered = runtime.savedViews[options.cityKey];
    const supplied = validCenter(options.view) ? options.view : null;
    const view = remembered || supplied;
    const center = view || options.city.center;
    return { lat: center.lat, lng: center.lng,
      zoom: Math.max(3, Math.min(20, view && finite(view.zoom) ? view.zoom : (options.city.zoom || 13))),
      mapType: mapType(view && view.mapType) };
  }

  async function mount(host, options) {
    if (!host || typeof host.appendChild !== 'function' || !options || !options.city || !validCenter(options.city.center)) {
      throw new TypeError('A map host and valid city coordinates are required');
    }
    if (runtime.active && runtime.cityKey !== options.cityKey) rememberView();
    const version = ++runtime.mountVersion;
    runtime.active = true;
    runtime.host = host;
    runtime.options = options;
    runtime.phase = phaseName(options.phase);
    ensureCanvas();
    if (runtime.canvas.parentNode !== host) host.appendChild(runtime.canvas);
    const config = root.MAU_MAPS_CONFIG || {};
    if (typeof config.apiKey !== 'string' || !config.apiKey.trim()) {
      notify('missing-key', '城市地图尚未连接，配置 Google Maps 后即可自由探索。');
      return;
    }
    if (runtime.authFailed) { notify('error', '请修正 Google 地图服务配置后刷新页面。'); return; }
    const sameCity = runtime.map && runtime.cityKey === options.cityKey;
    if (!sameCity || !runtime.status || runtime.status.state !== 'ready') notify('loading', '正在连接 Google 地图…');
    else notify(runtime.status.state, runtime.status.message);
    try {
      const maps = await loadSDK();
      if (!runtime.active || version !== runtime.mountVersion) return;
      if (!runtime.map) {
        const view = viewFor(options);
        runtime.cityKey = options.cityKey;
        runtime.mapType = view.mapType;
        runtime.targetView = view;
        runtime.settled = false;
        runtime.configuring = true;
        runtime.map = new maps.Map(runtime.canvas, {
          center: { lat: view.lat, lng: view.lng }, zoom: view.zoom,
          mapTypeId: view.mapType, styles: STYLES[runtime.phase],
          disableDefaultUI: true, zoomControl: false, streetViewControl: false,
          mapTypeControl: false, fullscreenControl: false,
          gestureHandling: 'greedy', scrollwheel: true,
          keyboardShortcuts: true, clickableIcons: true, minZoom: 3, maxZoom: 20
        });
        bindMapEvents();
        replaceLandmarks(options.city);
        runtime.configuring = false;
        waitForTiles();
      } else if (runtime.cityKey !== options.cityKey) {
        const view = viewFor(options);
        runtime.configuring = true;
        runtime.settled = false;
        runtime.targetView = view;
        runtime.cityKey = options.cityKey;
        runtime.mapType = view.mapType;
        runtime.map.setOptions({ center: { lat: view.lat, lng: view.lng }, zoom: view.zoom,
          mapTypeId: view.mapType, styles: STYLES[runtime.phase] });
        replaceLandmarks(options.city);
        runtime.configuring = false;
        waitForTiles();
      } else {
        runtime.map.setOptions({ styles: STYLES[runtime.phase] });
        runtime.overlays.forEach(function (overlay) { overlay.update(); });
        if (runtime.status.state !== 'ready') waitForTiles();
      }
      // Resize the retained DOM after mounting; never reset the same city's camera.
      maps.event.trigger(runtime.map, 'resize');
    } catch (error) {
      runtime.configuring = false;
      if (!runtime.active || version !== runtime.mountVersion) return;
      const known = ['missing-key', 'network', 'timeout', 'sdk', 'auth'].includes(error && error.code);
      notify(error && error.code === 'missing-key' ? 'missing-key' : 'error', known ? error.message : '地图暂时无法加载，请稍后重试。');
    }
  }

  function detach() {
    rememberView();
    runtime.active = false;
    runtime.mountVersion++;
    root.clearTimeout(runtime.tileTimer);
    runtime.tileVersion++;
    if (runtime.canvas) runtime.canvas.remove();
    runtime.host = null;
  }
  function zoomBy(delta) {
    if (!runtime.active || !runtime.map || !finite(delta)) return;
    runtime.targetView = null;
    runtime.map.setZoom(Math.max(3, Math.min(20, runtime.map.getZoom() + delta)));
  }
  function focusLandmark(id) {
    if (!runtime.active || !runtime.map || !runtime.options) return;
    const landmark = (runtime.options.city.landmarks || []).find(function (item) { return item.id === id; });
    if (!landmark || !validCenter(landmark.position || landmark)) return;
    runtime.targetView = null;
    selectLandmark(id);
    runtime.map.panTo(landmark.position || { lat: landmark.lat, lng: landmark.lng });
    if (runtime.map.getZoom() < 15) runtime.map.setZoom(15);
    if (typeof runtime.options.onLandmark === 'function') runtime.options.onLandmark(landmark, runtime.cityKey);
  }
  function setTheme(phase) {
    const next = phaseName(phase);
    if (runtime.phase === next) return;
    runtime.phase = next;
    if (runtime.map) runtime.map.setOptions({ styles: STYLES[next] });
    runtime.overlays.forEach(function (overlay) { overlay.update(); });
  }
  function setPlaying(playing) {
    runtime.playing = !!playing;
    runtime.overlays.forEach(function (overlay) { overlay.update(); });
  }
  function setMapType(type) {
    runtime.mapType = mapType(type);
    if (!runtime.map || !runtime.active) return;
    runtime.map.setMapTypeId(runtime.mapType);
    rememberView();
  }
  function retry() {
    if (!runtime.active || !runtime.host || !runtime.options) return Promise.resolve();
    if (runtime.authFailed) { notify('error', '请修正 Google 地图服务配置后刷新页面。'); return Promise.resolve(); }
    // Only an explicit retry after failure recreates the SDK instance. Ordinary
    // renders retain it; this forces failed tile requests to be attempted again.
    if (runtime.map && runtime.status && runtime.status.state === 'error') {
      rememberView();
      runtime.overlays.forEach(function (overlay) { overlay.setMap(null); });
      runtime.overlays = [];
      root.google.maps.event.clearInstanceListeners(runtime.map);
      runtime.map = null;
      runtime.cityKey = null;
      runtime.settled = false;
      runtime.targetView = null;
      runtime.canvas.replaceChildren();
      runtime.status = null;
    }
    return mount(runtime.host, runtime.options);
  }

  root.MAUGoogleMaps = { mount: mount, detach: detach, zoomBy: zoomBy,
    focusLandmark: focusLandmark, setTheme: setTheme, setPlaying: setPlaying,
    setMapType: setMapType, retry: retry };
})(typeof window !== 'undefined' ? window : globalThis);
