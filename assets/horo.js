/* Rashiphal text shared by the home page and the horoscope page.
   General guidance by Moon sign, rotated by date; not a computed transit reading. */
window.CJH = (function () {
  var S = [
    ['Mesha', 'Aries', '♈', 'Fire', 'Mars'], ['Vrishabha', 'Taurus', '♉', 'Earth', 'Venus'], ['Mithuna', 'Gemini', '♊', 'Air', 'Mercury'],
    ['Karka', 'Cancer', '♋', 'Water', 'Moon'], ['Simha', 'Leo', '♌', 'Fire', 'Sun'], ['Kanya', 'Virgo', '♍', 'Earth', 'Mercury'],
    ['Tula', 'Libra', '♎', 'Air', 'Venus'], ['Vrishchika', 'Scorpio', '♏', 'Water', 'Mars'], ['Dhanu', 'Sagittarius', '♐', 'Fire', 'Jupiter'],
    ['Makara', 'Capricorn', '♑', 'Earth', 'Saturn'], ['Kumbha', 'Aquarius', '♒', 'Air', 'Saturn'], ['Meena', 'Pisces', '♓', 'Water', 'Jupiter']
  ];
  var MAIN = {
    day: ['A clear-headed day. Say the thing you have been rehearsing, and say it kindly.', 'Steady beats fast today. Finish one open task before you start anything new.', 'Conversations open doors. Reply to the message you have been putting off.', 'Your energy is better spent planning than pushing. Sketch the next step and rest.', 'People notice your work today. Share the idea you have been holding back.', 'Small details matter. A quick check now saves you a long fix later.', 'Balance is the theme: one firm yes, one gentle no.', 'Something unspoken comes up. Let it; clarity is kinder than comfort.', 'A good day to learn, read or ask a mentor the bigger question.', 'Patience pays. Do the dull task well and it repays you quietly.', 'Your unusual idea is the right one. Test it with someone you trust.', 'Trust your instinct over the list. Notice what keeps coming back to mind.'],
    week: ['This week rewards focus. Pick two priorities and let the rest wait.', 'Relationships take centre stage this week; make time for the people who steady you.', 'A practical week. Paperwork, budgets and plans move forward if you sit with them.', 'Expect a busy middle of the week. Keep the weekend free to recover.', 'New contacts arrive this week. One of them matters more than it first seems.', 'A reflective week. Review what worked before you commit to more.'],
    month: ['This month asks you to build rather than start: deepen what is already working.', 'A month of movement. Travel, a change of desk or a new routine brings fresh energy.', 'Money and security are the theme this month. A careful budget now gives freedom later.', 'Family and home need attention this month. A small repair or reunion goes a long way.', 'Your visibility grows this month. Prepare your work so it is ready to be seen.', 'A quieter month for rest and study. Strength gathered now is useful later.']
  };
  var LOVE = ['Plan something small and thoughtful.', 'Listen more than you explain.', 'An old connection may return. Go slowly.', 'Say yes to the gathering you would usually skip.', 'Honesty lands more softly than you fear.', 'A little space brings you closer.', 'Talk about the future together.'];
  var WORK = ['Lead the conversation rather than waiting your turn.', 'Clear what is pending before taking on more.', 'A colleague has the answer. Ask early.', 'Read agreements twice before you sign.', 'Recognition is near. Keep a note of your wins.', 'Teamwork moves things; solo effort stalls.'];
  var MONEY = ['Hold off on large purchases for now.', 'A good time to review subscriptions and small leaks.', 'Gains come through people you know.', 'Pay off one small debt and feel lighter.', 'Save first, then spend what is left.', 'Compare prices before you commit.'];
  var HEALTH = ['Sleep early; your body is asking for it.', 'A walk after meals will settle you.', 'Drink more water than you think you need.', 'Stretch your back and shoulders at the desk.', 'Keep screens away an hour before bed.', 'Eat on time, even on a busy day.'];
  var COLOURS = ['Coral', 'Ivory', 'Mint', 'Pearl', 'Saffron', 'Leaf green', 'Rose', 'Garnet', 'Turmeric', 'Indigo', 'Sky blue', 'Sea green'];

  function reading(sign, period, now) {
    now = now || new Date();
    var dayN = Math.floor(now.getTime() / 86400000);
    var seed = sign * 7 + (period === 'today' ? dayN : period === 'tomorrow' ? dayN + 1 : period === 'week' ? Math.floor(dayN / 7) : now.getMonth() + now.getFullYear() * 12);
    var pool = period === 'week' ? MAIN.week : period === 'month' ? MAIN.month : MAIN.day;
    var d = new Date(now), f = { day: 'numeric', month: 'long', year: 'numeric' }, when;
    if (period === 'today') when = 'Today · ' + d.toLocaleDateString('en-IN', f);
    else if (period === 'tomorrow') { d.setDate(d.getDate() + 1); when = 'Tomorrow · ' + d.toLocaleDateString('en-IN', f); }
    else if (period === 'week') { var e = new Date(d); e.setDate(d.getDate() + 6); when = 'This week · ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' – ' + e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
    else when = 'This month · ' + d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    return {
      when: when, main: pool[seed % pool.length],
      love: LOVE[(seed + 2) % LOVE.length], work: WORK[(seed + 3) % WORK.length],
      money: MONEY[(seed + 1) % MONEY.length], health: HEALTH[(seed + 4) % HEALTH.length],
      colour: COLOURS[(seed + 5) % COLOURS.length], number: (seed % 9) + 1
    };
  }
  return { S: S, reading: reading };
})();
