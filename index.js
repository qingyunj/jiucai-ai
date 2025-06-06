// 项目名称：韭菜联盟
// 版本：MVP V0.6 使用腾讯财经 JSON API 代理服务（用户自部署）

import { useState, useEffect } from "react";

export default function StockAnalyzer() {
  const [symbol, setSymbol] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);

  const analyzeStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://jiucai-proxy.vercel.app/api/tencent?symbol=sh${symbol}`);
      const json = await res.json();
      if (!json || !json.name) throw new Error("无数据");

      const current = parseFloat(json.price);
      const yestclose = parseFloat(json.yestclose);
      const diff = (current - yestclose).toFixed(2);
      const percent = (((current - yestclose) / yestclose) * 100).toFixed(2);

      const data = {
        fundamentals: `股票名称: ${json.name}, 当前价: ${current}, 昨收: ${yestclose}, 今开: ${json.open}, 涨跌额: ${diff}, 最高: ${json.high}, 最低: ${json.low}`,
        pattern: `今日涨跌幅: ${percent}%`,
        comment: parseFloat(percent) > 0 ? "上涨趋势明显，短期可关注" : "短期承压，注意风险",
      };
      setResult(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setResult({
        fundamentals: "数据加载失败",
        pattern: "--",
        comment: "可能是网络或源站问题，请稍后再试",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("https://rsshub.app/sina/finance");
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);
        const headlines = items.map((item) => ({
          title: item.querySelector("title").textContent,
          ai: "内容涉及板块需人工判断，建议结合关键词识别。"
        }));
        setNews(headlines);
      } catch (e) {
        setNews([
          { title: "快讯加载失败", ai: "可能是网络问题或源站屏蔽" }
        ]);
      }
    }
    fetchNews();
  }, []);

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>韭菜联盟</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>让AI赋能你的每一次买卖决策</p>

      <div style={{ marginBottom: '2rem' }}>
        <input
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ccc' }}
          placeholder="输入股票代码，如 600519"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button
          onClick={analyzeStock}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? "分析中..." : "开始分析"}
        </button>
      </div>

      {result && (
        <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>分析结果</h2>
          <p><strong>基本面摘要：</strong> {result.fundamentals}</p>
          <p><strong>图形形态识别：</strong> {result.pattern}</p>
          <p><strong>AI简评：</strong> {result.comment}</p>
        </div>
      )}

      <div style={{ border: '1px solid #ddd', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>今日快讯 + AI点评</h2>
        {news.map((item, idx) => (
          <div key={idx} style={{ marginTop: '1rem' }}>
            <p>📌 {item.title}</p>
            <p style={{ color: '#666' }}>📊 AI点评：{item.ai}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

