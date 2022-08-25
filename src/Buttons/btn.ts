import {Button} from "../structures/Button";

export default new Button({
    name : "something",
    async run({client , interaction}){
        await interaction.reply({content : "Hey !" , ephemeral : true})
    }
})