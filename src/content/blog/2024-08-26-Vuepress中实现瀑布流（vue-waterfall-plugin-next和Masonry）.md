---
title: "Vuepress中实现瀑布流（vue-waterfall-plugin-next和Masonry）"
description: "使用 Masonry 和 vuewaterfallpluginnext 实现瀑布流，开发环节效果很顺利，但是进入打包部署环节就开始报错了，使用 Masonry 打包报错 ReferenceError: window is not defined，使用 vuewaterfallpl..."
pubDate: 2024-08-26
category: "前端"
tags:
  - "Vue"
featured: false
draft: false
---

### 遇到的坑

使用 Masonry 和 vue-waterfall-plugin-next 实现瀑布流，开发环节效果很顺利，但是进入打包部署环节就开始报错了，使用 Masonry 打包报错 `ReferenceError: window is not defined`，使用 vue-waterfall-plugin-next 打包报错 `ReferenceError: document is not defined`。

### 解决方案

采用动态引入依赖的方式，即在 onMounted 中引入依赖，是因为这时候 window 和 document 已经存在了。

#### 使用 Masonry 时的写法：
不建议使用 Masonry，不知道为什么它的参数都不生效，并且渲染效果不如 vue-waterfall-plugin-next。
```vue
<script setup>
import { onMounted, ref } from 'vue'
import imagesLoaded from 'imagesloaded'
defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const loading = ref(true)

onMounted(() => {
  const masonryWrapper = document.querySelector('#daily-wrapper')
  const imgLoad = imagesLoaded(masonryWrapper)
  imgLoad.on('always', function () {
    import('masonry-layout').then(res => {
      const Masonry = res.default
      new Masonry(masonryWrapper, {  
        itemSelector: '.daily',
      })
    })
    loading.value = false
  })
})
</script>

<template>
  <div id="daily-wrapper" class="daily-wrapper" :class="{'daily-wrapper-loading': loading}" ref="dailyMasonry">
    <div v-if="!items.length">暂无数据哦～</div>

    <article
      v-for="(info, index) in items"
      :key="index"
      class="daily"
    >
      <img draggable="false" class="cover" :src="info.pics" alt="封面图" />
      <header class="title">
        {{ info.text }}
      </header>
    </article>
  </div>
</template>
```

#### 使用 vue-waterfall-plugin-next 时的写法：

```vue
<script setup>
import { onMounted, ref } from 'vue'
import 'vue-waterfall-plugin-next/dist/style.css'
let LazyImg = null
let Waterfall = null
let loading = ref(true)
defineProps({
  items: {
    type: Array,
    required: true,
  },
})

onMounted(() => {
  import('vue-waterfall-plugin-next').then(res => {
    LazyImg = res.LazyImg
    Waterfall = res.Waterfall
    loading.value = false
  })
})
</script>

<template>
  <Waterfall 
    v-if="loading === false"
    id="daily-wrapper" 
    class="daily-wrapper" 
    :list="items" 
  >
      <template #item="{ item, url, index }">
        <div class="daily">
          <LazyImg class="cover" :url="item.pics" />
          <div class="title">
            {{ item.text }}
          </div>
        </div>
      </template>
    </Waterfall>
</template>
```
