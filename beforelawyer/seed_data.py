"""Seed data: landmark legal cases, glossary terms, and brief templates."""

from datetime import date

LANDMARK_CASES = [
    # --- Constitutional Law ---
    {
        "case_name": "Marbury v. Madison",
        "case_number": "5 U.S. (1 Cranch) 137",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Constitutional",
        "year": 1803,
        "date_decided": date(1803, 2, 24),
        "jurisdiction": "United States",
        "judges": "Chief Justice John Marshall",
        "petitioner": "William Marbury",
        "respondent": "James Madison, Secretary of State",
        "outcome": "partial",
        "summary": "Established the principle of judicial review, giving courts the power to strike down laws that violate the Constitution. While Marbury was entitled to his commission, the Court held it lacked jurisdiction to issue the writ.",
        "facts": "William Marbury was appointed Justice of the Peace by President Adams but his commission was not delivered before Jefferson took office. Jefferson's Secretary of State, Madison, refused to deliver it. Marbury petitioned the Supreme Court for a writ of mandamus.",
        "issues": "1. Does Marbury have a right to the commission? 2. Do the laws afford him a remedy? 3. Can the Supreme Court issue this remedy?",
        "legal_reasoning": "Marshall held that Marbury had a right to the commission and that the law provided a remedy. However, Section 13 of the Judiciary Act of 1789, which gave the Supreme Court original jurisdiction to issue writs of mandamus, conflicted with Article III of the Constitution. When a statute conflicts with the Constitution, the Constitution prevails.",
        "key_principles": "Judicial review; Supremacy of the Constitution; Courts have the duty to say what the law is; Unconstitutional statutes are void",
        "statutes_referenced": "Article III of the U.S. Constitution; Judiciary Act of 1789, Section 13",
        "precedents_cited": "None (this case established the precedent)",
        "impact": "Foundation of constitutional law worldwide. Established that the judiciary is the ultimate interpreter of the Constitution. This principle has been adopted by courts globally.",
        "tags": "constitutional,judicial review,separation of powers,landmark,supreme court",
    },
    {
        "case_name": "Brown v. Board of Education",
        "case_number": "347 U.S. 483",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Constitutional",
        "year": 1954,
        "date_decided": date(1954, 5, 17),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren (unanimous)",
        "petitioner": "Oliver Brown et al.",
        "respondent": "Board of Education of Topeka",
        "outcome": "favor",
        "summary": "Declared that state laws establishing separate public schools for Black and white students were unconstitutional, overturning the 'separate but equal' doctrine from Plessy v. Ferguson.",
        "facts": "Black children were denied admission to public schools attended by white children under laws requiring or permitting racial segregation. The plaintiffs argued this violated the Equal Protection Clause of the 14th Amendment.",
        "issues": "Does segregation of children in public schools solely on the basis of race deprive minority children of equal educational opportunities?",
        "legal_reasoning": "The Court found that segregation in education generates a feeling of inferiority that affects children's motivation to learn. Separate educational facilities are inherently unequal regardless of physical equality. Education is the foundation of citizenship and must be available to all on equal terms.",
        "key_principles": "Separate but equal is inherently unequal; Equal protection under the law; Education as a fundamental right; Desegregation mandate",
        "statutes_referenced": "14th Amendment Equal Protection Clause",
        "precedents_cited": "Plessy v. Ferguson (1896) — overruled; Sweatt v. Painter (1950); McLaurin v. Oklahoma (1950)",
        "impact": "Ended legal racial segregation in public schools. Became the cornerstone of the civil rights movement. Led to desegregation in all public facilities.",
        "tags": "constitutional,civil rights,equal protection,education,desegregation,landmark",
    },
    {
        "case_name": "Miranda v. Arizona",
        "case_number": "384 U.S. 436",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Criminal",
        "year": 1966,
        "date_decided": date(1966, 6, 13),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren; 5-4 decision",
        "petitioner": "Ernesto Miranda",
        "respondent": "State of Arizona",
        "outcome": "favor",
        "summary": "Established that detained criminal suspects must be informed of their constitutional rights before police questioning. Created the famous 'Miranda warnings' requirement.",
        "facts": "Ernesto Miranda was arrested and interrogated for two hours without being informed of his Fifth Amendment right against self-incrimination or his Sixth Amendment right to counsel. He signed a confession that was used at trial.",
        "issues": "Are statements obtained from an individual subjected to custodial police interrogation admissible if the person was not informed of constitutional rights?",
        "legal_reasoning": "The Court found that the prosecution may not use statements from custodial interrogation unless procedural safeguards were used to secure the privilege against self-incrimination. The atmosphere of interrogation is inherently coercive, and safeguards must be employed to protect constitutional rights.",
        "key_principles": "Right to remain silent; Right to an attorney during interrogation; Miranda warnings requirement; Exclusion of coerced confessions",
        "statutes_referenced": "5th Amendment (self-incrimination); 6th Amendment (right to counsel); 14th Amendment (due process)",
        "precedents_cited": "Escobedo v. Illinois (1964); Gideon v. Wainwright (1963)",
        "impact": "Created the universally known Miranda warnings. Fundamentally changed police interrogation procedures worldwide. Remains one of the most well-known Supreme Court decisions.",
        "tags": "criminal,rights of accused,interrogation,miranda rights,fifth amendment,landmark",
    },
    # --- Civil Law ---
    {
        "case_name": "Donoghue v. Stevenson",
        "case_number": "[1932] AC 562",
        "court": "House of Lords (UK)",
        "court_level": "supreme",
        "case_type": "Civil",
        "year": 1932,
        "date_decided": date(1932, 5, 26),
        "jurisdiction": "United Kingdom",
        "judges": "Lord Atkin, Lord Buckmaster, Lord Tomlin, Lord Thankerton, Lord Macmillan",
        "petitioner": "May Donoghue",
        "respondent": "David Stevenson",
        "outcome": "favor",
        "summary": "Established the modern concept of negligence and the 'neighbour principle' — that one owes a duty of care to persons who are closely and directly affected by one's actions.",
        "facts": "May Donoghue drank ginger beer from an opaque bottle purchased by a friend. The bottle contained a decomposed snail. She became ill and sued the manufacturer. Since she hadn't bought the drink herself, there was no contractual relationship with the manufacturer.",
        "issues": "Does a manufacturer owe a duty of care to the ultimate consumer of a product when there is no contractual relationship?",
        "legal_reasoning": "Lord Atkin established the neighbour principle: 'You must take reasonable care to avoid acts or omissions which you can reasonably foresee would be likely to injure your neighbour.' A manufacturer owes a duty of care to the end consumer when there is no reasonable possibility of intermediate examination.",
        "key_principles": "Neighbour principle; Duty of care in negligence; Manufacturer liability to end consumers; Tort of negligence; Foreseeability test",
        "statutes_referenced": "Common law principles of negligence",
        "precedents_cited": "Heaven v. Pender (1883); George v. Skivington (1869)",
        "impact": "Foundation of modern negligence law globally. The neighbour principle is taught in every law school worldwide. Shaped product liability, professional negligence, and personal injury law.",
        "tags": "civil,negligence,duty of care,tort law,product liability,landmark",
    },
    {
        "case_name": "Palsgraf v. Long Island Railroad Co.",
        "case_number": "248 N.Y. 339",
        "court": "New York Court of Appeals",
        "court_level": "high",
        "case_type": "Civil",
        "year": 1928,
        "date_decided": date(1928, 5, 29),
        "jurisdiction": "New York, United States",
        "judges": "Chief Judge Cardozo; Judge Andrews (dissent)",
        "petitioner": "Helen Palsgraf",
        "respondent": "Long Island Railroad Co.",
        "outcome": "against",
        "summary": "Landmark case on proximate cause and foreseeability in tort law. Held that a defendant owes a duty of care only to those who are in the reasonably foreseeable zone of danger.",
        "facts": "Railroad employees helped a passenger board a moving train, causing him to drop a package of fireworks. The explosion caused scales at the other end of the platform to fall on Palsgraf. She sued the railroad for negligence.",
        "issues": "Does a defendant owe a duty of care to a plaintiff who is outside the foreseeable zone of danger?",
        "legal_reasoning": "Cardozo held that negligence is not actionable unless it involves the invasion of a legally protected interest — a violation of a right. The conduct of the employees was not a wrong toward Palsgraf because the harm to her was not foreseeable. Duty is relational; it exists only toward those who might foreseeably be harmed.",
        "key_principles": "Foreseeability limits duty of care; Proximate cause; Zone of danger test; Duty is relational not absolute",
        "statutes_referenced": "Common law negligence principles",
        "precedents_cited": "Donoghue v. Stevenson concepts (later); Heaven v. Pender (1883)",
        "impact": "Defined the boundaries of negligence liability. The Cardozo vs. Andrews debate (foreseeability vs. directness) continues to shape tort law analysis.",
        "tags": "civil,negligence,proximate cause,foreseeability,tort law",
    },
    # --- Corporate / Commercial Law ---
    {
        "case_name": "Salomon v. Salomon & Co.",
        "case_number": "[1897] AC 22",
        "court": "House of Lords (UK)",
        "court_level": "supreme",
        "case_type": "Corporate",
        "year": 1897,
        "date_decided": date(1897, 11, 16),
        "jurisdiction": "United Kingdom",
        "judges": "Lord Halsbury LC, Lord Herschell, Lord Macnaghten",
        "petitioner": "Aron Salomon",
        "respondent": "Salomon & Co. Ltd",
        "outcome": "favor",
        "summary": "Established that a properly formed company is a separate legal entity from its shareholders, even if one person holds virtually all the shares. Foundation of corporate personality doctrine.",
        "facts": "Aron Salomon incorporated his boot-making business as a limited company. He held the vast majority of shares, with family members holding one share each. When the company failed, creditors argued Salomon should be personally liable for its debts.",
        "issues": "Is a company a separate legal person from its shareholders even when one shareholder has dominant control?",
        "legal_reasoning": "The House of Lords unanimously held that the company was validly formed and was a separate legal entity. Once a company is legally incorporated, it is independent and its motives in forming it are irrelevant. The company's debts are not the shareholders' debts.",
        "key_principles": "Corporate personality; Separate legal entity doctrine; Limited liability; Veil of incorporation",
        "statutes_referenced": "Companies Act 1862 (UK)",
        "precedents_cited": "None — established the precedent",
        "impact": "Cornerstone of company law worldwide. The separate legal entity principle enables modern corporate structure, limited liability, and investment. Underpins all corporate law globally.",
        "tags": "corporate,company law,separate legal entity,limited liability,landmark",
    },
    # --- Criminal Law ---
    {
        "case_name": "R v. Dudley and Stephens",
        "case_number": "(1884) 14 QBD 273",
        "court": "Queen's Bench Division (UK)",
        "court_level": "high",
        "case_type": "Criminal",
        "year": 1884,
        "date_decided": date(1884, 12, 9),
        "jurisdiction": "United Kingdom",
        "judges": "Lord Coleridge CJ",
        "petitioner": "The Crown (Regina)",
        "respondent": "Thomas Dudley and Edwin Stephens",
        "outcome": "against",
        "summary": "Established that necessity is not a defense to murder. Even in extreme survival situations, killing an innocent person to save others is murder.",
        "facts": "Four crew members were stranded at sea after their yacht sank. After 20 days with no food or water, Dudley and Stephens killed the cabin boy Richard Parker (who was ill and near death) and ate his flesh. They were rescued four days later.",
        "issues": "Can necessity serve as a legal defense to the charge of murder?",
        "legal_reasoning": "The court held that no matter how extreme the circumstances, the deliberate taking of an innocent life cannot be justified by necessity. To allow such a defense would create a dangerous precedent where the strong could sacrifice the weak. The law values all lives equally.",
        "key_principles": "Necessity is no defense to murder; Sanctity of human life; All lives are equally valuable under law; Moral limits on survival actions",
        "statutes_referenced": "Common law on murder and necessity",
        "precedents_cited": "United States v. Holmes (1842)",
        "impact": "Definitive ruling on necessity defense worldwide. Studied in every criminal law course. Raises fundamental questions about morality and law.",
        "tags": "criminal,necessity defense,murder,survival,ethics,landmark",
    },
    {
        "case_name": "Gideon v. Wainwright",
        "case_number": "372 U.S. 335",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Criminal",
        "year": 1963,
        "date_decided": date(1963, 3, 18),
        "jurisdiction": "United States",
        "judges": "Justice Hugo Black (unanimous)",
        "petitioner": "Clarence Earl Gideon",
        "respondent": "Louie L. Wainwright, Director of Corrections",
        "outcome": "favor",
        "summary": "Held that the Sixth Amendment right to counsel applies to state courts through the Fourteenth Amendment. States must provide attorneys for defendants who cannot afford them in all felony cases.",
        "facts": "Clarence Gideon was charged with breaking and entering in Florida. He could not afford a lawyer and requested the court appoint one. The judge denied the request, as Florida law only required appointed counsel in capital cases. Gideon represented himself and was convicted.",
        "issues": "Does the Sixth Amendment right to counsel in criminal cases extend to state felony defendants who cannot afford an attorney?",
        "legal_reasoning": "Justice Black wrote that any person hauled into court who is too poor to hire a lawyer cannot be assured a fair trial unless counsel is provided. Lawyers are necessities, not luxuries. The right to counsel is fundamental and essential to a fair trial.",
        "key_principles": "Right to appointed counsel for indigent defendants; Sixth Amendment applies to states; Lawyers are necessities not luxuries; Fair trial requires legal representation",
        "statutes_referenced": "6th Amendment (right to counsel); 14th Amendment (due process/incorporation)",
        "precedents_cited": "Betts v. Brady (1942) — overruled; Powell v. Alabama (1932)",
        "impact": "Created the modern public defender system. Ensured legal representation for millions of Americans who cannot afford attorneys. Fundamental to criminal justice reform.",
        "tags": "criminal,right to counsel,sixth amendment,public defender,indigent rights,landmark",
    },
    # --- Family Law ---
    {
        "case_name": "Loving v. Virginia",
        "case_number": "388 U.S. 1",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Family",
        "year": 1967,
        "date_decided": date(1967, 6, 12),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren (unanimous)",
        "petitioner": "Richard Loving and Mildred Jeter Loving",
        "respondent": "Commonwealth of Virginia",
        "outcome": "favor",
        "summary": "Struck down all state laws banning interracial marriage as violations of the Equal Protection and Due Process Clauses of the 14th Amendment. Established marriage as a fundamental right.",
        "facts": "Richard Loving (white) and Mildred Jeter (Black/Native American) were married in Washington D.C. and returned to Virginia, where they were arrested under Virginia's Racial Integrity Act of 1924 banning interracial marriages.",
        "issues": "Do state laws prohibiting interracial marriage violate the Equal Protection and Due Process Clauses of the 14th Amendment?",
        "legal_reasoning": "The Court held that restricting marriage solely because of racial classifications violates the central meaning of the Equal Protection Clause. Marriage is one of the basic civil rights of man, fundamental to existence and survival. The freedom to marry has long been recognized as a vital personal right.",
        "key_principles": "Marriage as a fundamental right; Racial classifications in law must face strict scrutiny; Freedom to marry cannot be restricted by race; Equal protection applies to marriage laws",
        "statutes_referenced": "14th Amendment (Equal Protection & Due Process); Virginia Racial Integrity Act of 1924 — struck down",
        "precedents_cited": "Skinner v. Oklahoma (1942); Maynard v. Hill (1888)",
        "impact": "Invalidated anti-miscegenation laws in 16 states. Its reasoning on marriage as a fundamental right was later cited in Obergefell v. Hodges (2015) for same-sex marriage.",
        "tags": "family,marriage,civil rights,equal protection,interracial,fundamental rights,landmark",
    },
    {
        "case_name": "Obergefell v. Hodges",
        "case_number": "576 U.S. 644",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Family",
        "year": 2015,
        "date_decided": date(2015, 6, 26),
        "jurisdiction": "United States",
        "judges": "Justice Anthony Kennedy; 5-4 decision",
        "petitioner": "James Obergefell et al.",
        "respondent": "Richard Hodges, Director of Ohio Dept. of Health",
        "outcome": "favor",
        "summary": "Held that the fundamental right to marry is guaranteed to same-sex couples by the Due Process and Equal Protection Clauses of the 14th Amendment. Legalized same-sex marriage nationwide.",
        "facts": "James Obergefell married John Arthur in Maryland (where it was legal), then returned to Ohio which did not recognize same-sex marriages. When Arthur died, Obergefell sought to be listed as surviving spouse on the death certificate.",
        "issues": "Does the 14th Amendment require states to license and recognize same-sex marriages?",
        "legal_reasoning": "Kennedy identified four principles: (1) right to personal choice in marriage is inherent in individual autonomy, (2) marriage supports a two-person union unlike any other, (3) marriage safeguards children and families, (4) marriage is a keystone of social order. Excluding same-sex couples from marriage conflicts with a central premise of the right to marry.",
        "key_principles": "Marriage equality; Fundamental right to marry extends to same-sex couples; Dignity of individuals; Equal protection for all couples",
        "statutes_referenced": "14th Amendment (Due Process & Equal Protection)",
        "precedents_cited": "Loving v. Virginia (1967); Lawrence v. Texas (2003); United States v. Windsor (2013)",
        "impact": "Legalized same-sex marriage across all 50 states. One of the most significant civil rights decisions of the 21st century.",
        "tags": "family,marriage equality,same-sex marriage,civil rights,equal protection,landmark",
    },
    # --- Labor / Employment Law ---
    {
        "case_name": "Lochner v. New York",
        "case_number": "198 U.S. 45",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Labor",
        "year": 1905,
        "date_decided": date(1905, 4, 17),
        "jurisdiction": "United States",
        "judges": "Justice Rufus Peckham; 5-4 decision",
        "petitioner": "Joseph Lochner",
        "respondent": "State of New York",
        "outcome": "favor",
        "summary": "Struck down a New York law limiting bakers' working hours as an unconstitutional interference with freedom of contract under the Due Process Clause. Later criticized as judicial overreach.",
        "facts": "New York's Bakeshop Act limited bakers to 10 hours per day and 60 hours per week. Joseph Lochner, a bakery owner, was fined for allowing an employee to work more than the limit.",
        "issues": "Does a state law limiting working hours violate the liberty of contract protected by the 14th Amendment's Due Process Clause?",
        "legal_reasoning": "The majority held that the right to purchase or sell labor is part of the liberty protected by the 14th Amendment. The law was not a legitimate exercise of police power for health or safety but an unreasonable interference with the right of free contract.",
        "key_principles": "Liberty of contract; Limits on state police power; Substantive due process; Economic liberty (later criticized)",
        "statutes_referenced": "14th Amendment Due Process Clause; New York Bakeshop Act — struck down",
        "precedents_cited": "Allgeyer v. Louisiana (1897)",
        "impact": "Defined the 'Lochner era' (1905-1937) of judicial activism against labor regulation. Eventually repudiated. Now studied as a cautionary example of courts substituting their judgment for legislatures.",
        "tags": "labor,freedom of contract,due process,working hours,economic rights,landmark",
    },
    # --- International Law ---
    {
        "case_name": "The Nuremberg Trials (IMT)",
        "case_number": "International Military Tribunal",
        "court": "International Military Tribunal at Nuremberg",
        "court_level": "tribunal",
        "case_type": "International",
        "year": 1946,
        "date_decided": date(1946, 10, 1),
        "jurisdiction": "International",
        "judges": "Justice Geoffrey Lawrence (President), judges from USA, UK, France, USSR",
        "petitioner": "Allied Powers",
        "respondent": "Major Nazi War Criminals",
        "outcome": "against",
        "summary": "Established that individuals — not just states — can be held accountable under international law for crimes against peace, war crimes, and crimes against humanity. 'Following orders' is not a valid defense.",
        "facts": "After World War II, 24 major Nazi political and military leaders were tried for conspiracy, crimes against peace, war crimes, and crimes against humanity including the Holocaust.",
        "issues": "Can individuals be held criminally responsible under international law for state-sanctioned acts? Is 'following orders' a valid defense?",
        "legal_reasoning": "The Tribunal held that crimes against international law are committed by men, not abstract entities, and only by punishing individuals who commit such crimes can the provisions of international law be enforced. The fact that a person acted under orders does not free them from responsibility if moral choice was possible.",
        "key_principles": "Individual criminal responsibility under international law; Superior orders not a defense; Crimes against humanity defined; Accountability for state-sanctioned atrocities",
        "statutes_referenced": "London Charter of the IMT (1945); Hague Conventions; Geneva Conventions",
        "precedents_cited": "None — established international criminal law precedent",
        "impact": "Foundation of modern international criminal law. Led to the Geneva Conventions, the International Criminal Court, and the principle that 'just following orders' is not a defense to atrocities.",
        "tags": "international,war crimes,crimes against humanity,nuremberg,human rights,landmark",
    },
    # --- Intellectual Property ---
    {
        "case_name": "Apple Inc. v. Samsung Electronics Co.",
        "case_number": "No. 15-777",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Intellectual Property",
        "year": 2016,
        "date_decided": date(2016, 12, 6),
        "jurisdiction": "United States",
        "judges": "Justice Sonia Sotomayor (unanimous)",
        "petitioner": "Samsung Electronics Co.",
        "respondent": "Apple Inc.",
        "outcome": "partial",
        "summary": "Held that design patent damages should be based on the 'article of manufacture' to which the design is applied, which may be a component of a product rather than the entire product. Reduced Samsung's damages.",
        "facts": "Apple sued Samsung for infringing design patents related to the iPhone's rounded rectangular shape, bezel, and grid of icons. Samsung was ordered to pay its entire profit from phones found to infringe. Samsung argued damages should be limited to the component, not the whole phone.",
        "issues": "When design patent infringement is found, should damages be calculated based on the entire product or just the specific component embodying the patented design?",
        "legal_reasoning": "The Court held that 'article of manufacture' in patent law can mean either an end product sold to a consumer or a component of that product. The lower court erred by automatically applying damages to the entire phone rather than identifying the relevant article of manufacture.",
        "key_principles": "Design patent damages based on article of manufacture; Component vs. whole product distinction; Proportional damages in IP cases",
        "statutes_referenced": "35 U.S.C. § 289 (design patent damages); Patent Act",
        "precedents_cited": "No direct precedent — novel interpretation",
        "impact": "Reshaped design patent litigation. Prevented potentially ruinous damages claims in tech industry. Established framework for proportional IP damages.",
        "tags": "intellectual property,design patent,damages,technology,samsung,apple",
    },
    # --- Environmental Law ---
    {
        "case_name": "Massachusetts v. EPA",
        "case_number": "549 U.S. 497",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Environmental",
        "year": 2007,
        "date_decided": date(2007, 4, 2),
        "jurisdiction": "United States",
        "judges": "Justice John Paul Stevens; 5-4 decision",
        "petitioner": "Commonwealth of Massachusetts et al.",
        "respondent": "Environmental Protection Agency",
        "outcome": "favor",
        "summary": "Held that greenhouse gases are air pollutants under the Clean Air Act and that the EPA has the authority — and obligation — to regulate them if they endanger public health.",
        "facts": "Massachusetts and other states petitioned the EPA to regulate greenhouse gas emissions from new motor vehicles. The EPA denied the petition, claiming it lacked authority under the Clean Air Act and that regulation was unwise.",
        "issues": "Are greenhouse gases 'air pollutants' under the Clean Air Act? Can and must the EPA regulate them?",
        "legal_reasoning": "The Court held that CO2 and other greenhouse gases fit within the Clean Air Act's broad definition of air pollutant. The EPA cannot decline to regulate simply because it prefers not to — it must determine whether emissions endanger public health and act accordingly.",
        "key_principles": "Greenhouse gases are regulable pollutants; EPA has mandatory duty to assess endangerment; State standing for environmental harm; Agency discretion has limits",
        "statutes_referenced": "Clean Air Act, § 202(a)(1); Article III standing requirements",
        "precedents_cited": "Lujan v. Defenders of Wildlife (1992); Chevron v. NRDC (1984)",
        "impact": "Opened the door for climate change regulation in the U.S. Led to the EPA's Endangerment Finding and subsequent emissions regulations. Landmark environmental decision.",
        "tags": "environmental,climate change,EPA,clean air act,greenhouse gas,regulation,landmark",
    },
    # --- Indian Constitutional Law ---
    {
        "case_name": "Kesavananda Bharati v. State of Kerala",
        "case_number": "AIR 1973 SC 1461",
        "court": "Supreme Court of India",
        "court_level": "supreme",
        "case_type": "Constitutional",
        "year": 1973,
        "date_decided": date(1973, 4, 24),
        "jurisdiction": "India",
        "judges": "13-judge bench; Chief Justice Sikri; 7-6 decision",
        "petitioner": "His Holiness Kesavananda Bharati Sripadagalvaru",
        "respondent": "State of Kerala",
        "outcome": "partial",
        "summary": "Established the 'basic structure' doctrine — Parliament can amend any part of the Constitution but cannot alter its basic structure or essential features.",
        "facts": "Kesavananda Bharati challenged the Kerala Land Reforms Act which restricted his religious property. The case expanded to address whether Parliament's amending power under Article 368 was unlimited.",
        "issues": "Is Parliament's power to amend the Constitution unlimited under Article 368, or are there inherent limitations?",
        "legal_reasoning": "The majority held that while Parliament has wide powers to amend the Constitution, it cannot destroy or alter its basic structure. Features like supremacy of the Constitution, republican and democratic form of government, secularism, separation of powers, and fundamental rights form the basic structure.",
        "key_principles": "Basic structure doctrine; Limits on constitutional amendment power; Judicial review of amendments; Supremacy of the Constitution",
        "statutes_referenced": "Constitution of India, Article 368; 24th, 25th, 29th Constitutional Amendments",
        "precedents_cited": "Golaknath v. State of Punjab (1967); Shankari Prasad v. Union of India (1951); Sajjan Singh v. State of Rajasthan (1965)",
        "impact": "Most significant Indian constitutional decision. The basic structure doctrine has been adopted by courts in Bangladesh, Pakistan, and other nations. Prevented authoritarian constitutional changes.",
        "tags": "constitutional,basic structure,amendment power,indian law,fundamental rights,landmark",
    },
    {
        "case_name": "Vishaka v. State of Rajasthan",
        "case_number": "AIR 1997 SC 3011",
        "court": "Supreme Court of India",
        "court_level": "supreme",
        "case_type": "Labor",
        "year": 1997,
        "date_decided": date(1997, 8, 13),
        "jurisdiction": "India",
        "judges": "Chief Justice J.S. Verma, Justice Sujata Manohar, Justice B.N. Kirpal",
        "petitioner": "Vishaka and Others (NGOs and social activists)",
        "respondent": "State of Rajasthan and Union of India",
        "outcome": "favor",
        "summary": "Laid down guidelines to prevent sexual harassment at the workplace, known as the Vishaka Guidelines. These had the force of law until the Sexual Harassment Act was enacted in 2013.",
        "facts": "Bhanwari Devi, a social worker in Rajasthan, was gang-raped as retaliation for trying to prevent a child marriage. The accused were acquitted by the trial court. Women's groups filed a PIL seeking enforcement of fundamental rights of working women.",
        "issues": "What legal protections exist for women against sexual harassment at the workplace? Can the Court lay down binding guidelines in the absence of legislation?",
        "legal_reasoning": "The Court held that sexual harassment violates fundamental rights under Articles 14, 15, 19, and 21 of the Constitution. In the absence of domestic law, the Court drew from CEDAW (international convention) to frame binding guidelines for all workplaces.",
        "key_principles": "Right to safe workplace is a fundamental right; Sexual harassment violates dignity and equality; Courts can create binding guidelines in legislative vacuum; International conventions inform domestic rights",
        "statutes_referenced": "Articles 14, 15, 19(1)(g), 21 of Constitution of India; CEDAW (Convention on Elimination of Discrimination Against Women)",
        "precedents_cited": "Apparel Export Promotion Council v. A.K. Chopra (1999) — later applied Vishaka",
        "impact": "Directly led to the Sexual Harassment of Women at Workplace Act, 2013. Transformed workplace safety law in India. Pioneered use of international conventions to fill domestic legal gaps.",
        "tags": "labor,sexual harassment,women's rights,workplace safety,indian law,fundamental rights,landmark",
    },
    # --- Tax Law ---
    {
        "case_name": "Commissioner v. Glenshaw Glass Co.",
        "case_number": "348 U.S. 426",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Tax",
        "year": 1955,
        "date_decided": date(1955, 3, 14),
        "jurisdiction": "United States",
        "judges": "Chief Justice Earl Warren (unanimous)",
        "petitioner": "Commissioner of Internal Revenue",
        "respondent": "Glenshaw Glass Company",
        "outcome": "favor",
        "summary": "Established the broadest definition of taxable income: any 'undeniable accession to wealth, clearly realized, and over which the taxpayer has complete dominion' constitutes gross income.",
        "facts": "Glenshaw Glass received punitive damages in an antitrust lawsuit. The company argued that punitive damages were not 'income' under the tax code and therefore not taxable.",
        "issues": "Are punitive damages received in a lawsuit considered taxable 'gross income' under the Internal Revenue Code?",
        "legal_reasoning": "The Court defined income broadly as any undeniable accession to wealth, clearly realized, over which taxpayers have complete dominion. Congress intended to tax all gains except those specifically exempted. Punitive damages clearly meet this definition.",
        "key_principles": "Broad definition of gross income; Accession to wealth test; All gains are taxable unless specifically excluded; Congressional intent for comprehensive taxation",
        "statutes_referenced": "Internal Revenue Code § 61 (gross income); 16th Amendment",
        "precedents_cited": "Eisner v. Macomber (1920) — expanded; Commissioner v. Wilcox (1946)",
        "impact": "Fundamental tax law case. The three-part 'accession to wealth' test remains the standard for determining taxable income. Cited in virtually every income tax dispute.",
        "tags": "tax,gross income,punitive damages,taxation,IRS,landmark",
    },
    # --- Technology / Privacy ---
    {
        "case_name": "Carpenter v. United States",
        "case_number": "585 U.S. 296",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Criminal",
        "year": 2018,
        "date_decided": date(2018, 6, 22),
        "jurisdiction": "United States",
        "judges": "Chief Justice John Roberts; 5-4 decision",
        "petitioner": "Timothy Carpenter",
        "respondent": "United States",
        "outcome": "favor",
        "summary": "Held that the government's acquisition of cell-site location information (CSLI) constitutes a search under the Fourth Amendment and generally requires a warrant.",
        "facts": "FBI obtained 127 days of Timothy Carpenter's cell phone location data from wireless carriers without a warrant, using it to place him near robbery locations. The data included 12,898 location points.",
        "issues": "Does the government conduct a Fourth Amendment 'search' when it accesses historical cell phone location records from a wireless carrier?",
        "legal_reasoning": "Roberts held that individuals maintain a reasonable expectation of privacy in the record of their physical movements captured through cell-site location information. The pervasive and revealing nature of CSLI makes it fundamentally different from traditional business records. The third-party doctrine does not apply to this comprehensive surveillance tool.",
        "key_principles": "Digital privacy protection; Cell location data requires a warrant; Third-party doctrine limitations in digital age; Reasonable expectation of privacy in digital records",
        "statutes_referenced": "Fourth Amendment; Stored Communications Act, 18 U.S.C. § 2703(d)",
        "precedents_cited": "Katz v. United States (1967); Smith v. Maryland (1979); United States v. Jones (2012); Riley v. California (2014)",
        "impact": "Landmark digital privacy decision. Extended Fourth Amendment protections to digital-age surveillance. Signaled that privacy law must evolve with technology.",
        "tags": "criminal,privacy,digital rights,fourth amendment,cell phone,surveillance,technology,landmark",
    },
    # --- Contract Law ---
    {
        "case_name": "Carlill v. Carbolic Smoke Ball Company",
        "case_number": "[1893] 1 QB 256",
        "court": "Court of Appeal of England and Wales",
        "court_level": "high",
        "case_type": "Civil",
        "year": 1893,
        "date_decided": date(1893, 2, 7),
        "jurisdiction": "United Kingdom",
        "judges": "Lindley LJ, Bowen LJ, A.L. Smith LJ",
        "petitioner": "Louisa Carlill",
        "respondent": "Carbolic Smoke Ball Company",
        "outcome": "favor",
        "summary": "Landmark contract law case establishing that an advertisement can constitute a binding unilateral offer, and that performance of the conditions constitutes acceptance without need for formal communication.",
        "facts": "The Carbolic Smoke Ball Company advertised that anyone who used their smoke ball as directed and still caught influenza would receive £100. They deposited £1,000 in a bank to show sincerity. Mrs. Carlill used the product as directed, caught the flu, and claimed the reward.",
        "issues": "Can an advertisement constitute a binding contractual offer? Was there valid acceptance without communication?",
        "legal_reasoning": "The Court held that the advertisement was not mere puffery but a genuine offer to the world (unilateral contract). The deposit of £1,000 showed sincerity. Performance of the conditions (using the smoke ball as directed) constituted acceptance. Communication of acceptance was waived by the nature of the offer.",
        "key_principles": "Unilateral contracts; Advertisement as an offer; Performance as acceptance; Communication of acceptance can be waived; Consideration in unilateral contracts",
        "statutes_referenced": "Common law of contract",
        "precedents_cited": "Williams v. Carwardine (1833); Denton v. Great Northern Railway (1856)",
        "impact": "Foundation of contract law taught in every law school. Established key principles about offer, acceptance, and consideration. Relevant to modern advertising law and consumer protection.",
        "tags": "civil,contract law,unilateral contract,offer and acceptance,advertising,consumer protection,landmark",
    },
    # --- Administrative Law ---
    {
        "case_name": "Chevron U.S.A., Inc. v. Natural Resources Defense Council",
        "case_number": "467 U.S. 837",
        "court": "Supreme Court of the United States",
        "court_level": "supreme",
        "case_type": "Administrative",
        "year": 1984,
        "date_decided": date(1984, 6, 25),
        "jurisdiction": "United States",
        "judges": "Justice John Paul Stevens (unanimous 6-0)",
        "petitioner": "Chevron U.S.A., Inc.",
        "respondent": "Natural Resources Defense Council, Inc.",
        "outcome": "favor",
        "summary": "Established the 'Chevron deference' doctrine — courts should defer to a government agency's interpretation of an ambiguous statute that the agency administers, as long as the interpretation is reasonable.",
        "facts": "The EPA under Reagan adopted a 'bubble concept' allowing factories to offset pollution increases at one source with decreases at another within the same plant. The NRDC challenged this interpretation of the Clean Air Act.",
        "issues": "Should courts defer to an administrative agency's reasonable interpretation of an ambiguous statute?",
        "legal_reasoning": "Justice Stevens created a two-step test: (1) Has Congress directly spoken to the precise question at issue? If yes, that intent governs. (2) If the statute is silent or ambiguous, is the agency's interpretation reasonable? If so, courts must defer to the agency's interpretation.",
        "key_principles": "Chevron two-step test; Judicial deference to agency interpretation; Agency expertise respected; Ambiguity in statutes resolved by agencies",
        "statutes_referenced": "Clean Air Act Amendments of 1977; Administrative Procedure Act",
        "precedents_cited": "Skidmore v. Swift & Co. (1944); NLRB v. Hearst Publications (1944)",
        "impact": "One of the most cited cases in American law. The Chevron doctrine shaped administrative law for four decades. Note: Overruled by Loper Bright Enterprises v. Raimondo (2024), ending Chevron deference.",
        "tags": "administrative,chevron deference,agency interpretation,regulatory law,EPA,landmark",
    },
]


