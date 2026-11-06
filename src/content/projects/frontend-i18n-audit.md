---
title: "Frontend i18n Audit · 前端国际化体检 Skill"
description: "给前端工程做国际化体检的 Skill：本地扫描硬编码中文，按 module.sub-item 规则生成全局唯一 Key，输出体检报告与可批量导入的中英文对照表，全程本地运行、不上传代码。"
type: "opensource"
techStack: ["Python 3", "SKILL.md", "i18n"]
download: "/downloads/frontend-i18n-audit.zip"
featured: true
order: 4
---

## 这是什么

给前端工程做一次“出海前体检”的 Skill。输入一个前端工程路径，输出一份体检报告加一份可批量导入的文案表，不自动改业务代码，不调用任何翻译 API，全程本地运行、不上传代码。

适用：React / Vue / 纯 TS/JS 前端工程，准备做中英切换、出海，或接国际化管理模块的团队。

## 能做什么

- **找硬编码中文**：扫描源码里的中文字符串，定位到文件和行号，去重后列清单。
- **生成 Key**：按 `module.sub-item` 规则生成全局唯一 Key，全小写点分，如 `login.title`、`common.confirm`。
- **查命名与缺失**：Key 重复、命名违规（大写、下划线、中文、空格、连续点）、中文有英文缺、英文有中文缺，都会标出来。
- **出可导入的表**：`i18n-import.csv`，表头是 `key,zh,en,module,note`，可直接进国际化管理模块批量导入。

## 怎么用

```bash
# 1. 跑演示工程
python3 scripts/scan_i18n.py --src ./demo/sample-project/src --out ./demo/sample-output

# 2. 跑自己的工程（只扫 src，排除 node_modules / dist）
python3 scripts/scan_i18n.py --src ./src --locales ./locales --out ./i18n-audit-output
```

输出两个文件：`report.md`（总数、分类统计、优先修复 Top 10）和 `i18n-import.csv`（Key、中文、英文、所属模块、备注）。

工作流是五步：确认范围 → 本地扫描 → 生成 Key 并校验 → 输出报告和导入表 → 修完后复查，对比两次报告确认硬编码数下降。

## 实测结果

演示工程 3 个文件，扫描出 14 条硬编码中文，去重后 14 条，报告与 CSV 正常生成。

| # | 中文 | 建议 Key | 建议英文 |
|---|---|---|---|
| 1 | 欢迎回来 | login.welcome-back | Welcome back |
| 2 | 登录 | login.sign-in | Sign in |
| 3 | 确定 | common.confirm | Confirm |
| 4 | 取消 | common.cancel | Cancel |
| 5 | 请输入用户名 | login.enter-username | Please enter your username |

建议英文均为草稿，需人工确认后才能当定稿。

## 包里有什么

完整包 21KB，14 个文件：

- `SKILL.md`：技能定义，181 行，含任务概述、核心工作流、输入输出规范、质量规范、参考资料与示例
- `scripts/scan_i18n.py`：本地扫描脚本，零第三方依赖，只用 Python 3 标准库
- `references/i18n-key-rules.md`：Key 命名规则，含 27 类埋点场景分类与占位符规则
- `references/checklist.md`：提交前自查清单
- `assets/templates/`：报告模板与导入表空模板
- `demo/sample-project/`：3 个文件的演示工程；`demo/sample-output/`：跑完脚本的标准输出

## 参赛信息

2026 华为开发者大赛 · 小红书 Skill 创新赛参赛作品，报名与作品提交截止 2026-11-24。提交分三步：先上架小红书 Skill 市场，再上架华为云 Skill 市场，最后回大赛官网提交两个链接，并发“学一做一”笔记。
