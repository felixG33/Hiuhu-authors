import link from "next/link"
type articlepageprops = { 
    params: Promise<{ slug: string}>;
};
const articles = [
    {
        slug: "welcome-to-hiuhu",
        title:"welcome to Hiuhu Authors",
        date: "october 10, 2026",
        content: "welcome to Hiuhu Authors This is a space for stories, ideas, reflections and meaningful conversations."
    },
 {
    slug: "the=power-of-words",
    title: "The-power-of-words",
    date: "october 10, 2026",
    content: "A story should entertain the writer too, Never underestimate the impact of a story well told."
},
];
export default async function Articlepage({
    params,
}: articlepageprops) {
    const { slug } =await params;
    const article = articles.find((article) => article.slug === slug);
    if(!article){
        return (
            <main className="article-detail">
                <h1>Article not found</h1>
                <p>The article you are looking for does not exist.</p>
                <link href= "/articles">Back to articles</link>
            </main>
        );
    }
    return(
        <main className="article-detail">
            <link href="/articles"
            className="back-link">
                back to articles
            </link>
            <article className="article-content">
                <p
                className="article-date">{article.date}</p>
                <h1>{article.title}</h1>
                <div className="article-body">
                    {article.content.split("\n\n").map((paragraph,index) =>(
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </article>
        </main>
    );
}
