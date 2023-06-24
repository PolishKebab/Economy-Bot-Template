const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const Client = require("..");
const { Bank } = require("../functions");
module.exports={
    data:new SlashCommandBuilder().setName("balance").setDescription("Check someones account balance").addUserOption(option=>
        option.setName("user").setDescription("The user you want to check the balance of").setRequired(false)
    ).setDMPermission(false),
    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(client,interaction){
        const embed = new EmbedBuilder()
        const user = interaction.options.getUser("user")||interaction.user;
        let data = await Bank.getUser(user.id)
        if(!data){
            data = await Bank.addUser(interaction.user.id,0)
        }
        embed.setAuthor({name:user.username,iconURL:user.displayAvatarURL()})
        embed.setDescription(`Balance: $${data.credits}`)
        return await interaction.editReply({embeds:[embed]})
    }
}