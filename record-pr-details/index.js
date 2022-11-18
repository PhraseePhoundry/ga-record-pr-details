const { MongoClient } = require('mongodb');
const phraseeLogger = require('@phrasee/phrasee-logger');
const core = require('@actions/core')
phraseeLogger.init();

let connection;

async function main () {
  phraseeLogger.info({
    msg: 'Recording PR details',
  });

  try {
    const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

    const db = process.env.DB_URL;
    const dbName = process.env.DB_NAME;
    const collection = process.env.DB_COLLECTION;
    const serviceVersion = core.getInput('newTag');
  
    await connect(db, dbName);
    await savePRDetails(collection, serviceVersion, event.pull_request)

    return
  } catch (err) {
    console.error(error)
    process.exit(1)
  }
}

export const savePRDetails = async (collection, serviceVersion, pr) => {

  const query = {
    description: pr.body,
    merge_date: pr.date,
    created_by: pr.user.login,
    title: pr.title,
    version: isValidVersionNumber(serviceVersion) ? serviceVersion : null,
  };
  const dbTaskCommand = {
    query,
    collection,
  };

  try {
    const newRecord = await insertOne(dbTaskCommand);
    return newRecord;
  } catch (err) {
    phraseeLogger.error({
      msg: 'An error occurred when attempting to save PR details',
      err,
    });
    process.exit(1);
  }
};

const connect = async (url, db_name) => {

  const link = await MongoClient.connect(
    url,
    { useNewUrlParser: true },
  );
  connection = link.db(db_name);
  phraseeLogger.debug({ msg: 'Database connection initiated' });
  return connection;
};

const insertOne = async (cmd) => {
  phraseeLogger.debug({
    msg: `insertOne : Collection ${cmd.collection} Query ${JSON.stringify(
      cmd.query,
    )}`,
  });

  const collection = connection.collection(cmd.collection);
  const insert = await collection.insertOne(cmd.query);
  return insert.insertedId ? [true, insert.insertedId] : [false, null];
};

const isValidVersionNumber = (version) => {
  return /v?[0-9]+[.][0-9]+[.][0-9]+/g.test(version);
};


main()