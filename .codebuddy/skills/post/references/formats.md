# 格式转换与解析器参考（references/formats.md）

本文件补充 `SKILL.md` 中「按格式转换」与「排版语法」的细节，供深入查阅。

## 各格式转换配方

| 格式 | 推荐命令 / 方式 | 依赖 | 备注 |
|---|---|---|---|
| `.md` | 直接使用；已有 front-matter 则 `convert_source.py` 直接拷贝 | 无 | 最省事 |
| `.txt` | 直接使用，或 `convert_source.py` 包 front-matter | 无 | 常需人工重组段落 |
| `.pdf`（正文） | `pdftotext file.pdf -` 或 `pandoc file.pdf -t markdown` | poppler / pandoc | 提取的是纯文字，公式/版式会丢失 |
| `.pdf`（仅附带） | 原文件放入 `Blogs/<日期>/`，正文写 `{{PDF}}` | 无 | 不要抽文字，留给脚本内嵌卡片+预览 |
| `.docx` | `pandoc file.docx -t markdown -o out.md` | pandoc | 或 `python-docx` 抽段落 |
| `.html` | `pandoc file.html -t markdown -o out.md` | pandoc | `convert_source.py` 也内置极简 stdlib 提取 |
| `.pptx` / `.ppt` | `pandoc file.pptx -t markdown -o out.md` | pandoc | `.ppt`（老格式）先转 `.pptx` 或用 pandoc；`convert_source.py` 只处理 `.pptx` |
| 图片 | ⚠️ 见下方「图片限制」 | — | 当前不可直接入文 |
| 聊天零散文字 | 人工整理为 `.md` + front-matter | 无 | 按博客语气润色 |

### 工具安装（按需）
- **pandoc**（万能转换器）：https://pandoc.org/install 或 `brew install pandoc` / `apt install pandoc`
- **poppler**（`pdftotext`）：`apt install poppler-utils` / `conda install poppler` / Windows 装 poppler 并加 PATH
- **python-docx**：`pip install python-docx`
- **python-pptx**：`pip install python-pptx`

`convert_source.py` 对 pdf/docx/pptx 会先探测工具/库是否可用，不可用就打印提示并产出占位草稿，不会中断流程。

## 发布脚本的 Markdown 解析能力（手写正则，非标准）

**支持：**
- 标题：`#`→h2、`##`→h3、`###`→h4；`####`/`#####`/`######` 一律封顶为 `<h4>`
- 加粗 `**x**`、行内代码 `` `x` ``、链接 `[文本](url)`
- 代码块 ` ``` ` 围栏
- 表格 `| a | b |`、有序列表 `1.`、无序列表 `-`/`*`
- 引用 `>`、分隔线 `---`
- `{{PDF}}` 占位 → 下载卡片 + 在线预览（缺省追加文末）

**不支持（写了也不会正确渲染）：**
- 嵌套列表、任务列表
- 脚注、定义列表
- `![]()` 图片语法（见下）
- 裸 HTML / 内联标签（`<...>` 会被转义成纯文本）
- `###` 以上的真实 `h5`/`h6`
- 代码块内的语言高亮标注（仅原样包裹）

## 图片限制（重要）

当前 `publish_post.py` 的解析器**不处理图片**：`![]()` 语法未被实现，且正文里的 `<`/`>` 会被转义，裸 `<img>` 也会被变成文本。因此：

- 若文章必须有图，短期方案是**用文字描述**，或把图当作附件让用户下载；
- 若确需图文混排，应先**扩展 `publish_post.py`**：识别 `![]()` → 复制图片到 `assets/`（如 `assets/img/<slug>/...`）→ 输出 `<img>` 并相应补充 `style.css`。这属于对发布脚本的功能增强，改动前先与用户确认。

交付任何含图需求时，主动在回复里点明这一限制。
