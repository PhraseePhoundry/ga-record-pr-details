const { MongoClient } = require('mongodb');
const core = require('@actions/core')

// let connection;

async function main () {
  console.log('Recording PR details')

  try {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    const db = process.env.MONGO_DB_URL;
    const dbName = process.env.MONGO_DB_NAME;
    const collection = process.env.MONGO_DB_COLLECTION;
    const serviceVersion = core.getInput('newTag');
  
    const mongoClient = await MongoClient.connect(db);
    const connection = mongoClient.db(dbName);
    console.log('Database connection initialised')
    const newRecord = await savePRDetails(connection, collection, serviceVersion, event.pull_request);


    if (newRecord) {
      console.log('Successfully saved pull request details');
      mongoClient.close()
      return
    }

    console.log('Failed to insert new record')
    process.exit(78)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const savePRDetails = async (connection, collection, serviceVersion, pr) => {

  const query = {
    description: pr.body,
    merge_date: new Date(),
    created_by: pr.user.login,
    title: pr.title,
    repository: pr.base.repo.name,
    pr_url: pr.url,
    version: isValidVersionNumber(serviceVersion) ? serviceVersion : null,
  };
  const dbTaskCommand = {
    query,
    collection,
  };

  try {
    return await insertOne(connection, dbTaskCommand);
  } catch (err) {
    console.error(`An error occurred when trying to save PR details: ${String(err)}`)
    process.exit(1);
  }
};


const insertOne = async (connection, cmd) => {
  console.log(`Inserting record: collection ${cmd.collection}, query ${JSON.stringify(cmd.query)}`)

  const collection = connection.collection(cmd.collection);
  const insert = await collection.insertOne(cmd.query);
  return insert.insertedId ? [true, insert.insertedId] : [false, null];
};

const isValidVersionNumber = (version) => {
  return /v?[0-9]+[.][0-9]+[.][0-9]+/g.test(version);
};


main()