GLOSSARY_TERMS = [
    # ── A ──
    {"term": "Actus Reus", "definition": "The physical act or unlawful omission that constitutes the external element of a crime. Combined with mens rea, it establishes criminal liability.", "category": "Criminal", "example_usage": "The actus reus of theft is the taking of another's property without their consent.", "related_terms": "Mens Rea, Crime, Omission"},
    {"term": "Adjournment", "definition": "Postponement of a court hearing to a later date. Courts may grant adjournments for reasonable cause. Under BNSS, courts must record reasons and limit adjournments.", "category": "Procedure", "example_usage": "The court granted an adjournment of two weeks for the defendant to engage a new advocate.", "related_terms": "Hearing, Next Date, Remand"},
    {"term": "Advocate-on-Record (AoR)", "definition": "An advocate entitled to file cases and appear before the Supreme Court of India. Must pass the AoR examination conducted by the Supreme Court. Only AoRs can file matters directly.", "category": "Procedure", "example_usage": "The client's local lawyer briefed an Advocate-on-Record to file the SLP before the Supreme Court.", "related_terms": "Supreme Court, SLP, Senior Advocate"},
    {"term": "Amicus Curiae", "definition": "A person or organization not party to the case who offers information or expertise to assist the court. Latin for 'friend of the court.' Commonly appointed by SC/HC in PIL matters.", "category": "Procedure", "example_usage": "The Supreme Court appointed a senior advocate as amicus curiae to assist in the environmental case.", "related_terms": "PIL, Intervenor, Party"},
    {"term": "Anticipatory Bail", "definition": "Bail granted in anticipation of arrest under BNSS Section 482 (earlier CrPC Section 438). A person apprehending arrest can approach the Sessions Court or High Court for protection.", "category": "Criminal", "example_usage": "The accused obtained anticipatory bail from the High Court before the police could arrest him.", "related_terms": "Bail, Regular Bail, BNSS Section 482, FIR"},
    {"term": "Appeal", "definition": "A proceeding in which a higher court reviews the decision of a lower court. First appeal lies as of right; second appeal only on substantial question of law (Section 100 CPC).", "category": "Procedure", "example_usage": "The defendant filed a first appeal in the High Court against the trial court's decree.", "related_terms": "Revision, SLP, Review, Second Appeal"},
    {"term": "Arbitration", "definition": "A method of alternative dispute resolution where disputes are resolved by an arbitrator instead of courts. Governed by the Arbitration and Conciliation Act, 1996 in India.", "category": "Civil", "example_usage": "The parties referred their commercial dispute to arbitration as per the clause in their contract.", "related_terms": "ADR, Mediation, Conciliation, Arbitral Award"},
    # ── B ──
    {"term": "Bail", "definition": "The temporary release of an accused person awaiting trial, on condition of a security deposit. Regular bail under BNSS Section 480 (earlier CrPC Section 437/439).", "category": "Criminal", "example_usage": "The magistrate granted bail to the accused on a personal bond of Rs. 50,000.", "related_terms": "Anticipatory Bail, Surety, Bond, Remand"},
    {"term": "Basic Structure Doctrine", "definition": "Judicial principle established in Kesavananda Bharati (1973) that Parliament cannot amend the basic structure of the Constitution. Includes democracy, secularism, federalism, judicial review, and rule of law.", "category": "Constitutional", "example_usage": "The amendment was struck down as it violated the basic structure of the Constitution.", "related_terms": "Constitutional Amendment, Judicial Review, Kesavananda Bharati"},
    {"term": "BNS (Bharatiya Nyaya Sanhita)", "definition": "The new criminal code replacing the Indian Penal Code (IPC), 1860. Effective from 1 July 2024. Introduces community service as punishment, adds offences for terrorism, mob lynching, and organised crime.", "category": "Criminal", "example_usage": "The FIR was registered under BNS Section 103 (murder), which replaced the erstwhile IPC Section 302.", "related_terms": "IPC, BNSS, BSA, Criminal Law"},
    {"term": "BNSS (Bharatiya Nagarik Suraksha Sanhita)", "definition": "The new code of criminal procedure replacing CrPC, 1973. Effective from 1 July 2024. Mandates forensic investigation for 7yr+ offences, electronic FIR, video conferencing for trials.", "category": "Procedure", "example_usage": "Under BNSS, the police must complete investigation within 90 days for serious offences.", "related_terms": "CrPC, BNS, BSA, Investigation, Trial"},
    {"term": "BSA (Bharatiya Sakshya Adhiniyam)", "definition": "The new evidence law replacing the Indian Evidence Act, 1872. Effective from 1 July 2024. Recognizes electronic records as primary evidence and expands the definition of documents.", "category": "Evidence", "example_usage": "Under BSA, electronic evidence is admissible as primary evidence without requiring a certificate under Section 65B.", "related_terms": "Evidence Act, Electronic Evidence, BNS, BNSS"},
    {"term": "Burden of Proof", "definition": "The obligation to prove a fact in dispute. In criminal cases, the prosecution bears the burden beyond reasonable doubt. In civil cases, the plaintiff must prove on balance of probabilities.", "category": "Evidence", "example_usage": "The burden of proof lies on the prosecution to establish the guilt of the accused beyond reasonable doubt.", "related_terms": "Standard of Proof, Prima Facie, Presumption"},
    # ── C ──
    {"term": "Caveat", "definition": "A formal notice filed by a party (caveator) requesting to be heard before any order is passed against them. Under Section 148A CPC, the caveat remains valid for 90 days.", "category": "Procedure", "example_usage": "The respondent filed a caveat in the High Court to ensure no ex-parte order was passed.", "related_terms": "Ex-Parte, Notice, Hearing"},
    {"term": "Certiorari", "definition": "A writ issued by a higher court to quash the order of a lower court or tribunal that has acted without jurisdiction or in violation of natural justice. One of the five constitutional writs under Article 226/32.", "category": "Constitutional", "example_usage": "The High Court issued a writ of certiorari quashing the tribunal's order as it exceeded its jurisdiction.", "related_terms": "Writ, Mandamus, Habeas Corpus, Quo Warranto, Prohibition"},
    {"term": "Cognizable Offence", "definition": "An offence in which the police can arrest without warrant and investigate without court permission. Listed in the First Schedule of BNSS (earlier CrPC). Examples: murder, theft, robbery.", "category": "Criminal", "example_usage": "Since robbery is a cognizable offence, the police registered an FIR and began investigation immediately.", "related_terms": "Non-Cognizable, FIR, Arrest, Investigation"},
    {"term": "Contempt of Court", "definition": "Willful disobedience of a court order (civil contempt) or conduct that scandalizes or tends to lower the authority of the court (criminal contempt). Governed by the Contempt of Courts Act, 1971.", "category": "Procedure", "example_usage": "The government official was held in contempt for failing to comply with the court's direction.", "related_terms": "Civil Contempt, Criminal Contempt, Judicial Authority"},
    {"term": "CPC (Code of Civil Procedure)", "definition": "The procedural law governing civil litigation in India. CPC, 1908 prescribes the procedure for filing suits, appeals, execution of decrees, and interim orders.", "category": "Procedure", "example_usage": "The suit was dismissed under Order VII Rule 11 of CPC for failure to disclose a cause of action.", "related_terms": "Civil Suit, Decree, Order, Plaint, Written Statement"},
    {"term": "Cross-Examination", "definition": "The questioning of a witness by the opposing party after examination-in-chief. A fundamental right of the accused in criminal trials. Governed by BSA (earlier Indian Evidence Act).", "category": "Evidence", "example_usage": "During cross-examination, the defense attorney established contradictions in the witness's testimony.", "related_terms": "Examination-in-Chief, Re-examination, Witness, BSA"},
    # ── D ──
    {"term": "Decree", "definition": "The formal expression of an adjudication by a civil court which conclusively determines the rights of the parties. May be preliminary, final, or partly both (Section 2(2) CPC).", "category": "Civil", "example_usage": "The court passed a decree directing the defendant to pay Rs. 10 lakhs as compensation.", "related_terms": "Order, Judgment, Execution, CPC"},
    {"term": "Defamation", "definition": "Publication of a false statement that injures a person's reputation. Civil defamation (tort) and criminal defamation (BNS Section 356, earlier IPC 499-500). Truth is a valid defense.", "category": "Civil", "example_usage": "The politician filed a criminal defamation case against the newspaper for the false allegations.", "related_terms": "Libel, Slander, BNS Section 356, Free Speech"},
    {"term": "Due Process", "definition": "The legal requirement that the State must respect all legal rights owed to a person. In India, Article 21 requires procedure established by law to be fair, just, and reasonable (Maneka Gandhi, 1978).", "category": "Constitutional", "example_usage": "The court held that the detention violated due process as no hearing was given before the order.", "related_terms": "Article 21, Natural Justice, Fair Trial, Maneka Gandhi"},
    # ── E ──
    {"term": "Ex-Parte", "definition": "A proceeding or order made at the request of one party without the presence or notice to the other party. An ex-parte decree can be set aside under Order IX Rule 13 CPC.", "category": "Procedure", "example_usage": "The court passed an ex-parte injunction restraining the defendant from selling the disputed property.", "related_terms": "Caveat, Default, Injunction, Set Aside"},
    {"term": "Execution", "definition": "The process of enforcing a court decree or order. Execution proceedings under Order XXI CPC include attachment, sale, arrest, and delivery of possession.", "category": "Procedure", "example_usage": "The decree-holder filed an execution petition to recover the decreed amount from the judgment-debtor.", "related_terms": "Decree, Attachment, Garnishee, Order XXI CPC"},
    # ── F ──
    {"term": "FIR (First Information Report)", "definition": "The first document registered by police upon receiving information of a cognizable offence. Under BNSS Section 173 (earlier CrPC Section 154). Can be filed by anyone, including electronically under BNSS.", "category": "Criminal", "example_usage": "The victim went to the police station and filed an FIR under BNS Section 303 for robbery.", "related_terms": "Cognizable Offence, Police Report, Investigation, Zero FIR"},
    {"term": "Fiduciary Duty", "definition": "A legal obligation to act in the best interest of another party. Applies to trustees, company directors, agents, and advocates. Breach attracts civil and sometimes criminal liability.", "category": "Corporate", "example_usage": "The company director breached his fiduciary duty by awarding contracts to his own family members.", "related_terms": "Trust, Good Faith, Corporate Governance, Duty of Care"},
    {"term": "Force Majeure", "definition": "Unforeseeable circumstances preventing contract fulfillment. Includes natural disasters, wars, pandemics. Section 56 of the Indian Contract Act covers impossibility of performance.", "category": "Contract", "example_usage": "The supplier invoked the force majeure clause after the earthquake destroyed their manufacturing plant.", "related_terms": "Frustration, Impossibility, Act of God, Section 56"},
    {"term": "Fundamental Rights", "definition": "Basic rights guaranteed under Part III (Articles 12-35) of the Indian Constitution. Include right to equality, freedom, life & liberty, religion, culture, and constitutional remedies.", "category": "Constitutional", "example_usage": "The petitioner invoked Article 21 arguing that the right to clean air is part of the fundamental right to life.", "related_terms": "Article 14, Article 19, Article 21, Article 32, Writ"},
    # ── G-H ──
    {"term": "Garnishee Order", "definition": "A court order directing a third party (garnishee) who owes money to the judgment-debtor to pay directly to the decree-holder. Used in execution of money decrees.", "category": "Procedure", "example_usage": "The court issued a garnishee order directing the bank to pay the decreed amount from the debtor's account.", "related_terms": "Execution, Decree, Attachment, Order XXI CPC"},
    {"term": "Habeas Corpus", "definition": "A writ commanding the production of a detained person before the court. Under Articles 32 and 226 of the Constitution. Latin for 'you shall have the body.' The most powerful remedy against unlawful detention.", "category": "Constitutional", "example_usage": "The wife filed a habeas corpus petition in the High Court seeking the production of her detained husband.", "related_terms": "Writ, Article 226, Article 32, Detention, Fundamental Rights"},
    # ── I ──
    {"term": "Injunction", "definition": "A court order requiring a party to do (mandatory) or refrain from doing (prohibitory) a specific act. Temporary injunction under Order XXXIX CPC; permanent injunction as part of decree.", "category": "Remedy", "example_usage": "The court granted a temporary injunction restraining the defendant from constructing on the disputed land.", "related_terms": "Stay, Restraining Order, Order XXXIX CPC, Specific Relief Act"},
    {"term": "Interlocutory Application (IA)", "definition": "An application filed during the pendency of a suit or proceeding seeking interim relief or directions. Not a separate suit but ancillary to the main case.", "category": "Procedure", "example_usage": "The plaintiff filed an IA seeking temporary injunction pending disposal of the main suit.", "related_terms": "Interim Order, Main Petition, Application, Miscellaneous"},
    # ── J-K ──
    {"term": "Judicial Review", "definition": "The power of courts to examine the constitutionality of legislative acts and executive actions. Part of the basic structure of the Constitution. Exercised under Articles 13, 32, 226, and 227.", "category": "Constitutional", "example_usage": "The High Court exercised its power of judicial review to strike down the discriminatory government order.", "related_terms": "Article 226, Article 32, Basic Structure, Ultra Vires, Writ"},
    {"term": "Jurisprudence", "definition": "The theory and philosophy of law. The study of legal principles, concepts, and reasoning that underlie legal systems and judicial decision-making.", "category": "General", "example_usage": "The judge drew on principles of jurisprudence to interpret the ambiguous statutory provision.", "related_terms": "Legal Theory, Positivism, Natural Law, Legal Reasoning"},
    # ── L ──
    {"term": "Limitation", "definition": "The statutory time period within which a legal action must be commenced. Governed by the Limitation Act, 1963. After expiry, the right to sue is barred unless condonation is granted.", "category": "Procedure", "example_usage": "The suit was dismissed as barred by limitation — it was filed four years after the cause of action arose.", "related_terms": "Limitation Act, Condonation of Delay, Time-barred, Prescription"},
    {"term": "Locus Standi", "definition": "The right or capacity to bring an action in court. In India, PIL has relaxed traditional locus standi — any public-spirited person can approach the court for enforcement of public rights.", "category": "Procedure", "example_usage": "The NGO was granted locus standi to challenge the industrial pollution under the relaxed PIL norms.", "related_terms": "Standing, PIL, Justiciability, Article 32"},
    # ── M ──
    {"term": "Mandamus", "definition": "A writ issued by a higher court commanding a public authority to perform a public duty. One of the five writs under Articles 32 and 226. Cannot be issued against a private person.", "category": "Constitutional", "example_usage": "The court issued a writ of mandamus directing the municipal corporation to repair the dangerous road.", "related_terms": "Writ, Certiorari, Habeas Corpus, Quo Warranto, Prohibition"},
    {"term": "Mediation", "definition": "A form of ADR where a neutral third party (mediator) helps parties reach a mutually acceptable settlement. Now governed by the Mediation Act, 2023 in India.", "category": "Civil", "example_usage": "The court referred the matrimonial dispute to mediation before proceeding with the trial.", "related_terms": "ADR, Arbitration, Conciliation, Mediation Act 2023, Lok Adalat"},
    {"term": "Mens Rea", "definition": "The mental element or guilty mind required for criminal liability. Refers to intention, knowledge, recklessness, or negligence. Essential element for most BNS offences.", "category": "Criminal", "example_usage": "The prosecution must prove mens rea — that the accused intended to cause death — for a murder conviction.", "related_terms": "Actus Reus, Intent, Criminal Liability, BNS"},
    # ── N-O ──
    {"term": "Natural Justice", "definition": "Principles of fairness in legal proceedings: (1) Audi alteram partem — hear the other side; (2) Nemo judex in causa sua — no one shall be a judge in their own cause. Violation makes orders void.", "category": "Procedure", "example_usage": "The tribunal's order was quashed as it was passed without giving the petitioner an opportunity to be heard, violating natural justice.", "related_terms": "Due Process, Fair Hearing, Bias, Article 14"},
    {"term": "Non-Cognizable Offence", "definition": "An offence where police cannot arrest without warrant or investigate without magistrate's permission. Listed in the Second Schedule of BNSS. Complaint filed in court, not FIR. Examples: defamation, cheating.", "category": "Criminal", "example_usage": "Since the offence was non-cognizable, the complainant had to file a private complaint before the magistrate.", "related_terms": "Cognizable Offence, NCR, Magistrate, Private Complaint"},
    {"term": "Obiter Dictum", "definition": "Remarks by a judge not essential to the decision and not forming binding precedent. Latin for 'said in passing.' While not binding, obiter dicta of the Supreme Court carry persuasive value.", "category": "General", "example_usage": "The court's observation on the need for a uniform civil code was obiter dictum, not the ratio of the case.", "related_terms": "Ratio Decidendi, Precedent, Judicial Opinion"},
    # ── P ──
    {"term": "PIL (Public Interest Litigation)", "definition": "A petition filed in the interest of the public by any citizen or organization. Relaxes the requirement of locus standi. Can be filed under Article 32 (SC) or Article 226 (HC). Pioneered by Justice P.N. Bhagwati.", "category": "Constitutional", "example_usage": "The environmental activist filed a PIL in the Supreme Court seeking action against illegal mining.", "related_terms": "Article 32, Article 226, Locus Standi, Fundamental Rights, Writ"},
    {"term": "Plea Bargaining", "definition": "A pre-trial negotiation where the accused pleads guilty in exchange for a lesser charge or reduced sentence. Introduced in India under BNSS Chapter XXII (earlier CrPC Chapter XXIA). Available for offences with punishment up to 7 years.", "category": "Criminal", "example_usage": "The accused opted for plea bargaining and received a reduced sentence of community service.", "related_terms": "Guilty Plea, Sentencing, BNSS, Compounding"},
    {"term": "Precedent", "definition": "A court decision that serves as authority for subsequent cases with similar facts or legal issues. SC decisions are binding on all courts (Article 141). HC decisions bind lower courts within the state.", "category": "General", "example_usage": "The trial court followed the Supreme Court precedent and held the clause unconstitutional.", "related_terms": "Stare Decisis, Ratio Decidendi, Article 141, Case Law"},
    {"term": "Prima Facie", "definition": "Evidence sufficient to establish a fact unless disproved. Latin for 'at first sight.' A prima facie case means enough evidence exists to proceed to trial.", "category": "Evidence", "example_usage": "The magistrate found a prima facie case and framed charges against the accused.", "related_terms": "Burden of Proof, Charge Sheet, Discharge, Evidence"},
    # ── Q-R ──
    {"term": "Quo Warranto", "definition": "A writ questioning by what authority a person holds a public office. Prevents usurpation of public office. One of the five constitutional writs.", "category": "Constitutional", "example_usage": "A quo warranto petition was filed challenging the appointment of the chairman as he did not meet eligibility criteria.", "related_terms": "Writ, Mandamus, Certiorari, Public Office"},
    {"term": "Ratio Decidendi", "definition": "The legal reasoning or principle upon which a court's decision is based. The binding part of a judgment that forms precedent. Distinguished from obiter dictum.", "category": "General", "example_usage": "The ratio decidendi of Maneka Gandhi established that procedure under Article 21 must be fair, just, and reasonable.", "related_terms": "Stare Decisis, Obiter Dictum, Precedent, Binding"},
    {"term": "Remand", "definition": "The act of sending a case back to a lower court for further proceedings, or the detention of an accused during investigation. Judicial remand (magistrate) or police custody remand.", "category": "Criminal", "example_usage": "The High Court remanded the case to the trial court for fresh hearing on the merits.", "related_terms": "Custody, Bail, Investigation, Trial Court"},
    {"term": "Res Judicata", "definition": "A matter adjudicated by a competent court that cannot be pursued again by the same parties. Section 11 CPC. Prevents multiplicity of proceedings and conflicting decisions.", "category": "Procedure", "example_usage": "The second suit was dismissed on grounds of res judicata as the same issue was decided in the earlier case.", "related_terms": "Constructive Res Judicata, Section 11 CPC, Estoppel"},
    {"term": "Review", "definition": "Re-examination of a judgment by the same court that passed it. Under Order XLVII CPC (civil) or Article 137 (SC). Limited to error apparent on face of record, discovery of new evidence, or fraud.", "category": "Procedure", "example_usage": "The petitioner filed a review petition pointing out an error apparent on the face of the Supreme Court's order.", "related_terms": "Curative Petition, Recall, Order XLVII, Article 137"},
    # ── S ──
    {"term": "SLP (Special Leave Petition)", "definition": "A petition under Article 136 to the Supreme Court seeking leave to appeal against any order of any court or tribunal. The SC's discretionary jurisdiction. The most common route to the Supreme Court.", "category": "Procedure", "example_usage": "The aggrieved party filed an SLP before the Supreme Court after the High Court dismissed the appeal.", "related_terms": "Article 136, Appeal, Supreme Court, Leave"},
    {"term": "Stare Decisis", "definition": "The legal principle that courts follow precedents from previous decisions. Latin for 'to stand by things decided.' Higher court decisions bind lower courts in the same hierarchy.", "category": "General", "example_usage": "Following stare decisis, the High Court applied the Supreme Court's ruling from the 2017 privacy case.", "related_terms": "Precedent, Ratio Decidendi, Article 141, Binding Precedent"},
    {"term": "Stay Order", "definition": "A court order suspending or stopping a proceeding, judgment, or action. Stay of execution prevents enforcement of a decree. Stay of proceedings halts a pending case.", "category": "Remedy", "example_usage": "The appellate court granted a stay on the trial court's demolition order pending hearing of the appeal.", "related_terms": "Injunction, Interim Order, Execution, Suspension"},
    {"term": "Suo Motu", "definition": "Action taken by a court on its own motion without any application from a party. Latin for 'on its own motion.' The Supreme Court often takes suo motu cognizance of matters of public importance.", "category": "Procedure", "example_usage": "The Supreme Court took suo motu cognizance of the migrant crisis during COVID-19 and issued directions.", "related_terms": "PIL, Judicial Activism, Contempt, Court Direction"},
    {"term": "Subpoena", "definition": "A legal document ordering a person to attend court or produce documents. Under BSA/BNSS, courts can issue summons to witnesses. Non-compliance is punishable as contempt.", "category": "Procedure", "example_usage": "The court issued a subpoena requiring the bank manager to produce the accused's financial records.", "related_terms": "Summons, Contempt, Witness, Discovery, BSA"},
    # ── T-U ──
    {"term": "Tort", "definition": "A civil wrong (not breach of contract) causing harm, giving rise to liability for damages. Indian tort law is largely judge-made. Includes negligence, nuisance, defamation, trespass.", "category": "Civil", "example_usage": "The plaintiff sued in tort for damages caused by the hospital's medical negligence.", "related_terms": "Negligence, Duty of Care, Damages, Absolute Liability"},
    {"term": "Ultra Vires", "definition": "Acts beyond the legal power or authority of a person, corporation, or government body. Latin for 'beyond the powers.' Government actions beyond constitutional authority can be struck down.", "category": "Constitutional", "example_usage": "The municipal order was declared ultra vires as the corporation had no authority to impose such restrictions.", "related_terms": "Intra Vires, Judicial Review, Jurisdiction, Competence"},
    # ── V-Z ──
    {"term": "Vakalatnama", "definition": "A document authorizing an advocate to appear and act on behalf of a party in court proceedings. Must be filed before the advocate can represent the client. Equivalent of power of attorney for court.", "category": "Procedure", "example_usage": "The advocate filed a vakalatnama on behalf of the petitioner before making submissions in court.", "related_terms": "Advocate, Power of Attorney, Appearance, Client"},
    {"term": "Writ", "definition": "A formal order issued by a court. Five types under the Indian Constitution: Habeas Corpus, Mandamus, Certiorari, Prohibition, and Quo Warranto. Filed under Article 32 (SC) or Article 226 (HC).", "category": "Constitutional", "example_usage": "The petitioner filed a writ petition under Article 226 before the High Court challenging the government notification.", "related_terms": "Article 32, Article 226, Habeas Corpus, Mandamus, Certiorari"},
    {"term": "Zero FIR", "definition": "An FIR that can be filed at any police station regardless of jurisdiction where the offence occurred. Introduced under BNSS. The FIR is later transferred to the correct police station.", "category": "Criminal", "example_usage": "The victim filed a Zero FIR at the nearest police station even though the crime occurred in another district.", "related_terms": "FIR, Cognizable Offence, BNSS, Jurisdiction, Police"},
    # ── BNS Key Sections ──
    {"term": "BNS Section 103 — Murder", "definition": "Punishment for murder (replacing IPC Section 302). Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.", "category": "Criminal", "example_usage": "The accused was charged under BNS Section 103 for the premeditated killing.", "related_terms": "BNS Section 105, BNS Section 109, Murder, IPC 302"},
    {"term": "BNS Section 105 — Culpable Homicide", "definition": "Culpable homicide not amounting to murder (replacing IPC Section 304). Punishment ranges from life imprisonment to 10 years depending on intention/knowledge.", "category": "Criminal", "example_usage": "The court convicted the accused under BNS Section 105 as the act lacked premeditation.", "related_terms": "BNS Section 103, Murder, Manslaughter, IPC 304"},
    {"term": "BNS Section 65 — Rape", "definition": "Defines and punishes the offence of rape (replacing IPC Section 376). Minimum punishment is 10 years rigorous imprisonment, extendable to life.", "category": "Criminal", "example_usage": "The accused was convicted under BNS Section 65 and sentenced to 14 years rigorous imprisonment.", "related_terms": "POCSO, BNS Section 70, Sexual Assault, IPC 376"},
    {"term": "BNS Section 318 — Cheating", "definition": "Punishment for cheating (replacing IPC Section 420). Imprisonment up to 3 years, or fine, or both. Cheating by impersonation is separately punishable.", "category": "Criminal", "example_usage": "The fraudster was charged under BNS Section 318 for cheating the investors.", "related_terms": "Fraud, BNS Section 319, Criminal Breach of Trust, IPC 420"},
    {"term": "BNS Section 351 — Criminal Intimidation", "definition": "Threatening a person with injury to their person, reputation, or property (replacing IPC Section 506). Punishment up to 2 years, or up to 7 years if threat is of death/grievous hurt.", "category": "Criminal", "example_usage": "The neighbor was booked under BNS Section 351 for threatening the complainant with dire consequences.", "related_terms": "Threat, BNS Section 352, Extortion, IPC 506"},
    {"term": "BNS Section 74 — Assault on Woman", "definition": "Assault or use of criminal force on a woman with intent to outrage her modesty (replacing IPC Section 354). Minimum 1 year, extendable to 5 years, and fine.", "category": "Criminal", "example_usage": "The accused was arrested under BNS Section 74 for assaulting the woman at the workplace.", "related_terms": "Sexual Harassment, BNS Section 75, IPC 354, Outraging Modesty"},
    {"term": "BNS Section 86 — Cruelty by Husband", "definition": "Cruelty by husband or his relatives towards a married woman (replacing IPC Section 498A). Imprisonment up to 3 years and fine. Covers physical and mental cruelty.", "category": "Criminal", "example_usage": "The wife filed a complaint under BNS Section 86 alleging dowry-related harassment.", "related_terms": "Dowry, BNS Section 80, Domestic Violence, IPC 498A"},
    {"term": "BNS Section 303 — Theft", "definition": "Defines and punishes theft (replacing IPC Section 378/379). Dishonest taking of movable property out of possession without consent. Punishment up to 3 years.", "category": "Criminal", "example_usage": "The shoplifter was booked under BNS Section 303 for stealing merchandise.", "related_terms": "Robbery, Extortion, BNS Section 309, Dacoity, IPC 379"},
    # ── Additional BNS / IPC Key Sections ──
    {"term": "BNS Section 109 — Attempt to Murder", "definition": "Whoever attempts to commit murder (replacing IPC Section 307). Punishment up to 10 years and fine; if hurt is caused, imprisonment for life.", "category": "Criminal", "example_usage": "The accused was charged under BNS Section 109 for stabbing the victim with intent to kill.", "related_terms": "BNS Section 103, Murder, Attempt, IPC 307"},
    {"term": "BNS Section 115 — Voluntarily Causing Hurt", "definition": "Causing bodily pain, disease, or infirmity (replacing IPC Section 323). Punishment up to 1 year or fine up to Rs. 10,000 or both.", "category": "Criminal", "example_usage": "The assailant was charged under BNS Section 115 for punching the complainant.", "related_terms": "BNS Section 117, Grievous Hurt, Assault, IPC 323"},
    {"term": "BNS Section 117 — Grievous Hurt", "definition": "Voluntarily causing grievous hurt including fractures, loss of sight, permanent disfiguration (replacing IPC Section 325). Punishment up to 7 years.", "category": "Criminal", "example_usage": "The accused was convicted under BNS Section 117 for causing a fracture to the victim's skull.", "related_terms": "BNS Section 115, Hurt, Dangerous Weapons, IPC 325"},
    {"term": "BNS Section 137 — Kidnapping", "definition": "Kidnapping from lawful guardianship or from India (replacing IPC Section 359-363). Taking or enticing a minor or person of unsound mind.", "category": "Criminal", "example_usage": "The accused was booked under BNS Section 137 for kidnapping a 12-year-old child.", "related_terms": "Abduction, BNS Section 140, POCSO, IPC 363"},
    {"term": "BNS Section 263 — Forgery", "definition": "Making a false document or electronic record with intent to cause damage (replacing IPC Section 463). Punishment up to 2 years or fine or both.", "category": "Criminal", "example_usage": "The employee was prosecuted under BNS Section 263 for forging the manager's signature on cheques.", "related_terms": "BNS Section 264, False Document, Fraud, IPC 463"},
    {"term": "BNS Section 309 — Robbery", "definition": "Theft accompanied by force or fear of death or hurt (replacing IPC Section 392). Punishment: rigorous imprisonment up to 10 years and fine.", "category": "Criminal", "example_usage": "The gang was convicted under BNS Section 309 for robbing the jewellery shop at gunpoint.", "related_terms": "Theft, Dacoity, Extortion, BNS Section 303, IPC 392"},
    {"term": "BNS Section 310 — Dacoity", "definition": "Robbery committed by five or more persons (replacing IPC Section 395). Punishment: imprisonment for life or rigorous imprisonment up to 10 years.", "category": "Criminal", "example_usage": "The group of six was charged under BNS Section 310 for dacoity at the farmhouse.", "related_terms": "Robbery, BNS Section 309, Gang Crime, IPC 395"},
    {"term": "BNS Section 316 — Criminal Breach of Trust", "definition": "Dishonest misappropriation of property entrusted (replacing IPC Section 406). Punishment up to 3 years or fine or both.", "category": "Criminal", "example_usage": "The director was charged under BNS Section 316 for misappropriating company funds.", "related_terms": "Trust, BNS Section 318, Embezzlement, IPC 406"},
    {"term": "BNS Section 329 — Criminal Trespass", "definition": "Entering property in possession of another with intent to commit offence or intimidate (replacing IPC Section 441). Punishment up to 3 months or fine.", "category": "Criminal", "example_usage": "The squatters were prosecuted under BNS Section 329 for criminal trespass on government land.", "related_terms": "House Trespass, BNS Section 331, Property, IPC 441"},
    {"term": "BNS Section 352 — Extortion", "definition": "Putting any person in fear of injury to dishonestly induce delivery of property (replacing IPC Section 383). Punishment up to 3 years or fine or both.", "category": "Criminal", "example_usage": "The blackmailer was arrested under BNS Section 352 for demanding money by threatening to release private photos.", "related_terms": "Robbery, Criminal Intimidation, BNS Section 351, IPC 383"},
    {"term": "BNS Section 111 — Organised Crime", "definition": "New provision in BNS (no IPC equivalent) for organised crime syndicates. Covers extortion rackets, contract killing, land grabbing, cyber crime by organized groups. Punishment: death or life imprisonment.", "category": "Criminal", "example_usage": "The crime syndicate leaders were booked under BNS Section 111 for running an extortion network.", "related_terms": "BNS Section 112, Organised Crime Syndicate, Gang"},
    {"term": "BNS Section 113 — Terrorism", "definition": "New provision in BNS covering acts of terrorism (partially replacing UAPA provisions). Includes acts intended to threaten the unity, integrity, and sovereignty of India.", "category": "Criminal", "example_usage": "The suspects were charged under BNS Section 113 for planning a bomb attack.", "related_terms": "UAPA, National Security Act, NIA, BNS Section 111"},
    {"term": "BNS Section 69 — Sexual Harassment", "definition": "Physical contact, advances involving unwelcome and explicit sexual overtures (replacing IPC Section 354A). Punishment up to 3 years.", "category": "Criminal", "example_usage": "The complaint was filed under BNS Section 69 for workplace sexual harassment.", "related_terms": "BNS Section 74, POSH Act, Vishaka Guidelines, IPC 354A"},
    # ── Important IPC Sections (Legacy Reference) ──
    {"term": "IPC Section 302 — Murder (now BNS 103)", "definition": "The erstwhile provision for murder under the Indian Penal Code, 1860. Punishment: death or imprisonment for life, and fine. Now replaced by BNS Section 103 from 1 July 2024.", "category": "Criminal", "example_usage": "Cases prior to July 2024 were registered under IPC Section 302; new cases use BNS Section 103.", "related_terms": "BNS Section 103, IPC 304, Culpable Homicide, Death Penalty"},
    {"term": "IPC Section 420 — Cheating (now BNS 318)", "definition": "Cheating and dishonestly inducing delivery of property under the old IPC. Punishment up to 7 years and fine. Now replaced by BNS Section 318.", "category": "Criminal", "example_usage": "The infamous '420' became slang for a fraudster in Indian culture, from this IPC section.", "related_terms": "BNS Section 318, Fraud, Criminal Breach of Trust, IPC 406"},
    {"term": "IPC Section 498A — Cruelty by Husband (now BNS 86)", "definition": "Cruelty by husband or relatives of husband towards married woman. Non-bailable and cognizable. One of the most frequently invoked criminal provisions in matrimonial disputes.", "category": "Criminal", "example_usage": "The wife filed a complaint under IPC Section 498A alleging mental and physical cruelty by in-laws.", "related_terms": "BNS Section 86, Dowry Death, Domestic Violence Act, IPC 304B"},
    {"term": "IPC Section 376 — Rape (now BNS 65)", "definition": "Defines and punishes rape under old IPC. Amended significantly after Nirbhaya case (2013) to include broader definition and harsher punishments. Now replaced by BNS Section 65.", "category": "Criminal", "example_usage": "The Criminal Law Amendment Act 2013 expanded IPC 376 to cover new forms of sexual violence.", "related_terms": "BNS Section 65, POCSO, Criminal Law Amendment 2013, Nirbhaya"},
    # ── Property & Land Law Terms ──
    {"term": "Adverse Possession", "definition": "Acquiring title to land by continuous, open, and hostile possession for the statutory period (12 years for private land, 30 years for government land under the Limitation Act).", "category": "Property", "example_usage": "The occupant claimed ownership by adverse possession after residing on the land for over 20 years.", "related_terms": "Limitation Act, Possession, Title, Prescription"},
    {"term": "Encumbrance Certificate (EC)", "definition": "A certificate issued by the Sub-Registrar's office showing that a property is free from any monetary or legal liabilities. Required for property transactions and home loans.", "category": "Property", "example_usage": "The buyer obtained an encumbrance certificate for the last 30 years before purchasing the property.", "related_terms": "Title Deed, Registration, Sale Deed, Sub-Registrar"},
    {"term": "Mutation (Dakhil Kharij)", "definition": "Transfer of title entry in the revenue records (land records) from one person to another after sale, inheritance, or gift. Mutation in revenue records does not confer title but is presumptive evidence.", "category": "Property", "example_usage": "After purchasing the agricultural land, the buyer applied for mutation in the tehsildar's office.", "related_terms": "Revenue Records, Khata, Patta, Land Revenue"},
    {"term": "RERA (Real Estate Regulation Act)", "definition": "The Real Estate (Regulation and Development) Act, 2016. Mandates registration of real estate projects and agents. Protects homebuyers with project timelines, escrow accounts, and RERA tribunal for complaints.", "category": "Property", "example_usage": "The homebuyer filed a complaint with the state RERA authority for delayed possession of the flat.", "related_terms": "Real Estate, Builder, Homebuyer, Registration, HRERA"},
    {"term": "Sale Deed", "definition": "A legal document that transfers ownership of property from seller to buyer. Must be registered under the Registration Act, 1908. Stamp duty payable as per state rates.", "category": "Property", "example_usage": "The sale deed was registered at the Sub-Registrar's office after paying stamp duty of 7%.", "related_terms": "Registration, Stamp Duty, Title, Conveyance, Agreement to Sell"},
    {"term": "Transfer of Property Act", "definition": "The Transfer of Property Act, 1882 governs transfer of property inter vivos (between living persons). Covers sale, mortgage, lease, exchange, and gift of immovable property.", "category": "Property", "example_usage": "Under Section 54 of the Transfer of Property Act, a sale of immovable property above Rs. 100 must be by registered instrument.", "related_terms": "Sale Deed, Mortgage, Lease, Gift Deed, Registration"},
    # ── Additional Important Legal Terms ──
    {"term": "Compounding of Offences", "definition": "Settlement of a criminal case by the complainant agreeing to drop charges, with court permission. Compoundable offences listed in BNSS (earlier CrPC Section 320). Murder, rape are non-compoundable.", "category": "Criminal", "example_usage": "The assault case was compounded after the victim accepted compensation from the accused.", "related_terms": "Non-Compoundable, Settlement, Plea Bargaining, BNSS"},
    {"term": "Dowry Death (Section 304B IPC / BNS 80)", "definition": "Death of a woman within 7 years of marriage where it is shown she was subjected to cruelty or harassment for dowry. Minimum punishment 7 years, extendable to life.", "category": "Criminal", "example_usage": "The husband and in-laws were charged under Section 304B after the bride's death within a year of marriage.", "related_terms": "BNS Section 80, Dowry Prohibition Act, IPC 498A, Cruelty"},
    {"term": "Lok Adalat", "definition": "People's Court established under the Legal Services Authorities Act, 1987. Provides alternative dispute resolution. Awards are deemed decrees of civil courts and are final, non-appealable.", "category": "Civil", "example_usage": "The motor accident claim was settled in the National Lok Adalat with a compensation of Rs. 5 lakhs.", "related_terms": "ADR, Legal Aid, NALSA, Settlement, Mediation"},
    {"term": "POCSO (Protection of Children from Sexual Offences)", "definition": "The POCSO Act, 2012 protects children below 18 from sexual assault, harassment, and exploitation. Establishes special courts. Mandatory reporting. Amended in 2019 to include death penalty for aggravated penetrative sexual assault.", "category": "Criminal", "example_usage": "The accused was charged under POCSO Act for sexual assault on a 14-year-old child.", "related_terms": "Child Protection, BNS Section 65, Special Court, Mandatory Reporting"},
    {"term": "Section 144 CrPC / BNSS 163 — Prohibitory Orders", "definition": "Power of a District Magistrate to issue orders prohibiting assembly of persons, restricting movement, or imposing curfew to prevent disturbance of public tranquility. Used for riots, protests, law and order.", "category": "Procedure", "example_usage": "Section 144 was imposed in the district prohibiting assembly of more than 4 persons after communal tensions.", "related_terms": "Curfew, Prohibitory Order, District Magistrate, Public Order"},
    {"term": "Chargesheet", "definition": "A formal document (police report under BNSS Section 193 / CrPC Section 173) filed by police after investigation, presenting evidence and accusations against the accused before the magistrate.", "category": "Criminal", "example_usage": "The police filed a chargesheet within 90 days naming three accused persons.", "related_terms": "FIR, Investigation, Closure Report, BNSS Section 193, Prosecution"},
    {"term": "Discharge", "definition": "Release of an accused from the charges before trial when the court finds insufficient grounds to proceed. Under BNSS Section 250 (Sessions) / Section 239 (Magistrate). Different from acquittal.", "category": "Criminal", "example_usage": "The Sessions Court discharged the accused finding no prima facie case after examining the chargesheet.", "related_terms": "Acquittal, Chargesheet, Prima Facie, Framing of Charges"},
    {"term": "Negotiable Instruments Act — Section 138", "definition": "Dishonour of cheque for insufficiency of funds. A criminal offence with imprisonment up to 2 years or fine up to twice the cheque amount or both. One of the most litigated provisions in India.", "category": "Criminal", "example_usage": "The complainant filed a case under Section 138 NI Act after the cheque of Rs. 10 lakhs bounced.", "related_terms": "Cheque Bounce, Dishonour, Demand Notice, Magistrate Court"},
]


