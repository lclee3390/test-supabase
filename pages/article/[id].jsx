import Script from 'next/script'

function ArticlePage({ content }) {
  return (
    <div>
      <div className="article-content">
        {content}
      </div>
      <Script
        id="article-scripts"
        strategy="afterInteractive"
      />
    </div>
  );
} 