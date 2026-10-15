// YDS grammar & question-type curriculum: topics + a starter question bank (lessons live in lessons.js).
// The starter questions are original YDS-style examples written for this app — not ÖSYM questions.
// Real past-exam questions are imported by the user from their own PDFs (see qparse.js).
// Question shape: { stem, options[5], answer (index), explanation, passage? }
// Options are shuffled at practice time (except where `fixedOptions` is set), so the
// correct answer is written first here for readability.

// Approximate YDS distribution (80 questions, 180 minutes).
export const YDS_SECTIONS = [
  { name: 'Kelime bilgisi', count: 6, where: 'Kelime soruları + Kelimeler sekmesi' },
  { name: 'Dilbilgisi', count: 10, where: 'Gramer konuları' },
  { name: 'Cloze test', count: 10, where: 'Cloze test' },
  { name: 'Cümle tamamlama', count: 10, where: 'Cümle tamamlama' },
  { name: 'Çeviri (EN↔TR)', count: 6, where: 'Çeviri' },
  { name: 'Okuma (paragraf)', count: 20, where: '— (kapsam dışı)' },
  { name: 'Diyalog tamamlama', count: 5, where: 'Diyalog tamamlama' },
  { name: 'Yakın anlamlı cümle', count: 4, where: 'Yakın anlam' },
  { name: 'Paragraf tamamlama', count: 4, where: 'Paragraf tamamlama' },
  { name: 'Anlam bütünlüğünü bozan cümle', count: 5, where: 'Anlam bütünlüğü' },
];

