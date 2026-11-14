// Interface texts in Dutch, English and Spanish.

export const LANGS = { nl: 'Nederlands', en: 'English', es: 'Español' };

const S = {
  // ---------- general ----------
  tagline: {
    nl: 'Gooi jullie ideeën in de pot. Trek er één. Ga op pad.',
    en: 'Drop your ideas in the pot. Draw one. Go do it.',
    es: 'Echad vuestras ideas al bombo. Sacad una. A disfrutar.',
  },
  pitch: {
    nl: 'Niemand ziet wat de ander erin stopt, tot het lot getrokken wordt.',
    en: 'Nobody sees what the others put in until the ticket is drawn.',
    es: 'Nadie ve lo que ponen los demás hasta que sale el boleto.',
  },
  signIn: { nl: 'Doorgaan met Google', en: 'Continue with Google', es: 'Continuar con Google' },
  signOut: { nl: 'Uitloggen', en: 'Sign out', es: 'Cerrar sesión' },
  signInFailed: { nl: 'Inloggen is niet gelukt', en: 'Sign-in failed', es: 'No se pudo iniciar sesión' },
  invitedHint: {
    nl: 'Je bent uitgenodigd voor een kring. Log in om mee te doen.',
    en: 'You are invited to a circle. Sign in to join.',
    es: 'Te han invitado a un círculo. Inicia sesión para unirte.',
  },
  language: { nl: 'Taal', en: 'Language', es: 'Idioma' },
  cancel: { nl: 'Annuleren', en: 'Cancel', es: 'Cancelar' },
  save: { nl: 'Opslaan', en: 'Save', es: 'Guardar' },
  saved: { nl: 'Opgeslagen', en: 'Saved', es: 'Guardado' },
  close: { nl: 'Sluiten', en: 'Close', es: 'Cerrar' },
  delete: { nl: 'Verwijderen', en: 'Delete', es: 'Eliminar' },
  loading: { nl: 'Laden…', en: 'Loading…', es: 'Cargando…' },
  error: { nl: 'Dat is niet gelukt. Probeer het opnieuw.', en: 'That did not work. Try again.', es: 'No ha funcionado. Inténtalo de nuevo.' },
  edit: { nl: 'Wijzig', en: 'Edit', es: 'Editar' },
  noAccess: {
    nl: 'Deze kring bestaat niet meer, of je doet er niet (meer) aan mee.',
    en: 'This circle no longer exists, or you are not a member (any more).',
    es: 'Este círculo ya no existe o ya no formas parte de él.',
  },
  you: { nl: 'jij', en: 'you', es: 'tú' },
  someone: { nl: 'Iemand', en: 'Someone', es: 'Alguien' },

  // ---------- circles ----------
  yourCircles: { nl: 'Jouw kringen', en: 'Your circles', es: 'Tus círculos' },
  newCircle: { nl: 'Nieuwe kring', en: 'New circle', es: 'Nuevo círculo' },
  noCircles: {
    nl: 'Een kring is een groepje dat samen een pot met ideeën vult: jij en je partner, of een hele vriendengroep.',
    en: 'A circle is a group that fills a pot of ideas together: you and your partner, or a whole group of friends.',
    es: 'Un círculo es un grupo que llena junto un bombo de ideas: tú y tu pareja, o todo un grupo de amigos.',
  },
  createFirst: { nl: 'Maak je eerste kring', en: 'Create your first circle', es: 'Crea tu primer círculo' },
  circleName: { nl: 'Naam van de kring', en: 'Circle name', es: 'Nombre del círculo' },
  circleNamePh: { nl: 'Bijv. Wij tweeën', en: 'E.g. The two of us', es: 'P. ej. Nosotros dos' },
  icon: { nl: 'Icoon', en: 'Icon', es: 'Icono' },
  createCircle: { nl: 'Kring aanmaken', en: 'Create circle', es: 'Crear círculo' },
  members: { nl: '{n} leden', en: '{n} members', es: '{n} miembros' },
  member1: { nl: '1 lid', en: '1 member', es: '1 miembro' },
  allCircles: { nl: 'Alle kringen', en: 'All circles', es: 'Todos los círculos' },

  joinTitle: { nl: 'Meedoen met {name}', en: 'Join {name}', es: 'Unirte a {name}' },
  joinText: {
    nl: 'Je kunt daarna je eigen ideeën in de pot stoppen. De ideeën van anderen blijven geheim tot ze getrokken worden.',
    en: 'After joining you can add your own ideas to the pot. Other people\'s ideas stay secret until they are drawn.',
    es: 'Después podrás echar tus propias ideas al bombo. Las de los demás son secretas hasta que salgan.',
  },
  join: { nl: 'Meedoen', en: 'Join', es: 'Unirme' },
  joinInvalid: {
    nl: 'Deze uitnodigingslink werkt niet (meer). Vraag om een nieuwe link.',
    en: 'This invite link does not work (any more). Ask for a new link.',
    es: 'Este enlace de invitación ya no funciona. Pide uno nuevo.',
  },

  // ---------- tabs ----------
  tabDraw: { nl: 'Trekken', en: 'Draw', es: 'Sorteo' },
  tabIdeas: { nl: 'Ideeën', en: 'Ideas', es: 'Ideas' },
  tabLog: { nl: 'Logboek', en: 'Log', es: 'Historial' },
  tabCircle: { nl: 'Kring', en: 'Circle', es: 'Círculo' },

  // ---------- draw ----------
  potCount: { nl: '{n} ideeën in de pot', en: '{n} ideas in the pot', es: '{n} ideas en el bombo' },
  potCount1: { nl: '1 idee in de pot', en: '1 idea in the pot', es: '1 idea en el bombo' },
  potEmpty: { nl: 'De pot is leeg', en: 'The pot is empty', es: 'El bombo está vacío' },
  potEmptyHint: {
    nl: 'Stop eerst een paar ideeën in de pot. Dan valt er iets te trekken.',
    en: 'Put a few ideas in the pot first. Then there is something to draw.',
    es: 'Echa primero algunas ideas al bombo. Así habrá algo que sacar.',
  },
  addIdeas: { nl: 'Ideeën toevoegen', en: 'Add ideas', es: 'Añadir ideas' },
  drawBtn: { nl: 'Trek een idee', en: 'Draw an idea', es: 'Sacar una idea' },
  drawAdminsOnly: {
    nl: 'In deze kring trekken alleen de beheerders.',
    en: 'In this circle only admins draw.',
    es: 'En este círculo solo sortean los administradores.',
  },
  filterDraw: { nl: 'Filter deze trekking', en: 'Filter this draw', es: 'Filtrar este sorteo' },
  filterNone: { nl: 'Geen match met deze filters', en: 'Nothing matches these filters', es: 'Nada coincide con estos filtros' },
  filterMatch: { nl: '{n} van de {total} passen', en: '{n} of {total} match', es: '{n} de {total} coinciden' },
  maxDuration: { nl: 'Duurt hooguit', en: 'Takes at most', es: 'Dura como mucho' },
  maxCost: { nl: 'Kost hooguit', en: 'Costs at most', es: 'Cuesta como mucho' },
  any: { nl: 'Maakt niet uit', en: 'Any', es: 'Da igual' },
  notMine: { nl: 'Niet mijn eigen ideeën', en: 'Not my own ideas', es: 'No mis propias ideas' },
  asSurprise: { nl: 'Als verrassing trekken', en: 'Draw as a surprise', es: 'Sacar como sorpresa' },
  asSurpriseHint: {
    nl: 'Alleen de bedenker ziet wat het is en regelt het.',
    en: 'Only the person who thought of it sees what it is and arranges it.',
    es: 'Solo quien la propuso ve qué es y lo organiza.',
  },
  nextAuto: { nl: 'Volgende automatische trekking: {when}', en: 'Next automatic draw: {when}', es: 'Próximo sorteo automático: {when}' },
  upNext: { nl: 'Getrokken', en: 'Drawn', es: 'Ha salido' },
  ideaBy: { nl: 'Idee van {name}', en: 'Idea by {name}', es: 'Idea de {name}' },
  ideaByYou: { nl: 'Jouw idee', en: 'Your idea', es: 'Tu idea' },
  surpriseFrom: { nl: 'Verrassing van {name}', en: 'Surprise from {name}', es: 'Sorpresa de {name}' },
  surpriseYours: {
    nl: 'Alleen jij ziet dit. Regel het en verras de rest.',
    en: 'Only you can see this. Arrange it and surprise the others.',
    es: 'Solo tú ves esto. Organízalo y sorprende al resto.',
  },
  surpriseWait: {
    nl: '{name} weet wat het is en regelt het. Laat je verrassen.',
    en: '{name} knows what it is and will arrange it. Wait and see.',
    es: '{name} sabe qué es y lo organiza. Déjate sorprender.',
  },
  reveal: { nl: 'Onthullen', en: 'Reveal', es: 'Revelar' },
  revealed: { nl: 'Onthuld voor iedereen', en: 'Revealed to everyone', es: 'Revelado para todos' },
  markDone: { nl: 'Gedaan', en: 'Done', es: 'Hecho' },
  backInPot: { nl: 'Terug in de pot', en: 'Back in the pot', es: 'De vuelta al bombo' },
  putBack: { nl: 'Teruggelegd in de pot', en: 'Put back in the pot', es: 'Devuelta al bombo' },
  planFor: { nl: 'Wanneer', en: 'When', es: 'Cuándo' },
  pickDate: { nl: 'Kies een datum', en: 'Pick a date', es: 'Elige una fecha' },
  toCalendar: { nl: 'Zet in Google Agenda', en: 'Add to Google Calendar', es: 'Añadir a Google Calendar' },
  drawnAuto: { nl: 'Automatisch getrokken', en: 'Drawn automatically', es: 'Sorteo automático' },
  drawnBy: { nl: 'Getrokken door {name}', en: 'Drawn by {name}', es: 'Sacado por {name}' },
  newDrawToast: { nl: 'Er is een nieuw idee getrokken', en: 'A new idea has been drawn', es: 'Ha salido una idea nueva' },
  drawing: { nl: 'De pot wordt geschud…', en: 'Shaking the pot…', es: 'Girando el bombo…' },
  great: { nl: 'Mooi', en: 'Great', es: 'Genial' },
  drawAgain: { nl: 'Leg terug en trek opnieuw', en: 'Put back and draw again', es: 'Devolver y sacar otra' },
  takenMeanwhile: {
    nl: 'Dit idee was net al getrokken. Probeer het opnieuw.',
    en: 'This idea was just drawn by someone else. Try again.',
    es: 'Esta idea acaba de salir. Inténtalo de nuevo.',
  },

  // ---------- ideas ----------
  quickAddPh: { nl: 'Wat wil je een keer doen?', en: 'What would you like to do some time?', es: 'Qué te apetece hacer algún día' },
  inThePot: { nl: 'In de pot', en: 'Into the pot', es: 'Al bombo' },
  moreOptions: { nl: 'Met details toevoegen', en: 'Add with details', es: 'Añadir con detalles' },
  added: { nl: 'In de pot gestopt', en: 'Added to the pot', es: 'Echada al bombo' },
  myIdeasInPot: { nl: 'Jouw ideeën in de pot', en: 'Your ideas in the pot', es: 'Tus ideas en el bombo' },
  secretHint: {
    nl: 'Alleen jij ziet deze lijst.',
    en: 'Only you can see this list.',
    es: 'Solo tú ves esta lista.',
  },
  noIdeasYet: {
    nl: 'Nog niets. Typ hierboven je eerste idee: een restaurant, een wandeling, een gek plan.',
    en: 'Nothing yet. Type your first idea above: a restaurant, a hike, a wild plan.',
    es: 'Nada todavía. Escribe arriba tu primera idea: un restaurante, una ruta, un plan loco.',
  },
  drawnIdeas: { nl: 'Al getrokken', en: 'Already drawn', es: 'Ya han salido' },
  openIdeas: { nl: 'Open ideeën van anderen', en: 'Open ideas from others', es: 'Ideas abiertas de otros' },
  capInfo: { nl: '{n} van de {cap} plekken gebruikt', en: '{n} of {cap} slots used', es: '{n} de {cap} huecos usados' },
  capFull: {
    nl: 'Je zit aan het maximum van {cap} ideeën. Wacht tot er eentje getrokken is, of haal er een weg.',
    en: 'You have reached the maximum of {cap} ideas. Wait until one is drawn, or remove one.',
    es: 'Has llegado al máximo de {cap} ideas. Espera a que salga una o quita alguna.',
  },
  newIdea: { nl: 'Nieuw idee', en: 'New idea', es: 'Idea nueva' },
  editIdea: { nl: 'Idee bewerken', en: 'Edit idea', es: 'Editar idea' },
  fTitle: { nl: 'Idee', en: 'Idea', es: 'Idea' },
  fNote: { nl: 'Notitie', en: 'Note', es: 'Nota' },
  fNotePh: { nl: 'Adres, wat je moet regelen, waarom dit leuk is…', en: 'Address, what to arrange, why this is fun…', es: 'Dirección, qué hay que reservar, por qué mola…' },
  fLink: { nl: 'Link', en: 'Link', es: 'Enlace' },
  fDuration: { nl: 'Hoe lang duurt het', en: 'How long it takes', es: 'Cuánto dura' },
  fCost: { nl: 'Wat kost het', en: 'What it costs', es: 'Cuánto cuesta' },
  fPlace: { nl: 'Binnen of buiten', en: 'Indoors or outdoors', es: 'Interior o exterior' },
  fRepeat: { nl: 'Mag vaker getrokken worden', en: 'Can be drawn more than once', es: 'Puede salir más de una vez' },
  fRepeatHint: {
    nl: 'Gaat na afloop terug in de pot.',
    en: 'Goes back into the pot afterwards.',
    es: 'Vuelve al bombo después.',
  },
  fOpen: { nl: 'Open idee', en: 'Open idea', es: 'Idea abierta' },
  fOpenHint: {
    nl: 'Iedereen in de kring kan dit idee nu al zien.',
    en: 'Everyone in the circle can already see this idea.',
    es: 'Todo el círculo puede ver ya esta idea.',
  },
  dur1: { nl: 'Paar uur', en: 'A few hours', es: 'Unas horas' },
  dur2: { nl: 'Halve dag', en: 'Half a day', es: 'Medio día' },
  dur3: { nl: 'Hele dag', en: 'A full day', es: 'Un día entero' },
  dur4: { nl: 'Weekend', en: 'Weekend', es: 'Fin de semana' },
  cost0: { nl: 'Gratis', en: 'Free', es: 'Gratis' },
  placeIn: { nl: 'Binnen', en: 'Indoors', es: 'Interior' },
  placeOut: { nl: 'Buiten', en: 'Outdoors', es: 'Exterior' },
  placeBoth: { nl: 'Kan allebei', en: 'Either', es: 'Ambos' },
  repeats: { nl: 'Herhaalbaar', en: 'Repeatable', es: 'Repetible' },
  open: { nl: 'Open', en: 'Open', es: 'Abierta' },
  deleteIdeaConfirm: { nl: 'Dit idee uit de pot halen?', en: 'Remove this idea from the pot?', es: 'Quitar esta idea del bombo' },
  removed: { nl: 'Uit de pot gehaald', en: 'Removed from the pot', es: 'Quitada del bombo' },

  // ---------- log ----------
  logEmpty: {
    nl: 'Hier komt te staan wat er getrokken is en hoe het was.',
    en: 'Everything that gets drawn, and how it went, will show up here.',
    es: 'Aquí aparecerá todo lo que salga y qué tal fue.',
  },
  stOpen: { nl: 'Staat nog open', en: 'Still open', es: 'Pendiente' },
  stDone: { nl: 'Gedaan', en: 'Done', es: 'Hecho' },
  stSkipped: { nl: 'Teruggelegd', en: 'Put back', es: 'Devuelta' },
  secretStill: { nl: 'Nog geheim', en: 'Still secret', es: 'Aún secreta' },
  howWasIt: { nl: 'Hoe was het', en: 'How was it', es: 'Qué tal fue' },
  yourRating: { nl: 'Jouw waardering', en: 'Your rating', es: 'Tu valoración' },
  logNote: { nl: 'Herinnering', en: 'Memory', es: 'Recuerdo' },
  logNotePh: { nl: 'Wat wil je onthouden van deze keer', en: 'What do you want to remember about it', es: 'Qué quieres recordar de esta vez' },
  doneCount: { nl: '{n} keer gedaan', en: '{n} done', es: '{n} hechas' },
  drawnCountOf: { nl: 'van {name}: {n}', en: 'by {name}: {n}', es: 'de {name}: {n}' },

  // ---------- circle / settings ----------
  membersTitle: { nl: 'Leden', en: 'Members', es: 'Miembros' },
  admin: { nl: 'Beheerder', en: 'Admin', es: 'Admin' },
  inPotN: { nl: '{n} in de pot', en: '{n} in the pot', es: '{n} en el bombo' },
  drawnN: { nl: '{n} getrokken', en: '{n} drawn', es: '{n} sorteadas' },
  invite: { nl: 'Mensen uitnodigen', en: 'Invite people', es: 'Invitar a gente' },
  inviteHint: {
    nl: 'Iedereen met deze link kan meedoen met de kring.',
    en: 'Anyone with this link can join the circle.',
    es: 'Cualquiera con este enlace puede unirse al círculo.',
  },
  copyLink: { nl: 'Kopieer link', en: 'Copy link', es: 'Copiar enlace' },
  share: { nl: 'Delen', en: 'Share', es: 'Compartir' },
  copied: { nl: 'Link gekopieerd', en: 'Link copied', es: 'Enlace copiado' },
  shareText: { nl: 'Doe mee met onze kring "{name}" op Tómbola', en: 'Join our circle "{name}" on Tómbola', es: 'Únete a nuestro círculo "{name}" en Tómbola' },
  newLink: { nl: 'Nieuwe link maken', en: 'Make a new link', es: 'Crear enlace nuevo' },
  newLinkConfirm: {
    nl: 'De oude link werkt daarna niet meer. Doorgaan?',
    en: 'The old link will stop working. Continue?',
    es: 'El enlace anterior dejará de funcionar. Continuar',
  },
  makeAdmin: { nl: 'Maak beheerder', en: 'Make admin', es: 'Hacer admin' },
  removeAdmin: { nl: 'Geen beheerder meer', en: 'Remove as admin', es: 'Quitar admin' },
  removeMember: { nl: 'Uit de kring halen', en: 'Remove from circle', es: 'Quitar del círculo' },
  removeMemberConfirm: {
    nl: '{name} uit de kring halen? De ideeën van {name} gaan uit de pot.',
    en: 'Remove {name} from the circle? Their ideas leave the pot.',
    es: 'Quitar a {name} del círculo. Sus ideas salen del bombo.',
  },
  yourName: { nl: 'Jouw naam in deze kring', en: 'Your name in this circle', es: 'Tu nombre en este círculo' },
  settings: { nl: 'Instellingen', en: 'Settings', es: 'Ajustes' },
  settingsAdminOnly: {
    nl: 'Alleen beheerders kunnen de instellingen aanpassen.',
    en: 'Only admins can change the settings.',
    es: 'Solo los administradores pueden cambiar los ajustes.',
  },
  setReveal: { nl: 'Wie ziet het getrokken idee', en: 'Who sees the drawn idea', es: 'Quién ve la idea que sale' },
  revEveryone: { nl: 'Iedereen', en: 'Everyone', es: 'Todos' },
  revEveryoneD: { nl: 'Het idee is meteen zichtbaar voor de hele kring.', en: 'The idea is visible to the whole circle right away.', es: 'La idea es visible para todo el círculo al momento.' },
  revSurprise: { nl: 'Alleen de bedenker', en: 'Only its author', es: 'Solo quien la propuso' },
  revSurpriseD: { nl: 'De bedenker regelt het als verrassing en onthult het later.', en: 'The author arranges it as a surprise and reveals it later.', es: 'Quien la propuso la organiza como sorpresa y la revela después.' },
  revChoose: { nl: 'Wie trekt, kiest', en: 'The drawer decides', es: 'Decide quien sortea' },
  revChooseD: { nl: 'Bij elke trekking kies je: open of als verrassing.', en: 'Choose at every draw: open or as a surprise.', es: 'En cada sorteo se elige: abierta o como sorpresa.' },
  setFair: { nl: 'Eerlijk verdelen', en: 'Keeping it fair', es: 'Reparto justo' },
  fairPerson: { nl: 'Gelijke kans per persoon', en: 'Equal chance per person', es: 'Misma probabilidad por persona' },
  fairPersonD: { nl: 'Eerst wordt een persoon geloot, dan een idee van die persoon. Veel ideeën invoeren levert niets extra op.', en: 'First a person is drawn, then one of their ideas. Adding lots of ideas gives no advantage.', es: 'Primero se sortea una persona y luego una de sus ideas. Meter muchas ideas no da ventaja.' },
  fairTurns: { nl: 'Om de beurt', en: 'Taking turns', es: 'Por turnos' },
  fairTurnsD: { nl: 'Wie het minst vaak aan de beurt is geweest, is als eerste weer aan de beurt.', en: 'Whoever has had the fewest turns goes next.', es: 'Le toca a quien menos veces le ha tocado.' },
  fairCap: { nl: 'Maximum per persoon', en: 'Maximum per person', es: 'Máximo por persona' },
  fairCapD: { nl: 'Iedereen mag een beperkt aantal ideeën tegelijk in de pot hebben.', en: 'Everyone can keep a limited number of ideas in the pot at a time.', es: 'Cada persona puede tener un número limitado de ideas en el bombo.' },
  fairCapN: { nl: 'Maximaal aantal ideeën per persoon', en: 'Maximum ideas per person', es: 'Máximo de ideas por persona' },
  fairRandom: { nl: 'Volledig willekeurig', en: 'Fully random', es: 'Totalmente al azar' },
  fairRandomD: { nl: 'Elk idee heeft dezelfde kans. Wie meer invoert, komt vaker aan de beurt.', en: 'Every idea has the same chance. Whoever adds more gets drawn more often.', es: 'Cada idea tiene la misma probabilidad. Quien mete más, sale más.' },
  setWho: { nl: 'Wie mag trekken', en: 'Who can draw', es: 'Quién puede sortear' },
  whoAnyone: { nl: 'Iedereen in de kring', en: 'Everyone in the circle', es: 'Todo el círculo' },
  whoAdmins: { nl: 'Alleen beheerders', en: 'Admins only', es: 'Solo administradores' },
  setSchedule: { nl: 'Vast ritme', en: 'Fixed rhythm', es: 'Ritmo fijo' },
  schedOn: { nl: 'Automatisch trekken', en: 'Draw automatically', es: 'Sortear automáticamente' },
  schedHint: {
    nl: 'Op het gekozen moment wordt er vanzelf een idee getrokken. Je ziet het zodra iemand de app opent.',
    en: 'At the chosen moment an idea is drawn by itself. You see it as soon as someone opens the app.',
    es: 'En el momento elegido sale una idea sola. Se ve en cuanto alguien abre la app.',
  },
  every1: { nl: 'Elke week', en: 'Every week', es: 'Cada semana' },
  every2: { nl: 'Om de week', en: 'Every 2 weeks', es: 'Cada 2 semanas' },
  every4: { nl: 'Elke 4 weken', en: 'Every 4 weeks', es: 'Cada 4 semanas' },
  schedDay: { nl: 'Dag', en: 'Day', es: 'Día' },
  schedHour: { nl: 'Tijd', en: 'Time', es: 'Hora' },
  rename: { nl: 'Naam en icoon', en: 'Name and icon', es: 'Nombre e icono' },
  leave: { nl: 'Kring verlaten', en: 'Leave circle', es: 'Salir del círculo' },
  leaveConfirm: {
    nl: 'Kring verlaten? Jouw ideeën gaan uit de pot.',
    en: 'Leave this circle? Your ideas leave the pot.',
    es: 'Salir del círculo. Tus ideas salen del bombo.',
  },
  lastAdmin: {
    nl: 'Je bent de enige beheerder. Maak eerst iemand anders beheerder.',
    en: 'You are the only admin. Make someone else an admin first.',
    es: 'Eres el único administrador. Nombra antes a otra persona.',
  },
  deleteCircle: { nl: 'Kring verwijderen', en: 'Delete circle', es: 'Eliminar círculo' },
  deleteCircleConfirm: {
    nl: 'De kring met alle ideeën en het logboek definitief verwijderen? Dit kan niet ongedaan worden gemaakt.',
    en: 'Permanently delete this circle with all its ideas and its log? This cannot be undone.',
    es: 'Eliminar para siempre el círculo con todas sus ideas y su historial. No se puede deshacer.',
  },
  about: { nl: 'Over Tómbola', en: 'About Tómbola', es: 'Acerca de Tómbola' },
  aboutIdea: {
    nl: 'Tómbola is gebaseerd op de date randomizer van Anne Margot Ridderikhoff. Deze app is slechts een kleine uitbreiding van haar oorspronkelijke idee.',
    en: 'Tómbola is based on the date randomizer by Anne Margot Ridderikhoff. This app is only a small extension of her original idea.',
    es: 'Tómbola nace del date randomizer de Anne Margot Ridderikhoff. Esta app es solo una pequeña ampliación de su idea original.',
  },
  aboutRights: {
    nl: 'De auteursrechten liggen bij Anne Margot Ridderikhoff.',
    en: 'The copyright belongs to Anne Margot Ridderikhoff.',
    es: 'Los derechos de autor pertenecen a Anne Margot Ridderikhoff.',
  },
  aboutApp: { nl: 'Als app op je telefoon', en: 'As an app on your phone', es: 'Como app en tu móvil' },
  aboutAppHint: {
    nl: 'Open deze pagina in Chrome op je Android-telefoon, tik op het menu met de drie puntjes en kies "App installeren" of "Toevoegen aan startscherm".',
    en: 'Open this page in Chrome on your Android phone, tap the three-dot menu and choose "Install app" or "Add to Home screen".',
    es: 'Abre esta página en Chrome en tu móvil Android, toca el menú de los tres puntos y elige "Instalar aplicación" o "Añadir a pantalla de inicio".',
  },
  aboutInstalled: {
    nl: 'Tómbola is op dit toestel geïnstalleerd.',
    en: 'Tómbola is installed on this device.',
    es: 'Tómbola está instalada en este dispositivo.',
  },
  install: { nl: 'App installeren', en: 'Install app', es: 'Instalar la app' },
  back: { nl: 'Terug', en: 'Back', es: 'Volver' },
  demoBanner: {
    nl: 'Demo: niets wordt opgeslagen.',
    en: 'Demo: nothing is saved.',
    es: 'Demo: no se guarda nada.',
  },
};

let lang = 'es';

export function setLang(l) {
  lang = LANGS[l] ? l : 'en';
  document.documentElement.lang = lang;
}
export function getLang() {
  return lang;
}
export function detectLang() {
  try {
    const saved = localStorage.getItem('tombola.lang');
    if (saved && LANGS[saved]) return saved;
  } catch {}
  return 'es';
}

export function t(key, vars) {
  const entry = S[key];
  let s = entry ? entry[lang] ?? entry.en : key;
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
}

export function locale() {
  return { nl: 'nl-NL', en: 'en-GB', es: 'es-ES' }[lang];
}

export function weekdayName(i, style = 'long') {
  // 2024-01-07 is a Sunday
  return new Intl.DateTimeFormat(locale(), { weekday: style }).format(new Date(2024, 0, 7 + i));
}
export function fmtDate(ms, withYear = true) {
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) }).format(new Date(ms));
}
export function fmtWhen(ms) {
  return new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
}
