// ═══════════════════════════════════════════════════════════════════════
//  App.jsx — SCHWA WARS: The Phoneme Strikes Back
//  Bl4ck5t4r © 2026 · Focus first, panic later
//
//  Corrections applied:
//  ① Group Mode  — fully opaque cards (no bleed-through).
//                  FRONT: term/phoneme only. BACK: clue only.
//                  No hint = 10 pts. Hint used = 5 pts.
//  ② Solo Mode   — 2 attempts per card.
//                  1st try correct = 10 pts. 2nd try correct = 5 pts.
//  ③ Phoneme Hunt — new mechanic:
//                   Show a word + "Listen" button (Web Speech API).
//                   Show a partial IPA transcription with ONE blank slot.
//                   Player taps the correct phoneme symbol from a 6-symbol grid.
//                   Correct 1st try + full transcription correct = 15 pts.
//                   Correct phoneme but transcript wrong = 10 pts.
//                   Correct on 2nd try = 5 pts.
//                   All cards match the visual style of Solo / Group Mode.
// ═══════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────
// § 1  FEED DATA — 50 insight cards
// ─────────────────────────────────────────────────────────────────────
const FEED_DATA = [
  { title: "The Non-Rhotic Nature of RP",       category: "RP Tip",          content: "RP is a non-rhotic accent. The /r/ sound is only pronounced when immediately followed by a vowel. At the end of a word or before a consonant, /r/ is completely silent — unlike General American." },
  { title: "The Schwa Dominance",                category: "Fun Fact",         content: "The schwa (/ə/) is the most common sound in English, appearing in virtually every polysyllabic word. It exists only in unstressed syllables and acts as the default vowel when a syllable is reduced in connected speech." },
  { title: "Dark vs. Light L",                   category: "Memory Trick",     content: "'Light /l/' is a clear sound at word-start (e.g., 'lip', 'let'). 'Dark /ɫ/' is velarised — the tongue body rises toward the velum — and appears syllable-finally or before consonants (e.g., 'full', 'milk')." },
  { title: "Aspiration Rules",                   category: "Technical Theory", content: "In RP, voiceless plosives /p/, /t/, /k/ are aspirated at the start of a stressed syllable. Following /s/ (e.g., 'spin', 'skill'), aspiration disappears entirely. This is conditioned allophony, not free variation." },
  { title: "Minimal Pairs Explained",            category: "Definition",       content: "A minimal pair is two words differing by exactly one phoneme in the same position: 'bat' vs. 'pat', 'ship' vs. 'sheep'. Minimal pairs are the primary diagnostic tool for establishing phonemic contrasts in a language." },
  { title: "Vowel Length in RP",                 category: "RP Tip",          content: "RP 'long' and 'short' vowels differ in quality as well as duration. /iː/ and /ɪ/ occupy distinct articulatory positions — /iː/ is higher and more peripheral. Duration is a secondary cue; quality is primary." },
  { title: "The Glottal Stop",                   category: "Fun Fact",         content: "The glottal stop [ʔ] is increasingly common in RP as an allophone of /t/ before another consonant or in word-final position (e.g., 'that cat'). Once considered non-standard, it now appears in educated speech." },
  { title: "Why Phonemes?",                      category: "Definition",       content: "A phoneme is an abstract cognitive category, not a physical sound. It has no single acoustic reality — it is realised as context-sensitive allophones. Two listeners may perceive different phonemes from the same phone if their grammars differ." },
  { title: "Linking R vs. Intrusive R",          category: "Technical Theory", content: "Linking /r/ surfaces where the spelling has an /r/ (e.g., 'far away'). Intrusive /r/ inserts an /r/ with no spelling basis (e.g., 'law[r] and order') to avoid a vowel hiatus. Both are natural processes in RP." },
  { title: "Fortis vs. Lenis",                   category: "Memory Trick",     content: "Fortis consonants (/p t k f θ s ʃ/) are voiceless and produced with greater muscular tension. Lenis consonants (/b d g v ð z ʒ/) are voiced with less tension. In RP, vowels are longer before lenis consonants." },
  { title: "Syllable Structure",                 category: "Definition",       content: "The English syllable requires a Nucleus (vowel). The Onset and Coda are optional. English permits complex clusters: up to three consonants in the onset (e.g., 'str-') and four in the coda (e.g., '-ngths')." },
  { title: "Plosive Phases",                     category: "Memory Trick",     content: "Every plosive has three phases: Closure (articulators seal), Hold (pressure builds), Release (air bursts out). Audible release is not obligatory — in coda position, RP plosives are often unreleased." },
  { title: "Connected Speech: Elision",          category: "Technical Theory", content: "Elision is the deletion of a phoneme in fast connected speech. Most commonly, /t/ and /d/ delete in consonant clusters (e.g., 'mos(t) people', 'han(d)bag'). The phoneme is not 'swallowed' — it simply never articulates." },
  { title: "Assimilation Direction",             category: "Technical Theory", content: "Regressive (anticipatory) assimilation is most common in RP: a phoneme takes on features of the following sound. 'Ten boys' → /tem bɔɪz/ (/n/ → /m/ anticipating /b/). Progressive assimilation is rare." },
  { title: "The TRAP-BATH Split",                category: "RP Tip",          content: "In RP, words like 'bath', 'path', 'grass' use /ɑː/ (the BATH set), while Northern English dialects use /æ/. The split is lexically conditioned and is one of the most socially salient markers of RP identity." },
  { title: "Foot & Rhythm",                      category: "Definition",       content: "English is a stress-timed language: feet (each containing one stressed syllable) tend to recur at roughly equal intervals. Unstressed syllables compress to maintain the rhythm — hence schwa proliferation in connected speech." },
  { title: "The Sonority Hierarchy",             category: "Technical Theory", content: "Sonority ranks sounds from most (vowels) to least (plosives): vowels > glides > liquids > nasals > fricatives > plosives. The Sonority Sequencing Principle requires onsets to rise toward the nucleus and codas to fall." },
  { title: "Yod Coalescence",                    category: "Fun Fact",         content: "In rapid RP speech, /tj/ → /tʃ/ and /dj/ → /dʒ/: 'did you' → /dɪdʒu/. This is yod coalescence. It is now widely accepted in informal RP and marks the shift from older conservative RP." },
  { title: "Tone Unit Structure",                category: "Definition",       content: "A tone unit (or intonation phrase) contains one obligatory tonic syllable — the nucleus of the intonation contour. It may be preceded by a head (stressed syllables before the tonic) and pre-head (unstressed syllables before the first stress)." },
  { title: "The Fall-Rise Tone",                 category: "RP Tip",          content: "The fall-rise intonation (↘↗) implies 'there's more to say' or signals reservation. 'It's ALright' with a fall-rise suggests it's acceptable but not ideal. This is distinct from a simple rise, which marks a yes/no question." },
  { title: "Coalescence of Sibilants",           category: "Technical Theory", content: "At word boundaries in fast speech, /s/ + /j/ → /ʃ/ (e.g., 'bless you') and /z/ + /j/ → /ʒ/. This is boundary coalescence, distinct from within-word yod coalescence." },
  { title: "Smoothing in RP",                    category: "RP Tip",          content: "Smoothing reduces diphthongs before schwa: /aɪə/ → /aː/ ('fire'), /aʊə/ → /aː/ ('power'). Triphthongs simplify dramatically in casual RP." },
  { title: "Cardinal Vowels",                    category: "Definition",       content: "Cardinal Vowels (Daniel Jones, 1917) are a fixed reference system of 18 vowels arranged by tongue height and backness. They are articulatory benchmarks, not sounds of any real language." },
  { title: "The NURSE Merger",                   category: "Fun Fact",         content: "In older RP, /ɪr/, /ɛr/, /ʌr/ were distinct vowels. The NURSE merger collapsed all three into /ɜː/, so 'fern', 'fir', and 'fur' are now homophonous in RP." },
  { title: "Broad vs. Narrow Transcription",     category: "Definition",       content: "Broad (phonemic) transcription uses /slashes/ and shows only phonemic contrasts: /pɪn/. Narrow (phonetic) transcription uses [brackets] and includes allophonic detail: [pʰɪn]. Know which is required in any given task." },
  { title: "Secondary Articulation",             category: "Technical Theory", content: "Secondary articulations overlay a primary constriction. Labialisation accompanies /w/ and /ʃ/. Palatalisation colours /j/. Velarisation raises the tongue body toward the velum — it defines dark /ɫ/ in RP." },
  { title: "Voice Onset Time (VOT)",             category: "Technical Theory", content: "VOT is the interval between plosive release and the start of vocal fold vibration. RP aspirated stops have long positive VOT (40–80ms). Unaspirated stops after /s/ have short VOT." },
  { title: "The Great Vowel Shift",              category: "Fun Fact",         content: "Between c.1400–1700, all Middle English long vowels shifted upward in height. High vowels /iː/ and /uː/ diphthongised to /aɪ/ and /aʊ/. This explains most spelling-pronunciation mismatches in Modern English." },
  { title: "Syllabic Consonants",                category: "Definition",       content: "Syllabic consonants function as a syllable nucleus without a vowel. In RP, syllabic /n/ appears in 'button' [ˈbʌt.n̩], syllabic /l/ in 'bottle' [ˈbɒt.l̩]. They arise when schwa elides before a sonorant in the same syllable." },
  { title: "Resyllabification in Practice",      category: "RP Tip",          content: "In connected speech, coda consonants reanalyse as the onset of the next vowel-initial word: 'turn off' → /tɜː.nɒf/. This is resyllabification and applies the Maximal Onset Principle across word boundaries." },
  { title: "Strong vs. Weak Forms",              category: "Fun Fact",         content: "English function words have two phonological shapes. 'And' in isolation is /ænd/ (strong form). In connected speech it reduces to /ənd/ or /ən/ or even /n/ (weak forms). Failure to use weak forms sounds unnaturally emphatic." },
  { title: "Compensatory Lengthening",           category: "Technical Theory", content: "When a consonant is deleted, the preceding vowel may lengthen to compensate. In RP, vowels before voiced consonants are longer than before voiceless — aiding the fortis/lenis distinction." },
  { title: "The Maximal Onset Principle",        category: "Definition",       content: "When a consonant could be assigned to either a coda or the following onset, English prefers the onset: 'be-tween' not 'bet-ween'. Constraint: the onset cluster must be a legal onset in English." },
  { title: "Tonic Placement & Meaning",          category: "RP Tip",          content: "'JOHN saw Mary' (not someone else). 'John SAW Mary' (he didn't just hear it). 'John saw MARY' (not Jane). Same words, three entirely different meanings — all signalled by tonic placement alone." },
  { title: "Nasal Plosion",                      category: "Technical Theory", content: "When a plosive is followed by a homorganic nasal, air escapes through the nose: 'hidden' [ˈhɪd.n̩]. The oral release is inaudible; only nasal plosion occurs." },
  { title: "Lateral Plosion",                    category: "Technical Theory", content: "Lateral plosion occurs when a lateral immediately follows an alveolar plosive: 'bottle', 'little'. The tongue tip stays on the alveolar ridge; air escapes laterally. No central oral burst occurs." },
  { title: "Phonotactics",                       category: "Definition",       content: "Phonotactics describes the permissible sound sequences in a language. English permits onset clusters like /str/, /spl/, /skr/ but disallows /tl/, /sr/ word-initially. These constraints are acquired implicitly." },
  { title: "Flap vs. RP /r/",                   category: "Fun Fact",         content: "American English uses an alveolar flap [ɾ] for intervocalic /t/ and /d/ ('butter', 'ladder'). RP uses a post-alveolar approximant [ɹ] for /r/. The flap is a single ballistic gesture; the approximant is a sustained constriction." },
  { title: "Intonation: Declarative vs. Interrogative", category: "RP Tip",  content: "In RP, yes/no questions default to a rising tone; wh-questions and declaratives use a falling tone. A falling question signals authority; a rising declarative implies doubt or seeks confirmation." },
  { title: "Phonemic vs. Phonetic",              category: "Definition",       content: "Phonemic analysis identifies the contrastive units of a language. Phonetic analysis describes the physical sounds produced. A phoneme is cognitive and abstract; a phone is acoustic and articulatory." },
  { title: "Place Assimilation at Boundaries",   category: "Technical Theory", content: "In RP, nasal place assimilation regularly crosses word boundaries: 'ten past' → /tem pɑːst/ (/n/ → /m/ before /p/). This optional but natural process can also apply to plosives in fast speech." },
  { title: "Elision of /h/",                    category: "Fun Fact",         content: "Function words beginning with /h/ ('him', 'her', 'have', 'his') regularly drop the /h/ in connected speech: 'I saw him' → /aɪ sɔːɪm/. H-dropping in lexical words is non-standard in RP." },
  { title: "Foot-Head Rhythm",                   category: "RP Tip",          content: "English speech is organised into iambic feet at the phrasal level but trochaic feet at the word level — most disyllabic content words are trochees (STRESSed-unstressed). This tension creates the characteristic syncopation of English prosody." },
  { title: "Manner of Articulation Summary",     category: "Memory Trick",     content: "Plosives: complete oral closure, sudden release. Fricatives: partial closure, turbulent airflow. Affricates: plosive onset + fricative release. Nasals: oral closure, nasal airflow. Laterals: central closure, lateral airflow." },
  { title: "Allophonic Rules are Automatic",     category: "Definition",       content: "Native speakers apply allophonic rules unconsciously. You cannot choose to produce an unaspirated /p/ at the start of 'pin' in English — aspiration is automatic. This distinguishes allophony from free variation." },
  { title: "The Onset-Coda Asymmetry",           category: "Technical Theory", content: "English onsets and codas are not mirror images. /ŋ/ can only appear in codas. /h/ can only appear in onsets. This asymmetric distribution is a fundamental typological property of English syllable structure." },
  { title: "Perception vs. Production",          category: "Fun Fact",         content: "Listeners are remarkably tolerant of articulatory variation but hypersensitive to phonemic contrast. You can mumble an entire sentence and be understood, but substituting one phoneme creates a different word." },
  { title: "The Vowel Quadrilateral",            category: "Definition",       content: "The vowel quadrilateral maps tongue height (high to low) against tongue backness (front to back). It is a schematic, not anatomical — the trapezoid shape approximates the acoustic vowel space." },
  { title: "Coarticulation",                     category: "Technical Theory", content: "Coarticulation is the simultaneous or overlapping articulation of adjacent segments. Your tongue begins moving toward the /k/ in 'king' while still producing /ɪ/. Speech is a continuous, overlapping motor programme." },
  { title: "Why RP?",                            category: "RP Tip",          content: "Received Pronunciation is not 'better' English — it is the accent described in most British EFL dictionaries and phonetics textbooks (including Roach). Its value is pedagogical. Fewer than 3% of British people speak it natively." },
];