BRIEF_TEMPLATES = [
    {
        "name": "Criminal Defense Brief",
        "case_type": "Criminal",
        "description": "Template for preparing a defense brief in criminal proceedings. Covers all essential elements from facts to sentencing arguments.",
        "template_content": """# CRIMINAL DEFENSE BRIEF

## 1. CASE INFORMATION
- **Case Number:** [Enter case number]
- **Court:** [Enter court name]
- **Judge:** [Enter presiding judge]
- **Charges:** [List all charges with statutory references]
- **Date of Offense:** [Enter date]
- **Date of Arrest:** [Enter date]

## 2. STATEMENT OF FACTS
[Present facts favorable to the defense. Note disputed facts.]

### Prosecution's Version:
[Summarize the prosecution's factual allegations]

### Defense's Version:
[Present the defense's account of events]

### Undisputed Facts:
[List facts both sides agree on]

## 3. ISSUES FOR DETERMINATION
1. [State each legal issue clearly]
2. [Frame issues favorably for the defense]

## 4. LEGAL ARGUMENTS

### Argument 1: [Title]
**Principle:** [State the legal principle]
**Authority:** [Cite cases and statutes]
**Application:** [Apply to present facts]

### Argument 2: [Title]
**Principle:** [State the legal principle]
**Authority:** [Cite cases and statutes]
**Application:** [Apply to present facts]

## 5. EVIDENCE ANALYSIS
| Evidence | Source | Supports | Challenges |
|----------|--------|----------|------------|
| [Item]   | [Source] | [How it helps] | [Weaknesses] |

## 6. WITNESS STRATEGY
- **Defense Witnesses:** [List with expected testimony]
- **Cross-examination Points:** [Key points for prosecution witnesses]

## 7. PRECEDENTS TO CITE
1. [Case name] - [Key principle from case]
2. [Case name] - [Key principle from case]

## 8. RELIEF SOUGHT
[State what you are asking the court to do]

## 9. SENTENCING ARGUMENTS (if applicable)
- Mitigating factors: [List]
- Character evidence: [List]
- Sentencing guidelines analysis: [Discuss]""",
        "tips": "Always verify the current state of the law. Check for recent amendments to statutes. Review the judge's previous rulings on similar issues. Prepare for prosecution counter-arguments.",
    },
    {
        "name": "Civil Suit Plaint Template",
        "case_type": "Civil",
        "description": "Comprehensive template for filing a civil suit. Covers cause of action, damages, and relief sought.",
        "template_content": """# CIVIL SUIT BRIEF / PLAINT

## 1. PARTIES
- **Plaintiff:** [Full name, address, capacity]
- **Defendant:** [Full name, address, capacity]
- **Relationship between parties:** [Describe]

## 2. JURISDICTION & VENUE
- **Subject matter jurisdiction:** [Explain why this court has authority]
- **Territorial jurisdiction:** [Explain venue selection]
- **Pecuniary jurisdiction:** [If applicable, explain monetary threshold]

## 3. CAUSE OF ACTION
[Describe the wrong committed and legal basis for the claim]

### Timeline of Events:
| Date | Event | Evidence |
|------|-------|----------|
| [Date] | [What happened] | [Supporting evidence] |

## 4. STATEMENT OF FACTS
[Chronological narrative of material facts]

### Background:
[Context and relationship between parties]

### The Incident/Breach:
[Detailed account of the wrongful act]

### Consequences:
[Harm suffered by the plaintiff]

## 5. LEGAL FRAMEWORK
### Applicable Statutes:
1. [Statute] - [Relevant provision]
2. [Statute] - [Relevant provision]

### Applicable Precedents:
1. [Case] - [Principle]
2. [Case] - [Principle]

## 6. ARGUMENTS

### Argument 1: Liability
[Establish the defendant's liability]

### Argument 2: Causation
[Show the link between defendant's action and plaintiff's harm]

### Argument 3: Damages
[Quantify and justify the damages claimed]

## 7. DAMAGES CLAIMED
- **Actual/Compensatory Damages:** $[Amount] — [Basis]
- **Special Damages:** $[Amount] — [Basis]
- **Punitive Damages:** $[Amount] — [Basis]
- **Total:** $[Amount]

## 8. RELIEF SOUGHT
[Clearly state all forms of relief requested]

## 9. LIST OF DOCUMENTS
1. [Document name and description]
2. [Document name and description]""",
        "tips": "Ensure limitation period has not expired. Gather all documentary evidence before filing. Consider alternative dispute resolution options. Calculate damages precisely with supporting documentation.",
    },
    {
        "name": "Constitutional Writ Petition",
        "case_type": "Constitutional",
        "description": "Template for filing writ petitions challenging constitutional violations. Suitable for habeas corpus, mandamus, certiorari, prohibition, and quo warranto.",
        "template_content": """# CONSTITUTIONAL WRIT PETITION

## 1. PETITION DETAILS
- **Type of Writ:** [Habeas Corpus / Mandamus / Certiorari / Prohibition / Quo Warranto]
- **Court:** [Enter court name]
- **Petitioner:** [Name, address, standing]
- **Respondent:** [Name, designation, address]

## 2. STANDING (LOCUS STANDI)
[Explain how the petitioner is affected and has the right to file]

## 3. FUNDAMENTAL RIGHTS VIOLATED
| Right | Constitutional Provision | How Violated |
|-------|------------------------|--------------|
| [Right] | [Article/Section] | [Explanation] |

## 4. STATEMENT OF FACTS
[Chronological account of events leading to the petition]

## 5. GROUNDS FOR RELIEF

### Ground 1: [Title]
[Explain constitutional violation with legal authority]

### Ground 2: [Title]
[Explain constitutional violation with legal authority]

### Ground 3: [Title]
[Explain constitutional violation with legal authority]

## 6. CONSTITUTIONAL ANALYSIS
### Applicable Provisions:
[List constitutional articles/amendments with interpretation]

### Landmark Precedents:
1. [Case] — [How it supports your position]
2. [Case] — [How it supports your position]

### International Law Support (if applicable):
[Reference relevant international conventions or foreign judgments]

## 7. URGENCY
[If interim relief is needed, explain the urgency and irreparable harm]

## 8. INTERIM RELIEF SOUGHT
[Specific interim orders requested pending final hearing]

## 9. FINAL RELIEF SOUGHT
[Specific orders/declarations requested from the court]

## 10. PRAYER
[Formal statement of all reliefs sought]""",
        "tips": "Writ petitions require clear constitutional violations. Exhaust other remedies first unless the violation is fundamental. Public Interest Litigation (PIL) may have relaxed standing requirements. Document urgency for interim relief.",
    },
    {
        "name": "Corporate/Commercial Dispute Brief",
        "case_type": "Corporate",
        "description": "Template for corporate disputes including shareholder actions, director liability, contractual disputes between businesses.",
        "template_content": """# CORPORATE/COMMERCIAL DISPUTE BRIEF

## 1. PARTIES & CORPORATE DETAILS
- **Plaintiff Company:** [Name, registration number, jurisdiction]
- **Defendant Company:** [Name, registration number, jurisdiction]
- **Key Individuals:** [Directors/officers involved]

## 2. CORPORATE RELATIONSHIP
[Describe the business relationship, agreements, and history]

## 3. CONTRACTUAL FRAMEWORK
### Relevant Agreements:
| Agreement | Date | Key Terms | Status |
|-----------|------|-----------|--------|
| [Name] | [Date] | [Terms] | [Active/Breached] |

## 4. STATEMENT OF FACTS
[Chronological account of the commercial dispute]

## 5. BREACH / WRONG ALLEGED
[Specific acts or omissions constituting the breach]

## 6. LEGAL ARGUMENTS

### Contractual Claims:
[Breach of contract analysis]

### Statutory Claims:
[Company law / commercial code violations]

### Fiduciary Duty Claims:
[If applicable, director/officer duty breaches]

## 7. DAMAGES / LOSS QUANTIFICATION
| Category | Amount | Calculation Method |
|----------|--------|-------------------|
| Direct Loss | $[Amount] | [Method] |
| Consequential Loss | $[Amount] | [Method] |
| Lost Profits | $[Amount] | [Method] |

## 8. RELIEF SOUGHT
[Specific monetary and non-monetary remedies]

## 9. ARBITRATION / ADR CLAUSE
[If contract contains arbitration clause, address enforceability]""",
        "tips": "Review all relevant contracts carefully. Check for arbitration clauses that may affect jurisdiction. Document the chain of authority for corporate decisions. Preserve electronic communications as evidence.",
    },
]


