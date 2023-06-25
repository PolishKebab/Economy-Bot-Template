const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require("discord.js");
const Client = require("..");
const { Bank } = require("../functions");
module.exports={
    module:"main",
    data:new SlashCommandBuilder().setName("leaderboard").setDescription("Check the balance leaderboard").setDMPermission(false),
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async execute(client,interaction){
        const leaderboard = await Bank.getLeaderboard();
        const embed = new EmbedBuilder().setDescription(leaderboard.map(r=>`<@${r.id}> $${r.credits}`).join("\n"))
        return await interaction.editReply({embeds:[embed]})
    }
}