// ─────────────────────────────────────────────────────────────────────
// § 2  DRILL CARDS — 60 cards, 4 categories
// ─────────────────────────────────────────────────────────────────────
const ALL_CARDS = [
  { category: "Phonemes", item: "/p/",    clue: "Voiceless bilabial plosive; aspirated in syllable-initial position in RP" },
  { category: "Phonemes", item: "/b/",    clue: "Voiced bilabial plosive; final devoicing common in RP" },
  { category: "Phonemes", item: "/t/",    clue: "Voiceless alveolar plosive; aspirated word-initially; may be glottalized in coda" },
  { category: "Phonemes", item: "/d/",    clue: "Voiced alveolar plosive; devoiced in word-final position in RP" },
  { category: "Phonemes", item: "/k/",    clue: "Voiceless velar plosive; aspirated pre-vocalically in stressed syllables" },
  { category: "Phonemes", item: "/g/",    clue: "Voiced velar plosive; realised with incomplete closure in fast speech" },
  { category: "Phonemes", item: "/f/",    clue: "Voiceless labiodental fricative; contrasts with /v/ in minimal pairs" },
  { category: "Phonemes", item: "/v/",    clue: "Voiced labiodental fricative; devoiced word-finally in RP" },
  { category: "Phonemes", item: "/θ/",    clue: "Voiceless dental fricative; non-sibilant; tongue tip contacts upper incisors" },
  { category: "Phonemes", item: "/ð/",    clue: "Voiced dental fricative; occurs in function words: the, this, that" },
  { category: "Phonemes", item: "/ʃ/",    clue: "Voiceless palato-alveolar fricative; lip rounding accompanies articulation" },
  { category: "Phonemes", item: "/ŋ/",    clue: "Voiced velar nasal; coda-only in RP; never syllable-initial" },
  { category: "Phonemes", item: "/ɜː/",   clue: "Long mid-central vowel; RP realisation of NURSE set; no lip rounding" },
  { category: "Phonemes", item: "/æ/",    clue: "Short front open vowel; TRAP set; lower than cardinal vowel 4 in RP" },
  { category: "Phonemes", item: "/dʒ/",   clue: "Voiced palato-alveolar affricate; JUDGE set; complex articulation onset" },
  { category: "Technical Theory", item: "Minimal pair",               clue: "Two words differing by exactly one phoneme; proves phonemic contrast in a language" },
  { category: "Technical Theory", item: "Complementary distribution", clue: "Two allophones never occurring in same environment; not contrastive" },
  { category: "Technical Theory", item: "Free variation",             clue: "Two realisations of same phoneme interchangeable without meaning change" },
  { category: "Technical Theory", item: "Syllable",                   clue: "Unit of phonological organisation with obligatory nucleus, optional onset/coda" },
  { category: "Technical Theory", item: "Phoneme",                    clue: "Abstract mental unit; realised as physically varying allophones in speech" },
  { category: "Technical Theory", item: "Allophone",                  clue: "Phonetic variant of a phoneme; conditioned by phonological environment" },
  { category: "Technical Theory", item: "Aspiration",                 clue: "Burst of voiceless airflow following release of voiceless plosive in RP" },
  { category: "Technical Theory", item: "Assimilation",               clue: "Phoneme adopts features of adjacent phoneme; regressive type most common in RP" },
  { category: "Technical Theory", item: "Elision",                    clue: "Omission of a phoneme in connected speech; common in consonant clusters" },
  { category: "Technical Theory", item: "Strong form",                clue: "Full citation form of function word used in stressed/contrastive contexts" },
  { category: "Technical Theory", item: "Weak form",                  clue: "Reduced, schwa-containing form of function word in unstressed positions" },
  { category: "Technical Theory", item: "Tone unit",                  clue: "Stretch of speech carrying a single intonation contour with one tonic syllable" },
  { category: "Technical Theory", item: "Nuclear tone",               clue: "Primary pitch movement on tonic syllable; conveys attitudinal/grammatical meaning" },
  { category: "Technical Theory", item: "Linking /r/",                clue: "Inserted between final /ə/ or /ɑː/ and a following vowel in RP" },
  { category: "Technical Theory", item: "Intrusive /r/",              clue: "Inserted after /ə ɔː ɑː/ before a vowel where no historical /r/ exists" },
  { category: "Word Structure", item: "Onset",                   clue: "Consonant(s) preceding the nucleus within the syllable" },
  { category: "Word Structure", item: "Coda",                    clue: "Consonant(s) following the nucleus within the syllable" },
  { category: "Word Structure", item: "Nucleus",                 clue: "Obligatory peak of the syllable; typically a vowel in English" },
  { category: "Word Structure", item: "Rime",                    clue: "Nucleus plus coda; unit relevant to rhyme and stress assignment" },
  { category: "Word Structure", item: "Open syllable",           clue: "Syllable with nucleus but no coda; CV structure" },
  { category: "Word Structure", item: "Closed syllable",         clue: "Syllable ending in one or more consonants; CVC or CVCC etc." },
  { category: "Word Structure", item: "Primary stress",          clue: "Strongest degree of stress in a word; marked with ˈ in IPA transcription" },
  { category: "Word Structure", item: "Secondary stress",        clue: "Lesser degree of stress; marked with ˌ; common in long polysyllabic words" },
  { category: "Word Structure", item: "Weak syllable",           clue: "Unstressed syllable; typically contains /ə/ or /ɪ/ in RP" },
  { category: "Word Structure", item: "Foot",                    clue: "Rhythmic unit: one stressed syllable and its following unstressed syllables" },
  { category: "Word Structure", item: "Cluster",                 clue: "Sequence of two or more consonants with no intervening vowel" },
  { category: "Word Structure", item: "Morpheme boundary",       clue: "Junction between meaningful units; may trigger assimilation or allophonic change" },
  { category: "Word Structure", item: "Resyllabification",       clue: "Reanalysis of syllable boundaries across word boundaries in connected speech" },
  { category: "Word Structure", item: "Maximal onset principle", clue: "Preference for assigning consonants to onset rather than coda cross-linguistically" },
  { category: "Word Structure", item: "Geminate",                clue: "Long or doubled consonant; rare in native RP words; occurs across morpheme boundaries" },
  { category: "Articulatory Actions", item: "Bilabial",              clue: "Place of articulation involving both lips; /p b m/ in RP" },
  { category: "Articulatory Actions", item: "Alveolar",              clue: "Articulation at alveolar ridge; place for /t d n s z l r/ in RP" },
  { category: "Articulatory Actions", item: "Velar",                 clue: "Articulation with back of tongue against velum; /k g ŋ/ in RP" },
  { category: "Articulatory Actions", item: "Glottal stop",          clue: "Complete closure at glottis; allophone of /t/ in RP before consonants/finally" },
  { category: "Articulatory Actions", item: "Lateral",               clue: "Airflow escapes around sides of tongue; /l/ in RP" },
  { category: "Articulatory Actions", item: "Approximant",           clue: "Articulator approaches but does not cause friction; /w j r/ in RP" },
  { category: "Articulatory Actions", item: "Nasalisation",          clue: "Velum lowered; airflow directed through nasal cavity; feature of nasal consonants" },
  { category: "Articulatory Actions", item: "Affrication",           clue: "Plosive release through homorganic fricative; /tʃ dʒ/ in RP" },
  { category: "Articulatory Actions", item: "Lip rounding",          clue: "Protrusion/rounding of lips; accompanies /w uː ɔː ʃ ʒ/ in RP" },
  { category: "Articulatory Actions", item: "Vocalisation",          clue: "Dark /l/ realised as back vowel /o/ or /ʊ/ in syllable-final position" },
  { category: "Articulatory Actions", item: "Flap",                  clue: "Brief single tap of tongue tip against alveolar ridge; not standard in RP" },
  { category: "Articulatory Actions", item: "Dental articulation",   clue: "Tongue tip at upper teeth; place for /θ ð/ in RP" },
  { category: "Articulatory Actions", item: "Palatal",               clue: "Tongue body raised to hard palate; /j/ in RP; secondary feature of palatalisation" },
  { category: "Articulatory Actions", item: "VOT (Voice Onset Time)", clue: "Interval between plosive release and onset of voicing; long in aspirated RP stops" },
  { category: "Articulatory Actions", item: "Dark /l/",              clue: "Velarised lateral; tongue body raised to velum; RP coda-position realisation" },
];