def _enrich_indian_cases(cases):
    """Add extended detail fields (advocates, bench, arguments, quotes, etc.) to Indian cases."""
    import json
    enrichment = {
        "Maneka Gandhi v. Union of India": {
            "bench_size": "7-judge bench",
            "advocate_petitioner": "Soli Sorabjee",
            "advocate_respondent": "Niren De (Attorney General)",
            "outcome_detail": "The Supreme Court allowed the petition, holding that the right to travel abroad is part of personal liberty under Article 21 and the procedure must be fair, just, and reasonable.",
            "arguments_petitioner": "The impounding of passport without reasons or hearing violates Articles 14, 19, and 21. Personal liberty includes the right to travel. The procedure established by law must meet the test of reasonableness.",
            "arguments_respondent": "Article 21 only requires that procedure be established by law, not that it be reasonable. The Passports Act provides sufficient procedure. Executive action on passport is within sovereign power.",
            "judge_observations": "The expression 'personal liberty' in Article 21 is of the widest amplitude and it covers a variety of rights which go to constitute the personal liberty of man.||No person shall be deprived of his life or personal liberty except according to procedure established by law — but that procedure must be right, just, and fair, and not arbitrary, fanciful, or oppressive.",
            "timeline_events": json.dumps([
                {"date": "1976", "event": "Maneka Gandhi's passport impounded by government without reasons"},
                {"date": "1977", "event": "Writ petition filed challenging passport impounding"},
                {"date": "1978-01-25", "event": "7-judge bench delivers landmark judgment expanding Article 21"},
            ]),
        },
        "Golaknath v. State of Punjab": {
            "bench_size": "11-judge bench",
            "advocate_petitioner": "M.K. Nambyar",
            "advocate_respondent": "H.N. Sanyal (Advocate General)",
            "outcome_detail": "By a narrow 6-5 majority, held that Parliament has no power to amend Part III (Fundamental Rights) of the Constitution. Applied the doctrine of prospective overruling.",
            "arguments_petitioner": "Fundamental rights are sacrosanct and above the amending power of Parliament. Article 368 merely prescribes the procedure for amendment and does not confer substantive power to destroy fundamental rights.",
            "arguments_respondent": "Parliament has plenary amending power under Article 368 which extends to all provisions of the Constitution including fundamental rights. Democratic sovereignty requires this power.",
            "judge_observations": "Fundamental rights are given a transcendental position under our Constitution and are kept beyond the reach of Parliament.||The power of amendment under Article 368 does not include the power to abrogate the Constitution or to alter its basic features.",
            "timeline_events": json.dumps([
                {"date": "1953", "event": "Punjab government acquires surplus land under agrarian reform laws"},
                {"date": "1962", "event": "Golaknath family challenges 17th Amendment protecting land reform from Article 19"},
                {"date": "1967-02-27", "event": "11-judge bench delivers 6-5 majority judgment"},
            ]),
        },
        "S.R. Bommai v. Union of India": {
            "bench_size": "9-judge bench",
            "advocate_petitioner": "Rajeev Dhavan, K.K. Venugopal",
            "advocate_respondent": "Solicitor General Dipankar Gupta",
            "outcome_detail": "The Court laid down strict guidelines for the use of Article 356, holding that the President's power is subject to judicial review and secularism is part of the basic structure.",
            "arguments_petitioner": "Dismissal of elected state governments under Article 356 for political reasons is unconstitutional. The power must be subject to judicial review. Federalism is a basic feature of the Constitution.",
            "arguments_respondent": "The President's satisfaction under Article 356 is subjective and not justiciable. The Union government acted on valid material showing constitutional breakdown in the states.",
            "judge_observations": "Secularism is a basic feature of the Constitution. The State has no religion. Any government which pursues unsecular policies or unsecular courses of action acts contrary to the constitutional mandate.||The power under Article 356 is a drastic power and should be used sparingly and as a last resort.",
            "timeline_events": json.dumps([
                {"date": "1988-89", "event": "Multiple state governments dismissed under Article 356"},
                {"date": "1989", "event": "S.R. Bommai's Karnataka government dismissed by Governor"},
                {"date": "1992", "event": "Babri Masjid demolition; three BJP state governments dismissed"},
                {"date": "1993", "event": "Cases consolidated, heard by 9-judge bench"},
                {"date": "1994-03-11", "event": "Landmark judgment delivered with guidelines on Article 356"},
            ]),
        },
        "K.S. Puttaswamy v. Union of India (Right to Privacy)": {
            "bench_size": "9-judge bench",
            "advocate_petitioner": "Gopal Subramanium, Shyam Divan, Arvind Datar",
            "advocate_respondent": "K.K. Venugopal (Attorney General), Rakesh Dwivedi",
            "outcome_detail": "Unanimously held that the right to privacy is a fundamental right under Article 21 of the Constitution, overruling earlier decisions in M.P. Sharma and Kharak Singh.",
            "arguments_petitioner": "The right to privacy is implicit in the right to life and personal liberty under Article 21. Aadhaar mandating biometric data collection violates informational privacy. Previous decisions denying privacy as a fundamental right were decided by smaller benches.",
            "arguments_respondent": "The Constitution does not expressly guarantee a right to privacy. Previous decisions by 6 and 8-judge benches have held privacy is not a fundamental right. Privacy claims must yield to compelling state interests like national security and welfare.",
            "judge_observations": "Privacy is the constitutional core of human dignity. Privacy has both a normative and descriptive function. At a normative level, privacy sub-serves those eternal values upon which the guarantees of life, liberty and freedom are founded.||The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution.",
            "timeline_events": json.dumps([
                {"date": "2012", "event": "Aadhaar challenged in Supreme Court"},
                {"date": "2015", "event": "3-judge bench refers privacy question to larger bench"},
                {"date": "2017-07-18", "event": "5-day hearing before 9-judge bench begins"},
                {"date": "2017-08-24", "event": "Unanimous judgment: Privacy is a fundamental right"},
            ]),
        },
        "Navtej Singh Johar v. Union of India": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Menaka Guruswamy, Arundhati Katju, Anand Grover",
            "advocate_respondent": "Tushar Mehta (Solicitor General)",
            "outcome_detail": "Unanimously struck down Section 377 IPC insofar as it criminalized consensual sexual acts between adults, decriminalizing homosexuality in India.",
            "arguments_petitioner": "Section 377 criminalizes identity, not just acts. Sexual orientation is an integral part of human identity protected by Article 21. The provision is manifestly arbitrary and discriminatory under Article 14. Constitutional morality must prevail over social morality.",
            "arguments_respondent": "The government left the decision to the wisdom of the Court. The Union did not actively defend Section 377 in its application to consensual adult acts.",
            "judge_observations": "I am what I am. So take me as I am. An individual's sexuality is a natural trait and innate to a human being. To deny it is to deny the very essence of life.||Constitutional morality requires that all individuals, irrespective of their sexual orientation, are entitled to equal citizenship and protection of the law.",
            "timeline_events": json.dumps([
                {"date": "2001", "event": "Naz Foundation files first PIL in Delhi HC"},
                {"date": "2009", "event": "Delhi HC reads down Section 377"},
                {"date": "2013-12", "event": "SC reverses Delhi HC in Koushal — re-criminalizes"},
                {"date": "2016", "event": "Curative petition filed by Johar & others"},
                {"date": "2018-07", "event": "Constitution bench hearing begins"},
                {"date": "2018-09-06", "event": "Section 377 struck down unanimously"},
            ]),
        },
        "K.M. Nanavati v. State of Maharashtra": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Karl Khandalavala",
            "advocate_respondent": "Y.V. Chandrachud (as Government Pleader)",
            "outcome_detail": "Conviction upheld for murder. Nanavati was sentenced to life imprisonment but later pardoned by the Governor of Maharashtra.",
            "arguments_petitioner": "The killing was committed under grave and sudden provocation upon learning of the affair. Nanavati acted in the heat of passion without premeditation. The jury acquittal should be upheld.",
            "arguments_respondent": "There was sufficient cooling time between learning of the affair and the shooting. Going to the naval base to obtain a revolver demonstrates premeditation. The jury verdict was perverse and influenced by public sympathy.",
            "judge_observations": "The time-gap between the provocation and the act is not a mere matter of minutes but involves a sequence of deliberate acts which indicate premeditation.||A jury verdict which no reasonable body of men could have returned must be set aside as perverse.",
            "timeline_events": json.dumps([
                {"date": "1959-04-27", "event": "Commander Nanavati shoots Prem Ahuja after discovering affair"},
                {"date": "1959-10", "event": "Jury trial — sensational media coverage across India"},
                {"date": "1959-10-21", "event": "Jury acquits Nanavati 8-1; judge refers to High Court"},
                {"date": "1960", "event": "Bombay High Court convicts Nanavati for murder"},
                {"date": "1961-11-24", "event": "Supreme Court upholds conviction; last jury trial in India"},
                {"date": "1964", "event": "Governor grants pardon after public petition"},
            ]),
        },
        "Hussainara Khatoon v. Home Secretary, State of Bihar": {
            "advocate_petitioner": "Pushpa Kapila Hingorani (pioneer of PIL)",
            "advocate_respondent": "State of Bihar (Government Advocate)",
            "outcome_detail": "Ordered the immediate release of thousands of undertrial prisoners who had been detained longer than the maximum sentence for their alleged offenses.",
            "arguments_petitioner": "Thousands of undertrials have been detained for years without trial, some for periods longer than the maximum punishment. This violates Article 21. The State is obligated to provide free legal aid.",
            "arguments_respondent": "The State faces resource constraints in providing legal aid and speeding up trials. Administrative limitations exist in the criminal justice system.",
            "judge_observations": "We think that the procedure which keeps such persons in jail without trial so long cannot possibly be regarded as reasonable, just and fair so as to be in conformity with Article 21.||The right to free legal services is an essential ingredient of reasonable, fair, and just procedure for a person accused of an offence.",
            "timeline_events": json.dumps([
                {"date": "1979", "event": "Newspaper article exposes thousands of undertrials languishing in Bihar jails"},
                {"date": "1979", "event": "Advocate Pushpa Kapila Hingorani files habeas corpus petition"},
                {"date": "1979-03", "event": "Supreme Court orders immediate release of undertrials detained beyond maximum sentence"},
                {"date": "1980", "event": "Court issues comprehensive guidelines on speedy trial and free legal aid"},
            ]),
        },
        "Bachan Singh v. State of Punjab": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Soli Sorabjee",
            "advocate_respondent": "O.P. Rana (Advocate General, Punjab)",
            "outcome_detail": "Upheld the constitutional validity of the death penalty by a 4-1 majority but established the 'rarest of rare' doctrine to restrict its application.",
            "arguments_petitioner": "The death penalty is inherently cruel and violates Article 21. It serves no penological purpose that cannot be achieved by life imprisonment. There is always a risk of executing the innocent.",
            "arguments_respondent": "The death penalty serves as a deterrent for the most heinous crimes. Parliament in its wisdom has prescribed it as a punishment. Judicial safeguards ensure fair application.",
            "judge_observations": "A real and abiding concern for the dignity of human life postulates resistance to taking a life through law's instrumentality. That ought not to be done save in the rarest of rare cases when the alternative option is unquestionably foreclosed.||The question to be answered is not whether the death sentence should be imposed but whether anything other than the death sentence would be inadequate.",
            "dissenting_opinion": "Justice Bhagwati dissented, holding that the death penalty is violative of Articles 14 and 21. It is irrevocable, irreversible, and disproportionately imposed on the poor and marginalized.",
            "timeline_events": json.dumps([
                {"date": "1979", "event": "Bachan Singh sentenced to death for triple murder"},
                {"date": "1979", "event": "Constitutional challenge to death penalty reaches Supreme Court"},
                {"date": "1980-08-09", "event": "5-judge bench upholds death penalty with 'rarest of rare' doctrine"},
            ]),
        },
        "D.K. Basu v. State of West Bengal": {
            "advocate_petitioner": "D.K. Basu (Executive Chairman, Legal Aid Services, West Bengal)",
            "advocate_respondent": "State of West Bengal",
            "outcome_detail": "Laid down 11 mandatory requirements that police must follow during arrest and detention to prevent custodial violence.",
            "arguments_petitioner": "Custodial deaths and torture are rampant in India. The State must be held accountable for deaths in custody. Guidelines are needed to prevent police excesses.",
            "arguments_respondent": "The State accepted the need for reform and did not strongly oppose the framing of guidelines.",
            "judge_observations": "Custodial violence is a matter of concern. It is aggravated by the fact that it is committed by persons who are supposed to be the protectors of the citizens.||The right to life includes the right to live with human dignity, free from torture and assault by the State or its functionaries.",
            "timeline_events": json.dumps([
                {"date": "1986", "event": "D.K. Basu writes letter-petition to SC about custodial deaths"},
                {"date": "1987", "event": "Supreme Court takes cognizance as PIL"},
                {"date": "1996", "event": "Hearing alongside Ashok Johri custodial death case"},
                {"date": "1997-01-18", "event": "Court lays down 11 mandatory requirements for arrest and detention"},
            ]),
        },
        "Olga Tellis v. Bombay Municipal Corporation": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "V.M. Tarkunde, Indira Jaising",
            "advocate_respondent": "F.S. Nariman (for BMC)",
            "outcome_detail": "Recognized the right to livelihood as part of the right to life under Article 21. Pavement dwellers cannot be evicted without notice and hearing, though the eviction itself was ultimately upheld.",
            "arguments_petitioner": "Pavement dwellers live on footpaths because they have no alternative. The right to livelihood is part of the right to life. Eviction without alternative accommodation violates Article 21.",
            "arguments_respondent": "Encroachment on public property is illegal. The municipality has a duty to keep footpaths and roads clear for public use. No one has a right to encroach on public land.",
            "judge_observations": "The sweep of the right to life conferred by Article 21 is wide and far-reaching. It does not mean merely that life cannot be extinguished or taken away as, for example, by the imposition and execution of the death sentence, except according to procedure established by law. That is but one aspect of the right to life. An equally important facet of that right is the right to livelihood.",
            "timeline_events": json.dumps([
                {"date": "1981", "event": "BMC issues demolition notices to pavement dwellers"},
                {"date": "1981", "event": "Journalist Olga Tellis and pavement dwellers file writ petition"},
                {"date": "1985-07-10", "event": "Supreme Court recognizes right to livelihood under Article 21"},
                {"date": "1985", "event": "Eviction upheld but only after notice and hearing"},
            ]),
        },
        "M.C. Mehta v. Union of India (Oleum Gas Leak)": {
            "advocate_petitioner": "M.C. Mehta (in person, as public interest litigant)",
            "advocate_respondent": "Fali Nariman (for Shriram Industries)",
            "outcome_detail": "Established the principle of absolute liability for hazardous industries, going beyond the English rule in Rylands v. Fletcher.",
            "arguments_petitioner": "The oleum gas leak endangered the lives and health of thousands. Industries engaged in hazardous activities must bear absolute liability for harm. The Bhopal tragedy demands stronger legal standards.",
            "arguments_respondent": "The Rylands v. Fletcher rule with its exceptions should apply. Strict liability with defenses is the appropriate standard. The leak was contained quickly with minimal harm.",
            "judge_observations": "We in India cannot afford to follow the rule in Rylands v. Fletcher. We have to evolve new principles and lay down new norms which would adequately deal with new problems in the context of the social and economic conditions prevailing in India.||An enterprise which is engaged in a hazardous or inherently dangerous industry owes an absolute and non-delegable duty to the community.",
            "timeline_events": json.dumps([
                {"date": "1984-12-03", "event": "Bhopal gas tragedy kills thousands — exposes gaps in liability law"},
                {"date": "1985-12-04", "event": "Oleum gas leak from Shriram Industries in Delhi"},
                {"date": "1986", "event": "M.C. Mehta files PIL seeking absolute liability standard"},
                {"date": "1987-02-17", "event": "Supreme Court establishes absolute liability doctrine"},
            ]),
        },
        "M.C. Mehta v. Union of India (Ganga Pollution)": {
            "advocate_petitioner": "M.C. Mehta (in person)",
            "advocate_respondent": "Solicitor General of India",
            "outcome_detail": "Ordered the closure and relocation of polluting tanneries along the Ganga and established the polluter pays principle in Indian environmental law.",
            "arguments_petitioner": "Industries are discharging untreated effluents into the Ganga, destroying the river and endangering public health. The right to clean water is part of the right to life under Article 21.",
            "arguments_respondent": "Industries provide employment and contribute to the economy. Closure would cause hardship to workers. Time should be given for compliance with pollution standards.",
            "judge_observations": "The financial capacity of the tanneries should be considered as irrelevant while requiring them to set up primary treatment plants. Just as an industry which cannot pay minimum wages to its workers cannot be allowed to exist, a tannery which cannot set up a primary treatment plant cannot be permitted to continue to be in existence.",
            "timeline_events": json.dumps([
                {"date": "1985", "event": "M.C. Mehta files PIL about Ganga pollution"},
                {"date": "1987", "event": "Court orders tanneries in Kanpur to install treatment plants"},
                {"date": "1988", "event": "Court establishes polluter pays principle and orders closures"},
                {"date": "1990s", "event": "Ganga Action Plan expanded following court directions"},
            ]),
        },
        "Shah Bano Begum v. Mohammed Ahmed Khan": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Daniel Latifi",
            "advocate_respondent": "Mohammed Ahmed Khan (in person)",
            "outcome_detail": "Held that a Muslim woman is entitled to maintenance under Section 125 CrPC even after the iddat period, sparking a major debate on uniform civil code.",
            "arguments_petitioner": "Section 125 CrPC is a secular provision applicable to all women regardless of religion. Denying maintenance after iddat leaves divorced Muslim women destitute. Personal law cannot override statutory protection.",
            "arguments_respondent": "Muslim personal law governs maintenance for Muslim women. The husband's obligation ends with mehr and iddat period maintenance. Section 125 should not override personal law.",
            "judge_observations": "It is a matter of deep regret that Article 44 of the Constitution (Uniform Civil Code) has remained a dead letter. There is no evidence of any official activity for framing a common civil code for the country.||A common Civil Code will help the cause of national integration by removing disparate loyalties to laws which have conflicting ideologies.",
            "timeline_events": json.dumps([
                {"date": "1975", "event": "Mohammed Ahmed Khan divorces Shah Bano by triple talaq"},
                {"date": "1978", "event": "Shah Bano files for maintenance under Section 125 CrPC"},
                {"date": "1980", "event": "Magistrate orders Rs. 25/month maintenance"},
                {"date": "1981", "event": "High Court increases maintenance to Rs. 179.20/month"},
                {"date": "1985-04-23", "event": "Supreme Court upholds maintenance rights of Muslim women"},
                {"date": "1986", "event": "Parliament passes Muslim Women (Protection of Rights on Divorce) Act overriding judgment"},
            ]),
        },
        "Shayara Bano v. Union of India (Triple Talaq)": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "Salman Khurshid, V. Mohana",
            "advocate_respondent": "K.K. Venugopal (Attorney General), Kapil Sibal (for AIMPLB)",
            "outcome_detail": "By 3-2 majority, struck down the practice of triple talaq (talaq-e-biddat) as unconstitutional, holding it violates Articles 14, 15, and 21.",
            "arguments_petitioner": "Triple talaq is arbitrary and violates the fundamental rights of Muslim women. It is not an essential religious practice entitled to protection under Article 25. It has been abolished in most Muslim-majority countries.",
            "arguments_respondent": "Triple talaq is an integral part of Sunni Muslim personal law protected under Article 25. The Court should not interfere with religious personal law. Reform should come through legislation, not judicial intervention.",
            "judge_observations": "What is held to be bad in the holy Quran cannot be good in Shariat and, in that sense, what is bad in theology is bad in law as well.||An act which is itself impermissible in Islam cannot be raised to the level of an essential practice.",
            "timeline_events": json.dumps([
                {"date": "2016-02", "event": "Shayara Bano files writ petition"},
                {"date": "2017-03", "event": "SC refers matter to 5-judge Constitution bench"},
                {"date": "2017-05-11", "event": "6-day hearing begins"},
                {"date": "2017-08-22", "event": "Judgment delivered — triple talaq struck down"},
                {"date": "2019", "event": "Parliament enacts Muslim Women (Protection of Rights on Marriage) Act"},
            ]),
        },
        "Bandhua Mukti Morcha v. Union of India": {
            "advocate_petitioner": "Bandhua Mukti Morcha (through Swami Agnivesh)",
            "advocate_respondent": "Union of India (Government Advocate)",
            "outcome_detail": "Recognized bonded labour as a violation of Article 23 and directed the government to identify, release, and rehabilitate bonded labourers across India.",
            "arguments_petitioner": "Bonded labour continues to exist in India despite being outlawed. The workers are kept in inhuman conditions. Article 23 prohibits forced labour. The State has failed to implement the Bonded Labour System (Abolition) Act.",
            "arguments_respondent": "The government is taking steps to eradicate bonded labour. Implementation challenges exist due to scale and resource constraints.",
            "judge_observations": "Whenever it is shown that a labourer is made to provide forced labour, the court would raise a presumption that he is required to do so in consideration of an advance or other economic consideration received by him and is therefore a bonded labourer.",
            "timeline_events": json.dumps([
                {"date": "1981", "event": "Swami Agnivesh's Bandhua Mukti Morcha discovers bonded labourers in Haryana stone quarries"},
                {"date": "1982", "event": "Writ petition filed as PIL before Supreme Court"},
                {"date": "1983", "event": "Court appoints commissioners to investigate conditions"},
                {"date": "1984-12-16", "event": "Landmark judgment directing identification and rehabilitation of bonded labourers"},
            ]),
        },
        "Indra Sawhney v. Union of India (Mandal Commission)": {
            "bench_size": "9-judge bench",
            "advocate_petitioner": "K.K. Venugopal, Arun Jaitley",
            "advocate_respondent": "K. Parasaran, Kapil Sibal",
            "outcome_detail": "Upheld 27% reservation for OBCs but imposed a 50% ceiling on total reservations. Introduced the 'creamy layer' concept to exclude affluent members of backward classes.",
            "arguments_petitioner": "The Mandal Commission recommendations providing 27% OBC reservation violate the right to equality. Caste-based reservations are discriminatory. There should be an economic criterion for backwardness.",
            "arguments_respondent": "Social backwardness in India is rooted in the caste system. OBCs constitute over 50% of the population but are underrepresented. Reservation is an affirmative action tool recognized by the Constitution.",
            "judge_observations": "A caste can be and quite often is a social class in India. If it is backward socially, it would be a backward class for the purposes of Article 16(4).||Reservation is not an exception to Article 16(1) but a facet of it — it is a method of ensuring equality.",
            "dissenting_opinion": "Justice Pandian dissented on the 50% limit, arguing that the quantum of reservation should be commensurate with the population of backward classes and that the ceiling is arbitrary.",
            "timeline_events": json.dumps([
                {"date": "1979", "event": "Mandal Commission constituted"},
                {"date": "1980", "event": "Commission submits report recommending 27% OBC reservation"},
                {"date": "1990-08", "event": "V.P. Singh government accepts Mandal recommendations"},
                {"date": "1990-09", "event": "Widespread protests, Indra Sawhney files petition"},
                {"date": "1992-11-16", "event": "9-judge bench delivers landmark judgment"},
            ]),
        },
        "A.K. Kraipak v. Union of India": {
            "advocate_petitioner": "V.M. Tarkunde",
            "advocate_respondent": "Niren De (Attorney General)",
            "outcome_detail": "Extended the principles of natural justice to administrative and quasi-judicial proceedings, not just judicial proceedings.",
            "arguments_petitioner": "The selection process was vitiated by bias as one of the selection committee members was himself a candidate. Principles of natural justice must apply.",
            "arguments_respondent": "The selection committee acted in an administrative capacity, not a judicial one. Natural justice principles apply only to judicial or quasi-judicial proceedings.",
            "judge_observations": "The dividing line between administrative and quasi-judicial functions is being obliterated. The rules of natural justice operate in areas not covered by any law.||If the purpose of the rules of natural justice is to prevent miscarriage of justice one fails to see why those rules should not be made applicable to administrative proceedings.",
            "timeline_events": json.dumps([
                {"date": "1969", "event": "IFS officers challenge selection process for bias"},
                {"date": "1969", "event": "High Court dismisses the petition"},
                {"date": "1969-12-17", "event": "Supreme Court extends natural justice to administrative proceedings"},
            ]),
        },
        "Mohini Jain v. State of Karnataka": {
            "advocate_petitioner": "Mohini Jain (in person)",
            "advocate_respondent": "State of Karnataka, private medical colleges",
            "outcome_detail": "Held that the right to education is a fundamental right flowing from Article 21 (right to life), and charging capitation fees violates this right.",
            "arguments_petitioner": "The right to education is essential for human dignity and is implicit in Article 21. Capitation fees are arbitrary and deny education to the poor. The State has an obligation under Article 41.",
            "arguments_respondent": "Private institutions have a right to fix fees. Running educational institutions requires adequate funding. There is no express fundamental right to education in Part III.",
            "judge_observations": "The right to education flows directly from the right to life. The right to life under Article 21 and the dignity of an individual cannot be assured unless it is accompanied by the right to education.",
            "timeline_events": json.dumps([
                {"date": "1991", "event": "Mohini Jain challenges capitation fee demand by private medical college"},
                {"date": "1992-07-30", "event": "Supreme Court declares right to education as fundamental right under Article 21"},
            ]),
        },
        "Unni Krishnan v. State of Andhra Pradesh": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "F.S. Nariman",
            "advocate_respondent": "K. Parasaran, State Advocate Generals",
            "outcome_detail": "Partially affirmed Mohini Jain, holding that the right to education is a fundamental right under Article 21 up to the age of 14 years, laying the foundation for Article 21A.",
            "arguments_petitioner": "Private educational institutions should not be allowed to commercialize education. Some regulation of fees is necessary to ensure access.",
            "arguments_respondent": "Mohini Jain went too far in declaring all education a fundamental right. Private institutions need autonomy in fee fixation to remain viable.",
            "judge_observations": "The right to education understood in the context of Articles 45 and 41 means that every child has a right to free education until he completes the age of fourteen years.",
            "timeline_events": json.dumps([
                {"date": "1991", "event": "Private engineering and medical colleges challenge fee regulation"},
                {"date": "1993-02-04", "event": "5-judge bench limits right to education to age 14 under Article 21"},
                {"date": "2002", "event": "86th Amendment adds Article 21A making education a fundamental right for ages 6-14"},
                {"date": "2009", "event": "Right of Children to Free and Compulsory Education Act enacted"},
            ]),
        },
        "Vodafone International Holdings v. Union of India": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Harish Salve, Arvind Datar",
            "advocate_respondent": "Mohan Parasaran (Solicitor General), Arijit Prasad",
            "outcome_detail": "Ruled in favor of Vodafone, holding that the offshore transaction was not taxable in India. The Indian tax authorities had no jurisdiction to impose capital gains tax on the deal.",
            "arguments_petitioner": "The transaction between two foreign entities (Vodafone and Hutchison) took place outside India. India has no territorial jurisdiction. The look-through approach adopted by tax authorities is not supported by law.",
            "arguments_respondent": "The transaction, though structured offshore, involved transfer of Indian assets (Hutch India). Substance over form requires looking through the corporate structure. The underlying asset was Indian, making it taxable in India.",
            "judge_observations": "In tax matters, one has to look at the legal nature of the transaction and not be guided by the substance of the transaction. Tax planning is legitimate if within the framework of law.||Every strategic foreign direct investment coming to India would be liable to taxation in India, as an underlying asset is always in India. This is not what the tax law intends.",
            "timeline_events": json.dumps([
                {"date": "2007-02", "event": "Vodafone acquires Hutchison's 67% stake in Hutch India for $11.2 billion"},
                {"date": "2007-09", "event": "Indian tax authorities issue show-cause notice demanding Rs. 11,218 crore capital gains tax"},
                {"date": "2009", "event": "Bombay High Court rules in favor of tax department"},
                {"date": "2012-01-20", "event": "Supreme Court rules 2-1 in favor of Vodafone, quashes tax demand"},
                {"date": "2012-05", "event": "Government retrospectively amends Income Tax Act to override judgment"},
            ]),
        },
        "Shreya Singhal v. Union of India": {
            "advocate_petitioner": "Shreya Singhal (law student), Saurabh Chaudri",
            "advocate_respondent": "Tushar Mehta (Additional Solicitor General)",
            "outcome_detail": "Struck down Section 66A of the IT Act as unconstitutional for being vague and overbroad, violating the right to free speech under Article 19(1)(a).",
            "arguments_petitioner": "Section 66A is vague, with terms like 'grossly offensive' and 'menacing' being undefined. It has a chilling effect on free speech. Multiple cases of misuse show its arbitrary application.",
            "arguments_respondent": "Section 66A is necessary to prevent cyber harassment, misinformation, and online abuse. The internet requires special regulation given its reach and potential for harm.",
            "judge_observations": "Section 66A is cast so widely that virtually any opinion on any subject would be covered by it. Such a section which creates an offence on the basis of undefined terms is clearly violative of Article 19(1)(a).||Information that may be grossly offensive or which causes annoyance or inconvenience are undefined terms that do not offer a reasonable standard to guide individuals or the authorities.",
            "timeline_events": json.dumps([
                {"date": "2012-11", "event": "Two girls arrested in Palghar for Facebook post criticizing Mumbai shutdown — sparks outrage"},
                {"date": "2012-11", "event": "Shreya Singhal (law student) files PIL challenging Section 66A"},
                {"date": "2013", "event": "Multiple Section 66A arrests across India draw public attention"},
                {"date": "2015-03-24", "event": "Supreme Court strikes down Section 66A as unconstitutional"},
            ]),
        },
        "People's Union for Civil Liberties (PUCL) v. Union of India (NOTA)": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Prashant Bhushan, Lily Thomas",
            "advocate_respondent": "Solicitor General Mohan Parasaran",
            "outcome_detail": "Directed the Election Commission to provide NOTA (None of the Above) option on EVMs, recognizing the voters' right to reject all candidates.",
            "arguments_petitioner": "The right to vote includes the right to reject all candidates. Voters who find no candidate worthy should not be compelled to choose one. Negative voting is practiced in many democracies.",
            "arguments_respondent": "NOTA may lead to confusion and instability. The present system of Form 49-O already allows voters to record dissent. Implementing NOTA requires legislative backing.",
            "judge_observations": "When a voter goes to the polling booth, the voter has the right to decide whether to exercise the right to vote or not. This necessarily includes the right to reject all candidates.||Democracy is about choices and giving the voter the right to reject candidates strengthens democracy.",
            "timeline_events": json.dumps([
                {"date": "2004", "event": "PUCL files PIL seeking right to reject all candidates"},
                {"date": "2009", "event": "Election Commission supports NOTA in its submissions"},
                {"date": "2013-09-27", "event": "Supreme Court directs ECI to provide NOTA button on EVMs"},
                {"date": "2013-11", "event": "NOTA used for first time in state elections"},
            ]),
        },
        "S.P. Gupta v. Union of India (Judges Transfer Case I)": {
            "bench_size": "7-judge bench",
            "advocate_petitioner": "S.P. Gupta, Kapil Sibal",
            "advocate_respondent": "L.N. Sinha (Attorney General)",
            "outcome_detail": "Held that the executive (Chief Justice's opinion) has primacy in judicial appointments — later overruled by the Second and Third Judges Cases.",
            "arguments_petitioner": "Judicial independence requires that judges be appointed based on consultation with the Chief Justice. Executive dominance in appointments undermines the judiciary.",
            "arguments_respondent": "The Constitution vests appointment power in the President. Consultation does not mean concurrence. The executive must have the final say in appointments.",
            "judge_observations": "The concept of consultation does not mean concurrence. The President has the ultimate power of appointment.||Locus standi should not be confined to those directly affected. Any member of the public acting bona fide can bring a matter of public interest before the court.",
            "timeline_events": json.dumps([
                {"date": "1981", "event": "Transfer of High Court judges sparks controversy"},
                {"date": "1981", "event": "S.P. Gupta and advocates challenge executive dominance in judicial appointments"},
                {"date": "1982-12-30", "event": "7-judge bench holds executive has primacy in appointments"},
                {"date": "1993", "event": "Second Judges Case (SCAORA) overrules — CJI's opinion given primacy"},
                {"date": "1998", "event": "Third Judges Case establishes collegium system"},
            ]),
        },
        "S.P. Gupta v. Union of India (Right to Know)": {
            "bench_size": "7-judge bench",
            "advocate_petitioner": "S.P. Gupta",
            "advocate_respondent": "Attorney General of India",
            "outcome_detail": "Established that the right to know is a fundamental right implicit in Article 19(1)(a), laying the constitutional foundation for the Right to Information Act.",
            "arguments_petitioner": "In a democracy, citizens have a right to know how the government functions. Secrecy in government correspondence regarding judicial appointments must give way to transparency.",
            "arguments_respondent": "Government correspondence is privileged. Disclosure of internal deliberations would hamper free and frank discussion. Public interest requires some secrecy in administrative decision-making.",
            "judge_observations": "The concept of an open government is the direct emanation from the right to know which seems to be implicit in the right of free speech and expression guaranteed under Article 19(1)(a).||In a government of responsibility like ours, where all the agents of the public must be responsible for their conduct, there can be but few secrets.",
            "timeline_events": json.dumps([
                {"date": "1981", "event": "S.P. Gupta demands disclosure of government correspondence on judicial appointments"},
                {"date": "1982", "event": "Supreme Court recognizes right to know as fundamental right"},
                {"date": "2005", "event": "Right to Information Act enacted — fulfilling the constitutional vision"},
            ]),
        },
        "BALCO v. Kaiser Aluminium (Bharat Aluminium Co.)": {
            "bench_size": "5-judge bench",
            "advocate_petitioner": "C.A. Sundaram, Darius Khambata",
            "advocate_respondent": "Fali Nariman, Harish Salve",
            "outcome_detail": "Overruled the Bhatia International principle, holding that Part I of the Arbitration Act does not apply to foreign-seated arbitrations. Indian courts cannot interfere with arbitrations seated outside India.",
            "arguments_petitioner": "Indian courts should have supervisory jurisdiction over foreign-seated arbitrations involving Indian parties. Bhatia International correctly extended Part I to all arbitrations.",
            "arguments_respondent": "The seat of arbitration determines jurisdiction under international arbitration law. Bhatia International has created confusion and deterred international arbitration in India.",
            "judge_observations": "The seat of arbitration is the centre of gravity of the arbitration. It determines which courts have supervisory jurisdiction.||We hold that Part I of the Arbitration Act, 1996 would have no application to international commercial arbitration held outside India.",
            "timeline_events": json.dumps([
                {"date": "2002", "event": "Bhatia International allows Indian courts to interfere in foreign-seated arbitrations"},
                {"date": "2005", "event": "BALCO dispute reaches Supreme Court challenging Bhatia principle"},
                {"date": "2012-09-06", "event": "5-judge bench overrules Bhatia International, restores seat theory"},
            ]),
        },
        "Google India Pvt. Ltd. v. Visakha Industries": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Neeraj Kishan Kaul, S. Ganesh",
            "advocate_respondent": "V. Giri (Senior Advocate)",
            "outcome_detail": "Clarified the intermediary liability framework, holding that internet intermediaries like Google enjoy safe harbor protection under Section 79 when they comply with due diligence and act on receiving actual knowledge of unlawful content.",
            "arguments_petitioner": "Google acts as a mere intermediary and does not modify third-party content. Safe harbor under Section 79 protects intermediaries who comply with due diligence. Shreya Singhal guidelines on court orders must be followed.",
            "arguments_respondent": "Google has the ability to control and remove content. Defamatory content was brought to Google's notice but not removed. Intermediaries should be liable when they fail to act on complaints.",
            "judge_observations": "An intermediary which merely provides a platform and does not modify the content is entitled to protection under Section 79 of the IT Act.||The 'actual knowledge' standard as laid down in Shreya Singhal must be followed — knowledge through a court order, not mere third-party notification.",
            "timeline_events": json.dumps([
                {"date": "2015", "event": "Shreya Singhal judgment establishes intermediary liability framework"},
                {"date": "2017", "event": "Visakha Industries sues Google for defamatory auto-complete suggestions"},
                {"date": "2019-12", "event": "Supreme Court clarifies safe harbor protection under Section 79 IT Act"},
            ]),
        },
        # ── Post-2020 & New Cases Enrichment ─────────────────────────
        "Union of India v. Ashish Agarwal (Reassessment Notices)": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Solicitor General Tushar Mehta, Balbir Singh (ASG)",
            "advocate_respondent": "Harish Salve, S. Ganesh, Arvind Datar (for various assessees)",
            "outcome_detail": "Deemed all 9,000+ reassessment notices under old Section 148 as show-cause notices under new Section 148A. Gave the tax department fresh opportunity to comply with new procedure while protecting taxpayer rights.",
            "arguments_petitioner": "The new procedure was in force but the department inadvertently issued notices under the old section due to administrative challenges. The notices should not be invalidated en masse as it would cause massive revenue loss.",
            "arguments_respondent": "The new Section 148A provides substantive protections — opportunity to be heard before issuing notice. Old section notices bypass these protections. Tax department cannot claim ignorance of its own law.",
            "judge_observations": "We convert the impugned notices into show-cause notices under Section 148A. The assessees shall treat such notices as show cause notices under Section 148A and respond within the stipulated time.",
            "timeline_events": json.dumps([
                {"date": "2021-04-01", "event": "New reassessment procedure under Section 148A comes into force"},
                {"date": "2021-04", "event": "Tax department issues thousands of notices under old Section 148"},
                {"date": "2021-2022", "event": "Over 9,000 notices challenged across High Courts — conflicting verdicts"},
                {"date": "2022-04-20", "event": "Supreme Court converts all notices to show-cause notices under new law"},
            ]),
        },
        "Amazon.com NV Investment Holdings v. Future Retail Ltd.": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Gopal Subramanium, Mukul Rohatgi",
            "advocate_respondent": "Harish Salve (for Future Group), Darius Khambata (for Reliance)",
            "outcome_detail": "Upheld the Singapore emergency arbitrator's order restraining Future Group from proceeding with the Rs. 24,713 crore deal with Reliance Retail. Held that emergency arbitrator orders are enforceable under Section 17(2).",
            "arguments_petitioner": "Amazon had contractual protections under its investment agreement. The emergency arbitrator's order is a valid interim measure. Future Group is in contempt of the arbitral order.",
            "arguments_respondent": "Emergency arbitrator is not recognized under the Indian Arbitration Act. The order cannot be enforced as it has no statutory basis. Amazon's investment was in Future Coupons, not Future Retail.",
            "judge_observations": "An order of the emergency arbitrator is an order under Section 17(1) of the Arbitration Act and is enforceable as an order of the Court under Section 17(2).||The Group of Companies doctrine applies — Amazon's rights extend to Future Retail through the corporate structure.",
            "timeline_events": json.dumps([
                {"date": "2019-08", "event": "Amazon invests Rs. 1,431 crore in Future Coupons with protective covenants"},
                {"date": "2020-08", "event": "Future Group announces Rs. 24,713 crore deal with Reliance Retail"},
                {"date": "2020-10-25", "event": "Singapore emergency arbitrator restrains Future-Reliance deal"},
                {"date": "2021-08", "event": "Supreme Court upholds enforcement of emergency arbitrator's order"},
                {"date": "2022-01-03", "event": "Division bench confirms — Future Group bound by emergency arbitrator order"},
            ]),
        },
        "Supriyo @ Supriya Chakraborty v. Union of India (Same-Sex Marriage)": {
            "bench_size": "5-judge Constitution Bench",
            "advocate_petitioner": "Mukul Rohatgi, Menaka Guruswamy, Arundhati Katju, Kirpal (for various petitioners)",
            "advocate_respondent": "Solicitor General Tushar Mehta",
            "outcome_detail": "By 3-2, declined to read the Special Marriage Act in a gender-neutral manner. CJI Chandrachud (for himself and Justice Kaul) would have allowed civil unions. The majority held this is a matter for Parliament, not courts. All 5 judges agreed queer persons have a right to cohabit and the state cannot discriminate.",
            "arguments_petitioner": "The right to marry is an extension of the right to life and dignity under Article 21. The SMA can be read gender-neutrally as it uses the word 'parties'. Non-recognition of same-sex unions causes tangible harm — inheritance, medical decisions, adoption.",
            "arguments_respondent": "Marriage is a heterosexual institution across all personal laws. The Court cannot rewrite legislation. Creating same-sex marriage rights would have cascading effects on adoption, succession, and maintenance laws that only Parliament can address.",
            "judge_observations": "The choice of a partner is an expression of personal liberty and identity. Queer persons have a right to freely enter into unions.||However, the Court cannot create a new institution of marriage. This is a matter that Parliament must address.||The state cannot discriminate against queer persons in accessing goods, services, and entitlements.",
            "timeline_events": json.dumps([
                {"date": "2022-11", "event": "Multiple petitions filed seeking legal recognition of same-sex marriages"},
                {"date": "2023-04-18", "event": "5-judge Constitution Bench begins hearing over 10 days"},
                {"date": "2023-05-11", "event": "Arguments conclude after extensive hearing"},
                {"date": "2023-10-17", "event": "3-2 verdict: Court declines to legalize same-sex marriage, recognizes right to cohabit"},
            ]),
        },
        "In Re: Article 370 of the Constitution (J&K Reorganisation)": {
            "bench_size": "5-judge Constitution Bench",
            "advocate_petitioner": "Kapil Sibal, Gopal Subramanium, Rajeev Dhavan, Zaffar Shah (for various petitioners)",
            "advocate_respondent": "Attorney General R. Venkataramani, Solicitor General Tushar Mehta",
            "outcome_detail": "Unanimously upheld the abrogation of Article 370. Held that J&K did not retain internal sovereignty after accession. Article 370 was a temporary provision. Directed restoration of statehood and elections at the earliest. The President's power under Article 370(3) was validly exercised.",
            "arguments_petitioner": "Article 370 could only be abrogated on the recommendation of the J&K Constituent Assembly, which no longer exists. The State was bifurcated without its legislature's consent. The people of J&K have a right to self-governance and autonomy.",
            "arguments_respondent": "Article 370 was always temporary. After the dissolution of the Constituent Assembly, the President had power to modify/abrogate it. J&K's sovereignty merged with India upon accession. Parliament acting as the State legislature could recommend abrogation.",
            "judge_observations": "The sovereignty of the people of Jammu and Kashmir is the sovereignty of the people of India. Article 370 was a temporary provision, not a permanent feature.||Statehood of Jammu and Kashmir should be restored at the earliest and elections should be conducted.",
            "timeline_events": json.dumps([
                {"date": "2019-08-05", "event": "Presidential Order abrogates Article 370; J&K Reorganisation Act bifurcates state"},
                {"date": "2019-08", "event": "Multiple petitions filed challenging abrogation"},
                {"date": "2023-08", "event": "5-judge bench hears arguments over 16 days"},
                {"date": "2023-12-11", "event": "Unanimous verdict upholds abrogation, directs statehood restoration and elections"},
            ]),
        },
        "X v. Principal Secretary, Health and Family Welfare Dept. (Abortion Rights)": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Colin Gonsalves (for the petitioner)",
            "advocate_respondent": "Solicitor General Tushar Mehta",
            "outcome_detail": "Held that the MTP Act's Rule 3B, which allows abortion up to 24 weeks, applies to all women including unmarried women. The artificial distinction between married and unmarried women is unconstitutional. Also recognized marital rape as a ground for seeking abortion.",
            "arguments_petitioner": "Restricting 24-week abortion to married women discriminates against unmarried women. Reproductive choice is a facet of Article 21. The MTP Act must be read inclusively to cover all women in distress.",
            "arguments_respondent": "The government supported extending the benefit but sought guidance on interpreting the MTP Amendment Act, 2021. The statute needed clarification on whether 'partner' includes unmarried partner.",
            "judge_observations": "A woman's right to reproductive choice is an inseparable part of her personal liberty under Article 21. It includes the right to choose whether or not to procreate.||The artificial distinction between married and unmarried women in Rule 3B cannot be sustained as it violates Article 14.",
            "timeline_events": json.dumps([
                {"date": "2022-07", "event": "Unmarried woman approaches Delhi HC for abortion at 23 weeks — denied"},
                {"date": "2022-07-21", "event": "Supreme Court stays Delhi HC order, allows abortion to proceed"},
                {"date": "2022-09-29", "event": "Landmark judgment extends 24-week abortion right to unmarried women"},
            ]),
        },
        "Jayalalithaa v. State of Karnataka (Disproportionate Assets)": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Amit Desai, B.H. Marlapalle (for Sasikala)",
            "advocate_respondent": "Harin P. Raval (Special Public Prosecutor)",
            "outcome_detail": "Case against Jayalalithaa abated due to her death. Sasikala, Ilavarasi, and Sudhakaran convicted and sentenced to 4 years simple imprisonment and fined Rs. 10 crore each. The Court found assets worth Rs. 66.65 crore disproportionate to known sources of income.",
            "arguments_petitioner": "The assets belonged to various trusts and companies, not personally to the accused. The income sources were legitimate business earnings. The Karnataka High Court's acquittal should be restored.",
            "arguments_respondent": "The assets worth Rs. 66.65 crore were far in excess of the known sources of income. The accused held benami properties through front companies. Jayalalithaa was the beneficial owner of all assets.",
            "judge_observations": "A public servant who amasses wealth disproportionate to known sources of income is guilty under Section 13(1)(e) of the Prevention of Corruption Act.||The death of Jayalalithaa abates the proceedings against her, but the co-accused stand on their own footing.",
            "timeline_events": json.dumps([
                {"date": "1996", "event": "FIR registered against Jayalalithaa for disproportionate assets"},
                {"date": "2003", "event": "Trial transferred from Chennai to Bangalore by SC"},
                {"date": "2014-09-27", "event": "Bangalore trial court convicts all four accused"},
                {"date": "2015-05", "event": "Karnataka HC acquits all accused"},
                {"date": "2016-12-05", "event": "Jayalalithaa dies; case against her abates"},
                {"date": "2017-02-14", "event": "SC restores conviction of Sasikala and others"},
            ]),
        },
        "Lalu Prasad Yadav v. State of Jharkhand (Fodder Scam)": {
            "bench_size": "Special CBI Court",
            "advocate_petitioner": "CBI through Special Public Prosecutor",
            "advocate_respondent": "Kapil Sibal, Prabhat Kumar (for Lalu Prasad)",
            "outcome_detail": "Convicted in multiple cases: Chaibasa treasury (2013), Deoghar treasury (2017), Dumka treasury (2018). Total sentence: 14 years across cases. Granted bail pending appeal by Jharkhand HC.",
            "arguments_petitioner": "Documentary evidence establishes systematic fraud — fake bills, non-existent livestock, forged signatures. Lalu Prasad as CM was the chief beneficiary and facilitator of the conspiracy.",
            "arguments_respondent": "The withdrawals were legitimate government expenditure. The accused had no direct involvement in treasury operations. The trial was politically motivated.",
            "judge_observations": "The evidence establishes beyond reasonable doubt that the accused were part of a criminal conspiracy to fraudulently withdraw government funds.||The scale of the fraud — running into hundreds of crores — and the involvement of the highest functionaries of the state demonstrate a systematic looting of public money.",
            "timeline_events": json.dumps([
                {"date": "1996", "event": "FIR registered by CBI on fodder scam involving Rs. 950 crore"},
                {"date": "1997", "event": "Lalu Prasad resigns as CM after being chargesheeted"},
                {"date": "2013-09-30", "event": "Convicted in Chaibasa treasury case (RC 20A/96)"},
                {"date": "2017-12-23", "event": "Convicted in Deoghar treasury case — 3.5 years sentence"},
                {"date": "2018-01-24", "event": "Convicted in Dumka treasury case — 14 years sentence"},
                {"date": "2018-03", "event": "Convicted in Chaibasa treasury case (RC 68A/96) — 5 years"},
            ]),
        },
        "Sanjay Dutt v. State of Maharashtra (TADA - Mumbai Blasts)": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Satish Maneshinde (for Sanjay Dutt)",
            "advocate_respondent": "Ujjwal Nikam (Special Public Prosecutor)",
            "outcome_detail": "Acquitted of TADA charges (terrorist activity) but convicted under Arms Act Sections 3 and 7 read with Section 25. Sentence reduced from 6 years (TADA court) to 5 years under Arms Act. He surrendered and completed his sentence in 2016.",
            "arguments_petitioner": "Sanjay Dutt was not part of any terrorist conspiracy. He obtained the weapons for self-protection during the riots. TADA charges require proof of terrorist intent which is absent. The weapons were surrendered voluntarily.",
            "arguments_respondent": "Dutt received weapons from known terrorist conspirators. The weapons included an AK-56 rifle — a weapon of war. Knowledge of the source and nature of weapons establishes culpability. The voluntary surrender was after police investigation began.",
            "judge_observations": "The mere possession of arms received from a person involved in terrorist activity does not make the possessor a terrorist.||However, possession of prohibited arms is a serious offence under the Arms Act regardless of the purpose of possession.",
            "timeline_events": json.dumps([
                {"date": "1993-03-12", "event": "Mumbai serial bomb blasts kill 257 people"},
                {"date": "1993-04-19", "event": "Sanjay Dutt arrested for possession of illegal weapons"},
                {"date": "2006-11-28", "event": "TADA Court convicts Dutt under TADA and Arms Act — 6 years"},
                {"date": "2013-03-21", "event": "Supreme Court acquits of TADA, upholds Arms Act conviction — 5 years"},
                {"date": "2016-02-25", "event": "Released after completing sentence with remission"},
            ]),
        },
        "Sahara India Real Estate Corp. v. SEBI": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Rajeev Dhavan, C.A. Sundaram (for Sahara)",
            "advocate_respondent": "Pratap Venugopal, Arvind Datar (for SEBI)",
            "outcome_detail": "Directed Sahara to refund Rs. 24,029 crore with 15% interest to approximately 3 crore investors. When Sahara failed to comply, Subrata Roy was arrested in March 2014 and remained in jail until parole/bail.",
            "arguments_petitioner": "OFCDs are not securities under SEBI Act. They are private placement debentures under the Companies Act. SEBI has no jurisdiction. The investors were not the public but identifiable persons.",
            "arguments_respondent": "OFCDs are hybrid instruments that function as securities. They were offered to crores of investors — this is a public issue. SEBI has jurisdiction over any instrument that is in substance a security. Investor protection demands SEBI oversight.",
            "judge_observations": "A label on an instrument does not determine its character. Substance prevails over form. When instruments are offered to crores of investors, it is a public issue regardless of what it is called.||SEBI's jurisdiction extends to protect investors from any instrument that in substance functions as a security.",
            "timeline_events": json.dumps([
                {"date": "2008-2009", "event": "Sahara raises Rs. 24,029 crore from approximately 3 crore investors through OFCDs"},
                {"date": "2011-06", "event": "SEBI orders Sahara to refund investors with interest"},
                {"date": "2012-08-31", "event": "Supreme Court upholds SEBI order — directs refund"},
                {"date": "2014-03-04", "event": "Subrata Roy Sahara arrested for non-compliance with refund order"},
                {"date": "2016", "event": "Partial refunds begin through SEBI-Sahara refund account"},
            ]),
        },
        "A. Raja & Others v. CBI (2G Spectrum Scam)": {
            "bench_size": "Special CBI Court",
            "advocate_petitioner": "Anand Grover, U.U. Lalit (Special Public Prosecutors for CBI/ED)",
            "advocate_respondent": "Sushil Kumar, Ram Jethmalani, Vijay Aggarwal (for various accused)",
            "outcome_detail": "All accused acquitted of all charges. The court found that the prosecution failed to prove criminal conspiracy, cheating, and forgery beyond reasonable doubt. The CAG's presumptive loss figure of Rs. 1.76 lakh crore was not accepted as legal proof of actual loss.",
            "arguments_petitioner": "A. Raja manipulated the first-come-first-served policy by advancing the cut-off date and changing eligibility criteria to favor certain companies. There was quid pro quo with companies routing money through shell entities.",
            "arguments_respondent": "The spectrum allocation followed existing policy. First-come-first-served was the government's policy since 2003. There is no evidence of any money trail to any accused. Policy decisions, even if wrong, are not criminal offences.",
            "judge_observations": "I have absolutely no hesitation in holding that the prosecution has miserably failed to prove any charge against any of the accused.||A policy decision may be wrong but a wrong policy decision does not amount to a criminal offence.",
            "timeline_events": json.dumps([
                {"date": "2008-01", "event": "122 new 2G licenses issued at 2001 prices — controversy erupts"},
                {"date": "2010-11", "event": "CAG estimates loss of Rs. 1.76 lakh crore; SC cancels 122 licenses"},
                {"date": "2011-02-02", "event": "CBI registers FIR; A. Raja arrested"},
                {"date": "2011-05", "event": "Kanimozhi arrested for alleged money laundering"},
                {"date": "2017-12-21", "event": "Special Court acquits all accused — prosecution failed to prove case"},
            ]),
        },
        "Satyam Computer Services Fraud (Ramalinga Raju Case)": {
            "bench_size": "Special CBI Court",
            "advocate_petitioner": "K.T.S. Tulsi (Special Public Prosecutor for CBI)",
            "advocate_respondent": "K.V. Vishwanathan, Bharat Sangal (for Ramalinga Raju)",
            "outcome_detail": "Ramalinga Raju and 9 others convicted on all major charges including cheating, criminal conspiracy, forgery, and falsification of accounts. Raju sentenced to 7 years rigorous imprisonment and fined Rs. 5.5 crore.",
            "arguments_petitioner": "Systematic and sustained falsification of accounts over 7 years. Fictitious cash balances of Rs. 5,040 crore shown in books. 7,000 fake employee records created to siphon salaries. Multiple forged bank statements used to deceive auditors and investors.",
            "arguments_respondent": "Raju's confession was under duress. The company's actual operations were legitimate. The accounting differences were due to aggressive but not criminal accounting practices.",
            "judge_observations": "The fraud perpetrated by the accused is unprecedented in the corporate history of India. The systematic nature of the falsification — running over seven years and involving thousands of crores — demonstrates deliberate criminal intent.||The accused misled millions of shareholders, employees, and the investing public.",
            "timeline_events": json.dumps([
                {"date": "2009-01-07", "event": "Ramalinga Raju confesses to fraud in letter to Satyam Board"},
                {"date": "2009-01-09", "event": "Raju arrested by Andhra Pradesh police; SFIO investigation begins"},
                {"date": "2009-04", "event": "Case transferred to CBI; Tech Mahindra acquires Satyam"},
                {"date": "2015-04-09", "event": "CBI Court convicts Raju and 9 others — 7 year sentence"},
            ]),
        },
        "Vijay Mallya Extradition Case (State Bank of India v. Vijay Mallya)": {
            "bench_size": "3-judge bench (SC contempt); UK District Judge (extradition)",
            "advocate_petitioner": "C.A. Sundaram, Jaideep Gupta (for banks); ASG Pinky Anand (for government)",
            "advocate_respondent": "Clare Montgomery QC (UK proceedings); A.M. Singhvi (India proceedings)",
            "outcome_detail": "SC found Mallya guilty of contempt for transferring $40 million to his children despite court orders. UK Westminster Magistrates' Court approved extradition in December 2018. UK Home Secretary signed extradition order in February 2019. Mallya's appeals delayed extradition. The PMLA court also declared him a Fugitive Economic Offender.",
            "arguments_petitioner": "Mallya diverted loan funds for personal use. Kingfisher Airlines continued borrowing despite being technically insolvent. He fled India to evade justice. Assets were transferred to defeat creditors' claims.",
            "arguments_respondent": "The loans were legitimate business borrowings. Kingfisher's failure was due to market conditions and government policy on fuel prices. Mallya offered to repay the full amount. He did not 'flee' but left India on a valid passport.",
            "judge_observations": "The conduct of the contemnor shows that he transferred the amounts to defeat the rights of the banks. This is a clear case of willful disobedience.||There is a prima facie case of fraud. The evidence clearly establishes that the borrower had no intention to repay.",
            "timeline_events": json.dumps([
                {"date": "2012-2013", "event": "Kingfisher Airlines license suspended; massive loan defaults begin"},
                {"date": "2016-03-02", "event": "Mallya leaves India; consortium of banks files recovery suit"},
                {"date": "2017-01", "event": "India formally requests UK for extradition"},
                {"date": "2018-12-10", "event": "UK Magistrates' Court approves extradition to India"},
                {"date": "2019-02", "event": "UK Home Secretary signs extradition order"},
                {"date": "2020-05-14", "event": "UK High Court rejects Mallya's appeal against extradition"},
            ]),
        },
        "Lalita Kumari v. Government of Uttar Pradesh (Mandatory FIR Registration)": {
            "bench_size": "5-judge Constitution Bench",
            "advocate_petitioner": "Gaurav Agrawal (amicus curiae), petitioner in-person",
            "advocate_respondent": "Sidharth Luthra (ASG), various State Advocates General",
            "outcome_detail": "5-judge bench unanimously held that FIR registration is mandatory under Section 154 CrPC when information discloses a cognizable offence. Police have no discretion to refuse. Preliminary inquiry permitted only in 7 limited categories, to be completed within 7 days.",
            "arguments_petitioner": "Refusal to register FIR is a widespread police practice that denies justice to victims. Section 154 CrPC uses the word 'shall' — making registration mandatory. Victims are left without remedy when police refuse FIR.",
            "arguments_respondent": "Some states argued that mandatory FIR registration would lead to frivolous cases flooding the system. A preliminary inquiry is needed to separate genuine cases from false complaints. Police need discretion to manage limited resources.",
            "judge_observations": "Registration of FIR is mandatory under Section 154 of the Code, if the information discloses commission of a cognizable offence and no preliminary inquiry is permissible in such a situation.||The police officer cannot avoid his duty of registering offence if a cognizable offence is disclosed.",
            "timeline_events": json.dumps([
                {"date": "2008", "event": "Lalita Kumari approaches SC after police refuse to register FIR for kidnapping of her minor child"},
                {"date": "2008-11", "event": "2-judge bench refers to larger bench due to conflicting precedents"},
                {"date": "2013-07", "event": "5-judge Constitution Bench hears the matter"},
                {"date": "2014-11-12", "event": "Unanimous judgment: FIR registration mandatory for cognizable offences"},
            ]),
        },
        "Vineet Narain v. Union of India (Jain Hawala Case)": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Arun Jaitley, Prashant Bhushan (for petitioners)",
            "advocate_respondent": "G. Ramaswamy (Attorney General), K. Parasaran",
            "outcome_detail": "Issued binding directions: (1) CBI Director to have minimum 2-year tenure; (2) CBI Director selected by committee including CJI, PM, and Leader of Opposition; (3) CVC to supervise anti-corruption investigations; (4) Government cannot interfere with ongoing investigations. The Supreme Court monitored the hawala investigation for over 4 years.",
            "arguments_petitioner": "The CBI investigation into hawala payments to senior politicians was being deliberately stifled. CBI is a caged parrot doing the bidding of the government. Investigation agencies investigating the powerful need insulation from the very people they investigate.",
            "arguments_respondent": "CBI functions under the executive and the government has the right to supervise its investigations. The Court cannot take over the investigation. Separation of powers requires the judiciary not to direct the executive on investigation matters.",
            "judge_observations": "The CBI cannot be a caged parrot speaking in its master's voice. It must be free to investigate without fear or favour.||Vigilance and investigative agencies must be insulated from extraneous influences. It is the single most important measure to break the stranglehold of corruption.",
            "timeline_events": json.dumps([
                {"date": "1991", "event": "CBI seizes Jain hawala diaries showing payments to politicians"},
                {"date": "1993", "event": "Vineet Narain files PIL seeking court-monitored investigation"},
                {"date": "1993-1997", "event": "Supreme Court monitors CBI investigation for 4+ years"},
                {"date": "1997-12-18", "event": "Landmark judgment with binding directions for CBI independence"},
                {"date": "2003", "event": "CVC Act enacted implementing the judgment's directions"},
            ]),
        },
        "Prakash Singh v. Union of India (Police Reforms)": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Prashant Bhushan (for Prakash Singh)",
            "advocate_respondent": "Solicitor General, various State Advocates General",
            "outcome_detail": "Issued 7 binding directives: (1) State Security Commission; (2) DGP selection through merit-based transparent process with fixed 2-year tenure; (3) Minimum 2-year tenure for operational police officers; (4) Separation of investigation from law and order; (5) Police Establishment Board; (6) Police Complaints Authority at state level; (7) National Security Commission.",
            "arguments_petitioner": "Police in India continue to function under the colonial Police Act of 1861. Multiple commissions have recommended reforms but no state has implemented them. Political interference in policing leads to corruption and human rights violations.",
            "arguments_respondent": "Police is a state subject under the Constitution. The Centre cannot direct states on police reforms. States are best placed to determine their policing needs. Judicial directions on police administration violate separation of powers.",
            "judge_observations": "The need for police reforms has been under consideration since independence. Committee after committee has recommended reforms, but nothing has been done. In the absence of any action by the States, the Court must step in.||The police must be professional, service-oriented, and free from extraneous pressures.",
            "timeline_events": json.dumps([
                {"date": "1996", "event": "Prakash Singh, former DGP, files PIL seeking police reforms"},
                {"date": "1996-2006", "event": "Multiple hearings over 10 years; states resist reforms"},
                {"date": "2006-09-22", "event": "Landmark judgment with 7 binding directives for police reform"},
                {"date": "2006-2024", "event": "Compliance monitored; most states show partial compliance"},
            ]),
        },
        "Arushi Talwar Murder Case (Rajesh & Nupur Talwar v. State of UP)": {
            "bench_size": "Division Bench (Allahabad HC)",
            "advocate_petitioner": "Tanveer Ahmed Mir, R.K. Saini (for Talwars)",
            "advocate_respondent": "S.P. Chauhan (for CBI)",
            "outcome_detail": "Both parents acquitted. The HC found 13 major flaws in the CBI investigation including compromised crime scene, missing evidence, unreliable forensic analysis, and incomplete chain of circumstantial evidence. The trial court's conviction based on last-seen theory and circumstantial evidence was overturned.",
            "arguments_petitioner": "The crime scene was contaminated within hours. The murder weapon was never found. The forensic evidence was inconclusive. The CBI itself filed a closure report initially before being directed to investigate further. The circumstantial evidence chain was broken at multiple points.",
            "arguments_respondent": "The Talwars were the only people present in the flat. They had opportunity and motive. Scientific evidence supports their involvement. Their conduct post-murder was suspicious.",
            "judge_observations": "The prosecution has not been able to establish the chain of circumstances to bring home the guilt of the appellants. There are too many gaps in the prosecution case.||When a case rests entirely on circumstantial evidence, every link in the chain must be established beyond reasonable doubt.",
            "timeline_events": json.dumps([
                {"date": "2008-05-16", "event": "Arushi Talwar (14) found murdered in her bedroom in Noida"},
                {"date": "2008-05-17", "event": "Domestic help Hemraj found dead on terrace"},
                {"date": "2008-2010", "event": "Investigation by UP Police, then CBI — multiple theories"},
                {"date": "2013-11-25", "event": "CBI trial court convicts both parents — life imprisonment"},
                {"date": "2017-10-12", "event": "Allahabad HC acquits — insufficient evidence, investigation flaws"},
            ]),
        },
        "State of Maharashtra v. Suraj Raj Diamonds (Nirav Modi PNB Fraud)": {
            "bench_size": "UK District Judge (extradition); Special PMLA Court (Indian proceedings)",
            "advocate_petitioner": "Mark Summers QC (for Government of India in UK); ED counsel (Indian proceedings)",
            "advocate_respondent": "Clare Montgomery QC (for Nirav Modi in UK)",
            "outcome_detail": "UK court approved extradition finding a prima facie case for fraud and money laundering. Nirav Modi was declared a fugitive economic offender under the Fugitive Economic Offenders Act, 2018. His assets worth over Rs. 2,400 crore were seized and confiscated. Extradition delayed by appeals on mental health grounds.",
            "arguments_petitioner": "Nirav Modi systematically defrauded PNB by obtaining unauthorized LoUs worth Rs. 13,500 crore over 7 years. He corrupted bank employees to bypass the CBS system. He fled India to evade prosecution.",
            "arguments_respondent": "The LoUs were backed by legitimate diamond trade. PNB's internal failures were responsible, not Nirav Modi. Indian prison conditions are inadequate. He has mental health issues that make extradition unjust.",
            "judge_observations": "There is clear evidence of a dishonest scheme to defraud PNB. The evidence shows that Letters of Undertaking were obtained through the corrupt practices of bank officials acting in concert with the defendant.||I am satisfied that the conditions in which he would be held in India would not breach his Article 3 rights.",
            "timeline_events": json.dumps([
                {"date": "2011-2017", "event": "Nirav Modi obtains unauthorized LoUs from PNB Brady House branch worth Rs. 13,500 crore"},
                {"date": "2018-01", "event": "Fraud discovered when a PNB employee seeks SWIFT authorization for new LoU"},
                {"date": "2018-01", "event": "Nirav Modi flees India before FIR is registered"},
                {"date": "2018-02", "event": "CBI and ED register cases; Interpol Red Notice issued"},
                {"date": "2019-03", "event": "Nirav Modi arrested in London"},
                {"date": "2021-02-25", "event": "UK court approves extradition to India"},
            ]),
        },
        # ── 2024 Cases Enrichment ─────────────────────────────────────
        "Association for Democratic Reforms v. Union of India (Electoral Bonds)": {
            "bench_size": "5-judge Constitution Bench",
            "advocate_petitioner": "Prashant Bhushan (for ADR), Shyam Divan, Kapil Sibal",
            "advocate_respondent": "Attorney General R. Venkataramani, Solicitor General Tushar Mehta",
            "outcome_detail": "Unanimously struck down the Electoral Bond Scheme as unconstitutional. Directed SBI to stop issuing bonds and disclose all data (purchaser names, amounts, recipient parties) to the Election Commission within 3 weeks. The ECI was directed to publish all information on its website.",
            "arguments_petitioner": "Electoral bonds enable anonymous corporate funding creating quid pro quo corruption. Voters have a right to know who funds political parties. The scheme was passed as a Money Bill to bypass Rajya Sabha scrutiny. Shell companies can now donate unlimited amounts anonymously.",
            "arguments_respondent": "Anonymity protects donors from political retaliation. Electoral bonds reduce cash in politics and bring transparency through banking channels. The scheme is a policy decision entitled to deference. The right to information must yield to the right to privacy of donors.",
            "judge_observations": "The Electoral Bond Scheme infringes upon the right to information of voters. Information about funding of political parties is essential for a citizen to exercise their right to vote.||The removal of the cap on corporate donations, coupled with anonymity, creates a channel for quid pro quo arrangements.||A citizen's right to know the source of funding of political parties is an essential facet of the right to information under Article 19(1)(a).",
            "timeline_events": json.dumps([
                {"date": "2018-01-02", "event": "Electoral Bond Scheme notified; first tranche of bonds sold"},
                {"date": "2018-03", "event": "ADR and other petitioners challenge the scheme in SC"},
                {"date": "2019-04", "event": "SC issues notice but declines interim stay before general elections"},
                {"date": "2023-10-31", "event": "5-judge bench hears arguments over 3 days"},
                {"date": "2024-02-15", "event": "Unanimous verdict strikes down scheme; directs full disclosure"},
                {"date": "2024-03-14", "event": "SBI publishes electoral bond data on ECI website"},
            ]),
        },
        "State of Punjab v. Davinder Singh (Sub-classification of SC/ST Reservations)": {
            "bench_size": "7-judge Constitution Bench",
            "advocate_petitioner": "Attorney General R. Venkataramani (for Union), State Advocates General",
            "advocate_respondent": "Manoj Swarup, Gopal Sankaranarayanan (for respondents challenging sub-classification)",
            "outcome_detail": "By 6-1 (Justice Trivedi dissenting), overruled E.V. Chinnaiah v. State of AP (2005). Held that sub-classification of SCs/STs is constitutionally permissible if based on quantifiable and demonstrable data of inter-se backwardness. States can prioritize the most marginalized within the SC/ST list. Justice Gavai (concurring) additionally observed that the creamy layer concept should apply to SCs/STs.",
            "arguments_petitioner": "SCs/STs are not a homogeneous class. Data shows that a few castes within the SC list corner most reservation benefits. Sub-classification ensures benefits reach the most backward among SCs. Article 14 permits classification based on intelligible differentia.",
            "arguments_respondent": "The Presidential list under Article 341 creates a deemed class that cannot be sub-divided by states. E.V. Chinnaiah correctly held SCs as an indivisible class. Sub-classification will create inter-caste rivalry and destroy SC unity.",
            "judge_observations": "The assumption that all Scheduled Castes are a homogeneous lot is empirically flawed. Some castes within the SC list remain at the bottom despite decades of reservation.||Sub-classification is not the same as de-notification. It merely prioritizes the most backward within a constitutionally identified class.||It is time for the creamy layer to be applied to Scheduled Castes as well, to ensure that the benefits of reservation reach those who truly need them.",
            "timeline_events": json.dumps([
                {"date": "2006", "event": "Punjab enacts law giving preference to Valmikis and Mazhabi Sikhs within SC quota"},
                {"date": "2010", "event": "Punjab & Haryana HC strikes down the law based on E.V. Chinnaiah"},
                {"date": "2020", "event": "5-judge bench refers to 7-judge bench to reconsider E.V. Chinnaiah"},
                {"date": "2024-07-23", "event": "7-judge bench hears arguments over 5 days"},
                {"date": "2024-08-01", "event": "6-1 verdict: Sub-classification permitted; E.V. Chinnaiah overruled"},
            ]),
        },
        "Mineral Area Development Authority v. Steel Authority of India (Mining Tax)": {
            "bench_size": "9-judge Constitution Bench",
            "advocate_petitioner": "Rakesh Dwivedi, Shyam Divan (for States/MADAs)",
            "advocate_respondent": "Attorney General R. Venkataramani, Harish Salve (for mining companies)",
            "outcome_detail": "By 8-1 (Justice Nagarathna dissenting), held that royalty under Section 9 of the MMDR Act is not a tax. States have legislative competence to levy taxes on mineral rights and mineral-bearing lands under Entries 49 and 50 of List II. India Cement (1990) overruled. However, the decision was applied prospectively — no refunds of taxes already collected by the Centre.",
            "arguments_petitioner": "States have independent taxing power under List II Entries 49 and 50. The MMDR Act regulates mining but does not occupy the field of taxation. Royalty is a contractual consideration, not a tax. India Cement conflated two different concepts.",
            "arguments_respondent": "Royalty partakes the character of a tax. Parliament has exclusive power over mineral regulation under Entry 54 List I. State taxes on minerals would create multiple taxation and harm the mining industry. India Cement is settled law for 34 years.",
            "judge_observations": "Royalty is the price paid by the lessee to the lessor for the privilege of extracting minerals. It is not a tax levied by the sovereign.||The taxing power of the States under Entries 49 and 50 of List II is a constitutional entitlement that cannot be taken away by parliamentary legislation.||We overrule the 7-judge bench decision in India Cement to the extent it holds that royalty is a tax.",
            "timeline_events": json.dumps([
                {"date": "1990", "event": "India Cement holds royalty is a tax — restricts state mining taxation for 34 years"},
                {"date": "2004", "event": "Kesoram Industries questions India Cement but 5-judge bench cannot overrule 7-judge bench"},
                {"date": "2011", "event": "Reference to 9-judge bench to settle the royalty-tax question"},
                {"date": "2024-03", "event": "9-judge bench hears arguments over 8 days"},
                {"date": "2024-07-25", "event": "8-1 verdict: Royalty is not a tax; States can tax minerals; India Cement overruled"},
            ]),
        },
        "Manish Sisodia v. Directorate of Enforcement (PMLA Bail)": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Abhishek Manu Singhvi (for Sisodia)",
            "advocate_respondent": "ASG S.V. Raju (for ED), Tushar Mehta (Solicitor General, for CBI)",
            "outcome_detail": "Granted bail to Manish Sisodia in both CBI and ED cases after 17 months in custody. The Court found that the trial was unlikely to conclude anytime soon with 493 witnesses listed by CBI and the right to speedy trial was being violated. Standard bail conditions including passport surrender were imposed.",
            "arguments_petitioner": "Sisodia has been incarcerated for 17 months without trial commencing. CBI has listed 493 witnesses — trial will take years. Continued custody is punitive, not preventive. The right to speedy trial is a fundamental right under Article 21.",
            "arguments_respondent": "The case involves corruption of Rs. 1 lakh crore in the Delhi excise policy. Sisodia is a flight risk and may influence witnesses. PMLA Section 45 twin conditions are not satisfied. The seriousness of the offence justifies continued custody.",
            "judge_observations": "At this stage, it appears to us that the appellant has been in custody for a sufficient period. The trial is not going to be concluded in the near future.||We are conscious of the seriousness of the allegations. However, the right to speedy trial is a fundamental right and has to be balanced against the need for investigation.||Bail is the rule, jail is the exception — this principle applies with full force even in cases under PMLA.",
            "timeline_events": json.dumps([
                {"date": "2023-02-26", "event": "CBI arrests Manish Sisodia in Delhi excise policy case"},
                {"date": "2023-03-09", "event": "ED arrests Sisodia in connected PMLA case"},
                {"date": "2023-10", "event": "Delhi HC denies bail — twin conditions under PMLA not met"},
                {"date": "2024-05", "event": "SC takes up bail appeal; notes 493 CBI witnesses listed"},
                {"date": "2024-08-09", "event": "SC grants bail in both CBI and ED cases after 17 months"},
            ]),
        },
        # ── 2025 Cases Enrichment ─────────────────────────────────────
        "Bilkis Bano v. Union of India (Remission Revocation)": {
            "bench_size": "2-judge bench",
            "advocate_petitioner": "Shobha Gupta, Vrinda Grover (for Bilkis Bano)",
            "advocate_respondent": "Solicitor General Tushar Mehta (for Union), Mukul Rohatgi (for convicts)",
            "outcome_detail": "Quashed the Gujarat government's remission orders for all 11 convicts. Held that Gujarat had no jurisdiction to grant remission since the trial was conducted in Maharashtra on SC's transfer order. The convicts were directed to surrender within 2 weeks. The Court also found that mandatory procedural safeguards — consulting the presiding judge and hearing the victim — were violated.",
            "arguments_petitioner": "The trial was transferred to Maharashtra by the Supreme Court. Gujarat therefore is not the appropriate government under Section 432 CrPC. The convicts were sentenced to life imprisonment for gang rape and murder of 7 persons during communal riots. Remission was granted without consulting the presiding judge or hearing the victim.",
            "arguments_respondent": "Gujarat is the state where the offence was committed and therefore the appropriate government. The convicts had served 15+ years. Remission was granted following the 1992 policy which was in force at the time of conviction. The convicts have shown good behavior in prison.",
            "judge_observations": "When a trial is transferred by the Supreme Court from one state to another, the state to which it is transferred becomes the appropriate government for the purpose of remission.||The victim has a right to be heard before remission is granted. This right is not a mere formality but a substantive right flowing from Article 21.||The release of the convicts was celebrated publicly, which itself reflects the nature of the remission decision.",
            "timeline_events": json.dumps([
                {"date": "2002-03-03", "event": "Bilkis Bano gang-raped, 7 family members murdered during Gujarat riots"},
                {"date": "2004", "event": "SC transfers trial from Gujarat to Mumbai for fair investigation"},
                {"date": "2008-01", "event": "Mumbai Sessions Court convicts 11 accused — life imprisonment"},
                {"date": "2022-08-15", "event": "Gujarat government grants premature release to all 11 convicts"},
                {"date": "2022-08", "event": "Nationwide outrage; Bilkis Bano files review petition in SC"},
                {"date": "2025-01-08", "event": "SC quashes remission, orders convicts to surrender within 2 weeks"},
            ]),
        },
    }

    for case_data in cases:
        name = case_data["case_name"]
        if name in enrichment:
            case_data.update(enrichment[name])
    return cases


