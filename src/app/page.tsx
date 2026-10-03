export default function Home() {
    return (
        <main>
            {/* Navigation */}
            <nav>
                <h2>Hiuhu Authors</h2>

                <div>
                    <a href="/">Home</a>
                    <a href="/books">Books</a>
                    <a href="/articles">Articles</a>
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>
                </div>
            </nav>
            {/* Hero Section */}
            <section>
                <h1>stories that deserve to be heard</h1>
                <p>Welcome to hiuhu authors, where every story matters.</p>
                <button>Explore our stories</button>
            </section>
            {/* Books */}
            <section>
                <h2>featured Books</h2>
                <p> Read thoughts, experiences, and ideas from our authors.</p>
                 <button>Read articles</button>
                 </section>
                 {/* About*/}
                 <section>
                    <h2>About Hiuhu Authors</h2>
                    <p>Hiuhu Authors is a creative space where writers can share their stories, ideas and experiences with readers.</p>
                    </section>
                    {/* Contact */} 
                    <section>
                     <h2>Get in touch</h2>
                     <button>Contact us</button>   
                        </section>
                        {/* Footer */}
                        <footer>
                            <p>&copy; 2026 Hiuhu Authors. All rights reserved.</p>
                            </footer>         
        </main>
    );
}
