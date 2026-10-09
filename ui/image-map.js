/* Offline reference-map viewer. No SDK, geocoding or network map tiles are used.
 * Saved camera: { imageMap: { version: 2, scale, x, y } }; x/y describe the
 * expanded image under the viewport centre (0..1), independently of resizing.
 * Points/defaultCenter use original screenshot coordinates. contentRect places
 * that screenshot inside the expanded image, using normalized x/y/width/height.
 * Points may include artSrc/artNightSrc (local transparent day/night renders)
 * and artWidth (CSS pixels, default 112). Artwork uses a stable square frame.
 * Twilight uses the lit night render; a missing variant reuses the other one.
 */
(function (root) {
  'use strict';

  const MAX_SCALE = 5;
  const CAMERA_VERSION = 2;
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const positive = value => finite(value) && value > 0 ? value : 1;
  function baseScale(size) {
    return Math.max(positive(size.width) / positive(size.imageWidth), positive(size.height) / positive(size.imageHeight));
  }
  function dimensions(size, scale) {
    const factor = baseScale(size) * scale;
    return { width: positive(size.imageWidth) * factor, height: positive(size.imageHeight) * factor };
  }
  function normalizeView(view, size) {
    view = view || {};
    const scale = clamp(finite(view.scale) ? view.scale : 1, 1, MAX_SCALE);
    const rendered = dimensions(size, scale);
    const xMargin = Math.min(.5, positive(size.width) / (2 * rendered.width));
    const yMargin = Math.min(.5, positive(size.height) / (2 * rendered.height));
    return { scale: scale,
      x: clamp(finite(view.x) ? view.x : .5, xMargin, 1 - xMargin),
      y: clamp(finite(view.y) ? view.y : .5, yMargin, 1 - yMargin) };
  }
  function project(point, view, size) {
    const rendered = dimensions(size, view.scale);
    return { x: size.width / 2 + (point.x - view.x) * rendered.width,
      y: size.height / 2 + (point.y - view.y) * rendered.height };
  }
  function unproject(point, view, size) {
    const rendered = dimensions(size, view.scale);
    return { x: view.x + (point.x - size.width / 2) / rendered.width,
      y: view.y + (point.y - size.height / 2) / rendered.height };
  }
  function zoomAt(view, scale, anchor, size) {
    const location = unproject(anchor, view, size);
    scale = clamp(finite(scale) ? scale : view.scale, 1, MAX_SCALE);
    const rendered = dimensions(size, scale);
    return normalizeView({ scale: scale,
      x: location.x - (anchor.x - size.width / 2) / rendered.width,
      y: location.y - (anchor.y - size.height / 2) / rendered.height }, size);
  }
  function panBy(view, dx, dy, size) {
    const rendered = dimensions(size, view.scale);
    return normalizeView({ scale: view.scale, x: view.x - dx / rendered.width,
      y: view.y - dy / rendered.height }, size);
  }
  function rectanglesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }
  function contentRect(value) {
    if (!value || !finite(value.x) || !finite(value.y) || !finite(value.width) || !finite(value.height) ||
        value.x < 0 || value.y < 0 || value.width <= 0 || value.height <= 0 ||
        value.x + value.width > 1.000001 || value.y + value.height > 1.000001) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }
    return { x: value.x, y: value.y, width: Math.min(value.width, 1 - value.x), height: Math.min(value.height, 1 - value.y) };
  }
  function mapPoint(point, rect) {
    return { x: rect.x + point.x * rect.width, y: rect.y + point.y * rect.height };
  }
  function defaultView(size, rect, center, scale) {
    const point = mapPoint(validPoint(center) ? center : { x: .5, y: .5 }, rect);
    return normalizeView({ scale: finite(scale) ? scale : 1.15, x: point.x, y: point.y }, size);
  }
  function initialView(saved, size, rect, center, scale) {
    if (!saved || !finite(saved.scale) || saved.scale < 1) return defaultView(size, rect, center, scale);
    if (saved.version === CAMERA_VERSION) return normalizeView(saved, size);
    // The old overview could not pan. Upgrade it to the new, city-specific
    // full-screen framing instead of restoring the former narrow image strip.
    if (saved.scale <= 1.02) return defaultView(size, rect, center, scale);
    const originalWidth = positive(size.imageWidth) * rect.width;
    const originalHeight = positive(size.imageHeight) * rect.height;
    const oldBase = Math.min(positive(size.width) / originalWidth, positive(size.height) / originalHeight);
    const point = mapPoint({ x: finite(saved.x) ? saved.x : .5, y: finite(saved.y) ? saved.y : .5 }, rect);
    return normalizeView({ scale: saved.scale * oldBase / baseScale(size), x: point.x, y: point.y }, size);
  }

  const state = {
    canvas: null, scene: null, image: null, markers: null, credit: null,
    host: null, options: null, cityKey: null, imageSrc: null, loaded: false,
    active: false, phase: 'day', playing: false, selected: null,
    view: { scale: 1, x: .5, y: .5 }, size: { width: 1, height: 1, imageWidth: 1, imageHeight: 1 },
    contentRect: { x: 0, y: 0, width: 1, height: 1 }, defaultCenter: { x: .5, y: .5 }, defaultScale: 1.15, pendingCamera: null,
    saved: Object.create(null), points: [], pointers: new Map(), resizeObserver: null,
    loadVersion: 0, finishLoad: null, loadPromise: null, frame: null, status: null
  };
  function phaseName(value) { return value === 'night' || value === 'twilight' ? value : 'day'; }
  function validPoint(point) {
    return point && finite(point.x) && finite(point.y) && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
  }
  function cssImage(source) { return 'url(' + JSON.stringify(source) + ')'; }
  function updatePointArt(item) {
    if (!item.art) return;
    const source = state.phase === 'day' ? item.artSrc || item.artNightSrc : item.artNightSrc || item.artSrc;
    if (item.currentArtSrc === source) return;
    item.art.style.backgroundImage = cssImage(source);
    item.currentArtSrc = source;
  }
  function publishStatus(kind, message) {
    state.status = { state: kind, message: message };
    if (state.active && typeof state.options.onStatus === 'function') state.options.onStatus(state.status);
  }
  function rememberView() {
    if (!state.loaded || !state.cityKey || state.pendingCamera) return;
    const view = { imageMap: { version: CAMERA_VERSION, scale: state.view.scale, x: state.view.x, y: state.view.y } };
    state.saved[state.cityKey] = { imageSrc: state.imageSrc, view: view };
    if (state.active && typeof state.options.onViewChange === 'function') state.options.onViewChange(state.cityKey, view);
  }
  function measure() {
    if (!state.canvas || !state.loaded) return;
    const rect = state.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    state.size = { width: rect.width, height: rect.height,
      imageWidth: state.image.naturalWidth, imageHeight: state.image.naturalHeight };
    if (state.pendingCamera) {
      state.view = initialView(state.pendingCamera.saved, state.size, state.contentRect, state.defaultCenter, state.defaultScale);
      state.pendingCamera = null;
    } else state.view = normalizeView(state.view, state.size);
  }
  function draw() {
    state.frame = null;
    if (!state.active || !state.loaded || state.pendingCamera) return;
    const rendered = dimensions(state.size, state.view.scale);
    const left = state.size.width / 2 - state.view.x * rendered.width;
    const top = state.size.height / 2 - state.view.y * rendered.height;
    const imageScale = baseScale(state.size) * state.view.scale;
    state.scene.style.transform = 'translate(' + left + 'px,' + top + 'px) scale(' + imageScale + ')';
    state.canvas.dataset.scale = state.view.scale.toFixed(2);
    const placed = state.points.map(function (item) {
      const point = project(mapPoint(item.point, state.contentRect), state.view, state.size);
      item.element.style.left = point.x + 'px';
      item.element.style.top = point.y + 'px';
      const selected = item.point.id === state.selected;
      item.element.hidden = point.x < -80 || point.x > state.size.width + 80 || point.y < -40 || point.y > state.size.height + item.height;
      // Southern landmarks sit in front; the current destination stays on top.
      item.element.style.zIndex = String(selected ? 2000 : 10 + Math.round(item.point.y * 1000));
      item.element.setAttribute('aria-pressed', selected ? 'true' : 'false');
      item.element.dataset.playing = state.playing && selected ? 'true' : 'false';
      const width = item.element.offsetWidth || item.width;
      const height = item.element.offsetHeight || item.height;
      return { item: item, selected: selected, bounds: { left: point.x - width / 2 - 4,
        right: point.x + width / 2 + 4, top: point.y - height - 3, bottom: point.y + 3 } };
    });
    // Dense full-city views favour the recognisable buildings. A chosen small
    // point is always shown; every hidden point still has its external rail entry.
    const buildings = placed.filter(entry => entry.item.hasArt && !entry.item.element.hidden);
    placed.forEach(function (entry) {
      if (entry.item.hasArt || entry.selected || entry.item.element.hidden) return;
      entry.item.element.hidden = buildings.some(building => rectanglesOverlap(entry.bounds, building.bounds));
    });
    rememberView();
  }
  function scheduleDraw() {
    if (state.frame !== null) return;
    if (typeof root.requestAnimationFrame === 'function') state.frame = root.requestAnimationFrame(draw);
    else draw();
  }
  function ready() { return state.active && state.loaded && !state.pendingCamera; }
  function setView(view) {
    if (!ready()) return;
    state.view = normalizeView(view, state.size);
    scheduleDraw();
  }
  function localPoint(event) {
    const rect = state.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function centre(points) {
    if (points.length < 2) return points[0];
    return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
  }
  function distance(points) {
    return points.length < 2 ? 0 : Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }
  function stopPointers() {
    if (state.canvas && typeof state.canvas.releasePointerCapture === 'function') {
      state.pointers.forEach(function (_, id) {
        try { state.canvas.releasePointerCapture(id); } catch (_) { /* The browser may already have released it. */ }
      });
    }
    state.pointers.clear();
    if (state.canvas) state.canvas.dataset.dragging = 'false';
  }
  function bindEvents(canvas) {
    canvas.addEventListener('pointerdown', function (event) {
      if (!ready() || (event.button !== undefined && event.button !== 0)) return;
      if (event.target.closest && event.target.closest('.mauImagePoint')) return;
      event.preventDefault();
      canvas.focus({ preventScroll: true });
      state.pointers.set(event.pointerId, localPoint(event));
      canvas.dataset.dragging = 'true';
      if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!ready() || !state.pointers.has(event.pointerId)) return;
      event.preventDefault();
      const previous = Array.from(state.pointers.values()).slice(0, 2);
      state.pointers.set(event.pointerId, localPoint(event));
      const current = Array.from(state.pointers.values()).slice(0, 2);
      const oldCentre = centre(previous), newCentre = centre(current);
      let view = state.view;
      const oldDistance = distance(previous), newDistance = distance(current);
      if (previous.length === 2 && oldDistance > 0) {
        view = zoomAt(view, view.scale * newDistance / oldDistance, oldCentre, state.size);
      }
      setView(panBy(view, newCentre.x - oldCentre.x, newCentre.y - oldCentre.y, state.size));
    });
    function release(event) {
      state.pointers.delete(event.pointerId);
      canvas.dataset.dragging = state.pointers.size ? 'true' : 'false';
      if (!state.pointers.size) rememberView();
    }
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('lostpointercapture', release);
    canvas.addEventListener('wheel', function (event) {
      if (!ready()) return;
      event.preventDefault();
      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? state.size.height : 1;
      const factor = Math.exp(clamp(-event.deltaY * multiplier * .002, -.7, .7));
      setView(zoomAt(state.view, state.view.scale * factor, localPoint(event), state.size));
    }, { passive: false });
    canvas.addEventListener('dblclick', function (event) {
      if (!ready() || (event.target.closest && event.target.closest('.mauImagePoint'))) return;
      event.preventDefault();
      setView(zoomAt(state.view, state.view.scale * 1.6, localPoint(event), state.size));
    });
    canvas.addEventListener('keydown', function (event) {
      if (!ready() || event.target !== canvas || event.altKey || event.ctrlKey || event.metaKey) return;
      const pans = { ArrowLeft: [48, 0], ArrowRight: [-48, 0], ArrowUp: [0, 48], ArrowDown: [0, -48] };
      if (pans[event.key]) {
        event.preventDefault();
        setView(panBy(state.view, pans[event.key][0], pans[event.key][1], state.size));
      } else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomBy(1); }
      else if (event.key === '-' || event.key === '_') { event.preventDefault(); zoomBy(-1); }
      else if (event.key === '0' || event.key === 'Home') { event.preventDefault(); reset(); }
    });
  }
  function ensureCanvas() {
    if (state.canvas) return;
    const style = root.document.createElement('style');
    style.id = 'mau-image-map-style';
    style.textContent = `
      .mauImageMap {
        --mau-map-tone: brightness(1) saturate(1);
        position: absolute; inset: 0; overflow: hidden; isolation: isolate;
        touch-action: none; cursor: grab; background: #dcefea; outline: none;
        -webkit-user-select: none; user-select: none;
      }
      .mauImageMap:focus-visible { box-shadow: inset 0 0 0 3px #00b69a; }
      .mauImageMap[data-dragging="true"] { cursor: grabbing; }
      .mauImageScene {
        position: absolute; left: 0; top: 0; z-index: 1; isolation: isolate;
        transform-origin: 0 0; pointer-events: none; will-change: transform; opacity: 0;
      }
      .mauImageMap[data-loaded="true"] .mauImageScene { opacity: 1; }
      .mauImageScene img {
        display: block; max-width: none; max-height: none; pointer-events: none;
        filter: var(--mau-map-tone); transition: filter .6s;
      }
      .mauImageMap[data-phase="night"] {
        --mau-map-tone: brightness(.84) saturate(.9) contrast(1.04);
        background: #243e48;
      }
      .mauImageMap[data-phase="twilight"] {
        --mau-map-tone: sepia(.1) saturate(.94) brightness(.97);
        background: #e3d9d0;
      }
      .mauImageMarkers { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
      .mauImagePoint {
        position: absolute; display: flex; flex-direction: column; align-items: center; gap: 0;
        transform: translate(-50%, -100%); padding: 0; border: 0; border-radius: 12px;
        background: none; color: #214b50; white-space: nowrap;
        font-family: inherit; font-size: 10px; line-height: 1.2;
        pointer-events: auto; cursor: pointer; isolation: isolate;
      }
      .mauImagePoint[hidden] { display: none; }
      .mauImagePointArt {
        display: block; flex-shrink: 0; background-repeat: no-repeat;
        background-position: center bottom; background-size: contain;
        filter: drop-shadow(0 2px 3px #193b4418); pointer-events: none;
        margin-bottom: -1px;
      }
      .mauImagePointLabel {
        display: block; max-width: 126px; overflow: hidden; text-overflow: ellipsis;
        box-sizing: border-box;
        padding: 5px 9px; border: 1px solid #ffffffbf; border-radius: 8px;
        background: #ffffffe8; box-shadow: 0 2px 6px #193d4314;
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        color: #25434a; font-weight: 550; letter-spacing: .1px;
      }
      .mauImagePointDot {
        position: relative; display: block; width: 7px; height: 7px;
        margin-top: 3px; border-radius: 50%; border: 1px solid #ffffffed;
        background: #379d89; box-shadow: 0 1px 3px #14474826; flex-shrink: 0;
      }
      .mauImagePoint[aria-pressed="true"] .mauImagePointLabel {
        border-color: #539f8db3; color: #136551; background: #f6fffbf2;
        box-shadow: 0 2px 8px #133d4821;
      }
      .mauImagePoint[aria-pressed="true"] .mauImagePointDot { box-shadow: 0 0 0 3px #51ad9424; }
      .mauImagePoint:focus-visible { outline: 3px solid #00a987; outline-offset: 5px; }
      .mauImageMap[data-phase="night"] .mauImagePointLabel {
        background: #203640e8; color: #e9f3f3; border-color: #b3d0d138;
      }
      .mauImageMap[data-phase="night"] .mauImagePoint[aria-pressed="true"] .mauImagePointLabel {
        background: #294941f2; color: #e0fff0; border-color: #90cbb78c;
      }
      .mauImageMap[data-phase="night"] .mauImagePointArt { filter: drop-shadow(0 2px 3px #071d3229); }
      .mauImagePoint[data-playing="true"] .mauImagePointDot::before {
        content: ''; position: absolute; inset: -6px; border: 1px solid #27d5bb;
        border-radius: 50%; animation: mauImagePulse 2.5s ease-out infinite; pointer-events: none;
      }
      .mauImageCredit {
        position: absolute; right: 8px; bottom: 7px; z-index: 3; pointer-events: none;
        border-radius: 6px; padding: 3px 6px; background: #fffffff0; color: #385963;
        font: 9px/1.4 -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: 0 1px 5px #163d4710;
      }
      .mauImageMap[data-phase="night"] .mauImageCredit { background: #16323ff2; color: #e5f3f6; }
      @keyframes mauImagePulse { from { transform: scale(.8); opacity: .9; } to { transform: scale(1.55); opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .mauImageScene img { transition: none; }
        .mauImagePoint[data-playing="true"] .mauImagePointDot::before { animation: none; }
      }
      @media (prefers-reduced-transparency: reduce) {
        .mauImagePointLabel { background: #fff; backdrop-filter: none; -webkit-backdrop-filter: none; }
        .mauImageMap[data-phase="night"] .mauImagePointLabel { background: #203640; }
        .mauImageMap .mauImagePoint[aria-pressed="true"] .mauImagePointLabel { background: #f6fffb; }
        .mauImageMap[data-phase="night"] .mauImagePoint[aria-pressed="true"] .mauImagePointLabel { background: #294941; }
      }
    `;
    if (!root.document.getElementById(style.id)) root.document.head.appendChild(style);
    state.canvas = root.document.createElement('div');
    state.canvas.className = 'mauImageMap';
    state.canvas.tabIndex = 0;
    state.canvas.setAttribute('role', 'region');
    state.scene = root.document.createElement('div');
    state.scene.className = 'mauImageScene';
    state.markers = root.document.createElement('div');
    state.markers.className = 'mauImageMarkers';
    state.credit = root.document.createElement('div');
    state.credit.className = 'mauImageCredit';
    state.credit.textContent = '地图参考图 · Google Maps';
    state.canvas.appendChild(state.scene);
    state.canvas.appendChild(state.markers);
    state.canvas.appendChild(state.credit);
    bindEvents(state.canvas);
    if (typeof root.addEventListener === 'function') root.addEventListener('resize', function () {
      if (state.active && state.loaded) { measure(); scheduleDraw(); }
    });
  }
  function replacePoints() {
    state.markers.replaceChildren();
    state.points = [];
    const points = (state.options.points || []).filter(validPoint);
    if (!points.some(point => point.id === state.selected)) state.selected = points[0] ? points[0].id : null;
    points.forEach(function (point) {
      const button = root.document.createElement('button');
      button.className = 'mauImagePoint';
      button.type = 'button';
      button.setAttribute('aria-label', '查看' + point.name + '附近');
      const artSrc = typeof point.artSrc === 'string' ? point.artSrc.trim() : '';
      const artNightSrc = typeof point.artNightSrc === 'string' ? point.artNightSrc.trim() : '';
      const hasArt = !!(artSrc || artNightSrc);
      const artWidth = clamp(finite(point.artWidth) ? point.artWidth : 112, 52, 132);
      let art = null;
      if (hasArt) {
        art = root.document.createElement('span');
        art.className = 'mauImagePointArt';
        art.setAttribute('aria-hidden', 'true');
        art.style.width = artWidth + 'px';
        art.style.height = artWidth + 'px';
        button.dataset.art = 'true';
        button.appendChild(art);
      }
      const dot = root.document.createElement('span');
      dot.className = 'mauImagePointDot';
      dot.setAttribute('aria-hidden', 'true');
      const label = root.document.createElement('span');
      label.className = 'mauImagePointLabel';
      label.textContent = point.name;
      button.appendChild(label);
      button.appendChild(dot);
      button.addEventListener('click', function (event) { event.stopPropagation(); focusPoint(point); });
      state.markers.appendChild(button);
      const item = { point: point, element: button, art: art, artSrc: artSrc, artNightSrc: artNightSrc, hasArt: hasArt,
        width: Math.max(hasArt ? artWidth : 0, clamp(String(point.name).length * 10 + 18, 38, 126)),
        height: hasArt ? artWidth + 38 : 38 };
      updatePointArt(item);
      state.points.push(item);
    });
  }
  function stopLoad() {
    state.loadVersion++;
    if (state.image) { state.image.onload = null; state.image.onerror = null; }
    if (state.finishLoad) state.finishLoad(false);
    state.finishLoad = null;
    state.loadPromise = null;
  }
  function mount(host, options) {
    if (!host || typeof host.appendChild !== 'function' || !options || !options.cityKey || typeof options.imageSrc !== 'string' || !options.imageSrc) {
      throw new TypeError('An image-map host, city key and local image source are required');
    }
    rememberView();
    stopPointers();
    if (state.resizeObserver) state.resizeObserver.disconnect();
    ensureCanvas();
    state.active = true;
    state.host = host;
    state.options = options;
    state.contentRect = contentRect(options.contentRect);
    state.defaultCenter = validPoint(options.defaultCenter) ? options.defaultCenter : { x: .5, y: .5 };
    state.defaultScale = finite(options.defaultScale) ? clamp(options.defaultScale, 1, MAX_SCALE) : 1.15;
    state.phase = phaseName(options.phase);
    state.canvas.dataset.phase = state.phase;
    state.canvas.setAttribute('aria-label', (options.cityName || '城市') + '地图参考图，可拖动，双指或滚轮缩放，方向键移动，加减键缩放，0 键复位');
    if (state.canvas.parentNode !== host) host.appendChild(state.canvas);
    if (typeof root.ResizeObserver === 'function') {
      state.resizeObserver = new root.ResizeObserver(function () {
        if (state.active && state.loaded) { measure(); scheduleDraw(); }
      });
      state.resizeObserver.observe(state.canvas);
    }
    const sameImage = state.cityKey === options.cityKey && state.imageSrc === options.imageSrc;
    if (sameImage && state.loaded) {
      replacePoints(); measure(); draw();
      publishStatus('ready', '地图参考图已就绪，可拖动、缩放查看。');
      return Promise.resolve(true);
    }
    if (sameImage && state.loadPromise) return state.loadPromise;
    stopLoad();
    state.cityKey = options.cityKey;
    state.imageSrc = options.imageSrc;
    state.loaded = false;
    state.canvas.dataset.loaded = 'false';
    state.selected = null;
    state.points = [];
    state.markers.replaceChildren();
    const previous = state.saved[options.cityKey];
    const view = previous && previous.imageSrc === options.imageSrc ? previous.view : options.view;
    state.pendingCamera = { saved: view && view.imageMap ? { ...view.imageMap } : null };
    state.image = root.document.createElement('img');
    const image = state.image;
    image.alt = (options.cityName || '城市') + '地图参考截图';
    image.draggable = false;
    state.scene.style.transform = '';
    state.scene.replaceChildren(image);
    publishStatus('loading', '正在打开城市地图参考图…');
    const version = state.loadVersion;
    state.loadPromise = new Promise(function (resolve) {
      state.finishLoad = resolve;
      function finish(success) {
        if (!state.active || version !== state.loadVersion || image !== state.image) return;
        image.onload = null; image.onerror = null;
        state.finishLoad = null; state.loadPromise = null;
        if (!success || !image.naturalWidth || !image.naturalHeight) {
          publishStatus('error', '地图参考图未能打开，请重新加载。');
          resolve(false); return;
        }
        state.loaded = true;
        state.canvas.dataset.loaded = 'true';
        state.scene.style.width = image.naturalWidth + 'px';
        state.scene.style.height = image.naturalHeight + 'px';
        image.style.width = image.naturalWidth + 'px';
        image.style.height = image.naturalHeight + 'px';
        measure(); replacePoints(); draw();
        publishStatus('ready', '地图参考图已就绪，可拖动、缩放查看。');
        resolve(true);
      }
      image.onload = function () { finish(true); };
      image.onerror = function () { finish(false); };
      image.src = options.imageSrc;
    });
    return state.loadPromise;
  }
  function detach() {
    rememberView();
    stopPointers();
    state.active = false;
    if (state.frame !== null && typeof root.cancelAnimationFrame === 'function') root.cancelAnimationFrame(state.frame);
    state.frame = null;
    if (state.resizeObserver) state.resizeObserver.disconnect();
    if (!state.loaded) { stopLoad(); state.imageSrc = null; }
    if (state.canvas) state.canvas.remove();
    state.host = null;
  }
  function zoomBy(delta) {
    if (!ready() || !finite(delta)) return;
    setView(zoomAt(state.view, state.view.scale * Math.pow(1.35, delta), { x: state.size.width / 2, y: state.size.height / 2 }, state.size));
  }
  function reset() { if (ready()) { stopPointers(); setView(defaultView(state.size, state.contentRect, state.defaultCenter, state.defaultScale)); } }
  function focusPoint(point) {
    if (!ready()) return;
    if (typeof point === 'string') {
      const match = state.points.find(item => item.point.id === point);
      point = match && match.point;
    }
    if (!validPoint(point)) return;
    state.selected = point.id;
    const mapped = mapPoint(point, state.contentRect);
    setView({ scale: Math.max(1.6, state.view.scale), x: mapped.x, y: mapped.y });
    if (typeof state.options.onLandmark === 'function') state.options.onLandmark(point, state.cityKey);
  }
  function getSelectedPoint() {
    const selected = state.points.find(item => item.point.id === state.selected);
    return selected ? selected.point : null;
  }
  function setTheme(phase) {
    state.phase = phaseName(phase);
    if (state.canvas) state.canvas.dataset.phase = state.phase;
    state.points.forEach(updatePointArt);
  }
  function setPlaying(playing) { state.playing = !!playing; if (ready()) scheduleDraw(); }
  function retry() {
    if (!state.active || !state.host) return Promise.resolve(false);
    return mount(state.host, state.options);
  }
  root.MAUImageMap = { mount: mount, detach: detach, zoomBy: zoomBy, reset: reset,
    focusPoint: focusPoint, focusLandmark: focusPoint, getSelectedPoint: getSelectedPoint,
    setTheme: setTheme, setPlaying: setPlaying, retry: retry,
    geometry: { baseScale: baseScale, normalizeView: normalizeView, project: project,
      unproject: unproject, zoomAt: zoomAt, panBy: panBy, rectanglesOverlap: rectanglesOverlap,
      contentRect: contentRect, mapPoint: mapPoint, defaultView: defaultView, initialView: initialView } };
})(typeof window !== 'undefined' ? window : globalThis);
