import { AsyncDuckDB, useDuckDb } from 'duckdb-wasm-kit';
import { useEffect, useState } from 'react';
import { useFilePicker } from 'use-file-picker';

function Home() {
    const { db } = useDuckDb();
    const [loadedParquet, setLoadedParquet] = useState(false);
    const [data, setData] = useState([]);
    const { openFilePicker, filesContent } = useFilePicker({
        accept: '.parquet',
        readAs: 'ArrayBuffer'
    });

    useEffect(() => {
        async function loadParquetFile(db: AsyncDuckDB) {
            await db.registerFileBuffer('buffer.parquet', new Uint8Array(filesContent[0].content));
            const connection = await db.connect();
            await connection.query('CREATE TABLE direct AS SELECT * FROM "buffer.parquet";');
            await connection.close();
        }

        async function getData() {
            if (db) {
                const connection = await db.connect();
                const arrow = await connection.query('SELECT * FROM direct;');
                return arrow.toArray().map((row) => row.toJSON());
            }
        }
        
        if (!loadedParquet && filesContent.length > 0 && db) {
            loadParquetFile(db).then(() => setLoadedParquet(true)).catch(console.log);
        }

        if (loadedParquet && data.length == 0) {
            getData().then(setData);
        }
    }, [db, filesContent, loadedParquet, data]);


    if (!loadedParquet) {
        return <button onClick={openFilePicker}>CLICK ME PLEASE</button>;
    } else {
        return <table>
            {data.map((record) => (
                <tr>
                    {Object.values(record).map((val) => (
                        <td>{val}</td>
                    ))}
                </tr>
            ))}
        </table>;
    }

}

export default Home;
