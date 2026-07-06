import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';
import { seedDatabase } from './seed';

dotenv.config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'musicgraphpassword';

let driver: Driver;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      disableLosslessIntegers: true
    });
  }
  return driver;
}

export async function runQuery(query: string, params: Record<string, any> = {}) {
  const currentDriver = getDriver();
  const session: Session = currentDriver.session();
  try {
    const result = await session.run(query, params);
    return result;
  } finally {
    await session.close();
  }
}

export async function initDb() {
  console.log(`Connecting to Neo4j at ${uri}...`);
  try {
    const driverInstance = getDriver();
    await driverInstance.verifyConnectivity();
    console.log('Successfully connected to Neo4j database.');

    console.log('Ensuring unique constraints...');
    await runQuery('CREATE CONSTRAINT unique_artist_mbid IF NOT EXISTS FOR (a:Artist) REQUIRE a.mbid IS UNIQUE');
    await runQuery('CREATE CONSTRAINT unique_recording_mbid IF NOT EXISTS FOR (r:Recording) REQUIRE r.mbid IS UNIQUE');
    await runQuery('CREATE CONSTRAINT unique_release_mbid IF NOT EXISTS FOR (r:Release) REQUIRE r.mbid IS UNIQUE');
    await runQuery('CREATE CONSTRAINT unique_label_mbid IF NOT EXISTS FOR (l:Label) REQUIRE l.mbid IS UNIQUE');
    await runQuery('CREATE CONSTRAINT unique_genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE');
    await runQuery('CREATE CONSTRAINT unique_area_mbid IF NOT EXISTS FOR (a:Area) REQUIRE a.mbid IS UNIQUE');

    console.log('Constraints successfully initialized.');
    
    // Auto-seed the database if it is empty
    await seedDatabase();
  } catch (error) {
    console.error('Failed to initialize Neo4j database:', error);
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
  }
}