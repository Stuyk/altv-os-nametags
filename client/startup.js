/// <reference types="@altv/types-client" />
import alt from 'alt-client';
import * as native from 'natives';

let hideNametagsInVehicle = false;
let showBarsOnAim = true;
let drawDistance = 100;
let showNametags = false;
let interval;

alt.onServer('nametags:Config', handleConfig);

/**
 * @param  {Boolean} _showNametags
 * @param  {Boolean} _hideNamesInVehicles
 * @param  {Boolean} _showBarsOnAim
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
            interval = null;
        }
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

    for (let i = 0, n = alt.Player.all.length; i < n; i++) {
        let player = alt.Player.all[i];
        if (!player.valid) {
            continue;
        }

        if (hideNametagsInVehicle && player.vehicle && alt.Player.local.vehicle !== player.vehicle) {
            continue;
        }

        if (player.scriptID === alt.Player.local.scriptID) {
            continue;
        }

        const name = player.getSyncedMeta('NAME');
        if (!name) {
            continue;
        }

        if (!native.hasEntityClearLosToEntity(alt.Player.local.scriptID, player.scriptID, 17)) {
            continue;
        }

        let dist = distance2d(player.pos, alt.Player.local.pos);
        if (dist > drawDistance) {
            continue;
        }

        const isChatting = player.getSyncedMeta('CHATTING');
        const pos = { ...native.getPedBoneCoords(player.scriptID, 12844, 0, 0, 0) };
        pos.z += 0.75;

        let scale = 1 - (0.8 * dist) / drawDistance;
        let fontSize = 0.6 * scale;

        const lineHeight = native.getTextScaleHeight(fontSize, 4);
        const entity = player.vehicle ? player.vehicle.scriptID : player.scriptID;
        const vector = native.getEntityVelocity(entity);
        const frameTime = native.getFrameTime();

        // Names
        native.setDrawOrigin(
            pos.x + vector.x * frameTime,
            pos.y + vector.y * frameTime,
            pos.z + vector.z * frameTime,
            0
        );
        native.beginTextCommandDisplayText('STRING');
        native.setTextFont(4);
        native.setTextScale(fontSize, fontSize);
        native.setTextProportional(true);
        native.setTextCentre(true);
        native.setTextColour(255, 255, 255, 255);
        native.setTextOutline();
        native.addTextComponentSubstringPlayerName(isChatting ? `${name}~r~*` : `${name}`);
        native.endTextCommandDisplayText(0, 0);

        const [foundEntity, aimingAtPed] = native.getEntityPlayerIsFreeAimingAt(
            alt.Player.local.scriptID,
            player.scriptID
        );

        // Bars
        if (showBarsOnAim && foundEntity && aimingAtPed === player.scriptID && !native.isEntityDead(player.scriptID)) {
            if (native.getEntityHealth(player.scriptID) > 0) {
                drawBarBackground(100, lineHeight, scale, 0.25, 139, 0, 0, 255);
                drawBar(native.getEntityHealth(player.scriptID) - 100, lineHeight, scale, 0.25, 255, 0, 0, 255);
            }

            if (native.getPedArmour(player.scriptID) > 0) {
                drawBarBackground(100, lineHeight, scale, 0.75, 140, 140, 140, 255);
                drawBar(native.getPedArmour(player.scriptID), lineHeight, scale, 0.75, 255, 255, 255, 255);
            }
        }

        native.clearDrawOrigin();
    }
}

/**
 * @param  {alt.Vector3} vector1
 * @param  {alt.Vector3} vector2
 */
function distance2d(vector1, vector2) {
    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2));
}

function drawBar(value, lineHeight, scale, position, r, g, b, a) {
    const healthWidth = value * 0.0005 * scale;
    native.drawRect(
        (healthWidth - 100 * 0.0005 * scale) / 2,
        lineHeight + position * lineHeight,
        healthWidth,
        lineHeight / 4,
        r,
        g,
        b,
        a
    );
}

function drawBarBackground(value, lineHeight, scale, position, r, g, b, a) {
    const width = value * 0.0005 * scale;
    native.drawRect(0, lineHeight + position * lineHeight, width + 0.002, lineHeight / 3 + 0.002, 0, 0, 0, 255);
    native.drawRect(0, lineHeight + position * lineHeight, width, lineHeight / 3, r, g, b, a);
}
