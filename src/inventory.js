import { noa } from './engine'
import { blockIDs } from './registration'

// Inventory system for the game
export class Inventory {
    constructor() {
        this.slots = [];
        this.selectedSlot = 0;
        this.maxSlots = 9;
        
        // Initialize inventory with some default blocks
        this.initializeInventory();
        
        // Set up key bindings for inventory slots
        this.setupKeyBindings();
        
        // Create UI for inventory
        this.createUI();
        
        // Update UI initially
        this.updateUI();
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
                // Clear previous content
                while (slot.childNodes.length > 1) {
                    slot.removeChild(slot.lastChild);
                }
                
                // Update slot content
                if (index < this.slots.length) {
                    const item = this.slots[index];
                    
                    // Add block name
                    const nameElement = document.createElement('div');
                    nameElement.textContent = item.name;
                    nameElement.style.fontSize = '8px';
                    nameElement.style.marginTop = '15px';
                    
                    slot.appendChild(nameElement);
                    
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