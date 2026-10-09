export default function articlespage() {
    const articles = [
        {
        title:" Things we never say",
        description:"some thoughts remain unspoken, even when they mean the most.",
        category: "reflection",
        } ,
        {
            title: "my story",
            description: "Every story begins somewhere. This is a space for sharing yours.",
            category: "personal",
        },
        {
            title: "The quiet mind",
            description: "Exploring the thoughts,dreams and questions that shape our lives.",
            category: "life",
        },
    ];
    return (
        <main className="articles-page">
            <header className="articles-header">
                <a href="/" className="back-home">Home</a>
                <p className="articles-label">HIUHU AUTHORS</p>
                <h1>stories and articles</h1>
                <p className="articles intro">words and reflections worth sharing.
                    find somethingthat speaks to you, and let it inspire your own journey.
                </p>
                </header>
            <section className="articles-grid">
                {articles.map((article, index) => (
                    <article className="article-card" key={article.title}>
                        <p
                        className="article-category">{article.category}</p>
                        <h2>{article.title}</h2>
                        <p
                        className="article-description">
                            {article.description}
                            </p>
                            <span className="read-more">coming soon
                            </span>
                    </article>
                ))}
            </section>
        </main>
    );
}


            