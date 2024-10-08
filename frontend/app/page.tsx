import InputForm from './components/Form';
import { sql } from '@vercel/postgres';
import WordsContainer from './ss.js';

async function getPosts() {
    const { rows } = await sql`SELECT * FROM users;`;
    return rows;
}

export default async function Home() {
    const posts = await getPosts();
    console.log(posts);
    return (
        <div className="flex items-center justify-center min-h-screen container">
            <div id="words-container" style={{ zIndex: 0 }}>
            </div>
            <div id="input-group">
            <InputForm />
            <WordsContainer/>
            </div>
        </div>
    );
}
