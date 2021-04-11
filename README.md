# Open Source - Nametags

[❤️ Become a Sponsor of my Open Source Work](https://github.com/sponsors/Stuyk/)

[⌨️ Learn how to script for alt:V](https://altv.stuyk.com/)

⭐ This repository if you found it useful!

---

![](https://i.imgur.com/vvkbD90.jpg)

# Description

This repository provides a simple nametag system with optional health bars and armour bars. As well as hiding nametags when players are inside of vehicles. This nametag system scales based on distance as well as checks if you have direct line of sight with the opposing players.

Nametags can be toggled completely off or on for a single player.

## Installing Dependencies / Installation

**I cannot stress this enough. Ensure you have NodeJS 13+ or you will have problems.**

-   [NodeJS 13+](https://nodejs.org/en/download/current/)
-   An Existing or New Gamemode
-   General Scripting Knowledge

After simply add the name of this resource to your `server.cfg` resource section.

`altv-os-nametags`

Then simply clone this repository into your main server resources folder.

```
cd resources
git clone https://github.com/Stuyk/altv-os-nametags
```

Ensure your `package.json` includes this property:

```json
"type": "module"
```

# Adding Custom Names to Players

The custom names are automatically synced once you set the synced meta.
However, they will not show until you set a configuration on the player.

### Example

```js
alt.on('playerConnect', player => {
    player.setSyncedMeta('NAME', 'Johnny_Delgado');
});
```

# Configuring Player's Nametags

Setting the configuration takes the following properties.

| Argument              | Description                                                              |
| --------------------- | ------------------------------------------------------------------------ |
| `player`              | Pass the alt.Player from any event.                                      |
| `showNameTags`        | Let the player draw all nametags of all players locally.                 |
| `hideNamesInVehicles` | Hide the nametags of players in vehicles if you're not in their vehicle. |
| `showBarsOnAim`       | Show Health and Armour Bars when you are aiming at a player.             |
| `maxDrawDistance`     | Set the maximum draw distance for nametags. Default: 100                 |

### Example

```js
alt.on('playerConnect', player => {
    player.setSyncedMeta('NAME', 'Johnny_Delgado');
    alt.emit('nametags:Config', player, true, false, true, 100);
});
```

# Other alt:V Open Source Resources

-   [Authentication by Stuyk](https://github.com/Stuyk/altv-os-auth)
-   [Discord Authentication by Stuyk](https://github.com/Stuyk/altv-discord-auth)
-   [Global Blip Manager by Dzeknjak](https://github.com/jovanivanovic/altv-os-global-blip-manager)
-   [Global Marker Manager by Dzeknjak](https://github.com/jovanivanovic/altv-os-global-marker-manager)
-   [Chat by Dzeknjak](https://github.com/jovanivanovic/altv-os-chat)
