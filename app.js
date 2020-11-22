require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = ".";

// array of all commands and embeds, normally that should be a .json somewhere but im lazy
var arr = [];

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

function isValidHttpUrl(str) {
	let url;

	try {
		url = new URL(str);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}

function doesExist(strName, strLink) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].name == strName) {
			arr[i].embed.setImage(strLink);
			return true;
        }
	}
	return false;
}

function search(strName) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i].name == strName) 
			return i;
	return -1;
}

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

    if (command == "add") {
		if (args.length < 2) {
			message.channel.send("Provide a name and a link to an image");
			return;
		}
		else

			// workaround for links without embedding 
			if (args[1][0] == '<' && args[1][args[1].length - 1] == '>')
				args[1] = args[1].slice(1, -1);

			if (isValidHttpUrl(args[1]))
				if (doesExist(args[0], args[1])) 
					message.channel.send("Link replaced");

				else {
					var temp = new Discord.MessageEmbed();
					temp.setImage(args[1]);
					arr.push({ name: args[0], embed: temp });
				}
			else
				message.channel.send("Invalid link");

	}
	else if (search(command) != -1) 
		message.channel.send(arr[search(command)].embed);
});


client.login(process.env.DISCORD_TOKEN);