const CATEGORIES = ["Phonemes", "Technical Theory", "Word Structure", "Articulatory Actions"];

// ─────────────────────────────────────────────────────────────────────
// § 3  PHONEME HUNT DATA
//  Each entry: a real English word, its full RP IPA, the IPA shown
//  to the player WITH the target phoneme replaced by "___", the target
//  phoneme, and 5 distractor phonemes drawn from a curated pool.
// ─────────────────────────────────────────────────────────────────────
const HUNT_QUESTIONS = [
  { word: "ship",     fullIPA: "/ʃɪp/",         gapped: "/___ɪp/",        target: "/ʃ/",  distractors: ["/s/","/tʃ/","/ʒ/","/z/","/h/"] },
  { word: "think",    fullIPA: "/θɪŋk/",         gapped: "/___ɪŋk/",       target: "/θ/",  distractors: ["/t/","/s/","/ð/","/f/","/d/"] },
  { word: "this",     fullIPA: "/ðɪs/",          gapped: "/___ɪs/",        target: "/ð/",  distractors: ["/d/","/θ/","/z/","/v/","/t/"] },
  { word: "bed",      fullIPA: "/bed/",           gapped: "/b___d/",        target: "/e/",  distractors: ["/æ/","/ɪ/","/ə/","/ʌ/","/ɒ/"] },
  { word: "cat",      fullIPA: "/kæt/",           gapped: "/k___t/",        target: "/æ/",  distractors: ["/e/","/ɑː/","/ʌ/","/ɒ/","/ɪ/"] },
  { word: "nurse",    fullIPA: "/nɜːs/",          gapped: "/n___s/",        target: "/ɜː/", distractors: ["/ɔː/","/uː/","/ə/","/ʌ/","/ɑː/"] },
  { word: "sing",     fullIPA: "/sɪŋ/",           gapped: "/sɪ___/",        target: "/ŋ/",  distractors: ["/n/","/m/","/g/","/k/","/ɡ/"] },
  { word: "judge",    fullIPA: "/dʒʌdʒ/",         gapped: "/___ʌdʒ/",       target: "/dʒ/", distractors: ["/d/","/tʃ/","/ʒ/","/z/","/ð/"] },
  { word: "church",   fullIPA: "/tʃɜːtʃ/",        gapped: "/___ɜːtʃ/",      target: "/tʃ/", distractors: ["/ʃ/","/dʒ/","/t/","/s/","/θ/"] },
  { word: "bath",     fullIPA: "/bɑːθ/",          gapped: "/bɑː___/",       target: "/θ/",  distractors: ["/s/","/t/","/f/","/ð/","/h/"] },
  { word: "about",    fullIPA: "/əˈbaʊt/",        gapped: "/___ˈbaʊt/",     target: "/ə/",  distractors: ["/ʌ/","/æ/","/ɒ/","/e/","/ɪ/"] },
  { word: "feel",     fullIPA: "/fiːl/",           gapped: "/f___l/",        target: "/iː/", distractors: ["/ɪ/","/e/","/ɜː/","/eɪ/","/ɛ/"] },
  { word: "foot",     fullIPA: "/fʊt/",            gapped: "/f___t/",        target: "/ʊ/",  distractors: ["/uː/","/ɒ/","/ʌ/","/ɔː/","/ə/"] },
  { word: "goose",    fullIPA: "/ɡuːs/",           gapped: "/ɡ___s/",        target: "/uː/", distractors: ["/ʊ/","/ɔː/","/əʊ/","/ɒ/","/ʌ/"] },
  { word: "face",     fullIPA: "/feɪs/",           gapped: "/f___s/",        target: "/eɪ/", distractors: ["/e/","/aɪ/","/æ/","/ɪ/","/iː/"] },
  { word: "price",    fullIPA: "/praɪs/",          gapped: "/pr___s/",       target: "/aɪ/", distractors: ["/eɪ/","/ɔɪ/","/æ/","/e/","/aʊ/"] },
  { word: "choice",   fullIPA: "/tʃɔɪs/",          gapped: "/tʃ___s/",       target: "/ɔɪ/", distractors: ["/aɪ/","/ɔː/","/eɪ/","/aʊ/","/ɒɪ/"] },
  { word: "mouth",    fullIPA: "/maʊθ/",           gapped: "/m___θ/",        target: "/aʊ/", distractors: ["/aɪ/","/ɒ/","/ɔː/","/ɑː/","/əʊ/"] },
  { word: "goat",     fullIPA: "/ɡəʊt/",           gapped: "/ɡ___t/",        target: "/əʊ/", distractors: ["/aʊ/","/ɔː/","/ɒ/","/uː/","/ɑː/"] },
  { word: "near",     fullIPA: "/nɪə/",            gapped: "/n___/",         target: "/ɪə/", distractors: ["/ɪ/","/eə/","/iː/","/e/","/ʊə/"] },
  { word: "square",   fullIPA: "/skweə/",          gapped: "/skw___/",       target: "/eə/", distractors: ["/ɪə/","/e/","/eɪ/","/æ/","/ʊə/"] },
  { word: "van",      fullIPA: "/væn/",            gapped: "/___æn/",        target: "/v/",  distractors: ["/f/","/b/","/w/","/p/","/ð/"] },
  { word: "zoo",      fullIPA: "/zuː/",            gapped: "/___uː/",        target: "/z/",  distractors: ["/s/","/ʒ/","/dʒ/","/θ/","/ð/"] },
  { word: "red",      fullIPA: "/red/",            gapped: "/___ed/",        target: "/r/",  distractors: ["/l/","/w/","/j/","/d/","/n/"] },
  { word: "yes",      fullIPA: "/jes/",            gapped: "/___es/",        target: "/j/",  distractors: ["/w/","/dʒ/","/ʒ/","/i/","/l/"] },
];

