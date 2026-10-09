# MusicAroundU 最终交付包

## 快速运行

推荐在当前文件夹执行：

```sh
python3 preview.py
```

然后打开：

```text
http://127.0.0.1:8765/
```

启动器会自动进入 `MusicAroundU.html`。按 `Ctrl+C` 停止本地服务。

也可以直接双击 `MusicAroundU.html`。静态截图地图不需要网络或 API Key；若启用 Google 在线地图，建议使用本地 HTTP 地址运行。

## 建议体验路径

1. 点击首页的 MusicAroundU 卡片。
2. 使用模拟定位或手动选择城市。
3. 在地图中打开城市歌单并播放歌曲。
4. 点击地图迷你播放器的封面或歌名，进入完整播放器。
5. 点击歌词预览或向左滑动查看歌词。
6. 在歌词页切换城市，确认仍停留在歌词页面。
7. 点击右上角退出入口，选择继续或暂停并回到首页。

每次重新加载 HTML 都会重置为首次进入状态，方便重新演示完整闭环。同一页面未刷新期间，城市、曲目、进度和播放状态会在各页面间同步。

## 可选 Google 地图

默认四城均使用本地静态地图。若要启用 Google Maps JavaScript API，请在 `maps-config.js` 中填入受 API 与 HTTP 来源限制的浏览器 Key：

```js
window.MAU_MAPS_CONFIG = {
  apiKey: 'YOUR_BROWSER_RESTRICTED_KEY',
  language: 'zh-CN',
  region: 'CN'
};
```

不要在该文件中填写服务端密钥。未配置或在线地图加载失败时，页面会继续使用本地静态地图。

## 最终文件结构

```text
MusicAroundU/
├── index.html            # GitHub Pages 入口
├── MusicAroundU.html
├── MusicAroundU_PRD_Final.md
├── README.md
├── preview.py
├── maps-config.js
├── ui/                  # HTML 运行依赖
└── 备用/                # 历史文档、测试、工具、参考图和源素材
```

`ui/` 中保留当前 HTML 实际加载的样式、脚本、专辑封面、地图、唱臂和昼夜地标素材。不要单独移动或删除这些运行文件。

最终产品需求见 [MusicAroundU_PRD_Final.md](MusicAroundU_PRD_Final.md)。归档内容见 [备用/归档清单.md](备用/归档清单.md)。

## 演示边界

- 定位为模拟，不读取真实 GPS。
- 播放为计时演示，不输出真实歌曲音频。
- 歌词为原创城市概念文案，不是歌曲原词。
- 静态地图外围为视觉延展，不提供导航精度。
- 四城歌曲为场景与文化推荐，不代表热播排名。
