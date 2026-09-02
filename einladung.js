(() => {
  const WORKER_URL = 'https://lavuq-bewerbung.lavuq.workers.dev';
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo') === '1';
  const memberId = params.get('member');
  const token = params.get('token');

  const loading = document.getElementById('loading');
  const inviteContent = document.getElementById('inviteContent');
  const statusBox = document.getElementById('statusBox');
  const actions = document.getElementById('actions');
  const result = document.getElementById('result');
  const acceptBtn = document.getElementById('acceptBtn');
  const declineBtn = document.getElementById('declineBtn');
  const scheduleLink = document.getElementById('scheduleLink');
  const scheduleAnchor = document.getElementById('scheduleAnchor');
  const resultSchedule = document.getElementById('resultSchedule');
  const resultScheduleAnchor = document.getElementById('resultScheduleAnchor');

  const memberAreaUrl = () => demo ? 'mitglied.html?demo=1' : `mitglied.html?member=${encodeURIComponent(memberId || '')}&token=${encodeURIComponent(token || '')}`;
  if (scheduleAnchor) { scheduleAnchor.href = memberAreaUrl(); scheduleAnchor.textContent = 'Mein LAVUQ öffnen'; }
  if (resultScheduleAnchor) { resultScheduleAnchor.href = memberAreaUrl(); resultScheduleAnchor.textContent = 'Mein LAVUQ öffnen'; }

  const showResult = (message, type = 'info', showSchedule = false) => {
    loading.classList.add('invite-hidden');
    inviteContent.classList.add('invite-hidden');
    result.classList.remove('invite-hidden', 'invite-error', 'invite-success');
    if (type === 'error') result.classList.add('invite-error');
    if (type === 'success') result.classList.add('invite-success');
    result.textContent = message;
    if (resultSchedule) resultSchedule.classList.toggle('invite-hidden', !showSchedule);
  };

  const formatExpiry = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(date);
  };

  async function loadInvitation() {
    if (demo) {
      loading.classList.add('invite-hidden');
      inviteContent.classList.remove('invite-hidden');
      statusBox.textContent = 'Teilnehmer-Vorschau: Deine persönliche Einladung ist aktuell gültig.';
      actions.classList.remove('invite-hidden');
      if (scheduleLink) scheduleLink.classList.add('invite-hidden');
      return;
    }
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
        statusBox.textContent = expiry ? `Deine Einladung ist bis ${expiry} Uhr gültig.` : 'Deine Einladung ist aktuell gültig.';
        actions.classList.remove('invite-hidden');
        if (scheduleLink) scheduleLink.classList.add('invite-hidden');
        return;
      }
      actions.classList.add('invite-hidden');
      if (data.status === 'Angenommen') {
        statusBox.textContent = 'Du hast diese Gruppe bereits angenommen. Dein geschützter Mitgliederbereich ist dein zentraler Treffpunkt für Gruppenchat und Termine.';
        statusBox.classList.add('invite-success');
        if (scheduleLink) scheduleLink.classList.remove('invite-hidden');
      } else if (data.status === 'Abgelehnt') {
        statusBox.textContent = 'Du hast diese Einladung bereits abgelehnt.';
        if (scheduleLink) scheduleLink.classList.add('invite-hidden');
      } else if (data.status === 'Abgelaufen') {
        statusBox.textContent = 'Diese Einladung ist abgelaufen. LAVUQ meldet sich bei dir zum weiteren Vorgehen.';
        if (scheduleLink) scheduleLink.classList.add('invite-hidden');
      } else {
        statusBox.textContent = 'Diese Einladung ist noch nicht für eine Antwort freigegeben.';
        if (scheduleLink) scheduleLink.classList.add('invite-hidden');
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
    if (demo) {
      if (decision === 'accept') showResult('Danke! Deine Zusage wurde gespeichert. In „Mein LAVUQ“ findet ihr euren Gruppenchat und könnt eure Treffen gemeinsam organisieren – ohne private Telefonnummern oder WhatsApp. Dies ist eine Vorschau; es wurden keine echten Daten gespeichert.', 'success', true);
      else showResult('Deine Absage würde an dieser Stelle gespeichert. Dies ist eine Vorschau; es wurden keine echten Daten verändert.', 'success');
      return;
    }
    try {
      const response = await fetch(`${WORKER_URL}/invitation-response`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId, token, decision })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        showResult(data.error || 'Deine Antwort konnte nicht gespeichert werden.', 'error');
        return;
      }
      if (decision === 'accept') {
        showResult('Danke! Deine Zusage wurde gespeichert. In „Mein LAVUQ“ findet ihr euren Gruppenchat und könnt eure Treffen gemeinsam organisieren – ohne private Telefonnummern oder WhatsApp.', 'success', true);
      } else {
        showResult('Deine Absage wurde gespeichert. Es wurden keine privaten Kontaktdaten geteilt. LAVUQ kann den frei gewordenen Platz nun neu besetzen.', 'success');
      }
    } catch (_) {
      showResult('Deine Antwort konnte momentan nicht gespeichert werden. Bitte versuche es später erneut.', 'error');
    }
  }

  acceptBtn.addEventListener('click', () => respond('accept'));
  declineBtn.addEventListener('click', () => respond('decline'));
  loadInvitation();
})();