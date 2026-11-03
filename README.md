# 上海开放计算系统研究院官网

第一轮本地可点击前台，依据规划修订稿 04。Astro 6.4.8、TypeScript、Tailwind CSS 4，静态输出；尚未接入 Keystatic，也未部署公网。

## 启动（Windows PowerShell）

当前环境 Node.js 22.15.0。要求 Node.js 22.12.0 或更高，包管理器固定为 pnpm 10.34.9。

```powershell
Set-Location 'G:\Mycode\isoc_site-main'
npx.cmd --yes pnpm@10.34.9 install --frozen-lockfile
npx.cmd --yes pnpm@10.34.9 dev
```

默认地址：<http://127.0.0.1:4321/>。若端口已占用，以终端打印地址为准。`Ctrl+C` 停止前台进程。

查看生产产物：

```powershell
npx.cmd --yes pnpm@10.34.9 build
npx.cmd --yes pnpm@10.34.9 preview
```

## 本地测试稿预览

另开 PowerShell 终端：

```powershell
Set-Location 'G:\Mycode\isoc_site-main'
npx.cmd --yes pnpm@10.34.9 dev:fixtures
```

地址：<http://127.0.0.1:4322/preview/4/>。页顶有 0、1、3、4 条入口，四分类均可切换。首页最多三条，分类页显示全部四条，单条可进入详情。月报示例地址为 `/news/ai-monthly/2026-10/`，所属分类按年度归档。

这些预览路由仅在 `DEV && ISOC_PREVIEW=1` 时生成，正式 `build` 即使保留了该环境变量也不会收录。正式首页目前没有获准发布的新闻，四分类均显示“暂无已发布内容”。

## 页面与内容维护

- `/`：品牌横幅、院情摘要、新闻四分类及页脚。
- `/research/`：芯片与算力底座、系统软件与开发生态、智能体执行系统与具身智能。
- `/about/`：完整院情、宗旨与目标、协同创新、发展历程、联络信息占位。
- `/organization/`：治理关系、待核定的负责人信息。
- `/registration/`：按登记证书副本转录的只读字段。
- `/news/` 与 `/news/institute/`、`/news/research/`、`/news/notices/`、`/news/ai-monthly/`：新闻中心、分类与月报年度归档。
- 新闻详情为 `/news/<category>/<slug>/`，月报单期为 `/news/ai-monthly/YYYY-MM/`。无正式稿件时不生成虚构详情。
- `/404.html`：未找到页面。

院情及研究方向集中在 `src/data/institute.ts`；首页只读取 `institute.summary`，全文入口均指向 `/about/`。负责人数组预留姓名、机构内职务、任期、核定日期，目前为空。证书法定代表人字段与现任负责人名单分别维护。

正式新闻维护于 `src/data/news.json`，结构见 `src/lib/news-model.ts`：标题、分类、发布日期（YYYY-MM-DD）、摘要、正文段落、来源、状态、唯一地址；月报另填 YYYY-MM 期号。仅 `published` 且发布日期不晚于构建日的稿件进入生产产物。重复月报期号、非法日期和未经核准的附件会阻止发布。正文按纯文本转义，第一轮不支持富文本编辑。

## 公开边界

`_reference/`、`.local/`、测试结果均已忽略。原始 PPT、证书扫描、两版建设方案及负责人表仅用于本地参考。`public/` 目前只含从院情 PPT 原样提取的 iSOC 标识，没有复制内部文档。

附件仅可在获准发布的稿件中登记，放入 `/attachments/<英文短名>.pdf` 并设 `approved: true`。撤稿后需同步移走其专属公开附件，否则构建审计会报错。构建审计逐文件检查输出白名单、预览标记、草稿正文与附件路径，检查 HTML、JS、CSS 及全部静态文件；不接受未声明的二进制文件。

## 检查

```powershell
npx.cmd --yes pnpm@10.34.9 check
npx.cmd --yes pnpm@10.34.9 test
npx.cmd --yes pnpm@10.34.9 build
npx.cmd --yes pnpm@10.34.9 test:e2e
```

浏览器测试使用本机 Microsoft Edge 无头模式，自动启动并停止所需的 4321、4322 服务；若已存在服务会复用。运行前请确保两个端口属于本项目。测试覆盖 1440px／390px、四分类 0／1／3／4 条、排序、三条上限、第四条与详情、月报期号路由、标签键盘操作、手机菜单、跳至正文、内链及锚点、无横向溢出和无 JavaScript 的分类入口。

首页截图保存为 `.local/screenshots/home-1440.png` 和 `.local/screenshots/home-390.png`，不进入 `dist/`。

## 待院方补充

1. 四类新闻及 AI 月报的正式审定稿、来源、发布日期、期号和获准附件。
2. 现任负责人姓名、机构内职务、任期／核定日期；治理职责如需展开，应补核准章程。
3. 对外电话、邮箱及联系地址；当前仅展示证书登记住所，不推定为接待地址。
4. 经核准可公开的证书公示件、最终院情表述及研究计划公开口径。
5. 后续上线所需域名、备案信息及发布责任人。Keystatic、审核发布流程与公网部署留待后续轮次。