def _enrich_international_cases(cases):
    """Add deep enrichment (advocates, arguments, judge quotes, timelines, outcome detail) to international cases."""
    import json
    enrichment = {
        "Marbury v. Madison": {
            "bench_size": "6 Justices (4-0 decision; 2 recused)",
            "advocate_petitioner": "Charles Lee (former Attorney General)",
            "advocate_respondent": "Levi Lincoln (Attorney General — declined to testify fully)",
            "outcome_detail": "The Court held that Marbury had a right to his commission and the law afforded him a remedy, but Section 13 of the Judiciary Act of 1789 was unconstitutional because it expanded the Supreme Court's original jurisdiction beyond what Article III allowed. The writ of mandamus was denied — but in doing so, Marshall established the far greater power of judicial review.",
            "arguments_petitioner": "Marbury's commission was signed and sealed by President Adams. Once the President signs and the Secretary affixes the seal, the appointment is complete. Withholding a signed, sealed commission is a plain violation of a vested legal right. The Supreme Court has original jurisdiction under the Judiciary Act to issue a writ of mandamus.",
            "arguments_respondent": "The delivery of the commission is a discretionary political act of the Executive branch, not reviewable by courts. The incoming administration has the prerogative to make its own appointments. The judiciary should not interfere with executive decisions.",
            "judge_observations": "It is emphatically the province and duty of the Judicial Department to say what the law is.||The Constitution is either a superior, paramount law, unchangeable by ordinary means, or it is on a level with ordinary legislative acts, alterable when the legislature shall please to alter it. If the former, then a legislative act contrary to the Constitution is not law.||A law repugnant to the Constitution is void, and courts, as well as other departments, are bound by that instrument.",
            "timeline_events": json.dumps([
                {"date": "1801-03-02", "event": "President Adams signs Marbury's commission as Justice of the Peace"},
                {"date": "1801-03-03", "event": "Commissions sealed but not all delivered before Adams leaves office"},
                {"date": "1801-03-04", "event": "Thomas Jefferson inaugurated; orders Madison to withhold undelivered commissions"},
                {"date": "1801-12", "event": "Marbury petitions Supreme Court for writ of mandamus"},
                {"date": "1803-02-24", "event": "Chief Justice Marshall delivers unanimous opinion establishing judicial review"},
            ]),
        },
        "Brown v. Board of Education": {
            "bench_size": "9 Justices (unanimous 9-0)",
            "advocate_petitioner": "Thurgood Marshall (NAACP Legal Defense Fund)",
            "advocate_respondent": "John W. Davis (former presidential candidate and Wall Street lawyer)",
            "outcome_detail": "The Court unanimously held that racial segregation in public schools violates the Equal Protection Clause of the 14th Amendment. Chief Justice Warren wrote: 'In the field of public education, the doctrine of separate but equal has no place.' The decision was deliberately unanimous to send an unmistakable message to the nation. Implementation was deferred to Brown II (1955), which ordered desegregation 'with all deliberate speed.'",
            "arguments_petitioner": "Segregation stamps Black children with a badge of inferiority that affects their hearts and minds in ways unlikely ever to be undone. Psychological studies — including Kenneth Clark's doll experiments — prove that segregation damages Black children's self-esteem. The 14th Amendment was designed to achieve complete equality. No state can use race to deny equal educational opportunity. Separate facilities are inherently unequal because the very act of separation conveys inferiority.",
            "arguments_respondent": "The framers of the 14th Amendment did not intend to abolish segregation in schools — the same Congress that passed the Amendment maintained segregated schools in the District of Columbia. Plessy v. Ferguson has been the settled law for 58 years and states have built their entire educational systems around it. Education is a state matter and the Court should not impose a uniform national standard. The facilities provided to Black students are equal or being equalized.",
            "judge_observations": "Does segregation of children in public schools solely on the basis of race, even though the physical facilities and other tangible factors may be equal, deprive the children of the minority group of equal educational opportunities? We believe that it does.||To separate them from others of similar age and qualifications solely because of their race generates a feeling of inferiority as to their status in the community that may affect their hearts and minds in a way unlikely ever to be undone.||We conclude that in the field of public education the doctrine of 'separate but equal' has no place. Separate educational facilities are inherently unequal.",
            "timeline_events": json.dumps([
                {"date": "1896", "event": "Plessy v. Ferguson establishes 'separate but equal' doctrine"},
                {"date": "1950", "event": "NAACP begins strategic litigation targeting school segregation"},
                {"date": "1951", "event": "Oliver Brown files suit after daughter denied admission to white school in Topeka"},
                {"date": "1952-12", "event": "First oral arguments heard; case consolidated with four similar cases"},
                {"date": "1953-12", "event": "Case re-argued after Chief Justice Vinson dies; Earl Warren becomes Chief Justice"},
                {"date": "1954-05-17", "event": "Unanimous decision announced: separate educational facilities are inherently unequal"},
                {"date": "1955-05-31", "event": "Brown II orders desegregation 'with all deliberate speed'"},
            ]),
        },
        "Miranda v. Arizona": {
            "bench_size": "9 Justices (5-4 decision)",
            "advocate_petitioner": "John J. Flynn (court-appointed attorney from Phoenix)",
            "advocate_respondent": "Gary K. Nelson (Arizona Assistant Attorney General)",
            "outcome_detail": "In a 5-4 decision, the Court held that statements obtained during custodial interrogation are inadmissible unless the suspect was informed of specific rights: the right to remain silent, that anything said can be used against them, the right to an attorney, and that an attorney will be appointed if they cannot afford one. Ernesto Miranda's conviction was reversed. He was later retried without the confession and convicted again based on other evidence.",
            "arguments_petitioner": "The atmosphere of a police interrogation room is inherently coercive. Without being informed of constitutional rights, a suspect's waiver of those rights cannot be knowing and voluntary. The Fifth Amendment privilege against self-incrimination is meaningless if suspects don't know they have it. Police manuals themselves describe techniques designed to overcome a suspect's will — this proves the coercive nature of custodial interrogation.",
            "arguments_respondent": "The Constitution does not require specific warnings before interrogation. Voluntariness of confessions should continue to be judged under the totality of circumstances test. Mandatory warnings will handcuff law enforcement and allow dangerous criminals to go free. The states should be allowed to develop their own safeguards through the legislative process rather than having rigid rules imposed by the Court.",
            "judge_observations": "The prosecution may not use statements, whether exculpatory or inculpatory, stemming from custodial interrogation of the defendant unless it demonstrates the use of procedural safeguards effective to secure the privilege against self-incrimination.||Prior to any questioning, the person must be warned that he has a right to remain silent, that any statement he does make may be used as evidence against him, and that he has a right to the presence of an attorney.||If the individual indicates in any manner, at any time prior to or during questioning, that he wishes to remain silent, the interrogation must cease.",
            "timeline_events": json.dumps([
                {"date": "1963-03", "event": "Ernesto Miranda arrested in Phoenix on kidnapping and rape charges"},
                {"date": "1963-03-13", "event": "Miranda interrogated for 2 hours without being told of his rights; signs confession"},
                {"date": "1963-06", "event": "Miranda convicted at trial; confession used as key evidence"},
                {"date": "1965", "event": "Arizona Supreme Court affirms conviction"},
                {"date": "1966-02-28", "event": "Oral arguments before U.S. Supreme Court"},
                {"date": "1966-06-13", "event": "5-4 decision establishes Miranda warnings requirement"},
                {"date": "1967", "event": "Miranda retried without confession, convicted on other evidence"},
            ]),
        },
        "Donoghue v. Stevenson": {
            "bench_size": "5 Law Lords (3-2 decision)",
            "advocate_petitioner": "George Morton KC and W.R. Milligan",
            "advocate_respondent": "W.G. Normand KC (later Lord Normand)",
            "outcome_detail": "By a 3-2 majority, the House of Lords held that a manufacturer owes a duty of care to the ultimate consumer of a product when there is no reasonable possibility of intermediate examination. Lord Atkin's famous 'neighbour principle' established the modern law of negligence. The case was actually settled before retrial — Stevenson died and his estate paid Mrs. Donoghue £200.",
            "arguments_petitioner": "A manufacturer who puts a product into circulation in a form that prevents intermediate examination owes a duty directly to the consumer. It would be unjust to leave Mrs. Donoghue without a remedy simply because she did not buy the drink herself. The friend who purchased it had a contract claim, but the person actually injured had none — this cannot be right. The law must evolve to protect consumers from negligent manufacturers.",
            "arguments_respondent": "Without a contract between Mrs. Donoghue and the manufacturer, there can be no legal relationship giving rise to liability. To impose liability without privity of contract would open the floodgates of litigation. A manufacturer cannot be expected to guarantee the safety of products once they leave the factory. The existing law adequately protects consumers through the contractual chain.",
            "judge_observations": "You must take reasonable care to avoid acts or omissions which you can reasonably foresee would be likely to injure your neighbour. Who, then, in law, is my neighbour? Persons who are so closely and directly affected by my act that I ought reasonably to have them in contemplation.||A manufacturer of products, which he sells in such a form as to show that he intends them to reach the ultimate consumer in the form in which they left him, with no reasonable possibility of intermediate examination, and with the knowledge that the absence of reasonable care in the preparation or putting up of the products will result in an injury to the consumer's life or property, owes a duty to the consumer to take that reasonable care.",
            "timeline_events": json.dumps([
                {"date": "1928-08-26", "event": "May Donoghue drinks ginger beer containing decomposed snail at Wellmeadow Café, Paisley"},
                {"date": "1929", "event": "Donoghue sues manufacturer David Stevenson (cannot sue retailer — no contract)"},
                {"date": "1930", "event": "Court of Session in Scotland dismisses the case — no duty without contract"},
                {"date": "1931-12", "event": "Case argued before the House of Lords over four days"},
                {"date": "1932-05-26", "event": "House of Lords delivers 3-2 decision establishing neighbour principle"},
                {"date": "1932-11", "event": "David Stevenson dies; estate settles with Donoghue for £200"},
            ]),
        },
        "Palsgraf v. Long Island Railroad Co.": {
            "bench_size": "7 Judges (4-3 decision)",
            "advocate_petitioner": "Matthew W. Wood",
            "advocate_respondent": "William McNamara",
            "outcome_detail": "In a 4-3 decision, the Court of Appeals reversed the lower courts and ruled for the railroad. Judge Cardozo held that the railroad employees' negligence in helping the passenger was not a wrong against Palsgraf because she stood too far away and the harm to her was not foreseeable. The case produced one of the most famous judicial debates in legal history — Cardozo's foreseeability approach versus Andrews' directness test.",
            "arguments_petitioner": "The railroad employees were negligent in the way they assisted the passenger boarding the train, causing him to drop the package. This negligence set in motion a chain of events that injured Mrs. Palsgraf. The railroad should be liable for all consequences of its employees' negligent acts. If the act was negligent toward anyone, it was negligent toward everyone affected.",
            "arguments_respondent": "The railroad employees could not possibly have foreseen that helping a passenger board a train would cause an explosion that would topple scales at the other end of the platform. There was no duty of care toward Mrs. Palsgraf because harm to someone in her position was not reasonably foreseeable from the employees' actions. Liability cannot extend to unforeseeable plaintiffs.",
            "judge_observations": "Negligence is not actionable unless it involves the invasion of a legally protected interest, the violation of a right. The conduct of the defendant's guard, if a wrong in its relation to the holder of the package, was not a wrong in its relation to the plaintiff, standing far away. — Cardozo||Everyone owes to the world at large the duty of refraining from those acts that may unreasonably threaten the safety of others. Due care is a duty imposed on each one of us to protect society from unnecessary danger. — Andrews (dissent)||The range of reasonable apprehension is at times a question for the court, and at times, if varying inferences are possible, a question for the jury. — Cardozo",
            "timeline_events": json.dumps([
                {"date": "1924-08-24", "event": "Incident at East New York station — package of fireworks dropped, scales fall on Helen Palsgraf"},
                {"date": "1927", "event": "Trial court awards Palsgraf $6,000 in damages; Appellate Division affirms"},
                {"date": "1928-05-29", "event": "Court of Appeals reverses 4-3; Cardozo writes majority, Andrews writes famous dissent"},
            ]),
        },
        "Salomon v. Salomon & Co.": {
            "bench_size": "7 Law Lords (unanimous)",
            "advocate_petitioner": "Representation for Aron Salomon",
            "advocate_respondent": "Sir Horace Davey QC (for the liquidator and unsecured creditors)",
            "outcome_detail": "The House of Lords unanimously reversed the Court of Appeal and held that Salomon & Co. was a separate legal entity from Aron Salomon. The company's debts were not his debts. His debentures (secured loans to the company) were valid and gave him priority over unsecured creditors. Lord Macnaghten's speech established that once a company is validly incorporated, the motives of those who formed it are irrelevant.",
            "arguments_petitioner": "The company was properly formed under the Companies Act 1862 with seven shareholders as required by law. The fact that six of the seven were family members holding one share each does not invalidate the incorporation. A validly formed company is a person at law distinct from its members. Salomon's debentures were a valid secured debt of the company.",
            "arguments_respondent": "The company was a mere sham — a device for Salomon to conduct business under the cloak of limited liability while maintaining complete control. The other shareholders were mere dummies. Salomon was effectively the company itself, and it would be unjust to allow him to hide behind the corporate form to defeat legitimate creditors. He should be treated as an undisclosed principal of the company.",
            "judge_observations": "The company is at law a different person altogether from the subscribers to the memorandum; and, though it may be that after incorporation the business is precisely the same as it was before, and the same persons are managers, and the same hands receive the profits, the company is not in law the agent of the subscribers or trustee for them. — Lord Macnaghten||Either the limited company was a legal entity or it was not. If it was, the business belonged to it and not to Mr. Salomon. — Lord Halsbury",
            "timeline_events": json.dumps([
                {"date": "1892", "event": "Aron Salomon incorporates his boot-making business as Salomon & Co. Ltd"},
                {"date": "1893", "event": "Economic downturn; company fails and goes into liquidation"},
                {"date": "1895", "event": "Court of Appeal holds Salomon personally liable — company was a sham"},
                {"date": "1897-11-16", "event": "House of Lords unanimously reverses: company is a separate legal entity"},
            ]),
        },
        "R v. Dudley and Stephens": {
            "bench_size": "5 Judges",
            "advocate_petitioner": "Sir Henry James QC (for the Crown)",
            "advocate_respondent": "A. Collins QC (for Dudley and Stephens)",
            "outcome_detail": "The court found Dudley and Stephens guilty of murder, holding that necessity is never a defense to the taking of an innocent life. They were sentenced to death, but Queen Victoria commuted the sentence to six months' imprisonment. The case remains the definitive statement in common law that one cannot kill an innocent person to save oneself, no matter how extreme the circumstances.",
            "arguments_petitioner": "However desperate the circumstances, the deliberate killing of an innocent person is murder. To allow necessity as a defense to murder would create a dangerous precedent — who is to decide whose life is more valuable? The cabin boy Richard Parker did not consent to being killed. If necessity excuses murder, then the strong will always sacrifice the weak, and the law would sanction it.",
            "arguments_respondent": "The men were in extremis — 20 days adrift at sea with no food or water. The cabin boy was already dying. If they had not killed him, all four would have perished. By sacrificing one life, three were saved. Custom of the sea had long recognized that in desperate survival situations, lots could be drawn. The defendants acted out of necessity, not malice.",
            "judge_observations": "To preserve one's life is generally speaking a duty, but it may be the plainest and the highest duty to sacrifice it. It is not correct to say that there is any absolute or unqualified necessity to preserve one's life.||It is not needful to point out the awful danger of admitting the principle which has been contended for. Who is to be the judge of this sort of necessity? By what measure is the comparative value of lives to be measured?||Though law and morality are not the same, and many things may be immoral which are not necessarily illegal, yet the absolute divorce of law from morality would be of fatal consequence.",
            "timeline_events": json.dumps([
                {"date": "1884-05-19", "event": "Yacht Mignonette sinks in South Atlantic; four crew escape in a lifeboat"},
                {"date": "1884-07-05", "event": "After 20 days with no food/water, Dudley and Stephens kill cabin boy Richard Parker"},
                {"date": "1884-07-09", "event": "Survivors rescued by German ship Montezuma"},
                {"date": "1884-12-09", "event": "Court finds Dudley and Stephens guilty of murder; sentenced to death"},
                {"date": "1884-12", "event": "Queen Victoria commutes sentence to six months' imprisonment"},
            ]),
        },
        "Gideon v. Wainwright": {
            "bench_size": "9 Justices (unanimous 9-0)",
            "advocate_petitioner": "Abe Fortas (later appointed to the Supreme Court by LBJ)",
            "advocate_respondent": "Bruce R. Jacob (Florida Assistant Attorney General)",
            "outcome_detail": "The Court unanimously held that the Sixth Amendment right to counsel is incorporated against the states through the 14th Amendment. Clarence Gideon was retried with a court-appointed attorney and acquitted. The decision effectively created the modern public defender system in America — within two years, states established or expanded public defender offices across the country. Over 2,000 Florida prisoners were released or retried after the decision.",
            "arguments_petitioner": "The right to counsel is fundamental to a fair trial. The average person has neither the skill nor the knowledge to adequately prepare a defense. Without a lawyer, the accused faces a trained prosecutor backed by the full resources of the state. Betts v. Brady's 'special circumstances' rule has proven unworkable and creates arbitrary results — whether you get a lawyer depends on which state you're in.",
            "arguments_respondent": "The matter should be left to the states. Florida provides counsel in capital cases and has discretion for other cases. The 14th Amendment does not mandate that every felony defendant receive appointed counsel — the original Constitution left this to the states. The 'special circumstances' test of Betts v. Brady gives courts flexibility to assess each case individually.",
            "judge_observations": "In our adversary system of criminal justice, any person haled into court, who is too poor to hire a lawyer, cannot be assured a fair trial unless counsel is provided for him.||Lawyers in criminal courts are necessities, not luxuries.||The right of one charged with crime to counsel may not be deemed fundamental and essential to fair trials in some countries, but it is in ours. From the very beginning, our state and national constitutions and laws have laid great emphasis on procedural and substantive safeguards designed to assure fair trials before impartial tribunals.",
            "timeline_events": json.dumps([
                {"date": "1961-06-03", "event": "Clarence Gideon arrested for breaking into Bay Harbor Poolroom in Panama City, Florida"},
                {"date": "1961-08-04", "event": "Gideon requests court-appointed counsel; Judge McCrary denies — Florida only provides in capital cases"},
                {"date": "1961-08-04", "event": "Gideon represents himself at trial, is convicted, sentenced to 5 years"},
                {"date": "1962-01", "event": "Gideon files handwritten petition to Supreme Court from prison on prison stationery"},
                {"date": "1963-01-15", "event": "Oral arguments; Abe Fortas argues for Gideon"},
                {"date": "1963-03-18", "event": "Unanimous decision: right to counsel is fundamental in all felony cases"},
                {"date": "1963-08-05", "event": "Gideon retried with court-appointed lawyer W. Fred Turner; acquitted by jury"},
            ]),
        },
        "Loving v. Virginia": {
            "bench_size": "9 Justices (unanimous 9-0)",
            "advocate_petitioner": "Bernard S. Cohen and Philip J. Hirschkop (ACLU volunteer attorneys)",
            "advocate_respondent": "R.D. McIlwaine III (Virginia Assistant Attorney General)",
            "outcome_detail": "The Court unanimously struck down Virginia's Racial Integrity Act and all similar laws in the 16 states that still had them. Chief Justice Warren wrote that marriage is one of the basic civil rights of man, fundamental to our very existence and survival. The decision invalidated anti-miscegenation statutes across the country. The Lovings returned to Virginia and lived together until Richard was killed in a car accident in 1975.",
            "arguments_petitioner": "Racial classifications in marriage laws serve no legitimate purpose — they exist solely to maintain White Supremacy. The 14th Amendment was designed to eliminate all official state sources of invidious racial discrimination. The freedom to marry is a fundamental right that cannot be infringed based on race. Attorney Bernard Cohen told the Court he had a message from Richard Loving: 'Mr. Cohen, tell the Court I love my wife.'",
            "arguments_respondent": "Regulation of marriage has traditionally been a state matter. The 14th Amendment was not intended to prohibit all racial distinctions. The statute applies equally to both races — whites are equally prohibited from marrying Blacks. Virginia has a legitimate interest in preventing the 'corruption of blood' and the creation of a 'mongrel breed of citizens.' Scientific evidence supports preserving racial integrity.",
            "judge_observations": "Marriage is one of the basic civil rights of man, fundamental to our very existence and survival.||Under our Constitution, the freedom to marry, or not marry, a person of another race resides with the individual, and cannot be infringed by the State.||The Fourteenth Amendment requires that the freedom of choice to marry not be restricted by invidious racial discriminations. There is patently no legitimate overriding purpose independent of invidious racial discrimination which justifies this classification.",
            "timeline_events": json.dumps([
                {"date": "1958-06-02", "event": "Richard Loving and Mildred Jeter marry in Washington, D.C."},
                {"date": "1958-07", "event": "The Lovings are arrested in their bedroom at 2 AM in Caroline County, Virginia"},
                {"date": "1959-01-06", "event": "Judge Bazile sentences them to one year in prison, suspended if they leave Virginia for 25 years"},
                {"date": "1963", "event": "Mildred Loving writes to Attorney General Robert Kennedy; he refers her to the ACLU"},
                {"date": "1964", "event": "ACLU attorneys Cohen and Hirschkop take the case"},
                {"date": "1966-03", "event": "Virginia Supreme Court upholds the conviction but modifies the sentence"},
                {"date": "1967-06-12", "event": "U.S. Supreme Court unanimously strikes down all anti-miscegenation laws"},
            ]),
        },
        "Obergefell v. Hodges": {
            "bench_size": "9 Justices (5-4 decision)",
            "advocate_petitioner": "Mary Bonauto (Gay & Lesbian Advocates & Defenders) and Douglas Hallward-Driemeier",
            "advocate_respondent": "John J. Bursch (Michigan Special Assistant Attorney General)",
            "outcome_detail": "In a deeply divided 5-4 decision, Justice Kennedy held that the fundamental right to marry is guaranteed to same-sex couples under the Due Process and Equal Protection Clauses. The decision legalized same-sex marriage in all 50 states. All four dissenting justices wrote separate dissents — Chief Justice Roberts, and Justices Scalia, Thomas, and Alito — each objecting on different grounds.",
            "arguments_petitioner": "The freedom to marry is a fundamental right. Same-sex couples form the same deep attachments and commitments as opposite-sex couples. Denying marriage to same-sex couples stigmatizes them and their children, denying tangible benefits (inheritance, hospital visitation, tax) and intangible ones (dignity, recognition). History shows that evolving understanding of constitutional rights has expanded inclusion — from interracial marriage to prisoner marriage rights.",
            "arguments_respondent": "Marriage has been defined as between a man and a woman for millennia across every culture. The democratic process — not courts — should resolve this question. Thirty-one states voted to define marriage as between a man and a woman. Redefining marriage will have unknown consequences for religious liberty and child-rearing. The Constitution does not speak to this issue and the Court should not impose its own social vision on the nation.",
            "judge_observations": "No union is more profound than marriage, for it embodies the highest ideals of love, fidelity, devotion, sacrifice, and family. In forming a marital union, two people become something greater than once they were. — Kennedy||The Constitution promises liberty to all within its reach, a liberty that includes certain specific rights that allow persons, within a lawful realm, to define and express their identity. — Kennedy||If you are among the many Americans — of whatever sexual orientation — who favor expanding same-sex marriage, by all means celebrate today's decision. But do not celebrate the Constitution. It had nothing to do with it. — Roberts (dissent)",
            "timeline_events": json.dumps([
                {"date": "2013-07-11", "event": "John Arthur, terminally ill, marries James Obergefell on a medical jet in Maryland"},
                {"date": "2013-10-22", "event": "John Arthur dies; Obergefell sues to be listed as surviving spouse on death certificate"},
                {"date": "2014", "event": "Multiple federal courts strike down state bans on same-sex marriage"},
                {"date": "2015-01-16", "event": "Supreme Court agrees to hear cases from Ohio, Michigan, Kentucky, Tennessee"},
                {"date": "2015-04-28", "event": "Oral arguments heard; case draws massive public attention"},
                {"date": "2015-06-26", "event": "5-4 decision legalizes same-sex marriage nationwide"},
            ]),
        },
        "Lochner v. New York": {
            "bench_size": "9 Justices (5-4 decision)",
            "advocate_petitioner": "Henry Weismann (who had actually helped draft the Bakeshop Act before opposing it)",
            "advocate_respondent": "Julius M. Mayer (New York Attorney General)",
            "outcome_detail": "In a 5-4 decision, the Court struck down the Bakeshop Act as an unconstitutional interference with liberty of contract. The case inaugurated the 'Lochner era' (1905-1937), during which the Court struck down numerous labor and economic regulations. Justice Holmes' dissent became one of the most celebrated in Supreme Court history. The decision was effectively overruled by West Coast Hotel Co. v. Parrish (1937).",
            "arguments_petitioner": "The Bakeshop Act is a labor law disguised as a health measure. Baking is not an unhealthy occupation requiring special protection. The liberty to make contracts is protected by the 14th Amendment. Workers have the right to sell their labor on whatever terms they choose, and the state cannot interfere with this fundamental economic freedom.",
            "arguments_respondent": "The state has broad police power to protect the health and welfare of its citizens. Bakery work involves long hours in hot, dusty, flour-laden conditions that are genuinely harmful to health. The legislature is better positioned than courts to assess whether working conditions justify regulation. Employees lack bargaining power against employers and need legislative protection.",
            "judge_observations": "The general right to make a contract in relation to his business is part of the liberty of the individual protected by the Fourteenth Amendment. — Peckham (majority)||This case is decided upon an economic theory which a large part of the country does not entertain. The Fourteenth Amendment does not enact Mr. Herbert Spencer's Social Statics. A constitution is not intended to embody a particular economic theory. — Holmes (dissent)||The liberty of the citizen to do as he likes so long as he does not interfere with the liberty of others to do the same is interfered with by school laws, by the Post Office, by every state or municipal institution which takes his money for purposes thought desirable. — Holmes (dissent)",
            "timeline_events": json.dumps([
                {"date": "1895", "event": "New York passes Bakeshop Act limiting bakers to 10 hrs/day, 60 hrs/week"},
                {"date": "1901", "event": "Joseph Lochner fined $50 for allowing employee to work over 60 hours"},
                {"date": "1904", "event": "New York Court of Appeals upholds the law 4-3"},
                {"date": "1905-02-23", "event": "Oral arguments before the Supreme Court"},
                {"date": "1905-04-17", "event": "5-4 decision strikes down the Bakeshop Act; Holmes writes legendary dissent"},
                {"date": "1937", "event": "West Coast Hotel v. Parrish effectively ends the Lochner era"},
            ]),
        },
        "The Nuremberg Trials (IMT)": {
            "bench_size": "4 Judges (one each from USA, UK, France, USSR) with 4 alternates",
            "advocate_petitioner": "Robert H. Jackson (U.S. Chief Prosecutor); Sir Hartley Shawcross (UK); François de Menthon and Auguste Champetier de Ribes (France); Roman Rudenko (USSR)",
            "advocate_respondent": "Various German defense counsel including Dr. Hermann Jahrreiss, Dr. Otto Stahmer (for Göring), Dr. Alfred Seidl (for Hess and Frank)",
            "outcome_detail": "Of the 22 defendants tried, 12 were sentenced to death by hanging (including Göring, Ribbentrop, Keitel, Rosenberg), 3 to life imprisonment, 4 to prison terms of 10-20 years, and 3 were acquitted (Schacht, von Papen, Fritzsche). The trials established that individuals — not just states — bear responsibility under international law, and that 'following orders' is not a valid defense for atrocities. Göring committed suicide by cyanide the night before his scheduled execution.",
            "arguments_petitioner": "The wrongs which we seek to condemn and punish have been so calculated, so malignant, and so devastating, that civilization cannot tolerate their being ignored, because it cannot survive their being repeated. — Jackson's opening statement. The defendants held positions of power and used that power to wage aggressive war, commit war crimes, and perpetrate crimes against humanity including the systematic extermination of six million Jews and millions of others.",
            "arguments_respondent": "The tribunal violates the principle of nullum crimen sine lege — there was no international criminal law at the time the acts were committed. The defendants were following the orders of a legitimate government and the doctrine of state sovereignty should protect them. The tribunal is 'victors' justice' — the Allies committed similar acts (bombing of Dresden, Soviet massacres at Katyn) but are not being tried.",
            "judge_observations": "Crimes against international law are committed by men, not by abstract entities, and only by punishing individuals who commit such crimes can the provisions of international law be enforced.||The fact that a person who committed an act which constitutes a crime under international law acted as Head of State or responsible Government official does not relieve him from responsibility under international law.||The true test is not the existence of the order, but whether moral choice was in fact possible.",
            "timeline_events": json.dumps([
                {"date": "1945-08-08", "event": "London Charter establishes the International Military Tribunal"},
                {"date": "1945-10-19", "event": "Indictments served on 24 defendants"},
                {"date": "1945-11-20", "event": "Trial opens in Nuremberg Palace of Justice; Jackson delivers famous opening statement"},
                {"date": "1946-03-13", "event": "Hermann Göring takes the stand — interrogated for 8 days"},
                {"date": "1946-08-31", "event": "Final statements by defendants"},
                {"date": "1946-10-01", "event": "Judgment delivered: 12 death sentences, 3 acquittals, 7 prison terms"},
                {"date": "1946-10-15", "event": "Göring commits suicide; remaining 10 executed by hanging"},
            ]),
        },
        "Apple Inc. v. Samsung Electronics Co.": {
            "bench_size": "8 Justices (unanimous 8-0; Kagan recused)",
            "advocate_petitioner": "Kathleen M. Sullivan (for Samsung)",
            "advocate_respondent": "Seth P. Waxman (for Apple)",
            "outcome_detail": "The Court unanimously held that 'article of manufacture' in 35 U.S.C. § 289 can refer to a component of a product, not just the entire product sold to consumers. The case was remanded for the lower court to determine the relevant article of manufacture and recalculate damages. The original $399 million verdict against Samsung was vacated. The case eventually settled in 2018 for an undisclosed amount, ending seven years of global patent warfare between the two companies.",
            "arguments_petitioner": "Samsung argued that design patent damages should be limited to the profits attributable to the specific component embodying the design — not the entire phone. A smartphone contains over 250,000 patents; it is absurd to award all profits from the phone based on a few design elements like rounded corners. The 'total profit' rule would give Apple a windfall far exceeding the value of the patented designs.",
            "arguments_respondent": "Apple argued that the 'article of manufacture' is the phone itself — consumers buy phones, not components. Samsung deliberately copied the iPhone's iconic design to free-ride on Apple's innovation. The patent statute says infringers shall be liable for their 'total profit' from the article of manufacture, and the article here is the phone. Allowing component-level damages would gut design patent protection.",
            "judge_observations": "The term 'article of manufacture' is broad enough to encompass both a product sold to a consumer and a component of that product.||The parties ask us to go further and resolve whether, for each design patent at issue, the relevant article of manufacture is the smartphone, or a particular smartphone component. We decline to lay out a test for identifying the relevant article of manufacture.",
            "timeline_events": json.dumps([
                {"date": "2011-04-15", "event": "Apple sues Samsung in Northern District of California for copying iPhone design"},
                {"date": "2012-08-24", "event": "Jury awards Apple $1.05 billion in damages"},
                {"date": "2013", "event": "Judge reduces damages; partial retrial ordered"},
                {"date": "2015-05", "event": "Federal Circuit affirms $399 million design patent damages"},
                {"date": "2016-03-21", "event": "Supreme Court hears oral arguments"},
                {"date": "2016-12-06", "event": "Unanimous decision: 'article of manufacture' can be a component"},
                {"date": "2018-06", "event": "Apple and Samsung reach final settlement, ending 7-year global patent war"},
            ]),
        },
        "Massachusetts v. EPA": {
            "bench_size": "9 Justices (5-4 decision)",
            "advocate_petitioner": "James Milkey (Massachusetts Assistant Attorney General)",
            "advocate_respondent": "Gregory G. Garre (U.S. Deputy Solicitor General)",
            "outcome_detail": "In a 5-4 decision, the Court held that greenhouse gases fit within the Clean Air Act's broad definition of 'air pollutant' and that the EPA was required to regulate them if it found they endangered public health. The case established that states have special standing to sue the federal government for environmental harm. The decision directly led to the EPA's 2009 Endangerment Finding and subsequent vehicle emissions regulations. Chief Justice Roberts wrote a notable dissent questioning Massachusetts' standing.",
            "arguments_petitioner": "Carbon dioxide and other greenhouse gases are 'air pollutants' under the Clean Air Act's capacious definition. The scientific evidence of climate change is overwhelming. Massachusetts is already losing coastal land to rising sea levels caused by global warming. The EPA has a statutory obligation to regulate these pollutants and cannot simply refuse to act based on policy preferences.",
            "arguments_respondent": "The Clean Air Act was never intended to cover greenhouse gases — Congress would not have delegated such an enormous regulatory decision implicitly. The petitioners lack standing because climate change injuries are too generalized and not redressable by a single EPA regulation. Even if the EPA has authority, it has discretion to decline regulation based on policy considerations, including the ongoing scientific debate and the impact on the economy.",
            "judge_observations": "The harms associated with climate change are serious and well recognized. The Government's own objective assessment of the relevant science and probable impacts confirms this.||EPA has offered no reasoned explanation for its refusal to decide whether greenhouse gases cause or contribute to climate change. Its action was therefore arbitrary, capricious, or otherwise not in accordance with law.||A well-documented rise in global temperatures has coincided with a significant increase in the concentration of carbon dioxide in the atmosphere. Respected combative scientists believe the two trends are related.",
            "timeline_events": json.dumps([
                {"date": "1999", "event": "Environmental groups petition EPA to regulate greenhouse gas emissions from vehicles"},
                {"date": "2003-09", "event": "EPA denies petition — claims it lacks authority under Clean Air Act"},
                {"date": "2005", "event": "D.C. Circuit upholds EPA denial in split decision"},
                {"date": "2006-11-29", "event": "Supreme Court hears oral arguments"},
                {"date": "2007-04-02", "event": "5-4 decision: greenhouse gases are pollutants; EPA must assess danger"},
                {"date": "2009-12", "event": "EPA issues Endangerment Finding — CO2 endangers public health"},
            ]),
        },
        "Kesavananda Bharati v. State of Kerala": {
            "bench_size": "13-judge bench (7-6 decision) — largest bench in Indian Supreme Court history",
            "advocate_petitioner": "Nani Palkhivala (leading Indian constitutional jurist)",
            "advocate_respondent": "H.M. Seervai (Advocate General of Maharashtra) and Niren De (Attorney General of India)",
            "outcome_detail": "In a razor-thin 7-6 decision, the largest bench in Indian Supreme Court history held that Parliament has the power to amend any provision of the Constitution, including fundamental rights, but it cannot alter the 'basic structure' of the Constitution. Chief Justice Sikri identified key elements of the basic structure: supremacy of the Constitution, republican and democratic government, secular character, separation of powers, and federalism. The case was argued over 68 working days — the longest hearing in Indian Supreme Court history. Nani Palkhivala's arguments are regarded as the finest constitutional advocacy in Indian legal history.",
            "arguments_petitioner": "Palkhivala argued passionately: 'If Parliament can destroy the basic structure, it can convert democracy into dictatorship, a secular state into a theocracy, a republic into a monarchy. The amending power cannot be used to destroy the very Constitution that grants that power.' Fundamental rights represent the conscience of the Constitution. The 24th and 25th Amendments, by giving Parliament unlimited power, destroy the very foundations of constitutional governance.",
            "arguments_respondent": "Parliament derives its amending power from the sovereign people of India. Article 368 grants plenary power to amend without limitation. If the people's elected representatives decide that fundamental rights should be modified for social reform (like land redistribution), the Court should not stand in the way. The Court's role is to interpret, not to set itself up as a super-legislature by imposing implied limitations that do not exist in the text.",
            "judge_observations": "If the historical background, the Preamble, the entire scheme of the Constitution, the relevant provisions thereof including Article 368 are kept in mind, there can be no difficulty in discerning that the following can be regarded as the basic structure: supremacy of the Constitution, republican and democratic form of government, secular character, separation of powers, federal character. — Chief Justice Sikri||The Constitution is a precious heritage; therefore you cannot destroy its identity. — Khanna J.||Amending power and constituent power are different. The framers of the Constitution gave Parliament the power to amend, not the power to rewrite or destroy. — Palkhivala (argument)",
            "timeline_events": json.dumps([
                {"date": "1969", "event": "Kerala Land Reforms Act restricts Kesavananda Bharati's religious property"},
                {"date": "1970", "event": "Writ petition filed challenging the land reforms and the 24th & 25th Amendments"},
                {"date": "1972-10-31", "event": "Hearing begins before 13-judge bench — Palkhivala begins legendary arguments"},
                {"date": "1973-03-23", "event": "Hearing concludes after 68 working days — longest in SC history"},
                {"date": "1973-04-24", "event": "7-6 decision: basic structure doctrine established"},
                {"date": "1973-04-25", "event": "Government transfers Chief Justice Sikri; supersedes three senior judges — constitutional crisis"},
            ]),
        },
        "Vishaka v. State of Rajasthan": {
            "bench_size": "3-judge bench",
            "advocate_petitioner": "Naina Kapur and Meenakshi Arora (representing women's organizations)",
            "advocate_respondent": "State counsel for Rajasthan and Union of India",
            "outcome_detail": "The Court issued comprehensive guidelines for prevention of sexual harassment at the workplace, holding that these would have the force of law until appropriate legislation was enacted. The Vishaka Guidelines defined sexual harassment, mandated Complaints Committees in every workplace, prescribed procedures for complaints, and required employers to raise awareness. The guidelines remained binding for 16 years until Parliament enacted the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.",
            "arguments_petitioner": "Bhanwari Devi was gang-raped as retaliation for performing her government duty of preventing child marriage. Her acquittal by the trial court — which held that upper-caste men would not rape a lower-caste woman — represents a systemic failure to protect working women. In the absence of domestic legislation, the Court must draw upon international conventions, particularly CEDAW, to enforce fundamental rights to equality, dignity, and a safe workplace.",
            "arguments_respondent": "The state acknowledged the need for protection but argued that this was primarily a matter for legislative action. Workplace conditions vary enormously across the country and a uniform judicial guideline may not be appropriate. The executive was already considering legislation on the matter.",
            "judge_observations": "Gender equality includes protection from sexual harassment and the right to work with dignity. This is a universally recognised basic human right.||In the absence of enacted law to provide for the effective enforcement of the basic human right of gender equality, and guarantee against sexual harassment and abuse at the workplace, we lay down the guidelines and norms for due observance at all workplaces.||Each incident of sexual harassment of woman at the workplace results in violation of the fundamental rights of gender equality and the right to life and liberty.",
            "timeline_events": json.dumps([
                {"date": "1992-09-22", "event": "Bhanwari Devi gang-raped by upper-caste men for opposing child marriage"},
                {"date": "1995-11-15", "event": "Trial court acquits all accused — says upper-caste men wouldn't rape lower-caste woman"},
                {"date": "1997", "event": "Women's groups file PIL in Supreme Court — Vishaka and others v. State of Rajasthan"},
                {"date": "1997-08-13", "event": "Supreme Court issues Vishaka Guidelines — binding till legislation is enacted"},
                {"date": "2013", "event": "Parliament enacts Sexual Harassment of Women at Workplace Act based on Vishaka"},
            ]),
        },
        "Commissioner v. Glenshaw Glass Co.": {
            "bench_size": "9 Justices (unanimous 8-0; Harlan not participating)",
            "advocate_petitioner": "Ellis N. Slack (for the Commissioner of Internal Revenue)",
            "advocate_respondent": "Robert Hessen (for Glenshaw Glass Company)",
            "outcome_detail": "The Court unanimously reversed the Third Circuit and held that punitive damages received in an antitrust suit constitute taxable gross income under Section 22(a) of the Internal Revenue Code. Chief Justice Warren articulated the landmark three-part test: income is any 'undeniable accession to wealth, clearly realized, and over which the taxpayers have complete dominion.' This definition remains the foundational test for determining taxable income in American tax law and is cited in virtually every income tax dispute.",
            "arguments_petitioner": "Congress intended the definition of gross income to be as broad as constitutionally permissible. Punitive damages represent a clear windfall — an accession to wealth that the taxpayer did not have before. The tax code exempts specific items from income; if Congress had intended to exclude punitive damages, it would have said so expressly. The previous narrow definition from Eisner v. Macomber is outdated and unworkable.",
            "arguments_respondent": "Punitive damages are not 'income' in the ordinary sense — they are not gains from capital, labor, or investment. The 16th Amendment authorizes Congress to tax 'incomes,' and punitive damages fall outside any reasonable understanding of that term. Expanding the definition of income to include windfall receipts goes beyond what the framers of the 16th Amendment intended. Tax should apply to periodic returns, not unexpected windfalls.",
            "judge_observations": "Here we have instances of undeniable accessions to wealth, clearly realized, and over which the taxpayers have complete dominion. The mere fact that the payments were extracted from the wrongdoers as punishment for unlawful conduct cannot detract from their character as taxable income to the recipients.||Congress applied no limitations as to the source of taxable receipts, nor restrictive labels as to their nature. And the Court has given a liberal construction to this broad phraseology in recognition of the intention of Congress to tax all gains except those specifically exempted.",
            "timeline_events": json.dumps([
                {"date": "1947", "event": "Glenshaw Glass wins antitrust suit; receives $328,034 including punitive damages"},
                {"date": "1948", "event": "Commissioner of Internal Revenue asserts that punitive damages are taxable income"},
                {"date": "1953", "event": "Tax Court rules in favor of Glenshaw Glass — punitive damages not income"},
                {"date": "1954", "event": "Third Circuit affirms — punitive damages not taxable"},
                {"date": "1955-03-14", "event": "Supreme Court unanimously reverses: punitive damages are taxable gross income"},
            ]),
        },
        "Carpenter v. United States": {
            "bench_size": "9 Justices (5-4 decision)",
            "advocate_petitioner": "Nathan Wessler (ACLU) for Carpenter",
            "advocate_respondent": "Michael R. Dreeben (Deputy Solicitor General) for the United States",
            "outcome_detail": "In a 5-4 decision, Chief Justice Roberts held that accessing historical cell-site location information constitutes a search under the Fourth Amendment, requiring the government to obtain a warrant supported by probable cause. The Court declined to extend the third-party doctrine — which holds that information voluntarily shared with third parties carries no reasonable expectation of privacy — to comprehensive cell-phone location records. The decision marked a pivotal moment in digital privacy law, acknowledging that 'seismic shifts in digital technology' require new Fourth Amendment frameworks.",
            "arguments_petitioner": "Cell-site location information creates a comprehensive, 24/7 record of a person's movements that is far more invasive than anything the Founders could have imagined. People do not voluntarily share their location with cell carriers — the phone automatically connects to towers without the user's conscious choice. Applying the third-party doctrine to CSLI would effectively allow the government to track anyone's movements over months or years without judicial oversight.",
            "arguments_respondent": "Under existing precedent, information shared with a third party carries no reasonable expectation of privacy. Cell phone users know their phones connect to towers — this is inherent in the technology. The Stored Communications Act provides adequate protections, requiring a court order based on 'specific and articulable facts.' Requiring a warrant for business records would impose an undue burden on law enforcement investigations.",
            "judge_observations": "A person does not surrender all Fourth Amendment protection by venturing into the public sphere. Seismic shifts in digital technology made possible the tracking of not only Carpenter's location but also everyone else's, not for a short period but for years.||When the Government tracks the location of a cell phone it achieves near perfect surveillance, as if it had attached an ankle monitor to the phone's user.||We decline to grant the state unrestricted access to a wireless carrier's database of physical location information. — Roberts",
            "timeline_events": json.dumps([
                {"date": "2011-04", "event": "FBI arrests suspects in string of Radio Shack and T-Mobile robberies"},
                {"date": "2011", "event": "Government obtains 127 days of Carpenter's cell-site location data without a warrant"},
                {"date": "2013", "event": "Carpenter convicted based partly on 12,898 location points placing him near robberies"},
                {"date": "2016", "event": "Sixth Circuit upholds conviction — third-party doctrine applies to CSLI"},
                {"date": "2017-11-29", "event": "Supreme Court hears oral arguments"},
                {"date": "2018-06-22", "event": "5-4 decision: CSLI requires a warrant under the Fourth Amendment"},
            ]),
        },
        "Carlill v. Carbolic Smoke Ball Company": {
            "bench_size": "3 Judges (unanimous)",
            "advocate_petitioner": "H.H. Asquith QC and R.S. Wright (for Mrs. Carlill)",
            "advocate_respondent": "H. Finlay QC and T. Terrell (for Carbolic Smoke Ball Company)",
            "outcome_detail": "The Court of Appeal unanimously held that the advertisement was a unilateral offer to the world, which Mrs. Carlill accepted by performing the conditions (using the smoke ball as directed). The deposit of £1,000 in the Alliance Bank showed the company's sincerity and distinguished this from mere puffery. The company was ordered to pay Mrs. Carlill £100 (equivalent to about £14,000 today). The case remains the most taught contract law case in common law jurisdictions worldwide.",
            "arguments_petitioner": "The advertisement constituted a clear, definite offer — not mere advertising puffery. The company deposited £1,000 in a bank specifically to show sincerity. Mrs. Carlill performed all the conditions: she purchased the smoke ball, used it three times daily for two weeks as directed, and still caught influenza. Her performance constituted acceptance of the offer, and communication of acceptance was waived by the terms of the offer. There was valid consideration — she suffered the inconvenience of using the product.",
            "arguments_respondent": "The advertisement was mere puffery — vague boasting that no reasonable person would take literally. It was an offer to the whole world, and you cannot contract with the whole world. Even if it was an offer, Mrs. Carlill never communicated her acceptance to the company. There was no consideration — using a product is not legal detriment. The terms were too vague to constitute a binding contract — for how long was the protection supposed to last?",
            "judge_observations": "It is an offer to become liable to anyone who, before it is retracted, performs the condition. It is not a contract made with all the world. It is an offer made to all the world; and why should not an offer be made to all the world which is to ripen into a contract with anybody who comes forward and performs the condition? — Bowen LJ||The defendants must perform their promise. Was there not a request? The user of the smoke ball had inconvenience. Is that not enough? — Lindley LJ||The deposit of £1,000 in the Alliance Bank is a proof of the defendant's sincerity in their promise. — Bowen LJ",
            "timeline_events": json.dumps([
                {"date": "1891-11", "event": "Carbolic Smoke Ball Co. publishes advertisement promising £100 to anyone who uses ball and catches flu"},
                {"date": "1891-11", "event": "Company deposits £1,000 in Alliance Bank as proof of sincerity"},
                {"date": "1891-11-20", "event": "Mrs. Louisa Carlill buys smoke ball and uses it three times daily as directed"},
                {"date": "1892-01-17", "event": "Mrs. Carlill catches influenza despite using the smoke ball"},
                {"date": "1892", "event": "Mrs. Carlill claims £100; company refuses to pay; she sues"},
                {"date": "1892-07", "event": "Queen's Bench Division rules for Mrs. Carlill"},
                {"date": "1893-02-07", "event": "Court of Appeal unanimously affirms — advertisement was a binding unilateral offer"},
            ]),
        },
        "Chevron U.S.A., Inc. v. Natural Resources Defense Council": {
            "bench_size": "6 Justices (unanimous 6-0; three recused)",
            "advocate_petitioner": "John G. Roberts Jr. (future Chief Justice) for Chevron",
            "advocate_respondent": "David Doniger for NRDC",
            "outcome_detail": "The Court unanimously upheld the EPA's 'bubble concept' interpretation, establishing the most influential framework in administrative law — the two-step Chevron deference test. For nearly 40 years, courts applied this doctrine in thousands of cases, deferring to agency interpretations of ambiguous statutes. In a historic development, the Supreme Court overruled Chevron in Loper Bright Enterprises v. Raimondo (2024), ending four decades of judicial deference to administrative agencies. Notably, the Chevron case was argued by John Roberts, who as Chief Justice later authored the opinion overruling it.",
            "arguments_petitioner": "The EPA's 'bubble concept' — treating an entire plant as a single source — is a reasonable interpretation of an ambiguous statute. The Clean Air Act does not define 'stationary source' precisely. The EPA has technical expertise that courts lack to make these policy choices. When Congress leaves gaps or ambiguities in a statute, it implicitly delegates authority to the administering agency to fill those gaps.",
            "arguments_respondent": "The EPA's 'bubble concept' undermines the Clean Air Act's purpose of improving air quality. Congress intended 'stationary source' to refer to individual pollution-emitting devices, not entire plants. The EPA is essentially rewriting the statute to weaken environmental protections. Courts should independently interpret statutes rather than rubber-stamping agency positions.",
            "judge_observations": "When a court reviews an agency's construction of the statute which it administers, it is confronted with two questions. First, always, is the question whether Congress has directly spoken to the precise question at issue. If the intent of Congress is clear, that is the end of the matter. But if the statute is silent or ambiguous, the question becomes whether the agency's answer is based on a permissible construction of the statute. — Stevens||Judges are not experts in the field, and are not part of either political branch of the Government. In contrast, an agency to which Congress has delegated policy-making responsibilities may, within the limits of that delegation, properly rely upon the incumbent administration's views of wise policy to inform its judgments.",
            "timeline_events": json.dumps([
                {"date": "1977", "event": "Clean Air Act Amendments enacted — require permits for new or modified stationary sources"},
                {"date": "1981", "event": "Reagan EPA adopts 'bubble concept' — treats entire plant as single source"},
                {"date": "1982", "event": "NRDC challenges the bubble concept in the D.C. Circuit"},
                {"date": "1982", "event": "D.C. Circuit strikes down the EPA rule"},
                {"date": "1984-02-29", "event": "Supreme Court hears oral arguments — John Roberts argues for Chevron"},
                {"date": "1984-06-25", "event": "Unanimous decision establishes Chevron deference two-step test"},
                {"date": "2024-06-28", "event": "Loper Bright Enterprises v. Raimondo overrules Chevron after 40 years"},
            ]),
        },
    }

    for case_data in cases:
        name = case_data["case_name"]
        if name in enrichment:
            case_data.update(enrichment[name])
    return cases


