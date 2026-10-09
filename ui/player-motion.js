/* Two-page player gestures. No dependencies or global DOM queries.
 *
 * const pager = MAUPlayerMotion.mount(element, {
 *   index: 0,                         // 0: artwork, 1: lyrics
 *   track: element.querySelector('.playerPages'), // optional; string also accepted
 *   duration: 360,                    // reduced-motion always settles immediately
 *   onChange(index) {},               // once per committed change, including goTo
 *   onSettled(index) {}               // when a navigation/snap finishes
 * });
 * pager.goTo(1, { animate: true, notify: true });
 * pager.getIndex(); pager.refresh(); pager.destroy();
 *
 * Root must contain one .playerPages track with two 100%-width flex pages.
 * destroy() removes listeners/timers and leaves the committed page in place.
 */
(function (root) {
  'use strict';

  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const indexOf = value => clamp(Math.round(finite(value) ? value : 0), 0, 1);
  function decideAxis(dx, dy, threshold) {
    threshold = finite(threshold) ? threshold : 8;
    const x = Math.abs(dx), y = Math.abs(dy);
    if (Math.max(x, y) < threshold) return 'pending';
    if (y > x * 1.15) return 'vertical';
    if (x > y * 1.15) return 'horizontal';
    return Math.max(x, y) >= threshold * 2 ? (x > y ? 'horizontal' : 'vertical') : 'pending';
  }
  function rubberBand(offset, width) {
    if (!finite(offset) || !finite(width) || width <= 0) return 0;
    if (offset <= 0 && offset >= -width) return offset;
    const edge = offset > 0 ? 0 : -width;
    const overflow = offset - edge;
    return edge + overflow * .32 / (1 + Math.abs(overflow) / width);
  }
  function decideGesture(input) {
    input = input || {};
    const index = indexOf(input.index);
    const dx = finite(input.deltaX) ? input.deltaX : 0;
    const velocity = finite(input.velocityX) ? input.velocityX : 0;
    const width = finite(input.width) ? input.width : 0;
    if (width <= 0 || (input.axis && input.axis !== 'horizontal')) return { index: index, commit: false, direction: 0 };
    const flick = Math.abs(velocity) >= .5 && Math.abs(dx) >= 14;
    const far = Math.abs(dx) >= Math.min(96, width * .24);
    if (!flick && !far) return { index: index, commit: false, direction: 0 };
    const direction = (flick ? velocity : dx) < 0 ? 1 : -1;
    const next = indexOf(index + direction);
    return { index: next, commit: next !== index, direction: next !== index ? direction : 0 };
  }
  function transformX(value) {
    if (typeof value !== 'string' || !value || value === 'none') return null;
    const matrix = value.match(/^matrix(3d)?\(([^)]+)\)$/);
    if (matrix) {
      const values = matrix[2].split(',').map(Number);
      const x = values[matrix[1] ? 12 : 4];
      return finite(x) ? x : null;
    }
    const translate = value.match(/translate(?:3d|X)?\(\s*(-?[\d.]+)px/);
    return translate ? Number(translate[1]) : null;
  }

  function mount(element, options) {
    options = options || {};
    if (!element || typeof element.addEventListener !== 'function') throw new TypeError('A player pager element is required');
    const track = typeof options.track === 'string' ? element.querySelector(options.track) : options.track || element.querySelector('.playerPages');
    if (!track || !track.style) throw new TypeError('The player pager needs a .playerPages track');
    const ownerDocument = element.ownerDocument || root.document;
    const listeners = [];
    const contacts = new Set();
    const previous = { touchAction: element.style.touchAction, transition: track.style.transition,
      willChange: track.style.willChange, tabIndex: element.getAttribute ? element.getAttribute('tabindex') : null,
      swiping: element.dataset ? element.dataset.swiping : undefined };
    const media = typeof root.matchMedia === 'function' ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let destroyed = false, index = indexOf(options.index === undefined ? options.initialIndex : options.index);
    let width = 0, offset = 0, gesture = null, animation = null, animationSequence = 0;
    let resizeObserver = null, suppressedClick = null;
    const duration = finite(options.duration) ? clamp(options.duration, 0, 1000) : 360;
    const now = () => root.performance && typeof root.performance.now === 'function' ? root.performance.now() : Date.now();
    const reducedMotion = () => !!(media && media.matches);

    function listen(target, type, callback, config) {
      if (!target || typeof target.addEventListener !== 'function') return;
      target.addEventListener(type, callback, config);
      listeners.push(() => target.removeEventListener(type, callback, config));
    }
    function measure() {
      const rect = element.getBoundingClientRect();
      width = Math.max(0, finite(element.clientWidth) && element.clientWidth > 0 ? element.clientWidth : rect.width || 0);
    }
    function applyOffset(value) {
      offset = finite(value) ? value : 0;
      track.style.transform = 'translate3d(' + offset + 'px,0,0)';
    }
    function currentOffset() {
      if (animation && typeof root.getComputedStyle === 'function') {
        const visual = transformX(root.getComputedStyle(track).transform);
        if (visual !== null) return visual;
      }
      return offset;
    }
    function stopAnimation() {
      const current = currentOffset();
      animationSequence++;
      if (animation) {
        root.clearTimeout(animation.timer);
        track.removeEventListener('transitionend', animation.onEnd);
        animation = null;
      }
      track.style.transition = 'none';
      applyOffset(current);
      return current;
    }
    function setSwiping(value) { if (element.dataset) element.dataset.swiping = value ? 'true' : 'false'; }
    function releaseGesture() {
      const previousGesture = gesture;
      gesture = null;
      setSwiping(false);
      if (previousGesture && typeof element.releasePointerCapture === 'function') {
        try { element.releasePointerCapture(previousGesture.id); } catch (_) { /* Capture may already have ended. */ }
      }
      return previousGesture;
    }
    function emitSettled() {
      if (!destroyed && typeof options.onSettled === 'function') options.onSettled(index);
    }
    function navigate(nextIndex, config) {
      if (destroyed) return index;
      config = config || {};
      releaseGesture();
      const from = stopAnimation();
      const next = indexOf(nextIndex), changed = next !== index;
      index = next;
      const destination = -index * width;
      const animate = config.animate !== false && !reducedMotion() && duration > 0 && width > 0 && Math.abs(destination - from) > .5;
      if (animate) {
        // A synchronous layout commits the interrupted presentation position
        // before installing the next transition, so rapid reversals stay smooth.
        track.getBoundingClientRect();
        const sequence = ++animationSequence;
        function finish() {
          if (destroyed || !animation || animation.sequence !== sequence) return;
          root.clearTimeout(animation.timer);
          track.removeEventListener('transitionend', animation.onEnd);
          animation = null;
          track.style.transition = 'none';
          applyOffset(-index * width);
          emitSettled();
        }
        const onEnd = event => {
          if (event.target !== track || (event.propertyName && event.propertyName !== 'transform')) return;
          if (Math.abs(currentOffset() - destination) > 1) return;
          finish();
        };
        animation = { sequence: sequence, onEnd: onEnd, timer: root.setTimeout(finish, duration + 80) };
        track.addEventListener('transitionend', onEnd);
        track.style.transition = 'transform ' + duration + 'ms cubic-bezier(.22,.75,.15,1)';
        applyOffset(destination);
      } else {
        applyOffset(destination);
      }
      const operation = animationSequence;
      if (changed && config.notify !== false && typeof options.onChange === 'function') options.onChange(index);
      if (!animate && !destroyed && operation === animationSequence) emitSettled();
      return index;
    }
    function suppressClick(completed) {
      if (!completed || completed.axis !== 'horizontal') return;
      suppressedClick = { until: now() + 450, pointerId: completed.id, x: completed.lastX, y: completed.lastY };
    }
    function cancelGesture(animate, suppress) {
      const completed = releaseGesture();
      if (suppress) suppressClick(completed);
      navigate(index, { animate: animate, notify: false });
    }
    function refresh() {
      if (destroyed) return;
      const wasBusy = !!gesture || !!animation;
      suppressClick(releaseGesture());
      contacts.clear();
      stopAnimation();
      measure();
      applyOffset(-index * width);
      if (wasBusy) emitSettled();
    }
    function excludedTarget(target) {
      if (!target || typeof target.closest !== 'function') return false;
      if (target.isContentEditable || target.closest('input,textarea,select,a,[contenteditable="true"],[role="slider"]')) return true;
      const interactive = target.closest('button,[role="button"]');
      const allowed = target.closest('.lyricLine,.lyricsPeek,.coverPage .art');
      return !!interactive && interactive !== allowed;
    }
    function pointerDown(event) {
      if (destroyed || (event.button !== undefined && event.button !== 0)) return;
      contacts.add(event.pointerId);
      if (contacts.size > 1 || event.isPrimary === false) {
        if (gesture) cancelGesture(false, true);
        return;
      }
      if (excludedTarget(event.target) || width <= 0) return;
      const current = stopAnimation();
      const time = now();
      gesture = { id: event.pointerId, axis: 'pending', startX: event.clientX, startY: event.clientY,
        lastX: event.clientX, lastY: event.clientY, startOffset: current, samples: [{ x: event.clientX, time: time }] };
    }
    function sample(event) {
      if (!gesture) return;
      if (finite(event.clientX)) gesture.lastX = event.clientX;
      if (finite(event.clientY)) gesture.lastY = event.clientY;
      const time = now();
      gesture.samples.push({ x: gesture.lastX, time: time });
      while (gesture.samples.length > 2 && time - gesture.samples[0].time > 100) gesture.samples.shift();
    }
    function pointerMove(event) {
      if (!gesture || gesture.id !== event.pointerId) return;
      sample(event);
      const dx = gesture.lastX - gesture.startX, dy = gesture.lastY - gesture.startY;
      if (gesture.axis === 'pending') {
        gesture.axis = decideAxis(dx, dy);
        if (gesture.axis === 'vertical') { cancelGesture(true, false); return; }
        if (gesture.axis === 'horizontal') {
          setSwiping(true);
          if (typeof element.setPointerCapture === 'function') {
            try { element.setPointerCapture(gesture.id); } catch (_) { cancelGesture(false, false); return; }
          }
        }
      }
      if (gesture && gesture.axis === 'horizontal') {
        event.preventDefault();
        applyOffset(rubberBand(gesture.startOffset + dx, width));
      }
    }
    function pointerUp(event) {
      contacts.delete(event.pointerId);
      if (!gesture || gesture.id !== event.pointerId) return;
      sample(event);
      const completed = releaseGesture();
      const first = completed.samples[0], last = completed.samples[completed.samples.length - 1];
      const elapsed = last.time - first.time;
      const velocity = elapsed >= 16 ? (last.x - first.x) / elapsed : 0;
      const decision = decideGesture({ index: index, width: width, deltaX: completed.lastX - completed.startX,
        velocityX: velocity, axis: completed.axis });
      suppressClick(completed);
      navigate(decision.index, { animate: true });
    }
    function pointerCancel(event) {
      contacts.delete(event.pointerId);
      if (gesture && gesture.id === event.pointerId) cancelGesture(true, true);
    }
    function keyDown(event) {
      if (options.keyboard === false || event.target !== element || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      navigate(index + (event.key === 'ArrowRight' ? 1 : -1), { animate: true });
    }

    element.style.touchAction = 'pan-y';
    track.style.willChange = 'transform';
    track.style.transition = 'none';
    if (previous.tabIndex === null && typeof element.setAttribute === 'function') element.setAttribute('tabindex', '0');
    measure(); applyOffset(-index * width); setSwiping(false);
    listen(element, 'pointerdown', pointerDown);
    // The artwork is a button for opening lyrics, but its image also needs to
    // remain a swipe surface. Cancel browser image/text dragging in that area.
    listen(element, 'dragstart', event => {
      if (event.target && typeof event.target.closest === 'function' &&
          event.target.closest('.coverPage .art') && !excludedTarget(event.target)) event.preventDefault();
    });
    listen(element, 'pointermove', pointerMove, { passive: false });
    listen(element, 'pointerup', pointerUp);
    listen(element, 'pointercancel', pointerCancel);
    listen(element, 'lostpointercapture', event => { if (gesture && gesture.id === event.pointerId) cancelGesture(true, true); });
    listen(root, 'pointerup', pointerUp);
    listen(root, 'pointercancel', pointerCancel);
    listen(element, 'keydown', keyDown);
    listen(element, 'click', event => {
      if (!suppressedClick || now() > suppressedClick.until || event.detail === 0) return;
      const nearRelease = !finite(event.clientX) || !finite(event.clientY) || Math.hypot(event.clientX - suppressedClick.x, event.clientY - suppressedClick.y) <= 28;
      if (event.pointerId !== suppressedClick.pointerId && !nearRelease) return;
      suppressedClick = null;
      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      else event.stopPropagation();
    }, true);
    listen(root, 'resize', refresh);
    listen(root, 'blur', refresh);
    listen(ownerDocument, 'visibilitychange', () => {
      if (ownerDocument.hidden || ownerDocument.visibilityState === 'hidden') refresh();
    });
    if (typeof root.ResizeObserver === 'function') {
      resizeObserver = new root.ResizeObserver(() => {
        const nextWidth = element.clientWidth > 0 ? element.clientWidth : element.getBoundingClientRect().width;
        if (Math.abs(nextWidth - width) > .5) refresh();
      });
      resizeObserver.observe(element);
    }
    if (media) {
      if (typeof media.addEventListener === 'function') listen(media, 'change', refresh);
      else if (typeof media.addListener === 'function') { media.addListener(refresh); listeners.push(() => media.removeListener(refresh)); }
    }
    return {
      goTo: navigate,
      getIndex: () => index,
      refresh: refresh,
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        releaseGesture(); contacts.clear(); stopAnimation(); applyOffset(-index * width);
        listeners.splice(0).forEach(remove => remove());
        if (resizeObserver) resizeObserver.disconnect();
        element.style.touchAction = previous.touchAction || '';
        track.style.transition = previous.transition || '';
        track.style.willChange = previous.willChange || '';
        if (previous.tabIndex === null && typeof element.removeAttribute === 'function') element.removeAttribute('tabindex');
        if (element.dataset) {
          if (previous.swiping === undefined) delete element.dataset.swiping;
          else element.dataset.swiping = previous.swiping;
        }
        suppressedClick = null;
      }
    };
  }

  root.MAUPlayerMotion = { mount: mount, decideAxis: decideAxis, decideGesture: decideGesture, rubberBand: rubberBand };
})(typeof window !== 'undefined' ? window : globalThis);
