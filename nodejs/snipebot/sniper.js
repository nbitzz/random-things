const Discord = require("discord.js")
let intents = new Discord.Intents()
let m = `GUILDS
GUILD_MEMBERS
GUILD_BANS
GUILD_EMOJIS_AND_STICKERS
GUILD_INTEGRATIONS
GUILD_WEBHOOKS
GUILD_INVITES
GUILD_VOICE_STATES
GUILD_PRESENCES
GUILD_MESSAGES
GUILD_MESSAGE_REACTIONS
GUILD_MESSAGE_TYPING
DIRECT_MESSAGES
DIRECT_MESSAGE_REACTIONS
DIRECT_MESSAGE_TYPING`
m.split("\n").forEach((v) => intents.add(v))
const client = new Discord.Client({intents:intents});
const fs = require("fs");
let snipes = []

/*
* Data
*/

fs.readFile("botSnipes.json",(err,buf) => {
    if (!err) {
        // Make sure that we don't overwrite previous snipes
        JSON.parse(buf.toString()).forEach((v,x) => {
            snipes.push(v)
        })
    } else {
        console.error(err)
    }
})
fs.readFile("BOTSNIPER_TOKEN.txt",(err,buf) => {
    client.login(buf.toString());
})

/*
* Command interpreter
*/
let cools = {}
const StartCooldown = function(userid,cmdid) {
    let cm = commands.find(e => e.id == cmdid) 
    if (cm) {
      //let dt = new Date()
      if (cools[userid]) {
        cools[userid][cmdid] = Date.now()+(cm.cooldown*1000)
      } else {
        cools[userid] = {[cmdid]:Date.now()+(cm.cooldown*1000)}
      }
    } else {
      console.log(`Cooldown for ${cmdid} not found.`)
    }
  }
  
  const IsCooldownReady = function(userid,cmdid) {
    let cm = commands.find(e => e.id == cmdid) 
    if (cm) {
      //let dt = new Date()
      if (cools[userid]) {
        if (cools[userid][cmdid]) {
          if (Date.now() >= cools[userid][cmdid]) {
            return true
          } else {return (cools[userid][cmdid]-Date.now())/1000}
        } else {
          return true
        }
      } else {
        return true
      }
    } else {
      console.log(`Cooldown for ${cmdid} not found.`)
    }
  }
let prefix = ">"

let perms = {
    "312700896343621633":6
}

let GenerateSnipeEmbed = function(snipe) {
    let snipePlaintext = []
    snipe.History.forEach((v,x) => {
        snipePlaintext.push(`${v.name} ${v.content}`)
    })
    return new Discord.MessageEmbed()
    .setTitle(`Snipe: ${snipe.id}`)
    .setAuthor(`${snipe.UserTag} (${snipe.UserId})`)
    .setDescription(`\`\`\`\n${snipePlaintext.join("\n").replace(/`/g,"'")}\`\`\``)
}

