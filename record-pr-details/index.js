const { MongoClient } = require('mongodb');
const core = require('@actions/core')

let connection;

async function main () {
  console.log('Recording PR details')

  try {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    const db = process.env.MONGO_DB_URL;
    const dbName = process.env.MONGO_DB_NAME;
    const collection = process.env.MONGO_DB_COLLECTION;
    const serviceVersion = core.getInput('newTag');
  
    await connect(db, dbName);
    await savePRDetails(collection, serviceVersion, event.pull_request);

    return
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

const savePRDetails = async (collection, serviceVersion, pr) => {

  const query = {
    description: pr.body,
    merge_date: new Date(),
    created_by: pr.user.login,
    title: pr.title,
    version: isValidVersionNumber(serviceVersion) ? serviceVersion : null,
  };
  const dbTaskCommand = {
    query,
    collection,
  };

  try {
    await insertOne(dbTaskCommand);
    return;
  } catch (err) {
    console.error(`An error occurred when trying to save PR details: ${String(err)}`)
    process.exit(1);
  }
};

const connect = async (url, db_name) => {

  console.log(url)
  console.log(db_name)

  const link = await MongoClient.connect(url);
  connection = link.db(db_name);
  console.log('Database connection initialised')
  return connection;
};

const insertOne = async (cmd) => {
  console.log(`Inserting record: collection ${cmd.collection}, query ${JSON.stringify(cmd.query)}`)

  const collection = connection.collection(cmd.collection);
  await collection.insertOne(cmd.query);
  return
};

const isValidVersionNumber = (version) => {
  return /v?[0-9]+[.][0-9]+[.][0-9]+/g.test(version);
};


main()