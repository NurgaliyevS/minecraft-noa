import { noa } from './engine'
import { blockIDs } from './registration'

// Import texture URLs
import atlasURL from './textures/terrain_atlas.png'
import stoneURL from './textures/stone.png'
import transparentAtlas from './textures/trans_atlas.png'
import grassDecoURL from './textures/grass_deco.png'
import transparent1 from './textures/t1.png'
import transparent2 from './textures/t2.png'
import windowURL from './textures/window.png'
import imagea from './textures/a.png'
import imageb from './textures/b.png'
import imagec from './textures/c.png'

// Inventory system for the game
export class Inventory {
    constructor() {
        this.slots = [];
        this.selectedSlot = 0;
        this.maxSlots = 9;
        
        // Create texture mapping for blocks
        this.blockTextures = this.createBlockTextureMapping();
        
        // Initialize inventory with some default blocks
        this.initializeInventory();
        
        // Set up key bindings for inventory slots
        this.setupKeyBindings();
        
        // Create UI for inventory
        this.createUI();
        
        // Update UI initially
        this.updateUI();
    }
    
    createBlockTextureMapping() {
        // Map block IDs to their textures
        const mapping = {};
        
        // Simple textures
        mapping[blockIDs.stone] = { url: stoneURL, type: 'image' };
        mapping[blockIDs.dirt] = { url: atlasURL, type: 'atlas', index: 2 };
        mapping[blockIDs.grass] = { url: atlasURL, type: 'atlas', index: 0 };
        mapping[blockIDs.transparent] = { url: transparent1, type: 'image' };
        mapping[blockIDs.window] = { url: windowURL, type: 'image' };
        mapping[blockIDs.grassDeco] = { url: grassDecoURL, type: 'image' };
        mapping[blockIDs.stoneTrans] = { url: transparentAtlas, type: 'atlas', index: 0 };
        
        // Colored blocks
        mapping[blockIDs.green] = { color: '#336633', type: 'color' };
        mapping[blockIDs.cloud] = { color: 'rgba(230, 230, 235, 0.8)', type: 'color' };
        mapping[blockIDs.water] = { color: 'rgba(128, 128, 204, 0.7)', type: 'color' };
        mapping[blockIDs.shinyDirt] = { color: '#735a38', type: 'color' };
        
        // Custom blocks
        mapping[blockIDs.pole] = { color: '#b3b3b3', type: 'color' };
        mapping[blockIDs.waterPole] = { color: 'rgba(128, 128, 204, 0.7)', type: 'color' };
        mapping[blockIDs.custom1] = { url: transparent1, type: 'image' };
        mapping[blockIDs.custom2] = { url: transparent2, type: 'image' };
        
        // Multi-textured blocks
        mapping[blockIDs.abc1] = { url: imagea, type: 'image' };
        mapping[blockIDs.abc2] = { url: imagea, type: 'image' };
        mapping[blockIDs.abc3] = { url: imagea, type: 'image' };
        
        return mapping;
    }
    
    initializeInventory() {
        // Add some default blocks to the inventory
        // Each slot contains: { id: blockID, count: number, name: string }
        this.slots = [
            { id: blockIDs.dirt, count: 64, name: 'Dirt' },
            { id: blockIDs.grass, count: 64, name: 'Grass' },
            { id: blockIDs.stone, count: 64, name: 'Stone' },
            { id: blockIDs.shinyDirt, count: 64, name: 'Shiny Dirt' },
            { id: blockIDs.transparent, count: 64, name: 'Glass' },
            { id: blockIDs.pole, count: 64, name: 'Pole' },
            { id: blockIDs.window, count: 64, name: 'Window' },
            { id: blockIDs.grassDeco, count: 64, name: 'Grass Deco' },
            { id: blockIDs.water, count: 64, name: 'Water' }
        ];
    }
    
    setupKeyBindings() {
        // Bind number keys 1-9 to select inventory slots
        for (let i = 1; i <= this.maxSlots; i++) {
            const keyName = `slot-${i}`;
            const keyCode = `Digit${i}`;
            
            // Make sure to bind all keys including Digit1 now that we've removed the shooting functionality
            noa.inputs.bind(keyName, keyCode);
            noa.inputs.down.on(keyName, () => {
                this.selectSlot(i - 1);
            });
        }
        
        // We've removed the mouse wheel binding to simplify controls
    }
    
    selectSlot(index) {
        if (index >= 0 && index < this.slots.length) {
            this.selectedSlot = index;
            this.updateUI();
        }
    }
    
    getSelectedBlock() {
        return this.slots[this.selectedSlot].id;
    }
    
