require('dotenv').config();

const fs = require("fs");
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = ".";

// array of all commands and embeds, normally that should be a .json somewhere but im lazy
var embedArr = [];
// array of command names and links to images, to be later stored in a .json file
var linkArr = [];

let rawData = fs.readFileSync('commands.json');
if(rawData.length != 0)											// on first boot the .json is likely to be empty
	linkArr = JSON.parse(rawData);


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
    for (var i = 0; i < linkArr.length; i++) {					// rebuild the embed array from the .json file 
		var temp = new Discord.MessageEmbed();
		temp.setImage(linkArr[i].link);
		embedArr.push({ name: linkArr[i].name, embed: temp });
	}
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
    for (var i = 0; i < embedArr.length; i++) {
        if (embedArr[i].name == strName) {
			embedArr[i].embed.setImage(strLink);
			linkArr[i].link = strLink;
			return true;
        }
	}
	return false;
}

function search(strName) {
    for (var i = 0; i < embedArr.length; i++)
        if (embedArr[i].name == strName) 
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

		if (isValidHttpUrl(args[1])) {
			if (doesExist(args[0], args[1]))
				message.channel.send("Link replaced");

			else {
				var temp = new Discord.MessageEmbed();
				temp.setImage(args[1]);
				embedArr.push({ name: args[0], embed: temp });
				linkArr.push({ name: args[0], link: args[1] });
			}
			// write JSON string to a file
			// yes i do rewrite the entire json upon adding a new command but who cares
			fs.writeFileSync('commands.json', JSON.stringify(linkArr, null, 4), (err) => {		 // 2 last parameters in stringify make json look "pretty"
				if (err) {
					throw err; 
				}
				console.log("JSON data is saved.");
			});
		}
			else
				message.channel.send("Invalid link");

	}
	else if (search(command) != -1) 
		message.channel.send(embedArr[search(command)].embed);

});


client.login(process.env.DISCORD_TOKEN);
