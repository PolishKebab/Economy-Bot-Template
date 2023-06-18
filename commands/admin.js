const Client = require("../index.js");
const {ChatInputCommandInteraction,SlashCommandBuilder, EmbedBuilder} = require("discord.js")
const {Bank} = require("../functions")
module.exports={
    data: new SlashCommandBuilder().setName("admin").setDescription("Admin configuration command").addSubcommand(subcommand=>
        subcommand.setName("givemoney").setDescription("Give money to a user").addUserOption(option=>
            option.setName("user").setDescription("User to give the money to").setRequired(true)
        ).addNumberOption(option=>
            option.setName("amount").setDescription("Amount of credits to give").setRequired(true)
        )
    ).addSubcommand(subcommand=>
        subcommand.setName("removemoney").setDescription("Remove money from a user").addUserOption(option=>
            option.setName("user").setDescription("User to remove the money from").setRequired(true)
        ).addNumberOption(option=>
            option.setName("amount").setDescription("Amount of credits to remove").setRequired(true)
        )
    ).addSubcommand(subcommand=>
        subcommand.setName("setmoney").setDescription("Set the money of a user").addUserOption(option=>
            option.setName("user").setDescription("User to set the money to").setRequired(true)
        ).addNumberOption(option=>
            option.setName("amount").setDescription("Amount of credits to set the money to").setRequired(true)    
        )    
    ).setDMPermission(false),
    /**
    * @param {Client} client 
    * @param {ChatInputCommandInteraction} interaction 
    */
    async execute(client,interaction){
        const embed = new EmbedBuilder();
        try{
            let user;
            if(interaction.options.getSubcommand()=="givemoney"){
                user = await Bank.addMoney(interaction.options.getUser("user").id,interaction.options.getNumber("amount"))
            }
            if(interaction.options.getSubcommand()=="removemoney"){
                user = await Bank.removeMoney(interaction.options.getUser("user").id,interaction.options.getNumber("amount"))
            }
            if(interaction.options.getSubcommand()=="setmoney"){
                user = await Bank.setMoney(interaction.options.getUser("user").id,interaction.options.getNumber("amount"))
            }
            embed.setDescription(`Successfully updated ${interaction.guild.members.cache.get(user.id).username}'s balance to ${user.credits}.`)
        }catch(e){
            embed.setDescription("An error has appereared")
            return await interaction.editReply({embeds:[embed]})
        }

    }

}