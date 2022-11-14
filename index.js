const main = () => {

  console.log("this is a test logging statement")

  const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

  // const messages = event.commits ? event.commits.map((commit) => commit.message + '\n' + commit.body) : [];

  console.log(event)
}

main()