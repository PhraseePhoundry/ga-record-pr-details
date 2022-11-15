const main = () => {

  console.log("record initial details")
  console.log("this is a test logging statement")

  const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

  console.log('----------------------------------------------------------')
  console.log(event)
  console.log('**********************************************************')
  console.log(event.pull_request)

}

main()