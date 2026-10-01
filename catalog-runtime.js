(() => {
  const catalog = window.CS_CATALOG;
  if (!catalog) return;

  function repairCatalogIndexes(root = document) {
    root.querySelectorAll?.('[data-use-catalog-card]').forEach(button => {
      const collectionId = button.dataset.useCatalogCard;
      const checklist = catalog.checklists?.[collectionId] || [];
      const numberText = button.querySelector('.catalog-number')?.textContent?.replace('#','').trim();
      const playerText = button.querySelector('.catalog-player strong')?.textContent?.trim();
      const idx = checklist.findIndex(row => String(row[0]) === String(numberText) && String(row[1]) === String(playerText));
      if (idx >= 0) button.dataset.catalogCardIndex = String(idx);
    });
  }

  repairCatalogIndexes();
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) repairCatalogIndexes(node);
      });
    }
  });
  observer.observe(document.documentElement, {subtree:true, childList:true});
})();
