- Notion でできた [Bluesky 公式アカウント移行まとめ](https://bluesky-official-accounts.notion.site/Bluesky-d6244af0d4164febb40f91bc2649a3e1) ページが、スマートフォンで重すぎて閲覧できない
- 色々方法を考えた結果、 Notion API を叩いて自作した方が早いとの結論になった
- 雑に作っただけなので、これもまた有志でアップデートしていきたいな
- 最終的に Static な HTML にしてあるものの、開発中は 2 回目以降のアクセスでキャッシュが上手くいってないのもなんとかしたい

```bash
npm run dev
```
