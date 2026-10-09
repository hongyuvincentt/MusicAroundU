/* Verified song-release covers. Source metadata: assets/albums/sources.json.
 * Colors are deterministically extracted from each downloaded image, then
 * used for a softly colored top fading to warm white, with readable dark text.
 */
(function (root) {
  'use strict';
  const entries = [
  {
    "trackId": "demo-seaside",
    "provider": "网易云音乐",
    "providerTrackId": 1413863166,
    "album": "想去海边",
    "matchedTitle": "想去海边",
    "matchedArtist": "夏日入侵企画",
    "sourceUrl": "https://music.163.com/song?id=1413863166",
    "artworkUrl": "https://p2.music.126.net/sLWN-iePq4ESOMPER0IWgQ==/109951164602081973.jpg?param=600y600",
    "releaseDate": "2020-01-05",
    "localPath": "ui/assets/albums/demo-seaside.jpg",
    "metadataUrl": "https://music.163.com/api/song/detail?ids=%5B1413863166%5D",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#badae6",
      "mid": "#e6eff2",
      "base": "#fbfaf7",
      "ink": "#1d2e34",
      "muted": "#465e67",
      "accent": "#24647d",
      "record": "#7dbed6",
      "dominant": "#7acdec",
      "palette": [
        "#7acdec",
        "#f7f4f7",
        "#3e5789",
        "#ab80af",
        "#6999b7"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-boundless",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1722083721,
    "album": "樂與怒",
    "matchedTitle": "海闊天空",
    "matchedArtist": "Beyond",
    "sourceUrl": "https://music.apple.com/hk/album/%E6%B5%B7%E9%97%8A%E5%A4%A9%E7%A9%BA/1722083311?i=1722083721&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e5/82/34/e58234b6-e653-3c70-918b-c3056b36ec34/4710149707673_cover.jpg/600x600bb.jpg",
    "releaseDate": "1993-09-10T12:00:00Z",
    "localPath": "ui/assets/albums/demo-boundless.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E6%B5%B7%E9%98%94%E5%A4%A9%E7%A9%BA+Beyond&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#e1bfc1",
      "mid": "#f1e7e8",
      "base": "#fbfaf7",
      "ink": "#341d1f",
      "muted": "#674648",
      "accent": "#752c30",
      "record": "#cd878b",
      "dominant": "#99282f",
      "palette": [
        "#ffffff",
        "#050508",
        "#7c6473",
        "#07070b",
        "#010102"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-ocean",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 202968168,
    "album": "大海",
    "matchedTitle": "大海",
    "matchedArtist": "張雨生",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%A4%A7%E6%B5%B7/202968029?i=202968168&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music/bb/cd/8d/mzi.wnkiqjca.jpg/600x600bb.jpg",
    "releaseDate": "1992-11-28T08:00:00Z",
    "localPath": "ui/assets/albums/demo-ocean.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%A4%A7%E6%B5%B7+%E5%BC%A0%E9%9B%A8%E7%94%9F&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#e1d3bf",
      "mid": "#f1ede7",
      "base": "#fbfaf7",
      "ink": "#342b1d",
      "muted": "#675946",
      "accent": "#75572c",
      "record": "#cdb087",
      "dominant": "#d19b4f",
      "palette": [
        "#d19b4f",
        "#c68947",
        "#bc8044",
        "#091218",
        "#af7240"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-summer-rinse",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1476345420,
    "album": "浪潮上岸",
    "matchedTitle": "夏日漱石",
    "matchedArtist": "橘子海",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%A4%8F%E6%97%A5%E6%BC%B1%E7%9F%B3/1476345419?i=1476345420&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/92/97/c7/9297c7a4-db35-bb56-7686-90d98c72504d/6971928844738.jpg/600x600bb.jpg",
    "releaseDate": "2019-04-22T12:00:00Z",
    "localPath": "ui/assets/albums/demo-summer-rinse.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%A4%8F%E6%97%A5%E6%BC%B1%E7%9F%B3+%E6%A9%98%E5%AD%90%E6%B5%B7&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#bec3e2",
      "mid": "#e7e8f1",
      "base": "#fbfaf7",
      "ink": "#1d2134",
      "muted": "#464b67",
      "accent": "#2a3577",
      "record": "#858fce",
      "dominant": "#1d2a79",
      "palette": [
        "#1d2a79",
        "#1d193a",
        "#1e2a76",
        "#1c2c7a",
        "#1e183a"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-gulangyu-wave-yin",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1644391359,
    "album": "鍾立民歌曲作品集-鼓浪嶼之波",
    "matchedTitle": "鼓浪嶼之波",
    "matchedArtist": "殷秀梅",
    "sourceUrl": "https://music.apple.com/hk/album/%E9%BC%93%E6%B5%AA%E5%B6%BC%E4%B9%8B%E6%B3%A2/1644391116?i=1644391359&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c1/99/e1/c199e122-e671-4801-eb22-add4e0af74b3/cover.jpg/600x600bb.jpg",
    "releaseDate": "2000-01-01T12:00:00Z",
    "localPath": "ui/assets/albums/demo-gulangyu-wave-yin.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E9%BC%93%E6%B5%AA%E5%B1%BF%E4%B9%8B%E6%B3%A2+%E6%AE%B7%E7%A7%80%E6%A2%85&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#bddde3",
      "mid": "#e7eff1",
      "base": "#fbfaf7",
      "ink": "#1d3134",
      "muted": "#466267",
      "accent": "#286d79",
      "record": "#83c5d0",
      "dominant": "#d5f1f6",
      "palette": [
        "#d5f1f6",
        "#1f282e",
        "#bdb0a7",
        "#22424e",
        "#161f24"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-brightest-star",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1542187391,
    "album": "世界",
    "matchedTitle": "夜空中最亮的星",
    "matchedArtist": "逃跑計劃",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%A4%9C%E7%A9%BA%E4%B8%AD%E6%9C%80%E4%BA%AE%E7%9A%84%E6%98%9F/1542187294?i=1542187391&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/dc/85/ab/dc85ab94-26c9-5f50-3c89-d9a95b22ca1c/2910029.jpg/600x600bb.jpg",
    "releaseDate": "2012-01-01T12:00:00Z",
    "localPath": "ui/assets/albums/demo-brightest-star.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%A4%9C%E7%A9%BA%E4%B8%AD%E6%9C%80%E4%BA%AE%E7%9A%84%E6%98%9F+%E9%80%83%E8%B7%91%E8%AE%A1%E5%88%92&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#c1c4df",
      "mid": "#e8e9f0",
      "base": "#fbfaf7",
      "ink": "#1e2033",
      "muted": "#464967",
      "accent": "#313770",
      "record": "#878ecc",
      "dominant": "#a1a7e0",
      "palette": [
        "#ffffff",
        "#a1a7e0",
        "#616594",
        "#636389",
        "#979ed6"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-ideal",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1756890132,
    "album": "濃煙下的詩歌電台",
    "matchedTitle": "理想三旬",
    "matchedArtist": "陳鴻宇",
    "sourceUrl": "https://music.apple.com/hk/album/%E7%90%86%E6%83%B3%E4%B8%89%E6%97%AC/1756890122?i=1756890132&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/32/f9/ef/32f9ef49-d207-05a7-c755-2eecf8c006ef/cover.jpg/600x600bb.jpg",
    "releaseDate": "2016-01-03T12:00:00Z",
    "localPath": "ui/assets/albums/demo-ideal.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E7%90%86%E6%83%B3%E4%B8%89%E6%97%AC+%E9%99%88%E9%B8%BF%E5%AE%87&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#d6d8c7",
      "mid": "#edeeea",
      "base": "#fbfaf7",
      "ink": "#2d2f23",
      "muted": "#5a5e45",
      "accent": "#5d633e",
      "record": "#c0cc87",
      "dominant": "#d6dbbd",
      "palette": [
        "#e5e5e4",
        "#d6dbbd",
        "#cdd1b6",
        "#e0e0de",
        "#e2e5d0"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-blue-lotus",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 905191009,
    "album": "時光·漫步",
    "matchedTitle": "藍蓮花",
    "matchedArtist": "許巍",
    "sourceUrl": "https://music.apple.com/hk/album/%E8%97%8D%E8%93%AE%E8%8A%B1/905191001?i=905191009&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music69/v4/3a/88/3a/3a883ac8-0e9c-b892-9f6d-d56f8781b53d/dj.jyjfitio.jpg/600x600bb.jpg",
    "releaseDate": "2002-12-18T08:00:00Z",
    "localPath": "ui/assets/albums/demo-blue-lotus.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E8%93%9D%E8%8E%B2%E8%8A%B1+%E8%AE%B8%E5%B7%8D&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#cbcbd4",
      "mid": "#ebebed",
      "base": "#fbfaf7",
      "ink": "#26262c",
      "muted": "#50505e",
      "accent": "#47475a",
      "record": "#8787cc",
      "dominant": "#17171c",
      "palette": [
        "#f7f6fa",
        "#100f15",
        "#17171c",
        "#0c0b0f",
        "#25262b"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-glorious-years",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1443905206,
    "album": "命運派對",
    "matchedTitle": "光輝歲月",
    "matchedArtist": "Beyond",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%85%89%E8%BC%9D%E6%AD%B2%E6%9C%88/1443905184?i=1443905206&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/68/88/e8/6888e881-8be2-afef-e227-1c12676940bc/00602488995191.rgb.jpg/600x600bb.jpg",
    "releaseDate": "1990-09-01T12:00:00Z",
    "localPath": "ui/assets/albums/demo-glorious-years.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%85%89%E8%BE%89%E5%B2%81%E6%9C%88+Beyond&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#cbd4d4",
      "mid": "#ebeded",
      "base": "#fbfaf7",
      "ink": "#262c2c",
      "muted": "#4d5b5b",
      "accent": "#475a5a",
      "record": "#87cccc",
      "dominant": "#2b3939",
      "palette": [
        "#5c6160",
        "#424c4b",
        "#4c5554",
        "#2b3939",
        "#969393"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-guangdong-love",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1694833249,
    "album": "廣東愛情故事 - EP",
    "matchedTitle": "廣東愛情故事",
    "matchedArtist": "廣東雨神",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%BB%A3%E6%9D%B1%E6%84%9B%E6%83%85%E6%95%85%E4%BA%8B/1694832967?i=1694833249&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/66/53/e4/6653e450-71bd-8de5-f621-7ed068b6fdff/cover.jpg/600x600bb.jpg",
    "releaseDate": "2008-01-01T12:00:00Z",
    "localPath": "ui/assets/albums/demo-guangdong-love.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%B9%BF%E4%B8%9C%E7%88%B1%E6%83%85%E6%95%85%E4%BA%8B+%E5%B9%BF%E4%B8%9C%E9%9B%A8%E7%A5%9E&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#dacfc6",
      "mid": "#efece9",
      "base": "#fbfaf7",
      "ink": "#302822",
      "muted": "#665548",
      "accent": "#654e3b",
      "record": "#cca687",
      "dominant": "#c7a88f",
      "palette": [
        "#3b523a",
        "#c7a88f",
        "#757f8b",
        "#1b261e",
        "#283c29"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-thousand-songs",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1443008646,
    "album": "永遠是你的朋友",
    "matchedTitle": "千千闋歌",
    "matchedArtist": "陳慧嫻",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%8D%83%E5%8D%83%E9%97%8B%E6%AD%8C/1443008630?i=1443008646&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/62/4d/51/624d51d3-3336-c246-3d50-22bf9e86bb25/00602488888844.rgb.jpg/600x600bb.jpg",
    "releaseDate": "1989-01-01T12:00:00Z",
    "localPath": "ui/assets/albums/demo-thousand-songs.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%8D%83%E5%8D%83%E9%98%99%E6%AD%8C+%E9%99%88%E6%85%A7%E5%A8%B4&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#e7e1b9",
      "mid": "#f2f1e6",
      "base": "#fbfaf7",
      "ink": "#34321d",
      "muted": "#676346",
      "accent": "#7d7224",
      "record": "#d8cd7b",
      "dominant": "#f9f4cf",
      "palette": [
        "#aa7351",
        "#fbf7e7",
        "#633d33",
        "#9c5e49",
        "#f9f4cf"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-memory-guangzhou",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1497522822,
    "album": "阿細 - EP",
    "matchedTitle": "回憶廣州",
    "matchedArtist": "阿細",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%9B%9E%E6%86%B6%E5%BB%A3%E5%B7%9E/1497522696?i=1497522822&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f8/9a/2c/f89a2c77-7273-1375-fd00-7dd872451aee/cover.jpg/600x600bb.jpg",
    "releaseDate": "2018-12-11T12:00:00Z",
    "localPath": "ui/assets/albums/demo-memory-guangzhou.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%9B%9E%E5%BF%86%E5%B9%BF%E5%B7%9E+%E9%98%BF%E7%BB%86&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#c4d4db",
      "mid": "#e9edef",
      "base": "#fbfaf7",
      "ink": "#212c31",
      "muted": "#465c67",
      "accent": "#385869",
      "record": "#87b5cc",
      "dominant": "#c4dae5",
      "palette": [
        "#dadada",
        "#f4f4f5",
        "#c4dae5",
        "#d2d2d2",
        "#dfdfdf"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-guangzhou-flavour",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1804782009,
    "album": "广州味道 - Single",
    "matchedTitle": "广州味道",
    "matchedArtist": "阿細",
    "sourceUrl": "https://music.apple.com/hk/album/%E5%B9%BF%E5%B7%9E%E5%91%B3%E9%81%93/1804782008?i=1804782009&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/21/3d/4d/213d4da4-6472-5c9a-4667-1c36353732e5/cover.jpg/600x600bb.jpg",
    "releaseDate": "2019-05-20T12:00:00Z",
    "localPath": "ui/assets/albums/demo-guangzhou-flavour.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=%E5%B9%BF%E5%B7%9E%E5%91%B3%E9%81%93+%E9%98%BF%E7%BB%86&entity=song&limit=35&country=hk",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#cbced4",
      "mid": "#ebebed",
      "base": "#fbfaf7",
      "ink": "#26272c",
      "muted": "#50545e",
      "accent": "#474c5a",
      "record": "#879bcc",
      "dominant": "#d4d6db",
      "palette": [
        "#d4d6db",
        "#5b6c73",
        "#c2c4c8",
        "#424d51",
        "#37464d"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-california-remix",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1724853742,
    "album": "California (feat. Jackson Wang & Warren Hue) [Remix] - Single",
    "matchedTitle": "California (feat. Jackson Wang & Warren Hue) [Remix]",
    "matchedArtist": "88rising, Rich Brian & NIKI",
    "sourceUrl": "https://music.apple.com/us/album/california-feat-jackson-wang-warren-hue-remix/1724853739?i=1724853742&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9c/f9/c2/9cf9c2b5-6ea8-0db3-c036-d37fe2aceb15/190296604836.jpg/600x600bb.jpg",
    "releaseDate": "2021-07-15T07:00:00Z",
    "localPath": "ui/assets/albums/demo-california-remix.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=California+%28Remix%29+88rising+Rich+Brian+NIKI&entity=song&limit=35&country=us",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#bfd9e1",
      "mid": "#e7eef0",
      "base": "#fbfaf7",
      "ink": "#1d2f34",
      "muted": "#466067",
      "accent": "#2c6474",
      "record": "#87bdcc",
      "dominant": "#0a1f25",
      "palette": [
        "#0a1f25",
        "#0c4a59",
        "#062933",
        "#e0d0be",
        "#165f6d"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-california-dreamin",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1440796325,
    "album": "If You Can Believe Your Eyes and Ears",
    "matchedTitle": "California Dreamin' (Single)",
    "matchedArtist": "The Mamas & The Papas",
    "sourceUrl": "https://music.apple.com/us/album/california-dreamin-single/1440795791?i=1440796325&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/19/39/88/193988e9-02c3-b879-5881-2d31c9774bbf/06UMGIM04100.rgb.jpg/600x600bb.jpg",
    "releaseDate": "1966-02-28T08:00:00Z",
    "localPath": "ui/assets/albums/demo-california-dreamin.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=California+Dreamin%27+The+Mamas+%26+the+Papas&entity=song&limit=35&country=us",
    "status": "verified",
    "width": 597,
    "height": 600,
    "theme": {
      "top": "#e7d0b8",
      "mid": "#f2ece6",
      "base": "#fbfaf7",
      "ink": "#34291d",
      "muted": "#675746",
      "accent": "#7d5124",
      "record": "#d9ab7a",
      "dominant": "#efb170",
      "palette": [
        "#674a45",
        "#e6d2cd",
        "#cf7d56",
        "#efb170",
        "#d79865"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-california-phantom",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 169731532,
    "album": "The Guest (Expanded Edition)",
    "matchedTitle": "California (Tchad Blake Mix)",
    "matchedArtist": "Phantom Planet",
    "sourceUrl": "https://music.apple.com/us/album/california-tchad-blake-mix/169731518?i=169731532&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6a/5c/70/6a5c7060-f7eb-e6bb-9944-58616477dde5/074646206621.jpg/600x600bb.jpg",
    "releaseDate": "2002-01-01T12:00:00Z",
    "localPath": "ui/assets/albums/demo-california-phantom.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=California+Phantom+Planet&entity=song&limit=35&country=us",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#d4d0cb",
      "mid": "#edeceb",
      "base": "#fbfaf7",
      "ink": "#2c2926",
      "muted": "#5e5750",
      "accent": "#5a5047",
      "record": "#ccaa87",
      "dominant": "#b3aba3",
      "palette": [
        "#f2f1f1",
        "#b3aba3",
        "#544f4e",
        "#ebeae8",
        "#2d2929"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-city-of-stars-duet",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 1440864172,
    "album": "La La Land (Original Motion Picture Soundtrack)",
    "matchedTitle": "City of Stars",
    "matchedArtist": "Ryan Gosling & Emma Stone",
    "sourceUrl": "https://music.apple.com/us/album/city-of-stars/1440863506?i=1440864172&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/bb/47/a3/bb47a36e-57b8-9260-f9a4-d09851145c45/00602557100556.rgb.jpg/600x600bb.jpg",
    "releaseDate": "2016-12-09T12:00:00Z",
    "localPath": "ui/assets/albums/demo-city-of-stars-duet.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=City+of+Stars+Ryan+Gosling+Emma+Stone&entity=song&limit=35&country=us",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#b8bbe8",
      "mid": "#e5e6f2",
      "base": "#fbfaf7",
      "ink": "#1d1f34",
      "muted": "#464867",
      "accent": "#242a7d",
      "record": "#7279e1",
      "dominant": "#010541",
      "palette": [
        "#010541",
        "#171062",
        "#020420",
        "#4225a7",
        "#5c2ec1"
      ]
    },
    "checkedAt": "2026-10-09"
  },
  {
    "trackId": "demo-california-gurls",
    "provider": "Apple Music / iTunes",
    "providerTrackId": 716084168,
    "album": "Teenage Dream: The Complete Confection",
    "matchedTitle": "California Gurls (feat. Snoop Dogg)",
    "matchedArtist": "Katy Perry",
    "sourceUrl": "https://music.apple.com/us/album/california-gurls-feat-snoop-dogg/716083729?i=716084168&uo=4",
    "artworkUrl": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/91/a7/65/91a76509-7cc2-2a2e-337b-5fc41f4d9fc4/13UABIM58340.rgb.jpg/600x600bb.jpg",
    "releaseDate": "2010-05-07T07:00:00Z",
    "localPath": "ui/assets/albums/demo-california-gurls.jpg",
    "metadataUrl": "https://itunes.apple.com/search?term=California+Gurls+%28feat.+Snoop+Dogg%29+Katy+Perry&entity=song&limit=35&country=us",
    "status": "verified",
    "width": 600,
    "height": 600,
    "theme": {
      "top": "#e4c7bc",
      "mid": "#f1eae6",
      "base": "#fbfaf7",
      "ink": "#34241d",
      "muted": "#675046",
      "accent": "#7b3e26",
      "record": "#d29881",
      "dominant": "#e79f82",
      "palette": [
        "#ffffff",
        "#231010",
        "#e79f82",
        "#f1c4b3",
        "#7c9fc5"
      ]
    },
    "checkedAt": "2026-10-09"
  }
];
  const byId = new Map();
  for (const entry of entries) {
    Object.freeze(entry.theme.palette);
    Object.freeze(entry.theme);
    Object.freeze(entry);
    if (byId.has(entry.trackId)) throw new Error('Duplicate artwork: ' + entry.trackId);
    byId.set(entry.trackId, entry);
  }
  Object.freeze(entries);
  root.MAUTrackArtwork = Object.freeze({
    get(trackId) { return byId.get(trackId) || null; },
    all() { return entries; }
  });
})(typeof window !== 'undefined' ? window : globalThis);
