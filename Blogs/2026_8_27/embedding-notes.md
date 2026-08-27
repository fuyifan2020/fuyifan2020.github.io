---
title: Embedding 学习笔记：从 token 到余弦相似度
slug: embedding-notes
date: 2026-08-27
category: 技术
excerpt: 梳理 embedding 的本质——把文字转成向量，以及怎样用余弦相似度衡量语义接近程度，附带 Mean Pooling 与余弦相似度伪代码。
---

# 什么是 Embedding（嵌入）

**Embedding（嵌入）**：把文字、图片、视频等对象转换成向量的过程。

之所以要这样做，是为了计算两个对象之间的「相似度」：先对对象做 embedding，得到各自的向量，再对这两个向量计算 Cosine Similarity（余弦相似度）。余弦相似度越高，代表两者的语义越接近。

# Embedding 是怎么做到的

以一句话为例，大致分三步：

1. 先把文字切成 token，再转换成数字 ID。例如「一二三」，先拆成「一」「二」「三」，再映射成对应的数字 ID。
2. 根据数字 ID 查表——这张查找表在模型内部，是训练得到的。每个数字 ID 对应一个高维向量，本质上就是一次矩阵查表，完成「ID → 向量」的映射。
3. 对于上下文模型，还会把初始的静态向量送入多层自注意力网络，依据前后文重新调整每个 token 的向量。

# 一句话的向量从哪来

主流做法是把每个 token 的向量做 Pooling（池化）。例如 **Mean Pooling（平均池化）**：把所有 token 的向量「逐位求平均」，就得到整句话的向量。

# 余弦相似度

余弦相似度衡量的是两个向量「方向」的接近程度，而非绝对长度：

```
cos(A, B) = (A · B) / (|A| × |B|)
```

对应的伪代码：

```python
import numpy as np

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

sim = cosine(vec_句子A, vec_句子B)
```

# 参考

- [AI 学习笔记：什么是 RAG 与 Embedding](https://medium.com/%E6%8A%80%E8%A1%93%E7%AD%86%E8%A8%98/ai-%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E4%BB%80%E9%BA%BC%E6%98%AF-rag-%E8%88%87-embedding-729efeb12f55)