export const TOPICS = [
  // ---------------------------------------------------------------- grammar
  {
    id: 'tenses', group: 'grammar', icon: '⏳', title: 'Zamanlar (Tenses)',
    why: 'Dilbilgisi, cloze ve cümle tamamlamada en sık test edilen konu. Asıl soru: "hangi zaman ifadesi hangi tense\'i ister?"',
    traps: [
      '"for decades" gördüğün an Past Simple\'ı eleme — cümlede "ago/in 1990" varsa Past Simple, yoksa Present Perfect.',
      'İki boşluklu sorularda önce kesin olan boşluğu çöz (genellikle zaman ifadesine yakın olan), şıkları ona göre ele.',
    ],
    gen: 'Single academic sentences testing English tenses: present perfect vs past simple (since/for/ago), past perfect with by the time/before/after, future perfect (by 2050, by the time + present), tense agreement, time clauses without will, no sooner/hardly inversion. Use one or two blanks; for two blanks write each option as "x / y".',
    questions: [
      { stem: 'Since the 1950s, the global population ---- more than threefold, putting enormous pressure on natural resources.', options: ['has increased', 'increased', 'had increased', 'was increasing', 'increases'], answer: 0, explanation: '"Since + geçmiş nokta" → Present Perfect (has increased).' },
      { stem: 'By the time the rescue team ----, the survivors ---- without food for nearly four days.', options: ['arrived / had been', 'arrives / have been', 'had arrived / were', 'has arrived / had been', 'was arriving / have been'], answer: 0, explanation: '"By the time + Past Simple" → ana cümle Past Perfect: arrived / had been.' },
      { stem: 'Scientists predict that by 2050, rising sea levels ---- many coastal cities uninhabitable.', options: ['will have made', 'had made', 'have made', 'made', 'were making'], answer: 0, explanation: '"by + gelecek tarih" → Future Perfect (will have made).' },
      { stem: 'No sooner ---- the experiment than the researchers noticed an unexpected reaction.', options: ['had they started', 'they had started', 'they started', 'have they started', 'they have started'], answer: 0, explanation: '"No sooner" başta → devrik Past Perfect: had they started ... than + Past Simple.' },
      { stem: 'When the first vaccines ---- in the 18th century, many people ---- them with deep suspicion.', options: ['were developed / regarded', 'have been developed / regard', 'had developed / were regarding', 'develop / regarded', 'are developed / had regarded'], answer: 0, explanation: '"in the 18th century" → geçmiş; aşılar geliştirildi (edilgen) / insanlar şüpheyle baktı: were developed / regarded.' },
      { stem: 'Researchers ---- the long-term effects of the drug for almost a decade, but they ---- any serious side effects yet.', options: ['have been studying / haven\'t found', 'studied / didn\'t find', 'had studied / don\'t find', 'are studying / hadn\'t found', 'study / won\'t find'], answer: 0, explanation: '"for almost a decade" (hâlâ süren) → Present Perfect Continuous; "yet" → Present Perfect olumsuz.' },
    ],
  },
  {
    id: 'modals', group: 'grammar', icon: '🔮', title: 'Modals (Kipler)',
    why: 'Özellikle "modal + have V3" (geçmişe yönelik tahmin/eleştiri) YDS\'nin favorisi.',
    traps: [
      'Cümlenin devamındaki kanıta bak: "evidence/clearly" → must have; "but he didn\'t" → should have / could have.',
      '"needn\'t have done" ile "didn\'t need to do" farkı sık sorulur.',
    ],
    gen: 'Single academic sentences testing modal verbs, especially modal perfects (must have V3, can\'t have V3, may have V3, should have V3, needn\'t have V3, could have V3), plus must/have to/don\'t have to, be able to vs could, had better, would rather. The context must make exactly one option logical.',
    questions: [
      { stem: 'The ancient city ---- by an earthquake, as archaeologists have found clear evidence of a sudden structural collapse.', options: ['must have been destroyed', 'should have been destroyed', 'needn\'t have been destroyed', 'would rather have been destroyed', 'had better be destroyed'], answer: 0, explanation: '"clear evidence" → geçmişe dair güçlü çıkarım: must have been destroyed.' },
      { stem: 'The patient ---- the medication without consulting a doctor; it caused serious side effects.', options: ['shouldn\'t have taken', 'mustn\'t take', 'can\'t have taken', 'needn\'t take', 'would rather take'], answer: 0, explanation: 'Yapıldı ama yapılmamalıydı (eleştiri) → shouldn\'t have taken. "can\'t have taken" yan etkiyle çelişir.' },
      { stem: 'You ---- bring your own laptop to the workshop, since computers will be provided for all participants.', options: ['don\'t have to', 'mustn\'t', 'can\'t', 'had better', 'ought to'], answer: 0, explanation: 'Bilgisayar verilecek → gerek yok: don\'t have to. "mustn\'t" yasak anlamı verir.' },
      { stem: 'The documents ---- lost in the post; otherwise, they would have arrived by now.', options: ['may have been', 'needn\'t have been', 'should have been', 'would rather have been', 'ought to be'], answer: 0, explanation: 'Geçmişe dair olasılık → may have been.' },
      { stem: 'Although she was exhausted, she ---- finish the marathon thanks to her careful training.', options: ['was able to', 'could have', 'must', 'should have', 'might have'], answer: 0, explanation: 'Geçmişte tek seferlik başarı → was able to (could değil).' },
      { stem: 'We ---- so much food for the party; only half of the guests turned up.', options: ['needn\'t have prepared', 'mustn\'t prepare', 'couldn\'t have prepared', 'had better prepare', 'would rather prepare'], answer: 0, explanation: 'Hazırlandı ama gerek yoktu → needn\'t have prepared.' },
    ],
  },
  {
    id: 'passive', group: 'grammar', icon: '🔄', title: 'Etken / Edilgen (Active–Passive)',
    why: 'Akademik metinlerin dili edilgendir; cloze ve dilbilgisinde neredeyse her sınavda var.',
    traps: [
      '"was occurred / is happened" gibi şıklar her zaman yanlıştır.',
      'Edilgende tense uyumunu yine zaman ifadesi belirler: "since 2010" → has been built.',
    ],
    gen: 'Single academic sentences testing passive voice: tense + passive (has been done, will be done, had been done), modal passives, passive gerund/infinitive (being done, to have been done), "is said to have V3", causative have/get something done, and intransitive verbs that cannot be passive (occur, happen, emerge, consist of).',
    questions: [
      { stem: 'The results of the study ---- in a leading medical journal next month.', options: ['will be published', 'will publish', 'are publishing', 'have published', 'had been published'], answer: 0, explanation: 'Sonuçlar yayımlanacak (etkilenen) + "next month" → will be published.' },
      { stem: 'Penicillin ---- by Alexander Fleming in 1928, an event that transformed modern medicine.', options: ['was discovered', 'discovered', 'has been discovered', 'had discovered', 'is discovered'], answer: 0, explanation: '"by Fleming" + "in 1928" → Past Simple edilgen.' },
      { stem: 'Major earthquakes often ---- without warning, which makes preparation all the more important.', options: ['occur', 'are occurred', 'have been occurred', 'were occurred', 'be occurred'], answer: 0, explanation: '"occur" geçişsizdir, edilgen yapılamaz.' },
      { stem: 'The pyramids are now believed ---- by skilled paid workers rather than by slaves.', options: ['to have been built', 'to build', 'being built', 'to be building', 'having built'], answer: 0, explanation: 'Şimdi inanılıyor, inşa geçmişte ve edilgen → to have been built.' },
      { stem: 'Many patients dislike ---- about their medical history in front of other people.', options: ['being asked', 'asking', 'to ask', 'having asked', 'be asked'], answer: 0, explanation: 'dislike + Ving; hastalar soruluyor (edilgen) → being asked.' },
      { stem: 'Before the inspection, the director had all the old laboratory equipment ----.', options: ['replaced', 'replace', 'to replace', 'replacing', 'been replaced'], answer: 0, explanation: 'Causative: have + nesne + V3 → had the equipment replaced.' },
    ],
  },
  {
    id: 'conditionals', group: 'grammar', icon: '🔀', title: 'If Clauses & Wish',
    why: 'Cümle tamamlamada çok sık; özellikle karışık (mixed) koşul ve devrik yapılar.',
    traps: [
      'Ana cümlede "now/today" varsa mixed conditional ara (If had V3 → would V).',
      '"in case" ile "if" karıştırma: in case = önlem.',
    ],
    gen: 'Single sentences testing conditionals: types 1-3, mixed conditionals (if + had V3 → would V now), inversion (Had/Were/Should), unless, provided that, as long as, in case, otherwise, but for / without, wish + V2 / had V3, it is time + V2. Exactly one option must fit tense and logic.',
    questions: [
      { stem: 'If the government ---- stricter regulations earlier, pollution levels would not be so high today.', options: ['had introduced', 'introduced', 'introduces', 'would introduce', 'has introduced'], answer: 0, explanation: 'Geçmişteki koşul, bugünkü sonuç ("today") → mixed: had introduced ... would not be.' },
      { stem: '---- the warnings of scientists been taken seriously, the disaster could have been prevented.', options: ['Had', 'Were', 'Should', 'If', 'Unless'], answer: 0, explanation: 'Type 3 devrik: Had + özne + been V3 = If the warnings had been taken.' },
      { stem: 'The project will be completed on schedule ---- no unexpected problems arise.', options: ['provided that', 'unless', 'in case', 'even if', 'otherwise'], answer: 0, explanation: '"Beklenmedik sorun çıkmaması şartıyla" → provided that.' },
      { stem: 'Without the support of international donors, the hospital ---- years ago.', options: ['would have closed', 'would close', 'will have closed', 'had closed', 'closes'], answer: 0, explanation: '"Without" = olmasaydı; "years ago" → Type 3 sonucu: would have closed.' },
      { stem: 'Many employees wish they ---- more time with their families instead of working overtime.', options: ['could spend', 'can spend', 'will spend', 'have spent', 'are spending'], answer: 0, explanation: 'Şimdiye dair dilek → wish + V2 / could V.' },
      { stem: 'Take an umbrella with you ---- it rains later in the afternoon.', options: ['in case', 'unless', 'provided that', 'as long as', 'otherwise'], answer: 0, explanation: 'Önlem: yağmur yağma ihtimaline karşı → in case.' },
    ],
  },
  {
    id: 'relatives', group: 'grammar', icon: '🔗', title: 'Relative Clauses (Sıfat Cümlecikleri)',
    why: 'Dilbilgisi ve cümle tamamlamada düzenli çıkar; "edat + which" ve "most of whom" kalıpları sevilir.',
    traps: [
      'Boşluktan sonra tam bir cümle (özne+fiil+nesne) varsa "which/who" değil, where/when/whose/edat+which düşün.',
      'İki cümleyi bağlayan bağlaç yokken "them/it" içeren şıklar elenir.',
    ],
    gen: 'Single academic sentences testing relative clauses: who/whom/which/whose/where/when, preposition + which/whom, quantity + of which/of whom, non-defining clauses, sentential which, reduced relatives (Ving / V3 / the first to V).',
    questions: [
      { stem: 'Marie Curie, ---- research on radioactivity earned her two Nobel Prizes, remains an inspiration for women in science.', options: ['whose', 'who', 'whom', 'which', 'that'], answer: 0, explanation: '"Onun araştırması" → sahiplik: whose.' },
      { stem: 'The conditions under ---- the experiment was conducted were carefully controlled.', options: ['which', 'that', 'who', 'where', 'whose'], answer: 0, explanation: 'Edattan sonra nesne için yalnızca "which" gelir (under that olmaz).' },
      { stem: 'The country has more than 200 universities, most of ---- offer programmes taught in English.', options: ['which', 'them', 'that', 'whom', 'whose'], answer: 0, explanation: 'Miktar + of which (üniversiteler nesne). "them" iki cümleyi bağlayamaz.' },
      { stem: 'Reinhold Messner and Peter Habeler were the first climbers ---- the summit of Everest without supplementary oxygen.', options: ['to reach', 'reached', 'reaching', 'who reach', 'have reached'], answer: 0, explanation: '"the first ... to V" kalıbı → to reach.' },
      { stem: 'Students ---- in the survey reported higher levels of stress during exam periods.', options: ['questioned', 'questioning', 'to question', 'who questioned', 'have questioned'], answer: 0, explanation: 'Öğrenciler soruldu (edilgen) → kısaltma V3: questioned.' },
      { stem: 'The 1990s was a decade ---- the internet began to transform everyday life.', options: ['when', 'which', 'where', 'whose', 'why'], answer: 0, explanation: 'Zaman + tam cümle → when (= in which).' },
    ],
  },
  {
    id: 'nounclauses', group: 'grammar', icon: '🧩', title: 'Noun Clauses (İsim Cümlecikleri)',
    why: 'Cümle başı "What/Whether/That" boşlukları ve "suggest that + V1" yapısı sık gelir.',
    traps: [
      'Cümle başında boşluk ve ardından fiil ("... remains unclear / is ...") → özne isim cümleciği: What/Whether/How/That.',
      '"that" isim cümleciğinde özne/nesne eksik olmaz; eksik varsa "what".',
    ],
    gen: 'Single academic sentences testing noun clauses: that / what / whether / if / wh-word + statement order as subject or object, the fact that, whatever/whoever, and the subjunctive after suggest/recommend/insist and it is essential that (base verb).',
    questions: [
      { stem: '---- humans first arrived in the Americas remains a subject of debate among archaeologists.', options: ['When', 'That', 'What', 'Which', 'If'], answer: 0, explanation: 'İnsanların ne zaman geldiği (tam cümle) tartışmalı → When. "What" için cümlede eksik öğe olmalıydı; "If" cümle başında olmaz.' },
      { stem: 'Health experts recommend that every child ---- vaccinated before starting school.', options: ['be', 'is', 'was', 'will be', 'has been'], answer: 0, explanation: 'recommend that + özne + (should) V1 → be.' },
      { stem: 'The study investigates ---- regular exercise can slow down cognitive decline in older adults.', options: ['whether', 'what', 'which', 'whatever', 'whom'], answer: 0, explanation: '"... yavaşlatıp yavaşlatamayacağını" → whether. Cümlede eksik öğe olmadığı için what olmaz.' },
      { stem: '---- surprised the researchers most was the speed at which the virus mutated.', options: ['What', 'That', 'Which', 'It', 'Whether'], answer: 0, explanation: '"surprised"ın öznesi eksik → What (= the thing that).' },
      { stem: 'Nobody has been able to explain ---- the ancient builders managed to move such enormous stones.', options: ['how', 'that', 'what', 'which', 'whose'], answer: 0, explanation: 'Taşları nasıl taşıdıkları (yöntem), cümle eksiksiz → how.' },
    ],
  },
  {
    id: 'gerunds', group: 'grammar', icon: '➰', title: 'Gerund & Infinitive',
    why: 'Fiil + Ving / to V ayrımı ve "to" edatı tuzağı (look forward to Ving) düzenli sorulur.',
    traps: [
      '"committed to / contribute to" sonrası "to find" değil "finding".',
      'stop to buy (almak için durdu) ↔ stop buying (almayı bıraktı) — cümlenin mantığına bak.',
    ],
    gen: 'Single sentences testing gerunds and infinitives: verbs followed by -ing vs to-infinitive, verbs that change meaning (remember, forget, stop, try, regret), "to" as a preposition (look forward to, committed to, contribute to), prepositions + -ing, perfect and passive forms (having done, being done, to have been done).',
    questions: [
      { stem: 'Many people avoid ---- about their financial problems, even with close friends.', options: ['talking', 'to talk', 'talk', 'to have talked', 'be talking'], answer: 0, explanation: 'avoid + Ving.' },
      { stem: 'The company has failed ---- its environmental targets for the third year in a row.', options: ['to meet', 'meeting', 'meet', 'to be met', 'having met'], answer: 0, explanation: 'fail + to V; şirket hedefi karşılıyor (etken) → to meet.' },
      { stem: 'The research team is committed to ---- a cure for the disease within the next decade.', options: ['finding', 'find', 'to find', 'found', 'be found'], answer: 0, explanation: '"committed to" — buradaki to edattır → Ving.' },
      { stem: 'Feeling tired, he stopped ---- a coffee on his way to the office.', options: ['to buy', 'buying', 'buy', 'bought', 'having bought'], answer: 0, explanation: 'Kahve almak için durdu (amaç) → stop to V.' },
      { stem: 'Instead of ---- on fossil fuels, the country plans to invest heavily in solar energy.', options: ['relying', 'to rely', 'rely', 'relied', 'being relied'], answer: 0, explanation: 'Edattan (instead of) sonra Ving.' },
      { stem: 'The suspect denied ---- anywhere near the scene of the crime that night.', options: ['having been', 'to have been', 'to be', 'be', 'been'], answer: 0, explanation: 'deny + Ving; o geceye (öncesi) atıf → having been.' },
    ],
  },
  {
    id: 'conjunctions', group: 'grammar', icon: '🧷', title: 'Bağlaçlar & Geçiş İfadeleri (Conjunctions)',
    why: 'YDS\'nin bel kemiği: dilbilgisi, cloze, cümle tamamlama ve paragraf sorularının hepsinde. Önce iki cümle arasındaki ilişkiyi bul, sonra yapıyı kontrol et.',
    traps: [
      'Anlam doğru ama yapı yanlış şıklar: "despite + cümle", "although + isim" → elenir.',
      '"while" hem zaman (iken) hem zıtlık (oysa) olabilir; whereas yalnızca zıtlık.',
      '"in that" (… olması bakımından) ileri seviye sorularda sık doğru cevaptır.',
    ],
    gen: 'Single academic sentences testing conjunctions and transitions: contrast (although, despite, however, whereas), cause/effect (because of, due to, since, therefore, in that), purpose (so that, in order to), time (as soon as, until, by the time), addition (moreover), correlatives (not only ... but also with inversion, neither ... nor, both ... and). The options must include grammatically wrong ones (despite + clause) and semantically wrong ones.',
    questions: [
      { stem: '---- the treatment proved effective in laboratory tests, it failed to produce the same results in human trials.', options: ['Although', 'Because', 'Since', 'Unless', 'Once'], answer: 0, explanation: 'Laboratuvarda etkili ↔ insanlarda başarısız: zıtlık + cümle → Although.' },
      { stem: 'The open-air festival was cancelled ---- the severe weather conditions.', options: ['due to', 'because', 'although', 'so that', 'whereas'], answer: 0, explanation: 'Sebep + isim öbeği → due to ("because" cümle ister).' },
      { stem: 'Some species have adapted well to urban environments; ----, many others have declined sharply.', options: ['however', 'therefore', 'moreover', 'for instance', 'likewise'], answer: 0, explanation: 'Uyum sağlayan ↔ azalan türler: zıtlık geçişi → however.' },
      { stem: 'The researchers worked through the night ---- they could present their findings at the morning conference.', options: ['so that', 'so as to', 'in order to', 'such that', 'even though'], answer: 0, explanation: 'Amaç + özne + could → so that (so as to / in order to + V1 ister).' },
      { stem: '---- the northern regions receive heavy rainfall throughout the year, the south is mostly arid.', options: ['Whereas', 'Because', 'As long as', 'Despite', 'So'], answer: 0, explanation: 'İki bölgenin karşılaştırılması → Whereas.' },
      { stem: 'Not only ---- the price of food, but it has also forced thousands of farmers to leave their land.', options: ['has the drought raised', 'the drought has raised', 'the drought raised', 'did the drought raised', 'had the drought raised'], answer: 0, explanation: '"Not only" başta → devrik; ikinci yarı "has also forced" olduğundan has the drought raised.' },
      { stem: 'The new policy is controversial ---- it limits individual freedom in the name of public safety.', options: ['in that', 'so that', 'even if', 'in case', 'as if'], answer: 0, explanation: 'Neden tartışmalı? "… olması bakımından" → in that.' },
    ],
  },
  {
    id: 'prepositions', group: 'grammar', icon: '📍', title: 'Edatlar (Prepositions)',
    why: 'Hem dilbilgisi hem cloze\'da her sınavda birkaç soru. Ezber gerektirir; kalıp olarak öğren.',
    traps: [
      'result in ↔ result from: sebep mi sonuç mu öznede, kontrol et.',
      'Kelime defterinde "Kalıplar & edatlar" bölümüne bakarak kendi kelimelerinin edatlarını da çalış.',
    ],
    gen: 'Single academic sentences testing dependent prepositions (adjective/noun/verb + preposition such as vulnerable to, increase in, result in/from, impact on), phrasal prepositions (at the expense of, in terms of, regardless of, in the wake of) and time prepositions (by vs until, during vs for). Each option is a single preposition or prepositional phrase.',
    questions: [
      { stem: 'The rapid growth of cities has resulted ---- serious environmental problems such as air pollution.', options: ['in', 'from', 'on', 'with', 'for'], answer: 0, explanation: 'Büyüme → sorunlar (sonuç): result in.' },
      { stem: 'Many of these diseases result ---- poor hygiene and contaminated water.', options: ['from', 'in', 'to', 'with', 'at'], answer: 0, explanation: 'Hastalıklar kötü hijyenden kaynaklanır: result from.' },
      { stem: 'Children are particularly vulnerable ---- the effects of air pollution.', options: ['to', 'of', 'with', 'on', 'for'], answer: 0, explanation: 'vulnerable to (-e karşı savunmasız).' },
      { stem: 'There has been a sharp increase ---- the number of students applying to study abroad.', options: ['in', 'of', 'at', 'on', 'for'], answer: 0, explanation: 'increase in (bir şeyde artış).' },
      { stem: 'Some factories continued to release toxic waste into rivers ---- the expense of public health.', options: ['at', 'in', 'on', 'by', 'with'], answer: 0, explanation: 'at the expense of (… pahasına).' },
      { stem: 'All applications must be submitted ---- Friday at the latest.', options: ['by', 'until', 'since', 'during', 'for'], answer: 0, explanation: '"at the latest" → son tarih: by.' },
    ],
  },
  {
    id: 'phrasal', group: 'grammar', icon: '🧱', title: 'Phrasal Verbs',
    why: 'Kelime sorularında ve cloze\'da çıkar. Akademik phrasal verb\'leri anlamlarıyla ezberle.',
    traps: [
      'Aynı fiil farklı edatla tamamen başka anlam: break down / break out / break into.',
      'Defterine eklediğin phrasal verb\'lere "phrasal" etiketi verip Kelimeler\'den filtreleyerek tekrar edebilirsin.',
    ],
    gen: 'Single academic sentences testing phrasal verbs common in YDS (carry out, bring about, rule out, stem from, account for, phase out, come up with, figure out, call off, put forward, give rise to, wipe out, set up, look into). Options are five different phrasal verbs in the correct form.',
    questions: [
      { stem: 'The team ---- a series of experiments to test the new hypothesis.', options: ['carried out', 'put off', 'gave up', 'broke down', 'ran out of'], answer: 0, explanation: 'Deney yürütmek → carry out.' },
      { stem: 'The final match was ---- because of the heavy snow.', options: ['called off', 'carried out', 'brought about', 'set up', 'turned out'], answer: 0, explanation: 'Kar yüzünden iptal edildi → called off.' },
      { stem: 'Doctors have ---- the possibility that the illness was caused by food poisoning.', options: ['ruled out', 'made up', 'come across', 'set off', 'run out'], answer: 0, explanation: 'Olasılığı dışlamak → rule out.' },
      { stem: 'Rising unemployment could ---- social unrest in the region.', options: ['bring about', 'put off', 'look into', 'take after', 'give up'], answer: 0, explanation: 'Neden olmak → bring about.' },
      { stem: 'Many of the problems in the education system ---- a chronic lack of funding.', options: ['stem from', 'make up', 'call off', 'come up with', 'set out'], answer: 0, explanation: '… den kaynaklanmak → stem from.' },
      { stem: 'Scientists are still trying to ---- why some people are naturally resistant to the virus.', options: ['figure out', 'turn down', 'put up with', 'break out', 'take off'], answer: 0, explanation: 'Nedenini anlamak/çözmek → figure out.' },
    ],
  },
  {
    id: 'quantifiers', group: 'grammar', icon: '🔢', title: 'Miktar, Belirleyici & Zamirler',
    why: 'Dilbilgisi ve cloze\'da 1-2 soru: few/little, the number of, both/either/neither, that/those of.',
    traps: [
      '"evidence, information, research, equipment, knowledge" sayılamaz → much/little, çoğul -s almaz.',
    ],
    gen: 'Single sentences testing quantifiers, determiners and pronouns: few/a few/little/a little, the number of vs a number of, both/either/neither/none, each/every, another/other/others/the other, that of / those of, the former / the latter, subject-verb agreement.',
    questions: [
      { stem: '---- of the two candidates was qualified for the position, so the committee reopened the application process.', options: ['Neither', 'Both', 'Each', 'All', 'Some'], answer: 0, explanation: 'İki aday, hiçbiri uygun değil, tekil fiil (was) → Neither.' },
      { stem: 'The number of people living alone ---- steadily over the past thirty years.', options: ['has risen', 'have risen', 'are rising', 'rise', 'were risen'], answer: 0, explanation: '"The number of" → tekil fiil; "over the past thirty years" → Present Perfect.' },
      { stem: 'There is ---- evidence to support the claim, so most scientists remain sceptical.', options: ['little', 'few', 'a few', 'many', 'a number of'], answer: 0, explanation: '"evidence" sayılamaz + olumsuz anlam (şüpheci) → little.' },
      { stem: 'The climate of Spain is considerably warmer than ---- of Britain.', options: ['that', 'this', 'those', 'it', 'one'], answer: 0, explanation: '"the climate" tekil → that of.' },
      { stem: 'Some participants preferred the first method, while ---- found the second one easier.', options: ['others', 'another', 'other', 'the other', 'each other'], answer: 0, explanation: 'İsim yerine geçen çoğul "diğerleri" → others.' },
    ],
  },
  {
    id: 'comparatives', group: 'grammar', icon: '⚖️', title: 'Karşılaştırma, so/such, too/enough',
    why: 'Dilbilgisi ve cümle tamamlamada düzenli: "the more ... the more", "so ... that", "such ... that".',
    traps: [
      '"very cheaper" yanlış → much/far/considerably cheaper.',
      '"such" isimden önce, "so" sıfattan önce: such an interesting book / so interesting.',
    ],
    gen: 'Single sentences testing comparatives and superlatives, the more ... the more, as ... as, intensifiers (much/far/considerably + comparative), so ... that, such ... that, too ... to, enough.',
    questions: [
      { stem: 'The more we learn about the human brain, ---- we realise how little we actually understand.', options: ['the more', 'more', 'the most', 'most', 'as much'], answer: 0, explanation: '"The more …, the more …" kalıbı.' },
      { stem: 'The lecture was ---- complicated that most of the students left the hall confused.', options: ['so', 'such', 'too', 'enough', 'very'], answer: 0, explanation: 'so + sıfat + that.' },
      { stem: 'It was ---- a fascinating book that I finished it in a single day.', options: ['such', 'so', 'too', 'very', 'enough'], answer: 0, explanation: 'such + a + sıfat + isim + that.' },
      { stem: 'Solar panels are now ---- cheaper than they were a decade ago.', options: ['considerably', 'very', 'too', 'more', 'so'], answer: 0, explanation: 'Comparative\'i güçlendiren → considerably (very cheaper olmaz).' },
      { stem: 'The water in the lake was not warm ---- for the children to swim in.', options: ['enough', 'too', 'so', 'such', 'very'], answer: 0, explanation: 'sıfat + enough + for sb + to V.' },
    ],
  },

  {
    id: 'mixedgrammar', group: 'grammar', icon: '🧺', title: 'Karışık Dilbilgisi', hidden: true,
    why: 'İçe aktarılan sorulardan konusu otomatik belirlenemeyenler.',
    traps: ['Soruyu çözerken altta çıkan "Konu" menüsünden doğru konuya taşıyabilirsin.'],
    gen: 'Single academic sentences testing a mix of YDS grammar points (tenses, modals, passive, conditionals, relative clauses, conjunctions, prepositions).',
    questions: [],
  },

  // ---------------------------------------------------------- question types
  {
    id: 'vocab', group: 'types', icon: '🔠', title: 'Kelime Soruları',
    why: '6 soru. Tek cümlede boşluk; şıklar aynı türden beş kelime.',
    traps: ["Anlamca yakın iki şık kaldığında collocation'a (birlikte kullanıldığı kelimeye) bak."],
    gen: 'YDS vocabulary questions: one academic sentence with a blank; five options of the same part of speech (verbs, adjectives, adverbs, nouns or phrasal verbs) at B2-C1 level; exactly one fits meaning and collocation.',
    questions: [
      { stem: 'The government has introduced new measures to ---- the impact of rising energy prices on low-income households.', options: ['alleviate', 'exaggerate', 'provoke', 'imitate', 'dismiss'], answer: 0, explanation: 'Etkiyi hafifletmek → alleviate (hafifletmek). Diğerleri: abartmak, kışkırtmak, taklit etmek, göz ardı etmek.' },
      { stem: 'Although the two species look almost ----, genetic tests show that they evolved separately.', options: ['identical', 'hostile', 'fragile', 'reluctant', 'obsolete'], answer: 0, explanation: '"Although … separately" zıtlığı: neredeyse aynı görünüyorlar → identical.' },
      { stem: 'The findings of the study were ---- accepted by the scientific community, and few researchers questioned them.', options: ['widely', 'barely', 'reluctantly', 'hardly', 'vaguely'], answer: 0, explanation: '"few researchers questioned them" → geniş kabul gördü: widely accepted (sık collocation).' },
      { stem: "Rapid urbanisation has put enormous ---- on the city's water supply.", options: ['strain', 'approval', 'relief', 'harmony', 'surplus'], answer: 0, explanation: '"put a strain on" kalıbı: … üzerinde baskı/yük oluşturmak.' },
    ],
  },
  {
    id: 'cloze', group: 'types', icon: '📄', title: 'Cloze Test',
    why: '10 soru (2 paragraf × 5 boşluk). Dilbilgisi + kelime + bağlaç bilgisini paragraf içinde test eder.',
    traps: ['Boşluğu tek cümle olarak değil, paragraf akışıyla çöz; "however/therefore" ayrımı ancak önceki cümleyle anlaşılır.'],
    gen: 'Write ONE academic passage (120-170 words, science/history/health/society) containing exactly 5 blanks written as "(1) ----", "(2) ----" ... "(5) ----". Blanks test a mix of tense/passive, a conjunction or transition, a preposition, a relative pronoun or reduced relative, and an academic vocabulary item. Return 5 questions; each question\'s "passage" is the full passage (identical in all 5), its "stem" is just "(n)" for its blank.',
    questions: (() => {
      const passage = 'Coffee is one of the most widely consumed beverages in the world, and its health effects have long been a subject of debate. For decades, coffee (1) ---- as a potential risk factor for heart disease. However, recent large-scale studies (2) ---- that moderate consumption may actually lower the risk of several chronic conditions. (3) ---- these encouraging findings, experts warn that excessive intake can still cause problems such as insomnia and anxiety. The key, they argue, lies (4) ---- moderation: three to four cups a day appears to be safe for most adults. Pregnant women, (5) ----, are advised to limit their caffeine intake considerably.';
      return [
        { passage, stem: '(1)', options: ['was regarded', 'regarded', 'has regarded', 'is regarding', 'had been regarding'], answer: 0, explanation: 'Kahve "kabul edildi" (edilgen) + "For decades" geçmişte kalan dönem → was regarded.' },
        { passage, stem: '(2)', options: ['have suggested', 'had suggested', 'were suggesting', 'will suggest', 'would have suggested'], answer: 0, explanation: '"recent studies" → yakın geçmiş, etkisi süren → have suggested.' },
        { passage, stem: '(3)', options: ['Despite', 'Although', 'Because', 'Unless', 'So that'], answer: 0, explanation: 'Olumlu bulgular ↔ uyarı: zıtlık + isim öbeği → Despite.' },
        { passage, stem: '(4)', options: ['in', 'on', 'at', 'for', 'with'], answer: 0, explanation: 'lie in (… -de yatmak).' },
        { passage, stem: '(5)', options: ['however', 'therefore', 'for instance', 'moreover', 'thus'], answer: 0, explanation: 'Çoğu yetişkin için güvenli ↔ hamileler sınırlamalı: zıtlık → however.' },
      ];
    })(),
  },
  {
    id: 'completion', group: 'types', icon: '✂️', title: 'Cümle Tamamlama',
    why: '10 soru. Bağlaç mantığı + zaman uyumu + yapı uyumu birlikte test edilir.',
    traps: ['Konuyla ilgili ama mantığı ters şıklar en güçlü çeldiricidir (although sonrası aynı yönlü sonuç).'],
    gen: 'YDS sentence completion: give half of a complex academic sentence (main clause or subordinate clause) with the missing half shown as "----"; five options are the possible other halves; exactly one is correct in grammar (tense agreement, clause structure) and logic (the conjunction relationship).',
    questions: [
      { stem: 'Although the city has invested heavily in public transport, ----.', options: ['traffic congestion remains a serious problem during rush hours', 'more and more people have started to use buses and trams', 'it is now one of the most modern cities in the region', 'because private car ownership has decreased', 'the government plans to build new metro lines next year'], answer: 0, explanation: '"Although" zıtlık ister: yatırım yapıldı ↔ trafik sorunu sürüyor. Diğerleri aynı yönde ya da yapısal olarak hatalı.' },
      { stem: 'If the Earth\'s average temperature continues to rise at its current rate, ----.', options: ['many low-lying coastal areas will be under water by the end of the century', 'the polar ice caps would have melted completely', 'scientists had warned governments for decades', 'since carbon emissions are mainly caused by industry', 'it was the hottest year ever recorded'], answer: 0, explanation: 'If + Present (Type 1) → will + V1.' },
      { stem: '----, the researchers had to repeat the entire experiment.', options: ['Since the original samples had been contaminated', 'Unless the results are published in a scientific journal', 'As the new laboratory will open next year', 'Whereas the funding has been increased', 'So that they would make an error'], answer: 0, explanation: 'Geçmiş + sebep: örnekler (daha önce) kirlenmişti → Since + Past Perfect.' },
      { stem: 'Children who read regularly tend to have a wider vocabulary, ----.', options: ['which in turn helps them perform better at school', 'who are less interested in books', 'whereas reading has no effect on language skills', 'although they spend more time reading', 'that is why they rarely read'], answer: 0, explanation: '", which" önceki fikri niteler: geniş kelime dağarcığı okul başarısına yardım eder. Diğerleri mantıksız.' },
    ],
  },
  {
    id: 'translation', group: 'types', icon: '🔤', title: 'Çeviri (EN → TR / TR → EN)',
    why: '6 soru. Anlamı birebir koruyan seçeneği bulmak: zaman, kip, olumsuzluk, bağlaç ve özne-yüklem ilişkisi.',
    traps: ['"Bulgular gösteriyor" (suggest) ile "kanıtlıyor" (prove) farkı gibi kesinlik derecesi değişen şıklar.'],
    gen: 'YDS translation questions. Alternate directions: either an English academic sentence (stem) with five Turkish translations as options, or a Turkish sentence with five English translations. Exactly one option preserves the full meaning (tense, modality, negation, logical connectors, quantity words); distractors change exactly one of these. In the explanation, say what is wrong in the distractors.',
    questions: [
      { stem: 'Although scientists have made significant progress in understanding the disease, an effective treatment has yet to be developed.', options: ['Bilim insanları hastalığı anlama konusunda önemli ilerleme kaydetmiş olsa da etkili bir tedavi henüz geliştirilmedi.', 'Bilim insanları hastalığı anlamada önemli ilerleme kaydettiği için etkili bir tedavi yakında geliştirilecek.', 'Etkili bir tedavi geliştirilmeden önce bilim insanlarının hastalığı anlama konusunda önemli ilerleme kaydetmesi gerekiyor.', 'Bilim insanları hastalığı anlamada önemli ilerleme kaydetmiş olsa da etkili bir tedavi geliştirmek istememektedir.', 'Hastalığın tedavisi henüz geliştirilmemiş olmasına rağmen bilim insanları hastalığı tam olarak anlamıştır.'], answer: 0, explanation: '"Although" = -e rağmen/-se de; "has yet to be developed" = henüz geliştirilmedi. Diğer şıklar sebep, zorunluluk, istek ya da "tam olarak" gibi anlam ekliyor.' },
      { stem: 'Uzmanlara göre, düzenli egzersiz yalnızca fiziksel sağlığı iyileştirmekle kalmaz, aynı zamanda stresi de azaltır.', options: ['According to experts, regular exercise not only improves physical health but also reduces stress.', 'Experts claim that regular exercise improves physical health only if it reduces stress.', 'According to experts, regular exercise improves physical health rather than reducing stress.', 'Experts say that stress can be reduced only through regular exercise and good physical health.', 'According to experts, regular exercise neither improves physical health nor reduces stress.'], answer: 0, explanation: '"yalnızca … kalmaz, aynı zamanda" = not only … but also.' },
      { stem: 'The findings suggest that children who sleep less than eight hours a night are more likely to have difficulty concentrating at school.', options: ['Bulgular, gecede sekiz saatten az uyuyan çocukların okulda dikkatlerini toplamakta zorlanma olasılığının daha yüksek olduğunu göstermektedir.', 'Bulgular, okulda dikkatini toplamakta zorlanan çocukların gecede sekiz saatten az uyuduğunu kanıtlamaktadır.', 'Bulgulara göre çocukların okulda dikkatlerini toplayabilmeleri için gecede en az sekiz saat uyumaları gerekir.', 'Bulgular, gecede sekiz saatten fazla uyuyan çocukların okulda daha başarılı olduğunu ileri sürmektedir.', 'Bulgular, çocukların çoğunun gecede sekiz saatten az uyuduğu için okulda dikkatini toplayamadığını göstermektedir.'], answer: 0, explanation: '"more likely to" = olasılığı daha yüksek; "suggest" kanıtlamak değil. Diğer şıklar yönü, kesinliği ya da miktarı değiştiriyor.' },
    ],
  },
  {
    id: 'dialogue', group: 'types', icon: '💬', title: 'Diyalog Tamamlama',
    why: '5 soru. Boşluktan sonraki repliğe uyan cevabı bulmak.',
    traps: ['Konuyla ilgili ama sonraki replikle çelişen şık (ör. "trials will start next year" ↔ "trials so far").'],
    gen: 'YDS dialogue completion: a short dialogue (3-5 lines, two named speakers, everyday-academic topic) with one line replaced by "----", given in the stem with line breaks. Five options; only one fits both the previous and the following line.',
    questions: [
      { stem: 'Emma: I\'ve been reading about the four-day working week. Some companies say productivity actually increased.\nDaniel: ----\nEmma: True, but the trials so far suggest that the benefits outweigh the problems.', options: ['That sounds promising, but wouldn\'t it be hard to apply in sectors like healthcare?', 'I agree. That\'s why most companies have already adopted it.', 'Really? I didn\'t know you were looking for a new job.', 'Productivity has nothing to do with working hours, as everyone knows.', 'Yes, the trials will start next year in several countries.'], answer: 0, explanation: '"True, but …" Daniel\'ın bir sorun/itiraz dile getirmesini gerektirir; "trials so far" denemelerin başladığını gösterir.' },
      { stem: 'Student: Professor, could I submit my essay a few days late? I\'ve been ill all week.\nProfessor: ----\nStudent: Thank you so much. I\'ll send it to you by Monday.', options: ['I\'m sorry to hear that. As long as you bring a doctor\'s note, that should be fine.', 'No, the deadline cannot be changed under any circumstances.', 'You should have started writing it much earlier.', 'Which topic did you choose for your essay?', 'I have already graded all the other essays.'], answer: 0, explanation: 'Öğrenci teşekkür ediyor → hoca izin vermiş olmalı.' },
    ],
  },
  {
    id: 'restatement', group: 'types', icon: '🪞', title: 'Yakın Anlamlı Cümle',
    why: '4 soru. Aynı anlamı farklı yapıyla veren cümleyi bulmak (if ↔ because, not … but, despite ↔ although).',
    traps: ['Aynı kelimeleri kullanan ama ilişkiyi tersine çeviren şık genellikle yanlıştır.'],
    gen: 'YDS restatement: one complex English sentence as the stem (use structures like inversion conditionals, not A but B, despite, so ... that, comparatives, modal perfects); five English options, exactly one closest in meaning, the others reverse the logic, change certainty/quantity, or the comparison direction.',
    questions: [
      { stem: 'Had the government acted sooner, the economic crisis would not have been so severe.', options: ['The economic crisis was so severe because the government did not act early enough.', 'The government acted quickly, so the economic crisis was not very severe.', 'Even though the government acted early, the crisis became more severe.', 'The government will act sooner to prevent a severe economic crisis.', 'The economic crisis was severe, but the government was not responsible for it.'], answer: 0, explanation: 'Type 3 (gerçek dışı geçmiş) = gerçekte hükümet geç davrandı ve kriz ağırdı.' },
      { stem: 'It is not the cost of the treatment but its side effects that worry most patients.', options: ['Most patients are concerned about the side effects of the treatment rather than its cost.', 'Both the cost and the side effects of the treatment worry most patients.', 'Most patients worry about the cost of the treatment more than its side effects.', 'Patients would not worry about the side effects if the treatment were cheaper.', 'Neither the cost nor the side effects of the treatment worry patients much.'], answer: 0, explanation: '"not A but B" = B (yan etkiler) endişe verir, A (maliyet) değil → rather than.' },
    ],
  },
  {
    id: 'paracompletion', group: 'types', icon: '🧱', title: 'Paragraf Tamamlama',
    why: '4 soru. Boşluğa önceki ve sonraki cümleyle bağ kuran cümleyi koymak.',
    traps: ['Doğru bilgi içeren ama akışı bozan cümle çeldiricidir.'],
    gen: 'YDS paragraph completion: an academic paragraph of 4-6 sentences with one sentence replaced by "----" (put the paragraph in "passage", stem: "Which sentence best completes the paragraph?"). Five sentence options; one connects logically to both the preceding and following sentences.',
    questions: [
      { passage: 'Sleep plays a vital role in the consolidation of memory. During deep sleep, the brain replays the experiences of the day and transfers important information to long-term storage. ----. In one study, students who slept after learning a list of words remembered significantly more of them than those who stayed awake.', stem: 'Paragrafı en iyi tamamlayan cümle hangisidir?', options: ['This is why a good night\'s sleep after studying can improve learning', 'However, scientists still do not know why we dream', 'Many people suffer from insomnia because of stress', 'Caffeine is the most widely consumed stimulant in the world', 'Students should therefore study late at night instead of sleeping'], answer: 0, explanation: 'Önceki cümle mekanizmayı, sonraki deney örneğini veriyor; araya "bu yüzden uyku öğrenmeyi artırır" sonucu girer.' },
    ],
  },
  {
    id: 'irrelevant', group: 'types', icon: '🚫', title: 'Anlam Bütünlüğünü Bozan Cümle',
    why: '5 soru. Paragrafın akışına uymayan cümleyi bulmak.',
    fixedOptions: true,
    traps: ['Bilgi olarak doğru olan cümle de dışarıda kalabilir; ölçüt doğruluk değil, akış.'],
    gen: 'YDS irrelevant sentence: an academic paragraph of exactly five sentences numbered "(I) ... (II) ... (III) ... (IV) ... (V) ..." put in "passage"; stem: "Which sentence is irrelevant?"; options exactly ["I","II","III","IV","V"] in that order; one sentence shares keywords but breaks the flow.',
    questions: [
      { passage: '(I) Honeybees play a crucial role in the pollination of many food crops. (II) Without them, the production of fruits such as apples and almonds would fall dramatically. (III) In recent years, however, bee populations have declined in many parts of the world. (IV) Honey has been used as a natural remedy for wounds since ancient times. (V) Scientists believe that pesticides, habitat loss and disease are the main causes of this decline.', stem: 'Anlam bütünlüğünü bozan cümle hangisidir?', options: ['I', 'II', 'III', 'IV', 'V'], answer: 3, explanation: 'Paragraf arıların tozlaşmadaki rolü ve nüfus düşüşü hakkında; (IV) balın tıbbi kullanımına sapıyor. (V)\'teki "this decline" (III)\'e bağlanır.' },
    ],
  },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id);

// Static questions get stable ids so progress survives updates.
export function staticQuestions() {
  const out = [];
  for (const t of TOPICS) {
    t.questions.forEach((q, i) => out.push({ ...q, id: `${t.id}-s${i + 1}`, topic: t.id, source: 'static', group: q.passage && t.id === 'cloze' ? `${t.id}-s` : undefined }));
  }
  return out;
}
