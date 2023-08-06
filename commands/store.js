const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Client = require("..");
const Store = require("../modules/store/store");
const Inventory = require("../modules/Inventory/inventory");
const { Bank } = require("../functions");
module.exports={
    module:"store",
    data:new SlashCommandBuilder().setName("store").setDescription("A marketplace").addSubcommand(subcommand=>
        subcommand.setName("buy").setDescription("Buy items from the marketplace").addStringOption(option=>
            option.setName("item").setDescription("The item you want to buy").setAutocomplete(true).setRequired(true)
        )
    ).addSubcommand(subcommand=>
        subcommand.setName("items").setDescription("List of items avalible in store")
    ).addSubcommand(subcommand=>
        subcommand.setName("additem").setDescription("Add an item to the store").addStringOption(option=>
            option.setName("name").setDescription("Item name").setRequired(true)
        ).addStringOption(option=>
            option.setName("description").setDescription("Item description").setRequired(true)    
        ).addStringOption(option=>
            option.setName("image").setDescription("Item image link")    
        ).addNumberOption(option=>
            option.setName("price").setDescription("Item price")  
        )
    ).addSubcommand(subcommand=>
        subcommand.setName("removeitem").setDescription("Remove an item from the store").addStringOption(option=>
            option.setName("name").setDescription("Item name").setRequired(true)    
        )
    ).setDMPermission(false),
    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(client,interaction){
        const embed = new EmbedBuilder()
        if(interaction.options.getSubcommand()=="buy"){
            const item = await Store.getItem(interaction.options.getString("item"))
            const user = await Bank.getUser(interaction.user.id)
            if(!item){
                embed.setDescription(`An item with the name \`${interaction.options.getString("item")}\` doesn't exist.`)
                return await interaction.editReply({embeds:[embed]})
            }
            if(user.credits>=item.price){
                await Bank.removeMoney(interaction.user.id,item.price)
                await Inventory.giveItem(interaction.user.id,item.id)
                embed.setDescription(`Added ${item.name} to your inventory.`)
            }else{
                embed.setDescription(`You don't have enough credits to buy ${item.name}`)
            }
            return await interaction.editReply({embeds:[embed]})
        }
        if(interaction.options.getSubcommand()=="items"){
            const items = (await Store.getItems()).slice(0,15);
            if(!items.length){
                embed.setDescription(`It seems like the store is empty.`)
                return await interaction.editReply({embeds:[embed]})
            }
            embed.setDescription(`${items.map(r=>`${r.name} \`${r.description}\` $${r.price}`).join("\n")}`)
            return await interaction.editReply({embeds:[embed]})
        }
        if(interaction.options.getSubcommand()=="additem"){
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
                embed.setDescription("Unauthorized")
                return await interaction.editReply({embeds:[embed]})
            }
            const item = await Store.addItem(interaction.options.getString("name"),interaction.options.getString("description"),interaction.options.getString("image"),interaction.options.getNumber("price"))
            embed.setTitle(item.name+" $"+item.price)
            embed.setDescription(item.description)
            interaction.options.getString("image")?embed.setThumbnail(item.image):"";
            return await interaction.editReply({embeds:[embed]})
        }
        if(interaction.options.getSubcommand()=="removeitem"){
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
                embed.setDescription("Unauthorized")
                return await interaction.editReply({embeds:[embed]})
            }
            const item = await Store.getItem(interaction.options.getString("name"))
            if(!item){
                embed.setDescription("Can't remove a non-existing item")
                return await interaction.editReply({embeds:[embed]})
            }
            await Store.removeItem(item.name)
            embed.setDescription(`Removed ${item.name} from the store`)
            return await interaction.editReply({embeds:[embed]})
        }
    }
}