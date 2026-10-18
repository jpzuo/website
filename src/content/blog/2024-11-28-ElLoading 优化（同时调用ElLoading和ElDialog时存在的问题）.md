---
title: "ElLoading 优化（同时调用ElLoading和ElDialog时存在的问题）"
description: "发现项目中有同时使用 ElLoading 和 ElDialog 的情况，发现视觉上会出现一些问题，ElDialog 会出现再 ElLoading 上方，导致页面展示逻辑混乱，因此我对 ElLoading 进行了一些优化。 我将通过 ElLoading.service() 生成的..."
pubDate: 2024-11-28
category: "前端"
tags:
  - "Element Plus"
featured: false
draft: false
---

发现项目中有同时使用 ElLoading 和 ElDialog 的情况，发现视觉上会出现一些问题，ElDialog 会出现再 ElLoading 上方，导致页面展示逻辑混乱，因此我对 ElLoading 进行了一些优化。
我将通过 ElLoading.service() 生成的 DOM 拷贝到 index.html 中，然后通过 hook 的方式动态控制对应 DOM 的显示和隐藏，这样就可以避免视觉上的问题。

### HTML 代码

```html
// 下方是伪代码，具体需要使用 ElLoading.service 并指定 target 后将插入到页面中的
DOM 拷贝到 index.html 中
<div id="fullscreenloading">
  <div>
    <svg>loading图标</svg>
    <p id="fullscreenloading_text">存放loading下方的内容</p>
  </div>
</div>
```

### CSS 代码

```css
#fullscreenloading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  display: none;
}
// 其他样式使用ElLoadig自带的，不需要修改
```

### JavaScript 代码

然后自定义 hook 写法如下：

```js
export const useLoading = () => {
  const fullscreenloadingDom = document.getElementById("fullscreenloading");
  const fullscreenloadingTextDom = document.getElementById("fullscreenloading_text");
  const showLoading = ({text: ''}) => {
    fullscreenloadingDom.style.display = "block";
    fullscreenloadingDom.innerHtml = "";
  };
  const hideLoading = () => {
    fullscreenloadingDom.style.display = "none";
    fullscreenloadingDom.innerHtml = "";
  };
  return { showLoading, hideLoading };
}
```
