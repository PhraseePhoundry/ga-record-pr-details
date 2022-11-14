const main = () => {

  console.log("update details")
  console.log("this is a test logging statement")

  const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

  console.log(event.pull_request)

}

main()