var commands = [
    {names:["help","cmds"], id:"utility.help", desc: "Check commands.", cooldown:1.5, level:0, args:1, action:function(message,args) {
      if (args.length == 0) {
      /*let desc = ""
      for (let i = 0; i < commands.length; i++) {
        let ava = "?"
        let notice = `✔ You can run this command. (${commands[i].level})`
        if ((perms[message.author.id] || 0) < commands[i].level) {
          ava = "-"
          notice = `❌ You can't run this command. (${commands[i].level})`
        }
        desc = desc + `[${ava}]("${commands[i].desc}\n\n${commands[i].names.join(", ")}\n${commands[i].id}\n${notice}") ${commands[i].names[0]}\n`
      }*/
      let desc = []
      for (let i = 0; i < commands.length; i++) {
      desc.push(commands[i].names[0])
      }
      let Emb = new Discord.MessageEmbed().setTitle("Commands").setDescription(desc.join(", ")).setFooter("Use \".help (command)\" to view more info.")
      message.channel.send({embeds:[Emb]})
      } else {
        let foundCMD = commands.find(e => e.names.find(l => l == (args[0] || "").toLowerCase()))
        if (foundCMD) {
          let ava = "?"
        let notice = `🟩 You can run this command. (${foundCMD.level})`
        let colorrrr = "#00ff96"
        let requires = ""
        if ((perms[message.author.id] || 0) < foundCMD.level) {
          ava = "-"
          notice = `🟥 You can't run this command. (${foundCMD.level})`
          colorrrr = "#ff0066"
        }
          if (foundCMD.requires) {
            requires = `\nRequirements: \`\`${foundCMD.requires.join(", ")}\`\``
            if (!((perms[message.author.id] || 0) < foundCMD.level)) {
            notice = `🟨 You may not be able to run this command (requirements are not accounted for).`
            colorrrr = "#fff200"
            }
          }
          let Emb = new Discord.MessageEmbed().setTitle(foundCMD.names[0]).setDescription(`${foundCMD.desc}\n\n${foundCMD.names.join(", ")}\n${foundCMD.id}${requires}\n${notice}`).setColor(colorrrr)
          message.channel.send({embeds:[Emb]})
        }
      }
    }},
    {names:["snipe"], id:"utility.snipe", desc: "Snipe the previous message, snipe a message ID, or get a previous snipe.", cooldown:1.5, level:0, args:1, action:function(msg,args) {
        if (args.length == 0 && snipes.length != 0) {
            msg.channel.send({embeds:[GenerateSnipeEmbed(snipes[snipes.length-1])]})
        } else if (snipes.find(e => e.id.toString() == args[0])) {
            msg.channel.send({embeds:[GenerateSnipeEmbed(snipes.find(e => e.id.toString() == args[0]))]})
        } else if (snipes[snipes.length-(1+(parseInt(args[0],10) || Infinity))]) {
            msg.channel.send({embeds:[GenerateSnipeEmbed(snipes[snipes.length-(1+(parseInt(args[0],10)))])]})
        } else {
            msg.channel.send(`Sorry, we couldn't get a snipe for that. (There are currently ${snipes.length} snipes in the database. Try sniping one of those.)`)
        }
    }},
    {names:["clearsnipe"], id:"utility.clearsnipe", desc: "Clear all snipes.", cooldown:1.5, level:5, args:0, action:function(msg,args) {
      msg.channel.send({
        content:"Are you sure you want to clear all snipes?",
        components:[
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton().setStyle("DANGER").setEmoji("✖").setLabel("Yes, I want to clear all snipes").setCustomId("clearsnipe")
          )
        ]
      }).then(nmsg => {
      let filter = (x) => {return nmsg.id == x.message.id}
      let collector = msg.channel.createMessageComponentCollector({ filter, componentType:"BUTTON", time: 15000 });
      collector.on('collect', i => {
        if (i.user.id === msg.author.id) {
          snipes = []
          fs.writeFileSync("botSnipes.json",JSON.stringify(snipes))
          msg.reply({ content: `Snipes have been cleared.` }).then(() => {
          collector.stop()
          })
        } else {
          i.reply({ content: `no`, ephemeral: true });
        }
    });
  })
  }},
  {names:["search","find"], id:"utility.search", desc: "Search for snipes containing a string.", cooldown:7.5, level:0, args:1, action:function(msg,args) {
    if (args.length == 0) {
        msg.channel.send(`Please specify a query.`)
    } else if (snipes.filter(e => !!e.History.find(a => a.content.toLowerCase().includes(args[0].toLowerCase()))).length > 0) {
        let results = snipes.filter(e => !!e.History.find(a => a.content.toLowerCase().includes(args[0].toLowerCase()))).slice(0,10)
        let msgsoptions = []
        results.forEach((v,x) => {
          msgsoptions.push({label:`${v.id} by ${v.UserTag} (${v.UserId})`,value:v.id.toString(),description:v.History.find(a => a.content.toLowerCase().includes(args[0].toLowerCase())).content})
        })
        msg.channel.send({content:`Found ${results.length} results for \`${args[0]}\` (capped to 10). Select one below.`,
        components:[
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageSelectMenu().setOptions(...msgsoptions).setCustomId(Math.random().toString())
          )
        ]}).then(nmsg => {
        let filter = (x) => {return nmsg.id == x.message.id}
      let collector = msg.channel.createMessageComponentCollector({ filter, time: 20000 });
      collector.on('collect', i => {
        if (i.user.id === msg.author.id) {
          console.log(i.values)
          nmsg.edit({embeds:[GenerateSnipeEmbed(snipes.find(e => e.id == i.values[0]))],content:"Result:",components:[]})
          i.deferUpdate()
          collector.stop()
        } else {
          i.reply({ content: `no`, ephemeral: true });
        }
        
    });
  })
    } else {
        msg.channel.send(`Sorry, we couldn't find a snipe for that.`)
    }
}},
]

