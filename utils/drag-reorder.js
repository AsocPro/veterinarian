// Drag and Drop Reorder Utility
// Provides reusable drag-and-drop reordering functionality for lists

/**
 * Attach drag-and-drop reordering to a list of items
 * @param {NodeList|Array} items - Array or NodeList of draggable elements
 * @param {Function} onReorder - Callback (oldIndex, newIndex) when reorder happens
 * @param {Object} options - Optional configuration
 * @param {string} options.dragHandleSelector - Selector for drag handle (default: whole item is draggable)
 * @param {string} options.dataIndexAttr - Data attribute name for item index (default: 'data-idx')
 */
window.DragReorder = {
  attach(items, onReorder, options = {}) {
    const { dragHandleSelector = null, dataIndexAttr = 'data-idx' } = options;

    let draggedItem = null;
    let draggedIndex = null;

    items.forEach(item => {
      // Initially set item as NOT draggable
      item.setAttribute('draggable', 'false');

      let isDragFromHandle = false;

      // If drag handle selector provided, only make handle draggable
      if (dragHandleSelector) {
        const handle = item.querySelector(dragHandleSelector);
        if (handle) {
          handle.style.cursor = 'grab';

          // Only enable dragging when mouse is down on the handle
          handle.addEventListener('mousedown', (e) => {
            isDragFromHandle = true;
            item.setAttribute('draggable', 'true');
            handle.style.cursor = 'grabbing';
          });

          // Disable dragging when mouse is released anywhere
          const disableDrag = () => {
            isDragFromHandle = false;
            item.setAttribute('draggable', 'false');
            handle.style.cursor = 'grab';
          };

          handle.addEventListener('mouseup', disableDrag);
          document.addEventListener('mouseup', disableDrag);
        }
      }

      item.addEventListener('dragstart', (e) => {
        // If we have a handle selector, only allow drag if it was initiated from the handle
        if (dragHandleSelector && !isDragFromHandle) {
          e.preventDefault();
          return false;
        }

        // Double check that dragging is allowed
        if (item.getAttribute('draggable') !== 'true') {
          e.preventDefault();
          return false;
        }

        draggedItem = item;
        draggedIndex = parseInt(item.getAttribute(dataIndexAttr));

        // Save the current height to prevent layout shift
        const rect = item.getBoundingClientRect();
        item.style.height = rect.height + 'px';

        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
      });

      item.addEventListener('dragend', (e) => {
        item.classList.remove('dragging');
        // Reset the height
        item.style.height = '';
        // Clear all drag-over indicators
        items.forEach(el => {
          el.classList.remove('drag-over', 'drag-over-bottom');
        });
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedItem === item) return;

        // Clear all drag-over indicators
        items.forEach(el => {
          el.classList.remove('drag-over', 'drag-over-bottom');
        });

        // Determine if we should show indicator above or below
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const mouseY = e.clientY;

        if (mouseY < midpoint) {
          item.classList.add('drag-over');
        } else {
          item.classList.add('drag-over-bottom');
        }
      });

      item.addEventListener('dragleave', (e) => {
        // Only remove if we're actually leaving this element
        if (e.target === item) {
          item.classList.remove('drag-over', 'drag-over-bottom');
        }
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedItem === item) return;

        const targetIndex = parseInt(item.getAttribute(dataIndexAttr));

        // Determine if dropping above or below
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const mouseY = e.clientY;
        const dropBelow = mouseY >= midpoint;

        // Calculate new position
        let newIndex = targetIndex;
        if (dropBelow) {
          newIndex = targetIndex + 1;
        }

        // Adjust if dragging from before the target
        if (draggedIndex < targetIndex) {
          newIndex--;
        }

        // Call the reorder callback
        if (typeof onReorder === 'function') {
          onReorder(draggedIndex, newIndex);
        }
      });
    });
  }
};
