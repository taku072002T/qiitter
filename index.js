import {dotenv} = require("dotenv");
dotenv.config();
import { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a,b)=>a|b)

});

client.on("ready",()=>{
    console.log(`${client.user.tag}でログイン`);


});

client.on("messageReactionAdd",async(reaction, user)=>{
    const message = reaction.message
    const member = message.guild.members.resolve(user)
    const role = message.guild.roles.cache.find(role => role.name === 'TND')
    member.roles.add(role)

    })

client.login(process.env.token)