client.on("messageCreate",(msg) => {
    if (msg.author.bot) {
        return
    }
    if (!msg.channel.type == "DMChannel") {
        return
    }
    let args_tmp = msg.content.split(" ")
  let cmd_tmp = args_tmp[0]
  args_tmp.splice(0,1)
  let prefo = prefix
  if (cmd_tmp.toLowerCase().startsWith(prefo)) {
    let cmd = cmd_tmp.slice(prefo.length).toLowerCase() // Command
    let cmdvv = commands.find(e => e.names.find(b => b == cmd)) // Find command
    if (cmdvv) {
      let args = []
      for (let i = 0; i < cmdvv.args-1; i++) {
        if (args_tmp[0]) {
        args.push(args_tmp[0]) // Add args
        args_tmp.splice(0,1) // Remove
        }
      }
      if (args_tmp.length > 0) {
      args.push(args_tmp.join(" ")) // Add rest combined.
      }
      if ((perms[msg.author.id] || 0) >= cmdvv.level && (!msg.author.bot || msg.author.id == "692501444926111856" || msg.author.id == "695466830260731935")) { // Check admin level and check for bots
      if (IsCooldownReady(msg.author.id,cmdvv.id) == true) { // Check if cooldown ready.
        StartCooldown(msg.author.id,cmdvv.id) // Start cooldown
        cmdvv.action(msg,args)
      } else {
        let Emb = new Discord.MessageEmbed().setTitle("Woah, slow it down there").setDescription(`Wait \`\`${IsCooldownReady(msg.author.id,cmdvv.id)}s\`\` before using this command again.`)
        //msg.channel.send(`**Woah, slow it down there**\nWait \`\`${IsCooldownReady(msg.author.id,cmdvv.id)}s\`\` before trying again.`)
        msg.channel.send({embeds:[Emb]})
      }
    } else {
      if ((perms[msg.author.id] || 0) > -1){
        let Emb = new Discord.MessageEmbed().setTitle("No.").setDescription(`This command requires admin level ${cmdvv.level} (your level is ${(perms[msg.author.id] || 0)})`)
        //msg.channel.send(`**Woah, slow it down there**\nWait \`\`${IsCooldownReady(msg.author.id,cmdvv.id)}s\`\` before trying again.`)
        msg.channel.send({embeds:[Emb]})
      }
      }
    }
  }
})

client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
	let command = interaction.customId.split(".")
    switch(command[0]) {

        default:
        interaction.deferUpdate();
    }
});

/*
* Sniper
*/
let Sniper = {
    History: (Id,authorID,authortag) => {
        let rawx = snipes.find(e => e.id == Id)
        let x = rawx || {id:Id,History:[],UserId:authorID,UserTag:authortag}
        if (!rawx) {
            return {History:x,Position:snipes.length}
        } else {
            return {History:x,Position:snipes.findIndex(e => e.id == Id)}
        }
    },
    AddSnipeHistory: (Type,Name,Id,Content,authorID,authortag) => {
        let newMsgX = Sniper.History(Id,authorID,authortag)
        switch(Type) {
            case "BASIC":

                if (newMsgX) {
                    newMsgX.History.History.push(
                        {
                            name: Name,
                            content: Content
                        }
                    )
                }
                 break               
            case "ORIGINAL":

            if (!newMsgX.History.History.find(e => e.name == "ORIGINAL")) {
                Sniper.AddSnipeHistory("BASIC","ORIGINAL",Id,Content)
            }
            break
            default:
                console.error(`AddSnipeHistory: Invalid type ${Type}. Use BASIC or ORIGINAL`)
        }
        snipes[newMsgX.Position] = newMsgX.History
        fs.writeFileSync("botSnipes.json",JSON.stringify(snipes))
    }
}
client.on("messageDelete",(msg) => {
    // Add a snipe.
    Sniper.AddSnipeHistory("BASIC","DELETE  ",msg.id,msg.content,msg.author.id,msg.author.tag)
})
client.on("messageUpdate",(oldM,newM) => {
    // Must only be a snipe. Check for anything with a previous message id.
    // If not, make a new thing w/ message history.
    Sniper.AddSnipeHistory("ORIGINAL","ORIGINAL",oldM.id,oldM.content,oldM.author.id,oldM.author.tag)
    Sniper.AddSnipeHistory("BASIC","EDIT    ",newM.id,newM.content,oldM.author.id,oldM.author.tag)
})

/*
* Debug
*/

client.on("ready",() => {
    console.log("Bot ready")
})