def seed_database(db):
    """Populate the database with seed data (full seed when empty, incremental otherwise)."""
    from beforelawyer.models import LegalCase, LegalGlossary, CaseBriefTemplate
    from beforelawyer.indian_cases import INDIAN_LANDMARK_CASES

    existing_count = LegalCase.query.count()

    if existing_count == 0:
        # Full seed — first time
        for case_data in LANDMARK_CASES:
            case = LegalCase(**case_data)
            db.session.add(case)

        enriched = _enrich_indian_cases([dict(c) for c in INDIAN_LANDMARK_CASES])
        for case_data in enriched:
            case = LegalCase(**case_data)
            db.session.add(case)

        for term_data in GLOSSARY_TERMS:
            term = LegalGlossary(**term_data)
            db.session.add(term)

        for tmpl_data in BRIEF_TEMPLATES:
            tmpl = CaseBriefTemplate(**tmpl_data)
            db.session.add(tmpl)

        total_cases = len(LANDMARK_CASES) + len(INDIAN_LANDMARK_CASES)
        db.session.commit()
        print(f"Seeded {total_cases} cases ({len(LANDMARK_CASES)} international + {len(INDIAN_LANDMARK_CASES)} Indian), {len(GLOSSARY_TERMS)} glossary terms, {len(BRIEF_TEMPLATES)} templates.")
    else:
        # Incremental seed — add any new cases not already in DB
        existing_names = {c.case_name for c in LegalCase.query.with_entities(LegalCase.case_name).all()}
        new_count = 0

        # Check international cases
        for case_data in LANDMARK_CASES:
            if case_data["case_name"] not in existing_names:
                case = LegalCase(**case_data)
                db.session.add(case)
                new_count += 1

        # Check Indian cases
        enriched = _enrich_indian_cases([dict(c) for c in INDIAN_LANDMARK_CASES])
        for case_data in enriched:
            if case_data["case_name"] not in existing_names:
                case = LegalCase(**case_data)
                db.session.add(case)
                new_count += 1

        if new_count > 0:
            db.session.commit()
            print(f"Added {new_count} new cases (total now: {existing_count + new_count}).")
        else:
            print(f"Database up to date ({existing_count} cases).")
