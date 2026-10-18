---
title: "Variant Form支持热更新"
description: "如果使用的是js，使用require导入依赖"
pubDate: 2025-03-24
category: "前端"
tags:
  - "Variant Form"
  - "Webpack"
featured: false
draft: false
---

### .gitignore

```bash
# webpack构建配置
babel.config.json
shims-vue.d.ts
tsconfig.json
webpack.config.ts
src/components/form-designer/form-widget/container-widget/index.webpack.js
src/components/form-designer/form-widget/field-widget/index.webpack.js
src/components/form-designer/setting-panel/property-editor/index.webpack.js
src/components/form-render/container-item/index.webpack.js
```

### package.json
```json
{
  "script": {
    "dev:webpack": "webpack serve --mode development",
  },
  "devDependencies": {
    "@vue/babel-plugin-jsx": "^1.4.0",
    "babel-loader": "^10.0.0",
    "css-loader": "^7.1.2",
    "fork-ts-checker-webpack-plugin": "^9.0.2",
    "html-webpack-plugin": "^5.6.3",
    "sass-loader": "^16.0.5",
    "string-replace-loader": "^3.1.0",
    "style-loader": "^4.0.0",
    "svg-sprite-loader": "^6.0.11",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "typescript": "^4.9.5",
    "vue-loader": "^17.4.2",
    "webpack": "^5.98.0",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.0"
  }
}
```

### webpack.config.ts
如果使用的是js，使用require导入依赖

```javascript
import * as path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'

const config = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist-webpack'),
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      // 文件重定向，因index.js中使用的 import.meta.globEager 是vite自有的配置，webpack不支持，所以需要重定向到webpack支持的文件
      '@/components/form-render/container-item/index': '@/components/form-render/container-item/index.webpack',
      '@/components/form-designer/form-widget/container-widget/index': '@/components/form-designer/form-widget/container-widget/index.webpack',
      '@/components/form-designer/form-widget/field-widget/index': '@/components/form-designer/form-widget/field-widget/index.webpack',
      '@/components/setting-panel/container-item/index': '@/components/setting-panel/container-item/index.webpack',
      './property-editor/index': './property-editor/index.webpack',
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.vue', '.json', '.jsx', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          'vue-loader',
          {
            loader: 'string-replace-loader',
            options: {
              multiple: [
                {
                  search: '@import',
                  replace: '// @use',
                  flags: 'g'
                },
                {
                  search: 'import { Quill, quillEditor }',
                  replace: '//',
                  flags: 'g'
                },
                {
                  search: 'quillEditor',
                  replace: '//',
                  flags: 'g'
                },
                {
                  search: `import vueEsign from 'vue-esign'`,
                  replace: '//',
                  flags: 'g'
                },
                {
                  search: `components: { vueEsign }`,
                  replace: '//',
                  flags: 'g'
                },
              ]
            }
          }
        ]
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.(jsx|tsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      // 防止使用import.meta.globEager文件报错，故将其重置为空数组并添加//不执行()
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
      {
        test: /main.js$/i,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: `import 'virtual:svg-icons-register'`,
            replace: `const req = require.context('/src/icons/svg', true, /.svg$/); (function (svgAll) {svgAll.keys().map(svgAll)})(req);`,
          }
        }
      },{
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'string-replace-loader',
            options: {
              search: '@import',
              replace: '@use',
              flags: 'g'
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              additionalData: `
                @use "@/styles/global.scss";
                $--color-primary: #409EFF;
              `
            }
          }
        ]
      },
      {
        test: /.svg$/,
        loader: 'svg-sprite-loader',
        include: path.resolve(__dirname, 'src/icons/svg'),
        options: {
          symbolId: (path: string) => {
            const pathSplitList = path.split('\\')
            const fileDirIndex = pathSplitList.findIndex(item => item === 'svg')
            const nameSplitList = pathSplitList.slice(fileDirIndex + 1)
            const lastFirstIndex = nameSplitList.length -1
            const firstHalf = nameSplitList.slice(0, lastFirstIndex)
            const secondHalf = nameSplitList.slice(lastFirstIndex)
            return `icon${firstHalf.length ? '-'+ firstHalf.join('-') : ''}-${secondHalf[0].replace('.svg', '')}`
          }
        }
      },
      {
        test: /.svg$/,
        type: 'asset/resource',
        exclude: path.resolve(__dirname, 'src/icons/svg')
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: 'asset/resource'
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new CleanWebpackPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    open: false,
    port: 9000,
    client: {
      overlay: false,
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://172.19.7.23',
      },
    ],
  },
  // stats: 'errors-only'
};

export default config;
```

### babel.config.json

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        }
      }
    ]
  ],
  "plugins": ["@vue/babel-plugin-jsx"]
}
```

### shims-vue.d.ts

```typescript
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}

declare module '*.jsx' {
  const content: any;
  export default content;
}

declare module '*.tsx' {
  const content: any;
  export default content;
}

```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES5",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    "jsx": "preserve",                                /* Specify what JSX code is generated. */
    "jsxImportSource": "vue",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    
    /* Modules */
    "module": "CommonJS",                                /* Specify what module code is generated. */
    "moduleResolution": "node",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    "paths": {
      "@/*": ["src/*"]
    },                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": false,                                      /* Enable all strict type-checking options. */
    "noImplicitAny": false,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    "strictNullChecks": false,                         /* When type checking, take into account 'null' and 'undefined'. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true,                                 /* Skip type checking all .d.ts files. */
  },
  "include": [
    "./src/**/*",
    "shims-vue.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

### src/components/form-designer/form-widget/container-widget/index.webpack.js

```javascript
const modules = {};
const context = require.context(
  './',
  false,
  /\.vue$/
);

context.keys().forEach(key => {
  const module = context(key).default
  modules[module.name] = module;
});
export default {
  install(app) {
    for (const path in modules) {
      const component = modules[path];
      app.component(component.name, component);
    }
  }
}
```
### src/components/form-designer/form-widget/field-widget/index.webpack.js

```javascript
const modules = {};
const context = require.context(
  './',
  false,
  /\.vue$/
);

context.keys().forEach(key => {
  const module = context(key).default
  modules[module.name] = module;
});
export default modules
```

### src/components/form-designer/setting-panel/property-editor/index.webpack.js

```javascript
const modules = {};
const context = require.context(
  './',
  true,
  /\.vue$/
);

context.keys().forEach(key => {
  const module = context(key).default
  modules[module.name] = module;
});
export default modules
```

### src/components/form-render/container-item/index.webpack.js

```javascript
const modules = {};
const context = require.context(
  './',
  false,
  /\.vue$/
);

context.keys().forEach(key => {
  const module = context(key).default
  modules[module.name] = module;
});
export default {
  install(app) {
    for (const path in modules) {
      const component = modules[path];
      app.component(component.name, component);
    }
  }
}
```
