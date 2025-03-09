import { noa } from './engine'
import { inventory } from './inventory'


/*
 * 
 *      interactivity
 * 
*/


// on left mouse, set targeted block to be air
noa.inputs.down.on('fire', function () {
    if (noa.targetedBlock) {
        var pos = noa.targetedBlock.position
        noa.setBlock(0, pos[0], pos[1], pos[2])
    }
})


// place block on alt-fire (RMB/E)
// Use the selected block from inventory instead of pickedID
noa.inputs.down.on('alt-fire', function () {
    if (noa.targetedBlock) {
        var pos = noa.targetedBlock.adjacent
        var blockID = inventory.getSelectedBlock()
        noa.addBlock(blockID, pos[0], pos[1], pos[2])
    }
})


// pick block on middle fire (MMB/Q)
noa.inputs.down.on('mid-fire', function () {
    if (noa.targetedBlock) {
        // Find the block in inventory
        const blockID = noa.targetedBlock.blockID
        const slotIndex = inventory.slots.findIndex(slot => slot.id === blockID)
        
        // If found, select that slot
        if (slotIndex >= 0) {
            inventory.selectSlot(slotIndex)
        } else {
            // If not in inventory, could add it here
            console.log('Block not in inventory:', blockID)
        }
    }
})


// each tick, consume any scroll events and use them to zoom camera
// Restored original behavior without shift key requirement
noa.on('tick', function (dt) {
    var scroll = noa.inputs.pointerState.scrolly
    if (scroll !== 0) {
        noa.camera.zoomDistance += (scroll > 0) ? 1 : -1
        if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0
        if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10
    }
})






// for stress testing
window['setViewDistance'] = (blocks = 100) => {
    blocks = (blocks < 50) ? 50 : (blocks > 5000) ? 5000 : blocks
    var xDist = Math.max(1.5, blocks / noa.world._chunkSize)
    var yDist = Math.max(1.5, 0.5 * xDist)
    noa.world.setAddRemoveDistance([xDist, yDist], [xDist + 1, yDist + 1])
}


