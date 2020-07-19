/// <reference types="@altv/types-server" />
import alt from 'alt-server';

alt.on('nametags:Config', handleConfig);

/**
 * @param  {alt.Player} player
 * @param  {Boolean} showNametags Draw nametags for all players for player?
 * @param  {Boolean} hideNamesInVehicles=false
 * @param  {Boolean} showBarsOnAim=false
 * @param  {Number} maxDrawDistance=100
 */

function handleConfig(player, showNametags = true, hideNamesInVehicles = false,
                      showBarsOnAim = false, maxDrawDistance = 25) {
    alt.emitClient(player, 'nametags:Config', showNametags, hideNamesInVehicles, showBarsOnAim, maxDrawDistance);
}

// Default display nametag as the name setup in altv, replace it if you want to display your own roleplay name
alt.on('playerConnect', (player) => {
    player.setSyncedMeta('NAME', player.name);
    alt.emit('nametags:Config', player, true, false, true, 25)
})
