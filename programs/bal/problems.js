// Sample problems shared by the Rust/JS and Level II BASIC players' side panels.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Groups of [label, equation].
export const problems = [
  {group:'Starters', items:[['Water','H2 + O2 = H2.O'],['Rust','FE + O2 = FE2.O3'],['Ammonia','N2 + H2 = N.H3']]},
  {group:'Combustion', items:[['Propane','C3.H8 + O2 = C.O2 + H2.O'],['Methane','C.H4 + O2 = C.O2 + H2.O'],['Glucose','C6.H12.O6 + O2 = C.O2 + H2.O']]},
  {group:'Harder', items:[['Permanganate','K.MN.O4 + H.CL = K.CL + MN.CL2 + H2.O + CL2'],['Copper in nitric acid','CU + H.N.O3 = CU(N.O3)2 + N.O + H2.O'],['Borax','NA2.B4.O7 + H2.O + H2.S.O4 = NA2.S.O4 + H3.B.O3'],['Phosphate','CA(O.H)2 + H3.P.O4 = CA3(P.O4)2 + H2.O']]},
  {group:'Ions (@ is charge)', items:[['Iron and permanganate','MN.O4@-1 + FE@2 + H@ = MN@2 + FE@3 + H2.O']]},
  {group:'Cannot be balanced', items:[['Alchemy (lead into gold)','PB = AU'],['Ambiguous','H2 + O2 = H2.O + H2.O2'],['Wrong side','H2.O + H2 = H2.O2']]},
];
// A Problems section whose buttons call choose(equation).
// Compact lists every group inline as rows of chips, for a single-column page.
export function problemPanel(choose, {groups = problems, note = '', compact = false} = {}) {
  const section = document.createElement('section');
  section.className = compact ? 'balancer-problems compact' : 'balancer-problems';
  section.innerHTML = compact
    ? `<h3>Try a problem</h3><div class="problem-groups">${groups.map(p => `<div class="problem-group"><span>${escape(p.group)}</span>${p.items.map(([label, eq]) => `<button type="button" data-equation="${escape(eq)}" title="${escape(eq)}">${escape(label)}</button>`).join('')}</div>`).join('')}</div>`
    : `<h3>Problems</h3>${groups.map(p => `<details ${p.group === 'Starters' || p.group === 'Harder' ? 'open' : ''}><summary>${escape(p.group)}</summary><div>${p.items.map(([label, eq]) => `<button type="button" data-equation="${escape(eq)}">${escape(label)}</button>`).join('')}</div></details>`).join('')}<p class="small">${escape(note)}</p>`;
  section.onclick = event => {
    const button = event.target.closest('button[data-equation]');
    if (button) choose(button.dataset.equation);
  };
  return section;
}
