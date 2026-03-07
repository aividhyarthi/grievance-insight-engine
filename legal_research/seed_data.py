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
    {"term": "Stare Decisis", "definition": "The legal principle that courts should follow precedents set by previous decisions. Latin for 'to stand by things decided.' Courts are bound by prior rulings of higher courts in the same jurisdiction.", "category": "General", "example_usage": "The court applied stare decisis and followed the ruling established in the earlier Supreme Court case.", "related_terms": "Precedent, Ratio Decidendi, Obiter Dictum"},
    {"term": "Habeas Corpus", "definition": "A legal action through which a person can seek relief from unlawful detention. Latin for 'you shall have the body.' It requires the detaining authority to justify the detention before a court.", "category": "Criminal", "example_usage": "The prisoner filed a writ of habeas corpus challenging the legality of his continued imprisonment.", "related_terms": "Writ, Due Process, Fundamental Rights"},
    {"term": "Ratio Decidendi", "definition": "The legal reasoning or principle upon which a court's decision is based. It is the binding part of a judgment that forms precedent for future cases.", "category": "General", "example_usage": "The ratio decidendi of the case established that manufacturers owe a duty of care to end consumers.", "related_terms": "Stare Decisis, Obiter Dictum, Precedent"},
    {"term": "Obiter Dictum", "definition": "Remarks or observations made by a judge that are not essential to the decision and do not form binding precedent. Latin for 'said in passing.' While not binding, they can be persuasive.", "category": "General", "example_usage": "The judge's comments on the broader implications of the law were considered obiter dictum.", "related_terms": "Ratio Decidendi, Precedent, Judicial Opinion"},
    {"term": "Prima Facie", "definition": "Evidence that is sufficient to establish a fact or raise a presumption unless disproved or rebutted. Latin for 'at first sight' or 'on its face.'", "category": "Evidence", "example_usage": "The plaintiff established a prima facie case of discrimination by showing disparate treatment.", "related_terms": "Burden of Proof, Presumption, Evidence"},
    {"term": "Amicus Curiae", "definition": "A person or organization that is not a party to the case but offers information or expertise to assist the court. Latin for 'friend of the court.'", "category": "Procedure", "example_usage": "The civil liberties organization filed an amicus curiae brief arguing the law was unconstitutional.", "related_terms": "Brief, Intervenor, Party"},
    {"term": "Certiorari", "definition": "A writ by which a higher court reviews a decision of a lower court. Most commonly used in the context of the Supreme Court deciding to hear an appeal. Latin for 'to be made certain.'", "category": "Procedure", "example_usage": "The Supreme Court granted certiorari to review the circuit court's controversial ruling.", "related_terms": "Writ, Appeal, Judicial Review"},
    {"term": "Tort", "definition": "A wrongful act (other than a breach of contract) that results in harm or injury to another person, giving rise to civil liability. Types include negligence, intentional torts, and strict liability.", "category": "Civil", "example_usage": "The plaintiff sued in tort for damages caused by the defendant's negligent driving.", "related_terms": "Negligence, Duty of Care, Damages, Liability"},
    {"term": "Mens Rea", "definition": "The mental element or guilty mind required to establish criminal liability. It refers to the defendant's intention, knowledge, recklessness, or negligence when committing an offense.", "category": "Criminal", "example_usage": "The prosecution must prove both actus reus and mens rea to secure a conviction for murder.", "related_terms": "Actus Reus, Intent, Criminal Liability"},
    {"term": "Actus Reus", "definition": "The physical act or unlawful omission that constitutes the external element of a crime. Combined with mens rea, it establishes criminal liability.", "category": "Criminal", "example_usage": "The actus reus of theft is the taking of another's property without their consent.", "related_terms": "Mens Rea, Crime, Omission"},
    {"term": "Res Judicata", "definition": "A matter that has been adjudicated by a competent court and may not be pursued further by the same parties. Prevents the same dispute from being relitigated.", "category": "Procedure", "example_usage": "The defendant raised the doctrine of res judicata, arguing the issue had already been decided in a prior case.", "related_terms": "Estoppel, Double Jeopardy, Final Judgment"},
    {"term": "Ultra Vires", "definition": "Actions taken beyond the legal power or authority of a person, corporation, or government body. Latin for 'beyond the powers.'", "category": "Corporate", "example_usage": "The board's decision to invest in unrelated businesses was challenged as ultra vires under the company's articles.", "related_terms": "Intra Vires, Corporate Capacity, Articles of Association"},
    {"term": "Locus Standi", "definition": "The right or capacity to bring an action or appear in a court. A party must demonstrate sufficient connection to and harm from the law or action challenged.", "category": "Procedure", "example_usage": "The environmental group was granted locus standi to challenge the factory's pollution permits.", "related_terms": "Standing, Justiciability, Party"},
    {"term": "Injunction", "definition": "A court order requiring a party to do or refrain from doing a specific act. Can be temporary (interim) or permanent. A key equitable remedy.", "category": "Remedy", "example_usage": "The court granted an injunction preventing the company from demolishing the historic building.", "related_terms": "Restraining Order, Equitable Relief, Stay"},
    {"term": "Precedent", "definition": "A court decision that serves as an authority for deciding subsequent cases involving identical or similar facts or legal issues. Binding precedent must be followed; persuasive precedent may be considered.", "category": "General", "example_usage": "The 1954 decision set a binding precedent that segregation in public schools is unconstitutional.", "related_terms": "Stare Decisis, Ratio Decidendi, Case Law"},
    {"term": "Due Process", "definition": "The legal requirement that the government must respect all legal rights owed to a person. Ensures fair treatment through the normal judicial system, including notice and opportunity to be heard.", "category": "Constitutional", "example_usage": "The defendant argued that the expedited trial violated his due process rights under the 14th Amendment.", "related_terms": "Fair Trial, Natural Justice, Fundamental Rights"},
    {"term": "Fiduciary Duty", "definition": "A legal obligation of one party (the fiduciary) to act in the best interest of another party. Applies to trustees, directors, agents, and other relationships of trust.", "category": "Corporate", "example_usage": "The company director breached his fiduciary duty by awarding contracts to his own family members.", "related_terms": "Trust, Good Faith, Corporate Governance, Duty of Care"},
    {"term": "Force Majeure", "definition": "Unforeseeable circumstances that prevent someone from fulfilling a contract. Includes natural disasters, wars, pandemics, and other events beyond reasonable control. French for 'superior force.'", "category": "Contract", "example_usage": "The supplier invoked the force majeure clause after the earthquake destroyed their manufacturing plant.", "related_terms": "Frustration, Impossibility, Act of God, Contract Discharge"},
    {"term": "Subpoena", "definition": "A legal document ordering a person to attend court as a witness or to produce documents. Failure to comply can result in contempt of court charges.", "category": "Procedure", "example_usage": "The witness was served with a subpoena duces tecum requiring her to produce all financial records.", "related_terms": "Summons, Contempt, Discovery, Witness"},
    {"term": "Voir Dire", "definition": "The process of questioning prospective jurors to determine their suitability to serve on a jury. Also refers to a preliminary examination of a witness's competence. French for 'to speak the truth.'", "category": "Procedure", "example_usage": "During voir dire, the defense attorney excused jurors who expressed bias toward the defendant.", "related_terms": "Jury Selection, Challenge, Peremptory Challenge, Bias"},
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


def seed_database(db):
    """Populate the database with seed data."""
    from legal_research.models import LegalCase, LegalGlossary, CaseBriefTemplate

    # Seed cases
    for case_data in LANDMARK_CASES:
        case = LegalCase(**case_data)
        db.session.add(case)

    # Seed glossary
    for term_data in GLOSSARY_TERMS:
        term = LegalGlossary(**term_data)
        db.session.add(term)

    # Seed templates
    for tmpl_data in BRIEF_TEMPLATES:
        tmpl = CaseBriefTemplate(**tmpl_data)
        db.session.add(tmpl)

    db.session.commit()
    print(f"Seeded {len(LANDMARK_CASES)} cases, {len(GLOSSARY_TERMS)} glossary terms, {len(BRIEF_TEMPLATES)} templates.")
