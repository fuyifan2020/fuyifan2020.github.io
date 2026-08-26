---
title: CTINexus 学习笔记：本地部署与论文精读
slug: ctinexus
date: 2026-08-26
category: 技术
excerpt: 本地部署 CTINexus（Ollama 本地 embedding + DeepSeek API），并梳理论文三大核心创新与一条精读路线。
paper: CTINexus 原论文
---

CTINexus 是一个把网络安全威胁情报（CTI）自动构建成知识图谱的开源工具。最近我把它在本地跑了起来，并把原论文啃了一遍。项目地址在 [peng-gao-lab/CTINexus](https://github.com/peng-gao-lab/CTINexus)。

{{PDF}}

原版接入的是 GPT 模型，我改成了 **DeepSeek API** 负责推理，embedding 则改用 **Ollama 本地部署**的 `nomic-embed-text`，既省 token，又不把数据发出去。

# 本地部署

## ① 启动 Ollama

```bash
ollama serve
# 确认：curl.exe http://localhost:11434/api/tags 有返回即 OK
```

## ② 启动 Web UI（新开一个终端）

```bash
cd c:\Users\ASUS1\OneDrive\桌面\ctinexus-main
.\run.bat
# 或者
.\.venv\Scripts\python.exe -m ctinexus.app
```

# 各部分模型选择

| 阶段 | 模型 | 来源 |
| --- | --- | --- |
| Intelligence Extraction | deepseek-chat | DeepSeek API |
| Entity Tagging | deepseek-chat | DeepSeek API |
| Entity Alignment | nomic-embed-text | Ollama 本地 |
| Link Prediction | deepseek-chat | DeepSeek API |

# 论文核心

1. **kNN 增强的 ICL 三元组抽取（Phase 1）** —— 单次推理端到端抽取。
2. **分层实体对齐（Phase 2）** —— 粗粒度类型分组 + 细粒度 embedding 聚类。
3. **长距离关系预测（Phase 3）** —— 用度中心性找关键节点，补上跨子图的隐含关系。

# 论文建议的精读路线（from ds）

1. §3 Overview + Fig. 2（5 分钟）：建立三阶段全景图，对照代码的 `gradio_utils.run_pipeline` 的进度条（0.05→0.2→0.45→0.7→0.9→1.0 就是三阶段的执行顺序）。
2. §4.2 + Fig. 3：理解 ICL prompt 构造（指令+示例+query 三件套），对照 `ie.jinja`。
3. §4.3 + Fig. 4：EA 三件套你已经精通，可以只看 IOC 保护那段原文。
4. §4.4 + Fig. 5：LP 设计，对照 `link.jinja` 和 `Linker`。
5. §5.3-5.4：消融实验 —— 这是论文“为什么这么设计”的证据链。
6. §6 Discussion：局限性和未来方向 —— 也是下一阶段“本体延展”的出发点。
