# Economy-Bot-Template #
## Template for a discord economy bot
### Commiting to the project
This project is opensource, feel free to adding modules, documentation or upgrading my code, just send a merge request and I'll review it.
### FAQ
1. I want to use this template for my own bot, but I don't know if it's allowed.
>You can use the template as long as you credit the creator of it, so just don't delete  or edit the "Made by:..." comments.
2. Is the project opensource?
>Yes.
### Usage
1. Clone this repository to your local computer
```cmd
git clone https://github.com/PolishKebab/Economy-Bot-Template
```
2. Download [Node.js](https://nodejs.org/en) version 18.7 and higher
3. Create a npm project inside the folder and install all needed modules
```cmd
npm init -y
npm i
```
4. Configure `config.json`
```json
{
    "token":"Bot token here", // Insert your discord bot token here
    "modules":{ // change module to true to enable, or false to disable
      "main":true, // main module, it gives access to the admin,balance and leaderboard commads 
      "messageEarn":false, // module that rewards users for sending messages
      "poke":false, // module for Poketwo and Pokestats bots 
      "store":false, // module that allows users to buy items from the store
      "API":false, // module for web access to bot, allowing to view user data via website
      "Authentication":false // module for authentication, it is needed for the API module
      }
}
```
5. Run the bot
```node
node index.js
```
6. Enjoy.
