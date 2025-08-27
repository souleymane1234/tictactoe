import webpack from "webpack"
import DevServer from "webpack-dev-server"
import chalk from "chalk"

import devConfig from "./config/webpack.dev"
import { HOST, PORT } from "./webpack-consts"

const compiler = webpack(devConfig);

const server = new DevServer({
	host: HOST,
	port: PORT,
	open: false,
	liveReload: true,
	historyApiFallback: true,
	client: {
		logging: "warn",
		overlay: true,
	},
	static: {
		directory: require('path').join(__dirname, '../public'),
	},
}, compiler)

server.start(PORT, HOST, () => {
	console.log(
		`${chalk.blueBright("SERVER LISTENING ON")} ${chalk.blueBright(`http://${HOST}:${PORT}`)}
		`
	)
})

const logInternalIPs = async () => {
  const localIPv4 = await DevServer.internalIP('v4');
  console.log('Local IPv4 address:', localIPv4);
};

logInternalIPs();
