---
title: "webpack常用Loader示例"
description: "webpack常用Loader示例"
pubDate: 2024-08-01
category: "代码箱"
tags:
  - "代码片段"
featured: false
draft: false
---

## vue-loader
```js
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
};
```

## ts-loader
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/], // 如果是vue项目需要设置
        },
      },
    ]
  },
};
```

## string-replace-loader（构建前将文件进行重写）
```js
module.exports = {
  module: {
    rules: [
      {
        test: /index.js$/i,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: 'import.meta.globEager',
            replace: '[] //',
            flags: 'g'
          }
        }
      },
    ]
  },
};
```

## style-loader、css-loader、sass-loader
```js
module.exports = {
  module: {
    rules: [
      {
        test: /.scss$/,
        use: {
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false // 资源解析失败不报错
            }
          },
          {
            loader: 'sass-loader',
            options: {
              additionalData: ` // 会给每个文件都加入字符串中的内容
                @use "@/styles/global.scss";
                $--color-primary: #409EFF;
              `
            }
          }
        }
      },
    ]
  },
};
```

## svg-sprite-loader
```js
module.exports = {
  module: {
    rules: [
      {
        test: /.svg$/,
        loader: 'svg-sprite-loader',
        include: path.resolve(__dirname, 'src/icons'),
        options: {
          symbolId: (path, query) => { // 生成symbolId，可以是字符串或者函数
            const pathSplitList = path.split('\\')
            const fileDirIndex = pathSplitList.findIndex(item => item === 'icons')
            const nameSplitList = pathSplitList.slice(fileDirIndex + 1)
            const lastFirstIndex = nameSplitList.length -1
            const firstHalf = nameSplitList.slice(0, lastFirstIndex)
            const secondHalf = nameSplitList.slice(lastFirstIndex)
            return `${firstHalf.join('-')}-${secondHalf[0].replace('.svg', '')}`
          }
        }
      },
    ]
  },
};
```