// All unique phoneme symbols in the game (for distractor pool safety)
const ALL_PHONEME_SYMBOLS = [...new Set(
  HUNT_QUESTIONS.flatMap(q => [q.target, ...q.distractors])
)];

// ─────────────────────────────────────────────────────────────────────
// § 4  STYLE TOKENS
// ─────────────────────────────────────────────────────────────────────
const CAT = {
  "Phonemes":             { dot: "bg-violet-500", badge: "bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30" },
  "Technical Theory":     { dot: "bg-sky-500",    badge: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30" },
  "Word Structure":       { dot: "bg-amber-500",  badge: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30" },
  "Articulatory Actions": { dot: "bg-rose-500",   badge: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30" },
};
const FEED_BADGE = {
  "RP Tip":           "bg-emerald-500/15 text-emerald-400",
  "Fun Fact":         "bg-sky-500/15 text-sky-400",
  "Memory Trick":     "bg-amber-500/15 text-amber-400",
  "Technical Theory": "bg-violet-500/15 text-violet-400",
  "Definition":       "bg-rose-500/15 text-rose-400",
};

// ─────────────────────────────────────────────────────────────────────
// § 5  LOCAL STORAGE
// ─────────────────────────────────────────────────────────────────────
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─────────────────────────────────────────────────────────────────────
// § 6  UTILITIES
// ─────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build 4 MCQ options for Solo Mode */
function buildOptions(correct, pool) {
  const others = shuffle(pool.filter(c => c.item !== correct.item)).slice(0, 3).map(c => c.item);
  return shuffle([correct.item, ...others]);
}

/** Build 6 IPA symbol options for Phoneme Hunt */
function buildHuntOptions(q) {
  return shuffle([q.target, ...q.distractors]);
}

const pctStr = (s, a) => a === 0 ? "—" : `${Math.round((s / a) * 100)}%`;

function defaultDark() {
  const saved = LS.get("sw_dark", null);
  if (saved !== null) return saved;
  return new Date().getHours() >= 20;
}
function applyTheme(d) {
  d ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark");
}

// Web Speech API helper
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

// ─────────────────────────────────────────────────────────────────────
// § 7  SHARED BUTTON — always readable in both themes
// ─────────────────────────────────────────────────────────────────────
function Btn({ onClick, children, className = "", disabled = false, outline = false, danger = false }) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#3A5A40] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const solid = "bg-[#3A5A40] text-white hover:bg-[#2d4732]";
  const out   = "border-2 border-[#3A5A40] text-[#3A5A40] hover:bg-[#3A5A40]/10";
  const dng   = "border-2 border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${base} ${danger ? dng : outline ? out : solid} ${className}`}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 8  SPLASH SCREEN
// ─────────────────────────────────────────────────────────────────────
function SplashScreen({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#E6D4BE] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#E6D4BE] overflow-hidden relative">
      <div className="absolute w-80 h-80 rounded-full bg-[#3A5A40]/10 blur-3xl -top-10 -left-20 pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-[#3A5A40]/10 blur-3xl -bottom-10 -right-10 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-xs w-full">
        <span className="text-7xl font-bold text-[#3A5A40] font-serif leading-none">ə</span>
        <div>
          <h1 className="text-5xl font-bold tracking-tight font-serif">Schwa Wars</h1>
          <p className="mt-2 text-sm tracking-widest uppercase opacity-50">The Phoneme Strikes Back</p>
        </div>
        <p className="text-xs opacity-40 leading-relaxed">Peter Roach · RP Standard · 60 drill cards</p>
        <Btn onClick={onStart} className="w-full py-3.5 text-base mt-2">Start Mission</Btn>
        <p className="text-[10px] opacity-25 font-mono">Bl4ck5t4r © 2026</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 9  NICKNAME GATE
// ─────────────────────────────────────────────────────────────────────
function NicknameGate({ onSave }) {
  const [name, setName] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => { const t = name.trim(); if (t) onSave(t); };
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#E6D4BE] dark:bg-[#1A1A1A]">
      <div className="w-full max-w-sm p-8 rounded-2xl border border-[#3A5A40]/25 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
        <h2 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE] mb-1">Identify yourself</h2>
        <p className="text-xs text-[#1A1A1A]/50 dark:text-[#E6D4BE]/50 mb-6">Your callsign is saved locally.</p>
        <label className="block text-[10px] uppercase tracking-widest text-[#3A5A40] mb-2">Callsign</label>
        <input ref={ref} value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="e.g. Linguist42" maxLength={24}
          className="w-full px-4 py-3 rounded-xl border border-[#3A5A40]/30 bg-white/80 dark:bg-black/30 text-[#1A1A1A] dark:text-[#E6D4BE] placeholder-black/25 dark:placeholder-white/20 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#3A5A40] transition-all"
        />
        <Btn onClick={submit} disabled={!name.trim()} className="w-full py-3">Engage →</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 10  HUD
// ─────────────────────────────────────────────────────────────────────
function HUD({ nickname, score, attempts, streak, onOpenSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#3A5A40]/20 bg-[#E6D4BE]/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md px-4 py-2.5 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#3A5A40] font-serif leading-none">Schwa Wars</p>
        <p className="text-[10px] text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40 truncate mt-0.5">{nickname}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {[
          { label: "Score",   value: score },
          { label: "Acc",     value: pctStr(score, attempts) },
          { label: streak >= 3 ? "🔥" : "Streak", value: streak, glow: streak >= 3 },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center px-2 py-1 rounded-lg ${s.glow ? "bg-[#3A5A40]/20 ring-1 ring-[#3A5A40]" : "bg-black/5 dark:bg-white/5"}`}>
            <span className={`text-sm font-bold leading-none ${s.glow ? "text-[#3A5A40]" : "text-[#1A1A1A] dark:text-[#E6D4BE]"}`}>{s.value}</span>
            <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40 mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>
      <button onClick={onOpenSettings} aria-label="Settings"
        className="w-8 h-8 ml-1 rounded-lg flex items-center justify-center text-base border border-[#3A5A40]/30 hover:bg-[#3A5A40]/10 active:scale-95 transition-all">
        ⚙️
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 11  SETTINGS DRAWER
// ─────────────────────────────────────────────────────────────────────
function SettingsDrawer({ show, onClose, activeCats, onToggleCat, onResetStats, onResetAll, isDark, onToggleTheme }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-72 flex flex-col shadow-2xl border-l border-[#3A5A40]/20 bg-[#E6D4BE] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#E6D4BE]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A5A40]/20">
          <h2 className="font-bold font-serif text-base">Settings</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-100 text-lg active:scale-95 transition-all">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          <section>
            <p className="text-[10px] uppercase tracking-widest text-[#3A5A40] mb-3">Theme</p>
            <button onClick={onToggleTheme}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[#3A5A40]/25 hover:bg-[#3A5A40]/10 active:scale-95 transition-all">
              <span className="text-sm">{isDark ? "Dark Mode" : "Light Mode"}</span>
              <span>{isDark ? "🌙" : "☀️"}</span>
            </button>
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-widest text-[#3A5A40] mb-3">Active Categories</p>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map(cat => {
                const on = activeCats.includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={on} onChange={() => onToggleCat(cat)} className="sr-only" />
                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${on ? "bg-[#3A5A40] border-[#3A5A40]" : "border-black/30 dark:border-white/30"}`}>
                      {on && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT[cat].dot}`} />
                    <span className="text-sm">{cat}</span>
                  </label>
                );
              })}
            </div>
            {activeCats.length === 0 && <p className="text-xs text-red-500 mt-2">Select at least one category.</p>}
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-widest text-[#3A5A40] mb-3">Stats</p>
            <div className="flex flex-col gap-2">
              <Btn outline onClick={() => { onResetStats(); onClose(); }} className="w-full">↺ Reset Stats</Btn>
              <Btn danger onClick={() => { onResetAll(); onClose(); }} className="w-full">✕ Full Reset</Btn>
            </div>
          </section>
          <section>
            <p className="text-[10px] uppercase tracking-widest text-[#3A5A40] mb-3">About</p>
            <div className="rounded-xl border border-[#3A5A40]/20 p-4 text-xs text-[#1A1A1A]/60 dark:text-[#E6D4BE]/60 leading-relaxed">
              <p className="font-semibold mb-1">Schwa Wars: The Phoneme Strikes Back</p>
              <p>Based on Peter Roach's <em>English Phonetics and Phonology</em>. RP Standard.</p>
              <p className="mt-2 font-mono">Bl4ck5t4r © 2026<br />Focus first, panic later.</p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 12  BOTTOM NAV — Home · Play · Feed
// ─────────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab, onPlayTabPress }) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "play", label: "Play", icon: "🎮" },
    { id: "feed", label: "Feed", icon: "📖" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#3A5A40]/20 bg-[#E6D4BE]/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md flex">
      {tabs.map(t => (
        <button key={t.id}
          onClick={() => t.id === "play" ? onPlayTabPress() : setTab(t.id)}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-[10px] uppercase tracking-widest transition-all active:scale-95 relative ${
            tab === t.id ? "text-[#3A5A40] font-bold" : "text-[#1A1A1A] dark:text-[#E6D4BE] opacity-35 hover:opacity-60"
          }`}>
          {tab === t.id && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#3A5A40]" />}
          <span className="text-xl leading-none">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 13  HOME SCREEN
// ─────────────────────────────────────────────────────────────────────
function HomeScreen({ nickname }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center max-w-md mx-auto w-full">
      <span className="text-5xl text-[#3A5A40] font-serif mb-6 leading-none">ə</span>
      <h1 className="text-3xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE] leading-tight">
        Schwa Wars:<br />
        <span className="text-[#3A5A40]">The Phoneme Strikes Back</span>
      </h1>
      <p className="mt-4 text-sm text-[#1A1A1A]/50 dark:text-[#E6D4BE]/50">
        Welcome back, <strong className="text-[#1A1A1A] dark:text-[#E6D4BE]">{nickname}</strong>.
      </p>
      <p className="mt-2 text-xs text-[#1A1A1A]/25 dark:text-[#E6D4BE]/25 font-mono">Bl4ck5t4r © 2026 · Focus first, panic later</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 14  SHARED: progress bar row
// ─────────────────────────────────────────────────────────────────────
function ProgressRow({ current, total, category }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40">{current} / {total}</span>
        {category && <span className={`px-2 py-0.5 rounded-full ${CAT[category]?.badge ?? ""}`}>{category}</span>}
      </div>
      <div className="w-full h-0.5 rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full bg-[#3A5A40] rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}

// Shared solid card surface class — opaque in both themes, no bleed
const CARD_SURFACE = "rounded-2xl border border-[#3A5A40]/20 bg-[#F5ECD8] dark:bg-[#2A2A2A]";

// ─────────────────────────────────────────────────────────────────────
// § 15  SOLO MODE
//  2 attempts per card.
//  1st attempt correct → 10 pts.  2nd attempt correct → 5 pts.  Wrong twice → 0.
// ─────────────────────────────────────────────────────────────────────
function SoloMode({ deck, onResult, onBack }) {
  const [cards]             = useState(() => shuffle(deck));
  const [idx, setIdx]       = useState(0);
  const [options, setOpts]  = useState(() => buildOptions(cards[0], cards));
  const [attempt, setAttempt] = useState(1);       // 1 or 2
  const [wrong1, setWrong1] = useState(null);       // first wrong guess
  const [finalResult, setFinalResult] = useState(null); // "correct1"|"correct2"|"wrong"

  useEffect(() => {
    if (idx >= cards.length) return;
    setOpts(buildOptions(cards[idx], cards));
    setAttempt(1);
    setWrong1(null);
    setFinalResult(null);
  }, [idx, cards]);

  const advance = () => setIdx(i => i + 1);

  if (idx >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
        <span className="text-5xl">🎉</span>
        <h3 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE]">Mission Complete</h3>
        <p className="text-sm text-[#1A1A1A]/50 dark:text-[#E6D4BE]/50">{cards.length} cards drilled</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Btn onClick={() => setIdx(0)} className="w-full">↺ Drill Again</Btn>
          <Btn outline onClick={onBack} className="w-full">← Choose Mode</Btn>
        </div>
      </div>
    );
  }

  const card      = cards[idx];
  const answered  = finalResult !== null;

  const choose = (opt) => {
    if (answered) return;
    if (opt === card.item) {
      const res = attempt === 1 ? "correct1" : "correct2";
      setFinalResult(res);
      onResult(true, attempt === 2); // correct; was it 2nd try?
    } else {
      if (attempt === 1) {
        setWrong1(opt);
        setAttempt(2);
      } else {
        setFinalResult("wrong");
        onResult(false);
      }
    }
  };

  const optCls = opt => {
    const base = "w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] focus:outline-none disabled:cursor-default";
    if (answered) {
      if (opt === card.item) return `${base} border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold`;
      if (opt === wrong1)    return `${base} border-red-400/50 bg-red-500/10 text-red-600 dark:text-red-400 opacity-70`;
      return `${base} opacity-20 border-transparent text-[#1A1A1A] dark:text-[#E6D4BE]`;
    }
    if (opt === wrong1) return `${base} border-red-400/50 bg-red-500/10 text-red-600 dark:text-red-400 cursor-not-allowed`;
    return `${base} border-[#3A5A40]/25 bg-[#F5ECD8] dark:bg-[#2A2A2A] hover:border-[#3A5A40] text-[#1A1A1A] dark:text-[#E6D4BE]`;
  };

  const ptLabel = finalResult === "correct1" ? "+10 pts" : finalResult === "correct2" ? "+5 pts" : "";
  const attemptsLeft = answered ? 0 : (attempt === 1 ? 2 : 1);

  return (
    <div className="flex flex-col gap-5 px-4 py-5 w-full max-w-xl mx-auto">
      <ProgressRow current={idx + 1} total={cards.length} category={card.category} />

      {/* Attempt indicator */}
      {!answered && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#3A5A40]">Attempts left</span>
          <div className="flex gap-1">
            {[1, 2].map(n => (
              <span key={n} className={`w-2 h-2 rounded-full ${n <= attemptsLeft ? "bg-[#3A5A40]" : "bg-black/15 dark:bg-white/15"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Clue card */}
      <div className={`w-full ${CARD_SURFACE} px-6 py-6 flex flex-col gap-2 min-h-[110px] justify-center`}>
        <p className="text-[10px] uppercase tracking-widest text-[#3A5A40]">Identify the term</p>
        <p className="text-base leading-relaxed text-[#1A1A1A] dark:text-[#E6D4BE]">{card.clue}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {options.map(opt => (
          <button key={opt} disabled={answered || opt === wrong1}
            onClick={() => choose(opt)} className={optCls(opt)}>
            <span className="flex items-center gap-2">
              {answered && opt === card.item && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
              {opt === wrong1 && <span className="text-red-500">✗</span>}
              {opt}
            </span>
          </button>
        ))}
      </div>

      {/* Feedback + next */}
      {answered && (
        <div className="flex flex-col gap-3 w-full">
          <div className={`w-full rounded-xl border px-4 py-3 text-sm text-center font-semibold ${
            finalResult !== "wrong"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}>
            {finalResult !== "wrong"
              ? `✓ Correct! ${ptLabel}`
              : `✗ Answer: ${card.item}`}
          </div>
          <Btn onClick={advance} className="w-full py-3">
            {idx + 1 < cards.length ? "Next →" : "See Results →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 16  GROUP MODE
//
//  Card rendering strategy — state-toggle (NO CSS 3-D transform):
//  • CSS `backface-visibility` is unreliable across browsers when
//    backdrop-blur, overflow-hidden, or certain compositing contexts
//    are present, causing both faces to render simultaneously.
//  • Solution: only ONE face is ever mounted in the DOM at a time.
//    `showClue` controls which face is rendered via a conditional.
//    There is zero possibility of visual overlap or bleed-through.
//  • A smooth cross-fade transition (`transition-opacity duration-200`)
//    provides the visual "flip" feel without CSS 3-D.
//
//  Scoring: no hint = 10 pts · hint viewed = 5 pts.
// ─────────────────────────────────────────────────────────────────────
function GroupMode({ deck, onResult, onBack }) {
  const [cards]              = useState(() => shuffle(deck));
  const [idx, setIdx]        = useState(0);
  // showClue: which face is visible. false = FRONT (term). true = BACK (clue).
  const [showClue, setShow]  = useState(false);
  const [hintUsed, setHint]  = useState(false);
  const [answered, setAns]   = useState(null); // null | "correct" | "wrong"
  // Animate: briefly fade to 0 opacity during the "flip" transition
  const [fading, setFading]  = useState(false);

  // Reset all card state when the index advances
  useEffect(() => {
    setShow(false);
    setHint(false);
    setAns(null);
    setFading(false);
  }, [idx]);

  if (idx >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
        <span className="text-5xl">🎉</span>
        <h3 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE]">
          Mission Complete
        </h3>
        <p className="text-sm text-[#1A1A1A]/50 dark:text-[#E6D4BE]/50">
          {cards.length} cards reviewed
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Btn onClick={() => setIdx(0)} className="w-full">↺ Review Again</Btn>
          <Btn outline onClick={onBack} className="w-full">← Choose Mode</Btn>
        </div>
      </div>
    );
  }

  const card = cards[idx];
  const mark = result => {
    setAns(result);
    onResult(result === "correct", hintUsed);
  };
  const next = () => setIdx(i => i + 1);

  // Cross-fade "flip": fade out → swap face → fade in
  const triggerFlip = () => {
    if (answered) return;
    setFading(true);
    setTimeout(() => {
      setShow(s => {
        const next = !s;
        if (next && !hintUsed) setHint(true); // first reveal = hint used
        return next;
      });
      setFading(false);
    }, 150); // half the CSS transition duration
  };

  // ── Shared card container classes ──────────────────────────────────
  // bg-[#F5ECD8] / dark:bg-[#2A2A2A] are fully opaque — no transparency.
  const cardBase =
    "w-full rounded-2xl border flex flex-col items-center justify-center gap-4 px-6 py-8 min-h-[220px] cursor-pointer select-none transition-opacity duration-150";

  const cardFront = `${cardBase} border-[#3A5A40]/25 bg-[#F5ECD8] dark:bg-[#2A2A2A]`;

  const cardBack = answered === "correct"
    ? `${cardBase} border-emerald-500/50 bg-emerald-50 dark:bg-[#1a2e1e]`
    : answered === "wrong"
    ? `${cardBase} border-red-500/50 bg-red-50 dark:bg-[#2e1a1a]`
    : `${cardBase} border-[#3A5A40]/40 bg-[#EDE3D0] dark:bg-[#333333]`;

  return (
    <div className="flex flex-col gap-4 px-4 py-5 w-full max-w-xl mx-auto">
      <ProgressRow current={idx + 1} total={cards.length} category={card.category} />

      {/* Scoring hint banner */}
      {!answered && (
        <div className={`w-full rounded-xl px-4 py-2 text-xs text-center border ${
          hintUsed
            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-[#3A5A40]/20 bg-[#3A5A40]/5 text-[#3A5A40]"
        }`}>
          {hintUsed
            ? "💡 Clue viewed — correct answer scores 5 pts"
            : "👁 Guess without clue for 10 pts"}
        </div>
      )}

      {/* ── CARD — only ONE face rendered at a time ───────────────── */}
      {!showClue ? (
        // ── FRONT: term / phoneme / concept ─────────────────────────
        <div
          onClick={!answered ? triggerFlip : undefined}
          className={`${cardFront} ${fading ? "opacity-0" : "opacity-100"}`}
        >
          {/* Category badge */}
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${CAT[card.category]?.badge}`}>
            {card.category}
          </span>

          {/* The concept — large and prominent, nothing else in this face */}
          <p className="text-3xl sm:text-4xl font-bold text-center font-serif text-[#1A1A1A] dark:text-[#E6D4BE] leading-tight break-words w-full">
            {card.item}
          </p>

          {!answered && (
            <p className="text-[10px] text-[#1A1A1A]/30 dark:text-[#E6D4BE]/30 tracking-wider">
              tap to reveal clue
            </p>
          )}
        </div>
      ) : (
        // ── BACK: technical clue only ────────────────────────────────
        <div
          onClick={!answered ? triggerFlip : undefined}
          className={`${cardBack} ${fading ? "opacity-0" : "opacity-100"}`}
        >
          <p className="text-[10px] uppercase tracking-widest text-[#3A5A40]">
            Technical Clue
          </p>

          {/* The clue — the only text in this face */}
          <p className="text-sm text-center leading-relaxed text-[#1A1A1A] dark:text-[#E6D4BE]">
            {card.clue}
          </p>

          {answered ? (
            <p className={`text-sm font-semibold ${
              answered === "correct"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {answered === "correct"
                ? hintUsed ? "✓ Correct (5 pts)" : "✓ Correct (10 pts)"
                : "✗ Marked wrong"}
            </p>
          ) : (
            <p className="text-[10px] text-[#1A1A1A]/30 dark:text-[#E6D4BE]/30 tracking-wider">
              tap to flip back
            </p>
          )}
        </div>
      )}
      {/* ── END CARD ──────────────────────────────────────────────── */}

      {/* Action buttons — state-driven, never overlap the card */}
      <div className="flex flex-col gap-3 w-full">
        {answered ? (
          // After marking: single Next button
          <Btn onClick={next} className="w-full py-3">
            {idx + 1 < cards.length ? "Next Card →" : "See Results →"}
          </Btn>
        ) : showClue ? (
          // Clue is visible: mark correct or wrong
          <div className="flex gap-3">
            <button
              onClick={() => mark("wrong")}
              className="flex-1 py-3 rounded-xl border-2 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold text-sm active:scale-95 transition-all"
            >
              ✗ Wrong
            </button>
            <button
              onClick={() => mark("correct")}
              className="flex-1 py-3 rounded-xl border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-sm active:scale-95 transition-all"
            >
              ✓ Correct
            </button>
          </div>
        ) : (
          // Front visible: self-mark without clue OR reveal clue
          <div className="flex gap-2.5">
            <button
              onClick={() => { setAns("wrong"); onResult(false, false); }}
              className="flex-1 py-3 rounded-xl border-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold text-sm active:scale-95 transition-all"
            >
              ✗ Wrong
            </button>
            <button
              onClick={() => mark("correct")}
              className="flex-1 py-3 rounded-xl border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-sm active:scale-95 transition-all"
            >
              ✓ Correct
            </button>
            <button
              onClick={triggerFlip}
              className="px-3 py-3 rounded-xl border-2 border-[#3A5A40]/30 text-xs font-semibold text-[#3A5A40] hover:bg-[#3A5A40]/10 active:scale-95 transition-all whitespace-nowrap"
            >
              💡 Clue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 17  PHONEME HUNT
//  New mechanic — matching the rest of the app's visual style:
//  • Show a real English word + 🔊 Listen button (Web Speech)
//  • Show a partial IPA transcription with the target phoneme as "___"
//  • Player picks the correct phoneme from a 3×2 grid of IPA symbols
//  • Scoring: 1st try correct + transcription written correctly = 15 pts
//             1st try correct but skips transcription check = 10 pts
//             2nd try correct = 5 pts  |  Both wrong = 0 pts
// ─────────────────────────────────────────────────────────────────────
function PhonemeHunt({ onResult, onBack }) {
  const [qs]               = useState(() => shuffle(HUNT_QUESTIONS));
  const [idx, setIdx]      = useState(0);
  const [options, setOpts] = useState(() => buildHuntOptions(qs[0]));
  const [attempt, setAttempt] = useState(1);        // 1 | 2
  const [wrong1, setWrong1]   = useState(null);     // symbol of first wrong guess
  const [finalResult, setFR]  = useState(null);     // null | "15" | "10" | "5" | "0"
  // Transcription input
  const [userTx, setUserTx]   = useState("");
  const [txPhase, setTxPhase] = useState(false);    // true = show transcription input
  const [huntScore, setHS]    = useState(0);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (idx >= qs.length) return;
    setOpts(buildHuntOptions(qs[idx]));
    setAttempt(1); setWrong1(null); setFR(null);
    setUserTx(""); setTxPhase(false);
  }, [idx, qs]);

  useEffect(() => { if (txPhase) inputRef.current?.focus(); }, [txPhase]);

  const q = qs[idx];

  const advance = () => setIdx(i => i + 1);

  const choose = sym => {
    if (finalResult !== null || txPhase) return;
    if (sym === q.target) {
      // Correct phoneme — move to transcription phase
      setTxPhase(true);
    } else {
      if (attempt === 1) { setWrong1(sym); setAttempt(2); }
      else {
        setFR("0"); onResult(false);
      }
    }
  };

  const submitTranscription = () => {
    const clean  = userTx.trim().replace(/\s+/g, "");
    const correct = q.fullIPA.replace(/\s+/g, "");
    // Lenient match: ignore surrounding slashes
    const normalize = s => s.replace(/^\/|\/$/g, "");
    const txOk = normalize(clean) === normalize(correct);
    const pts  = attempt === 1 ? (txOk ? "15" : "10") : "5";
    const ptNum = parseInt(pts);
    setHS(s => s + ptNum);
    setFR(pts);
    onResult(true, false); // counts as correct for streak/score
  };

  const skipTranscription = () => {
    const pts = attempt === 1 ? "10" : "5";
    setHS(s => s + parseInt(pts));
    setFR(pts);
    onResult(true, false);
  };

  if (idx >= qs.length) {
    const max = qs.length * 15;
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
        <span className="text-6xl font-bold text-[#3A5A40] font-serif">ə</span>
        <h3 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE]">Hunt Complete</h3>
        <div className={`w-full max-w-xs ${CARD_SURFACE} px-8 py-5 text-center`}>
          <p className="text-[10px] uppercase tracking-widest text-[#3A5A40] mb-1">Score</p>
          <p className="text-4xl font-black text-[#1A1A1A] dark:text-[#E6D4BE]">
            {huntScore} <span className="text-base font-normal text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40">/ {max}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Btn onClick={() => { setIdx(0); setHS(0); }} className="w-full">↺ Hunt Again</Btn>
          <Btn outline onClick={onBack} className="w-full">← Choose Mode</Btn>
        </div>
      </div>
    );
  }

  const answered   = finalResult !== null;
  const ptColors   = { "15": "text-emerald-600 dark:text-emerald-400", "10": "text-sky-600 dark:text-sky-400", "5": "text-amber-600 dark:text-amber-400", "0": "text-red-600 dark:text-red-400" };
  const attemptsLeft = answered ? 0 : (attempt === 1 ? 2 : 1);

  const symCls = sym => {
    const base = "flex items-center justify-center rounded-xl border-2 h-14 text-lg font-bold font-mono transition-all active:scale-95 focus:outline-none select-none";
    if (sym === wrong1) return `${base} border-red-400/50 bg-red-500/10 text-red-500 cursor-not-allowed`;
    if (answered && sym === q.target) return `${base} border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 scale-105`;
    if (answered)  return `${base} opacity-20 border-transparent text-[#1A1A1A] dark:text-[#E6D4BE] cursor-default`;
    if (txPhase)   return `${base} opacity-30 border-transparent text-[#1A1A1A] dark:text-[#E6D4BE] cursor-default`;
    return `${base} border-[#3A5A40]/25 bg-[#F5ECD8] dark:bg-[#2A2A2A] hover:border-[#3A5A40] hover:bg-[#3A5A40]/10 text-[#1A1A1A] dark:text-[#E6D4BE] cursor-pointer`;
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-5 w-full max-w-xl mx-auto">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#3A5A40]">Phoneme Hunt</p>
          <p className="text-[10px] text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40">{idx + 1} / {qs.length}</p>
        </div>
        <span className="text-xs font-bold text-[#3A5A40] bg-[#3A5A40]/10 px-3 py-1 rounded-full">{huntScore} pts</span>
      </div>

      <div className="w-full h-0.5 rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-full bg-[#3A5A40] rounded-full transition-all duration-500"
          style={{ width: `${((idx + 1) / qs.length) * 100}%` }} />
      </div>

      {/* Word card — same style as Solo clue card */}
      <div className={`w-full ${CARD_SURFACE} px-6 py-5 flex flex-col gap-3`}>
        <p className="text-[10px] uppercase tracking-widest text-[#3A5A40]">Complete the transcription</p>

        {/* Word + listen */}
        <div className="flex items-center gap-4">
          <p className="text-4xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE]">{q.word}</p>
          <button onClick={() => speak(q.word)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#3A5A40] border border-[#3A5A40]/30 px-3 py-1.5 rounded-lg hover:bg-[#3A5A40]/10 active:scale-95 transition-all">
            🔊 Listen
          </button>
        </div>

        {/* Gapped IPA — the blank is highlighted */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-base">
          <span className="text-[#1A1A1A]/60 dark:text-[#E6D4BE]/60">
            {q.gapped.split("___")[0]}
          </span>
          <span className={`px-2 py-0.5 rounded-lg font-bold border ${txPhase && !answered ? "border-[#3A5A40] bg-[#3A5A40]/10 text-[#3A5A40]" : answered ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
            {txPhase || answered ? q.target : "___"}
          </span>
          <span className="text-[#1A1A1A]/60 dark:text-[#E6D4BE]/60">
            {q.gapped.split("___")[1]}
          </span>
        </div>

        {/* Attempt pips */}
        {!answered && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40">Attempts</span>
            {[1, 2].map(n => (
              <span key={n} className={`w-2 h-2 rounded-full ${n <= attemptsLeft ? "bg-[#3A5A40]" : "bg-black/15 dark:bg-white/15"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Phase A: pick phoneme symbol */}
      {!txPhase && !answered && (
        <div className="grid grid-cols-3 gap-2.5">
          {options.map(sym => (
            <button key={sym} onClick={() => choose(sym)} disabled={sym === wrong1}
              className={symCls(sym)}>
              {sym}
            </button>
          ))}
        </div>
      )}

      {/* Phase B: transcription input */}
      {txPhase && !answered && (
        <div className={`w-full ${CARD_SURFACE} px-5 py-5 flex flex-col gap-3`}>
          <p className="text-[10px] uppercase tracking-widest text-[#3A5A40]">
            Now type the full IPA transcription of <strong>{q.word}</strong>
          </p>
          <p className="text-[10px] text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40">
            Include slashes. Example: /pɪn/
          </p>
          <input
            ref={inputRef}
            value={userTx}
            onChange={e => setUserTx(e.target.value)}
            onKeyDown={e => e.key === "Enter" && userTx.trim() && submitTranscription()}
            placeholder={q.gapped}
            className="w-full px-4 py-3 rounded-xl border border-[#3A5A40]/30 bg-white dark:bg-black/30 text-[#1A1A1A] dark:text-[#E6D4BE] font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#3A5A40] transition-all placeholder-black/25 dark:placeholder-white/20"
          />
          <div className="flex gap-2">
            <Btn onClick={submitTranscription} disabled={!userTx.trim()} className="flex-1">
              Submit (+{attempt === 1 ? "15/10" : "5"} pts)
            </Btn>
            <button onClick={skipTranscription}
              className="px-4 py-2.5 rounded-xl border-2 border-[#3A5A40]/25 text-xs font-semibold text-[#3A5A40] hover:bg-[#3A5A40]/10 active:scale-95 transition-all">
              Skip (+{attempt === 1 ? "10" : "5"})
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div className="flex flex-col gap-3">
          <div className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold ${
            finalResult !== "0"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}>
            {finalResult !== "0" ? (
              <span className={ptColors[finalResult ?? "0"]}>
                {finalResult === "15" && "✓ Perfect! Phoneme + transcription correct — +15 pts"}
                {finalResult === "10" && "✓ Phoneme correct! Transcription skipped — +10 pts"}
                {finalResult === "5"  && "✓ Got it on second try — +5 pts"}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">✗ Both attempts wrong. Answer: {q.target}</span>
            )}
          </div>
          {answered && finalResult !== "0" && (
            <div className={`text-xs font-mono px-3 py-2 rounded-lg border border-[#3A5A40]/20 ${CARD_SURFACE}`}>
              Full IPA: <span className="text-[#3A5A40] font-bold">{q.fullIPA}</span>
            </div>
          )}
          <Btn onClick={advance} className="w-full py-3">
            {idx + 1 < qs.length ? "Next Word →" : "See Results →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 18  PLAY SCREEN — mode picker + sub-router
// ─────────────────────────────────────────────────────────────────────
function PlayScreen({ deck, onResult }) {
  const [mode, setMode] = useState(null);

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-10 gap-6 max-w-md mx-auto w-full">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#3A5A40] mb-1">Choose your mission</p>
          <h2 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE]">Game Mode</h2>
        </div>
        {deck.length === 0 && (
          <p className="text-sm text-[#1A1A1A]/40 dark:text-[#E6D4BE]/40 text-center">
            No categories selected — open ⚙️ Settings to enable some.
          </p>
        )}
        <div className="flex flex-col gap-4 w-full">
          {[
            { id: "solo",   emoji: "🎯", title: "Solo Mode",     desc: "Read the clue — pick from 4 options. 2 attempts: 10 pts first try, 5 pts second.",       count: `${deck.length} cards`,           disabled: deck.length === 0 },
            { id: "group",  emoji: "🃏", title: "Group Mode",    desc: "Front: the term. Flip for the clue. Self-mark: 10 pts no hint, 5 pts with hint.",        count: `${deck.length} cards`,           disabled: deck.length === 0 },
            { id: "phoneme",emoji: "ə",  title: "Phoneme Hunt",  desc: "Hear a word, spot the phoneme, complete the IPA. Up to 15 pts per round.",               count: `${HUNT_QUESTIONS.length} words`, disabled: false, accent: true },
          ].map(m => (
            <button key={m.id} disabled={m.disabled} onClick={() => !m.disabled && setMode(m.id)}
              className={`group flex items-start gap-4 p-5 rounded-2xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#3A5A40] active:scale-[0.98] ${
                m.disabled ? "opacity-40 cursor-not-allowed border-black/10 dark:border-white/10 bg-transparent" :
                m.accent   ? "border-[#3A5A40]/50 bg-[#3A5A40]/10 hover:bg-[#3A5A40]/15 hover:border-[#3A5A40]" :
                             `border-[#3A5A40]/20 ${CARD_SURFACE} hover:border-[#3A5A40]`
              }`}>
              <span className={`text-3xl mt-0.5 font-serif ${m.accent ? "text-[#3A5A40]" : ""}`}>{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:text-[#3A5A40] transition-colors text-[#1A1A1A] dark:text-[#E6D4BE]">{m.title}</p>
                <p className="text-xs text-[#1A1A1A]/50 dark:text-[#E6D4BE]/50 mt-1 leading-relaxed">{m.desc}</p>
                <p className="text-xs text-[#3A5A40] mt-2">{m.count} →</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "solo")    return <SoloMode    key="solo"    deck={deck} onResult={onResult} onBack={() => setMode(null)} />;
  if (mode === "group")   return <GroupMode   key="group"   deck={deck} onResult={onResult} onBack={() => setMode(null)} />;
  if (mode === "phoneme") return <PhonemeHunt key="phoneme"             onResult={onResult} onBack={() => setMode(null)} />;
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// § 19  FEED SCREEN
// ─────────────────────────────────────────────────────────────────────
function FeedScreen() {
  const H = "calc(100dvh - 116px)";
  return (
    <div className="overflow-y-scroll overscroll-none" style={{ scrollSnapType: "y mandatory", height: H }}>
      {FEED_DATA.map((item, i) => (
        <div key={i} className="flex flex-col justify-center px-6 py-10 gap-6 w-full max-w-xl mx-auto"
          style={{ scrollSnapAlign: "start", height: H, minHeight: H }}>
          <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/25 dark:text-[#E6D4BE]/25">
            {i + 1} / {FEED_DATA.length}
          </p>
          <span className={`text-[10px] px-2.5 py-1 rounded-full w-fit font-medium ${FEED_BADGE[item.category] ?? "bg-gray-500/15 text-gray-400"}`}>
            {item.category}
          </span>
          <h3 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-[#E6D4BE] leading-snug">{item.title}</h3>
          <p className="text-sm leading-relaxed text-[#1A1A1A]/70 dark:text-[#E6D4BE]/70">{item.content}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#3A5A40]/20" />
            <span className="text-[#3A5A40] font-serif">ə</span>
            <div className="flex-1 h-px bg-[#3A5A40]/20" />
          </div>
          {i === 0 && <p className="text-center text-[10px] text-[#1A1A1A]/25 dark:text-[#E6D4BE]/25 tracking-widest">swipe up to continue</p>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// § 20  ROOT APP
// ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]       = useState(() => LS.get("sw_phase",    "splash"));
  const [nickname, setNickname] = useState(() => LS.get("sw_nickname", null));
  const [isDark,   setIsDark]   = useState(defaultDark);
  const [score,    setScore]    = useState(() => LS.get("sw_score",    0));
  const [attempts, setAttempts] = useState(() => LS.get("sw_attempts", 0));
  const [streak,   setStreak]   = useState(() => LS.get("sw_streak",   0));
  const [activeCats, setActiveCats] = useState(() => LS.get("sw_cats", [...CATEGORIES]));
  const [tab,      setTab]      = useState("home");
  const [settings, setSettings] = useState(false);
  const [playKey,  setPlayKey]  = useState(0);

  useEffect(() => { applyTheme(isDark); }, [isDark]);
  useEffect(() => { LS.set("sw_dark",     isDark);     }, [isDark]);
  useEffect(() => { LS.set("sw_phase",    phase);      }, [phase]);
  useEffect(() => { LS.set("sw_nickname", nickname);   }, [nickname]);
  useEffect(() => { LS.set("sw_score",    score);      }, [score]);
  useEffect(() => { LS.set("sw_attempts", attempts);   }, [attempts]);
  useEffect(() => { LS.set("sw_streak",   streak);     }, [streak]);
  useEffect(() => { LS.set("sw_cats",     activeCats); }, [activeCats]);

  const deck = useMemo(() =>
    activeCats.length === 0 ? []
      : shuffle(ALL_CARDS.filter(c => activeCats.includes(c.category))),
    [activeCats]
  );

  // Unified result handler
  // correct: bool | secondTry: bool (Solo 2nd attempt)
  // For Group: onResult(correct, hintUsed)
  // For Phoneme Hunt: handled internally; onResult(true/false, false) just updates streak
  const handleResult = useCallback((correct, secondTryOrHint = false) => {
    setAttempts(a => a + 1);
    if (correct) {
      // Scoring is managed inside each game; here we just count correct/streak
      setScore(s => s + (secondTryOrHint ? 5 : 10));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  }, []);

  const toggleCat = useCallback(cat => {
    setActiveCats(prev =>
      prev.includes(cat)
        ? prev.length === 1 ? prev : prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  }, []);

  const resetStats = useCallback(() => { setScore(0); setAttempts(0); setStreak(0); }, []);
  const resetAll   = useCallback(() => {
    resetStats(); setNickname(null); setPhase("splash");
    setTab("home"); setActiveCats([...CATEGORIES]); setPlayKey(k => k + 1);
  }, [resetStats]);

  const handlePlayTabPress = () => { setTab("play"); setPlayKey(k => k + 1); };

  if (phase === "splash")   return <SplashScreen onStart={() => setPhase(nickname ? "app" : "nickname")} />;
  if (phase === "nickname") return <NicknameGate onSave={n => { LS.set("sw_nickname", n); setNickname(n); setPhase("app"); }} />;

  return (
    <div className="min-h-screen bg-[#E6D4BE] dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-[#E6D4BE] flex flex-col">
      <HUD
        nickname={nickname}
        score={score}
        attempts={attempts}
        streak={streak}
        onOpenSettings={() => setSettings(true)}
      />
      <main className="flex-1 flex flex-col overflow-y-auto pb-[72px]">
        {tab === "home" && <HomeScreen nickname={nickname} />}
        {tab === "play" && (
          <PlayScreen
            key={`play-${activeCats.join(",")}-${playKey}`}
            deck={deck}
            onResult={handleResult}
          />
        )}
        {tab === "feed" && <FeedScreen />}
      </main>
      <BottomNav tab={tab} setTab={setTab} onPlayTabPress={handlePlayTabPress} />
      <SettingsDrawer
        show={settings}
        onClose={() => setSettings(false)}
        activeCats={activeCats}
        onToggleCat={toggleCat}
        onResetStats={resetStats}
        onResetAll={resetAll}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
      />
    </div>
  );
}
