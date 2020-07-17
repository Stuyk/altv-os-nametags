/// <reference types="@altv/types-client" />
import alt from 'alt-client';
import * as native from 'natives';

let hideNametagsInVehicle = false;
let showBarsOnAim = true;
let drawDistance = 100;
let showNametags = false;
let validPlayers = [];
let interval;

alt.onServer('nametags:Config', handleConfig);

/**
 * @param  {Boolean} _showNametags
 * @param  {Boolean} _hideNamesInVehicles
 * @param  {Boolean} _hideHealthBars
 * @param  {Boolean} _hideArmourBars
 * @param  {Number} _maxDrawDistance
 */
function handleConfig(_showNametags, _hideNamesInVehicles, _showBarsOnAim, _maxDrawDistance) {
    showNametags = _showNametags;
    hideNametagsInVehicle = _hideNamesInVehicles;
    showBarsOnAim = _showBarsOnAim;
    drawDistance = _maxDrawDistance;

    if (!showNametags) {
        if (interval) {
            alt.clearInterval(interval);
        }

        interval = null;
        return;
    }

    interval = alt.setInterval(drawNametags, 0);
}

/**
 * Toggled on through an interval.
 */
function drawNametags() {
    if (alt.Player.local.getSyncedMeta('STOP_DRAWS')) {
        return;
    }

    updatePlayerNames();

    if (validPlayers.length <= 0) {
        return;
    }

    for (let i = 0; i < validPlayers.length; i++) {
        const target = validPlayers[i];
        const pos = { ...native.getPedBoneCoords(target.instance.scriptID, 12844, 0, 0, 0) };
        pos.z += 0.75;

        let fontSize = 0.4 - target.dist * 0.01;
        if (fontSize > 0.4) {
            fontSize = 0.4;
        }

        if (fontSize < 0.08) {
            fontSize = 0.08;
        }

        const entity = target.instance.vehicle ? target.instance.vehicle.scriptID : target.instance.scriptID;
        const vector = native.getEntityVelocity(entity);
        const frameTime = native.getFrameTime();
        let x = pos.x + vector.x * frameTime;
        let y = pos.y + vector.y * frameTime;
        let z = pos.z + vector.z * frameTime;

        // Names
        native.setDrawOrigin(x, y, z + fontSize, 0);
        native.beginTextCommandDisplayText('STRING');
        native.setTextFont(4);
        native.setTextScale(fontSize, fontSize);
        native.setTextProportional(true);
        native.setTextCentre(true);
        native.setTextColour(255, 255, 255, 255);
        native.setTextOutline();
        native.addTextComponentSubstringPlayerName(target.name);
        native.endTextCommandDisplayText(0, 0);
        native.clearDrawOrigin();

        const lineHeight = native.getTextScaleHeight(fontSize, 4);
        const fullWidth = 0.1 * (fontSize * 2);
        const [foundEntity, aimingAtPed] = native.getEntityPlayerIsFreeAimingAt(
            alt.Player.local.scriptID,
            target.instance.scriptID
        );

        if (showBarsOnAim && foundEntity && aimingAtPed === target.instance.scriptID) {
            const health = native.getEntityHealth(target.instance.scriptID) - 100;
            const healthWidth = (health / 100) * 0.1 * (fontSize * 2);
            native.setDrawOrigin(x, y, z + fontSize, 0);
            native.drawRect(
                (0 - (fullWidth - healthWidth)) / 2,
                lineHeight * 2,
                healthWidth,
                lineHeight / 2,
                255,
                0,
                0,
                255,
                true
            );

            const armour = native.getPedArmour(target.instance.scriptID);
            const armourWidth = (armour / 100) * 0.1 * (fontSize * 2);
            native.setDrawOrigin(x, y, z + fontSize, 0);
            native.drawRect(
                (0 - (fullWidth - armourWidth)) / 2,
                lineHeight * 2.75,
                armourWidth,
                lineHeight / 2,
                190,
                250,
                255,
                255,
                true
            );
        }
    }
}

/**
 * Update
 */
function updatePlayerNames() {
    validPlayers = [];

    const players = [...alt.Player.all];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (!player.valid) {
            continue;
        }

        if (hideNametagsInVehicle) {
            if (player.vehicle && alt.Player.local.vehicle !== player.vehicle) {
                continue;
            }
        }

        const los = native.hasEntityClearLosToEntity(alt.Player.local.scriptID, player.scriptID, 17);
        if (!los) {
            continue;
        }

        const dist = distance2d(player.pos, alt.Player.local.pos);
        if (dist > drawDistance) {
            continue;
        }

        if (player.scriptID === alt.Player.local.scriptID) {
            continue;
        }

        const name = player.getSyncedMeta('NAME');
        if (!name) {
            continue;
        }

        const isChatting = player.getSyncedMeta('CHATTING');
        validPlayers.push({ name: isChatting ? `${name}~r~*` : `${name}`, dist, instance: player });
    }
}

/**
 * @param  {alt.Vector3} vector1
 * @param  {alt.Vector3} vector2
 */
function distance2d(vector1, vector2) {
    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2));
}
