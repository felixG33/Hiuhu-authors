import Link from "next/link";
interface ArticlepageProps  { 
    params: { slug: string};
};
const articles = [
    {
        slug: "welcome-to-hiuhu",
        title:"welcome to Hiuhu Authors",
        date: "october 10, 2026",
        content: "welcome to Hiuhu Authors This is a space for stories, ideas, reflections and meaningful conversations."
    },
 {
    slug: "the-power-of-words",
    title: "The-power-of-words",
    date: "october 10, 2026",
    content: "A story should entertain the writer too, Never underestimate the impact of a story well told."
},
];
export default function Articlepage({
    params,
}: ArticlepageProps) {
    const { slug } = params;
    const article = articles.find((a) => a.slug === slug);
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
        <h1>{article.title}</h1>
        <p><em>{article.date}</em></p>
        <div>{article.content}</div>
        <br />
        <link href="/articles">Back to articles</link>
        </main>
    );
}
            