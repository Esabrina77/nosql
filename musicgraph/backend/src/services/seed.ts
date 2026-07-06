import { runQuery } from './neo4j';

export async function seedDatabase() {
  console.log('[Seed] Checking if database is empty...');
  try {
    const checkResult = await runQuery('MATCH (a:Artist) RETURN count(a) as count');
    const countVal = checkResult.records[0].get('count');
    const artistCount = typeof countVal === 'number' ? countVal : (countVal && typeof countVal.toNumber === 'function' ? countVal.toNumber() : Number(countVal));

    if (artistCount > 0) {
      console.log(`[Seed] Database already has ${artistCount} artists. Skipping auto-seed.`);
      return;
    }

    console.log('[Seed] Database is empty. Running auto-seed...');

    const seedQueries = [
      // 1. Create Artists
      `CREATE (daft:Artist {
        mbid: "056e6f16-0730-4db2-a8c6-e6308cf26b90",
        name: "Daft Punk",
        type: "Group",
        country: "FR",
        beginDate: "1993",
        endDate: "2021",
        disambiguation: "French electronic music duo"
      })
      CREATE (pharrell:Artist {
        mbid: "c72df37b-9442-45e3-99b6-bfd43c7b399b",
        name: "Pharrell Williams",
        type: "Person",
        country: "US",
        beginDate: "1992",
        gender: "Male"
      })
      CREATE (rodgers:Artist {
        mbid: "87c427f7-b08e-49b0-9944-8cb3cc08e5f3",
        name: "Nile Rodgers",
        type: "Person",
        country: "US",
        beginDate: "1970",
        gender: "Male"
      })
      CREATE (weeknd:Artist {
        mbid: "c8b03190-ab7e-44d4-9f27-5d12b90984d8",
        name: "The Weeknd",
        type: "Person",
        country: "CA",
        beginDate: "2010",
        gender: "Male"
      })
      CREATE (stromae:Artist {
        mbid: "87b45de6-189f-4318-bc1c-a110a12e84d4",
        name: "Stromae",
        type: "Person",
        country: "BE",
        beginDate: "2000",
        gender: "Male"
      })
      CREATE (angele:Artist {
        mbid: "704b4c79-b1d5-4c0a-ad20-043586c99c85",
        name: "Angèle",
        type: "Person",
        country: "BE",
        beginDate: "2015",
        gender: "Female"
      })
      CREATE (damso:Artist {
        mbid: "8b746d0a-9d62-430c-ab23-f36bc6499c85",
        name: "Damso",
        type: "Person",
        country: "CD",
        beginDate: "2006",
        gender: "Male"
      })
      CREATE (kanye:Artist {
        mbid: "1629c1d9-e93d-4e9f-93d3-a4c3f59fa5d7",
        name: "Kanye West",
        type: "Person",
        country: "US",
        beginDate: "1996",
        gender: "Male"
      })`,

      // 2. Create Genres
      `CREATE (electronic:Genre {name: "electronic"})
      CREATE (pop:Genre {name: "pop"})
      CREATE (hiphop:Genre {name: "hip hop"})
      CREATE (funk:Genre {name: "funk"})
      CREATE (rap:Genre {name: "rap"})`,

      // 3. Associate Genres
      `MATCH (daft:Artist {mbid: "056e6f16-0730-4db2-a8c6-e6308cf26b90"})
      MATCH (pharrell:Artist {mbid: "c72df37b-9442-45e3-99b6-bfd43c7b399b"})
      MATCH (weeknd:Artist {mbid: "c8b03190-ab7e-44d4-9f27-5d12b90984d8"})
      MATCH (stromae:Artist {mbid: "87b45de6-189f-4318-bc1c-a110a12e84d4"})
      MATCH (angele:Artist {mbid: "704b4c79-b1d5-4c0a-ad20-043586c99c85"})
      MATCH (damso:Artist {mbid: "8b746d0a-9d62-430c-ab23-f36bc6499c85"})
      MATCH (kanye:Artist {mbid: "1629c1d9-e93d-4e9f-93d3-a4c3f59fa5d7"})
      MATCH (electronic:Genre {name: "electronic"})
      MATCH (pop:Genre {name: "pop"})
      MATCH (hiphop:Genre {name: "hip hop"})
      MATCH (funk:Genre {name: "funk"})
      MATCH (rap:Genre {name: "rap"})
      CREATE (daft)-[:ASSOCIATED_WITH_GENRE]->(electronic)
      CREATE (daft)-[:ASSOCIATED_WITH_GENRE]->(funk)
      CREATE (pharrell)-[:ASSOCIATED_WITH_GENRE]->(pop)
      CREATE (pharrell)-[:ASSOCIATED_WITH_GENRE]->(funk)
      CREATE (weeknd)-[:ASSOCIATED_WITH_GENRE]->(pop)
      CREATE (weeknd)-[:ASSOCIATED_WITH_GENRE]->(electronic)
      CREATE (stromae)-[:ASSOCIATED_WITH_GENRE]->(pop)
      CREATE (stromae)-[:ASSOCIATED_WITH_GENRE]->(electronic)
      CREATE (angele)-[:ASSOCIATED_WITH_GENRE]->(pop)
      CREATE (damso)-[:ASSOCIATED_WITH_GENRE]->(rap)
      CREATE (damso)-[:ASSOCIATED_WITH_GENRE]->(hiphop)
      CREATE (kanye)-[:ASSOCIATED_WITH_GENRE]->(hiphop)
      CREATE (kanye)-[:ASSOCIATED_WITH_GENRE]->(rap)`,

      // 4. Create Areas
      `CREATE (france:Area {mbid: "277ef94e-28db-3cb1-97b7-66a939fbd0b4", name: "France", type: "Country"})
      CREATE (usa:Area {mbid: "08310650-2f13-3ff0-bf4d-773a4697bf97", name: "United States", type: "Country"})
      CREATE (canada:Area {mbid: "3e0c0926-d3f3-33e3-a6d1-432d56d49ca7", name: "Canada", type: "Country"})
      CREATE (belgium:Area {mbid: "10b98165-2713-3df0-a6d1-a4c3f59fa5d7", name: "Belgium", type: "Country"})
      CREATE (congo:Area {mbid: "19e0b165-2713-3df0-a6d1-a4c3f59fa5d8", name: "Congo-Kinshasa", type: "Country"})`,

      // 5. Associate Areas
      `MATCH (daft:Artist {mbid: "056e6f16-0730-4db2-a8c6-e6308cf26b90"})
      MATCH (pharrell:Artist {mbid: "c72df37b-9442-45e3-99b6-bfd43c7b399b"})
      MATCH (rodgers:Artist {mbid: "87c427f7-b08e-49b0-9944-8cb3cc08e5f3"})
      MATCH (weeknd:Artist {mbid: "c8b03190-ab7e-44d4-9f27-5d12b90984d8"})
      MATCH (stromae:Artist {mbid: "87b45de6-189f-4318-bc1c-a110a12e84d4"})
      MATCH (angele:Artist {mbid: "704b4c79-b1d5-4c0a-ad20-043586c99c85"})
      MATCH (damso:Artist {mbid: "8b746d0a-9d62-430c-ab23-f36bc6499c85"})
      MATCH (kanye:Artist {mbid: "1629c1d9-e93d-4e9f-93d3-a4c3f59fa5d7"})
      MATCH (france:Area {name: "France"})
      MATCH (usa:Area {name: "United States"})
      MATCH (canada:Area {name: "Canada"})
      MATCH (belgium:Area {name: "Belgium"})
      MATCH (congo:Area {name: "Congo-Kinshasa"})
      CREATE (daft)-[:FROM_AREA]->(france)
      CREATE (pharrell)-[:FROM_AREA]->(usa)
      CREATE (rodgers)-[:FROM_AREA]->(usa)
      CREATE (weeknd)-[:FROM_AREA]->(canada)
      CREATE (stromae)-[:FROM_AREA]->(belgium)
      CREATE (angele)-[:FROM_AREA]->(belgium)
      CREATE (damso)-[:FROM_AREA]->(congo)
      CREATE (kanye)-[:FROM_AREA]->(usa)`,

      // 6. Create Recordings & Releases
      `CREATE (getlucky:Recording {
        mbid: "46cc4f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "Get Lucky",
        length: 369000,
        firstReleaseDate: "2013-04-19",
        source: "Seed"
      })
      CREATE (ram:Release {
        mbid: "1232df6e-21ef-4a6c-8df3-b3c6499c85df",
        title: "Random Access Memories",
        date: "2013-05-17",
        country: "XE",
        status: "Official",
        releaseType: "Album"
      })
      CREATE (columbia:Label {
        mbid: "c562e6e3-2191-44eb-a790-db0d5c8a4175",
        name: "Columbia Records",
        country: "US"
      })
      CREATE (getlucky)-[:APPEARS_ON]->(ram)
      CREATE (ram)-[:RELEASED_BY]->(columbia)`,

      `MATCH (ram:Release {mbid: "1232df6e-21ef-4a6c-8df3-b3c6499c85df"})
      MATCH (usa:Area {name: "United States"})
      CREATE (ram)-[:RELEASED_IN]->(usa)`,

      // Starboy
      `CREATE (starboy_track:Recording {
        mbid: "e5784f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "Starboy",
        length: 230000,
        firstReleaseDate: "2016-09-21",
        source: "Seed"
      })
      CREATE (starboy_album:Release {
        mbid: "2232df6e-21ef-4a6c-8df3-b3c6499c85df",
        title: "Starboy",
        date: "2016-11-25",
        country: "US",
        status: "Official",
        releaseType: "Album"
      })
      CREATE (xo:Label {
        mbid: "b562e6e3-2191-44eb-a790-db0d5c8a4175",
        name: "XO",
        country: "US"
      })
      CREATE (starboy_track)-[:APPEARS_ON]->(starboy_album)
      CREATE (starboy_album)-[:RELEASED_BY]->(xo)`,

      // I Feel It Coming
      `MATCH (starboy_album:Release {mbid: "2232df6e-21ef-4a6c-8df3-b3c6499c85df"})
      CREATE (coming_track:Recording {
        mbid: "f5784f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "I Feel It Coming",
        length: 269000,
        firstReleaseDate: "2016-11-17",
        source: "Seed"
      })
      CREATE (coming_track)-[:APPEARS_ON]->(starboy_album)`,

      // Démons
      `CREATE (demons_track:Recording {
        mbid: "75784f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "Démons",
        length: 236000,
        firstReleaseDate: "2021-12-03",
        source: "Seed"
      })
      CREATE (nonante_album:Release {
        mbid: "3232df6e-21ef-4a6c-8df3-b3c6499c85df",
        title: "Nonante-Cinq",
        date: "2021-12-10",
        country: "BE",
        status: "Official",
        releaseType: "Album"
      })
      CREATE (demons_track)-[:APPEARS_ON]->(nonante_album)`,

      // Santé / L'enfer / Bonne Journée
      `CREATE (bonnejournee:Recording {
        mbid: "85784f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "Bonne Journée",
        length: 192000,
        firstReleaseDate: "2022-03-04",
        source: "Seed"
      })
      CREATE (multitude_album:Release {
        mbid: "4232df6e-21ef-4a6c-8df3-b3c6499c85df",
        title: "Multitude",
        date: "2022-03-04",
        country: "FR",
        status: "Official",
        releaseType: "Album"
      })
      CREATE (bonnejournee)-[:APPEARS_ON]->(multitude_album)`,

      // Kanye / Pharrell collabs + Alors on danse remix
      `CREATE (one_track:Recording {
        mbid: "95784f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "Number One",
        length: 220000,
        firstReleaseDate: "2006-07-25",
        source: "Seed"
      })
      CREATE (alorsondanse:Recording {
        mbid: "b5784f85-48b4-4b51-9dfc-2ec08ee1e1cf",
        title: "Alors on danse (remix)",
        length: 214000,
        firstReleaseDate: "2010-08-27",
        source: "Seed"
      })`,

      // 7. Associate Performing Relationships
      `MATCH (daft:Artist {mbid: "056e6f16-0730-4db2-a8c6-e6308cf26b90"})
      MATCH (pharrell:Artist {mbid: "c72df37b-9442-45e3-99b6-bfd43c7b399b"})
      MATCH (rodgers:Artist {mbid: "87c427f7-b08e-49b0-9944-8cb3cc08e5f3"})
      MATCH (weeknd:Artist {mbid: "c8b03190-ab7e-44d4-9f27-5d12b90984d8"})
      MATCH (stromae:Artist {mbid: "87b45de6-189f-4318-bc1c-a110a12e84d4"})
      MATCH (angele:Artist {mbid: "704b4c79-b1d5-4c0a-ad20-043586c99c85"})
      MATCH (damso:Artist {mbid: "8b746d0a-9d62-430c-ab23-f36bc6499c85"})
      MATCH (kanye:Artist {mbid: "1629c1d9-e93d-4e9f-93d3-a4c3f59fa5d7"})
      MATCH (getlucky:Recording {mbid: "46cc4f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      MATCH (starboy_track:Recording {mbid: "e5784f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      MATCH (coming_track:Recording {mbid: "f5784f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      MATCH (demons_track:Recording {mbid: "75784f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      MATCH (bonnejournee:Recording {mbid: "85784f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      MATCH (one_track:Recording {mbid: "95784f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      MATCH (alorsondanse:Recording {mbid: "b5784f85-48b4-4b51-9dfc-2ec08ee1e1cf"})
      CREATE (daft)-[:PERFORMED]->(getlucky)
      CREATE (pharrell)-[:FEATURED_ON]->(getlucky)
      CREATE (rodgers)-[:PERFORMED]->(getlucky)
      CREATE (weeknd)-[:PERFORMED]->(starboy_track)
      CREATE (daft)-[:FEATURED_ON]->(starboy_track)
      CREATE (weeknd)-[:PERFORMED]->(coming_track)
      CREATE (daft)-[:FEATURED_ON]->(coming_track)
      CREATE (angele)-[:PERFORMED]->(demons_track)
      CREATE (damso)-[:FEATURED_ON]->(demons_track)
      CREATE (stromae)-[:PERFORMED]->(bonnejournee)
      CREATE (damso)-[:FEATURED_ON]->(bonnejournee)
      CREATE (pharrell)-[:PERFORMED]->(one_track)
      CREATE (kanye)-[:FEATURED_ON]->(one_track)
      CREATE (stromae)-[:PERFORMED]->(alorsondanse)
      CREATE (kanye)-[:FEATURED_ON]->(alorsondanse)`,

      // 8. Create Collaborated With Relationships
      `MATCH (daft:Artist {mbid: "056e6f16-0730-4db2-a8c6-e6308cf26b90"})
      MATCH (pharrell:Artist {mbid: "c72df37b-9442-45e3-99b6-bfd43c7b399b"})
      MATCH (rodgers:Artist {mbid: "87c427f7-b08e-49b0-9944-8cb3cc08e5f3"})
      MATCH (weeknd:Artist {mbid: "c8b03190-ab7e-44d4-9f27-5d12b90984d8"})
      MATCH (stromae:Artist {mbid: "87b45de6-189f-4318-bc1c-a110a12e84d4"})
      MATCH (angele:Artist {mbid: "704b4c79-b1d5-4c0a-ad20-043586c99c85"})
      MATCH (damso:Artist {mbid: "8b746d0a-9d62-430c-ab23-f36bc6499c85"})
      MATCH (kanye:Artist {mbid: "1629c1d9-e93d-4e9f-93d3-a4c3f59fa5d7"})
      CREATE (daft)-[:COLLABORATED_WITH]->(pharrell)
      CREATE (daft)-[:COLLABORATED_WITH]->(rodgers)
      CREATE (pharrell)-[:COLLABORATED_WITH]->(rodgers)
      CREATE (weeknd)-[:COLLABORATED_WITH]->(daft)
      CREATE (angele)-[:COLLABORATED_WITH]->(damso)
      CREATE (stromae)-[:COLLABORATED_WITH]->(damso)
      CREATE (pharrell)-[:COLLABORATED_WITH]->(kanye)
      CREATE (stromae)-[:COLLABORATED_WITH]->(kanye)`
    ];

    for (let i = 0; i < seedQueries.length; i++) {
      await runQuery(seedQueries[i]);
    }

    console.log('[Seed] Database successfully seeded with 8 connected artists.');
  } catch (error) {
    console.error('[Seed Error] Failed to auto-seed database:', error);
  }
}