    createUI() {
        // Create inventory UI container
        const inventoryContainer = document.createElement('div');
        inventoryContainer.id = 'inventory';
        inventoryContainer.style.position = 'fixed';
        inventoryContainer.style.bottom = '10px';
        inventoryContainer.style.left = '50%';
        inventoryContainer.style.transform = 'translateX(-50%)';
        inventoryContainer.style.display = 'flex';
        inventoryContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        inventoryContainer.style.padding = '5px';
        inventoryContainer.style.borderRadius = '5px';
        inventoryContainer.style.zIndex = '100';
        
        // Create slots
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i.toString(); // Convert number to string for dataset
            slot.style.width = '40px';
            slot.style.height = '40px';
            slot.style.margin = '0 2px';
            slot.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            slot.style.border = '2px solid #555';
            slot.style.borderRadius = '3px';
            slot.style.display = 'flex';
            slot.style.flexDirection = 'column';
            slot.style.justifyContent = 'center';
            slot.style.alignItems = 'center';
            slot.style.color = 'white';
            slot.style.fontSize = '10px';
            slot.style.textAlign = 'center';
            slot.style.cursor = 'pointer';
            slot.style.position = 'relative';
            slot.style.overflow = 'hidden';
            
            // Add click event to select slot
            slot.addEventListener('click', () => {
                this.selectSlot(i);
            });
            
            // Add key number indicator
            const keyNumber = document.createElement('div');
            keyNumber.className = 'key-number';
            keyNumber.textContent = (i + 1).toString();
            keyNumber.style.position = 'absolute';
            keyNumber.style.top = '2px';
            keyNumber.style.left = '2px';
            keyNumber.style.fontSize = '8px';
            keyNumber.style.color = '#aaa';
            keyNumber.style.zIndex = '2';
            keyNumber.style.textShadow = '1px 1px 0px black';
            
            slot.appendChild(keyNumber);
            inventoryContainer.appendChild(slot);
        }
        
        document.body.appendChild(inventoryContainer);
    }
    
    updateUI() {
        // Use querySelectorAll with HTMLElement type to avoid TypeScript errors
        const slots = document.querySelectorAll('.inventory-slot');
        
        slots.forEach((slot, index) => {
            // Only proceed if the slot is an HTMLElement
            if (slot instanceof HTMLElement) {
                // Clear previous content except the key number
                while (slot.childNodes.length > 1) {
                    slot.removeChild(slot.lastChild);
                }
                
                // Update slot content
                if (index < this.slots.length) {
                    const item = this.slots[index];
                    const textureInfo = this.blockTextures[item.id];
                    
                    // Add block texture/color
                    if (textureInfo) {
                        const blockImage = document.createElement('div');
                        blockImage.className = 'block-image';
                        blockImage.style.width = '30px';
                        blockImage.style.height = '30px';
                        blockImage.style.position = 'absolute';
                        blockImage.style.top = '50%';
                        blockImage.style.left = '50%';
                        blockImage.style.transform = 'translate(-50%, -50%)';
                        blockImage.style.zIndex = '1';
                        
                        if (textureInfo.type === 'color') {
                            // Use color for blocks without textures
                            blockImage.style.backgroundColor = textureInfo.color;
                            blockImage.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                        } else if (textureInfo.type === 'image') {
                            // Use direct image
                            blockImage.style.backgroundImage = `url(${textureInfo.url})`;
                            blockImage.style.backgroundSize = 'cover';
                            blockImage.style.backgroundPosition = 'center';
                            blockImage.style.imageRendering = 'pixelated';
                        } else if (textureInfo.type === 'atlas') {
                            // Handle atlas textures
                            blockImage.style.backgroundImage = `url(${textureInfo.url})`;
                            // Assuming atlas is a vertical strip with equal-sized textures
                            const yOffset = textureInfo.index * 100;
                            blockImage.style.backgroundPosition = `0 ${-yOffset}%`;
                            blockImage.style.backgroundSize = '100% 400%'; // Adjust based on atlas size
                            blockImage.style.imageRendering = 'pixelated';
                        }
                        
                        slot.appendChild(blockImage);
                    }
                    
                    // Add block name
                    const nameElement = document.createElement('div');
                    nameElement.textContent = item.name;
                    nameElement.style.fontSize = '8px';
                    nameElement.style.marginTop = '25px';
                    nameElement.style.position = 'relative';
                    nameElement.style.zIndex = '2';
                    nameElement.style.textShadow = '1px 1px 0px black';
                    nameElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    nameElement.style.padding = '1px 3px';
                    nameElement.style.borderRadius = '2px';
                    
                    slot.appendChild(nameElement);
                    
                    // Add count indicator
                    const countElement = document.createElement('div');
                    countElement.textContent = item.count.toString();
                    countElement.style.position = 'absolute';
                    countElement.style.bottom = '2px';
                    countElement.style.right = '2px';
                    countElement.style.fontSize = '8px';
                    countElement.style.color = 'white';
                    countElement.style.zIndex = '2';
                    countElement.style.textShadow = '1px 1px 0px black';
                    
                    slot.appendChild(countElement);
                    
                    // Highlight selected slot
                    if (index === this.selectedSlot) {
                        slot.style.border = '2px solid #fff';
                        slot.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                    } else {
                        slot.style.border = '2px solid #555';
                        slot.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }
                }
            }
        });
    }
}

// Create and export a singleton instance
export const inventory = new Inventory();