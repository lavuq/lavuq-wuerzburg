(() => {
  const WORKER_URL = 'https://lavuq-bewerbung.lavuq.workers.dev';
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get('member');
  const token = params.get('token');

  const loading = document.getElementById('loading');
  const inviteContent = document.getElementById('inviteContent');
  const statusBox = document.getElementById('statusBox');
  const actions = document.getElementById('actions');
  const result = document.getElementById('result');
  const acceptBtn = document.getElementById('acceptBtn');
  const declineBtn = document.getElementById('declineBtn');

  const showResult = (message, type = 'info') => {
    loading.classList.add('invite-hidden');
    inviteContent.classList.add('invite-hidden');
    result.classList.remove('invite-hidden', 'invite-error', 'invite-success');
    if (type === 'error') result.classList.add('invite-error');
    if (type === 'success') result.classList.add('invite-success');
    result.textContent = message;
  };

  const formatExpiry = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Berlin'
    }).format(date);
  };

  async function loadInvitation() {
    if (!memberId || !token) {
      showResult('Dieser Einladungslink ist unvollständig oder ungültig.', 'error');
      return;
    }

    try {
      const url = new URL(`${WORKER_URL}/invitation-status`);
      url.searchParams.set('member', memberId);
      url.searchParams.set('token', token);

      const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        showResult(data.error || 'Diese Einladung konnte nicht geprüft werden.', 'error');
        return;
      }

      loading.classList.add('invite-hidden');
      inviteContent.classList.remove('invite-hidden');

      if (data.status === 'Gesendet') {
        const expiry = formatExpiry(data.validUntil);
        statusBox.textContent = expiry
          ? `Deine Einladung ist bis ${expiry} Uhr gültig.`
          : 'Deine Einladung ist aktuell gültig.';
        actions.classList.remove('invite-hidden');
        return;
      }

      actions.classList.add('invite-hidden');
      if (data.status === 'Angenommen') {
        statusBox.textContent = 'Du hast diese Gruppe bereits angenommen.';
        statusBox.classList.add('invite-success');
      } else if (data.status === 'Abgelehnt') {
        statusBox.textContent = 'Du hast diese Einladung bereits abgelehnt.';
      } else if (data.status === 'Abgelaufen') {
        statusBox.textContent = 'Diese Einladung ist abgelaufen. LAVUQ meldet sich bei dir zum weiteren Vorgehen.';
      } else {
        statusBox.textContent = 'Diese Einladung ist noch nicht für eine Antwort freigegeben.';
      }
    } catch (_) {
      showResult('Die Einladung konnte momentan nicht geladen werden. Bitte versuche es später erneut.', 'error');
    }
  }

  async function respond(decision) {
    acceptBtn.disabled = true;
    declineBtn.disabled = true;
    acceptBtn.textContent = decision === 'accept' ? 'Wird angenommen …' : 'Gruppe annehmen';
    declineBtn.textContent = decision === 'decline' ? 'Wird abgelehnt …' : 'Ablehnen';

    try {
      const response = await fetch(`${WORKER_URL}/invitation-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, token, decision })
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        showResult(data.error || 'Deine Antwort konnte nicht gespeichert werden.', 'error');
        return;
      }

      if (decision === 'accept') {
        showResult('Danke! Deine Zusage wurde gespeichert. Du bist jetzt als aktives Gruppenmitglied vorgemerkt. Kontaktdaten wurden dadurch noch nicht geteilt.', 'success');
      } else {
        showResult('Deine Absage wurde gespeichert. Es wurden keine Kontaktdaten geteilt. LAVUQ kann den frei gewordenen Platz nun neu besetzen.', 'success');
      }
    } catch (_) {
      showResult('Deine Antwort konnte momentan nicht gespeichert werden. Bitte versuche es später erneut.', 'error');
    }
  }

  acceptBtn.addEventListener('click', () => respond('accept'));
  declineBtn.addEventListener('click', () => respond('decline'));
  loadInvitation();
})();
