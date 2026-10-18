---
title: "commit-generator-zh-cn：让 Git 提交信息自动生成且规范可读"
description: "本文由AI润色完成 日常开发里，提交信息常常是最容易被忽略的一环。 fix bug、update、改一下 这类提交，在短期看似省事，长期会直接拉高协作和排障成本。 我做了一个开源 VS Code 扩展 commitgeneratorzhcn，核心目标是两件事： 还有一个很现实的原..."
pubDate: 2026-02-15
category: "前端"
tags:
  - "VS Code"
  - "Git"
  - "AI"
  - "工程化"
featured: false
draft: false
---

*本文由AI润色完成*



日常开发里，提交信息常常是最容易被忽略的一环。  
`fix bug`、`update`、`改一下` 这类提交，在短期看似省事，长期会直接拉高协作和排障成本。

我做了一个开源 VS Code 扩展 `commit-generator-zh-cn`，核心目标是两件事：

还有一个很现实的原因：VS Code 里的 GitHub Copilot 存在使用限额，超额后需要开通订阅。  
它虽然支持一定程度的自定义接入，但我实际使用下来，对话可用，在“生成 commit message”这个场景里却报错，稳定性不够。

1. 自动生成提交信息，减少手写负担。
2. 默认输出中文 Conventional Commit，保证规范一致。

项目地址：<https://github.com/jpzuo/commit-generator>

## 这个插件具体解决什么问题

它不是简单“写一句提交标题”，而是输出完整结构：

- 标题：`type(scope): subject` 或 `type: subject`
- 空行
- 详细正文

并且对提交标题做了明确约束：

- `type` 只允许 Conventional Commits 常见类型（如 `feat/fix/docs/refactor/chore` 等）
- `subject` 必须是简体中文、单行表达

这让生成结果可以直接用于团队协作、变更追踪、日志归档，不需要二次整理。

## 设计上的几个关键选择

### 1) 只基于 staged 变更生成

插件只读取已 `git add` 的内容。  
这能确保“你准备提交什么，就为它生成什么”，避免把未准备提交的修改混进描述里。

### 2) AI 优先，本地规则兜底

默认优先调用 AI 生成更自然的提交说明；  
当 AI 不可用时，会自动回退到本地规则，保证功能稳定可用，不会“按钮按了没反应”。

### 3) 对输入规模做边界控制

- diff 最多读取前 12000 个字符
- 正文中的“变更文件”最多展示前 3 个，其余用“等 N 个文件”概括

这是为了在可读性、性能和稳定性之间取得平衡，避免大仓库或大改动时输出失控。

## 使用方式

流程非常直接：

1. 打开一个 Git 仓库（VS Code 工作区）
2. 在 Source Control 中先 `git add` 需要提交的改动
3. 点击 Source Control 标题栏按钮或状态栏 `生成提交信息`
4. 插件会自动把生成结果写入当前仓库提交输入框

也可以通过命令面板执行：`commitGenerator.generate`。

![功能入口示意图](https://commit-generator.oss-cn-beijing.aliyuncs.com/Snipaste_2026-02-15_17-49-04.png)

## 配置建议

插件支持 OpenAI 兼容接口，常用配置包括：

- `commitGenerator.apiBaseUrl`
- `commitGenerator.apiKey`
- `commitGenerator.apiProtocol`（`chatCompletions` 或 `responses`）
- `commitGenerator.openaiModel`
- `commitGenerator.chineseStyle`（`engineering` / `business` / `concise`）

这意味着你可以接入官方 OpenAI，也可以接入兼容协议的第三方服务。

## 适合哪些人

- 想快速养成规范提交习惯的个人开发者
- 希望团队提交风格统一的项目负责人
- 需要高频提交、但不想在 commit message 上重复劳动的人

## 最后

提交信息不是“形式化工作”，它是项目历史可读性的基础设施。  
如果能把这件事自动化，并且自动化得足够规范，就能在不增加心智负担的前提下，持续提高工程协作质量。

如果你也在找一个“即插即用、中文友好、规范优先”的提交信息生成方案，欢迎试试 `commit-generator-zh-cn`。
