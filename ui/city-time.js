/* City coordinates, local clocks and a solar-position-based map theme. No network required. */
(function (root) {
  'use strict';

  const DEG = Math.PI / 180;
  const DAY_MS = 86400000;
  const cities = {
    xiamen: {
      name: '厦门', timeZone: 'Asia/Shanghai',
      center: { lat: 24.4531, lng: 118.0748 }, zoom: 13,
      landmarks: [
        { id: 'gulangyu', name: '鼓浪屿', position: { lat: 24.4478, lng: 118.0686 }, kind: 'island' },
        { id: 'sunlight-rock', name: '日光岩', position: { lat: 24.4453, lng: 118.0636 }, kind: 'landmark' }
      ]
    },
    shenzhen: {
      name: '深圳', timeZone: 'Asia/Shanghai',
      center: { lat: 22.5260, lng: 113.9950 }, zoom: 12,
      landmarks: [
        { id: 'shenzhen-bay', name: '深圳湾公园', position: { lat: 22.5123, lng: 113.9580 }, kind: 'waterfront' },
        { id: 'ping-an', name: '平安金融中心', position: { lat: 22.5364, lng: 114.0505 }, kind: 'tower' }
      ]
    },
    guangzhou: {
      name: '广州', timeZone: 'Asia/Shanghai',
      center: { lat: 23.1135, lng: 113.3230 }, zoom: 14,
      landmarks: [
        { id: 'canton-tower', name: '广州塔', position: { lat: 23.1090, lng: 113.3196 }, kind: 'tower' },
        { id: 'huacheng-square', name: '花城广场', position: { lat: 23.1193, lng: 113.3247 }, kind: 'landmark' }
      ]
    },
    losangeles: {
      name: '洛杉矶', timeZone: 'America/Los_Angeles',
      // The city radio opens on its featured waterfront; the map remains freely pannable.
      center: { lat: 34.0126, lng: -118.4950 }, zoom: 14,
      landmarks: [
        { id: 'santa-monica-pier', name: 'Santa Monica Pier', position: { lat: 34.0095, lng: -118.4975 }, kind: 'pier' },
        { id: 'pacific-wheel', name: 'Pacific Park 摩天轮', position: { lat: 34.0085, lng: -118.4988 }, kind: 'wheel' }
      ]
    }
  };

  const formatters = new Map();

  function requireDate(value) {
    const date = value === undefined ? new Date() : new Date(value);
    if (!Number.isFinite(date.getTime())) throw new TypeError('Invalid city clock date');
    return date;
  }

  function validateCoordinates(lat, lng) {
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) {
      throw new RangeError('Coordinates must use latitude [-90, 90] and longitude [-180, 180]');
    }
  }

  function getCity(cityKey) {
    if (!Object.prototype.hasOwnProperty.call(cities, cityKey)) {
      throw new RangeError('Unknown city: ' + cityKey);
    }
    return cities[cityKey];
  }

  // Allows deployment-specific map framing or additional city metadata without editing the clock logic.
  function configureCity(cityKey, overrides) {
    if (typeof cityKey !== 'string' || !cityKey || ['__proto__', 'prototype', 'constructor'].includes(cityKey)) {
      throw new TypeError('A valid city key is required');
    }
    const previous = Object.prototype.hasOwnProperty.call(cities, cityKey) ? cities[cityKey] : {};
    const next = Object.assign({}, previous, overrides, {
      center: Object.assign({}, previous.center, overrides && overrides.center)
    });
    validateCoordinates(next.center.lat, next.center.lng);
    // Intl validates the IANA zone and handles daylight saving changes automatically.
    new Intl.DateTimeFormat('en-GB', { timeZone: next.timeZone }).format(new Date());
    if (!next.timeZone) throw new TypeError('An IANA time zone is required');
    if (!Array.isArray(next.landmarks)) next.landmarks = [];
    next.landmarks.forEach(function (landmark) {
      if (!landmark.position) throw new TypeError('A landmark position is required');
      validateCoordinates(landmark.position.lat, landmark.position.lng);
    });
    cities[cityKey] = next;
    return next;
  }

  function normalizeDegrees(angle) { return ((angle % 360) + 360) % 360; }

  /**
   * Geometric solar elevation in degrees, from the NOAA solar-position equations.
   * Julian centuries -> apparent solar longitude/obliquity -> declination and
   * equation of time -> local hour angle. Longitude is positive eastward.
   * This is an astronomical approximation, not weather or terrain visibility.
   * Atmospheric refraction is omitted: 0° is the geometric horizon, -6° is
   * civil twilight. Using elevation adapts the theme to season and latitude.
   */
  function solarElevation(lat, lng, value) {
    validateCoordinates(lat, lng);
    const date = requireDate(value);
    const julianDate = date.getTime() / DAY_MS + 2440587.5;
    const t = (julianDate - 2451545.0) / 36525;
    const longitude = normalizeDegrees(280.46646 + t * (36000.76983 + t * 0.0003032));
    const anomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    const equationOfCenter = Math.sin(anomaly * DEG) * (1.914602 - t * (0.004817 + 0.000014 * t))
      + Math.sin(2 * anomaly * DEG) * (0.019993 - 0.000101 * t)
      + Math.sin(3 * anomaly * DEG) * 0.000289;
    const omega = 125.04 - 1934.136 * t;
    const apparentLongitude = longitude + equationOfCenter - 0.00569 - 0.00478 * Math.sin(omega * DEG);
    const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
    const obliquity = meanObliquity + 0.00256 * Math.cos(omega * DEG);
    const declination = Math.asin(Math.sin(obliquity * DEG) * Math.sin(apparentLongitude * DEG));
    const y = Math.pow(Math.tan(obliquity * DEG / 2), 2);
    const equationOfTime = 4 / DEG * (
      y * Math.sin(2 * longitude * DEG)
      - 2 * eccentricity * Math.sin(anomaly * DEG)
      + 4 * eccentricity * y * Math.sin(anomaly * DEG) * Math.cos(2 * longitude * DEG)
      - 0.5 * y * y * Math.sin(4 * longitude * DEG)
      - 1.25 * eccentricity * eccentricity * Math.sin(2 * anomaly * DEG)
    );
    const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes()
      + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000;
    const solarMinutes = ((utcMinutes + equationOfTime + 4 * lng) % 1440 + 1440) % 1440;
    const hourAngle = (solarMinutes / 4 - 180) * DEG;
    const sinElevation = Math.sin(lat * DEG) * Math.sin(declination)
      + Math.cos(lat * DEG) * Math.cos(declination) * Math.cos(hourAngle);
    return Math.asin(Math.max(-1, Math.min(1, sinElevation))) / DEG;
  }

  function getCityClock(cityKey, value) {
    const city = getCity(cityKey);
    const date = requireDate(value);
    let formatter = formatters.get(city.timeZone);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: city.timeZone, hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
      });
      formatters.set(city.timeZone, formatter);
    }
    const parts = {};
    formatter.formatToParts(date).forEach(function (part) { parts[part.type] = part.value; });
    const altitude = solarElevation(city.center.lat, city.center.lng, date);
    const phase = altitude >= 0 ? 'day' : altitude >= -6 ? 'twilight' : 'night';
    let label = phase === 'day' ? '白天' : '夜晚';
    if (phase === 'twilight') {
      const nextAltitude = solarElevation(city.center.lat, city.center.lng, date.getTime() + 60000);
      label = nextAltitude >= altitude ? '晨光' : '暮色';
    }
    const localAsUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    return {
      cityKey: cityKey,
      name: city.name,
      time: parts.hour + ':' + parts.minute,
      localDate: parts.year + '-' + parts.month + '-' + parts.day,
      timeZone: city.timeZone,
      timeZoneLabel: parts.timeZoneName,
      utcOffsetMinutes: Math.round((localAsUtc - date.getTime()) / 60000),
      phase: phase,
      label: label,
      sunAltitude: altitude
    };
  }

  root.MAUCityTime = { cities: cities, getCity: getCity, configureCity: configureCity,
    getCityClock: getCityClock, solarElevation: solarElevation };
})(typeof window !== 'undefined' ? window : globalThis);
