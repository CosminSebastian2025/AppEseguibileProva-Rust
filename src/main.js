import { check } from '@tauri-apps/plugin-updater';
import { ask } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

const statusEl = document.getElementById('status');
const btn = document.getElementById('check-btn');

async function checkForUpdates(manual = false) {
  try {
    statusEl.textContent = 'Controllo aggiornamenti...';

    const update = await check();

    if (update) {
      statusEl.textContent = `Nuova versione disponibile: ${update.version}`;

      const yes = await ask(
          `È disponibile la versione ${update.version}. Installare ora?`,
          { title: 'Aggiornamento trovato', kind: 'info' }
      );

      if (yes) {
        statusEl.textContent = 'Download in corso...';

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              statusEl.textContent = `Download avviato (${event.data.contentLength} bytes)`;
              break;
            case 'Progress':
              statusEl.textContent = `Scaricato ${event.data.chunkLength} bytes...`;
              break;
            case 'Finished':
              statusEl.textContent = 'Download completato. Riavvio...';
              break;
          }
        });

        await relaunch();
      }
    } else {
      statusEl.textContent = manual ? 'Nessun aggiornamento disponibile.' : 'App aggiornata.';
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Errore durante il controllo aggiornamenti.';
  }
}

// Controllo automatico all'avvio (dopo 2 secondi)
setTimeout(() => checkForUpdates(false), 2000);

// Controllo manuale
btn.addEventListener('click', () => checkForUpdates(true));