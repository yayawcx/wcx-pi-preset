# wcx-pi-preset

wcx 的 Pi preset。把常用的 18 个 `pi-package` 打成一个包：一次安装，扩展、技能、提示词全部就位。

## 安装

```bash
pi install git:github.com/yayawcx/wcx-pi-preset
```

只想本次会话试用，不写进 settings：

```bash
pi -e git:github.com/yayawcx/wcx-pi-preset
```

安装后跑 `pi config` 确认资源都加载了、没有 warning。

## 包含什么

| 包 | 提供 |
|---|---|
| `bigpowers` | 全套 bigpowers 技能与提示词 |
| `@dietrichgebert/ponytail` | ponytail 懒人模式扩展 + 技能 |
| `pi-web-access` | `web_search` / `fetch_content` 等联网工具 |
| `@tintinweb/pi-subagents` | `Agent` / `SubagentWorkflow` 子代理 |
| `@narumitw/pi-goal` | `/goal` 目标模式 |
| `@narumitw/pi-plan-mode` | `/plan` 计划模式 |
| `@narumitw/pi-btw` | 侧问题（by the way） |
| `@juicesharp/rpiv-ask-user-question` | `ask_user_question` 结构化提问 |
| `@plannotator/pi-extension` | 计划审阅 UI |
| `@mohndoe/pi-atlas` | 代码地图 |
| `@lanlance/pi-recap` | 会话回顾 |
| `pi-cache-optimizer` | 提示词缓存优化 |
| `@vanillagreen/pi-skills-manager` | 技能管理 UI |
| `statusline-pi` / `pi-powerline-footer` | 状态栏 |
| `pi-session-name` | 会话自动命名 |
| `pi-input-history` | `Ctrl-R` 历史搜索 |
| `@bacnh85/pi-init` | AGENTS.md 初始化 |

## 怎么打包的

三层机制，缺一不可：

1. **`dependencies`** —— 让 npm 把这些包装进 `node_modules`。
2. **`bundleDependencies`** —— 让 `npm pack` / git 安装时把它们的代码一起带上。Pi 官方要求：作为依赖的 Pi package 必须出现在发布产物里。
3. **`pi` manifest 里的 `node_modules/...` 路径** —— 装完后 Pi 靠这个知道该加载哪个入口文件。这是资源声明，不是 JS import，路径必须精确到 Pi 认得的入口（`main`、`exports`、或惯例目录 `extensions/`、`skills/`、`dist/`）。

同一个包被依赖，但 manifest 里只挑想要的资源，就是在这里做取舍。

## 注意的坑

- **`.npmrc` 里的 `force=true`**：`@mohndoe/pi-atlas` 把 `@earendil-works/pi-tui` 的 peer range 锁在 `>=0.74 <0.77`，而当前运行时是 0.84.x。`force=true` 容忍这类 peer 冲突但仍安装 peer 树。
  不要换成 `legacy-peer-deps`——它会把整个 `@earendil-works/*` peer 子树从 lockfile 里删掉。
- **不要**把 `@earendil-works/pi-*`、`typebox` 放进 `dependencies`。这些由 Pi 宿主提供，声明在 `peerDependencies` 里用 `"*"`。物理副本会绕过扩展模块映射，产生重复的类和注册表，Pi 会在 `pi -e` 时直接报 host-provided warning。
- 本 preset 不包含 `pi-modelsproxy` 这类内网 git 源，保证公开可装。

## 本地验证

```bash
pi -e .            # 会话级加载整个 preset
pi install .       # 或装到个人配置
pi config          # 查看资源加载情况和 warning
```

每次加包后都要跑一遍 `pi -e .`，重点看 extension loader 的 warning。
