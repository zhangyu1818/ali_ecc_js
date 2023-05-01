# 阿里网盘 x-signature 逻辑

阿里网盘 create session 和 renew session

## 安装依赖

```text
pnpm install
```

## 配置

从浏览器里的 localStorage 找到对应的 config 信息。

## 运行

```text
node index.mjs
```

---

目前我只在 javascript 里成功 renew session，swift 里同样的逻辑就不行了，不知道 secp256k1 在不同语言会不同还是其他原因。

