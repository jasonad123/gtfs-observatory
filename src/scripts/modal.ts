export function initModals(): void {
  const viewDetailButtons = document.querySelectorAll('.view-details-btn');
  
  viewDetailButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const agencyId = (button as HTMLElement).dataset.agencyId;
      if (agencyId) {
        openModal(agencyId);
      }
    });
  });

  const agencyCards = document.querySelectorAll('.agency-card');
  agencyCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button, a')) {
        return;
      }
      const agencyId = (card as HTMLElement).dataset.agencyId;
      if (agencyId) {
        openModal(agencyId);
      }
    });
  });

  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('dialog');
      if (modal) {
        closeModal(modal as HTMLDialogElement);
      }
    });
  });

  const modals = document.querySelectorAll('dialog');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal as HTMLDialogElement);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('dialog[open]');
      if (openModal) {
        closeModal(openModal as HTMLDialogElement);
      }
    }
  });
}

function openModal(agencyId: string): void {
  const modal = document.getElementById(`modal-${agencyId}`) as HTMLDialogElement;
  if (modal) {
    modal.showModal();
  }
}

function closeModal(modal: HTMLDialogElement): void {
  modal.close();
}