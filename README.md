# wcx-pi-preset

wcx 的 Pi preset。把常用的 18 个 `pi-package` 打成一个包：一次安装，扩展、技能、提示词全部就位。

## 安装

从 npm 安装（推荐，装完不依赖 GitHub）：

```bash
pi install npm:wcx-pi-preset
```

或直接从仓库安装：

```bash
pi install git:github.com/yayawcx/wcx-pi-preset
```

只想本次会话试用，不写进 settings：

```bash
pi -e npm:wcx-pi-preset
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
npm run verify     # 校验 manifest 里每条资源路径真实存在
pi -e .            # 会话级加载整个 preset
pi install .       # 或装到个人配置
pi config          # 查看资源加载情况和 warning
```

每次加包后都要跑一遍 `pi -e .`，重点看 extension loader 的 warning。

## 发布

### 发到 npm

```bash
npm login          # 首次，或已设置 NPM_TOKEN 时用 --//registry.npmjs.org/:_authToken=$NPM_TOKEN
npm run verify
npm publish --access public
```

`prepack` 钩子会自动跑 `verify`，路径缺失会直接让打包失败，不会发出一个“装了但什么都没生效”的包。

已装过的用户更新：

```bash
pi update npm:wcx-pi-preset
```

### 发版流程

版本号用 Conventional Commits 语义：`fix:` → patch，`feat:` → minor，破坏性变更 → major。

```bash
npm version minor          # 改 package.json 版本并打 tag
npm publish --access public
```

推 `v*` tag 会触发 `.github/workflows/publish.yml` 自动发布。仓库需要先配置 `NPM_TOKEN` secret（在 npmjs.com → Access Tokens 建 Automation token）。

CI 里会重新 `npm install` 再 publish：`bundleDependencies` 打的是 `node_modules` 的内容，而 `node_modules` 不进 git，缺了这步发出去的包是空的。
