# ⚡ QCL — Quick Component Language

**QCL** (Quick Component Language) is a minimal, markup-like language for declaratively building interactive UI components with built-in **state**, **styling**, and **logic**.

> Write once, preview instantly, export anywhere.

---

## ✨ Features

- 🧠 **State management** using `State:` and `setState(...)`
- 🔤 **Inputs**, **buttons**, **selects**, and layout blocks
- 🌀 **Dynamic content** with `{placeholder}` interpolation
- 💾 **Export as HTML**, AST, Gzipped QCL, or paste to termbin
- 🧩 Real-time rendering + QR code sharing
- 📦 Lightweight — works in-browser, client-side only

---

## 🚀 Quick Example

```qcl
# Welcome to QCL

State: name = "World"

Text: Hello, {name}!

Input: name placeholder="Type your name..."

Button: Set to Fan action="setState({ name: 'QCL Fan' })"
