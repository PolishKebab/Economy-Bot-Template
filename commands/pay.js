const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Client = require("..");
const { Bank } = require("../functions");

module.exports={
    module:"main",
    data: new SlashCommandBuilder().setName("pay").setDescription("Send money to another person").setDMPermission(false).addUserOption(option=>
        option.setName("user").setDescription("The user you want to send the money to").setRequired(true)    
    ).addNumberOption(option=>
        option.setName("amount").setDescription("The amount of money you want to send")    
    ),
    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(client,interaction){
        const embed = new EmbedBuilder()
        try{
            await Bank.transfer(interaction.user.id,interaction.options.getUser("user").id,interaction.options.getNumber("amount"))
            embed.setDescription(`Succesfully transfered $${interaction.options.getNumber("amount")} credits from \`${interaction.user.username}\` to \`${interaction.options.getUser("user").username}\``)
            return await interaction.editReply({embeds:[embed]})
        }catch(e){
            embed.setDescription(e.message)
            return await interaction.editReply({embeds:[embed]})
        }
    }
}